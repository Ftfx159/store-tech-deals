import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding fake 30-day price history for existing products...');
  
  // Clear existing history
  await prisma.priceHistory.deleteMany();
  
  const products = await prisma.product.findMany();
  let totalRecords = 0;
  
  for (const product of products) {
    const historyToInsert = [];
    
    // Original price is the absolute max
    const maxPrice = product.originalPrice;
    const currentPrice = product.discountedPrice;
    
    // Generate 30 data points (one for each of the last 30 days)
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // We want to simulate some realistic pricing trends
      // If i == 0 (today), it must be currentPrice
      let simulatedPrice = currentPrice;
      
      if (i > 0) {
        // Randomly fluctuate between current price and original price, 
        // with occasional sharp drops
        const randomFactor = Math.random();
        
        if (randomFactor > 0.8) {
          // Keep it near original price
          simulatedPrice = maxPrice - (maxPrice * 0.05 * Math.random());
        } else if (randomFactor > 0.4) {
          // Mid-range
          const range = maxPrice - currentPrice;
          simulatedPrice = currentPrice + (range * Math.random());
        } else if (randomFactor < 0.1) {
          // Flash sale! 5% cheaper than current
          simulatedPrice = currentPrice * 0.95;
        } else {
          // Baseline current price
          simulatedPrice = currentPrice * 1.05;
        }
      }
      
      // Ensure we don't exceed original price
      simulatedPrice = Math.min(simulatedPrice, maxPrice);
      
      historyToInsert.push({
        productId: product.id,
        price: Math.round(simulatedPrice),
        timestamp: date
      });
    }
    
    await prisma.priceHistory.createMany({
      data: historyToInsert
    });
    
    totalRecords += historyToInsert.length;
  }
  
  console.log(`Successfully generated ${totalRecords} historical price points across ${products.length} products!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
