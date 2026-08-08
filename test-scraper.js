require('dotenv').config({ path: '.env.local' });
import('./src/lib/amazonScraper.js').then(scraper => {
  scraper.scrapeAmazonSearch('laptops').then(results => {
    if (results) {
      console.log(`Success! Found ${results.length} products.`);
      console.log('Sample product:', results[0]);
    } else {
      console.log('Failed! Scraper returned null.');
    }
  }).catch(console.error);
}).catch(console.error);
