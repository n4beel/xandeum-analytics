'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import NetworkOverview from '@/components/NetworkOverview';
import PNodeTable from '@/components/PNodeTable';
import VersionChart from '@/components/VersionChart';
import type { PNode } from '@/lib/types';

export default function Home() {
  const [pods, setPods] = useState<PNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPods = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/pods');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch pNodes');
      }

      setPods(result.data.pods || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching pods:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPods();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPods, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="relative z-10 border-b border-slate-800 bg-slate-900/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                Xandeum pNode Analytics
              </h1>
              <p className="text-slate-400 mt-1">
                Real-time network monitoring and statistics
              </p>
            </div>
            <button
              onClick={fetchPods}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          {lastUpdated && (
            <p className="text-sm text-slate-500 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && pods.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Loading pNode data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="glass-card p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Error Loading Data</h2>
            <p className="text-slate-400 mb-4">{error}</p>
            <button
              onClick={fetchPods}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Network Overview */}
            <NetworkOverview pods={pods} />

            {/* Charts and Table Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Version Chart */}
              <div className="lg:col-span-1">
                <VersionChart pods={pods} />
              </div>

              {/* pNode Table */}
              <div className="lg:col-span-2">
                <PNodeTable pods={pods} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-slate-500 text-sm">
            Built for the Xandeum pNode Analytics Bounty
          </p>
        </div>
      </footer>
    </div>
  );
}
