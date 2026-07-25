import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { searchAmazonProducts } from '@/lib/amazonApi';

export async function POST(request) {
  try {
    // Basic security check (e.g., auth token)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.SYNC_SECRET || 'dev-secret'}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Sync API] Starting background catalog synchronization...');

    // 1. Get all distinct search queries we have cached
    const products = await prisma.product.findMany({
      select: { searchQuery: true },
      distinct: ['searchQuery'],
      where: { searchQuery: { not: null } }
    });

    const queries = products.map(p => p.searchQuery).filter(Boolean);
    console.log(`[Sync API] Found ${queries.length} queries to resync.`);

    let totalUpdated = 0;

    // 2. Resync each query
    for (const query of queries) {
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
      message: `Sync complete. Updated ${totalUpdated} products across ${queries.length} categories.` 
    });

  } catch (error) {
    console.error('[Sync API Error]', error);
    return NextResponse.json({ error: 'Failed to synchronize catalog' }, { status: 500 });
  }
}
