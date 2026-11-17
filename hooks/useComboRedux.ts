import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import {
  fetchComboData,
  setSelectedCombo,
  setOriginalApiResponse,
  setComboData,
  setComboFlowState,
  setSelectedProductSelections,
  updateProductSelection,
  clearComboData,
  clearError,
  type ComboApiResponse,
} from '../redux/slices/comboSlice';
import {
  selectSelectedCombo,
  selectOriginalApiResponse,
  selectComboData,
  selectComboFlowState,
  selectSelectedProductSelections,
  selectComboLoading,
  selectComboError,
  selectMainProductData,
  selectComboSteps,
  selectSummaryStepIndex,
  selectComboPrice,
  selectIsComboComplete,
  selectIsCacheValid,

  selectComboDataWithCacheStatus,
} from '../redux/selectors/comboSelectors';

// Types (reuse from your combo types file)
interface ComboOption {
  id: string;   
  type: 'single' | 'combo';
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
    component: 'mainProduct' | 'productList';
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
    component: 'mainProduct' | 'productList' | 'custom';
  }>;
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

/**
 * Custom hook to replace ComboContext with Redux
 * Provides the same API as the original Context but uses Redux under the hood
 */
export const useComboRedux = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Selectors
  const selectedCombo = useSelector(selectSelectedCombo);
  const originalApiResponse = useSelector(selectOriginalApiResponse);
  const comboData = useSelector(selectComboData);
  const comboFlowState = useSelector(selectComboFlowState);
  const selectedProductSelections = useSelector(selectSelectedProductSelections);
  const loading = useSelector(selectComboLoading);
  const error = useSelector(selectComboError);
  const mainProductData = useSelector(selectMainProductData);
  const comboSteps = useSelector(selectComboSteps);
  const summaryStepIndex = useSelector(selectSummaryStepIndex);
  const comboPrice = useSelector(selectComboPrice);
  const isComboComplete = useSelector(selectIsComboComplete);
  const isCacheValid = useSelector(selectIsCacheValid);
  const comboDataWithCache = useSelector(selectComboDataWithCacheStatus);

  // Actions wrapped in useCallback for performance
  const actions = {
    setSelectedCombo: useCallback((combo: ComboOption | null) => {
      dispatch(setSelectedCombo(combo));
    }, [dispatch]),

    setOriginalApiResponse: useCallback((response: ComboApiResponse | null) => {
      dispatch(setOriginalApiResponse(response));
    }, [dispatch]),

    setComboData: useCallback((data: ComboData | null) => {
      dispatch(setComboData(data));
    }, [dispatch]),

    setComboFlowState: useCallback((state: ComboFlowState | null) => {
      dispatch(setComboFlowState(state));
    }, [dispatch]),

    setSelectedProductSelections: useCallback((selections: { [stepIndex: number]: ComboProductSelection }) => {
      dispatch(setSelectedProductSelections(selections));
    }, [dispatch]),

    updateProductSelection: useCallback((stepIndex: number, selection: ComboProductSelection) => {
      dispatch(updateProductSelection({ stepIndex, selection }));
    }, [dispatch]),

    clearComboData: useCallback(() => {
      dispatch(clearComboData());
    }, [dispatch]),

    clearError: useCallback(() => {
      dispatch(clearError());
    }, [dispatch]),

    // API call action
    fetchComboData: useCallback(async (comboId: string, storeId: string) => {
      try {
        const result = await dispatch(fetchComboData({ comboId, storeId }));
        
        if (fetchComboData.fulfilled.match(result)) {
          return { success: true, fromCache: result.payload.fromCache };
        } else {
          return { success: false, error: result.payload };
        }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    }, [dispatch]),
  };

  // Helper function to match original Context API
  const getMainProductData = useCallback(() => {
    return mainProductData;
  }, [mainProductData]);

  // Return object that matches the original ComboContext interface
  return {
    // State
    selectedCombo,
    originalApiResponse,
    comboData,
    comboFlowState,
    selectedProductSelections,
    loading,
    error,
    
    // Computed values
    mainProductData,
    comboSteps,
    summaryStepIndex,
    comboPrice,
    isComboComplete,
    isCacheValid,
    comboDataWithCache,

    // Actions (same interface as Context)
    setSelectedCombo: actions.setSelectedCombo,
    setOriginalApiResponse: actions.setOriginalApiResponse,
    setComboData: actions.setComboData,
    setComboFlowState: actions.setComboFlowState,
    setSelectedProductSelections: actions.setSelectedProductSelections,
    updateProductSelection: actions.updateProductSelection,
    clearComboData: actions.clearComboData,
    clearError: actions.clearError,
    
    // Helper functions
    getMainProductData,
    
    // New Redux-specific actions
    fetchComboData: actions.fetchComboData,
  };
};

/**
 * Hook for components that only need to read combo data (no actions)
 * More performant for read-only components
 */
export const useComboSelector = () => {
  return {
    selectedCombo: useSelector(selectSelectedCombo),
    originalApiResponse: useSelector(selectOriginalApiResponse),
    comboData: useSelector(selectComboData),
    comboFlowState: useSelector(selectComboFlowState),
    selectedProductSelections: useSelector(selectSelectedProductSelections),
    loading: useSelector(selectComboLoading),
    error: useSelector(selectComboError),
    mainProductData: useSelector(selectMainProductData),
    comboSteps: useSelector(selectComboSteps),
    summaryStepIndex: useSelector(selectSummaryStepIndex),
    comboPrice: useSelector(selectComboPrice),
    isComboComplete: useSelector(selectIsComboComplete),
    isCacheValid: useSelector(selectIsCacheValid),
  };
};

/**
 * Hook for components that only need combo actions (no state)
 * Useful for components that trigger actions but don't need state
 */
export const useComboActions = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  return {
    setSelectedCombo: useCallback((combo: ComboOption | null) => {
      dispatch(setSelectedCombo(combo));
    }, [dispatch]),

    setOriginalApiResponse: useCallback((response: ComboApiResponse | null) => {
      dispatch(setOriginalApiResponse(response));
    }, [dispatch]),

    setComboData: useCallback((data: ComboData | null) => {
      dispatch(setComboData(data));
    }, [dispatch]),

    setComboFlowState: useCallback((state: ComboFlowState | null) => {
      dispatch(setComboFlowState(state));
    }, [dispatch]),

    setSelectedProductSelections: useCallback((selections: { [stepIndex: number]: ComboProductSelection }) => {
      dispatch(setSelectedProductSelections(selections));
    }, [dispatch]),

    updateProductSelection: useCallback((stepIndex: number, selection: ComboProductSelection) => {
      dispatch(updateProductSelection({ stepIndex, selection }));
    }, [dispatch]),

    clearComboData: useCallback(() => {
      dispatch(clearComboData());
    }, [dispatch]),

    clearError: useCallback(() => {
      dispatch(clearError());
    }, [dispatch]),

    fetchComboData: useCallback(async (comboId: string, storeId: string) => {
      const result = await dispatch(fetchComboData({ comboId, storeId }));
      return fetchComboData.fulfilled.match(result);
    }, [dispatch]),
  };
}; 