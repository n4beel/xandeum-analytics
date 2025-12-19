import { NextResponse } from 'next/server';
import { aggregatePodsData } from '@/lib/api-aggregator';
import { calculateNetworkMetrics } from '@/lib/analytics';

export async function GET() {
    try {
        const pods = await aggregatePodsData();
        const metrics = calculateNetworkMetrics(pods);

        return NextResponse.json({
            success: true,
            data: metrics,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error calculating metrics:', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to calculate metrics',
            },
            { status: 500 }
        );
    }
}
