import { useState, useCallback, useEffect } from "react";
import { ComboView, StepSelectedProducts } from "./combo.types";
import { useDispatch } from "react-redux";
import { updateProductSelection } from "@redux/slices/comboSlice";
import type { LinkedModifier, Modifier, ProductResponse, Variant } from "@components/type/pdp.type";

// Custom hook for ComboFlow state management
export const useComboFlowState = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentView, setCurrentView] = useState<ComboView>('pdp');
  const [stepSelectedProducts, setStepSelectedProducts] = useState<StepSelectedProducts>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editStepIndex, setEditStepIndex] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalProducts, setOriginalProducts] = useState<StepSelectedProducts>({});
  const [isSummaryCompleted, setIsSummaryCompleted] = useState(false);

  return {
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
  };
};

// Custom hook for ComboFlow navigation
export const useComboNavigation = (
  currentStep: number,
  currentView: ComboView,
  stepSelectedProducts: StepSelectedProducts,
  isEditMode: boolean,
  editStepIndex: number | null,
  setCurrentStep: (step: number) => void,
  setCurrentView: (view: ComboView) => void,
  setIsEditMode: (mode: boolean) => void,
  setEditStepIndex: (index: number | null) => void,
  summaryStepIndex: number = 3
) => {
  const handleNextStep = useCallback(() => {
    if (currentView === 'pdp') {
      if (isEditMode && editStepIndex !== null) {
        setCurrentView('summary');
        setCurrentStep(summaryStepIndex);
        setIsEditMode(false);
        setEditStepIndex(null);
        return;
      }
      
      // Check if we're on the last add-on step (before summary)
      const lastAddOnStep = summaryStepIndex - 1;
      if (currentStep < lastAddOnStep) {
        setCurrentView('list');
        setCurrentStep(currentStep + 1);
      } else {
        setCurrentView('summary');
        setCurrentStep(summaryStepIndex);
      }
    } else if (currentView === 'list') {
      const selectedProduct = stepSelectedProducts[currentStep];
      if (selectedProduct) {
        setCurrentView('pdp');
      }
    }
  }, [currentView, currentStep, isEditMode, editStepIndex, stepSelectedProducts, setCurrentStep, setCurrentView, setIsEditMode, setEditStepIndex, summaryStepIndex]);

  const handleBackStep = useCallback(() => {
    if (currentView === 'pdp') {
      if (isEditMode && editStepIndex !== null) {
        setCurrentView('summary');
        setCurrentStep(summaryStepIndex);
        setIsEditMode(false);
        setEditStepIndex(null);
        return;
      }
      
      // When on PDP, go back to the listing page of the current step
      setCurrentView('list');
    } else if (currentView === 'list') {
      if (isEditMode && editStepIndex !== null) {
        setCurrentView('summary');
        setCurrentStep(summaryStepIndex);
        setIsEditMode(false);
        setEditStepIndex(null);
        return;
      }
      
      // When on listing page, go back to the previous step's PDP or listing
      if (currentStep > 0) {
        setCurrentView('pdp');
        setCurrentStep(currentStep - 1);
      }
    } else if (currentView === 'summary') {
      // Go back to the last add-on step
      const lastAddOnStep = summaryStepIndex - 1;
      const lastProduct = stepSelectedProducts[lastAddOnStep];
      if (lastProduct) {
        setCurrentView('pdp');
        setCurrentStep(lastAddOnStep);
      } else {
        setCurrentView('list');
        setCurrentStep(lastAddOnStep);
      }
    }
  }, [currentView, currentStep, isEditMode, editStepIndex, stepSelectedProducts, setCurrentStep, setCurrentView, setIsEditMode, setEditStepIndex, summaryStepIndex]);

  return { handleNextStep, handleBackStep };
}; 

type PersistComboSelectionArgs = {
  isComboStepFlow: boolean;
  currentStepIndex: number | null | undefined;
  productId: string | undefined;
  isVariantFlowEnabled: boolean;
  selectedVariantId: string | undefined;
  selectedModifiers: Array<{
    modifierGroup?: { id?: unknown; _id?: unknown };
    modifiers?: Array<{ modifierId?: unknown }>;
  }>;
};

export const usePersistComboSelectionForStep = ({
  isComboStepFlow,
  currentStepIndex,
  productId,
  isVariantFlowEnabled,
  selectedVariantId,
  selectedModifiers,
}: PersistComboSelectionArgs) => {
  const dispatch = useDispatch();

  return useCallback(() => {
    if (!isComboStepFlow) return;
    if (currentStepIndex === undefined || currentStepIndex === null) return;
    if (!productId) return;

    const modifierGroups =
      selectedModifiers
        ?.map((modGrp) => ({
          modifierGroupId: String(modGrp?.modifierGroup?.id || modGrp?.modifierGroup?._id || ""),
          modifiers: (modGrp?.modifiers || [])
            .map((mod) => ({
              modifierId: String(mod?.modifierId || ""),
              quantity: 1,
            }))
            .filter((m) => Boolean(m.modifierId)),
        }))
        ?.filter((g) => Boolean(g.modifierGroupId) && g.modifiers.length > 0) ?? [];

    const variantId =
      isVariantFlowEnabled && selectedVariantId ? String(selectedVariantId) : undefined;

    dispatch(
      updateProductSelection({
        stepIndex: currentStepIndex,
        selection: {
          productId: String(productId),
          ...(variantId ? { variantId } : {}),
          modifierGroups,
        },
      })
    );
  }, [
    dispatch,
    isComboStepFlow,
    currentStepIndex,
    productId,
    selectedModifiers,
    selectedVariantId,
    isVariantFlowEnabled,
  ]);
};

type PrefillComboStepSelectionsArgs = {
  isComboStepFlow: boolean;
  redirectFromCartToEdit: boolean;
  comboPrefillEnabled: boolean;
  currentStepIndex: number | null | undefined;
  productData: ProductResponse | null;
  comboStepSelections:
    | Record<
        number,
        {
          productId?: unknown;
          variantId?: unknown;
          modifierGroups?: Array<{
            modifierGroupId?: unknown;
            modifiers?: Array<{ modifierId?: unknown }>;
          }>;
        }
      >
    | null
    | undefined;
  isVariantFlowEnabled: boolean;
  shouldShowVariantOptions: boolean;
  modifiersInitialized: boolean;
  selectedVariant: Variant | null;
  setSelectedVariant: React.Dispatch<React.SetStateAction<Variant | null>>;
  setSelectedModifiers: React.Dispatch<
    React.SetStateAction<{ modifierGroup: LinkedModifier; modifiers: Modifier[] }[]>
  >;
  setModifiersInitialized: React.Dispatch<React.SetStateAction<boolean>>;
};

export const usePrefillComboStepSelections = ({
  isComboStepFlow,
  redirectFromCartToEdit,
  comboPrefillEnabled,
  currentStepIndex,
  productData,
  comboStepSelections,
  isVariantFlowEnabled,
  shouldShowVariantOptions,
  modifiersInitialized,
  selectedVariant,
  setSelectedVariant,
  setSelectedModifiers,
  setModifiersInitialized,
}: PrefillComboStepSelectionsArgs) => {
  useEffect(() => {
    if (!isComboStepFlow) return;
    // Prefill is enabled only in edit contexts:
    // - cart edit (rfcEdit=true), or
    // - combo summary edit (prop set by combo flow)
    if (!redirectFromCartToEdit && !comboPrefillEnabled) return;
    if (currentStepIndex === undefined || currentStepIndex === null) return;
    if (!productData?.data?.id) return;

    const stepSelection = comboStepSelections?.[currentStepIndex];
    if (!stepSelection) return;
    const selectionProductId = String(stepSelection.productId);
    const pageProductId = String(productData.data.id);
    // Combo PDP `data.id` can be `${productId}-${variantId}` (see combo utils),
    // while selection stores base `productId`. Accept both.
    const isSameProduct =
      selectionProductId === pageProductId || pageProductId.startsWith(`${selectionProductId}-`);
    if (!isSameProduct) return;

    // Avoid re-initializing after user starts customizing in this PDP view
    if (modifiersInitialized) return;

    // Determine variant to use for mapping modifiers.
    // In some cases cart-edit `variantId` may be empty/missing or not present in current variants list;
    // in that case fall back to current selected variant or first variant to still resolve modifier groups.
    const variantFromSelection =
      isVariantFlowEnabled && stepSelection.variantId
        ? productData.data.variants?.find(
            (v) => String(v._id) === String(stepSelection.variantId)
          ) || null
        : null;

    const fallbackVariant =
      (isVariantFlowEnabled ? (selectedVariant ?? null) : null) ||
      (shouldShowVariantOptions ? (productData.data.variants?.[0] ?? null) : null);

    const variantToUse = variantFromSelection ?? fallbackVariant;

    // Set variant first (for UI) — modifier mapping below uses variantToUse directly
    if (isVariantFlowEnabled) {
      setSelectedVariant(variantToUse);
    }

    const modifierSourceGroups: LinkedModifier[] = isVariantFlowEnabled
      ? (variantToUse?.linkedModifiers || [])
      : (productData.data.linkedModifiers || []);

    const nextSelectedModifiers: { modifierGroup: LinkedModifier; modifiers: Modifier[] }[] = [];
    const selectionGroups = Array.isArray(stepSelection.modifierGroups) ? stepSelection.modifierGroups : [];

    selectionGroups.forEach((g) => {
      const prodGroup = modifierSourceGroups.find(
        (pg) => String(pg.id || pg._id) === String(g.modifierGroupId)
      );
      if (!prodGroup) return;

      const prodModifiers: Modifier[] = [];
      (g.modifiers || []).forEach((m) => {
        const prodMod = prodGroup.modifiers?.find(
          (pm) => String(pm.modifierId) === String(m.modifierId)
        );
        if (prodMod) prodModifiers.push(prodMod);
      });

      if (prodModifiers.length) {
        nextSelectedModifiers.push({ modifierGroup: prodGroup, modifiers: prodModifiers });
      }
    });

    setSelectedModifiers(nextSelectedModifiers);
    setModifiersInitialized(true);
  }, [
    isComboStepFlow,
    redirectFromCartToEdit,
    comboPrefillEnabled,
    currentStepIndex,
    productData?.data?.id,
    productData?.data?.variants,
    productData?.data?.linkedModifiers,
    comboStepSelections,
    isVariantFlowEnabled,
    shouldShowVariantOptions,
    modifiersInitialized,
    selectedVariant,
    setSelectedVariant,
    setSelectedModifiers,
    setModifiersInitialized,
  ]);
};