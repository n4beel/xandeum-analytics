'use client';

import { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'light' | 'heavy';
    hover?: boolean;
    gradient?: boolean;
}

export default function GlassCard({
    children,
    className = '',
    variant = 'default',
    hover = true,
    gradient = false,
}: GlassCardProps) {
    const variantClasses = {
        default: 'glass-card',
        light: 'glass-card-light',
        heavy: 'glass-card-heavy',
    };

    const baseClass = gradient ? 'gradient-border' : variantClasses[variant];
    const hoverClass = hover ? '' : '[&:hover]:transform-none [&:hover]:shadow-md';

    return (
        <div className={`${baseClass} ${hoverClass} ${className}`}>
            {children}
        </div>
    );
}
