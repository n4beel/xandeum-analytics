import axios from 'axios';
import type { RPCRequest, RPCResponse, GetPodsResponse, GetStatsResponse } from './types';

// Seed pNode addresses - these are example endpoints
// In production, you'd want to configure these via environment variables
const SEED_NODES = [
    'http://seed1.xandeum.network:6000/rpc',
    'http://seed2.xandeum.network:6000/rpc',
    // Add more seed nodes as fallbacks
];

class PRPCClient {
    private currentSeedIndex = 0;

    private async makeRPCCall<T>(
        method: string,
        params: any[] = [],
        retries = 3
    ): Promise<T> {
        const request: RPCRequest = {
            jsonrpc: '2.0',
            method,
            id: Date.now(),
            params: params.length > 0 ? params : undefined,
        };

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const seedUrl = SEED_NODES[this.currentSeedIndex % SEED_NODES.length];

                const response = await axios.post<RPCResponse<T>>(seedUrl, request, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 10000, // 10 second timeout
                });

                if (response.data.error) {
                    throw new Error(
                        `RPC Error: ${response.data.error.message} (Code: ${response.data.error.code})`
                    );
                }

                if (!response.data.result) {
                    throw new Error('No result in RPC response');
                }

                return response.data.result;
            } catch (error) {
                console.error(`RPC call failed (attempt ${attempt + 1}/${retries}):`, error);

                // Try next seed node on failure
                this.currentSeedIndex++;

                if (attempt === retries - 1) {
                    throw error;
                }

                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }

        throw new Error('All RPC attempts failed');
    }

    async getPods(): Promise<GetPodsResponse> {
        return this.makeRPCCall<GetPodsResponse>('get-pods');
    }

    async getStats(nodeAddress: string): Promise<GetStatsResponse> {
        return this.makeRPCCall<GetStatsResponse>('get-stats', [nodeAddress]);
    }
}

export const prpcClient = new PRPCClient();
