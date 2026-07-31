import { getFlashDeals } from '@/lib/products';
import DealOfTheHour from './DealOfTheHour';

export default async function GlobalDealBanner() {
  try {
    const deals = await getFlashDeals();
    
    if (!deals || deals.length === 0) return null;
    
    // Sort deals by highest discount percentage just to be sure
    deals.sort((a, b) => {
      const aPct = (a.originalPrice - a.discountedPrice) / a.originalPrice;
      const bPct = (b.originalPrice - b.discountedPrice) / b.originalPrice;
      return bPct - aPct;
    });
    
    // Take the top 3 highest discounts
    const topDeals = deals.slice(0, 3);
    
    if (topDeals.length === 0) return null;
    
    return <DealOfTheHour deals={topDeals} />;
  } catch(e) {
    console.error("Global banner fetch error:", e);
    return null;
  }
}
