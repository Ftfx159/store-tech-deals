import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const startTime = Date.now();
  try {
    // Check Database Health
    const productsCount = await prisma.product.count();
    const latestProduct = await prisma.product.findFirst({
      orderBy: { lastUpdated: 'desc' }
    });

    const dbLatency = Date.now() - startTime;
    
    // Check if we haven't synced in over 24 hours
    const lastSync = latestProduct ? new Date(latestProduct.lastUpdated) : null;
    const hoursSinceSync = lastSync ? (Date.now() - lastSync.getTime()) / (1000 * 60 * 60) : null;
    
    const isHealthy = dbLatency < 5000 && (hoursSinceSync === null || hoursSinceSync < 48);

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'degraded',
      metrics: {
        databaseLatencyMs: dbLatency,
        totalProducts: productsCount,
        lastSyncTimestamp: lastSync,
        hoursSinceLastSync: hoursSinceSync ? parseFloat(hoursSinceSync.toFixed(2)) : null,
      },
      timestamp: new Date().toISOString()
    }, { status: isHealthy ? 200 : 207 });

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message,
      metrics: {
        databaseLatencyMs: Date.now() - startTime
      }
    }, { status: 503 });
  }
}
