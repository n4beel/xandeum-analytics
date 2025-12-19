'use client';

import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { PNode } from '@/lib/types';

interface PNodeTableProps {
    pods: PNode[];
    onNodeClick?: (pod: PNode) => void;
}

type SortField = 'address' | 'version' | 'last_seen';
type SortDirection = 'asc' | 'desc';

export default function PNodeTable({ pods, onNodeClick }: PNodeTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('last_seen');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const isNodeActive = (timestamp: number) => {
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        return timestamp * 1000 > fiveMinutesAgo;
    };

    const filteredAndSortedPods = useMemo(() => {
        let result = [...pods];

        // Filter by search term
        if (searchTerm) {
            result = result.filter((pod) =>
                pod.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pod.version.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort
        result.sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case 'address':
                    comparison = a.address.localeCompare(b.address);
                    break;
                case 'version':
                    comparison = a.version.localeCompare(b.version);
                    break;
                case 'last_seen':
                    comparison = a.last_seen_timestamp - b.last_seen_timestamp;
                    break;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [pods, searchTerm, sortField, sortDirection]);

    const paginatedPods = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedPods.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedPods, currentPage]);

    const totalPages = Math.ceil(filteredAndSortedPods.length / itemsPerPage);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    return (
        <div className="glass-card p-6 animate-fade-in">
            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by address or version..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-700">
                            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-300">
                                Status
                            </th>
                            <th
                                className="text-left py-4 px-4 text-sm font-semibold text-slate-300 cursor-pointer hover:text-white transition-colors"
                                onClick={() => handleSort('address')}
                            >
                                <div className="flex items-center gap-2">
                                    Address
                                    <ArrowUpDown className="w-4 h-4" />
                                </div>
                            </th>
                            <th
                                className="text-left py-4 px-4 text-sm font-semibold text-slate-300 cursor-pointer hover:text-white transition-colors"
                                onClick={() => handleSort('version')}
                            >
                                <div className="flex items-center gap-2">
                                    Version
                                    <ArrowUpDown className="w-4 h-4" />
                                </div>
                            </th>
                            <th
                                className="text-left py-4 px-4 text-sm font-semibold text-slate-300 cursor-pointer hover:text-white transition-colors"
                                onClick={() => handleSort('last_seen')}
                            >
                                <div className="flex items-center gap-2">
                                    Last Seen
                                    <ArrowUpDown className="w-4 h-4" />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedPods.map((pod, index) => {
                            const isActive = isNodeActive(pod.last_seen_timestamp);
                            return (
                                <tr
                                    key={`${pod.address}-${index}`}
                                    className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors cursor-pointer"
                                    onClick={() => onNodeClick?.(pod)}
                                >
                                    <td className="py-4 px-4">
                                        {isActive ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-500" />
                                        )}
                                    </td>
                                    <td className="py-4 px-4 font-mono text-sm text-slate-200">
                                        {pod.address}
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm font-medium">
                                            {pod.version}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-slate-300 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            {formatDistanceToNow(new Date(pod.last_seen_timestamp * 1000), {
                                                addSuffix: true,
                                            })}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                        {Math.min(currentPage * itemsPerPage, filteredAndSortedPods.length)} of{' '}
                        {filteredAndSortedPods.length} nodes
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {filteredAndSortedPods.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-slate-400">No pNodes found matching your search.</p>
                </div>
            )}
        </div>
    );
}
