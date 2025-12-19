export interface PNode {
  address: string;
  version: string;
  last_seen: string;
  last_seen_timestamp: number;
  pubkey: string;
  rpc_port: number;
  is_public: boolean;
  uptime: number;
  storage_committed: number;
  storage_used: number;
  storage_usage_percent: number;

  // Enriched data
  geolocation?: {
    city: string;
    country: string;
    countryCode: string;
    lat: number;
    lon: number;
    isp?: string;
  };
  credits?: number;

  // Calculated fields
  isOnline?: boolean;
  performanceScore?: number;
}

export interface PodCredits {
  pod_id: string;
  credits: number;
}

export interface GetPodsResponse {
  pods: PNode[];
  total_count: number;
}

export interface GetCreditsResponse {
  pods_credits: PodCredits[];
}

export interface NodeStats {
  cpu_percent: number;
  ram_used: number;
  ram_total: number;
  uptime: number;
  packets_received: number;
  packets_sent: number;
  active_streams: number;
  total_bytes: number;
  total_pages: number;
  file_size: number;
}

export interface GetStatsResponse {
  stats: NodeStats;
}

export interface RPCRequest {
  jsonrpc: string;
  method: string;
  id: number;
  params?: any[];
}

export interface RPCResponse<T> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
  };
}

export interface NetworkMetrics {
  totalNodes: number;
  onlineNodes: number;
  offlineNodes: number;
  publicRpcNodes: number;
  privateRpcNodes: number;
  totalStorageCommitted: number;
  totalStorageUsed: number;
  averageUptime: number;
  networkHealthScore: number;
  versionDistribution: Record<string, number>;
  geographicDistribution: Record<string, number>;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: {
    version?: string[];
    isPublic?: boolean;
    country?: string[];
    minUptime?: number;
    minCredits?: number;
  };
}

