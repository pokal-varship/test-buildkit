"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { TypesenseProduct } from "@services/typesense";
import { ProductCardList } from "./ProductCardList";
import ComboProgressBar from "./ComboProgressBar";
import ComboSummary from "./ComboSummary";
import { CartItem, ComboGroup } from "@components/order/order.type";
import { useRouter } from "next/navigation";
import ProductDetailPage from "@components/product/MainProduct";
import { ComboFlowProps, StepSelectedProducts } from "./combo.types";
import { processProductData, createProductResponse } from "./combo.utils";
import { useComboFlowState, useComboNavigation } from "./combo.hooks";
import {
  selectOriginalApiResponse,
  selectMainProductData,
  selectComboSteps,
  selectSummaryStepIndex,
} from "@redux/selectors/comboSelectors";
import useProductUrl from "@hooks/useProductUrl";
import { setComboRuntimeUi, setSelectedProductSelections } from "@redux/slices/comboSlice";
import Shimmer from "@components/ui/Shimmer";

type ComboSelectionState = Record<
  number,
  {
    productId: string;
    variantId?: string;
    modifierGroups: Array<{
      modifierGroupId: string;
      modifiers: Array<{ modifierId: string; quantity: number }>;
    }>;
  }
>;

/** Same notion of “combo line” as QuantityControls / cart display (type or nested groups). */
function isComboCartLine(item: CartItem | null | undefined): boolean {
  if (!item) return false;
  const pt = item.productType?.toUpperCase?.() ?? "";
  return (
    pt === "COMBO" ||
    (!!item.comboGroups && item.comboGroups.length > 0)
  );
}

const ComboFlow: React.FC<ComboFlowProps> = ({
  cartData,
  CartProductData,
  urlParams,
  handlePlpRedirect,
  cartItemsCount,
  params,
  hideProgressBar = false
}) => {
  const router = useRouter();
  const { getCategoryUrl } = useProductUrl();
  const dispatch = useDispatch();
  
  // Redux selectors
  const originalApiResponse = useSelector(selectOriginalApiResponse);
  const mainProductData = useSelector(selectMainProductData);
  const comboSteps = useSelector(selectComboSteps);
  const summaryStepIndex = useSelector(selectSummaryStepIndex);

  // Fresh combo flow should not inherit any previous cart-edit selections.
  useEffect(() => {
    if (!urlParams.redirectFromCartToEdit) {
      dispatch(setSelectedProductSelections({} as unknown as ComboSelectionState));
    }
  }, [dispatch, urlParams.redirectFromCartToEdit]);
  
  const {
    currentStep,
    setCurrentStep,
    currentView,
    setCurrentView,
    stepSelectedProducts,
    setStepSelectedProducts,
    isEditMode,
    setIsEditMode,
    editStepIndex,
    setEditStepIndex,
    hasChanges,
    setHasChanges,
    originalProducts,
    setOriginalProducts,
    isSummaryCompleted,
    setIsSummaryCompleted
  } = useComboFlowState();

  const hasInitialized = useRef(false);
  const isAddingToCart = useRef(false);

  const { handleNextStep, handleBackStep } = useComboNavigation(
    currentStep,
    currentView,
    stepSelectedProducts,
    isEditMode,
    editStepIndex,
    setCurrentStep,
    setCurrentView,
    setIsEditMode,
    setEditStepIndex,
    summaryStepIndex
  );

  // Publish combo step + view for layout-level UI (e.g. FloatingCartButton positioning).
  useEffect(() => {
    dispatch(setComboRuntimeUi({ currentStep, currentView }));
  }, [dispatch, currentStep, currentView]);

  // Restore combo state from cart data when coming from cart edit (should run first)
  useEffect(() => {
    // Detect cart edit: only when rfcEdit=true is present (traditional cart edit)
    // This ensures PLP navigation always starts from Step 1, while Cart Edit starts from Summary
    const hasCartItemId = urlParams.cartItemId || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('cid'));
    const isFromCartEdit = urlParams.redirectFromCartToEdit; // Only check for rfcEdit=true
    
    // Don't restore if we're currently adding to cart to prevent UI flicker
    if (isAddingToCart.current) {
      return;
    }
    
    // Restore from HTTP cart and/or PDP-resolved line item (QR flow uses session ticket → CartProductData).
    if (originalApiResponse && isFromCartEdit && hasCartItemId) {
      const cartItemId =
        urlParams.cartItemId ||
        (typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("cid")
          : null);

      let comboCartItem: CartItem | undefined;

      const cartItems = cartData?.data?.items as CartItem[] | undefined;
      if (cartItemId && cartItems?.length) {
        comboCartItem = cartItems.find(
          (item: CartItem) =>
            item.id === cartItemId && isComboCartLine(item) && item.comboGroups
        );
      }

      if (!comboCartItem && cartItemId && CartProductData) {
        // Props type uses store `CartItem` (no comboGroups); runtime QR lines include groups like cart.
        const line = CartProductData as CartItem;
        if (line.id === cartItemId && isComboCartLine(line) && line.comboGroups) {
          comboCartItem = line;
        }
      }

      // Fallback: if no specific item found, get the most recent combo item from cart only
      if (!comboCartItem && cartItems?.length) {
        const comboItems = cartItems.filter(
          (item: CartItem) => isComboCartLine(item) && item.comboGroups
        );
        if (comboItems.length > 0) {
          comboCartItem = comboItems[comboItems.length - 1];
        }
      }
      
      if (comboCartItem && comboCartItem.comboGroups && comboCartItem.comboGroups.length > 0) {
        const restoredProducts: StepSelectedProducts = {};
        const restoredSelections: ComboSelectionState = {};

        const mapCartModifierGroups = (
          groups: unknown
        ): Array<{ modifierGroupId: string; modifiers: Array<{ modifierId: string; quantity: number }> }> => {
          const safeGroups = Array.isArray(groups) ? groups : [];
          return safeGroups
            .map((g) => {
              const groupRecord = g as { modifierGroupId?: unknown; id?: unknown; _id?: unknown; modifiers?: unknown };
              const groupId = String(
                groupRecord?.modifierGroupId ?? groupRecord?.id ?? groupRecord?._id ?? ""
              );
              const modifiersRaw = (g as { modifiers?: unknown })?.modifiers;
              const modifiers = (Array.isArray(modifiersRaw) ? modifiersRaw : [])
                .map((m) => ({
                  modifierId: String(
                    (m as { modifierId?: unknown; id?: unknown; _id?: unknown })?.modifierId ??
                      (m as { modifierId?: unknown; id?: unknown; _id?: unknown })?.id ??
                      (m as { modifierId?: unknown; id?: unknown; _id?: unknown })?._id ??
                      ""
                  ),
                  quantity: Number((m as { quantity?: unknown })?.quantity ?? 1),
                }))
                .filter((m) => Boolean(m.modifierId));
              return { modifierGroupId: groupId, modifiers };
            })
            .filter((g) => Boolean(g.modifierGroupId) && g.modifiers.length > 0);
        };
        
        // Restore main product (step 0)
        if (originalApiResponse.primaryProduct) {
          // For combo items, the productId should be the main combo product ID
          const mainProductId = comboCartItem.productId;
          const apiMainProductId = originalApiResponse.primaryProduct.productId;
          
          if (mainProductId === apiMainProductId) {
            const mainProduct = processProductData(originalApiResponse.primaryProduct, 0);
            restoredProducts[0] = {
              processedProduct: mainProduct,
              originalApiData: originalApiResponse.primaryProduct
            };
          } else {

            // Still restore the main product from API as fallback
            const mainProduct = processProductData(originalApiResponse.primaryProduct, 0);
            restoredProducts[0] = {
              processedProduct: mainProduct,
              originalApiData: originalApiResponse.primaryProduct
            };
          }

          // Restore selections (variant + modifiers) for main product.
          // In cart response for combos, primary product customizations live under the combo group with `groupName: "Primary"`,
          // not on the combo cart item itself.
          const primaryGroupFromCart = (comboCartItem.comboGroups || []).find((g) => {
            const name = String((g as { groupName?: unknown })?.groupName ?? "").toLowerCase();
            return name === "primary";
          });

          restoredSelections[0] = {
            productId: String(primaryGroupFromCart?.productId ?? apiMainProductId ?? mainProductId ?? ""),
            ...((primaryGroupFromCart as unknown as { variantId?: unknown })?.variantId
              ? { variantId: String((primaryGroupFromCart as unknown as { variantId?: unknown })?.variantId) }
              : {}),
            modifierGroups: mapCartModifierGroups(primaryGroupFromCart?.modifierGroup),
          };
        }
        
        // Process combo groups from cart data
        comboCartItem.comboGroups.forEach((comboGroup: ComboGroup, groupIndex: number) => {
          // Find the corresponding group in the API response by groupName
          const apiGroup = originalApiResponse.group?.find(
            group => group.name === comboGroup.groupName
          );
          
          if (apiGroup) {
            // Calculate the correct step index based on the group's position in the API response
            const groupIndexInApi = originalApiResponse.group?.findIndex(
              group => group.name === comboGroup.groupName
            );
            const stepIndex = groupIndexInApi !== undefined && groupIndexInApi >= 0 ? groupIndexInApi + 1 : groupIndex + 1;
            
            // Find the exact product by productId and variantAttributes from the ComboGroup
            let selectedProductInGroup = apiGroup.groupDetails.find(
              detail => detail.productId === comboGroup.productId
            );
            
            // If we have variant attributes in the cart data, try to match by variant as well
            if (comboGroup.variantAttributes && Object.keys(comboGroup.variantAttributes).length > 0) {
              const cartVariantValues = Object.values(comboGroup.variantAttributes);
              
              // Try to find a product that matches both productId and variant attributes
              const variantMatch = apiGroup.groupDetails.find(detail => {
                const productMatches = detail.productId === comboGroup.productId;
                const variantMatches = detail.variantAttributes && 
                  Object.values(detail.variantAttributes).some(value => 
                    cartVariantValues.includes(value)
                  );
                return productMatches && variantMatches;
              });
              
              if (variantMatch) {
                selectedProductInGroup = variantMatch;
              }
            }
            
            if (selectedProductInGroup) {
              const processedProduct = processProductData(selectedProductInGroup, stepIndex);
              restoredProducts[stepIndex] = {
                processedProduct: processedProduct,
                originalApiData: selectedProductInGroup
              };

              // Restore selections (variant + modifiers) for this combo step from cart comboGroup
              const comboGroupAny = comboGroup as unknown as { variantId?: unknown; modifierGroup?: unknown; productId?: unknown };
              restoredSelections[stepIndex] = {
                productId: String(comboGroupAny.productId ?? selectedProductInGroup.productId ?? ""),
                ...(comboGroupAny.variantId ? { variantId: String(comboGroupAny.variantId) } : {}),
                modifierGroups: mapCartModifierGroups(comboGroupAny.modifierGroup),
              };
            } else {
            }
          } else {
          }
        });
        
        // Check if we have all required products (main product + all combo groups)
        const expectedProductCount = comboCartItem.comboGroups.length + 1; // +1 for main product
        const actualProductCount = Object.keys(restoredProducts).length;
        const hasAllRequiredProducts = actualProductCount === expectedProductCount;
        
        if (hasAllRequiredProducts) {
          // Set all restored products at once
          setStepSelectedProducts(restoredProducts);

          // Populate Redux selections so PDP shows preselected options during edit
          dispatch(setSelectedProductSelections(restoredSelections as unknown as ComboSelectionState));
          
          // Store original products for comparison (deep copy)
          setOriginalProducts(JSON.parse(JSON.stringify(restoredProducts)));
          
          // Set current step to summary to show all products
          setCurrentStep(summaryStepIndex);
          setCurrentView('summary');
        } else {
          // Only set products if we have at least the main product and some combo products
          if (actualProductCount > 1) {
            setStepSelectedProducts(restoredProducts);
            dispatch(setSelectedProductSelections(restoredSelections as unknown as ComboSelectionState));
            setOriginalProducts(JSON.parse(JSON.stringify(restoredProducts)));
            setCurrentStep(summaryStepIndex);
            setCurrentView('summary');
          }
        }
      }
    }
  }, [
    cartData,
    CartProductData,
    originalApiResponse,
    dispatch,
    setStepSelectedProducts,
    setCurrentStep,
    setCurrentView,
    setOriginalProducts,
    summaryStepIndex,
    urlParams.redirectFromCartToEdit,
    urlParams.cartItemId,
  ]);

  // Reset the adding to cart flag when component unmounts or when we're not on summary view
  useEffect(() => {
    if (currentView !== 'summary') {
      isAddingToCart.current = false;
      // Reset summary completion when navigating away from summary
      setIsSummaryCompleted(false);
    }
  }, [currentView, setIsSummaryCompleted]);

  // Track changes when products are modified
  useEffect(() => {
    if (Object.keys(originalProducts).length > 0) {
      const currentProductsJson = JSON.stringify(stepSelectedProducts);
      const originalProductsJson = JSON.stringify(originalProducts);
      const hasProductsChanged = currentProductsJson !== originalProductsJson;
      setHasChanges(hasProductsChanged);
    }
  }, [stepSelectedProducts, originalProducts, setHasChanges]);

  // Initialize main product using unified approach (should run after cart restoration)
  useEffect(() => {
    if (mainProductData && !stepSelectedProducts[0] && !hasInitialized.current) {
      hasInitialized.current = true;
      
      // Use unified function to process main product
      const mainProduct = processProductData(mainProductData, 0);
      setStepSelectedProducts(prev => ({ 
        ...prev, 
        0: {
          processedProduct: mainProduct,
          originalApiData: mainProductData
        }
      }));
    }
  }, [mainProductData, stepSelectedProducts, setStepSelectedProducts]);

  // Initialize from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const stepFromUrl = urlParams.get('step');
      if (stepFromUrl) {
        const stepNumber = parseInt(stepFromUrl);
        if (stepNumber >= 0 && stepNumber <= summaryStepIndex) {
          setCurrentStep(stepNumber);
        }
      }
    }
  }, [setCurrentStep, summaryStepIndex, comboSteps.length]);

  // Auto-set currentView to 'summary' when on summary step
  useEffect(() => {
    if (currentStep === summaryStepIndex && currentView !== 'summary') {
      setCurrentView('summary');
    }
  }, [currentStep, summaryStepIndex, currentView, setCurrentView]);

  const handleProductSelect = useCallback((product: TypesenseProduct) => {
    // Store both the processed product and the original API data
    const originalIndex = product.originalIndex;
    const originalApiData = originalIndex !== undefined ? 
      originalApiResponse?.group?.[currentStep - 1]?.groupDetails?.[originalIndex] : 
      undefined;
    
    setStepSelectedProducts(prev => ({ 
      ...prev, 
      [currentStep]: {
        processedProduct: product,
        originalApiData
      }
    }));
    setCurrentView('pdp');
  }, [currentStep, setStepSelectedProducts, setCurrentView, originalApiResponse]);

  const handleCloseCombo = useCallback(() => {
    const storeSlug = params?.storeSlug as string;
    const menuSlug = params?.menuSlug as string;
    const categorySlug = mainProductData?.productCategorySlug || params?.categorySlug as string;
    
    if (storeSlug && menuSlug && categorySlug) {
      router.push(getCategoryUrl(categorySlug, menuSlug, storeSlug));
    } else {
      router.back();
    }
  }, [params, mainProductData, router, getCategoryUrl]);

  // Unified function to get products for any step
  const getProductsForCurrentStep = useCallback(() => {
    if (!originalApiResponse?.group || currentStep === 0) {
      return [];
    }
    
    const stepGroup = originalApiResponse.group[currentStep - 1];
    if (!stepGroup) return [];
    
    // Map first to preserve original index, then filter out deleted products
    return stepGroup.groupDetails
      .map((detail, originalIndex) => {
        // Use unified function to process combo products
        const processedProduct = processProductData(detail, currentStep);
        // Add the original index from the unfiltered array to help with matching later
        processedProduct.originalIndex = originalIndex;
        return {
          processedProduct,
          detail,
          isDeleted: detail.status?.toLowerCase() === "deleted"
        };
      })
      .filter((item) => !item.isDeleted)
      .map((item) => item.processedProduct);
  }, [originalApiResponse, currentStep]);

  const renderMainProductContent = useCallback(() => {
    if (!mainProductData) {
      return (
        <div className="full flex flex-col md:flex-row gap-x-4 h-screen">
          <div className="w-full md:w-[40%] lg:w-[30%] flex flex-col gap-4 ">
            <Shimmer className="w-full h-full" height="100%" />
          </div>
          <div className="w-full flex-1 flex flex-col justify-between ">
            <Shimmer className="w-full h-full" height="48%" />
            <Shimmer className="w-full h-full md:hidden" height="50%" />
          </div>
        </div>
      );
    }

    // Use unified function to create ProductResponse
    const mainProduct = processProductData(mainProductData, 0);
    const mainProductResponse = createProductResponse(mainProduct);

    return (
      <ProductDetailPage 
        initialProductData={mainProductResponse}
        key={`main-pdp-${mainProductData.productId}`}
        hideComboFlow={true}
        goToNextStep={handleNextStep}
        goToBackStep={handleBackStep}
        currentStepIndex={currentStep}
        isCombo={true}
        comboPrefillEnabled={isEditMode}
      />
    );
  }, [mainProductData, handleNextStep, handleBackStep, currentStep, isEditMode]);

  const renderStepContent = useCallback(() => {
    // Show summary if currentView is 'summary' OR if we're on summary step
    if (currentView === 'summary' || currentStep === summaryStepIndex) {
      return (
        <ComboSummary
          selectedProducts={stepSelectedProducts}
          onProductChange={(stepIndex) => {
            setIsEditMode(true);
            setEditStepIndex(stepIndex);
            setCurrentStep(stepIndex);
            setCurrentView('list');
            setIsSummaryCompleted(false); // Reset completion when editing
          }}
          onProductEdit={(stepIndex) => {
            setIsEditMode(true);
            setEditStepIndex(stepIndex);
            setCurrentStep(stepIndex);
            setCurrentView('pdp');
            setIsSummaryCompleted(false); // Reset completion when editing
          }}
          onAddToCartStart={() => {
            isAddingToCart.current = true;
            // Reset the flag after a short delay to ensure it's cleared
            setTimeout(() => {
              isAddingToCart.current = false;
            }, 2000);
          }}
          onAddToCartSuccess={() => {
            setIsSummaryCompleted(true);
          }}
          comboData={null}
        />
      );
    }
    
    // Show main product content
    if (currentStep === 0) {
      return renderMainProductContent();
    }
    
    // Show product list or PDP for add-on steps
    if (currentStep > 0 && currentStep < summaryStepIndex) {
      if (currentView === 'pdp') {
        const selectedProductData = stepSelectedProducts[currentStep];
        if (selectedProductData) {
          // Use original API data if available, otherwise use processed product
          const productToUse = selectedProductData.originalApiData ? 
            processProductData(selectedProductData.originalApiData, currentStep) : 
            selectedProductData.processedProduct;
          const productResponse = createProductResponse(productToUse);
          
          return (
            <div className="relative">
              <ProductDetailPage 
                initialProductData={productResponse}
                key={`pdp-${selectedProductData.processedProduct.id}`}
                hideComboFlow={true}
                goToNextStep={handleNextStep}
                goToBackStep={handleBackStep}
                currentStepIndex={currentStep}
                isCombo={true}
                comboPrefillEnabled={isEditMode}
              />
            </div>
          );
        }
      } else if (currentView === 'list') {
        const stepProducts = getProductsForCurrentStep();
        const stepName = comboSteps[currentStep]?.name || `Step ${currentStep}`;
        
        return (
          <div
            className={`w-full md:px-8 lg:px-28 pt-4 combo-list-container ${
              cartItemsCount > 0 ? "pb-10" : ""
            }`}
          >
            <div className="md:pt-5 px-4">
              <div className="w-full mb-1 md:mb-7">
                <h2 className="text-xl md-heading-1 listing-title font-semibold text-[var(--primary-text)]">
                  {stepName}
                </h2>
              </div>
              
              {stepProducts.length > 0 ? (
                <div className="md:grid md:grid-cols-2 gap-4">
                  {stepProducts.map((product) => (
                    <div
                      key={product.id}
                      className="cursor-pointer h-full"
                    >
                      <ProductCardList 
                        product={product} 
                        onCardClick={handleProductSelect} 
                        isGridMode={true} 
                        hidePrice={true}
                        showAddButton={true}
                        onAddClick={handleProductSelect}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full h-[min-content] pt-24 md:w-[80%] text-center p-4 flex flex-wrap justify-center items-center content-center">
                  <img
                    fetchPriority="high"
                    src="/images/no-product.svg"
                    alt="No Product found"
                    title="No Product found"
                    width={100}
                    height={100}
                    className="text-center"
                  />
                  <p className="w-full text-center pt-2 font-[var(--font-semi-bold)]">
                    No products found for this step
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      }
    }
    
    // Fallback to main product content
    return renderMainProductContent();
  }, [
    currentStep,
    currentView,
    stepSelectedProducts,
    getProductsForCurrentStep,
    handleProductSelect,
    handleNextStep,
    renderMainProductContent,
    setIsEditMode,
    setEditStepIndex,
    setCurrentStep,
    setCurrentView,
    summaryStepIndex,
    comboSteps,
    handleBackStep,
    setIsSummaryCompleted,
    isEditMode,
    cartItemsCount,
  ]);

  const handleStepClick = useCallback((stepIndex: number) => {
    if (stepIndex === 0) {
      // For the first step (main product), stay on the same page but show the product selection
      setCurrentStep(0);
      setCurrentView('list');
    } else if (stepIndex === summaryStepIndex) {
      setCurrentView('summary');
      setCurrentStep(summaryStepIndex);
    } else {
      setCurrentStep(stepIndex);
      setCurrentView('list');
    }
  }, [setCurrentView, setCurrentStep, summaryStepIndex]);

  // Progress bar needs to know what kind of screen is currently rendered.
  // Step 0 always renders the main PDP (regardless of currentView).
  const progressBarPageType: 'pdp' | 'listing' | 'summary' =
    currentStep === 0
      ? 'pdp'
      : currentView === 'summary' || currentStep === summaryStepIndex
        ? 'summary'
        : currentView === 'pdp'
          ? 'pdp'
          : 'listing';

  return (
    <>
      {!hideProgressBar && (
        <ComboProgressBar
          isVisible={true}
          currentStepIndex={currentStep}
          onClose={handleCloseCombo}
          handlePlpRedirect={handlePlpRedirect}
          comboSteps={comboSteps}
          onStepClick={handleStepClick}
          onBackStep={handleBackStep}
          showBackButton={progressBarPageType === 'listing'}
          pageType={progressBarPageType}
          isFromCartEdit={urlParams.redirectFromCartToEdit}
          hasChanges={hasChanges}
          isSummaryCompleted={isSummaryCompleted}
          summaryStepIndex={summaryStepIndex}
        />
      )}
      
      {renderStepContent()}
      
      <style>
        {`
        .pdp-page {
          font-family: var(--font-family);
          background-color: var(--primary-background);        
         }

        .product-icons-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 18px 24px;
          background: linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(24, 17, 17, 0.46) 100%);
          z-index: 20;
          height: 60px;
        }

        .cart-count-badge {
          position: absolute;
          top: -7px;
          right: -5px;
          background-color: var(--warning-light);
          color: var(--primary-text-light);
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          font-family: var(--font-family);
          min-width: 16px;
          box-sizing: border-box;
        }

        @media (min-width: 768px) {
          .product-icons-overlay {
            display: none;
          }
        }
        @media (min-width: 768px) {
          .md-heading-1 {
            font-size: var(--heading-h1) !important;  
          }
        }
        .listing-title{
          font-size: 23px;
        }
        @media (max-width: 768px) {
          .combo-list-container {
            background: var(--quaternary-background);
          }
            `}
      </style>
    </>
  );
};

export default ComboFlow; 