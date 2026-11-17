import { useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@redux/store';
import { syncTypesenseLikeCount } from '@redux/slices/wishlistSlice';

interface UseProductLikeCountProps {
  productId: string;
  typesenseLikeCount?: number;
}

/**
 * Hook to get consistent like count for a product across PLP and PDP
 * Uses Typesense API like count as the source of truth
 * Redux is the single source of truth, so no localStorage fallback needed
 */
export const useProductLikeCount = ({ 
  productId, 
  typesenseLikeCount = 0 
}: UseProductLikeCountProps) => {
  const dispatch = useDispatch();
  const wishlistItem = useSelector((state: RootState) => 
    state.wishlist.items.find(item => item.id === productId)
  );

  // Normalize Typesense count to ensure it's a valid number
  const normalizedTypesenseCount = useMemo(() => {
    if (typesenseLikeCount === undefined || typesenseLikeCount === null) {
      return 0;
    }
    const num = Number(typesenseLikeCount);
    return isNaN(num) ? 0 : Math.max(0, num);
  }, [typesenseLikeCount]);

  // Sync Typesense like count when product is displayed and has Typesense data
  useEffect(() => {
    if (productId && normalizedTypesenseCount >= 0) {
      // Sync Typesense count to Redux for reference
      dispatch(syncTypesenseLikeCount({ 
        productId, 
        typesenseLikeCount: normalizedTypesenseCount
      }));
    }
  }, [productId, normalizedTypesenseCount, dispatch]);

  // Get Typesense like count from props or wishlist enhanced data
  const enhancedTypesenseCount = useMemo(() => {
    // First priority: Use the normalized Typesense count (most current API data)
    if (normalizedTypesenseCount > 0) {
      return normalizedTypesenseCount;
    }
    
    // Second priority: Use enhanced wishlist data if available
    if (wishlistItem?.fullProductData?.totalLikes !== undefined) {
      const fullDataCount = Number(wishlistItem.fullProductData.totalLikes);
      return isNaN(fullDataCount) ? 0 : Math.max(0, fullDataCount);
    }
    
    // Final fallback: return 0 if no data available
    return 0;
  }, [wishlistItem, normalizedTypesenseCount]);

  const totalLikeCount = useMemo(() => {
    const isRealLikedItem = wishlistItem && wishlistItem.name !== `Product ${wishlistItem.id}`;
    const isTempItem = wishlistItem && wishlistItem.name === `Product ${wishlistItem.id}`;
    
    if (enhancedTypesenseCount > 0) {
      // Preserve optimistic updates from Redux (both real liked items and temp items)
      if (wishlistItem && wishlistItem.likeCount !== undefined) {
        // For real liked items: use Redux if higher than Typesense (optimistic like)
        if (isRealLikedItem) {
          if (wishlistItem.likeCount > enhancedTypesenseCount && wishlistItem.likeCount > 1) {
            return wishlistItem.likeCount;
          }
        }
        // For temp items: use Redux if different from Typesense (optimistic unlike)
        if (isTempItem && wishlistItem.likeCount !== enhancedTypesenseCount) {
          return wishlistItem.likeCount;
        }
      }
      return Number(enhancedTypesenseCount);
    }
    
    if (wishlistItem?.likeCount !== undefined && wishlistItem.likeCount >= 0) {
      return wishlistItem.likeCount;
    }
    
    return 0;
  }, [wishlistItem, enhancedTypesenseCount]);

  // Whether the product is in wishlist
  const isInWishlist = useMemo(() => !!wishlistItem && wishlistItem.name !== `Product ${wishlistItem.id}`, [wishlistItem]);

  // Ensure we always return a valid number
  const finalTotalLikeCount = Math.max(0, totalLikeCount || 0);
  
  return {
    totalLikeCount: finalTotalLikeCount,
    isInWishlist,
    typesenseLikeCount: enhancedTypesenseCount,
  };
};