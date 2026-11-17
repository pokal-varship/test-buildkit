import { DiscountOffer } from "@services/typesense";

export interface ProductResponse {
  status: string;
  message: string;
  data: ProductData;
  totalCount: number;
}

export interface ModifierName {
  en: string;
};

export interface Modifier {
  modifierId: string;
  name: ModifierName;
  sku: string;
  status: 'ACTIVE' | 'INACTIVE';
  displayOrder: number;
  price: number;
  halfNHalfPrice: number;
};

export interface ModifierConfig {
  min: number;
  max: number;
  isMandatory: boolean;
  isMultiple: boolean;
  allowHalfAndHalf: boolean;
  freeQuantity: number;
};

export interface LinkedModifier {
  _id: string;
  id: string;
  name: ModifierName;
  status: 'ACTIVE' | 'INACTIVE';
  displayOrder: number;
  config: ModifierConfig;
  modifiers: Modifier[];
  modifierGroupId: string;
};
export type Media = {
  value: string;
  _id: string;
  type: string; // e.g., "image/jpeg" or "" (empty for videos in your example)
  url: string;
  metadata: {
    displayOrder: number;
    thumbnail?: string;
    isPrimary?: boolean;
  };
};


export interface ProductData {
  id: string;
  name: string;
  description: string;
  productCategoryName: string;
  productCategoryId: string;
  customSlug: string;
  seo: {
    urlManagement: {
      customSlug: string;
    };
  };
  // productCategorySlug: {
  //   en: string;
  // };
  productCategorySlug:string;
  media: Media[];
  basePrice: number;
  discountedPrice: number;
  ingredients: Ingredients;
  nutritionInfo: NutritionInfo;
  variants: Variant[];
  linkedModifiers: LinkedModifier[]; // Using Record type for unknown object structure
  bestOffer?: DiscountOffer;
  bestOfferRemote?: DiscountOffer;
  bestOfferInStore?: DiscountOffer;
  overallRatings: {
    average: number;
    totalReview: number;
    starDistribution: Record<string, number>;
    percentages: Record<string, number>;
    verifiedStatus: {
      verified: number;
      average: number;
    };
  };
  parameterAverages: Array<{
    parameterId: string;
    parameterName: string;
    avgRating: number;
    reviewCount: number;
  }>;
  productAttributes?: {
    containsMeat: boolean;
    vegan?: boolean;
    vegetarian?: boolean;
    glutenFree?: boolean;
    spicy?: boolean;
  };
  type?: {
    category?: string; // 'COMBO', 'REGULAR', etc.
    hasVariants?: boolean;
    isModifier?: boolean;
    allowHalfHalf?: boolean;
    canBeSoldIndependently?: boolean;
    hasModifiers?: boolean;
    isAlsoAProduct?: boolean;
  };
  /** Present on Retail/Grocery product API responses */
  productKind?: string;
  storefrontPrices?: {
    unitPrice?: number;
    salesPrice?: number;
    isSalesPriceSet?: boolean;
    minPrice?: number;
    maxPrice?: number;
    allVariantsSamePrice?: boolean;
    costOfGoods?: number;
    tieredPricing?: boolean;
    storefrontId?: string;
    saveUpto?: number;
  };
  
  totalLikes?: number;
  /** Loyalty points earned when purchasing this product (PDP / API). */
  loyaltyPoints?: number;
  preparationDetails?: {
    cookingTime?: number;
    preparationTime?: number;
    totalTime?: number;
    difficulty?: string;
    instructions?: string;
  };
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

export interface Ingredients {
  items: IngredientItem[];
  dietaryInfo: DietaryInfo;
}

export interface IngredientItem {
  name: string;
  isAllergenic: boolean;
  allergenSeverity: 'High' | 'Medium' | 'Low';
  isRemovable: boolean;
}

export interface DietaryInfo {
  containsEgg: boolean;
  containsDairy: boolean;
  containsNuts: boolean;
  containsShellfish: boolean;
  containsSoy: boolean;
  containsWheat: boolean;
  containsPeanuts: boolean;
  containsFish: boolean;
}

export interface NutritionInfo {
  servingSize: string;
  values: NutritionValues;
  vitaminsAndMinerals: VitaminsAndMinerals;
}

export interface NutritionValues {
  calories: number;
  totalFat: number;
  saturatedFat: number;
  transFat: number;
  cholesterol: number;
  sodium: number;
  dietaryFiber: number;
  sugar: number;
  protein: number;
  totalCarbohydrate?: number; // only present in variant nutrition
}

export interface VitaminsAndMinerals {
  vitaminA: number;
  calcium: number;
  iron: number;
  potassium: number;
}

export interface Variant {
  _id: string;
  sku: string;
  attributes: {
    name: string;
    value: string;
  }[];
  basePrice: number;
  discountedPrice: number;
  nutritionInfo: NutritionInfo | null;
  linkedModifiers: LinkedModifier[];
  bestOffer?: DiscountOffer;
  bestOfferRemote?: DiscountOffer;
  bestOfferInStore?: DiscountOffer;
  /** Retail/Grocery variant-level storefront pricing when present */
  storefrontPrices?: {
    unitPrice?: number;
    salesPrice?: number;
    isSalesPriceSet?: boolean;
    minPrice?: number;
    maxPrice?: number;
    allVariantsSamePrice?: boolean;
    costOfGoods?: number;
    tieredPricing?: boolean;
    storefrontId?: string;
    saveUpto?: number;
  };
}


export interface ModifierType  {
  modifierId: string;
  quantity: number;
  name: {
    [lang: string]: string; // Assuming it has multilingual support
  };
  sku: string;
  price: number;
};

export interface  ModifierGroup {
  _id: string;
  modifierGroupId: string;
  modifiers: ModifierType[];
  id: string;
  name: {[lang: string]: string;};
  config: {
    min: number;
    max: number;
    isMandatory: boolean;
  }
};

export interface  ComboProduct {
  groupName: string;
  productId: string;
  modifierGroups?: ModifierGroup[];
};

export interface AddToCartPayload {
  menuSlug?: string;
  quantity: number;
  productId: string;
  variantId?: string;
  specialInstructions?: string;
  modifierGroups?: {
    modifierGroupId: string;
    modifiers: {
      modifierId: string;
      quantity: number;
    }[];
  }[];
};

export interface PatchCartPayload {
  id: string;
  customType: string;
  cartItemId: string;
  variantId?: string;
  specialInstructions?: string;
  modifierGroups: {
      modifierGroupId: string;
      modifiers: {
          modifierId: string;
          quantity: number;
      }[]
  }[]
}
export interface AddToCartResponse {
  status: string;
  message: string;
  data: {
    cartId: string;
    message: string;
  };
}

export type MediaType =  {
  value: string;
  reviewId?: string,
   media: string
   id?:number,
   type?:string,
   url?:string,
   thumbnail?:string,
  };

// product reviews types

export type ReviewResponse = {
  message: string;
  data: {
    startCount: {
      oneStart: number;
      twoCount: number;
      threeCount: number;
      fourCount: number;
      fiveCount: number;
    };
    reviews: Review[];
    page: number;
    limit: number;
    penCount: number;
    parameterRating: ParameterRating[];
    totaluser: number;
    avgrating: number;
    totalrating: number;
  };
};

export type Review = {
  reviewId: string;
  productId: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  profilePic: string | null;
  title: string;
  content: string;
  sourceChannel: string;
  orderId: string;
  createdAt: number;
  updatedAt: number;
  status: number;
  parameterId: string;
  rating: number;
  likes: number;
  dislikes: number;
  media: string[];
  parameter_name: string;
};

export type ParameterRating = {
  parameterId: string;
  parameterName: string;
  avgRating: number;
};

export type GetProductRatingsAndReviewsArgs = {
  productId: string;
  storeId: string;
  tenantId: string;
  token: string;
  page?: number;
  limit?: number;
  isProductReview?: number;
};


export type ParameterReview = {
  product_id: string;
  parameter_id: string;
  parameter_name: string;
  rating: number;
  review_id: number;
};

export type ReviewMedia = {
  type: string;
  value: string;
  media?: string; // Optional for compatibility with MediaType
};

export type ParameterReviewData = {
  product_id: string;
  parameter_id: string;
  parameter_name: string;
  rating: number;
  review_id: number;
};

export type ReviewData = {
  reviewId: string;
  productId: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  title: string;
  content: string;
  sourceChannel: string;
  orderId: string;
  createdAt: number;
  status: string;
  rating: number;
  likes: number;
  dislikes: number;
  media: MediaType[];
  parameter_review: ParameterReviewData[];
};

export type ProductReviewsArray = ReviewData[];





