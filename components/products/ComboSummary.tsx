"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import formatCurrency from "@lib/helper/price";
import { useRouter, useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@redux/store";
import {
  selectQrFlow,
  selectQrFlowTableNumber,
  selectSessionId,
  setDineInSessionData,
} from "@redux/slices/qrFlowSlice";
import {
  addComboToCart,
  ComboCartPayload,
  updateStoreCart,
} from "@services/cartService";
import { addItemsToTicket, updateTicketItems } from "@services/ticketService";
import { getSession } from "@services/sessionService";
import { useStoreCart } from "@hooks/storepage/useStore";
import { useSessionTicketItems } from "@hooks/useQrSessionDerivedState";
import { getTenantConfig } from "@config/tenant.config";
import { generateImageBase64FromUrl } from "@lib/helper/ImageGen/imageGen";
import {
  selectComboSteps,
  selectOriginalApiResponse,
  selectSelectedProductSelections,
  selectStepDynamicNames,
  selectComboPrice,
} from "@redux/selectors/comboSelectors";
import useAnalytics, {
  getComboNameFromApiResponse,
} from "@hooks/useAnalytics";
import { DINE_IN_ANALYTICS_CONTEXT } from "@lib/analytics/dineInAnalytics";

import { ComboProductSelection } from "./combo.types";
import { LanguageCode, TranslationKeys } from "types";
import useLang from "@hooks/useLang";
import { useToast } from "@components/toast/Toast";
import useProductUrl from "@hooks/useProductUrl";
import SpecialRequestSection from "@components/productDetailPage/SpecialRequestSection";
import Loader from "@components/loader/Loader";

interface ComboSummaryProps {
  selectedProducts: {
    [key: number]: ComboProductSelection | null;
  };
  onProductChange: (stepIndex: number) => void;
  onProductEdit: (stepIndex: number) => void;
  onAddToCartStart?: () => void;
  onAddToCartSuccess?: () => void;
  comboData?: {
    comboId: string;
    comboName: string;
    comboPrice: number;
    comboOriginalPrice: number;
  } | null;
}

const ComboSummary: React.FC<ComboSummaryProps> = ({
  selectedProducts,
  onProductChange,
  onProductEdit,
  onAddToCartStart,
  onAddToCartSuccess,
}) => {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const params = useParams();
  const searchParams = useSearchParams();
  const store = useSelector((state: RootState) => state.store);
  const isQrFlow = useSelector(selectQrFlow);
  const sessionId = useSelector(selectSessionId);
  const qrFlowTableNumber = useSelector(selectQrFlowTableNumber);
  const comboSteps = useSelector(selectComboSteps);
  const sessionTicketItems = useSessionTicketItems();
  const {
    trackComboSummaryViewed,
    trackComboAddToCart,
    trackDineInComboAddToCart,
  } = useAnalytics();
  const summaryViewTrackedRef = useRef(false);
  const { handleGetCart, cartData } = useStoreCart();
  const tenantConfig = getTenantConfig();
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const toast = useToast();
  const dispatch = useDispatch();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { getCategoryUrl, getStoreUrl, getCartUrl } = useProductUrl();

  // State for special instructions
  const [specialInstructions, setSpecialInstructions] = useState<string>("");
  // State for loading
  const [loading, setLoading] = useState<boolean>(false);

  // Get data from Redux selectors
  const originalApiResponse = useSelector(selectOriginalApiResponse);
  const selectedProductSelections = useSelector(
    selectSelectedProductSelections,
  );
  const stepNames = useSelector(selectStepDynamicNames);
  const comboPrice = useSelector(selectComboPrice);

  const editCartItemId = searchParams?.get("cid") ?? "";
  const isEditingFromCart =
    searchParams?.get("rfcEdit") === "true" && Boolean(editCartItemId);

  // Calculate main product step index dynamically
  const mainProductStepIndex = useMemo(() => 0, []); // Main product is always at index 0

  // Use prices from Redux selector
  const totalPrice = comboPrice.totalPrice;
  // const originalPrice = comboPrice.originalPrice;
  const savings = comboPrice.savings;

  const selectedStepCount = useMemo(
    () =>
      Object.values(selectedProducts).filter(
        (product) => product !== null && product !== undefined,
      ).length,
    [selectedProducts],
  );

  useEffect(() => {
    const comboId = originalApiResponse?.id;
    if (!comboId || summaryViewTrackedRef.current) return;
    summaryViewTrackedRef.current = true;

    void trackComboSummaryViewed({
      combo_id: comboId,
      combo_name: getComboNameFromApiResponse(originalApiResponse),
      step_count: selectedStepCount,
      total_value: totalPrice,
      ...(savings > 0 ? { savings } : {}),
      store_id: store.currentStore?.id,
      is_edit_from_cart: isEditingFromCart,
      ...(isQrFlow
        ? {
            funnel: DINE_IN_ANALYTICS_CONTEXT.funnel,
            order_type: DINE_IN_ANALYTICS_CONTEXT.order_type,
            session_id: sessionId || undefined,
            table_number: qrFlowTableNumber || undefined,
          }
        : {
            funnel: "order_online",
          }),
    });
  }, [
    originalApiResponse,
    selectedStepCount,
    totalPrice,
    savings,
    store.currentStore?.id,
    isEditingFromCart,
    isQrFlow,
    sessionId,
    qrFlowTableNumber,
    trackComboSummaryViewed,
  ]);

  const trackComboAddToCartEvent = (
    cartPayload: ComboCartPayload,
    action: "add" | "update",
  ) => {
    const comboId = originalApiResponse?.id || cartPayload.productId;
    const comboName = getComboNameFromApiResponse(originalApiResponse);
    const productId =
      cartPayload.comboPrimaryProductId || cartPayload.productId;
    const productName =
      originalApiResponse?.primaryProduct?.name?.en || comboName;
    const quantity = cartPayload.quantity || 1;
    const baseParams = {
      combo_id: comboId,
      combo_name: comboName,
      product_id: productId,
      product_name: productName,
      quantity,
      price: totalPrice,
      total_value: totalPrice * quantity,
      ...(savings > 0 ? { savings } : {}),
      step_count: comboSteps.length > 0 ? comboSteps.length - 1 : selectedStepCount,
      action,
      store_id: store.currentStore?.id,
    };

    if (isQrFlow) {
      void trackDineInComboAddToCart({
        ...baseParams,
        session_id: sessionId || undefined,
        table_number: qrFlowTableNumber || undefined,
      });
    } else {
      void trackComboAddToCart(baseParams);
    }
  };

  // Create cart payload for combo
  const createComboCartPayload = (): ComboCartPayload => {
    const mainProduct = selectedProducts[0];
    if (!mainProduct) {
      throw new Error("Main product is required");
    }

    // Get main product selection (variants and modifiers)
    const mainProductSelection = selectedProductSelections[0];

    // Get primary product variant ID from API response
    const primaryProductVariantId =
      originalApiResponse?.primaryProduct?.variantId || "";

    // Get combo products (excluding main product)
    const comboProducts = Object.entries(selectedProducts)
      .filter(([stepIndex, product]) => {
        const index = parseInt(stepIndex);
        return (
          index > mainProductStepIndex &&
          product !== null &&
          product !== undefined
        ); // Skip main product
      })
      .map(([stepIndex, product]) => {
        const index = parseInt(stepIndex);
        const groupName = stepNames[index];
        const productSelection = selectedProductSelections[index];

        // Get the variant ID directly from the original API data
        const variantId = product?.originalApiData?.variantId || "";

        return {
          groupName: groupName,
          productId:
            product?.originalApiData?.productId ||
            product?.processedProduct?.productId ||
            product?.processedProduct?.id ||
            "",
          // Always include variantId - if not found, send empty string
          variantId: variantId,
          // Include modifier groups if they exist for this product
          ...(productSelection?.modifierGroups &&
            productSelection.modifierGroups.length > 0 && {
              modifierGroups: productSelection.modifierGroups,
            }),
        };
      });

    // Create base payload
    const basePayload = {
      quantity: 1,
      // Use combo ID from API response as the main productId
      productId: originalApiResponse?.id || "",
      comboPrimaryProductId:
        mainProduct.originalApiData?.productId ||
        mainProduct.processedProduct?.productId ||
        mainProduct.processedProduct?.id ||
        "",
      // Always use variant ID from API response for primary product
      comboPrimaryProductVariantId: primaryProductVariantId,
      // Use selected modifier groups if available
      comboPrimaryProductModifierGroups:
        mainProductSelection?.modifierGroups || [],
      comboProducts: comboProducts,
      // Include special instructions if provided
      ...(specialInstructions.trim() && {
        specialInstructions: specialInstructions.trim(),
      }),
    };

    // Non-negotiable rule: only send top-level `variantId` when API explicitly says this combo has variants.
    const comboHasVariants =
      (
        originalApiResponse as unknown as {
          type?: { hasVariants?: boolean };
        } | null
      )?.type?.hasVariants === true;
    const variantId = (
      originalApiResponse as unknown as { variantId?: unknown } | null
    )?.variantId;
    const normalizedVariantId = variantId ? String(variantId) : "";

    // Only add variantId if combo product has variants
    const payload: ComboCartPayload =
      comboHasVariants && normalizedVariantId
        ? { ...basePayload, variantId: normalizedVariantId }
        : basePayload;

    return payload;
  };

  // Utility function to validate cart payload
  const validateCartPayload = (payload: {
    productId: string;
    comboPrimaryProductId: string;
    comboProducts: Array<{
      productId: string;
      groupName: string;
      variantId?: string;
      modifierGroups?: Array<{
        modifierGroupId: string;
        modifiers: Array<{
          modifierId: string;
          quantity: number;
        }>;
      }>;
    }>;
  }) => {
    const errors: string[] = [];

    if (!payload.productId) {
      errors.push("Main product ID is required");
    }

    if (!payload.comboPrimaryProductId) {
      errors.push("Combo primary product ID is required");
    }

    if (!payload.comboProducts || payload.comboProducts.length === 0) {
      errors.push("At least one combo product is required");
    }

    // Validate each combo product
    payload.comboProducts.forEach((comboProduct, index: number) => {
      if (!comboProduct.productId) {
        errors.push(`Combo product ${index + 1} must have a product ID`);
      }
      if (!comboProduct.groupName) {
        errors.push(`Combo product ${index + 1} must have a group name`);
      }
    });

    return errors;
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    setLoading(true);
    // Notify parent that we're starting to add to cart (prevents UI flicker)
    onAddToCartStart?.();

    try {
      const storefrontId = store.currentStore?.id;
      if (!storefrontId) {
        throw new Error("Store ID is required");
      }

      const cartPayload = createComboCartPayload();

      // Validate cart payload
      const validationErrors = validateCartPayload(cartPayload);
      if (validationErrors.length > 0) {
        throw new Error(`Validation errors: ${validationErrors.join(", ")}`);
      }

      if (isQrFlow) {
        // QR Flow: Use ticket service API with modified combo payload
        if (!sessionId) {
          throw new Error("Session ID is required for QR flow");
        }

        // Find ticket item ID for update
        const existingTicketItem = sessionTicketItems?.find(
          (item) =>
            item.itemId === cartPayload.productId ||
            item.productId === cartPayload.productId,
        );
        const ticketItemId = existingTicketItem?.id || editCartItemId;
        // Ticket API expects itemSku for add/update (match "first add to cart" payload)
        const itemSku = existingTicketItem?.productSku ?? cartPayload.productId;

        // Modify existing combo payload for QR flow
        const qrPayload = {
          sessionId,
          items: [
            {
              customType: isEditingFromCart
                ? ("UPDATE_COMBO" as const)
                : ("ADD_QUANTITY" as const),
              // For UPDATE_COMBO backend still needs itemId/itemSku context (same shape as first-time add)
              ...(isEditingFromCart
                ? {
                    ticketItemId,
                    itemId: cartPayload.productId,
                    itemSku,
                    variantId: cartPayload.variantId,
                  }
                : {
                    itemId: cartPayload.productId,
                    itemSku,
                    variantId: cartPayload.variantId,
                  }),
              // Keep parity with cart payload key names (some backends validate productId)
              productId: cartPayload.productId,
              quantity: cartPayload.quantity,
              comboPrimaryProductId: cartPayload.comboPrimaryProductId,
              comboPrimaryProductVariantId:
                cartPayload.comboPrimaryProductVariantId,
              comboPrimaryProductModifierGroups:
                cartPayload.comboPrimaryProductModifierGroups,
              comboProducts: cartPayload.comboProducts,
              ...(cartPayload.specialInstructions && {
                specialInstructions: cartPayload.specialInstructions,
              }),
            },
          ],
        };

        if (isEditingFromCart) {
          await updateTicketItems(storefrontId, qrPayload);
        } else {
          await addItemsToTicket(storefrontId, qrPayload);
        }

        // Refetch session so Redux has updated ticket items and PDP shows correct quantity
        const sessionData = await getSession(storefrontId, {
          tableId: undefined,
          sessionId,
        });
        dispatch(setDineInSessionData(sessionData));

        // Show success toast for QR flow
        setTimeout(() => {
          toast("success", lang.itemHasBeenAddedOnCart, {
            productName:
              originalApiResponse?.primaryProduct?.name?.en || "Combo",
            productPrice: totalPrice,
            quantity: 1,
            position: "top-right",
            variant: "product",
          });
        }, 1000);

        trackComboAddToCartEvent(
          cartPayload,
          isEditingFromCart ? "update" : "add",
        );

        // Redirect to cart page in QR flow
        router.push(getCartUrl());

        // Call success callback
        onAddToCartSuccess?.();
      } else {
        // Normal Flow: Use cart service API
        if (isEditingFromCart) {
          let patchCartId = cartData?.data?.id;
          if (!patchCartId) {
            const refreshed = await handleGetCart(storefrontId);
            patchCartId = refreshed?.data?.id;
          }
          if (!patchCartId) {
            throw new Error("Cart not loaded");
          }
          await updateStoreCart(storefrontId, {
            ...cartPayload,
            id: patchCartId,
            cartItemId: editCartItemId,
            customType: "UPDATE_COMBO",
          });
        } else {
          await addComboToCart(storefrontId, cartPayload);
        }

        await handleGetCart(storefrontId);

        const comboName =
          originalApiResponse?.primaryProduct?.name?.en || "Combo";
        const comboTotalPrice = totalPrice;

        if (!isEditingFromCart) {
          setTimeout(() => {
            toast("success", lang.itemHasBeenAddedOnCart, {
              productName: comboName,
              productPrice: comboTotalPrice,
              quantity: 1,
              position: "top-right",
              variant: "product",
            });
          }, 1000);
        }

        trackComboAddToCartEvent(
          cartPayload,
          isEditingFromCart ? "update" : "add",
        );

        router.push(getCartUrl());

        // Call the success callback to complete the progress bar
        onAddToCartSuccess?.();
      }
    } catch (error) {
      const Error = error as { response?: { data?: { message?: string } } };
      toast("error", Error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[var(--primary-background)]">
      <div className="pt-1 md:px-24">
        {/* Main White Card */}
        <div className="w-full bg-[var(--cards-containers)] rounded-2xl p-4 md:mt-7 mb-6">
          {/* Selected Products by Category */}
          <div className="space-y-6">
            {(() => {
              const filteredProducts = Object.entries(selectedProducts).filter(
                ([stepIndex, product]) => {
                  const index = parseInt(stepIndex);
                  // Only show products that are selected and not null/undefined
                  const isValid =
                    product !== null &&
                    product !== undefined &&
                    index < stepNames.length;
                  return isValid;
                },
              );

              if (filteredProducts.length === 0) {
                // Show which steps are missing
                const missingSteps = stepNames
                  .map((stepName, index) => ({ stepName, index }))
                  .filter(
                    ({ index }) =>
                      !selectedProducts[index] ||
                      selectedProducts[index] === null,
                  )
                  .map(({ stepName }) => stepName);

                return (
                  <div className="w-full h-[min-content] pt-12 text-center p-4 flex flex-wrap justify-center items-center content-center">
                    <img
                      fetchPriority="high"
                      src="/images/no-product.svg"
                      alt="No products selected"
                      title="No products selected"
                      width={100}
                      height={100}
                      className="text-center"
                    />
                    <p className="w-full text-center pt-2 font-[var(--font-semi-bold)]">
                      Please complete all steps to view summary
                    </p>
                    <p className="w-full text-center pt-1 text-sm text-[var(--secondary-text)]">
                      Missing selections from: {missingSteps.join(", ")}
                    </p>
                    <p className="w-full text-center pt-2 text-sm text-[var(--accent-color)]">
                      Tap on the steps above to make your selections
                    </p>
                  </div>
                );
              }

              return filteredProducts.map(([stepIndex, product]) => {
                const index = parseInt(stepIndex);
                // TypeScript knows product is not null due to filter
                const selectedProduct = product!;
                const stepSelection = selectedProductSelections[index];

                const selectedModifierNames = (() => {
                  const modifierGroups = stepSelection?.modifierGroups ?? [];
                  const linkedModifierGroups =
                    selectedProduct.originalApiData?.linkedModifiers ?? [];
                  if (
                    modifierGroups.length === 0 ||
                    linkedModifierGroups.length === 0
                  )
                    return [];

                  const names: string[] = [];
                  for (const group of modifierGroups) {
                    const groupId = group.modifierGroupId;
                    const apiGroup =
                      linkedModifierGroups.find(
                        (g) => (g.modifierGroupId || g._id || g.id) === groupId,
                      ) ?? null;

                    for (const m of group.modifiers ?? []) {
                      const modifierId = m.modifierId;
                      if (!modifierId) continue;
                      const apiModifier =
                        apiGroup?.modifiers?.find(
                          (am) => (am.modifierId || am._id) === modifierId,
                        ) ?? null;
                      const name = apiModifier?.name?.en;
                      if (name) names.push(name);
                    }
                  }
                  return names;
                })();

                const hasVariantOptions =
                  !!selectedProduct.originalApiData?.variantAttributes &&
                  Object.keys(selectedProduct.originalApiData.variantAttributes)
                    .length > 0;

                const hasModifierOptions =
                  (selectedProduct.originalApiData?.linkedModifiers?.length ??
                    0) > 0 || (stepSelection?.modifierGroups?.length ?? 0) > 0;

                const shouldShowEditIcon =
                  hasVariantOptions || hasModifierOptions;

                return (
                  <div key={stepIndex} className="relative">
                    {/* Category Header */}
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-[var(--primary-text)] capitalize">
                        {stepNames[index]}
                      </h3>
                      {/* Hide Change button for main product */}
                      {index > mainProductStepIndex && (
                        <button
                          onClick={() => onProductChange(index)}
                          className="text-sm text-[var(--accent-color)] hover:underline font-semibold"
                        >
                          Change
                        </button>
                      )}
                    </div>

                    {/* Product Item */}
                    <div className="flex border border-[var(--borders-dividers)] max-h-20 items-center gap-3 p-3 bg-[var(--cards-containers)] rounded-lg relative">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-[60px] h-[60px] rounded-md overflow-hidden">
                        <img
                          src={
                            selectedProduct.processedProduct.media?.[0]?.url ||
                            generateImageBase64FromUrl({
                              url:
                                tenantConfig.productPlaceholderImageUrl || "",
                              width: 315,
                              height: 315,
                            })?.fullEncodedUrl ||
                            ""
                          }
                          alt={selectedProduct.processedProduct.name?.en}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to placeholder
                            const target = e.target as HTMLImageElement;
                            target.src =
                              generateImageBase64FromUrl({
                                url:
                                  tenantConfig.productPlaceholderImageUrl || "",
                                width: 315,
                                height: 315,
                              })?.fullEncodedUrl || "";
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold heading-5 text-[var(--primary-text)] line-clamp-2">
                          {selectedProduct.processedProduct.name?.en}
                          {selectedProduct.originalApiData?.variantAttributes
                            ? ` (${Object.values(selectedProduct.originalApiData.variantAttributes)[0]})`
                            : ""}
                        </h4>
                        {selectedModifierNames.length > 0 && (
                          <p className="extra-small-font text-[var(--primary-text)] line-clamp-1">
                            {selectedModifierNames.join(", ")}
                          </p>
                        )}
                        {/* Calorie Count */}
                        {(() => {
                          if (!tenantConfig.showCaloriesInfo) return null;
                          const kcal = (
                            selectedProduct.processedProduct as {
                              kcal?: number;
                            }
                          ).kcal;
                          return kcal && kcal > 0 ? (
                            <p className="text-sm text-[var(--primary-text)]">
                              {kcal} kcal
                            </p>
                          ) : null;
                        })()}
                      </div>

                      {shouldShowEditIcon && (
                        <button
                          onClick={() => onProductEdit(index)}
                          className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--tertiary-background)] flex items-center justify-center hover:bg-[var(--borders-dividers)] transition-colors"
                        >
                          <img
                            src="/images/icon/receipt-edit.svg"
                            alt="Edit"
                            width="16"
                            height="16"
                            className="w-10 h-10"
                          />
                        </button>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Special Request Section */}
          <SpecialRequestSection
            specialInstructions={specialInstructions}
            setSpecialInstructions={setSpecialInstructions}
            lang={lang}
            containerClassName="mt-6 md:mt-0 mb-7 md:mb-0 md:py-6"
            titleClassName="heading-4 font-600 pb-2"
          />
        </div>

        {/* Bottom Fixed Section */}
        <div className="fixed bottom-0 left-0 right-0 bg-[var(--primary-background)] py-3 px-4 md:px-10 shadow-[0_-2px_4px_-2px_rgba(0,0,0,0.1)]">
          <div className="flex justify-between items-center md:pl-20">
            {/* Price Information */}
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[var(--primary-text)]">
                {formatCurrency({ amount: totalPrice })}
              </span>
              {savings > 0 && (
                <span className="text-sm text-[var(--success)]">
                  You save {formatCurrency({ amount: savings })}
                </span>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={loading}
              className={`bg-[var(--button-primary-background)] py-3 px-8 rounded-lg min-w-[150px] md:w-[300px] flex font-600 heading-4 text-[var(--button-primary-text)] ${loading ? "justify-center" : "justify-center"} items-center`}
            >
              {loading ? (
                <Loader color="var(--primary-text-light)" size={24} />
              ) : isEditingFromCart ? (
                lang.saveChanges
              ) : (
                lang.addToCart
              )}
            </button>
          </div>
        </div>
      </div>

      <style>
        {`
          .heading-5 {
            font-size: var(--heading-h5);
          }
          .heading-4 {
            font-size: var(--heading-h4);
          }
        `}
      </style>
    </div>
  );
};

export default ComboSummary;
