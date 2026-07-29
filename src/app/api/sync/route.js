import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { searchAmazonProducts } from '@/lib/amazonApi';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const providedSecret = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    const syncSecret = process.env.SYNC_SECRET;
    const adminPassword = process.env.ADMIN_PASSWORD || 'Tanish&2018';
    const devFallback = process.env.NODE_ENV !== 'production' ? 'dev-secret' : null;
    
    if (!providedSecret || (providedSecret !== syncSecret && providedSecret !== adminPassword && providedSecret !== devFallback)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let syncCategory = 'All';
    try {
      const body = await request.json();
      if (body && body.category) {
        syncCategory = body.category;
      }
    } catch(e) {
      // Ignore if no JSON body
    }

    console.log(`[Sync API] Starting background catalog synchronization. Target: ${syncCategory}`);

    let allQueries = [];

    if (syncCategory !== 'All') {
      // Sync only the specifically requested category
      allQueries = [syncCategory];
    } else {
      // 1. Get all queries, prioritizing stale data (Incremental Sync Queue)
      const staleProducts = await prisma.product.findMany({
        select: { searchQuery: true, lastUpdated: true },
        where: { searchQuery: { not: null } },
        orderBy: { lastUpdated: 'asc' }
      });

      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
      
      // Find queries that haven't been synced in 12+ hours
      const staleQueries = staleProducts
        .filter(p => new Date(p.lastUpdated) < twelveHoursAgo)
        .map(p => p.searchQuery)
        .filter(Boolean);

      let uniqueStaleQueries = [...new Set(staleQueries)];
      
      // Add "Discovery" queries to force searching for entirely new deals
      const discoveryQueries = [
        "new tech gadgets",
        "latest electronics releases",
        "best smartphones",
        "gaming accessories sale",
        "usb flash drive 128gb",
        "micro sd memory card",
        "pc graphics card processor",
        "smart home devices alexa",
        "streaming microphone webcam",
        "external hard drive 1tb",
        "amazon fire tv stick",
        "google nest chromecast"
      ];
      
      // Combine stale queries with discovery queries, ensuring uniqueness.
      // HARD CAP at 15 queries per sync run to prevent RapidAPI rate limits (429 Too Many Requests)
      allQueries = [...new Set([...uniqueStaleQueries, ...discoveryQueries])].slice(0, 15);
    }

    console.log(`[Sync API] Incremental Queue processing ${allQueries.length} queries.`);

    let totalUpdated = 0;

    // 2. Resync each query
    for (const query of allQueries) {
      console.log(`[Sync API] Resyncing query: "${query}"`);
      // We wrap in try-catch so one failing query doesn't crash the whole sync
      try {
        const liveProducts = await searchAmazonProducts(query);
        
        for (const p of liveProducts) {
          await prisma.product.upsert({
            where: { id: p.id },
            update: {
              name: p.name,
              brand: p.brand || null,
              category: p.category || null,
              rating: p.rating || 0,
              reviews: p.reviews || 0,
              originalPrice: p.originalPrice || p.discountedPrice,
              discountedPrice: p.discountedPrice,
              primeEligible: p.primeEligible || false,
              inStock: p.inStock !== false,
              imageUrl: p.imageUrl,
              lastUpdated: new Date()
            },
            create: {
              id: p.id,
              name: p.name,
              brand: p.brand || null,
              category: p.category || null,
              rating: p.rating || 0,
              reviews: p.reviews || 0,
              originalPrice: p.originalPrice || p.discountedPrice,
              discountedPrice: p.discountedPrice,
              primeEligible: p.primeEligible || false,
              inStock: p.inStock !== false,
              features: p.features ? JSON.stringify(p.features) : null,
              amazonUrl: p.amazonUrl,
              imageUrl: p.imageUrl,
              tags: p.tags ? JSON.stringify(p.tags) : null,
              couponCode: p.couponCode || null,
              searchQuery: query
            }
          });
          totalUpdated++;
        }
      } catch (err) {
        console.error(`[Sync API] Failed to sync query "${query}":`, err);
      }
      
      // Delay between queries to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sync complete. Updated ${totalUpdated} products across ${allQueries.length} categories.` 
    });

  } catch (error) {
    console.error('[Sync API Error]', error);
    return NextResponse.json({ error: 'Failed to synchronize catalog' }, { status: 500 });
  }
}
