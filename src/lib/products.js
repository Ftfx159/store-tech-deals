import { searchAmazonProducts, getAmazonProductByASIN, getFallbackProducts } from './amazonApi';
import { performFuzzySearch } from './searchEngine';
import { prisma } from '@/lib/prisma';

// Helper function to sync and cache live data
function parseProductFields(product) {
  if (typeof product.features === 'string') {
    try { product.features = JSON.parse(product.features); } catch(e) { product.features = []; }
  }
  if (typeof product.tags === 'string') {
    try { product.tags = JSON.parse(product.tags); } catch(e) { product.tags = []; }
  }
  return product;
}

export async function fetchAndCacheProducts(query, options = {}) {
  const normalizedQuery = query.toLowerCase().trim();

  try {
    // 1. Instantly Serve from Database
    const cachedProducts = await prisma.product.findMany({
      where: {
        searchQuery: normalizedQuery,
        inStock: true
      },
      orderBy: {
        lastUpdated: 'desc'
      },
      take: 20
    });

    if (cachedProducts && cachedProducts.length > 0) {
      if (options.maxPrice) {
        return cachedProducts.map(parseProductFields).filter(p => p.discountedPrice <= options.maxPrice);
      }
      return cachedProducts.map(parseProductFields);
    }

    // 2. Cache Miss: DO NOT Scrape On-Demand! 
    // Fallback instantly to static data so the UI doesn't hang. The background Cron job will populate the real data.
    return getFallbackProducts(query);
  } catch (err) {
    console.error("Error in fetchAndCacheProducts:", err);
    return getFallbackProducts(query);
  }
}

export async function getProductsByTag(tag) {
  // Convert tag to a search query for Amazon PA API
  const queryMap = {
    "Lightning Deals": "electronics sale",
    "Trending Products": "best selling laptops",
    "Under ₹1000": "gadgets under 1000",
    "Pendrives & Storage": "usb flash drive",
    "Memory Cards": "micro sd memory card",
    "PC Components": "pc graphics card processor",
    "Smart Home": "smart home devices alexa",
    "Creator Tech": "streaming microphone webcam",
    "External HDDs": "external hard drive 1tb",
    "Streaming Devices": "amazon fire tv stick",
    "Google Products": "google nest chromecast",
  };
  
  const query = queryMap[tag] || tag;
  return await fetchAndCacheProducts(query);
}

export async function getProductById(id) {
  try {
    // Instantly Serve from DB
    const cachedProduct = await prisma.product.findUnique({ where: { id } });
    if (cachedProduct) {
      return parseProductFields(cachedProduct);
    }
  } catch(e) {
    console.error(e);
  }
  
  // Cache miss - fallback without blocking scraping
  return getFallbackProducts(id)[0];
}

export async function getFlashDeals() {
  const generalDeals = await fetchAndCacheProducts("clearance electronics sale");
  const storageDeals = await fetchAndCacheProducts("pendrive memory card ssd sale deals");
  
  let liveData = [...(generalDeals || []), ...(storageDeals || [])];
  
  // Deduplicate merged deals
  if (liveData.length > 0) {
    liveData = Array.from(new Map(liveData.map(p => [p.id, p])).values());
  }
  
  if (!liveData || liveData.length === 0) return [];

  // Filter out products with less than 15% discount to be more realistic for premium tech
  let flashDeals = liveData.filter(product => {
    if (!product.originalPrice || !product.discountedPrice) return false;
    const discountPercentage = Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100);
    return discountPercentage >= 15; // Lowered to 15% threshold
  });

  // If strict filtering resulted in no deals, just take all valid products
  if (flashDeals.length === 0) {
    flashDeals = liveData.filter(p => p.originalPrice && p.discountedPrice && p.originalPrice > p.discountedPrice);
  }

  // Sort by highest discount
  flashDeals.sort((a, b) => {
    const aDiscount = ((a.originalPrice - a.discountedPrice) / a.originalPrice);
    const bDiscount = ((b.originalPrice - b.discountedPrice) / b.originalPrice);
    return bDiscount - aDiscount;
  });

  return flashDeals.slice(0, 15); // Return top 15 deals
}

export async function searchProducts(query) {
  let maxPrice = null;
  let keyword = query;

  // Handle price filters properly
  if (query === 'under1000') { maxPrice = 1000; keyword = "gadgets"; }
  else if (query === 'under5000') { maxPrice = 5000; keyword = "electronics"; }
  else if (query === 'under10000') { maxPrice = 10000; keyword = "smartphones"; }
  else if (query === 'premium') { keyword = "premium tech"; }

  // Advanced Fuzzy Search (Typo-Tolerant Semantic Matching)
  if (!maxPrice && query) {
    try {
      const allProducts = await prisma.product.findMany({ 
        where: { inStock: true },
        orderBy: { lastUpdated: 'desc' }
      });
      const parsedProducts = allProducts.map(parseProductFields);
      
      const fuzzyResults = performFuzzySearch(parsedProducts, query);
      
      // If we found solid local matches, return them instantly without hitting Amazon!
      if (fuzzyResults.length >= 4) {
        console.log(`[Fuzzy Search] Found ${fuzzyResults.length} instant semantic matches for "${query}"`);
        return fuzzyResults.slice(0, 20);
      }
    } catch(e) {
      console.error("[Fuzzy Search Error]", e);
    }
  }

  // Fallback: Fetch Live from Amazon if no local semantic match was strong enough
  return await fetchAndCacheProducts(keyword, { maxPrice });
}

// Fallback to fetch some default trending items if no query is given
export async function getTrendingProducts() {
  return await fetchAndCacheProducts("popular electronics");
}

export function getActiveSaleEvent() {
  const month = new Date().getMonth(); // 0-indexed (0 = Jan, 11 = Dec)
  
  if (month >= 3 && month <= 5) {
    return { name: "Amazon Summer Sale Live!", query: "amazon summer sale tech deals" };
  } else if (month >= 8 && month <= 9) {
    return { name: "Great Indian Festival Deals", query: "amazon great indian festival tech" };
  } else if (month === 10) {
    return { name: "Black Friday & Cyber Monday", query: "black friday cyber monday tech deals" };
  } else if (month === 11 || month === 0) {
    return { name: "New Year Tech Blowout", query: "new year tech sale" };
  } else {
    return { name: "Amazon Super Value Days", query: "super value days tech deals" };
  }
}
