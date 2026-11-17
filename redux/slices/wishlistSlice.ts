import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  addedAt: number;
  likeCount: number; // Add like count for individual products
  // Enhanced fields for full product details
  discountedPrice?: number;
  rating?: number;
  overallRatings?: number;
  containsMeat?: boolean;
  bestOffer?: Record<string, unknown>;
  variants?: Record<string, unknown>[];
  // Store the full Typesense product data for conversion
  fullProductData?: Record<string, unknown>;
}

interface WishlistState {
  items: WishlistItem[];
  rawApiData: Record<string, unknown>[]; // Store raw API response for conversion
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  rawApiData: [],
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (!existingItem) {
        state.items.push(action.payload);
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    
    toggleWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);
      if (existingItemIndex >= 0) {
        state.items.splice(existingItemIndex, 1);
      } else {
        state.items.push(action.payload);
      }
    },
   // New action to handle like/unlike functionality with optimistic updates
toggleProductLike: (state, action: PayloadAction<{ 
  id: string; 
  name: string; 
  price: number; 
  imageUrl?: string;
  totalLikes?: number; 
}>) => {
  const { id, name, price, imageUrl, totalLikes } = action.payload;

  const existingItem = state.items.find(item => item.id === id);
  const isRealLiked = existingItem && existingItem.name !== `Product ${id}`;

  const typesenseCount = Number(totalLikes) || 0;
  
  if (isRealLiked) {
    // Unliking: Use the higher of Redux count or Typesense count as base
    // This ensures we don't go to 0 when Redux has placeholder (1) or stale data
    const currentReduxCount = existingItem.likeCount ?? 0;
    // If Redux count is 1 (placeholder) and Typesense is available, use Typesense
    // Otherwise, use the maximum of Redux and Typesense to ensure accurate count
    const baseCount = (currentReduxCount === 1 && typesenseCount > 1) 
      ? typesenseCount 
      : Math.max(currentReduxCount, typesenseCount);
    const newLikeCount = Math.max(0, baseCount - 1);

    // Remove the real item
    state.items = state.items.filter(item => item.id !== id);

    // Add temp item with updated count (even if 0 to override outdated props)
    state.items.push({
      id,
      name: `Product ${id}`,
      price: 0,
      imageUrl: undefined,
      addedAt: Date.now(),
      likeCount: newLikeCount,
    });
    } else {
    // Liking: Always use current Redux count if exists (for optimistic updates), otherwise Typesense count
    // This ensures consistent count when user likes/unlikes multiple times
    const currentReduxCount = existingItem?.likeCount ?? typesenseCount;
    const baseCount = existingItem ? currentReduxCount : (typesenseCount > 0 ? typesenseCount : 0);
    const newLikeCount = baseCount + 1;

    // Remove temp if exists
    if (existingItem) {
      state.items = state.items.filter(item => item.id !== id);
    }

    // Add real item with optimistic count
    const newItem: WishlistItem = {
      id,
      name,
      price,
      imageUrl,
      addedAt: Date.now(),
      likeCount: newLikeCount,
    };
    state.items.push(newItem);
  }
},

    // Action to increment like count for a specific product
    incrementLikeCount: (state, action: PayloadAction<string>) => {
      const item = state.items.find(item => item.id === action.payload);
      if (item) {
        item.likeCount += 1;
      }
    },
    // Action to decrement like count for a specific product
    decrementLikeCount: (state, action: PayloadAction<string>) => {
      const item = state.items.find(item => item.id === action.payload);
      if (item && item.likeCount > 0) {
        item.likeCount -= 1;
      }
    },
    // Action to sync like count from external sources (Typesense API)
    syncTypesenseLikeCount: (state, action: PayloadAction<{ productId: string; typesenseLikeCount: number }>) => {
      const { productId, typesenseLikeCount } = action.payload;
      const existingItem = state.items.find(item => item.id === productId);
      const isRealLikedItem = existingItem && existingItem.name !== `Product ${productId}`;
      
      if (existingItem) {
        if (isRealLikedItem) {
          // Preserve optimistic updates if Redux count is higher than Typesense and not a placeholder
          if (existingItem.likeCount > typesenseLikeCount && existingItem.likeCount > 1) {
            return;
          }
          existingItem.likeCount = Math.max(typesenseLikeCount, 1);
        } else {
          // Temp item: preserve optimistic decreases (count less than Typesense suggests recent unlike)
          // Only update if temp item count is equal or greater than Typesense (stale data)
          if (existingItem.likeCount < typesenseLikeCount) {
            // Preserve optimistic decrease
            return;
          }
          existingItem.likeCount = typesenseLikeCount;
        }
      } else {
        state.items.push({
          id: productId,
          name: `Product ${productId}`,
          price: 0,
          addedAt: Date.now(),
          likeCount: typesenseLikeCount,
        });
      }
    },
    cleanupTemporaryItems: (state) => {
      state.items = state.items.filter(item => {
        return item.name !== `Product ${item.id}` || item.likeCount > 0;
      });
    },
    clearWishlist: (state) => {
      state.items = [];
    },
    setWishlistLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setWishlistError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    // Action to set the entire wishlist from backend data
    setWishlist: (state, action: PayloadAction<WishlistItem[]>) => {
      // Deduplicate items by product ID to prevent duplicates
      const uniqueItems = action.payload.reduce((acc: WishlistItem[], currentItem) => {
        const existingItem = acc.find(item => item.id === currentItem.id);
        if (!existingItem) {
          acc.push(currentItem);
        } else {
          // If duplicate found, merge the data keeping the most recent/complete information
          acc = acc.map(item => 
            item.id === currentItem.id 
              ? { ...item, ...currentItem, addedAt: Math.max(item.addedAt, currentItem.addedAt) }
              : item
          );
        }
        return acc;
      }, []);
      
      state.items = uniqueItems;
    },
    // Action to set raw API data for conversion
    setRawWishlistData: (state, action: PayloadAction<Record<string, unknown>[]>) => {
      state.rawApiData = action.payload;
    },
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  toggleProductLike,
  incrementLikeCount,
  decrementLikeCount,
  syncTypesenseLikeCount,
  cleanupTemporaryItems,
  clearWishlist,
  setWishlistLoading,
  setWishlistError,
  setWishlist,
  setRawWishlistData,
} = wishlistSlice.actions;

// Selectors
export const selectWishlist = (state: RootState) => state.wishlist;
export const selectRawWishlistData = (state: RootState) => state.wishlist.rawApiData;

// Base selector for all wishlist items
const selectAllWishlistItems = (state: RootState) => state.wishlist.items;

// Memoized selector to prevent unnecessary re-renders
export const selectWishlistItems = createSelector(
  selectAllWishlistItems,
  (items) => items.filter(item => item.name !== `Product ${item.id}`)
);

export const selectWishlistItemCount = createSelector(
  selectWishlistItems,
  (items) => items.length
);

export const selectUniqueWishlistItemCount = createSelector(
  selectWishlistItems,
  (items) => {
    const uniqueIds = new Set(items.map(item => item.id));
    return uniqueIds.size;
  }
);

// Memoized selector for checking if item is in wishlist
export const selectIsInWishlist = createSelector(
  [selectAllWishlistItems, (state: RootState, itemId: string) => itemId],
  (items, itemId) => items.some(item => item.id === itemId && item.name !== `Product ${itemId}`)
);

// Memoized selector to get like count for a specific product
export const selectProductLikeCount = createSelector(
  [selectAllWishlistItems, (state: RootState, productId: string) => productId],
  (items, productId) => {
    const item = items.find(item => item.id === productId);
    return item ? item.likeCount : 0;
  }
);

export default wishlistSlice.reducer; 