import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { searchAmazonProducts } from '@/lib/amazonApi';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  const normalizedQuery = query.toLowerCase().trim();

  try {
    // 1. Try to find in Database (Intelligent Caching)
    const cachedProducts = await prisma.product.findMany({
      where: {
        searchQuery: normalizedQuery,
        inStock: true
      },
      orderBy: {
        lastUpdated: 'desc'
      },
      take: 10
    });

    // Check if we have recent enough results
    const hasValidCache = cachedProducts.length > 0 && 
      (new Date() - new Date(cachedProducts[0].lastUpdated)) < 24 * 60 * 60 * 1000; // 24 hours

    if (hasValidCache) {
      console.log(`[Search API] Cache hit for "${query}"`);
      return NextResponse.json({ data: cachedProducts, source: 'cache' });
    }

    // 2. Fetch Live from Amazon if cache miss or stale
    console.log(`[Search API] Fetching live data for "${query}"`);
    const liveProducts = await searchAmazonProducts(query);

    // 3. Save / Update in Database
    const savedProducts = [];
    for (const p of liveProducts) {
      const upsertedProduct = await prisma.product.upsert({
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
          features: p.features ? JSON.stringify(p.features) : null,
          amazonUrl: p.amazonUrl,
          imageUrl: p.imageUrl,
          tags: p.tags ? JSON.stringify(p.tags) : null,
          couponCode: p.couponCode || null,
          searchQuery: normalizedQuery,
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
          searchQuery: normalizedQuery
        }
      });
      savedProducts.push(upsertedProduct);
    }

    return NextResponse.json({ data: savedProducts, source: 'live' });

  } catch (error) {
    console.error('[Search API Error]', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
