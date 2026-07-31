import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch 10 recent highly discounted products
    const products = await prisma.product.findMany({
      where: {
        originalPrice: { gt: 0 }
      },
      take: 20
    });

    if (products.length === 0) {
      return NextResponse.json({ success: false });
    }

    // Filter to products with a discount
    const discountedProducts = products.filter(p => p.originalPrice > p.discountedPrice);
    if (discountedProducts.length === 0) {
      return NextResponse.json({ success: false });
    }

    // Pick a random product
    const randomProduct = discountedProducts[Math.floor(Math.random() * discountedProducts.length)];

    return NextResponse.json({
      success: true,
      product: {
        id: randomProduct.id,
        name: randomProduct.name,
        savings: randomProduct.originalPrice - randomProduct.discountedPrice
      }
    });
  } catch (error) {
    console.error('Error fetching trending products:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
