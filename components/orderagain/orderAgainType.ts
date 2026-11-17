export interface Media {
    _id: string;
    type: string;
    url: string;
    metadata: {
      displayOrder?: number;
      thumbnail?: string;
      isPrimary?: boolean;
    };
    isHide: boolean;
  }
  
  export interface ProductName {
    en: string;
    ar?: string;
  }
  
  export interface CategoryName {
    en: string;
    hi?: string;
  }

  export interface NutritionValues {
    calories?: number;
    totalFat?: number;
    saturatedFat?: number;
    transFat?: number;
    cholesterol?: number;
    sodium?: number;
    dietaryFiber?: number;
    sugar?: number;
    protein?: number;
  }

  export interface NutritionInfo {
    servingSize?: string;
    values?: NutritionValues;
    vitaminsAndMinerals?: {
      vitaminA?: number;
      calcium?: number;
      iron?: number;
      potassium?: number;
    };
  }
  
  export interface Modifier {
    id: string;
    storefrontId: string;
    modifierGroupDetailId: string;
    modifierId: string;
    modifierName: ProductName;
    modifierSku?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }

  export interface ModifierGroup {
    id: string;
    storefrontId: string;
    modifierGroupId: string;
    modifierGroupName: ProductName;
    modifiersPrice: number;
    modifiers: Modifier[];
  }

  export interface ProductAttributes {
    containsMeat?: boolean;
  }

  export interface ReorderProduct {
    productId: string;
    productSlug: string;
    productName: ProductName;
    productAttributes?: ProductAttributes;
    media: Media[];
    rating: {
      average: number;
      totalReview: number;
    } | null;
    originalAmount: number;
    discountedAmount: number;
    lastOrderedAt: string | number;
    menuSlug: string;
    categorySlug: string;
    type?: string;
    categoryId?: string;
    categoryName?: CategoryName;
    nutritionInfo?: NutritionInfo;
    modifierGroup?: ModifierGroup[];
  }
  
  export interface ReorderResponse {
    status: string;
    message: string;
    data: ReorderProduct[];
  }