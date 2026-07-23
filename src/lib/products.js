import { searchAmazonProducts, getAmazonProductByASIN } from './amazonApi';

// No more mock local coupons or fake generated coupons.
// The data returned from amazonApi.js is 100% real RapidAPI data.

export async function getProductsByTag(tag) {
  // Convert tag to a search query for Amazon PA API
  const queryMap = {
    "Lightning Deals": "lightning deals electronics",
    "Trending Products": "best selling laptops",
    "Under ₹1000": "electronics under 1000",
  };
  
  const query = queryMap[tag] || tag;
  const liveData = await searchAmazonProducts(query);
  return liveData; // Return directly, no more applyLocalCoupons
}

export async function getProductById(id) {
  const product = await getAmazonProductByASIN(id);
  return product; // Return directly
}

export async function getFlashDeals() {
  // Fetch from computers and electronics categories
  const queries = ["laptops", "smartphones", "headphones"];
  // Randomly pick one query to keep the flash deals fresh, or we could fetch all and combine.
  // For simplicity and speed, we will fetch 'computers and electronics'
  const liveData = await searchAmazonProducts("computers electronics", "Electronics");
  
  if (!liveData) return [];

  // Filter out products with less than 30% discount
  const flashDeals = liveData.filter(product => {
    if (!product.originalPrice || !product.discountedPrice) return false;
    const discountPercentage = Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100);
    return discountPercentage >= 30; // 30% threshold
  });

  // Sort by highest discount
  flashDeals.sort((a, b) => {
    const aDiscount = ((a.originalPrice - a.discountedPrice) / a.originalPrice);
    const bDiscount = ((b.originalPrice - b.discountedPrice) / b.originalPrice);
    return bDiscount - aDiscount;
  });

  return flashDeals.slice(0, 8); // Return top 8 deals
}

export async function searchProducts(query) {
  let maxPrice = null;
  let keyword = query;

  // Handle price filters properly
  if (query === 'under1000') { maxPrice = 1000; keyword = "gadgets"; }
  else if (query === 'under5000') { maxPrice = 5000; keyword = "electronics"; }
  else if (query === 'under10000') { maxPrice = 10000; keyword = "smartphones"; }
  else if (query === 'premium') { keyword = "premium tech"; }

  // Try to use live API wrapper
  const amazonResults = await searchAmazonProducts(keyword, 'Electronics', { maxPrice });
  return amazonResults || [];
}

// Fallback to fetch some default trending items if no query is given
export async function getTrendingProducts() {
  const liveData = await searchAmazonProducts("popular electronics", "Electronics");
  return liveData;
}
