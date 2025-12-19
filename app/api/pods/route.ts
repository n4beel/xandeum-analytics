import { NextResponse } from 'next/server';
import { aggregatePodsData } from '@/lib/api-aggregator';

export async function GET() {
    try {
        const pods = await aggregatePodsData();

        return NextResponse.json({
            success: true,
            data: {
                pods,
                total_count: pods.length,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching pods:', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch pNodes',
            },
            { status: 500 }
        );
    }
}
