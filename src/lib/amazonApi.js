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

export async function searchAmazonProducts(keyword, category = 'Electronics', options = {}) {
  if (!hasCredentials) {
    console.error("CRITICAL: RapidAPI Key is missing. The site is in STRICT REAL DATA mode.");
    return [];
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
      return [];
    }

    const json = await response.json();
    
    if (json.data && Array.isArray(json.data.products)) {
      let products = formatAmazonResponse(json.data.products);
      if (options.maxPrice) {
        products = products.filter(p => p.discountedPrice <= options.maxPrice);
      }
      return products.slice(0, 10); // Return top 10
    }
    
    return [];
  } catch (error) {
    console.error("RapidAPI Search Error:", error);
    return [];
  }
}

export async function getAmazonProductByASIN(asin) {
  if (!hasCredentials) return null;

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
      return null;
    }

    const json = await response.json();
    if (json.data) {
      // The product-details endpoint has a slightly different format than search
      return formatDetailedResponse(json.data);
    }
    
    return null;
  } catch (error) {
    console.error("RapidAPI Details Error:", error);
    return null;
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
