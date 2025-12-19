import axios from 'axios';
import { cache } from './cache';
import type { PNode, PodCredits, GetCreditsResponse, RPCResponse } from './types';

/**
 * Known pNode RPC endpoints to poll
 */
const KNOWN_PNODE_IPS = [
    '173.212.203.145',
    '173.212.220.65',
    '161.97.97.41',
    '192.190.136.36',
    '192.190.136.37',
    '192.190.136.38',
    '192.190.136.28',
    '192.190.136.29',
    '207.244.255.1',
];

const RPC_PORT = 6000;
const RPC_TIMEOUT = 5000; // 5 seconds
const CACHE_KEY_PODS = 'aggregated_pods';
const CACHE_KEY_CREDITS = 'pod_credits';
const CACHE_TTL = 15000; // 15 seconds

interface GetPodsWithStatsResult {
    pods: Array<{
        address: string;
        version: string;
        last_seen_timestamp: number;
        pubkey: string;
        rpc_port: number;
        is_public: boolean;
        uptime: number;
        storage_committed: number;
        storage_used: number;
        storage_usage_percent: number;
    }>;
}

/**
 * Fetch pods from a single pNode RPC endpoint
 */
async function fetchPodsFromNode(ip: string): Promise<PNode[]> {
    try {
        const response = await axios.post<RPCResponse<GetPodsWithStatsResult>>(
            `http://${ip}:${RPC_PORT}/rpc`,
            {
                jsonrpc: '2.0',
                method: 'get-pods-with-stats',
                id: 1,
            },
            {
                timeout: RPC_TIMEOUT,
                headers: { 'Content-Type': 'application/json' },
            }
        );

        if (response.data.error) {
            console.error(`RPC error from ${ip}:`, response.data.error);
            return [];
        }

        if (!response.data.result?.pods) {
            return [];
        }

        // Transform to our PNode format
        return response.data.result.pods.map(pod => ({
            address: pod.address,
            version: pod.version,
            last_seen: new Date(pod.last_seen_timestamp * 1000).toISOString(),
            last_seen_timestamp: pod.last_seen_timestamp,
            pubkey: pod.pubkey,
            rpc_port: pod.rpc_port,
            is_public: pod.is_public,
            uptime: pod.uptime,
            storage_committed: pod.storage_committed,
            storage_used: pod.storage_used,
            storage_usage_percent: pod.storage_usage_percent,
            isOnline: true, // If we got data, node is online
        }));
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Failed to fetch from ${ip}:`, error.message);
        }
        return [];
    }
}

/**
 * Fetch credits data from the pods-credits API
 */
async function fetchCreditsData(): Promise<Map<string, number>> {
    const cached = cache.get<Map<string, number>>(CACHE_KEY_CREDITS);
    if (cached) {
        return cached;
    }

    try {
        const response = await axios.get<GetCreditsResponse>(
            'https://podcredits.xandeum.network/api/pods-credits',
            { timeout: 10000 }
        );

        const creditsMap = new Map<string, number>();
        response.data.pods_credits.forEach((pod: PodCredits) => {
            creditsMap.set(pod.pod_id, pod.credits);
        });

        cache.set(CACHE_KEY_CREDITS, creditsMap, 60000); // Cache for 1 minute
        return creditsMap;
    } catch (error) {
        console.error('Failed to fetch credits data:', error);
        return new Map();
    }
}

/**
 * Fetch geolocation data for an IP address
 */
async function fetchGeolocation(ip: string): Promise<PNode['geolocation'] | undefined> {
    try {
        // Extract IP from address (format: "ip:port")
        const ipOnly = ip.split(':')[0];

        const response = await axios.get(
            `http://ip-api.com/json/${ipOnly}?fields=status,country,countryCode,city,lat,lon,isp`,
            { timeout: 3000 }
        );

        if (response.data.status === 'success') {
            return {
                city: response.data.city,
                country: response.data.country,
                countryCode: response.data.countryCode,
                lat: response.data.lat,
                lon: response.data.lon,
                isp: response.data.isp,
            };
        }
    } catch (error) {
        console.error(`Failed to fetch geolocation for ${ip}:`, error);
    }
    return undefined;
}

/**
 * Aggregate pods from all known pNode endpoints
 */
export async function aggregatePodsData(): Promise<PNode[]> {
    // Check cache first
    const cached = cache.get<PNode[]>(CACHE_KEY_PODS);
    if (cached) {
        return cached;
    }

    console.log('Aggregating pods data from multiple endpoints...');

    // Fetch from all nodes in parallel
    const podArrays = await Promise.all(
        KNOWN_PNODE_IPS.map(ip => fetchPodsFromNode(ip))
    );

    // Flatten and deduplicate by pubkey
    const podsMap = new Map<string, PNode>();
    for (const pods of podArrays) {
        for (const pod of pods) {
            // Keep the most recent data for each pubkey
            const existing = podsMap.get(pod.pubkey);
            if (!existing || pod.last_seen_timestamp > existing.last_seen_timestamp) {
                podsMap.set(pod.pubkey, pod);
            }
        }
    }

    let pods = Array.from(podsMap.values());

    // Fetch credits data
    const creditsMap = await fetchCreditsData();

    // Enrich with credits
    pods = pods.map(pod => ({
        ...pod,
        credits: creditsMap.get(pod.pubkey) || 0,
    }));

    // Enrich with geolocation (in batches to avoid rate limiting)
    // ip-api.com allows 45 requests per minute for free
    const batchSize = 40;
    for (let i = 0; i < pods.length; i += batchSize) {
        const batch = pods.slice(i, i + batchSize);
        const geoPromises = batch.map(async (pod) => {
            const geo = await fetchGeolocation(pod.address);
            return { pubkey: pod.pubkey, geo };
        });

        const geoResults = await Promise.all(geoPromises);
        geoResults.forEach(({ pubkey, geo }) => {
            const pod = pods.find(p => p.pubkey === pubkey);
            if (pod && geo) {
                pod.geolocation = geo;
            }
        });

        // Wait a bit between batches to respect rate limits
        if (i + batchSize < pods.length) {
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    }

    // Cache the result
    cache.set(CACHE_KEY_PODS, pods, CACHE_TTL);

    console.log(`Aggregated ${pods.length} unique pods`);
    return pods;
}

/**
 * Force refresh the cache
 */
export async function refreshPodsData(): Promise<PNode[]> {
    cache.delete(CACHE_KEY_PODS);
    return aggregatePodsData();
}
