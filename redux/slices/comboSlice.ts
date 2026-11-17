import { createSlice, createAsyncThunk, PayloadAction, createAction } from "@reduxjs/toolkit";

// Import types from your combo context
interface ComboApiMedia {
  url: string;
}

interface ComboApiProduct {
  productId: string;
  variantId?: string;
  productCategoryName?: {
    en: string;
  };
  productCategorySlug?: string;
  basePrice: number;
  discountedPrice: number;
  name?: {
    en: string;
  };
  media?: ComboApiMedia[];
  seo?: {
    urlManagement?: {
      customSlug?: string;
    };
  };
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
}

interface ComboApiGroupDetail {
  productId?: string;
  variantId?: string;
  name?: {
    en: string;
  };
  media?: ComboApiMedia[];
  basePrice?: number;
  discountedPrice?: number;
  quantity?: number;
  variantAttributes?: Record<string, string>;
  status?: string;
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
}

interface ComboApiGroup {
  name: string;
  groupDetails: ComboApiGroupDetail[];
}

export interface ComboApiResponse {
  id: string;
  basePrice: number;
  discountedPrice: number;
  primaryProduct: ComboApiProduct;
  group?: ComboApiGroup[];
}

interface SelectedModifier {
  modifierId: string;
  quantity: number;
}

interface SelectedModifierGroup {
  modifierGroupId: string;
  modifiers: SelectedModifier[];
}

interface ComboProductSelection {
  productId: string;
  variantId?: string;
  modifierGroups: SelectedModifierGroup[];
}

interface ComboOption {
  id: string;
  type: "single" | "combo";
  title: string;
  price: number;
  discountedPrice: number;
  description?: string;
  savings?: number | null;
  includes?: { image: string; label: string }[];
  primaryProduct: {
    image: string;
    name: string;
    customSlug?: string;
    productCategorySlug?: string;
    productCategoryName?: string;
  };
  groupDetails?: {
    image: string;
    name: string;
    customSlug?: string;
    productCategorySlug?: string;
    categoryName?: string;
  }[];
}

interface ComboData {
  comboId: string;
  comboName: string;
  comboPrice: number;
  comboOriginalPrice: number;
  comboSteps: Array<{
    name: string;
    productSlug: string;
    categorySlug: string;
    categoryName: string;
    component: "mainProduct" | "productList";
  }>;
}

interface ComboFlowState {
  currentStepIndex: number;
  selectedProducts: { [key: number]: unknown };
  comboSteps: Array<{
    name: string;
    productSlug: string;
    categorySlug: string;
    categoryName: string;
    component: "mainProduct" | "productList" | "custom";
  }>;
}

type ComboRuntimeUi = {
  currentStep: number;
  currentView: "pdp" | "list" | "summary";
} | null;

// Redux State Interface
export interface ComboState {
  selectedCombo: ComboOption | null;
  originalApiResponse: ComboApiResponse | null;
  comboData: ComboData | null;
  comboFlowState: ComboFlowState | null;
  selectedProductSelections: { [stepIndex: number]: ComboProductSelection };
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Cache management
  lastFetched: number | null;
  cacheExpiry: number; // 5 minutes default

  // Runtime-only UI state (do not persist to URL)
  runtimeUi: ComboRuntimeUi;
}

const initialState: ComboState = {
  selectedCombo: null,
  originalApiResponse: null,
  comboData: null,
  comboFlowState: null,
  selectedProductSelections: {},
  loading: false,
  error: null,
  lastFetched: null,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes in milliseconds
  runtimeUi: null,
};

// Async Thunks
export const fetchComboData = createAsyncThunk(
  "combo/fetchComboData",
  async (params: { comboId: string; storeId: string }, { rejectWithValue, getState }) => {
    try {
      // Check if we have cached data that is still valid
      const state = getState() as { combo: ComboState };
      const now = Date.now();
      
      if (
        state.combo.originalApiResponse?.id === params.comboId &&
        state.combo.lastFetched &&
        (now - state.combo.lastFetched) < state.combo.cacheExpiry
      ) {
        // Return cached data from Redux state
        return {
          data: state.combo.originalApiResponse,
          fromCache: true
        };
      }

      // Make API call - replace with your actual API endpoint
      const response = await fetch(`/api/combo/${params.comboId}?storeId=${params.storeId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch combo data: ${response.statusText}`);
      }

      const data: ComboApiResponse = await response.json();
      
      return {
        data,
        fromCache: false
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch combo data");
    }
  }
);

// Create slice
const comboSlice = createSlice({
  name: "combo",
  initialState,
  reducers: {
    setSelectedCombo: (state, action: PayloadAction<ComboOption | null>) => {
      state.selectedCombo = action.payload;
    },
    
    setOriginalApiResponse: (state, action: PayloadAction<ComboApiResponse | null>) => {
      state.originalApiResponse = action.payload;
      state.lastFetched = action.payload ? Date.now() : null;
    },
    
    setComboData: (state, action: PayloadAction<ComboData | null>) => {
      state.comboData = action.payload;
    },
    
    setComboFlowState: (state, action: PayloadAction<ComboFlowState | null>) => {
      state.comboFlowState = action.payload;
    },
    
    setSelectedProductSelections: (state, action: PayloadAction<{ [stepIndex: number]: ComboProductSelection }>) => {
      state.selectedProductSelections = action.payload;
    },

    setComboRuntimeUi: (
      state,
      action: PayloadAction<{ currentStep: number; currentView: "pdp" | "list" | "summary" } | null>
    ) => {
      state.runtimeUi = action.payload;
    },
    
    updateProductSelection: (state, action: PayloadAction<{ stepIndex: number; selection: ComboProductSelection }>) => {
      const { stepIndex, selection } = action.payload;
      state.selectedProductSelections[stepIndex] = selection;
    },
    
    clearComboData: (state) => {
      state.selectedCombo = null;
      state.originalApiResponse = null;
      state.comboData = null;
      state.comboFlowState = null;
      state.selectedProductSelections = {};
      state.loading = false;
      state.error = null;
      state.lastFetched = null;
      state.runtimeUi = null;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(fetchComboData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComboData.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        
        if (!action.payload.fromCache) {
          state.originalApiResponse = action.payload.data;
          state.lastFetched = Date.now();
        }
      })
      .addCase(fetchComboData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(resetComboState, (state) => {
        // Reset all combo-related state
        state.selectedCombo = null;
        state.originalApiResponse = null;
        state.comboData = null;
        state.comboFlowState = null;
        state.selectedProductSelections = {};
        state.loading = false;
        state.error = null;
        state.lastFetched = null;
        state.runtimeUi = null;
      });
  },
});

export const resetComboState = createAction('combo/resetComboState');

export const {
  setSelectedCombo,
  setOriginalApiResponse,
  setComboData,
  setComboFlowState,
  setSelectedProductSelections,
  setComboRuntimeUi,
  updateProductSelection,
  clearComboData,
  clearError,
} = comboSlice.actions;

export default comboSlice.reducer;
