import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to provide realistic mock data if database is empty
function getFallbackPart(key, targetBudget) {
  const fallbacks = {
    cpu: { id: 'B09MDHL9Z5', name: 'Intel Core i5-12400F Desktop Processor', category: 'Processor', originalPrice: 18000, discountedPrice: 11500, imageUrl: 'https://m.media-amazon.com/images/I/61vGQNUEsGL._SX679_.jpg' },
    mobo: { id: 'B09NTQJVD4', name: 'MSI PRO H610M-E DDR4 Motherboard', category: 'Motherboard', originalPrice: 9000, discountedPrice: 6200, imageUrl: 'https://m.media-amazon.com/images/I/71s6Vw6eG5L._SX679_.jpg' },
    gpu: { id: 'B0985V4NJ9', name: 'ZOTAC Gaming GeForce RTX 3050 8GB GDDR6', category: 'Graphics Card', originalPrice: 35000, discountedPrice: 22000, imageUrl: 'https://m.media-amazon.com/images/I/71Y-1X-mF8S._SX679_.jpg' },
    ram: { id: 'B083TRRT16', name: 'Corsair Vengeance LPX 16GB (1x16GB) DDR4 3200MHZ', category: 'Memory', originalPrice: 6500, discountedPrice: 3400, imageUrl: 'https://m.media-amazon.com/images/I/51BWV0yDwwL._SX679_.jpg' },
    ssd: { id: 'B08GVDNTGJ', name: 'Crucial P2 500GB 3D NAND NVMe PCIe M.2 SSD', category: 'Storage', originalPrice: 5000, discountedPrice: 2800, imageUrl: 'https://m.media-amazon.com/images/I/614X96pAWfL._SX679_.jpg' },
    psu: { id: 'B08H5VG646', name: 'Cooler Master MWE 550 Bronze V2 Power Supply', category: 'Power Supply', originalPrice: 5500, discountedPrice: 3500, imageUrl: 'https://m.media-amazon.com/images/I/71qYx5t5D3L._SX679_.jpg' },
    case: { id: 'B08F9S8R3N', name: 'Ant Esports ICE-112 Mid Tower Gaming Cabinet', category: 'Cabinet', originalPrice: 4500, discountedPrice: 2800, imageUrl: 'https://m.media-amazon.com/images/I/61N+V5l-XfL._SX679_.jpg' },
    laptop: { id: 'B0B31FB4KS', name: 'Lenovo IdeaPad Slim 3 Intel Core i3 11th Gen 15.6"', category: 'Laptop', originalPrice: 55000, discountedPrice: 32000, imageUrl: 'https://m.media-amazon.com/images/I/61Dw5Z8LzJL._SX679_.jpg' },
    mouse: { id: 'B07W4DGNXW', name: 'Logitech G102 Light Sync Gaming Mouse', category: 'Mouse', originalPrice: 1995, discountedPrice: 1495, imageUrl: 'https://m.media-amazon.com/images/I/61UxfXTUyvL._SX679_.jpg' },
    headphone: { id: 'B084G2DDW8', name: 'HyperX Cloud Stinger Core Gaming Headset', category: 'Headset', originalPrice: 4500, discountedPrice: 2990, imageUrl: 'https://m.media-amazon.com/images/I/71QG-E1m3yL._SX679_.jpg' },
    monitor: { id: 'B0B5178W94', name: 'Acer Nitro VG270 S 27 Inch IPS 165Hz Monitor', category: 'Monitor', originalPrice: 22000, discountedPrice: 13500, imageUrl: 'https://m.media-amazon.com/images/I/81cO4p+nZ3L._SX679_.jpg' },
    keyboard: { id: 'B084ZWHWJ4', name: 'Cosmic Byte CB-GK-16 Firefly Mechanical Keyboard', category: 'Keyboard', originalPrice: 3500, discountedPrice: 2100, imageUrl: 'https://m.media-amazon.com/images/I/61N6M4EwB2L._SX679_.jpg' },
    webcam: { id: 'B006JH8T3S', name: 'Logitech C920 HD Pro Webcam', category: 'Webcam', originalPrice: 8995, discountedPrice: 6495, imageUrl: 'https://m.media-amazon.com/images/I/71iNwnHT3IL._SX679_.jpg' },
    mic: { id: 'B00N1YPXW2', name: 'Blue Yeti USB Microphone', category: 'Microphone', originalPrice: 14000, discountedPrice: 9999, imageUrl: 'https://m.media-amazon.com/images/I/612DqH4m7zL._SX679_.jpg' }
  };
  
  return fallbacks[key] || fallbacks['mouse'];
}

// Helper to find the best product under a given budget
async function findBestProduct(key, categoryQueries, maxBudget) {
  let potentialProducts = [];
  
  for (const query of categoryQueries) {
    const results = await prisma.product.findMany({
      where: {
        searchQuery: { contains: query },
        discountedPrice: { lte: maxBudget }
      },
      orderBy: { discountedPrice: 'desc' },
      take: 5
    });
    potentialProducts = [...potentialProducts, ...results];
  }

  // Deduplicate
  potentialProducts = Array.from(new Map(potentialProducts.map(p => [p.id, p])).values());

  // Filter inStock (safely in JS if schema isn't fully updated)
  const available = potentialProducts.filter(p => p.inStock !== false);

  if (available.length === 0) {
    // FALLBACK Mechanism: If user's DB is empty, use realistic mock data
    return getFallbackPart(key, maxBudget);
  }

  available.sort((a, b) => {
    const aDiscount = ((a.originalPrice - a.discountedPrice) / a.originalPrice);
    const bDiscount = ((b.originalPrice - b.discountedPrice) / b.originalPrice);
    return bDiscount - aDiscount;
  });

  return available[0];
}

export async function POST(req) {
  try {
    const { budget, goal } = await req.json();

    if (!budget || !goal) {
      return NextResponse.json({ success: false, error: "Missing budget or goal" }, { status: 400 });
    }

    // Dynamic Templates based on budget
    let template = {};
    let accessories = [];

    // 1. Budget Level (Laptops)
    if (budget < 50000) {
      template = {
        laptop: { queries: ['laptop', 'notebook'], alloc: 0.85 }
      };
      if (goal === 'gaming') {
        accessories = [
          { key: 'mouse', queries: ['gaming mouse'], alloc: 0.05 },
          { key: 'headphone', queries: ['gaming headset'], alloc: 0.10 }
        ];
      } else {
        accessories = [
          { key: 'mouse', queries: ['wireless mouse'], alloc: 0.15 }
        ];
      }
    } 
    // 2. PC Builds (50k+)
    else {
      const coreBudget = budget * 0.80;
      const accBudget = budget * 0.20;

      if (coreBudget < 80000) {
        // Entry PC
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
        // Mid PC
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
        // High PC
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

      if (goal === 'gaming') {
        accessories = [
          { key: 'monitor', queries: ['gaming monitor 144hz'], alloc: 0.50 },
          { key: 'keyboard', queries: ['mechanical keyboard'], alloc: 0.25 },
          { key: 'mouse', queries: ['gaming mouse'], alloc: 0.25 }
        ];
      } else if (goal === 'productivity') {
        accessories = [
          { key: 'monitor', queries: ['4k monitor'], alloc: 0.60 },
          { key: 'keyboard', queries: ['wireless ergonomic keyboard'], alloc: 0.20 },
          { key: 'mouse', queries: ['wireless mouse mx master'], alloc: 0.20 }
        ];
      } else { 
        accessories = [
          { key: 'monitor', queries: ['ips monitor 27 inch'], alloc: 0.40 },
          { key: 'webcam', queries: ['webcam 1080p'], alloc: 0.30 },
          { key: 'mic', queries: ['usb condenser microphone'], alloc: 0.30 }
        ];
      }
    }

    let coreBundle = [];
    let accBundle = [];

    // Fetch Core Components
    let actualCoreCost = 0;
    const coreTarget = budget < 50000 ? budget : budget * 0.80;
    for (const [key, spec] of Object.entries(template)) {
      const targetBudget = coreTarget * spec.alloc;
      const product = await findBestProduct(key, spec.queries, targetBudget);
      if (product) {
        coreBundle.push(product);
        actualCoreCost += product.discountedPrice;
      }
    }

    // Fetch Accessories
    const accTarget = budget < 50000 ? budget : budget * 0.20;
    for (const spec of accessories) {
      const targetBudget = accTarget * spec.alloc;
      const product = await findBestProduct(spec.key, spec.queries, targetBudget);
      if (product) accBundle.push(product);
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
