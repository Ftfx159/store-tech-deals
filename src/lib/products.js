import { searchAmazonProducts, getAmazonProductByASIN, getFallbackProducts } from './amazonApi';
import { prisma } from '@/lib/prisma';

// Helper function to sync and cache live data
export async function fetchAndCacheProducts(query, options = {}) {
  const normalizedQuery = query.toLowerCase().trim();

  try {
    // 1. Try to find in Database (Intelligent Caching)
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

    // Check if we have recent enough results (within 24 hours)
    const hasValidCache = cachedProducts.length > 0 && 
      (new Date() - new Date(cachedProducts[0].lastUpdated)) < 24 * 60 * 60 * 1000;

    if (hasValidCache) {
      console.log(`[Cache Hit] Serving "${query}" from local database.`);
      return cachedProducts;
    }

    // 2. Fetch Live from Amazon API
    console.log(`[Cache Miss] Fetching live data from Amazon for "${query}"`);
    const liveProducts = await searchAmazonProducts(query, 'Electronics', options);

    if (!liveProducts || liveProducts.length === 0) {
      if (cachedProducts.length === 0) {
        // Fallback to static data if both DB and API fail, but DO NOT CACHE it
        return getFallbackProducts(query);
      }
      return cachedProducts;
    }

    // 3. Save / Update in Database asynchronously
    const savedProducts = [];
    for (const p of liveProducts) {
      try {
        const upsertedProduct = await prisma.product.upsert({
          where: { id: p.id },
          update: {
            name: p.name,
            brand: p.brand || null,
            category: p.category || null,
            rating: p.rating || 0,
            reviews: p.reviews || 0,
            originalPrice: p.originalPrice || p.discountedPrice,
            discountedPrice: p.discountedPrice,
            primeEligible: p.primeEligible || false,
            inStock: p.inStock !== false,
            imageUrl: p.imageUrl,
            amazonUrl: p.amazonUrl,
            couponCode: p.couponCode || null,
            searchQuery: normalizedQuery,
            lastUpdated: new Date()
          },
          create: {
            id: p.id,
            name: p.name,
            brand: p.brand || null,
            category: p.category || null,
            rating: p.rating || 0,
            reviews: p.reviews || 0,
            originalPrice: p.originalPrice || p.discountedPrice,
            discountedPrice: p.discountedPrice,
            primeEligible: p.primeEligible || false,
            inStock: p.inStock !== false,
            features: p.features ? JSON.stringify(p.features) : null,
            amazonUrl: p.amazonUrl,
            imageUrl: p.imageUrl,
            tags: p.tags ? JSON.stringify(p.tags) : null,
            couponCode: p.couponCode || null,
            searchQuery: normalizedQuery
          }
        });
        savedProducts.push(upsertedProduct);
      } catch (dbErr) {
        console.error(`Failed to save product ${p.id} to DB:`, dbErr);
        // still return the live product even if DB fails
        savedProducts.push(p); 
      }
    }

    return savedProducts;
  } catch (err) {
    console.error("Error in fetchAndCacheProducts:", err);
    return await searchAmazonProducts(query, 'Electronics', options); // Fallback directly to API
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
    // Try DB first
    const cachedProduct = await prisma.product.findUnique({ where: { id } });
    if (cachedProduct && (new Date() - new Date(cachedProduct.lastUpdated)) < 24 * 60 * 60 * 1000) {
      return cachedProduct;
    }
  } catch(e) {}
  
  const product = await getAmazonProductByASIN(id);
  if (product && product.id) {
    // Fire and forget save
    prisma.product.upsert({
      where: { id: product.id },
      update: { discountedPrice: product.discountedPrice, inStock: product.inStock, lastUpdated: new Date() },
      create: { ...product, originalPrice: product.originalPrice || product.discountedPrice, searchQuery: 'ASIN_LOOKUP' }
    }).catch(() => {});
  }
  return product;
}

export async function getFlashDeals() {
  const generalDeals = await fetchAndCacheProducts("clearance electronics sale");
  const storageDeals = await fetchAndCacheProducts("pendrive memory card ssd sale deals");
  
  const liveData = [...(generalDeals || []), ...(storageDeals || [])];
  
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
