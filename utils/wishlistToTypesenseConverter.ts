import { TypesenseProduct } from '@services/typesense/types';
import {
  resolveStorefrontDisplayPrices,
  shouldUseRetailProductPricing,
  type StorefrontPricesLike,
} from './retailStorefrontPricing';

export interface WishlistItem {
  id: string;
  storeId: string;
  userId: string;
  productId: string;
  createdAt: number;
  updatedAt: number;
  product: {
    id: string;
    accountId: string;
    storefrontId: string;
    productId: string;
    sku: string;
    basePrice: number;
    discountedPrice: number;
    taxConfig: { taxInclusive: boolean | null };
    calculatedPrice: {
      withoutTax: number;
      withTax: number;
      taxAmount: number;
      updatedAt: number;
      taxRate: number;
    };
    type: {
      hasVariants: boolean;
      allowCustomization: boolean;
      category: string;
      isModifier: boolean;
      hasModifiers: boolean;
      canBeSoldIndependently: boolean;
      allowHalfHalf: boolean;
      isAlsoAProduct: boolean;
      enableSizeChart: boolean;
    };
    status: string;
    displayOrder: number;
    createdAt: number;
    lastModifiedAt: number;
    name: { en: string; [key: string]: string };
    productCategoryId: string;
    productCategoryName: { en: string; [key: string]: string };
    productCategorySlug: string;
    productAttributes?: {
      containsMeat: boolean;
      glutenFree: boolean;
      spicy: boolean;
      vegan: boolean;
      vegetarian: boolean;
    };
    ingredients: {
      items: Array<{
        name: string;
        isAllergenic: boolean;
        allergenSeverity: string;
        isRemovable: boolean;
      }>;
      dietaryInfo: {
        containsEgg: boolean;
        containsDairy: boolean;
        containsNuts: boolean;
        containsShellfish: boolean;
        containsSoy: boolean;
        containsWheat: boolean;
        containsPeanuts: boolean;
        containsFish: boolean;
      };
    };
    nutritionInfo: {
      servingSize: string;
      values: {
        calories: number;
        totalFat: number;
        saturatedFat: number;
        transFat: number;
        cholesterol: number;
        sodium: number;
        dietaryFiber: number;
        sugar: number;
        protein: number;
      };
      vitaminsAndMinerals: {
        vitaminA: number;
        calcium: number;
        iron: number;
        potassium: number;
      };
    };
    media: Array<{
      _id: string;
      type: string;
      url: string;
      metadata: { displayOrder: number };
      isHide: boolean;
      applyToAllVariants: boolean;
    }>;
    seo: {
      title: string;
      description: string;
      keywords: string[];
      urlManagement: {
        urlPattern: string;
        currentUrl: string;
        customSlug: string;
        canonicalUrl: string;
      };
      socialMediaImages: Array<{ type: string; url: string }>;
    };
    totalLikes: number;
    loyaltyPoints?: number;
    productKind: string;
  };
}

export const convertWishlistToTypesenseProduct = (wishlistItem: WishlistItem | Record<string, unknown>): TypesenseProduct => {
  // Handle null/undefined cases
  if (!wishlistItem) {
    throw new Error('Invalid wishlist item: missing data');
  }

  // Handle both typed WishlistItem and raw API response
  // Check if wishlistItem has a 'product' property (WishlistItem format: { product: {...} })
  // or if it's already a product object (raw API format: { id, productId, ... })
  const wishlistItemRecord = wishlistItem as Record<string, unknown>;
  const hasProductKey = 'product' in wishlistItemRecord && wishlistItemRecord.product;
  
  const product = (hasProductKey && typeof wishlistItemRecord.product === 'object') 
    ? wishlistItemRecord.product 
    : wishlistItemRecord;
  
  if (!product || typeof product !== 'object') {
    throw new Error('Invalid wishlist item: missing product data');
  }

  const productRecord = product as Record<string, unknown>;

  // Safely extract productAttributes with multiple fallback paths
  const getProductAttributes = (): { containsMeat: boolean; glutenFree: boolean; spicy: boolean; vegan: boolean; vegetarian: boolean } => {
    // Try direct path: product.productAttributes
    const directAttrs = (product as { productAttributes?: { containsMeat?: boolean; glutenFree?: boolean; spicy?: boolean; vegan?: boolean; vegetarian?: boolean } }).productAttributes;
    
    if (directAttrs) {
      return {
        containsMeat: directAttrs.containsMeat ?? false,
        glutenFree: directAttrs.glutenFree ?? false,
        spicy: directAttrs.spicy ?? false,
        vegan: directAttrs.vegan ?? false,
        vegetarian: directAttrs.vegetarian ?? false,
      };
    }
    
    // Fallback: try accessing as Record
    const recordAttrs = productRecord.productAttributes as Record<string, unknown> | undefined;
    
    if (recordAttrs && typeof recordAttrs === 'object' && recordAttrs !== null) {
      return {
        containsMeat: Boolean(recordAttrs.containsMeat),
        glutenFree: Boolean(recordAttrs.glutenFree),
        spicy: Boolean(recordAttrs.spicy),
        vegan: Boolean(recordAttrs.vegan),
        vegetarian: Boolean(recordAttrs.vegetarian),
      };
    }
    
    // Default fallback
    return {
      containsMeat: false,
      glutenFree: false,
      spicy: false,
      vegan: false,
      vegetarian: false,
    };
  };

  const productAttributes = getProductAttributes();

  const productKind = (productRecord.productKind as string | undefined) || "";
  const storefrontPrices = productRecord.storefrontPrices as
    | StorefrontPricesLike
    | undefined;
  const retailPrices = shouldUseRetailProductPricing(productKind)
    ? resolveStorefrontDisplayPrices(storefrontPrices)
    : null;
  const basePrice = retailPrices
    ? retailPrices.basePrice
    : ((productRecord.basePrice || 0) as number);
  const discountedPrice = retailPrices
    ? retailPrices.discountedPrice
    : ((productRecord.discountedPrice || 0) as number);
  
  const defaultDietaryInfo = {
    containsEgg: false, containsDairy: false, containsNuts: false, containsShellfish: false,
    containsSoy: false, containsWheat: false, containsPeanuts: false, containsFish: false,
  };
  
  const result = {
    id: (productRecord.id || productRecord.productId || '') as string,
    productId: (productRecord.productId || productRecord.id || '') as string,
    accountId: (productRecord.accountId || '') as string,
    linkedMenus: [],
    productCategorySlug: (productRecord.productCategorySlug || 'general') as string,
    name: (productRecord.name as { en: string; [key: string]: string }) || { en: '' },
    description: { en: ((productRecord.seo as Record<string, unknown>)?.description as string) || '' },
    allergens: ((productRecord.ingredients as Record<string, unknown>)?.items as Array<{ isAllergenic: boolean; name: string }>)?.filter(item => item.isAllergenic)?.map(item => item.name) || [],
    basePrice,
    calculatedPrice: (productRecord.calculatedPrice || {
      withoutTax: basePrice,
      withTax: basePrice,
      taxAmount: 0,
      updatedAt: Date.now(),
      taxRate: 0,
    }) as { withoutTax: number; withTax: number; taxAmount: number; updatedAt: number; taxRate: number },
    discountedPrice,
    rating: { average: 0, count: 0 },
    sku: (productRecord.sku || '') as string,
    slug: (((productRecord.seo as Record<string, unknown>)?.urlManagement as Record<string, unknown>)?.customSlug as string) || (productRecord.productId as string) || '',
    status: (productRecord.status || 'ACTIVE') as string,
    storefrontId: (productRecord.storefrontId || '') as string,
    productCategoryId: (productRecord.productCategoryId || '') as string,
    productCategoryName: (productRecord.productCategoryName || { en: '' }) as { en: string; [key: string]: string },
    overallRatings: { average: 0, totalReview: 0, verifiedStatus: { verified: 0, average: 0 } },
    nutritionInfo: {
      servingSize: (((productRecord.nutritionInfo as Record<string, unknown>)?.servingSize as string) || '1'),
      values: {
        calories: ((productRecord.nutritionInfo as Record<string, unknown>)?.values as Record<string, unknown>)?.calories as number || 0,
        cholesterol: String(((productRecord.nutritionInfo as Record<string, unknown>)?.values as Record<string, unknown>)?.cholesterol || 0),
        dietaryFiber: String(((productRecord.nutritionInfo as Record<string, unknown>)?.values as Record<string, unknown>)?.dietaryFiber || 0),
        protein: String(((productRecord.nutritionInfo as Record<string, unknown>)?.values as Record<string, unknown>)?.protein || 0),
        saturatedFat: String(((productRecord.nutritionInfo as Record<string, unknown>)?.values as Record<string, unknown>)?.saturatedFat || 0),
        sodium: String(((productRecord.nutritionInfo as Record<string, unknown>)?.values as Record<string, unknown>)?.sodium || 0),
        sugar: String(((productRecord.nutritionInfo as Record<string, unknown>)?.values as Record<string, unknown>)?.sugar || 0),
        totalCarbohydrate: '0',
        totalFat: String(((productRecord.nutritionInfo as Record<string, unknown>)?.values as Record<string, unknown>)?.totalFat || 0),
        transFat: String(((productRecord.nutritionInfo as Record<string, unknown>)?.values as Record<string, unknown>)?.transFat || 0),
      },
      vitaminsAndMinerals: {
        calcium: String(((productRecord.nutritionInfo as Record<string, unknown>)?.vitaminsAndMinerals as Record<string, unknown>)?.calcium || 0),
        iron: String(((productRecord.nutritionInfo as Record<string, unknown>)?.vitaminsAndMinerals as Record<string, unknown>)?.iron || 0),
        potassium: String(((productRecord.nutritionInfo as Record<string, unknown>)?.vitaminsAndMinerals as Record<string, unknown>)?.potassium || 0),
        sodium: String(((productRecord.nutritionInfo as Record<string, unknown>)?.vitaminsAndMinerals as Record<string, unknown>)?.potassium || 0),
        vitaminA: String(((productRecord.nutritionInfo as Record<string, unknown>)?.vitaminsAndMinerals as Record<string, unknown>)?.vitaminA || 0),
      },
    },
    ingredients: {
      dietaryInfo: (() => {
        const dietaryInfo = ((productRecord.ingredients as Record<string, unknown>)?.dietaryInfo as Record<string, boolean> | undefined);
        if (dietaryInfo && typeof dietaryInfo === 'object') {
          return {
            containsEgg: Boolean(dietaryInfo.containsEgg),
            containsDairy: Boolean(dietaryInfo.containsDairy),
            containsNuts: Boolean(dietaryInfo.containsNuts),
            containsShellfish: Boolean(dietaryInfo.containsShellfish),
            containsSoy: Boolean(dietaryInfo.containsSoy),
            containsWheat: Boolean(dietaryInfo.containsWheat),
            containsPeanuts: Boolean(dietaryInfo.containsPeanuts),
            containsFish: Boolean(dietaryInfo.containsFish),
          };
        }
        return defaultDietaryInfo;
      })(),
      items: ((productRecord.ingredients as Record<string, unknown>)?.items as Array<{ allergenSeverity: string; isAllergenic: boolean; isRemovable: boolean; name: string }>)?.map(item => ({
        allergenSeverity: item.allergenSeverity,
        isAllergenic: item.isAllergenic,
        isRemovable: item.isRemovable,
        name: item.name,
      })) || [],
    },
    type: {
      allowHalfHalf: ((productRecord.type as Record<string, unknown>)?.allowHalfHalf || false) as boolean,
      canBeSoldIndependently: ((productRecord.type as Record<string, unknown>)?.canBeSoldIndependently ?? true) as boolean,
      category: ((productRecord.type as Record<string, unknown>)?.category || 'REGULAR') as string,
      hasModifiers: ((productRecord.type as Record<string, unknown>)?.hasModifiers || false) as boolean,
      hasVariants: ((productRecord.type as Record<string, unknown>)?.hasVariants || false) as boolean,
      isAlsoAProduct: ((productRecord.type as Record<string, unknown>)?.isAlsoAProduct || false) as boolean,
      isModifier: ((productRecord.type as Record<string, unknown>)?.isModifier || false) as boolean,
    },
    taxConfig: { taxCode: '', taxInclusive: ((productRecord.taxConfig as Record<string, unknown>)?.taxInclusive || false) as boolean },
    displayOrder: (productRecord.displayOrder || 0) as number,
    createdAt: (productRecord.createdAt || 0) as number,
    lastModifiedAt: (productRecord.lastModifiedAt || 0) as number,
    group: [],
    media: ((productRecord.media as Array<Record<string, unknown>>) || []).map((mediaItem: Record<string, unknown>) => ({
      type: (mediaItem.type || 'image') as string,
      url: (mediaItem.url || '') as string,
      _id: (mediaItem._id || mediaItem.url || '') as string,
      metadata: { 
        displayOrder: ((mediaItem.metadata as Record<string, unknown>)?.displayOrder || 0) as number, 
        isPrimary: ((mediaItem.metadata as Record<string, unknown>)?.displayOrder || 0) === 0 
      },
    })),
    productAttributes: productAttributes,
    totalLikes: (productRecord.totalLikes || 0) as number,
    loyaltyPoints: (() => {
      const points = productRecord.loyaltyPoints;
      const numericPoints = typeof points === 'number' ? points : Number(points);
      return Number.isFinite(numericPoints) && numericPoints > 0 ? numericPoints : undefined;
    })(),
    seo: {
      description: ((productRecord.seo as Record<string, unknown>)?.description as string) || '',
      slug: (((productRecord.seo as Record<string, unknown>)?.urlManagement as Record<string, unknown>)?.customSlug as string) || (productRecord.productId as string) || '',
      title: ((productRecord.seo as Record<string, unknown>)?.title as string) || ((productRecord.name as { en?: string })?.en || ''),
      urlManagement: {
        canonicalUrl: (((productRecord.seo as Record<string, unknown>)?.urlManagement as Record<string, unknown>)?.canonicalUrl as string) || '',
        currentUrl: (((productRecord.seo as Record<string, unknown>)?.urlManagement as Record<string, unknown>)?.currentUrl as string) || '',
        customSlug: (((productRecord.seo as Record<string, unknown>)?.urlManagement as Record<string, unknown>)?.customSlug as string) || (productRecord.productId as string) || '',
        urlPattern: (((productRecord.seo as Record<string, unknown>)?.urlManagement as Record<string, unknown>)?.urlPattern as string) || '',
      },
    },
    bestOffer: undefined,
  };
  
  return result;
};

export const convertWishlistArrayToTypesenseProducts = (wishlistItems: WishlistItem[] | Record<string, unknown>[]): TypesenseProduct[] => {
  // Handle empty/null arrays
  if (!wishlistItems || !Array.isArray(wishlistItems)) {
    return [];
  }

  // Filter out invalid items and convert valid ones
  return wishlistItems
    .filter(item => {
      if (!item || typeof item !== 'object') return false;
      // Check if item has product property (WishlistItem format) or is itself a product (raw API format)
      const hasProduct = 'product' in item && item.product;
      const isProduct = 'productId' in item || 'id' in item;
      return hasProduct || isProduct;
    })
    .map(item => {
      try {
        // Handle both formats: { product: {...} } and direct product object
        const wishlistItem = item as WishlistItem | Record<string, unknown>;
        return convertWishlistToTypesenseProduct(wishlistItem);
      } catch (error) {
        const itemRecord = item as Record<string, unknown>;
        const product = itemRecord?.product as Record<string, unknown> | undefined;
        const itemId = itemRecord?.id || itemRecord?.productId || product?.id || 'unknown';
        console.warn('Failed to convert wishlist item:', itemId, error);
        return null; // Return null for failed conversions
      }
    })
    .filter((product): product is TypesenseProduct => product !== null); // Remove null results
};

/** Merge offer/pricing from full-menu Typesense products into wishlist favourites for PLP parity. */
export function enrichWishlistProductsWithMenuData(
  favourites: TypesenseProduct[],
  menuProducts: TypesenseProduct[]
): TypesenseProduct[] {
  if (!favourites.length || !menuProducts.length) return favourites;

  const menuByProductId = new Map<string, TypesenseProduct>();
  for (const product of menuProducts) {
    const id = product.productId || product.id;
    if (id) menuByProductId.set(id, product);
  }

  return favourites.map((favourite) => {
    const id = favourite.productId || favourite.id;
    const menuProduct = id ? menuByProductId.get(id) : undefined;
    if (!menuProduct) return favourite;

    return {
      ...favourite,
      bestOfferRemote: menuProduct.bestOfferRemote ?? favourite.bestOfferRemote,
      bestOfferInStore: menuProduct.bestOfferInStore ?? favourite.bestOfferInStore,
      bestOffer: menuProduct.bestOffer ?? favourite.bestOffer,
      basePrice: menuProduct.basePrice ?? favourite.basePrice,
      discountedPrice: menuProduct.discountedPrice ?? favourite.discountedPrice,
      primaryVariant: menuProduct.primaryVariant ?? favourite.primaryVariant,
      variants: menuProduct.variants ?? favourite.variants,
      // Wishlist converter sets rating/overallRatings to zero placeholders; prefer menu Typesense values.
      rating: menuProduct.rating,
      overallRatings: menuProduct.overallRatings,
      loyaltyPoints: menuProduct.loyaltyPoints ?? favourite.loyaltyPoints,
    };
  });
}
