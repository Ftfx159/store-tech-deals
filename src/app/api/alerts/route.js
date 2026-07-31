import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, productId, currentPrice } = body;

    if (!email || !productId || !currentPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Set target price to 5% below the current price
    const targetPrice = currentPrice * 0.95;

    // Upsert to handle unique constraints elegantly
    const alert = await prisma.priceAlert.upsert({
      where: {
        email_productId: {
          email: email,
          productId: productId,
        },
      },
      update: {
        targetPrice: targetPrice,
      },
      create: {
        email: email,
        productId: productId,
        targetPrice: targetPrice,
      },
    });

    return NextResponse.json({ success: true, alert });
  } catch (error) {
    console.error('Error creating price alert:', error);
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
  }
}
