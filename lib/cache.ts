import { LRUCache } from 'lru-cache';
import { getProductDetails } from '@services/pdp';
import { ProductResponse } from '@components/type/pdp.type';

// Create LRU cache instance with 5 minute TTL
const productCache = new LRUCache<string, ProductResponse>({
  max: 500, // Maximum number of items to store in cache
  ttl: 1000 * 60 * 5, // 5 minutes in milliseconds
});

export const getCachedProductDetails = async (
  categoryId: string,
  productId: string,
  storeId: string
) => {
  const cacheKey = `product:${categoryId}:${productId}:${storeId}`;
  
  // Try to get from cache first
  const cachedData = productCache.get(cacheKey);
  if (cachedData) {

    return cachedData;
  }

  try {
    // If not in cache, fetch from API
    const productDetails = await getProductDetails(categoryId, productId, storeId);
    
    // Store in cache if we got valid data
    if (productDetails?.data) {
      productCache.set(cacheKey, productDetails);
    }
    
    return productDetails;
  } catch {
    // Error handled silently
    return null;
  }
};

// Helper function to clear cache if needed
export const clearProductCache = () => {
  productCache.clear();
}; 