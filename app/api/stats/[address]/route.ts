import { NextResponse } from 'next/server';
import { prpcClient } from '@/lib/prpc-client';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ address: string }> }
) {
    try {
        const { address } = await params;

        if (!address) {
            return NextResponse.json(
                { success: false, error: 'Address parameter is required' },
                { status: 400 }
            );
        }

        const data = await prpcClient.getStats(address);

        return NextResponse.json({
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching stats:', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch node stats',
            },
            { status: 500 }
        );
    }
}
