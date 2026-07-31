import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to find the best product under a given budget using fuzzy search
async function findBestProduct(categoryQueries, maxBudget) {
  let potentialProducts = [];
  
  for (const query of categoryQueries) {
    const results = await prisma.product.findMany({
      where: {
        searchQuery: { contains: query },
        discountedPrice: { lte: maxBudget },
        inStock: true
      },
      orderBy: { discountedPrice: 'desc' }, // Get highest quality one under budget
      take: 5
    });
    potentialProducts = [...potentialProducts, ...results];
  }

  if (potentialProducts.length === 0) return null;

  // Deduplicate
  potentialProducts = Array.from(new Map(potentialProducts.map(p => [p.id, p])).values());

  // Sort by highest discount percentage to give them a "deal"
  potentialProducts.sort((a, b) => {
    const aDiscount = ((a.originalPrice - a.discountedPrice) / a.originalPrice);
    const bDiscount = ((b.originalPrice - b.discountedPrice) / b.originalPrice);
    return bDiscount - aDiscount;
  });

  return potentialProducts[0];
}

export async function POST(req) {
  try {
    const { budget, goal } = await req.json();

    if (!budget || !goal) {
      return NextResponse.json({ success: false, error: "Missing budget or goal" }, { status: 400 });
    }

    let bundle = [];
    
    // Allocate budget percentages
    // Gaming: 70% Laptop, 10% Mouse, 20% Headset
    // Productivity: 75% Laptop, 10% Mouse, 15% Keyboard/Accessory
    // Streaming: 60% Laptop, 20% Webcam, 20% Mic
    
    let target1, target2, target3;
    let queries1, queries2, queries3;

    if (goal === 'gaming') {
      target1 = budget * 0.75;
      queries1 = ['gaming laptop', 'rtx laptop', 'gaming pc'];
      
      target2 = budget * 0.10;
      queries2 = ['gaming mouse', 'razer mouse', 'logitech g'];
      
      target3 = budget * 0.15;
      queries3 = ['gaming headset', 'headphones', 'hyperx'];
    } else if (goal === 'productivity') {
      target1 = budget * 0.75;
      queries1 = ['laptop', 'macbook', 'ultrabook'];
      
      target2 = budget * 0.10;
      queries2 = ['wireless mouse', 'mx master'];
      
      target3 = budget * 0.15;
      queries3 = ['monitor', 'display', 'keyboard'];
    } else {
      // streaming
      target1 = budget * 0.60;
      queries1 = ['laptop', 'macbook', 'gaming laptop'];
      
      target2 = budget * 0.20;
      queries2 = ['webcam', 'camera', 'c920'];
      
      target3 = budget * 0.20;
      queries3 = ['microphone', 'blue yeti', 'usb mic'];
    }

    // Try to find products
    const p1 = await findBestProduct(queries1, target1);
    const p2 = await findBestProduct(queries2, target2);
    const p3 = await findBestProduct(queries3, target3);

    // Filter out nulls
    if (p1) bundle.push(p1);
    if (p2) bundle.push(p2);
    if (p3) bundle.push(p3);

    // If we couldn't even find a primary machine, the budget is too low
    if (!p1 && !p2 && !p3) {
      return NextResponse.json({ 
        success: false, 
        error: `Your budget of ₹${budget.toLocaleString('en-IN')} is too low to build a complete ${goal} setup from our current stock. Try increasing your budget.` 
      });
    }

    // Format the response
    const formattedBundle = bundle.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category || 'Tech',
      discountedPrice: p.discountedPrice,
      originalPrice: p.originalPrice,
      imageUrl: p.imageUrl,
      amazonUrl: p.amazonUrl || `https://www.amazon.in/dp/${p.id}`
    }));

    const totalPrice = formattedBundle.reduce((sum, item) => sum + item.discountedPrice, 0);
    const originalPrice = formattedBundle.reduce((sum, item) => sum + item.originalPrice, 0);

    return NextResponse.json({
      success: true,
      data: {
        products: formattedBundle,
        totalPrice,
        originalPrice
      }
    });

  } catch (error) {
    console.error('Error building setup:', error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
