import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { 
  selectWishlistItems,
  selectWishlistItemCount,
  toggleProductLike as toggleProductLikeAction,
  setWishlistLoading,
  setWishlistError,
  setWishlist,
  setRawWishlistData,
  WishlistItem 
} from '@redux/slices/wishlistSlice';
import { RootState } from '@redux/store';
import { addToWishlist as addToWishlistAPI, removeFromWishlist as removeFromWishlistAPI, getWishlist } from '@services/wishlist';
import { useToast } from '@components/toast/Toast';
import useLang from '@hooks/useLang';
import { useAuth } from '@hooks/useAuth';

// Global singleton state to prevent multiple API calls across hook instances
const globalWishlistState = {
  isFetching: false,
  lastFetchTime: 0,
  isInitialized: false,
  currentStoreId: null as string | null,
  currentPath: null as string | null,
};

// Cooldown between API calls (5 seconds)
const FETCH_COOLDOWN = 5000;

export const useWishlist = () => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector(selectWishlistItems);
  const wishlistCount = useSelector(selectWishlistItemCount);
  const wishlistLoading = useSelector((state: RootState) => state.wishlist.loading);
  const wishlistError = useSelector((state: RootState) => state.wishlist.error);
  const store = useSelector((state: RootState) => state.store);
  const toast = useToast();
  const [lang] = useLang();
  const isUpdatingRef = useRef(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const isWishlistPage = pathname?.includes('/wishlist');

  // Clear cached data when navigating to wishlist page or when auth status changes
  useEffect(() => {
    if (isWishlistPage && globalWishlistState.currentPath !== pathname) {
      Object.assign(globalWishlistState, {
        isInitialized: false,
        isFetching: false,
        lastFetchTime: 0,
      });
    }
    // Reset initialization when user logs in/out to ensure fresh data
    if (!isAuthenticated && globalWishlistState.isInitialized) {
      Object.assign(globalWishlistState, {
        isInitialized: false,
        isFetching: false,
        lastFetchTime: 0,
      });
      dispatch(setWishlist([]));
    }
  }, [isWishlistPage, pathname, isAuthenticated, dispatch]);

  // Load wishlist data when authenticated (not just on wishlist page)
  useEffect(() => {
    const loadWishlistData = async () => {
      const storefrontId = store?.currentStore?.id;
      // Only load if authenticated and store is available
      if (!storefrontId || !isAuthenticated) {
        // Clear wishlist if user is not authenticated (handled in the auth change effect above)
        return;
      }

      const isNewStore = globalWishlistState.currentStoreId !== storefrontId;
      const isNewRoute = globalWishlistState.currentPath !== pathname;
      
      if (isNewStore || isNewRoute) {
        Object.assign(globalWishlistState, {
          currentStoreId: storefrontId,
          currentPath: pathname,
          isInitialized: false,
          isFetching: false,
          lastFetchTime: 0,
        });
      }

      const shouldForceFetch = isWishlistPage && isNewRoute;
      const now = Date.now();
      const shouldLoad = shouldForceFetch || (!globalWishlistState.isInitialized && isAuthenticated);
      
      if (globalWishlistState.isFetching || 
          (!shouldLoad && now - globalWishlistState.lastFetchTime < FETCH_COOLDOWN) ||
          (globalWishlistState.isInitialized && !shouldLoad)) {
        return;
      }

      try {
        Object.assign(globalWishlistState, {
          isFetching: true,
          lastFetchTime: now,
        });
        dispatch(setWishlistLoading(true));
        
        const response = await getWishlist(storefrontId, undefined, 100, 0);
        
        let wishlistData = response;
        if (response && response.data) {
          wishlistData = response.data;
        }
        
        // Store raw API data for conversion (clear when API returns empty/204 so we don't show another store's count)
        if (wishlistData && Array.isArray(wishlistData)) {
          dispatch(setRawWishlistData(wishlistData));
        } else {
          dispatch(setRawWishlistData([]));
        }
        
        if (wishlistData && Array.isArray(wishlistData)) {
          const basicWishlistItems: WishlistItem[] = wishlistData
            .map((item: Record<string, unknown>) => {
              const productId = (item.productId || item.id || item.product_id) as string;
              const name = (item.name || item.productName || item.product_name || item.title) as string;
              const price = (item.price || item.basePrice || item.base_price || item.cost || 0) as number;
              const media = item.media as Array<{ url: string }> | undefined;
              const imageUrl = (item.imageUrl || item.image_url || item.image || (media && media[0]?.url)) as string | undefined;
              
              if (productId) {
                const itemName = name || `Wishlist Item ${productId}`;
                return {
                  id: productId,
                  name: itemName,
                  price: price || 0,
                  imageUrl: imageUrl,
                  addedAt: item.addedAt || item.added_at || item.createdAt || Date.now(),
                  likeCount: 1,
                } as WishlistItem;
              }
              return null;
            })
            .filter(Boolean) as WishlistItem[];
          
          if (basicWishlistItems.length > 0) {
            // Don't enhance here - let components handle filtering via Typesense API
            // This prevents duplicate multi_search calls
            dispatch(setWishlist(basicWishlistItems));
          } else {
            dispatch(setWishlist([]));
          }
        } else {
          dispatch(setWishlist([]));
        }
        
        Object.assign(globalWishlistState, { isInitialized: true });
      } catch {
        dispatch(setWishlistError('Failed to load wishlist data'));
      } finally {
        dispatch(setWishlistLoading(false));
        Object.assign(globalWishlistState, { isFetching: false });
      }
    };

    // Load wishlist data when authenticated (not just on wishlist page)
    if (isAuthenticated && store?.currentStore?.id) {
      loadWishlistData();
    }
  }, [store?.currentStore?.id, pathname, isWishlistPage, isAuthenticated, dispatch]);

  // Refresh wishlist
  const refreshWishlist = useCallback(async (force = false) => {
    if (force) {
      Object.assign(globalWishlistState, { 
        isInitialized: false,
        currentPath: pathname
      });
    }
  }, [pathname]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlistItems.some(item => item.id === productId);
  }, [wishlistItems]);

  const toggleProductLike = useCallback(async (product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    totalLikes?: number;
  }) => {
    const storefrontId = store?.currentStore?.id;
    if (!storefrontId) {
      toast('error', lang?.somethingWentWrong || 'Store information not available');
      return;
    }

    if (isUpdatingRef.current) {
      toast('info', 'Please wait, operation in progress...');
      return;
    }

    const isCurrentlyInWishlist = isInWishlist(product.id);

    try {
      isUpdatingRef.current = true;
      
      if (isCurrentlyInWishlist) {
        await removeFromWishlistAPI(storefrontId, product.id);
        toast('success', `${product.name} removed from wishlist`);
      } else {
        await addToWishlistAPI(storefrontId, product.id);
        toast('success', `${product.name} added to wishlist`);
      }
      
      dispatch(toggleProductLikeAction({
        ...product,
        totalLikes: product.totalLikes || 0,
      }));

      // Refetch wishlist so rawWishlistData (and popup Favourites count) updates
      getWishlist(storefrontId, undefined, 100, 0)
        .then((res) => {
          const data = res?.data ?? res;
          dispatch(setRawWishlistData(Array.isArray(data) ? data : []));
        })
        .catch(() => {});
    } catch {
      toast('error', isCurrentlyInWishlist ? 'Failed to remove from wishlist' : 'Failed to add to wishlist');
    } finally {
      isUpdatingRef.current = false;
    }
  }, [store?.currentStore?.id, isInWishlist, dispatch, toast, lang?.somethingWentWrong]);

  return {
    wishlistItems,
    wishlistCount,
    wishlistLoading,
    wishlistError,
    isInWishlist,
    toggleProductLike,
    refreshWishlist,
  };
};