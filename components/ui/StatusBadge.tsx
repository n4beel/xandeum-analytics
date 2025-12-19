'use client';

import { ReactNode } from 'react';

interface StatusBadgeProps {
    status: 'online' | 'offline' | 'warning';
    label?: string;
    showIndicator?: boolean;
    className?: string;
}

export default function StatusBadge({
    status,
    label,
    showIndicator = true,
    className = '',
}: StatusBadgeProps) {
    const badgeClasses = {
        online: 'badge-success',
        offline: 'badge-error',
        warning: 'badge-warning',
    };

    const indicatorClasses = {
        online: 'status-online',
        offline: 'status-offline',
        warning: 'status-warning',
    };

    const labels = {
        online: 'Online',
        offline: 'Offline',
        warning: 'Warning',
    };

    return (
        <span className={`badge ${badgeClasses[status]} ${className}`}>
            {showIndicator && (
                <span className={`status-indicator ${indicatorClasses[status]}`} />
            )}
            {label || labels[status]}
        </span>
    );
}
