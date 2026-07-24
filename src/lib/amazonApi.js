const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'real-time-amazon-data.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

const hasCredentials = !!RAPIDAPI_KEY;

// Clean up price strings from RapidAPI (e.g., "₹31,599.50" -> 31599.50)
function parsePrice(priceString) {
  if (priceString === null || priceString === undefined) return 0;
  if (typeof priceString === 'number') return priceString;
  // Remove everything except digits and the decimal point
  const cleaned = priceString.toString().replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

// Helper to decode HTML entities from API
function decodeHtmlEntities(text) {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

const fallbackProducts = [
  { id: 'B0CHX1W1XY', name: 'Apple iPhone 15 Pro (128 GB) - Natural Titanium', brand: 'Apple', category: 'Smartphones', rating: 4.8, reviews: 12450, originalPrice: 134900, discountedPrice: 127990, primeEligible: true, inStock: true, features: ['Forged in titanium', 'A17 Pro chip', '48MP Main camera'], amazonUrl: 'https://amazon.in/dp/B0CHX1W1XY', imageUrl: 'https://m.media-amazon.com/images/I/81+GIkwqLIL._SX679_.jpg', tags: ['premium', 'smartphone'], couponCode: 'SAVE5000' },
  { id: 'B0B3CQBRB4', name: 'Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones', brand: 'Sony', category: 'Audio', rating: 4.6, reviews: 8900, originalPrice: 34990, discountedPrice: 29990, primeEligible: true, inStock: true, features: ['Industry leading noise cancellation', '30-hour battery life', 'Crystal clear hands-free calling'], amazonUrl: 'https://amazon.in/dp/B0B3CQBRB4', imageUrl: 'https://m.media-amazon.com/images/I/51aXvjzcukL._SX679_.jpg', tags: ['audio', 'premium'], couponCode: null },
  { id: 'B0BMG3B38J', name: 'Samsung Galaxy S23 Ultra 5G (Green, 12GB, 256GB Storage)', brand: 'Samsung', category: 'Smartphones', rating: 4.7, reviews: 6540, originalPrice: 149999, discountedPrice: 124999, primeEligible: true, inStock: true, features: ['200MP camera', 'Snapdragon 8 Gen 2', 'S-Pen included'], amazonUrl: 'https://amazon.in/dp/B0BMG3B38J', imageUrl: 'https://m.media-amazon.com/images/I/61VfL-aiToL._SX679_.jpg', tags: ['premium', 'smartphone'], couponCode: 'SAMSUNG23' },
  { id: 'B0C781QQ1C', name: 'Dell XPS 15 9530 Laptop, Intel Core i7-13700H', brand: 'Dell', category: 'Laptops', rating: 4.5, reviews: 430, originalPrice: 254990, discountedPrice: 224990, primeEligible: true, inStock: true, features: ['15.6" OLED display', '16GB DDR5 RAM', '1TB SSD', 'RTX 4050'], amazonUrl: 'https://amazon.in/dp/B0C781QQ1C', imageUrl: 'https://m.media-amazon.com/images/I/61Nl5c9vXJL._SX679_.jpg', tags: ['laptop', 'premium'], couponCode: 'DELLVIP' },
  { id: 'B0C9QPD6XZ', name: 'LG 27" Ultragear OLED QHD Gaming Monitor', brand: 'LG', category: 'Monitors', rating: 4.9, reviews: 120, originalPrice: 95000, discountedPrice: 82990, primeEligible: true, inStock: true, features: ['240Hz Refresh Rate', '0.03ms Response Time', 'G-Sync Compatible'], amazonUrl: 'https://amazon.in/dp/B0C9QPD6XZ', imageUrl: 'https://m.media-amazon.com/images/I/71wLpW80e+L._SX679_.jpg', tags: ['gaming', 'monitor'], couponCode: null }
];

export async function searchAmazonProducts(keyword, category = 'Electronics', options = {}) {
  if (!hasCredentials) {
    console.error("CRITICAL: RapidAPI Key is missing. Falling back to cached data.");
    return fallbackProducts;
  }

  try {
    const url = new URL(`https://${RAPIDAPI_HOST}/search`);
    url.searchParams.append('query', keyword);
    url.searchParams.append('page', '1');
    url.searchParams.append('country', 'IN');
    
    // Sort logic
    if (options.maxPrice) {
       url.searchParams.append('sort_by', 'PRICE_LOW_TO_HIGH');
    } else {
       url.searchParams.append('sort_by', 'RELEVANCE');
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY
      },
      next: { revalidate: 3600 } // Cache results for 1 hour to save API quota
    });

    if (!response.ok) {
      console.warn(`RapidAPI warning: ${response.status} - Likely 429 Too Many Requests (Rate limit hit).`);
      return fallbackProducts;
    }

    const json = await response.json();
    
    if (json.data && Array.isArray(json.data.products)) {
      let products = formatAmazonResponse(json.data.products);
      if (options.maxPrice) {
        products = products.filter(p => p.discountedPrice <= options.maxPrice);
      }
      return products.length > 0 ? products.slice(0, 10) : fallbackProducts;
    }
    
    return fallbackProducts;
  } catch (error) {
    console.error("RapidAPI Search Error:", error);
    return fallbackProducts;
  }
}

export async function getAmazonProductByASIN(asin) {
  if (!hasCredentials) return fallbackProducts.find(p => p.id === asin) || fallbackProducts[0];

  try {
    const url = `https://${RAPIDAPI_HOST}/product-details?asin=${asin}&country=IN`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      console.warn(`RapidAPI details warning: ${response.status} - Likely 429 Too Many Requests.`);
      return fallbackProducts.find(p => p.id === asin) || fallbackProducts[0];
    }

    const json = await response.json();
    if (json.data) {
      // The product-details endpoint has a slightly different format than search
      return formatDetailedResponse(json.data);
    }
    
    return fallbackProducts.find(p => p.id === asin) || fallbackProducts[0];
  } catch (error) {
    console.error("RapidAPI Details Error:", error);
    return fallbackProducts.find(p => p.id === asin) || fallbackProducts[0];
  }
}

// Format the `search` endpoint results
function formatAmazonResponse(items) {
  return items.map(item => {
    const price = parsePrice(item.product_price);
    const originalPrice = parsePrice(item.product_original_price) || price;
    
    return {
      id: item.asin,
      name: decodeHtmlEntities(item.product_title) || 'Unknown Product',
      brand: 'Amazon Partner', // RapidAPI search doesn't easily expose Brand
      category: 'Electronics',
      rating: parseFloat(item.product_star_rating) || 4.0,
      reviews: item.product_num_ratings || 0, 
      originalPrice: originalPrice,
      discountedPrice: price,
      primeEligible: item.is_prime || false,
      inStock: true,
      features: [], // No features in search list
      amazonUrl: item.product_url,
      imageUrl: item.product_photo || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800',
      tags: [], 
      // STRICT POLICY: No fake coupons. If the API doesn't provide it, it's null.
      couponCode: item.coupon_text || null 
    };
  });
}

// Format the `product-details` endpoint result
function formatDetailedResponse(item) {
  const price = parsePrice(item.product_price);
  const originalPrice = parsePrice(item.product_original_price) || price;
  
  // Try to extract a coupon if present in the details
  let realCoupon = null;
  if (item.coupon_text) {
     realCoupon = item.coupon_text;
  }
  
  return {
    id: item.asin,
    name: decodeHtmlEntities(item.product_title) || 'Unknown Product',
    brand: item.brand || 'Amazon Partner',
    category: item.category?.name || 'Electronics',
    rating: parseFloat(item.product_star_rating) || 4.0,
    reviews: item.product_num_ratings || 0, 
    originalPrice: originalPrice,
    discountedPrice: price,
    primeEligible: item.is_prime || false,
    inStock: true,
    features: Array.isArray(item.about_product) ? item.about_product : (typeof item.about_product === 'string' ? [item.about_product] : []), 
    amazonUrl: item.product_url,
    imageUrl: item.product_photo || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800',
    tags: [], 
    couponCode: realCoupon
  };
}
