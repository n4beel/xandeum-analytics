'use client';

import { useMemo } from 'react';
import { Activity, Database, Globe, Server, TrendingUp } from 'lucide-react';
import type { PNode } from '@/lib/types';
import { calculateNetworkMetrics, formatBytes } from '@/lib/analytics';
import AnimatedNumber from './ui/AnimatedNumber';
import GlassCard from './ui/GlassCard';

interface NetworkOverviewProps {
    pods: PNode[];
}

export default function NetworkOverview({ pods }: NetworkOverviewProps) {
    const metrics = useMemo(() => calculateNetworkMetrics(pods), [pods]);

    const MetricCard = ({
        icon: Icon,
        label,
        value,
        subtitle,
        trend,
        color = 'indigo'
    }: {
        icon: any;
        label: string;
        value: number | string;
        subtitle?: string;
        trend?: number;
        color?: string;
    }) => {
        const colorClasses = {
            indigo: 'text-indigo-400',
            emerald: 'text-emerald-400',
            cyan: 'text-cyan-400',
            purple: 'text-purple-400',
            pink: 'text-pink-400',
        };

        return (
            <GlassCard className="p-6 animate-fade-in">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Icon className={`w-5 h-5 ${colorClasses[color as keyof typeof colorClasses]}`} />
                            <span className="text-sm text-slate-400">{label}</span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">
                            {typeof value === 'number' ? (
                                <AnimatedNumber value={value} />
                            ) : (
                                value
                            )}
                        </div>
                        {subtitle && (
                            <p className="text-sm text-slate-500">{subtitle}</p>
                        )}
                        {trend !== undefined && (
                            <div className={`flex items-center gap-1 mt-2 text-sm ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
                                <span>{Math.abs(trend)}%</span>
                            </div>
                        )}
                    </div>
                </div>
            </GlassCard>
        );
    };

    const healthColor = metrics.networkHealthScore >= 80 ? 'emerald' :
        metrics.networkHealthScore >= 60 ? 'cyan' : 'pink';

    return (
        <div className="space-y-6">
            {/* Network Health Score - Featured */}
            <GlassCard variant="heavy" className="p-8 gradient-border">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold gradient-text mb-2">Network Health</h2>
                        <p className="text-slate-400">Overall network performance and reliability</p>
                    </div>
                    <div className="text-right">
                        <div className="text-6xl font-bold gradient-text">
                            <AnimatedNumber value={metrics.networkHealthScore} />
                            <span className="text-3xl">/100</span>
                        </div>
                        <div className="flex items-center justify-end gap-2 mt-2">
                            <div className={`status-indicator status-${healthColor === 'emerald' ? 'online' : healthColor === 'cyan' ? 'warning' : 'offline'}`} />
                            <span className="text-sm text-slate-400">
                                {metrics.networkHealthScore >= 80 ? 'Excellent' :
                                    metrics.networkHealthScore >= 60 ? 'Good' : 'Needs Attention'}
                            </span>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    icon={Server}
                    label="Total pNodes"
                    value={metrics.totalNodes}
                    subtitle={`${metrics.onlineNodes} online, ${metrics.offlineNodes} offline`}
                    color="indigo"
                />

                <MetricCard
                    icon={Globe}
                    label="Public RPC Nodes"
                    value={metrics.publicRpcNodes}
                    subtitle={`${metrics.privateRpcNodes} private`}
                    color="cyan"
                />

                <MetricCard
                    icon={Database}
                    label="Storage Committed"
                    value={formatBytes(metrics.totalStorageCommitted)}
                    subtitle={`${formatBytes(metrics.totalStorageUsed)} used`}
                    color="purple"
                />

                <MetricCard
                    icon={Activity}
                    label="Avg Uptime"
                    value={`${Math.floor(metrics.averageUptime / 86400)}d`}
                    subtitle={`${Math.floor((metrics.averageUptime % 86400) / 3600)}h ${Math.floor((metrics.averageUptime % 3600) / 60)}m`}
                    color="emerald"
                />
            </div>

            {/* Geographic Distribution */}
            {Object.keys(metrics.geographicDistribution).length > 0 && (
                <GlassCard className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-lg font-semibold text-white">Geographic Distribution</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(metrics.geographicDistribution)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 10)
                            .map(([country, count]) => (
                                <span key={country} className="badge">
                                    {country}: {count}
                                </span>
                            ))}
                    </div>
                </GlassCard>
            )}
        </div>
    );
}
