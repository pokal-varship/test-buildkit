import { useCallback, useRef } from 'react';
import { LRUCache } from 'lru-cache';
import { getProductDetails } from '@services/pdp';
import { ProductResponse } from '@components/type/pdp.type';

const CACHE_MAX_SIZE = 100; // Maximum number of items to store in cache
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes TTL

const options = {
  max: CACHE_MAX_SIZE,
  ttl: CACHE_TTL,
};

export const useProductCache = () => {
  const cacheRef = useRef<LRUCache<string, ProductResponse>>(new LRUCache(options));

  const getCachedProduct = useCallback(async (
    categoryId: string,
    productId: string,
    storeId: string
  ): Promise<ProductResponse> => {
    const cacheKey = `${storeId}:${categoryId}:${productId}`;
    const cache = cacheRef.current;
    
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const productData = await getProductDetails(categoryId, productId, storeId);
    cache.set(cacheKey, productData);
    return productData;
  }, []);

  return {
    getCachedProduct,
  };
}; 