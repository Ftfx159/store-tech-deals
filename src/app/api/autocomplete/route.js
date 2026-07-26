import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const normalizedQuery = query.toLowerCase().trim();

    // Search the database for products matching the query in their name or brand
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: normalizedQuery } },
          { brand: { contains: normalizedQuery } }
        ]
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        discountedPrice: true
      },
      take: 5 // Limit to 5 suggestions for speed and UI constraints
    });

    return NextResponse.json({ results: products });
  } catch (error) {
    console.error('Autocomplete API Error:', error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
