/**
 * Typesense types
 * This file contains the TypeScript interfaces for Typesense data
 */

// Typesense search parameters
export interface TypesenseSearchParams {
  q?: string;
  query_by?: string;
  query_by_weights?: string;
  filter_by?: string;
  sort_by?: string;
  page?: number;
  per_page?: number;
  facet_by?: string;
  max_facet_values?: number;
  facet_query?: string;
  exclude_fields?: string;
  collection?: string; // Optional collection name for multi-search
  group_by?: string;
  group_limit?: number;
  prioritize_exact_match?: boolean;
  text_match_type?: string;
  num_typos?: string | number;
  drop_tokens_threshold?: number;
  prefix?: string | boolean;
  /**
   * Client-only flag for Retail/Grocery PLP handling.
   * Must NOT be sent to Typesense — stripped in productService.
   */
  __retailCatalog?: boolean;
}

// Typesense multi-search request
export interface TypesenseMultiSearchRequest {
  searches: TypesenseSearchParams[];
}

// Typesense multi-search response
export interface TypesenseMultiSearchResponse<T> {
  results: TypesenseSearchResponse<T>[];
}

// Typesense grouped hit response
export interface TypesenseGroupedHit<T> {
  found: number;
  group_key: string[];
  hits: Array<{
    document: T;
    highlight?: Record<string, unknown>;
    highlights: Array<{
      field: string;
      matched_tokens: string[];
      snippet: string;
    }>;
    text_match?: number;
  }>;
}

// Typesense search response
export interface TypesenseSearchResponse<T> {
  request_id?: string;
  found: number;
  found_docs?: number; // Total documents found when using group_by
  out_of: number;
  page: number;
  request_params: {
    collection_name: string;
    per_page: number;
    q: string;
  };
  search_time_ms: number;
  hits?: Array<{
    document: T;
    highlights: Array<{
      field: string;
      matched_tokens: string[];
      snippet: string;
    }>;
    text_match: number;
  }>;
  grouped_hits?: TypesenseGroupedHit<T>[]; // Used when group_by is specified
  facet_counts?: Array<{
    field_name: string;
    counts: Array<{
      count: number;
      value: string;
      highlighted: string
    }>;
  }>;
}

// Define the DiscountOffer interface
export interface DiscountConfigItem {
  discountType: number;
  discountValue: number;
  excludeData: string[];
  excludeType: number;
  isExcludeData: boolean;
  maximumDiscount?: number;
  minimumSpendValue: number;
  type: number;
  value: number;
}

export interface DiscountOffer {
  discountConfig: DiscountConfigItem;
  type: string;
  offerBy: number;
  offerId: string;
  orderContext?: string;
  offerName: {
    [lang: string]: string; // Multilingual support
  };
  offerType: number;
  offerTypeString: string;
  priority: number;
  restrictionsDate: {
    endDate?: number;
    startDate?: number;
    /** API may send millisecond timestamps (preferred when present) */
    endTime?: number;
    startTime?: number;
  };
  status: number;
  storeId: string;
  offerDescription: {
    [lang: string]: string; // Multilingual support
  };
  termCondition?: {
    [lang: string]: string; // Multilingual support
  };
}
export type NutritionInfoTS = {
  servingSize: string;
  values: {
    calories: number;
    cholesterol: string;
    dietaryFiber: string;
    protein: string;
    saturatedFat: string;
    sodium: string;
    sugar: string;
    totalCarbohydrate: string;
    totalFat: string;
    transFat: string;
  };
  vitaminsAndMinerals: {
    calcium: string;
    iron: string;
    potassium: string;
    sodium: string;
    vitaminA: string;
  };
  preparationDetails?: {
    cookingTime?: number;
    preparationTime?: number;
    totalTime?: number;
    difficulty?: string;
    instructions?: string;
  };
}
// Typesense product document
export interface TypesenseProduct {
  id: string;
  productId: string;
  bestOffer?: DiscountOffer;
  /**
   * Some API responses provide offer + pricing context-specific fields.
   * Example: when `orderContext` is "REMOTE", use `bestOfferRemote` for PLP.
   */
  bestOfferRemote?: DiscountOffer;
  bestOfferInStore?: DiscountOffer;
  orderContext?: string;
  accountId: string;
  linkedMenus: Array<{ menuId: string, menuSlug: string}>;
  productCategorySlug: string;
  /** Retail/Grocery Typesense docs may expose category membership as an array */
  categorySlugs?: string[];
  name: {
    en: string;
    [key: string]: string;
  };
  description: {
    [key: string]: string;
  };
  allergens?: string[];
  basePrice: number;
  primaryVariant?: {
    basePrice: number;
    discountedPrice: number;
    variantCount?: number;
    id?: string;
    _id?: string;
    variantId?: string;
    nutritionInfo?: NutritionInfoTS;
  };
  calculatedPrice: {
    withTax: number;
    withoutTax: number;
    taxAmount: number;
    taxRate?: number;
    updatedAt: number;
    halfHalfPricing?: {
      withTax: number;
      withoutTax: number;
      taxAmount: number;
      updatedAt: number;
    };
  };
  discountedPrice: number;
  rating: {
    average: number;
    count: number;
  };
  sku: string;
  slug: string;
  status: string;
  storefrontId: string;
  productCategoryId: string;
  productCategoryName: {
    en: string;
    [key: string]: string;
  };
  categoryDetails?: Array<{
    Banner?: string;
    Description?: {
      en: string;
      [key: string]: string;
    };
    Icon?: string;
    Slug?: string;
  }>;
  overallRatings: {
    average: number;
    totalReview: number;
    // starDistribution: any;
    // percentages: any;
    verifiedStatus: {
      verified: number;
      average: number;
    };
  };
  nutritionInfo: NutritionInfoTS;
  ingredients: {
    dietaryInfo: {
      containsDairy: boolean;
      containsEgg: boolean;
      containsFish: boolean;
      containsNuts: boolean;
      containsPeanuts: boolean;
      containsShellfish: boolean;
      containsSoy: boolean;
      containsWheat: boolean;
    };
    items: Array<{
      allergenSeverity: string;
      isAllergenic: boolean;
      isRemovable: boolean;
      name: string;
    }>;
  };
  type: {
    allowHalfHalf: boolean;
    canBeSoldIndependently: boolean;
    category: string;
    hasModifiers: boolean;
    hasVariants: boolean;
    isAlsoAProduct: boolean;
    isModifier: boolean;
  };
  taxConfig: {
    taxCode: string;
    taxInclusive: boolean;
    taxRateId?: string;
  };
  displayOrder: number;
  createdAt: number;
  lastModifiedAt: number;
  group: string[];
  media?: Array<{
    type: string;
    url: string;
    _id: string;
    metadata: {
      displayOrder: number;
      thumbnail?: string;
      isPrimary?: boolean;
    };
  }>;
  productAttributes?: {
    containsMeat: boolean;
    glutenFree: boolean;
    spicy: boolean;
    vegan: boolean;
    vegetarian: boolean;
  };

  totalLikes?: number;
  loyaltyPoints?: number;

  /** Retail/Grocery storefront pricing from Typesense */
  storefrontPrices?: {
    allVariantsSamePrice?: boolean;
    costOfGoods?: number;
    tieredPricing?: boolean;
    unitPrice?: number;
    salesPrice?: number;
    minPrice?: number;
    storefrontId?: string;
  };

  seo?: {
    description: string;
    slug: string;
    title: string;
    urlManagement: {
      canonicalUrl: string;
      currentUrl: string;
      customSlug: string;
      urlPattern?: string;
    };
  };

  linkedModifiers?: ModifierGroup[];
  variantAttributes?: Record<string, string>;
  originalIndex?: number;
  variants?: Array<{
    _id: string;
    sku: string;
    attributes: Array<{
      name: string;
      value: string;
    }>;
    linkedModifiers?: ModifierGroup[];
    nutritionInfo: NutritionInfoTS;
    bestOffer: DiscountOffer;
    basePrice: number;
    discountedPrice: number;
  }>;
}

// Mapping function to convert Typesense product to our Product interface
// Default (Restaurant / Laundry): pass-through — do not remap storefront prices
export const mapTypesenseProductToProduct = (
  typesenseProduct: TypesenseProduct,
): TypesenseProduct => {
  return {
    ...typesenseProduct,
  };
};

// Add the Modifier interface if it doesn't exist
export interface Modifier {
  quantity: number;
  sku: string;
  modifierId: string; // Add other properties as needed
  modifierGroupId: string;
  name: {
    [lang: string]: string; // Assuming it has multilingual support
  };
  price: number; // Add other properties as needed
  // Add any other relevant properties for Modifier
}

// Define the ModifierGroup interface
export interface ModifierGroup {
  id: string;
  _id: string;
  name: {
    [lang: string]: string; // Assuming it has multilingual support
  };
  modifiers: Modifier[]; // Array of Modifier
  modifierGroupId: string;
  config: {
    isMandatory: boolean;
    min: number;
    max: number;
  };
}