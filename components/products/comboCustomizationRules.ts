import type { ProductResponse, Variant } from "@components/type/pdp.type";

type ComboStepSelection = {
  productId?: unknown;
  variantId?: unknown;
};

type GetProductCustomizationRulesArgs = {
  productData: ProductResponse | null;
  selectedVariant: Variant | null;
  isComboStepFlow: boolean;
  currentStepIndex?: number;
  comboOriginalApiResponse: unknown;
  comboStepSelections: Record<number, ComboStepSelection> | null | undefined;
};

type ProductCustomizationRules = {
  hasVariantType: boolean;
  hasVariantOptions: boolean;
  hasModifierOptions: boolean;
  hasCustomizations: boolean;
  isSimpleProduct: boolean;
};

export function getProductCustomizationRules({
  productData,
  selectedVariant,
  isComboStepFlow,
  currentStepIndex,
  comboOriginalApiResponse,
  comboStepSelections,
}: GetProductCustomizationRulesArgs): ProductCustomizationRules {
  const variantCount = productData?.data?.variants?.length ?? 0;
  // Non-combo flow: trust `type.hasVariants`.
  // If backend marks hasVariants=false, we should not show variant UI even if `variants[]` is present.
  // (Some catalogs may include a single "default" variant row, but UI should behave as non-variant.)
  const defaultHasVariantType = productData?.data?.type?.hasVariants === true;

  // Combo steps must decide visibility from the raw combo API payload:
  // - Step 0 uses `originalApiResponse.primaryProduct`
  // - Step N>0 uses `originalApiResponse.group[N-1].groupDetails[...]`
  // This avoids false positives from `createProductResponse` injecting a fallback variant.
  const isComboStep = isComboStepFlow && typeof currentStepIndex === "number";
  const isPrimaryComboProduct = isComboStep && currentStepIndex === 0;
  const isGroupComboProduct = isComboStep && (currentStepIndex ?? 0) > 0;

  const api = (comboOriginalApiResponse || {}) as Record<string, unknown>;
  const primaryProduct = (api.primaryProduct || {}) as Record<string, unknown>;
  const primaryProductVariants = Array.isArray(primaryProduct.variants)
    ? (primaryProduct.variants as unknown[])
    : [];
  const primaryProductLinkedModifiers = Array.isArray(primaryProduct.linkedModifiers)
    ? (primaryProduct.linkedModifiers as unknown[])
    : [];

  const stepSelection =
    isGroupComboProduct && comboStepSelections && currentStepIndex !== undefined
      ? comboStepSelections[currentStepIndex]
      : null;
  const selectionProductId = stepSelection?.productId ? String(stepSelection.productId) : "";
  const selectionVariantId = stepSelection?.variantId ? String(stepSelection.variantId) : "";

  const groups = Array.isArray(api.group) ? (api.group as Array<Record<string, unknown>>) : [];
  const groupIndex = isGroupComboProduct ? (currentStepIndex as number) - 1 : -1;
  const group = (groups[groupIndex] || {}) as Record<string, unknown>;
  const groupDetails = Array.isArray(group.groupDetails)
    ? (group.groupDetails as Array<Record<string, unknown>>)
    : [];

  // Pick the currently-viewed group detail to check linkedModifiers correctly.
  const groupDetailFromSelection =
    selectionProductId
      ? groupDetails.find((d) => {
          const pid = d?.productId ? String(d.productId) : "";
          const vid = d?.variantId ? String(d.variantId) : "";
          if (!pid || pid !== selectionProductId) return false;
          return selectionVariantId ? vid === selectionVariantId : true;
        }) || null
      : null;
  const groupDetailFallback =
    groupDetails.find((d) => {
      const pid = d?.productId ? String(d.productId) : "";
      const vid = d?.variantId ? String(d.variantId) : "";
      // `productData.data.id` in combo is usually `${productId}-${variantId}`.
      const pageId = String(productData?.data?.id ?? "");
      return Boolean(pid) && (pageId === pid || (vid && pageId === `${pid}-${vid}`));
    }) || null;
  const currentGroupDetail = groupDetailFromSelection ?? groupDetailFallback ?? groupDetails[0] ?? null;

  const groupLinkedModifiers = Array.isArray(currentGroupDetail?.linkedModifiers)
    ? (currentGroupDetail?.linkedModifiers as unknown[])
    : [];

  const primaryHasVariantType = primaryProductVariants.length > 0;
  // Primary combo product: show variants when there's at least one variant
  const primaryHasVariantOptions = primaryProductVariants.length > 0 || (primaryProduct.variantAttributes as Record<string, unknown> && Object.keys(primaryProduct.variantAttributes as Record<string, unknown>).length > 0);
  const primaryHasModifierOptions = primaryProductLinkedModifiers.length > 0;

  // Group steps: variants are the groupDetails choices; show even if only 1 option.
  const groupHasVariantType = groupDetails.length > 0;
  const groupHasVariantOptions = groupDetails.length > 0;
  const groupHasModifierOptions = groupLinkedModifiers.length > 0;

  const hasVariantType = isPrimaryComboProduct
    ? primaryHasVariantType
    : isGroupComboProduct
      ? groupHasVariantType
      : defaultHasVariantType;

  const hasVariantOptions = isPrimaryComboProduct
    ? primaryHasVariantOptions
    : isGroupComboProduct
      ? groupHasVariantOptions
      : (defaultHasVariantType && variantCount > 0);

  const hasModifierOptions = isPrimaryComboProduct
    ? primaryHasModifierOptions
    : isGroupComboProduct
      ? groupHasModifierOptions
      : hasVariantType
        ? (selectedVariant?.linkedModifiers?.length || 0) > 0
        : (productData?.data?.linkedModifiers?.length || 0) > 0;

  return {
    hasVariantType,
    hasVariantOptions,
    hasModifierOptions,
    hasCustomizations: hasVariantOptions || hasModifierOptions,
    isSimpleProduct: !hasVariantType && !hasModifierOptions,
  };
}

