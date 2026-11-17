import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { convertWishlistArrayToTypesenseProducts, WishlistItem } from '../utils/wishlistToTypesenseConverter';
import { TypesenseProduct } from '@services/typesense/types';
import { useWishlist } from '@hooks/useWishlist';
import { selectRawWishlistData } from '@redux/slices/wishlistSlice';

export const useRawWishlist = () => {
  // Use existing wishlist hook to trigger data loading
  const { wishlistLoading, wishlistError } = useWishlist();
  
  // Get raw API data from Redux store
  const rawWishlistData = useSelector(selectRawWishlistData);
  
  const favouriteProducts = useMemo((): TypesenseProduct[] => {
    if (!rawWishlistData?.length) return [];
    
    try {
      return convertWishlistArrayToTypesenseProducts(rawWishlistData as unknown as WishlistItem[]);
    } catch (error) {
      console.warn('Failed to convert wishlist data:', error);
      return [];
    }
  }, [rawWishlistData]);

  return { 
    favouriteProducts, 
    loading: wishlistLoading, 
    error: wishlistError ? new Error(wishlistError) : null,
    refetch: () => {} // Handled by useWishlist
  };
};
