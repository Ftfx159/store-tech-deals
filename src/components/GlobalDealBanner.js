import { prisma } from '@/lib/prisma';
import DealOfTheHour from './DealOfTheHour';

export default async function GlobalDealBanner() {
  try {
    const products = await prisma.product.findMany({
      where: { 
        originalPrice: { gt: 0 },
        inStock: true
      },
      take: 100
    });
    
    if (!products || products.length === 0) return null;
    
    const discounted = products.filter(p => p.originalPrice > p.discountedPrice);
    
    discounted.sort((a, b) => {
      const aPct = (a.originalPrice - a.discountedPrice) / a.originalPrice;
      const bPct = (b.originalPrice - b.discountedPrice) / b.originalPrice;
      return bPct - aPct;
    });
    
    const topDeals = discounted.slice(0, 3);
    
    if (topDeals.length === 0) return null;
    
    return <DealOfTheHour deals={topDeals} />;
  } catch(e) {
    console.error("Global banner fetch error:", e);
    return null;
  }
}
