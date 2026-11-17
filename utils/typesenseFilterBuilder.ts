/**
 * Utility functions for building Typesense filter queries
 * Reusable filter logic for product listing, wishlist, and favourites
 * (Restaurant / Laundry default PLP path)
 */

import { SortBarFilters } from '@components/products/SortBar';

// Constants for filter defaults
export const DEFAULT_CALORIE_MIN = 10;
export const DEFAULT_CALORIE_MAX = 900;

/**
 * Build common filter parts (vegetarian, calorie, offers, dietary restrictions)
 * This is the shared logic used across WishlistListing, product-listing, and favourites
 * 
 * @param filters - SortBarFilters object containing filter values
 * @returns Array of filter strings that can be joined with &&
 */
export const buildCommonFilterParts = (filters: SortBarFilters): string[] => {
  const filterParts: string[] = [];

  // Handle vegetarian filter
  if (filters.vegetarianFilter === 'veg' || filters.vegetarianFilter === '') {
    filterParts.push('productAttributes.containsMeat:false');
  } else if (filters.vegetarianFilter === 'non-veg') {
    filterParts.push('(productAttributes.containsMeat:true || productAttributes.containsMeat:false)');
  }

  // Match UI display: primaryVariant calories first, product-level when primary is unset/zero
  if (filters.calorieRange[0] !== DEFAULT_CALORIE_MIN || filters.calorieRange[1] !== DEFAULT_CALORIE_MAX) {
    const calorieRange = `[${filters.calorieRange[0]}..${filters.calorieRange[1]}]`;
    filterParts.push(
      `(primaryVariant.nutritionInfo.values.calories:=${calorieRange} || (nutritionInfo.values.calories:=${calorieRange} && primaryVariant.nutritionInfo.values.calories:<1))`
    );
  }

  // Handle offers
  if (filters.offer && filters.offer.length > 0) {
    const offerFilters = filters.offer.map(ofr => `bestOffer.offerName.en:${ofr}`);
    filterParts.push(`(${offerFilters.join(' || ')})`);
  }

  // Handle dietary restrictions
  if (filters.dietaryRestrictions.length > 0) {
    let dietaryFilters: string[];
    if (filters.dietaryRestrictions.includes('any')) {
      // When 'any' is selected, include all dietary restrictions
      dietaryFilters = [
        'ingredients.dietaryInfo.containsEgg:false',
        'ingredients.dietaryInfo.containsDairy:false',
        'ingredients.dietaryInfo.containsNuts:false',
        'ingredients.dietaryInfo.containsShellfish:false',
        'ingredients.dietaryInfo.containsSoy:false',
        'ingredients.dietaryInfo.containsWheat:false',
        'ingredients.dietaryInfo.containsPeanuts:false',
        'ingredients.dietaryInfo.containsFish:false'
      ];
    } else {
      // Handle individual selections
      dietaryFilters = filters.dietaryRestrictions.map(restriction => {
        return `ingredients.dietaryInfo.${restriction}:false`;
      });
    }
    filterParts.push(`(${dietaryFilters.join(' && ')})`);
  }

  return filterParts;
};

/**
 * Build product ID filter part
 * @param productIds - Array of product IDs to filter
 * @returns Filter string for product IDs, or empty string if no IDs provided
 */
export const buildProductIdFilter = (productIds: string[]): string => {
  if (productIds.length === 0) {
    return '';
  }
  const productIdFilters = productIds.map(id => `productId:=${id}`);
  return `(${productIdFilters.join(' || ')})`;
};
