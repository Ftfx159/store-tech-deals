import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const totalProducts = await prisma.product.count();
    const inStock = await prisma.product.count({ where: { inStock: true } });
    const outOfStock = totalProducts - inStock;
    
    // Get categories distribution
    const categoriesRaw = await prisma.product.groupBy({
      by: ['category'],
      _count: { category: true }
    });
    
    const categories = categoriesRaw.map(c => ({
      name: c.category || 'Uncategorized',
      value: c._count.category
    })).sort((a, b) => b.value - a.value);

    return NextResponse.json({
      totalProducts,
      inStock,
      outOfStock,
      categories
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
