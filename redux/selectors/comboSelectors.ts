import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Base selectors
export const selectComboState = (state: RootState) => state.combo;
export const selectSelectedCombo = (state: RootState) => state.combo.selectedCombo;
export const selectOriginalApiResponse = (state: RootState) => state.combo.originalApiResponse;
export const selectComboData = (state: RootState) => state.combo.comboData;
export const selectComboFlowState = (state: RootState) => state.combo.comboFlowState;
export const selectComboRuntimeUi = (state: RootState) => state.combo.runtimeUi;
export const selectSelectedProductSelections = (state: RootState) => state.combo.selectedProductSelections;
export const selectComboLoading = (state: RootState) => state.combo.loading;
export const selectComboError = (state: RootState) => state.combo.error;
export const selectLastFetched = (state: RootState) => state.combo.lastFetched;

// Memoized selectors using createSelector for performance
export const selectMainProductData = createSelector(
  [selectOriginalApiResponse],
  (apiResponse) => {
    return apiResponse?.primaryProduct || null;
  }
);

export const selectComboSteps = createSelector(
  [selectOriginalApiResponse],
  (apiResponse) => {
    if (!apiResponse) return [];
    
    const mainProductCategoryName = apiResponse.primaryProduct?.productCategoryName?.en || 
                                   apiResponse.primaryProduct?.name?.en || 
                                   'Main Product';
    const groupNames = apiResponse.group?.map(group => group.name) || [];
    
    const steps: Array<{
      name: string;
      productSlug: string;
      categorySlug: string;
      categoryName: string;
      component: 'mainProduct' | 'productList' | 'custom';
    }> = [
      { 
        name: 'Main Product', 
        productSlug: 'main', 
        categorySlug: 'main', 
        categoryName: mainProductCategoryName, 
        component: 'mainProduct'
      }
    ];
    
    groupNames.forEach((groupName) => {
      steps.push({
        name: groupName,
        productSlug: groupName.toLowerCase(),
        categorySlug: groupName.toLowerCase(),
        categoryName: groupName,
        component: 'productList'
      });
    });
    
    steps.push({
      name: 'Summary',
      productSlug: 'summary',
      categorySlug: 'summary',
      categoryName: 'Summary',
      component: 'custom'
    });
    
    return steps;
  }
);

export const selectSummaryStepIndex = createSelector(
  [selectComboSteps],
  (comboSteps) => {
    return comboSteps.length - 1; // Summary is always the last step
  }
);

export const selectComboGroups = createSelector(
  [selectOriginalApiResponse],
  (apiResponse) => {
    return apiResponse?.group || [];
  }
);

export const selectProductsForStep = createSelector(
  [selectOriginalApiResponse, (state: RootState, stepIndex: number) => stepIndex],
  (apiResponse, stepIndex) => {
    if (!apiResponse?.group || stepIndex === 0) {
      return [];
    }
    
    const stepGroup = apiResponse.group[stepIndex - 1];
    return stepGroup?.groupDetails || [];
  }
);

export const selectComboPrice = createSelector(
  [selectOriginalApiResponse],
  (apiResponse) => {
    return {
      totalPrice: apiResponse?.discountedPrice || 0,
      originalPrice: apiResponse?.basePrice || 0,
      savings: (apiResponse?.basePrice || 0) - (apiResponse?.discountedPrice || 0)
    };
  }
);

export const selectIsComboComplete = createSelector(
  [selectSelectedProductSelections, selectSummaryStepIndex],
  (selections, summaryStepIndex) => {
    // Check if all required steps have selections (main product + add-ons, excluding summary)
    const requiredSteps = Array.from({ length: summaryStepIndex }, (_, i) => i);
    
    return requiredSteps.every(stepIndex => {
      return selections[stepIndex] !== null && selections[stepIndex] !== undefined;
    });
  }
);

export const selectProductSelectionForStep = createSelector(
  [selectSelectedProductSelections, (state: RootState, stepIndex: number) => stepIndex],
  (selections, stepIndex) => {
    return selections[stepIndex] || null;
  }
);

export const selectStepDynamicNames = createSelector(
  [selectOriginalApiResponse],
  (apiResponse) => {
    if (!apiResponse) return [];
    
    // Get main product category name from API response
    const mainProductCategoryName = apiResponse.primaryProduct?.productCategoryName?.en || 'Main Product';
    
    // Get group names from API response  
    const groupNames = apiResponse.group?.map(group => group.name) || [];
    
    // Build dynamic step names
    const stepNames = [mainProductCategoryName];
    
    // Add group names
    groupNames.forEach((groupName) => {
      stepNames.push(groupName);
    });
    
    return stepNames;
  }
);

export const selectIsCacheValid = createSelector(
  [selectLastFetched, selectComboState],
  (lastFetched, comboState) => {
    if (!lastFetched) return false;
    
    const now = Date.now();
    return (now - lastFetched) < comboState.cacheExpiry;
  }
);

// Selector for getting combo data with cache status
export const selectComboDataWithCacheStatus = createSelector(
  [selectOriginalApiResponse, selectIsCacheValid, selectLastFetched],
  (apiResponse, isCacheValid, lastFetched) => {
    return {
      data: apiResponse,
      isCacheValid,
      lastFetched,
      hasData: !!apiResponse
    };
  }
);

// Selector for checking if specific combo ID is already loaded
export const selectIsComboLoaded = createSelector(
  [selectOriginalApiResponse, (state: RootState, comboId: string) => comboId],
  (apiResponse, comboId) => {
    return apiResponse?.id === comboId;
  }
);

// Performance selector - returns summary of combo state for debugging
export const selectComboStateSummary = createSelector(
  [selectComboState],
  (comboState) => {
    return {
      hasSelectedCombo: !!comboState.selectedCombo,
      hasApiResponse: !!comboState.originalApiResponse,
      hasComboData: !!comboState.comboData,
      hasFlowState: !!comboState.comboFlowState,
      selectedProductsCount: Object.keys(comboState.selectedProductSelections).length,
      loading: comboState.loading,
      error: comboState.error,
      cacheStatus: {
        lastFetched: comboState.lastFetched,
        isValid: comboState.lastFetched ? 
          (Date.now() - comboState.lastFetched) < comboState.cacheExpiry : 
          false
      }
    };
  }
); 