'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { PNode } from '@/lib/types';

interface VersionChartProps {
    pods: PNode[];
}

const COLORS = [
    '#6366f1', // Indigo
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#14b8a6', // Teal
];

export default function VersionChart({ pods }: VersionChartProps) {
    const chartData = useMemo(() => {
        const versionMap = new Map<string, number>();

        pods.forEach((pod) => {
            versionMap.set(pod.version, (versionMap.get(pod.version) || 0) + 1);
        });

        return Array.from(versionMap.entries())
            .map(([version, count]) => ({
                name: version,
                value: count,
                percentage: ((count / pods.length) * 100).toFixed(1),
            }))
            .sort((a, b) => b.value - a.value);
    }, [pods]);

    if (chartData.length === 0) {
        return null;
    }

    return (
        <div className="glass-card p-6 animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-6">Version Distribution</h2>

            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => `${entry.name} (${entry.percentage}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(30, 30, 46, 0.9)',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '8px',
                            color: '#fff',
                        }}
                    />
                    <Legend
                        wrapperStyle={{
                            paddingTop: '20px',
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>

            <div className="mt-6 space-y-2">
                {chartData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-slate-300">{item.name}</span>
                        </div>
                        <span className="text-slate-400">
                            {item.value} nodes ({item.percentage}%)
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
