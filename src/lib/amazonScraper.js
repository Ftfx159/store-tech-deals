import * as cheerio from 'cheerio';

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15"
];

function getRandomHeaders() {
  return {
    'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-IN,en-US;q=0.9,en;q=0.8',
    'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0'
  };
}

export async function scrapeAmazonSearch(keyword) {
  try {
    const url = `https://www.amazon.in/s?k=${encodeURIComponent(keyword)}`;
    const response = await fetch(url, { headers: getRandomHeaders() });
    const html = await response.text();

    if (html.includes('api/services/captcha') || html.includes('validateCaptcha')) {
      console.warn("Amazon Scraper: Blocked by CAPTCHA during search.");
      return null;
    }

    const $ = cheerio.load(html);
    const results = [];

    $('[data-asin]').each((i, el) => {
      const asin = $(el).attr('data-asin');
      if (!asin) return;

      const title = $(el).find('h2 a span').text().trim();
      if (!title) return;

      const priceText = $(el).find('.a-price-whole').first().text().replace(/,/g, '').trim();
      const originalPriceText = $(el).find('.a-text-price .a-offscreen').first().text().replace(/[^0-9]/g, '').trim();
      const ratingText = $(el).find('.a-icon-alt').first().text();
      const reviewsText = $(el).find('span.a-size-base.s-underline-text').first().text().replace(/,/g, '');
      const imageUrl = $(el).find('.s-image').attr('src');
      const isPrime = $(el).find('.a-icon-prime').length > 0;

      // Extract values
      const discountedPrice = parseFloat(priceText);
      let originalPrice = parseFloat(originalPriceText);
      if (isNaN(originalPrice) || originalPrice < discountedPrice) {
        originalPrice = discountedPrice;
      }
      
      const ratingMatch = ratingText.match(/([0-9.]+) out of/);
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 4.0;
      
      const reviews = parseInt(reviewsText) || 0;

      if (!isNaN(discountedPrice)) {
        results.push({
          product_title: title,
          asin: asin,
          product_price: `₹${discountedPrice}`,
          product_original_price: `₹${originalPrice}`,
          product_star_rating: rating.toString(),
          product_num_ratings: reviews,
          product_url: `https://www.amazon.in/dp/${asin}`,
          product_photo: imageUrl,
          is_prime: isPrime,
        });
      }
    });

    return results.length > 0 ? results : null;
  } catch (error) {
    console.error("Scraper Search Error:", error.message);
    return null;
  }
}

export async function scrapeAmazonProductDetails(asin) {
  try {
    const url = `https://www.amazon.in/dp/${asin}`;
    const response = await fetch(url, { headers: getRandomHeaders() });
    const html = await response.text();

    if (html.includes('api/services/captcha') || html.includes('validateCaptcha')) {
      console.warn(`Amazon Scraper: Blocked by CAPTCHA for ASIN ${asin}.`);
      return null;
    }

    const $ = cheerio.load(html);

    const title = $('#productTitle').text().trim();
    if (!title) return null;

    const priceText = $('.a-price-whole').first().text().replace(/,/g, '').trim();
    const originalPriceText = $('.a-text-price .a-offscreen').first().text().replace(/[^0-9]/g, '').trim();
    
    // Check if out of stock
    const availabilityText = $('#availability span').text().toLowerCase();
    const isOutOfStock = availabilityText.includes('currently unavailable') || availabilityText.includes('out of stock');

    const brand = $('#bylineInfo').text().replace('Visit the ', '').replace(' Store', '').trim() || 'Amazon Partner';
    
    const ratingText = $('#acrPopover').attr('title') || '4.0 out of 5 stars';
    const ratingMatch = ratingText.match(/([0-9.]+) out of/);
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 4.0;
    
    const reviewsText = $('#acrCustomerReviewText').first().text().replace(/,/g, '').trim();
    const reviews = parseInt(reviewsText) || 0;

    const imageUrl = $('#landingImage').attr('src') || $('#imgBlkFront').attr('src');
    const isPrime = $('#prime-exclusive-icon').length > 0 || $('#prime-savings-badge').length > 0;

    // Features list
    const features = [];
    $('#feature-bullets ul li span.a-list-item').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 5 && !text.includes('Make sure this fits')) {
        features.push(text);
      }
    });

    const discountedPrice = parseFloat(priceText);
    let originalPrice = parseFloat(originalPriceText);
    if (isNaN(originalPrice) || originalPrice < discountedPrice) {
      originalPrice = discountedPrice;
    }

    return {
      product_title: title,
      asin: asin,
      product_price: `₹${discountedPrice}`,
      product_original_price: `₹${originalPrice}`,
      brand: brand,
      product_star_rating: rating.toString(),
      product_num_ratings: reviews,
      product_url: url,
      product_photo: imageUrl,
      is_prime: isPrime,
      about_product: features,
      category: { name: 'Electronics' } // Simplified for scraper
    };
  } catch (error) {
    console.error("Scraper Details Error:", error.message);
    return null;
  }
}
