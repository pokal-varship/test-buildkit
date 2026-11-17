/**
 * Simple hook for fetching product store availability
 */

import { useState, useCallback } from 'react';

export const useProductStoreAvailability = () => {
  const [stores, setStores] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductStores = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      const {getProductStores} = await import('@services/location');
      const response = await getProductStores(productId);
      setStores(response.data || []);
      return response; // Return the response
    } catch (err) {
      setError('Failed to fetch product stores');

      throw err; // Re-throw the err
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stores,
    loading,
    error,
    fetchProductStores,
  };
};
