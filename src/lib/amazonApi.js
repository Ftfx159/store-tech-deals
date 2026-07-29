import { scrapeAmazonSearch, scrapeAmazonProductDetails } from './amazonScraper';

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

function getAiImageUrl(productName) {
  const cleanName = productName ? productName.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 80) : 'tech gadget';
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanName + ' premium tech product photography studio lighting')}?width=800&height=800&nologo=true`;
}

// Exclude non-tech categories
function isTechProduct(title, categoryName = '') {
  const t = (title + ' ' + categoryName).toLowerCase();
  
  // Non-tech blacklisted keywords
  const blacklist = [
    'fashion', 'clothing', 'shoes', 'jewelry', 'beauty', 'makeup', 'grocery', 
    'food', 'kitchen', 'furniture', 'home decor', 'toys', 'books', 'medicine',
    'apparel', 'shirt', 'dress', 'perfume', 'snack', 'pillow', 'sofa', 'baby',
    'shampoo', 'lotion', 'vitamin', 'supplement', 'diaper', 'pet'
  ];
  
  if (blacklist.some(word => t.includes(word))) {
    // Exceptions: Baby monitors, Smart kitchen scales, etc.
    if (!t.includes('monitor') && !t.includes('smart') && !t.includes('camera') && !t.includes('scale')) {
       return false;
    }
  }
  return true;
}

// Heuristic-based Tech Categorization
function autoCategorizeTech(title, fallback) {
  const t = title.toLowerCase();
  if (t.includes('laptop') || t.includes('macbook') || t.includes('chromebook')) return 'Laptops';
  if (t.includes('monitor') || t.includes('display')) return 'Monitors';
  if (t.includes('smartphone') || t.includes('iphone') || t.includes('galaxy s') || t.includes('pixel')) return 'Smartphones';
  if (t.includes('headphone') || t.includes('earbud') || t.includes('speaker') || t.includes('airpod') || t.includes('soundbar')) return 'Audio';
  if (t.includes('drive') || t.includes('ssd') || t.includes('hdd') || t.includes('memory card') || t.includes('pendrive') || t.includes('flash drive')) return 'Storage';
  if (t.includes('processor') || t.includes('motherboard') || t.includes('ram ') || t.includes('gpu') || t.includes('rtx') || t.includes('graphics card')) return 'PC Parts';
  if (t.includes('smart watch') || t.includes('apple watch') || t.includes('fitness tracker')) return 'Wearables';
  if (t.includes('keyboard') || t.includes('mouse') || t.includes('webcam') || t.includes('docking station') || t.includes('cable')) return 'Accessories';
  if (t.includes('alexa') || t.includes('echo') || t.includes('smart home') || t.includes('smart plug') || t.includes('smart bulb')) return 'Smart Home';
  if (t.includes('playstation') || t.includes('xbox') || t.includes('nintendo') || t.includes('gaming console')) return 'Gaming';
  if (t.includes('fire tv') || t.includes('chromecast') || t.includes('streaming stick') || t.includes('apple tv')) return 'Streaming Devices';
  if (t.includes('printer') || t.includes('scanner') || t.includes('projector')) return 'Office Tech';
  
  return fallback && fallback !== 'Electronics' ? fallback : 'Electronics';
}

const fallbackProducts = [
  // Generic Fallbacks
  { id: 'B0CHX1W1XY', name: 'Apple iPhone 15 Pro (128 GB) - Natural Titanium', brand: 'Apple', category: 'Smartphones', rating: 4.8, reviews: 12450, originalPrice: 134900, discountedPrice: 127990, primeEligible: true, inStock: true, features: ['Forged in titanium', 'A17 Pro chip', '48MP Main camera'], amazonUrl: 'https://www.amazon.in/s?k=Apple+iPhone+15+Pro+128GB', imageUrl: 'https://m.media-amazon.com/images/I/81+GIkwqLIL._SX679_.jpg', tags: ['premium', 'smartphone'], couponCode: 'SAVE5000' },
  { id: 'B0B3CQBRB4', name: 'Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones', brand: 'Sony', category: 'Audio', rating: 4.6, reviews: 8900, originalPrice: 34990, discountedPrice: 29990, primeEligible: true, inStock: true, features: ['Industry leading noise cancellation', '30-hour battery life', 'Crystal clear hands-free calling'], amazonUrl: 'https://www.amazon.in/s?k=Sony+WH-1000XM5', imageUrl: 'https://m.media-amazon.com/images/I/51aXvjzcukL._SX679_.jpg', tags: ['audio', 'premium'], couponCode: null },
  { id: 'B0BMG3B38J', name: 'Samsung Galaxy S23 Ultra 5G (Green, 12GB, 256GB Storage)', brand: 'Samsung', category: 'Smartphones', rating: 4.7, reviews: 6540, originalPrice: 149999, discountedPrice: 124999, primeEligible: true, inStock: true, features: ['200MP camera', 'Snapdragon 8 Gen 2', 'S-Pen included'], amazonUrl: 'https://www.amazon.in/s?k=Samsung+Galaxy+S23+Ultra', imageUrl: 'https://m.media-amazon.com/images/I/61VfL-aiToL._SX679_.jpg', tags: ['premium', 'smartphone'], couponCode: 'SAMSUNG23' },
  { id: 'B0C781QQ1C', name: 'Dell XPS 15 9530 Laptop, Intel Core i7-13700H', brand: 'Dell', category: 'Laptops', rating: 4.5, reviews: 430, originalPrice: 254990, discountedPrice: 224990, primeEligible: true, inStock: true, features: ['15.6" OLED display', '16GB DDR5 RAM', '1TB SSD', 'RTX 4050'], amazonUrl: 'https://www.amazon.in/s?k=Dell+XPS+15', imageUrl: 'https://m.media-amazon.com/images/I/61Nl5c9vXJL._SX679_.jpg', tags: ['laptop', 'premium'], couponCode: 'DELLVIP' },
  { id: 'B0C9QPD6XZ', name: 'LG 27" Ultragear OLED QHD Gaming Monitor', brand: 'LG', category: 'Monitors', rating: 4.9, reviews: 120, originalPrice: 95000, discountedPrice: 82990, primeEligible: true, inStock: true, features: ['240Hz Refresh Rate', '0.03ms Response Time', 'G-Sync Compatible'], amazonUrl: 'https://www.amazon.in/s?k=LG+27+Ultragear+OLED', imageUrl: 'https://m.media-amazon.com/images/I/71wLpW80e+L._SX679_.jpg', tags: ['gaming', 'monitor'], couponCode: null },
  { id: 'B0BDHWDR12', name: 'Apple AirPods Pro (2nd Generation)', brand: 'Apple', category: 'Audio', rating: 4.8, reviews: 21500, originalPrice: 24900, discountedPrice: 20999, primeEligible: true, inStock: true, features: ['Active Noise Cancellation', 'Spatial Audio', 'MagSafe Charging Case'], amazonUrl: 'https://www.amazon.in/s?k=Apple+AirPods+Pro', imageUrl: 'https://m.media-amazon.com/images/I/61SUj2aKoEL._SX679_.jpg', tags: ['audio', 'apple'], couponCode: null },
  { id: 'B09F6VMM1R', name: 'Sony PlayStation 5 Console', brand: 'Sony', category: 'Gaming', rating: 4.9, reviews: 18000, originalPrice: 54990, discountedPrice: 49990, primeEligible: true, inStock: true, features: ['Ultra-High Speed SSD', 'Ray Tracing', '4K-TV Gaming'], amazonUrl: 'https://www.amazon.in/s?k=PlayStation+5', imageUrl: 'https://m.media-amazon.com/images/I/51mWHXY8hyL._SX679_.jpg', tags: ['gaming', 'console'], couponCode: 'GAMEON' },
  { id: 'B08L5P1TWD', name: 'Logitech MX Master 3S Wireless Mouse', brand: 'Logitech', category: 'Accessories', rating: 4.7, reviews: 9400, originalPrice: 10995, discountedPrice: 8995, primeEligible: true, inStock: true, features: ['8K DPI Track-on-Glass', 'Quiet Clicks', 'USB-C Rechargeable'], amazonUrl: 'https://www.amazon.in/s?k=Logitech+MX+Master+3S', imageUrl: 'https://m.media-amazon.com/images/I/61ni3t1ryQL._SX679_.jpg', tags: ['mouse', 'productivity'], couponCode: null },
  { id: 'B0C725Y23V', name: 'Samsung Galaxy Watch 6 Bluetooth (44mm)', brand: 'Samsung', category: 'Wearables', rating: 4.6, reviews: 3100, originalPrice: 33999, discountedPrice: 27999, primeEligible: true, inStock: true, features: ['Sleep Coaching', 'ECG Monitor', 'Sapphire Crystal Glass'], amazonUrl: 'https://www.amazon.in/s?k=Samsung+Galaxy+Watch+6', imageUrl: 'https://m.media-amazon.com/images/I/61L1ItFgFHL._SX679_.jpg', tags: ['smartwatch', 'wearable'], couponCode: 'WATCH500' },
  
  // Storage Fallbacks
  { id: 'B07D7PDLXC', name: 'SanDisk Ultra Dual Drive Go 128GB Type C Pendrive', brand: 'SanDisk', category: 'Storage', rating: 4.3, reviews: 45000, originalPrice: 2200, discountedPrice: 899, primeEligible: true, inStock: true, features: ['USB 3.1', 'Type-C Reversible', '150MB/s Read Speed'], amazonUrl: '#', imageUrl: 'https://m.media-amazon.com/images/I/614P8ZgT4BL._SX679_.jpg', tags: ['pendrive', 'storage'], couponCode: null },
  { id: 'B09B1GXM16', name: 'Samsung EVO Plus 128GB microSDXC', brand: 'Samsung', category: 'Storage', rating: 4.5, reviews: 32000, originalPrice: 2699, discountedPrice: 1199, primeEligible: true, inStock: true, features: ['UHS-I U3', '130MB/s', '4K UHD'], amazonUrl: '#', imageUrl: 'https://m.media-amazon.com/images/I/61fkpjI61QL._SX679_.jpg', tags: ['memory card', 'storage'], couponCode: null },
  { id: 'B07VTWX8MZ', name: 'WD My Passport 1TB Portable External HDD', brand: 'Western Digital', category: 'Storage', rating: 4.4, reviews: 21000, originalPrice: 6500, discountedPrice: 4799, primeEligible: true, inStock: true, features: ['256-bit AES encryption', 'SuperSpeed USB', 'Slim design'], amazonUrl: '#', imageUrl: 'https://m.media-amazon.com/images/I/81M6b63d-zL._SX679_.jpg', tags: ['hdd', 'storage'], couponCode: 'WDSAVE' },

  // PC Parts Fallbacks
  { id: 'B0C4Z4FB6C', name: 'NVIDIA GeForce RTX 4060 Ti 8GB Graphic Card', brand: 'NVIDIA', category: 'PC Parts', rating: 4.6, reviews: 1200, originalPrice: 45000, discountedPrice: 38990, primeEligible: true, inStock: true, features: ['DLSS 3', 'Ray Tracing', '8GB GDDR6'], amazonUrl: '#', imageUrl: 'https://m.media-amazon.com/images/I/612hBw-i61L._SX679_.jpg', tags: ['gpu', 'pc parts'], couponCode: 'RTXON' },
  { id: 'B0B9G5D9H3', name: 'Intel Core i5-13600K Desktop Processor', brand: 'Intel', category: 'PC Parts', rating: 4.8, reviews: 850, originalPrice: 35000, discountedPrice: 28499, primeEligible: true, inStock: true, features: ['14 cores', 'Up to 5.1 GHz', 'PCIe 5.0'], amazonUrl: '#', imageUrl: 'https://m.media-amazon.com/images/I/61Nl5c9vXJL._SX679_.jpg', tags: ['cpu', 'pc parts'], couponCode: null },

  // Smart Home & Streaming Fallbacks
  { id: 'B084J4G211', name: 'Echo Dot (4th Gen) | Smart speaker with Alexa', brand: 'Amazon', category: 'Smart Home', rating: 4.4, reviews: 85000, originalPrice: 4499, discountedPrice: 3299, primeEligible: true, inStock: true, features: ['Voice control', 'Smart home hub', 'Alexa built-in'], amazonUrl: '#', imageUrl: 'https://m.media-amazon.com/images/I/61KIy6gX-CL._SX679_.jpg', tags: ['alexa', 'smart home'], couponCode: null },
  { id: 'B08XVYZ1Y5', name: 'Fire TV Stick 4K with all-new Alexa Voice Remote', brand: 'Amazon', category: 'Streaming', rating: 4.6, reviews: 45000, originalPrice: 5999, discountedPrice: 4299, primeEligible: true, inStock: true, features: ['Dolby Vision', 'Wi-Fi 6', '4K Ultra HD'], amazonUrl: '#', imageUrl: 'https://m.media-amazon.com/images/I/51wU+Z9oTLL._SX679_.jpg', tags: ['firestick', 'streaming'], couponCode: 'FIRE4K' },

  // Creator Tech Fallbacks
  { id: 'B00N1YPXW2', name: 'Blue Yeti USB Microphone', brand: 'Logitech', category: 'Creator Tech', rating: 4.5, reviews: 18000, originalPrice: 12995, discountedPrice: 10495, primeEligible: true, inStock: true, features: ['Four Pickup Patterns', 'Zero-latency monitoring', 'Plug-n-play'], amazonUrl: '#', imageUrl: 'https://m.media-amazon.com/images/I/61Q6D+H2ZzL._SX679_.jpg', tags: ['microphone', 'creator'], couponCode: null },
  { id: 'B006JH8T3S', name: 'Logitech C920 HD Pro Webcam', brand: 'Logitech', category: 'Creator Tech', rating: 4.6, reviews: 22000, originalPrice: 8995, discountedPrice: 6495, primeEligible: true, inStock: true, features: ['Full HD 1080p', 'Stereo audio', 'Auto light correction'], amazonUrl: '#', imageUrl: 'https://m.media-amazon.com/images/I/71iNwnHT3IL._SX679_.jpg', tags: ['webcam', 'creator'], couponCode: null }
];

export function getFallbackProducts(keyword = '') {
  const k = keyword.toLowerCase();
  
  if (k.includes('sale') || k.includes('flash') || k.includes('lightning')) {
    return [fallbackProducts[0], fallbackProducts[1], fallbackProducts[5], fallbackProducts[8], fallbackProducts[6]];
  }
  if (k.includes('trending') || k.includes('popular') || k.includes('best selling') || k.includes('laptops')) {
    return [fallbackProducts[2], fallbackProducts[3], fallbackProducts[6], fallbackProducts[4], fallbackProducts[0]];
  }
  if (k.includes('1000') || k.includes('budget') || k.includes('under')) {
    return [fallbackProducts[7], fallbackProducts[5], fallbackProducts[8], fallbackProducts[4], fallbackProducts[1]];
  }
  
  // Storage
  if (k.includes('flash drive') || k.includes('pendrive')) {
    return [fallbackProducts.find(p => p.id === 'B07D7PDLXC')];
  }
  if (k.includes('memory card')) {
    return [fallbackProducts.find(p => p.id === 'B09B1GXM16')];
  }
  if (k.includes('hard drive') || k.includes('hdd')) {
    return [fallbackProducts.find(p => p.id === 'B07VTWX8MZ')];
  }
  
  // PC Parts
  if (k.includes('graphic') || k.includes('pc') || k.includes('processor')) {
    return [
      fallbackProducts.find(p => p.id === 'B0C4Z4FB6C'),
      fallbackProducts.find(p => p.id === 'B0B9G5D9H3')
    ].filter(Boolean);
  }
  
  // Smart Home & Streaming
  if (k.includes('smart home') || k.includes('alexa')) {
    return [fallbackProducts.find(p => p.id === 'B084J4G211')];
  }
  if (k.includes('fire tv') || k.includes('chromecast')) {
    return [fallbackProducts.find(p => p.id === 'B08XVYZ1Y5')];
  }
  
  // Creator Tech
  if (k.includes('stream') || k.includes('microphone') || k.includes('webcam')) {
    return [
      fallbackProducts.find(p => p.id === 'B00N1YPXW2'),
      fallbackProducts.find(p => p.id === 'B006JH8T3S')
    ].filter(Boolean);
  }
  
  return fallbackProducts.slice(0, 5);
}

export async function searchAmazonProducts(keyword, category = 'Electronics', options = {}) {
  try {
    // Attempt to scrape Amazon for free
    console.log(`[Scraper] Fetching live data for "${keyword}"...`);
    const scrapedData = await scrapeAmazonSearch(keyword);
    
    if (scrapedData && Array.isArray(scrapedData)) {
      let products = formatAmazonResponse(scrapedData);
      if (options.maxPrice) {
        products = products.filter(p => p.discountedPrice <= options.maxPrice);
      }
      return products.length > 0 ? products.slice(0, 15) : null;
    }
    
    console.warn(`[Scraper] Failed or blocked for "${keyword}". Triggering static fallbacks.`);
    return null;
  } catch (error) {
    console.error("Amazon Scraper Search Error:", error);
    return null;
  }
}

export async function getAmazonProductByASIN(asin) {
  try {
    console.log(`[Scraper] Fetching product details for ASIN ${asin}...`);
    const scrapedDetails = await scrapeAmazonProductDetails(asin);
    
    if (scrapedDetails) {
      return formatDetailedResponse(scrapedDetails);
    }
    
    console.warn(`[Scraper] Blocked or failed for ASIN ${asin}. Returning fallback.`);
    return fallbackProducts.find(p => p.id === asin) || fallbackProducts[0];
  } catch (error) {
    console.error("Scraper Details Error:", error);
    return fallbackProducts.find(p => p.id === asin) || fallbackProducts[0];
  }
}

// Format the `search` endpoint results
function formatAmazonResponse(items) {
  return items.filter(item => isTechProduct(item.product_title)).map(item => {
    const price = parsePrice(item.product_price);
    const originalPrice = parsePrice(item.product_original_price) || price;
    
    return {
      id: item.asin,
      name: decodeHtmlEntities(item.product_title) || 'Unknown Product',
      brand: 'Amazon Partner', // RapidAPI search doesn't easily expose Brand
      category: autoCategorizeTech(item.product_title, 'Electronics'),
      rating: parseFloat(item.product_star_rating) || 4.0,
      reviews: parseInt((item.product_num_ratings || '0').toString().replace(/,/g, ''), 10) || 0,
      originalPrice: originalPrice,
      discountedPrice: price,
      primeEligible: item.is_prime || false,
      inStock: true,
      features: [], // No features in search list
      amazonUrl: item.product_url,
      imageUrl: item.product_photo || getAiImageUrl(item.product_title),
      tags: [], 
      // STRICT POLICY: No fake coupons. If the API doesn't provide it, it's null.
      couponCode: item.coupon_text || null 
    };
  });
}

// Format the `product-details` endpoint result
function formatDetailedResponse(item) {
  if (!isTechProduct(item.product_title, item.category?.name)) return null;

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
    category: autoCategorizeTech(item.product_title, item.category?.name),
    rating: parseFloat(item.product_star_rating) || 4.0,
    reviews: item.product_num_ratings || 0, 
    originalPrice: originalPrice,
    discountedPrice: price,
    primeEligible: item.is_prime || false,
    inStock: true,
    features: Array.isArray(item.about_product) ? item.about_product : (typeof item.about_product === 'string' ? [item.about_product] : []), 
    amazonUrl: item.product_url,
    imageUrl: item.product_photo || getAiImageUrl(item.product_title),
    tags: [], 
    couponCode: realCoupon
  };
}
