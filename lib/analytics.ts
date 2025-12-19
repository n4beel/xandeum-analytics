import type { PNode, NetworkMetrics } from './types';

/**
 * Calculate network health score (0-100)
 * Based on: uptime, version distribution, online nodes
 */
export function calculateNetworkHealth(pods: PNode[]): number {
    if (pods.length === 0) return 0;

    const onlineNodes = pods.filter(p => p.isOnline).length;
    const onlineRatio = onlineNodes / pods.length;

    // Average uptime (normalized to 0-1)
    const avgUptime = pods.reduce((sum, p) => sum + p.uptime, 0) / pods.length;
    const maxUptime = Math.max(...pods.map(p => p.uptime), 1);
    const uptimeScore = avgUptime / maxUptime;

    // Version distribution score (higher is better when nodes are on latest versions)
    const versions = pods.map(p => p.version);
    const versionCounts = versions.reduce((acc, v) => {
        acc[v] = (acc[v] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Latest version should have highest adoption
    const sortedVersions = Object.entries(versionCounts)
        .sort(([a], [b]) => b.localeCompare(a));
    const latestVersionRatio = sortedVersions[0]?.[1] / pods.length || 0;

    // Weighted score
    const healthScore = (
        onlineRatio * 0.4 +
        uptimeScore * 0.4 +
        latestVersionRatio * 0.2
    ) * 100;

    return Math.round(healthScore);
}

/**
 * Calculate performance score for a single node (0-100)
 */
export function calculateNodePerformanceScore(pod: PNode): number {
    let score = 0;

    // Online status (30 points)
    if (pod.isOnline) score += 30;

    // Uptime (30 points) - normalize to 7 days
    const sevenDays = 7 * 24 * 60 * 60;
    const uptimeScore = Math.min(pod.uptime / sevenDays, 1) * 30;
    score += uptimeScore;

    // Storage commitment (20 points) - normalize to 1TB
    const oneTB = 1000000000000;
    const storageScore = Math.min(pod.storage_committed / oneTB, 1) * 20;
    score += storageScore;

    // Public RPC (10 points)
    if (pod.is_public) score += 10;

    // Credits earned (10 points) - normalize to 50k credits
    if (pod.credits) {
        const creditsScore = Math.min(pod.credits / 50000, 1) * 10;
        score += creditsScore;
    }

    return Math.round(score);
}

/**
 * Calculate comprehensive network metrics
 */
export function calculateNetworkMetrics(pods: PNode[]): NetworkMetrics {
    const onlineNodes = pods.filter(p => p.isOnline);
    const offlineNodes = pods.filter(p => !p.isOnline);
    const publicRpcNodes = pods.filter(p => p.is_public);
    const privateRpcNodes = pods.filter(p => !p.is_public);

    const totalStorageCommitted = pods.reduce((sum, p) => sum + p.storage_committed, 0);
    const totalStorageUsed = pods.reduce((sum, p) => sum + p.storage_used, 0);
    const averageUptime = pods.length > 0
        ? pods.reduce((sum, p) => sum + p.uptime, 0) / pods.length
        : 0;

    // Version distribution
    const versionDistribution = pods.reduce((acc, p) => {
        acc[p.version] = (acc[p.version] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Geographic distribution
    const geographicDistribution = pods.reduce((acc, p) => {
        if (p.geolocation?.country) {
            acc[p.geolocation.country] = (acc[p.geolocation.country] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const networkHealthScore = calculateNetworkHealth(pods);

    return {
        totalNodes: pods.length,
        onlineNodes: onlineNodes.length,
        offlineNodes: offlineNodes.length,
        publicRpcNodes: publicRpcNodes.length,
        privateRpcNodes: privateRpcNodes.length,
        totalStorageCommitted,
        totalStorageUsed,
        averageUptime,
        networkHealthScore,
        versionDistribution,
        geographicDistribution,
    };
}

/**
 * Detect anomalies in node data
 */
export function detectAnomalies(pods: PNode[]): PNode[] {
    if (pods.length === 0) return [];

    const avgUptime = pods.reduce((sum, p) => sum + p.uptime, 0) / pods.length;
    const avgStorage = pods.reduce((sum, p) => sum + p.storage_committed, 0) / pods.length;

    // Find nodes with significantly low uptime or storage
    return pods.filter(pod => {
        const lowUptime = pod.uptime < avgUptime * 0.3;
        const lowStorage = pod.storage_committed < avgStorage * 0.1;
        const highStorageUsage = pod.storage_usage_percent > 90;

        return lowUptime || lowStorage || highStorageUsage;
    });
}

/**
 * Get top performers by various metrics
 */
export function getTopPerformers(pods: PNode[], metric: 'uptime' | 'storage' | 'credits', limit: number = 10): PNode[] {
    const sorted = [...pods].sort((a, b) => {
        switch (metric) {
            case 'uptime':
                return b.uptime - a.uptime;
            case 'storage':
                return b.storage_committed - a.storage_committed;
            case 'credits':
                return (b.credits || 0) - (a.credits || 0);
            default:
                return 0;
        }
    });

    return sorted.slice(0, limit);
}

/**
 * Format bytes to human-readable format
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Format uptime to human-readable format
 */
export function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
        return `${days}d ${hours}h`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

/**
 * Format number with K, M, B suffixes
 */
export function formatNumber(num: number): string {
    if (num >= 1000000000) {
        return `${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
}
