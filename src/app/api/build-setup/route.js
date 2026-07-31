import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to find the best product under a given budget
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

  potentialProducts = Array.from(new Map(potentialProducts.map(p => [p.id, p])).values());

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

    if (budget < 50000) {
      return NextResponse.json({ 
        success: false, 
        error: `A full custom desktop PC requires a minimum budget of ₹50,000. Try increasing your budget or search for laptops instead.` 
      });
    }

    // Allocate Budget for Core PC (80%) vs Accessories (20%)
    const coreBudget = budget * 0.80;
    const accBudget = budget * 0.20;

    // Determine Base Tier for 100% Compatibility
    let template = {};
    if (coreBudget < 80000) {
      // Entry Level: Intel LGA1700
      template = {
        cpu: { queries: ['intel core i3', 'intel core i5 12400'], alloc: 0.18 },
        mobo: { queries: ['h610 motherboard', 'b660 motherboard'], alloc: 0.12 },
        gpu: { queries: ['rtx 3050', 'rx 6600', 'gtx 1660'], alloc: 0.35 },
        ram: { queries: ['16gb ddr4 ram'], alloc: 0.08 },
        ssd: { queries: ['500gb nvme ssd', '1tb nvme ssd'], alloc: 0.07 },
        psu: { queries: ['550w power supply', '600w psu'], alloc: 0.10 },
        case: { queries: ['atx cabinet', 'gaming case'], alloc: 0.10 }
      };
    } else if (coreBudget < 150000) {
      // Mid Range: AMD AM5
      template = {
        cpu: { queries: ['ryzen 5 7600'], alloc: 0.20 },
        mobo: { queries: ['b650 motherboard'], alloc: 0.15 },
        gpu: { queries: ['rtx 4060', 'rx 7600', 'rtx 3060 ti'], alloc: 0.35 },
        ram: { queries: ['32gb ddr5 ram', '16gb ddr5 ram'], alloc: 0.10 },
        ssd: { queries: ['1tb nvme ssd gen4'], alloc: 0.07 },
        psu: { queries: ['650w power supply', '750w psu'], alloc: 0.08 },
        case: { queries: ['atx cabinet argb', 'nzxt case'], alloc: 0.05 }
      };
    } else {
      // Enthusiast: High-End Intel LGA1700
      template = {
        cpu: { queries: ['intel core i7 13700', 'intel core i9'], alloc: 0.25 },
        mobo: { queries: ['z790 motherboard', 'z690 motherboard'], alloc: 0.15 },
        gpu: { queries: ['rtx 4070', 'rtx 4080'], alloc: 0.35 },
        ram: { queries: ['32gb ddr5 ram rgb'], alloc: 0.08 },
        ssd: { queries: ['2tb nvme ssd gen4'], alloc: 0.07 },
        psu: { queries: ['850w gold power supply'], alloc: 0.06 },
        case: { queries: ['lian li case', 'corsair 4000d'], alloc: 0.04 }
      };
    }

    // Determine Accessories based on goal
    let accessories = [];
    if (goal === 'gaming') {
      accessories = [
        { queries: ['gaming monitor 144hz', 'ips monitor'], alloc: 0.50 },
        { queries: ['mechanical keyboard', 'gaming keyboard'], alloc: 0.25 },
        { queries: ['gaming mouse logitech', 'razer deathadder'], alloc: 0.25 }
      ];
    } else if (goal === 'productivity') {
      accessories = [
        { queries: ['4k monitor', 'ultrawide monitor'], alloc: 0.60 },
        { queries: ['wireless ergonomic keyboard', 'logitech mx keys'], alloc: 0.20 },
        { queries: ['wireless mouse mx master'], alloc: 0.20 }
      ];
    } else { // streaming
      accessories = [
        { queries: ['ips monitor 27 inch'], alloc: 0.40 },
        { queries: ['webcam 1080p', 'logitech c920'], alloc: 0.30 },
        { queries: ['usb condenser microphone', 'blue yeti'], alloc: 0.30 }
      ];
    }

    let coreBundle = [];
    let accBundle = [];

    // Fetch Core Components
    for (const [key, spec] of Object.entries(template)) {
      const targetBudget = coreBudget * spec.alloc;
      const product = await findBestProduct(spec.queries, targetBudget);
      if (product) coreBundle.push(product);
    }

    // Fetch Accessories
    for (const spec of accessories) {
      const targetBudget = accBudget * spec.alloc;
      const product = await findBestProduct(spec.queries, targetBudget);
      if (product) accBundle.push(product);
    }

    if (coreBundle.length < 4) {
      return NextResponse.json({ 
        success: false, 
        error: `Could not find enough compatible parts in stock for ₹${budget.toLocaleString('en-IN')}. Please adjust your budget.` 
      });
    }

    const formatProduct = (p) => ({
      id: p.id,
      name: p.name,
      category: p.category || 'Tech',
      discountedPrice: p.discountedPrice,
      originalPrice: p.originalPrice,
      imageUrl: p.imageUrl,
      amazonUrl: p.amazonUrl || `https://www.amazon.in/dp/${p.id}`
    });

    const formattedCore = coreBundle.map(formatProduct);
    const formattedAcc = accBundle.map(formatProduct);
    
    const allProducts = [...formattedCore, ...formattedAcc];
    const totalPrice = allProducts.reduce((sum, item) => sum + item.discountedPrice, 0);
    const originalPrice = allProducts.reduce((sum, item) => sum + item.originalPrice, 0);

    return NextResponse.json({
      success: true,
      data: {
        core: formattedCore,
        accessories: formattedAcc,
        totalPrice,
        originalPrice
      }
    });

  } catch (error) {
    console.error('Error building setup:', error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
