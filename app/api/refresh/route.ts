import { NextResponse } from 'next/server';
import { refreshPodsData } from '@/lib/api-aggregator';

export async function POST() {
    try {
        const pods = await refreshPodsData();

        return NextResponse.json({
            success: true,
            data: {
                pods,
                total_count: pods.length,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error refreshing pods:', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to refresh pNodes',
            },
            { status: 500 }
        );
    }
}
