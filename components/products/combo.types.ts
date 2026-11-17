import { TypesenseProduct } from "@services/typesense";
import { Variant } from "@components/type/pdp.type";
import { Store } from "@components/type/store.types";
import { CartItem, StoreCartData } from "@services/storePage";
import { PLPParams } from '@components/order/order.type';
import { Dispatch, SetStateAction } from "react";

// ComboFlow Props Interface
export interface ComboFlowProps {
  storeData: Store | null | undefined;
  cartData: StoreCartData | null;
  selectedVariant: Variant | null;
  setSelectedVariant: Dispatch<SetStateAction<Variant | null>>;
  urlParams: {
    menuId: string;
    cartItemId: string;
    categoryId: string;
    storeId: string;
    rfcEdit: string;
    redirectFromCartToChose: boolean;
    redirectFromCartToEdit: boolean;
    redirectFromQuantityIncrease: boolean;
    redirectFromPlpChoose: boolean;
    isPDP: boolean;
    isReviewTab: boolean;
  };
  setUrlParams: Dispatch<SetStateAction<{
    menuId: string;
    cartItemId: string;
    categoryId: string;
    storeId: string;
    rfcEdit: string;
    redirectFromCartToChose: boolean;
    redirectFromCartToEdit: boolean;
    redirectFromQuantityIncrease: boolean;
    redirectFromPlpChoose: boolean;
    isPDP: boolean;
    isReviewTab: boolean;
  }>>;
  reviewsSectionRef: React.RefObject<HTMLDivElement | null>;
  CartProductData: CartItem | null;
  handlePlpRedirect: () => void;
  cartItemsCount: number;
  params: PLPParams;
  isLoading: boolean;
  onProductClick?: (product: TypesenseProduct) => void;
  hideProgressBar?: boolean;
}

// Combo View Types
export type ComboView = 'pdp' | 'list' | 'summary';

// Enhanced type for storing both processed and original data
export interface ComboProductSelection {
  processedProduct: TypesenseProduct;
  originalApiData?: {
    productId?: string;
    variantId?: string;
    name?: { en: string };
    media?: Array<{ url: string }>;
    basePrice?: number;
    discountedPrice?: number;
    quantity?: number;
    variantAttributes?: Record<string, string>;
    linkedModifiers?: Array<{
      _id?: string;
      id?: string;
      name?: { en: string };
      status?: string;
      displayOrder?: number;
      config?: {
        min?: number;
        max?: number;
        isMandatory?: boolean;
        isMultiple?: boolean;
        allowHalfAndHalf?: boolean;
        freeQuantity?: number;
      };
      modifiers?: Array<{
        modifierId?: string;
        _id?: string;
        name?: { en: string };
        sku?: string;
        status?: string;
        displayOrder?: number;
        price?: number;
        halfNHalfPrice?: number;
      }>;
      modifierGroupId?: string;
    }>;
  };
}

export type StepSelectedProducts = Record<number, ComboProductSelection | null>;

// API Response Data Types
export interface ApiProductData {
  productId?: string;
  variantId?: string;
  name?: { en?: string };
  media?: Array<{ url: string }>;
  basePrice?: number;
  discountedPrice?: number;
  productCategorySlug?: string;
  productCategoryName?: { en?: string } | string;
  seo?: Record<string, unknown>;
  rating?: { average?: number; count?: number };
  variantAttributes?: Record<string, string>;
  variants?: Array<{
    _id?: string;
    sku?: string;
    attributes?: Array<{ name?: string; value?: string }>;
    basePrice?: number;
    discountedPrice?: number;
    nutritionInfo?: unknown;
    linkedModifiers?: Array<{
      _id?: string;
      id?: string;
      name?: { en: string };
      status?: string;
      displayOrder?: number;
      config?: {
        min?: number;
        max?: number;
        isMandatory?: boolean;
        isMultiple?: boolean;
        allowHalfAndHalf?: boolean;
        freeQuantity?: number;
      };
      modifiers?: Array<{
        modifierId?: string;
        _id?: string;
        name?: { en: string };
        sku?: string;
        status?: string;
        displayOrder?: number;
        price?: number;
        halfNHalfPrice?: number;
      }>;
      modifierGroupId?: string;
    }>;
    bestOffer?: unknown;
  }>;
  linkedModifiers?: Array<{
    _id?: string;
    id?: string;
    name?: { en: string };
    status?: string;
    displayOrder?: number;
    config?: {
      min?: number;
      max?: number;
      isMandatory?: boolean;
      isMultiple?: boolean;
      allowHalfAndHalf?: boolean;
      freeQuantity?: number;
    };
    modifiers?: Array<{
      modifierId?: string;
      _id?: string;
      name?: { en: string };
      sku?: string;
      status?: string;
      displayOrder?: number;
      price?: number;
      halfNHalfPrice?: number;
    }>;
    modifierGroupId?: string;
  }>;
  bestOffer?: unknown;
  accountId?: string;
  ingredients?: {
    dietaryInfo?: {
      containsDairy?: boolean;
      containsEgg?: boolean;
      containsFish?: boolean;
      containsNuts?: boolean;
      containsPeanuts?: boolean;
      containsShellfish?: boolean;
      containsSoy?: boolean;
      containsWheat?: boolean;
    };
    items?: Array<{
      name?: string;
      isAllergenic?: boolean;
      allergenSeverity?: string;
      isRemovable?: boolean;
    }>;
  };
  productAttributes?: {
    containsMeat?: boolean;
    glutenFree?: boolean;
    spicy?: boolean;
    vegan?: boolean;
    vegetarian?: boolean;
  };
  type?: {
    allowHalfHalf?: boolean;
    canBeSoldIndependently?: boolean;
    category?: string;
    hasModifiers?: boolean;
    hasVariants?: boolean;
    isAlsoAProduct?: boolean;
    isModifier?: boolean;
  };
  nutritionInfo?: {
    servingSize?: string;
    values?: Record<string, string | number>;
    vitaminsAndMinerals?: Record<string, string | number>;
  };
  kcal?: string | number;
  sku?: string;
  slug?: string;
  status?: string;
  storefrontId?: string;
  productCategoryId?: string;
  displayOrder?: number;
  createdAt?: number;
  lastModifiedAt?: number;
  group?: unknown[];
  description?: { en?: string } | string;
  overallRatings?: {
    average?: number;
    totalReview?: number;
    starDistribution?: Record<string, number>;
    percentages?: Record<string, number>;
    verifiedStatus?: {
      verified?: number;
      average?: number;
    };
  };
}

// Nutrition Types
export interface NutritionValues {
  [key: string]: string | number;
}

export interface VitaminsAndMinerals {
  [key: string]: string | number;
}

// Combo Step Type
export interface ComboStep {
  name: string;
  productSlug: string;
  categorySlug: string;
  categoryName: string;
  component?: 'mainProduct' | 'productList' | 'custom';
}

// Combo Flow State Type
export interface ComboFlowState {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  currentView: ComboView;
  setCurrentView: (view: ComboView) => void;
  stepSelectedProducts: StepSelectedProducts;
  setStepSelectedProducts: (products: StepSelectedProducts) => void;
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
  editStepIndex: number | null;
  setEditStepIndex: (index: number | null) => void;
  hasChanges: boolean;
  setHasChanges: (hasChanges: boolean) => void;
  originalProducts: StepSelectedProducts;
  setOriginalProducts: (products: StepSelectedProducts) => void;
}

// Combo Navigation Type
export interface ComboNavigation {
  handleNextStep: () => void;
  handleBackStep: () => void;
} 