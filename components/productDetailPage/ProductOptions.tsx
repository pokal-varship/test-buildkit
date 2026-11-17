"use client";
import CustomButton from "@components/buttons/Button";
import Modal from "@components/dialogDrawer/modal/Modal";
import CrossIcon from "@components/icons/CrossIcon";
import Loader from "@components/loader/Loader";
import ProductQuantitySelector from "@components/order/ProductQuantitySelector";
import FAQ from "@components/productDetailPage/FAQ";
import { useToast } from "@components/toast/Toast";
import {
  AddToCartPayload,
  LinkedModifier,
  Modifier,
  PatchCartPayload,
  ProductResponse,
  Variant,
} from "@components/type/pdp.type";
import { Store } from "@components/type/store.types";
import useDisableBodyScroll from "@hooks/useDisableBodyScroll";
import useIsMobile from "@hooks/useIsMobile";
import useLang from "@hooks/useLang";
import { useQuantityControls } from "@hooks/useQuantityControls";
import { useTicketQuantityControls } from "@hooks/useTicketQuantityControls";
import { useQrFlowPdpHandlers } from "@hooks/useQrFlowPdpHandlers";
import {
  getCustomizationRepeatDisplayForCartItem,
  getModifierDescriptionForCartItem,
} from "@hooks/plpCustomizationUtils";
import { useStoreCart } from "@hooks/storepage/useStore";
import useAnalytics from "@hooks/useAnalytics";
import { DINE_IN_ANALYTICS_CONTEXT } from "@lib/analytics/dineInAnalytics";
import { getTenantConfig } from "@config/tenant.config";
import useProductUrl from "@hooks/useProductUrl";
import formatCurrency from "@lib/helper/price";
import { RootState } from "@redux/store";
import {
  usePersistComboSelectionForStep,
  usePrefillComboStepSelections,
} from "@components/products/combo.hooks";
import { selectSelectedProductSelections } from "@redux/selectors/comboSelectors";
import {
  selectQrFlow,
  selectDineInSessionData,
  selectQrResolveData,
  selectSessionTableId,
  selectSessionId,
  selectQrFlowTableNumber,
  selectTicketId,
  setDineInSessionData,
  SessionTicketItem,
} from "@redux/slices/qrFlowSlice";
import { addToCart, patchCart } from "@services/pdp";
import {
  addItemsToTicket,
  updateTicketItems,
  AddItemsToTicketPayload,
} from "@services/ticketService";
import { getSession } from "@services/sessionService";
import {
  CartItem,
  CartItemModifier,
  CartItemModifierGroup,
} from "@services/storePage";
import {
  getProductItemsAndLineCount,
  normalizePrice,
  sessionTicketItemToCartItem,
} from "../../utils/sessionTicketItemToCartItem";
import { DiscountOffer } from "@services/typesense";
import { useTheme } from "context/ThemeProvider";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { open_dialog, close_dialog } from "@lib/modalHandler";
import type { MultipleCustomizationsStagedState } from "@components/dialogDrawer/modal/Cart/MultipleCustomizations";
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { LanguageCode, TranslationKeys } from "types";
import CartOptionCard from "./CartOptionCard";
import OfferCard from "./OfferCard";
import ProductReviews, {
  hasReviewData,
} from "./product-reviews/product-reviews";
import { getHeadingLabel } from "./productConfig";
import ReviewTab from "./ReviewTab";
import SpecialRequestSection from "./SpecialRequestSection";
import { getProductCustomizationRules } from "@components/products/comboCustomizationRules";
import {
  formatOfferBannerSuffixText,
  getOfferTheme,
  pickBestOfferByFlow,
} from "@lib/offers/selectOffers";
import { useSessionTicketItems } from "@hooks/useQrSessionDerivedState";

// const NoDataPlaceholder = dynamic(() => import("@components/no-data-placeholder/no-data-placeholder"), { ssr: false });

function bestOfferForVariant(
  variant: Variant | null | undefined,
  isQrFlow: boolean,
) {
  return pickBestOfferByFlow(
    variant as unknown as {
      bestOfferRemote?: DiscountOffer;
      bestOfferInStore?: DiscountOffer;
    } | null,
    isQrFlow,
  );
}

/** Green pill text when `discountedPrice` is from API and badge mirrors offer config (types 2 & 3). */
function offerPillFromConfig(offer: DiscountOffer | undefined): string | null {
  const dc = offer?.discountConfig;
  if (!offer || !dc) return null;

  const kind =
    offer.offerType === 2
      ? dc.type
      : offer.offerType === 3
        ? dc.discountType
        : null;
  const value =
    offer.offerType === 2
      ? dc.value
      : offer.offerType === 3
        ? dc.discountValue
        : null;
  if (value == null) return null;

  if (kind === 1) return `+ ${value}% OFF`;
  if (kind === 2) return `+ ${formatCurrency({ amount: Number(value) })} OFF`;
  return null;
}

// const FOOTER_OFFER_PILL =
//   "ml-2 bg-[var(--success)] extra-small-font text-[var(--white)] rounded-[3px] md:rounded-[5px] px-1 py-[3px] whitespace-nowrap";

/** Footer: sale price + struck list price + optional green pill. */
function FooterPriceRow(props: {
  sale: number;
  list: number;
  pill?: string | null;
  /** Add e.g. `mr-2` on the struck price when layout needs it */
  listClassExtra?: string;
}) {
  const { showStrikethroughPrice } = getTenantConfig();
  const listClass =
    `line-through text-[var(--secondary-text)] heading-5 md-heading-4 ${props.listClassExtra ?? ""}`.trim();
  return (
    <>
      <span className="text-base text-[var(--primary-text)] md-heading-4 font-[var(--font-semi-bold)]">
        {formatCurrency({ amount: props.sale })}
      </span>
      {showStrikethroughPrice && (
        <span className={listClass}>
          {formatCurrency({ amount: props.list })}
        </span>
      )}
      {/* {props.pill ? <span className={FOOTER_OFFER_PILL}>{props.pill}</span> : null} */}
    </>
  );
}

function FooterPriceOnly({ amount }: { amount: number }) {
  return (
    <span className="heading-4 md-heading-4 font-[var(--font-semi-bold)] text-[var(--primary-text)]">
      {formatCurrency({ amount })}
    </span>
  );
}

type ValidationError = {
  groupId: string;
  groupName: string;
  message: string;
};

type UrlParams = {
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

type ProductOptionsProps = {
  productData: ProductResponse | null;
  selectedVariant: Variant | null;
  setSelectedVariant: React.Dispatch<React.SetStateAction<Variant | null>>;
  reviewsSectionRef: React.RefObject<HTMLDivElement | null>;
  CartProductData: CartItem | null;
  storeData: Store | null | undefined;
  urlParams: UrlParams;
  setUrlParams: React.Dispatch<React.SetStateAction<UrlParams>>;
  comboSteps?: { name: string; productSlug: string }[];
  currentStepIndex?: number;
  goToNextStep?: () => void;
  goToBackStep?: () => void;
  isCombo?: boolean;
  comboPrefillEnabled?: boolean;
};

const ProductOptions: FC<ProductOptionsProps> = ({
  productData,
  CartProductData,
  selectedVariant,
  setSelectedVariant,
  reviewsSectionRef,
  storeData,
  urlParams,
  setUrlParams,
  goToNextStep,
  goToBackStep,
  currentStepIndex,
  isCombo = false,
  comboPrefillEnabled = false,
}) => {
  const [lang, language]: [TranslationKeys, LanguageCode] = useLang();
  const { customiseAsPerYourTaste: customiseTitleFromEnv } = getTenantConfig();
  const customiseTitle =
    customiseTitleFromEnv || lang.customiseAsPerYourTaste;
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const productOptionsRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const searchParams = useSearchParams();
  const { getCategoryUrl, getCartUrl } = useProductUrl();
  const productType = searchParams?.get("type");
  // Check for combo parameter from URL
  const isComboFromUrl = searchParams?.get("combo") === "true";
  /** Combo vs normal PDP: single place to update (URL `type=combo`, `combo=true`, or parent `isCombo`). */
  const isComboProductContext =
    productType === "combo" || isComboFromUrl || isCombo;
  /** Combo stepper with next/back (parent passes `goToNextStep`). */
  const isComboStepFlow = isComboProductContext && Boolean(goToNextStep);
  const menuSlug = searchParams?.get("menu");
  const {
    trackProductVariantSelected,
    trackAddToCart,
    trackProductCustomisationSelected,
    trackDineInAddToCart,
  } = useAnalytics();
  const isQrFlow = useSelector(selectQrFlow);
  const dineInTrackExtra = isQrFlow ? DINE_IN_ANALYTICS_CONTEXT : undefined;
  // Single source of truth for variant/modifier visibility rules.
  // If logic changes in future, update only this block.
  const comboOriginalApiResponse = useSelector(
    (state: RootState) => state.combo?.originalApiResponse,
  );
  const comboStepSelections = useSelector(selectSelectedProductSelections);

  const productCustomizationRules = useMemo(() => {
    return getProductCustomizationRules({
      productData,
      selectedVariant,
      isComboStepFlow,
      currentStepIndex,
      comboOriginalApiResponse,
      comboStepSelections,
    });
  }, [
    productData?.data?.type?.hasVariants,
    productData?.data?.variants,
    productData?.data?.linkedModifiers,
    selectedVariant?.linkedModifiers,
    isComboStepFlow,
    currentStepIndex,
    productData?.data?.id,
    comboOriginalApiResponse,
    comboStepSelections,
  ]);

  // Variant flow must always start from type.hasVariants.
  const isVariantFlowEnabled = productCustomizationRules.hasVariantType;
  const shouldShowVariantOptions = productCustomizationRules.hasVariantOptions;

  const onSizeSelect = (variant: Variant) => {
    setSelectedVariant(variant);

    // Track variant selection
    if (productData?.data?.id) {
      const attr = variant.attributes?.[0];
      const variantType = attr?.name || "size";
      const variantValue = getHeadingLabel(variant) || "";

      trackProductVariantSelected({
        product_id: productData.data.id,
        variant_type: variantType,
        variant_value: variantValue,
        price: variant.basePrice || 0,
      }, dineInTrackExtra);

      // Track customisation option selected
      const baseProductPrice = productData.data.basePrice || 0;
      const firstVariantPrice =
        productData.data.variants?.[0]?.basePrice || baseProductPrice;
      const priceDelta = (variant.basePrice || 0) - firstVariantPrice;

      trackProductCustomisationSelected({
        product_id: productData.data.id,
        option_group: variantType,
        option_value: variantValue,
        price_delta: priceDelta,
      }, dineInTrackExtra);
    }

    // If user clicked "I'll choose" and is now selecting a variant, ensure flag is set
    // This ensures Add to Cart button is shown instead of quantity selector
    if (showAddToCartInsteadOfQuantity) {
      setFlag(true);
    }
  };
  const [flag, setFlag] = useState<boolean>(false);

  const [selectedModifiers, setSelectedModifiers] = useState<
    { modifierGroup: LinkedModifier; modifiers: Modifier[] }[]
  >([]);

  // Flag to track if modifiers have been initialized from cart data
  const [modifiersInitialized, setModifiersInitialized] =
    useState<boolean>(false);

  // State for special instructions
  const [specialInstructions, setSpecialInstructions] = useState<string>("");

  // State to track if user chose "I'll choose" - this will show "Add to Cart" button instead of quantity selector
  // Declared early so it can be used in useEffect below
  const [showAddToCartInsteadOfQuantity, setShowAddToCartInsteadOfQuantity] =
    useState<boolean>(() => searchParams?.get("fromPlpChoose") === "true");

  const store = useSelector((state: RootState) => state.store) || {
    currentStore: storeData,
  };
  // isQrFlow declared above with analytics helpers
  const dineInSessionData = useSelector(selectDineInSessionData);
  const qrResolveData = useSelector(selectQrResolveData);
  const sessionTicketItems = useSessionTicketItems();
  const sessionTableId = useSelector(selectSessionTableId);
  const sessionId = useSelector(selectSessionId);
  const qrFlowTableNumber = useSelector(selectQrFlowTableNumber);
  const ticketId = useSelector(selectTicketId);
  const dispatch = useDispatch();
  const { handleGetCart, cartData } = useStoreCart();
  const {
    handleTicketQuantity,
    loading: ticketQuantityLoading,
    error: ticketQuantityError,
  } = useTicketQuantityControls();
  // comboStepSelections is declared earlier (needed for customization rules).

  // const { allReviews } = useSelector((state: RootState) => state.productReviews);

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [isOpenVarientModal, setIsOpenVarientModal] = useState<boolean>(false);
  const [isClosingModal, setIsClosingModal] = useState<boolean>(false);
  const [isViewMore, setIsViewMore] = useState<boolean>(false);

  const storeSlug = store?.currentStore?.slug || "";

  const isPlpChooseFromUrl = searchParams?.get("fromPlpChoose") === "true";

  /** Cart qty "+" → I'll choose, or PLP I'll choose: show Add to Cart for a new customization */
  const isChooseFreshCustomization =
    urlParams.redirectFromQuantityIncrease ||
    urlParams.redirectFromPlpChoose ||
    isPlpChooseFromUrl;

  const exitPlpChooseMode = useCallback(() => {
    setUrlParams((prev) => ({
      ...prev,
      redirectFromPlpChoose: false,
      rfcEdit: "",
      redirectFromCartToEdit: false,
    }));
    const nextParams = new URLSearchParams(searchParams?.toString() ?? "");
    nextParams.delete("fromPlpChoose");
    nextParams.delete("rfcEdit");
    const query = nextParams.toString();
    router.replace(query ? `${pathname ?? ""}?${query}` : (pathname ?? ""), {
      scroll: false,
    });
  }, [setUrlParams, searchParams, router, pathname]);

  // Helper function to redirect to category page or cart
  // TODO: Currently commented out in usage - Keep for future use if redirect is needed
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const redirectToCategoryOrCart = () => {
    const categorySlug = searchParams?.get("category") || "";
    const menuSlugParam =
      searchParams?.get("menu") || (params?.menuSlug as string) || "";

    if (categorySlug && storeSlug && menuSlugParam) {
      router.push(getCategoryUrl(categorySlug, menuSlugParam, storeSlug));
    } else {
      // Fallback to cart if we don't have the required params
      router.push(getCartUrl(storeSlug));
    }
  };

  // Helper function to calculate product price for toast notification
  const calculateProductPrice = (): number => {
    if (!selectedVariant && !selectedModifiers.length) {
      if (productData?.data?.discountedPrice) {
        return productData.data.discountedPrice;
      }
      return productData?.data?.basePrice || 0;
    }

    const totalSelectedModifiersPrice = selectedModifiers.reduce(
      (total, group) => {
        const groupTotal = group.modifiers.reduce(
          (sum, modifier) => sum + modifier.price,
          0,
        );
        return total + groupTotal;
      },
      0,
    );

    const unitPrice = (() => {
      if (selectedVariant?.discountedPrice != null)
        return selectedVariant.discountedPrice;
      if (selectedVariant?.basePrice != null) return selectedVariant.basePrice;
      if (productData?.data?.discountedPrice != null)
        return productData.data.discountedPrice;
      if (productData?.data?.basePrice != null)
        return productData.data.basePrice;
      return 0;
    })();

    return unitPrice + totalSelectedModifiersPrice;
  };

  // Helper function to show success toast after adding item to cart
  const showAddToCartSuccessToast = () => {
    const productName = productData?.data?.name || "";
    const priceValue = calculateProductPrice();

    // Show toast immediately since we're staying on the same page (no page transition)
    toast("success", lang.itemHasBeenAddedOnCart, {
      productName: productName,
      productPrice: priceValue,
      quantity: 1,
      position: "top-right",
      variant: "product",
    });
  };

  // Helper function to get all modifier groups (variant has first priority; product modifiers only when product has no variants)
  const getAllModifierGroups = useCallback((): LinkedModifier[] => {
    if (isVariantFlowEnabled) {
      return selectedVariant?.linkedModifiers || [];
    }
    return productData?.data?.linkedModifiers || [];
  }, [selectedVariant, productData, isVariantFlowEnabled]);

  // Helper function to find group index using position-based matching
  const findGroupIndex = (
    targetGroup: LinkedModifier,
    groups: LinkedModifier[],
  ): number => {
    return groups.findIndex(
      (group) =>
        group === targetGroup ||
        (group.id === targetGroup.id &&
          group.name.en === targetGroup.name.en) ||
        (group._id === targetGroup._id &&
          group.name.en === targetGroup.name.en),
    );
  };

  // Helper function to get validation error for a specific group
  const getValidationErrorForGroup = (
    group: LinkedModifier,
  ): ValidationError | undefined => {
    return validationErrors.find(
      (error) =>
        error.groupId === (group.id || group._id) &&
        error.groupName === group.name.en,
    );
  };

  // const onViewMoreHandler = () => {
  //   setUrlParams(prev => ({
  //     ...prev,
  //     isReviewTab: true
  //   }));
  //   router.push(`?${new URLSearchParams({
  //     ...Object.fromEntries(Object.entries(urlParams).map(([key, value]) => [key, String(value)])),
  //     reviewTab: 'true'
  //   }).toString()}`, { scroll: true });
  // }

  useEffect(() => {
    if (urlParams.isReviewTab) {
      productOptionsRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [urlParams.isReviewTab]);

  const [showAllModifiers, setShowAllModifiers] = useState<boolean>(false);

  const allModifiers = useMemo(() => {
    const modifiers = selectedModifiers.map((modifier) =>
      modifier.modifiers.map((mod) => mod.name?.en || ""),
    );
    if (modifiers.length > 0) {
      return modifiers.flatMap((mod) => mod).join(", ");
    }
    return "";
  }, [selectedModifiers]);

  // Reset modifiers and variant when not in edit mode and cart data changes
  useEffect(() => {
    // If we have cart data but we're not in edit mode, reset modifiers and variant
    // Also reset when coming from quantity increase with "I'll choose" (redirectFromQuantityIncrease)
    // BUT: Don't reset if user clicked "I'll choose" (showAddToCartInsteadOfQuantity) - allow them to select different variant
    if (
      CartProductData &&
      !urlParams.redirectFromCartToEdit &&
      !urlParams.redirectFromCartToChose &&
      !showAddToCartInsteadOfQuantity
    ) {
      // Reset modifiers immediately - clear any pre-selected modifiers
      setSelectedModifiers([]);
      setModifiersInitialized(false);
      setSpecialInstructions("");
      // Reset variant to first variant if product has variants
      if (shouldShowVariantOptions) {
        // Only set to first variant if current variant doesn't match cart (to avoid unnecessary updates)
        const firstVariant = productData?.data?.variants?.[0];
        if (firstVariant && selectedVariant?._id !== firstVariant._id) {
          setSelectedVariant(firstVariant);
        }
      } else {
        setSelectedVariant(null);
      }
    }
    // When coming from quantity increase with "I'll choose", reset modifiers
    if (isChooseFreshCustomization) {
      setSelectedModifiers([]);
      setModifiersInitialized(false);
      setSpecialInstructions("");
    }
  }, [
    CartProductData,
    urlParams.redirectFromCartToEdit,
    urlParams.redirectFromCartToChose,
    isChooseFreshCustomization,
    productData?.data?.variants,
    productData?.data?.id,
    showAddToCartInsteadOfQuantity,
    shouldShowVariantOptions,
  ]);

  // Reset stale local customization state when navigating to a different product.
  // Without this, simple products can inherit selection state from previous PDP
  // and incorrectly evaluate hasSelectionChanged=true.
  useEffect(() => {
    if (!productData?.data?.id) return;
    if (urlParams.redirectFromCartToEdit || urlParams.redirectFromCartToChose)
      return;

    setSelectedModifiers([]);
    setModifiersInitialized(false);
    setSpecialInstructions("");
    setFlag(false);
    setShowAddToCartInsteadOfQuantity(false);

    if (shouldShowVariantOptions && productData?.data?.variants?.length) {
      setSelectedVariant(productData.data.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [
    productData?.data?.id,
    productData?.data?.variants,
    shouldShowVariantOptions,
    urlParams.redirectFromCartToEdit,
    urlParams.redirectFromCartToChose,
    setSelectedVariant,
  ]);

  useEffect(() => {
    // Only initialize modifiers from cart when explicitly editing (redirectFromCartToEdit)
    // For normal PDP visits, don't pre-select modifiers
    // Also skip if we're not in edit mode (to prevent initialization after reset)
    // Skip initialization when coming from quantity increase with "I'll choose" (redirectFromQuantityIncrease)
    if (
      !CartProductData ||
      modifiersInitialized ||
      !urlParams.redirectFromCartToEdit ||
      urlParams.redirectFromCartToChose ||
      isChooseFreshCustomization
    ) {
      return;
    }

    // Collect all modifiers that need to be added
    const modifiersToAdd: {
      modifierGroup: LinkedModifier;
      modifier: Modifier;
    }[] = [];

    if (urlParams.cartItemId && selectedVariant) {
      CartProductData?.modifierGroup?.map((modGrp: CartItemModifierGroup) => {
        const prodModGrp = selectedVariant?.linkedModifiers?.find(
          (varModGrp: LinkedModifier) =>
            varModGrp?.id === modGrp?.modifierGroupId ||
            varModGrp?._id === modGrp?.modifierGroupId,
        );
        modGrp?.modifiers?.map((mod: CartItemModifier) => {
          const prodMod = prodModGrp?.modifiers?.find(
            (prodMod: Modifier) => prodMod?.modifierId === mod?.modifierId,
          );
          if (prodModGrp && prodMod) {
            modifiersToAdd.push({
              modifierGroup: prodModGrp,
              modifier: prodMod,
            });
          }
        });
      });
    } else {
      CartProductData?.modifierGroup?.map((modGrp: CartItemModifierGroup) => {
        const prodModGrp = productData?.data.linkedModifiers?.find(
          (varModGrp: LinkedModifier) =>
            varModGrp?.id === modGrp?.modifierGroupId ||
            varModGrp?._id === modGrp?.modifierGroupId,
        );
        modGrp?.modifiers?.map((mod: CartItemModifier) => {
          const prodMod = prodModGrp?.modifiers?.find(
            (prodMod: Modifier) => prodMod?.modifierId === mod?.modifierId,
          );
          if (prodModGrp && prodMod) {
            modifiersToAdd.push({
              modifierGroup: prodModGrp,
              modifier: prodMod,
            });
          }
        });
      });
    }

    // Initialize special instructions from cart data
    if (CartProductData?.specialInstructions) {
      setSpecialInstructions(CartProductData.specialInstructions);
    }

    // Apply all modifiers at once
    if (modifiersToAdd.length > 0) {
      setSelectedModifiers(() => {
        // Start with a clean slate to avoid duplicates
        const newModifiers: {
          modifierGroup: LinkedModifier;
          modifiers: Modifier[];
        }[] = [];

        // Process each modifier to add
        modifiersToAdd.forEach(({ modifierGroup, modifier }) => {
          const existingGroupIndex = newModifiers.findIndex(
            (item) =>
              (item.modifierGroup.id === modifierGroup.id &&
                item.modifierGroup.name.en === modifierGroup.name.en) ||
              (item.modifierGroup._id === modifierGroup._id &&
                item.modifierGroup.name.en === modifierGroup.name.en),
          );

          if (existingGroupIndex !== -1) {
            // Group already exists in our new array, add modifier if not already added
            const isModifierAlreadyAdded = newModifiers[
              existingGroupIndex
            ].modifiers.some((mod) => mod.modifierId === modifier.modifierId);

            if (!isModifierAlreadyAdded) {
              newModifiers[existingGroupIndex].modifiers.push(modifier);
            }
          } else {
            // Add new group with this modifier
            newModifiers.push({
              modifierGroup,
              modifiers: [modifier],
            });
          }
        });

        return newModifiers;
      });

      // Mark modifiers as initialized
      setModifiersInitialized(true);
    }

    if (!isOpenVarientModal) {
      // Auto-open variant modal only on mobile. On desktop this modal is hidden,
      // and opening it would lock body scroll without showing any UI.
      setIsOpenVarientModal(
        isMobile &&
          (urlParams.redirectFromCartToChose ||
            urlParams.redirectFromCartToEdit) &&
          !urlParams.isPDP,
      );
    }
  }, [
    CartProductData,
    selectedVariant,
    urlParams.cartItemId,
    urlParams.redirectFromCartToChose,
    urlParams.redirectFromCartToEdit,
    isChooseFreshCustomization,
    modifiersInitialized,
    isMobile,
  ]);

  // Combo step edit: initialize variant + modifiers from combo Redux selections
  usePrefillComboStepSelections({
    isComboStepFlow,
    redirectFromCartToEdit: urlParams.redirectFromCartToEdit,
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
  });

  // Effect to handle variant changes - clean up modifiers that are not available in the new variant
  useEffect(() => {
    if (!selectedVariant || !modifiersInitialized) {
      return;
    }

    setSelectedModifiers((prevModifiers) => {
      // Filter out modifiers that are not available in the new variant
      return prevModifiers.filter((selectedGroup) => {
        // Find the corresponding modifier group in the new variant
        const variantGroup = selectedVariant.linkedModifiers?.find(
          (vg) =>
            (vg.id === selectedGroup.modifierGroup.id &&
              vg.name.en === selectedGroup.modifierGroup.name.en) ||
            (vg._id === selectedGroup.modifierGroup._id &&
              vg.name.en === selectedGroup.modifierGroup.name.en),
        );

        if (!variantGroup) {
          // If the group doesn't exist in the new variant, remove it
          return false;
        }

        // Filter modifiers within the group that are available in the new variant
        const availableModifiers = selectedGroup.modifiers.filter(
          (selectedMod) => {
            return variantGroup.modifiers.some(
              (vm) => vm.modifierId === selectedMod.modifierId,
            );
          },
        );

        // If no modifiers are available in the new variant, remove the group
        if (availableModifiers.length === 0) {
          return false;
        }

        // Update the group with only available modifiers
        selectedGroup.modifiers = availableModifiers;
        selectedGroup.modifierGroup = variantGroup; // Update to the new variant's group reference
        return true;
      });
    });
  }, [selectedVariant, modifiersInitialized]);

  // Effect to reset initialization flag when cart item changes
  useEffect(() => {
    if (urlParams.cartItemId) {
      setModifiersInitialized(false);
    }
  }, [urlParams.cartItemId]);

  const onModifierSelectHandler = (
    modifierGroup: LinkedModifier,
    modifier: Modifier,
  ) => {
    setSelectedModifiers((prevModifiers) => {
      // Handle groups with same ID by using position-based unique identifier
      const allModifierGroups = getAllModifierGroups();
      const currentGroupIndex = findGroupIndex(
        modifierGroup,
        allModifierGroups,
      );

      const existingCategoryIndex = prevModifiers.findIndex((item) => {
        const itemGroupIndex = findGroupIndex(
          item.modifierGroup,
          allModifierGroups,
        );
        return itemGroupIndex === currentGroupIndex;
      });

      if (existingCategoryIndex !== -1) {
        // Check if the modifier is already selected
        const isModifierSelected = prevModifiers[
          existingCategoryIndex
        ].modifiers.some((mod) => mod.modifierId === modifier.modifierId);

        if (isModifierSelected) {
          // Remove the modifier if it's already selected
          const updatedModifiers = prevModifiers[
            existingCategoryIndex
          ].modifiers.filter((mod) => mod.modifierId !== modifier.modifierId);

          if (updatedModifiers.length === 0) {
            // If no modifiers left in the group, remove the entire group
            return prevModifiers.filter(
              (_, index) => index !== existingCategoryIndex,
            );
          }

          // Update the group with remaining modifiers
          const newModifiers = [...prevModifiers];
          newModifiers[existingCategoryIndex] = {
            ...newModifiers[existingCategoryIndex],
            modifiers: updatedModifiers,
          };
          return newModifiers;
        } else {
          // Add the new modifier to the existing group
          const newModifiers = [...prevModifiers];

          if (modifierGroup.config.isMultiple) {
            if (
              prevModifiers[existingCategoryIndex]?.modifiers.length >=
              modifierGroup.config.max
            ) {
              toast(
                "error",
                `${modifierGroup.name.en} you can only select maximum ${modifierGroup.config.max}`,
              );
              return newModifiers;
            }
            newModifiers[existingCategoryIndex] = {
              ...newModifiers[existingCategoryIndex],
              modifiers: [
                ...newModifiers[existingCategoryIndex].modifiers,
                modifier,
              ],
            };
          } else {
            newModifiers[existingCategoryIndex] = {
              ...newModifiers[existingCategoryIndex],
              modifiers: [modifier],
            };
          }

          // Track customisation option selected (only when adding, not removing)
          if (productData?.data?.id) {
            trackProductCustomisationSelected({
              product_id: productData.data.id,
              option_group: modifierGroup.name?.en || "",
              option_value: modifier.name?.en || "",
              price_delta: modifier.price || 0,
            }, dineInTrackExtra);
          }

          return newModifiers;
        }
      } else {
        // Add new modifier group
        setValidationErrors((prevErrors) =>
          prevErrors.filter((error) => error.groupId !== modifierGroup.id),
        );

        // Track customisation option selected (only when adding, not removing)
        if (productData?.data?.id) {
          trackProductCustomisationSelected({
            product_id: productData.data.id,
            option_group: modifierGroup.name?.en || "",
            option_value: modifier.name?.en || "",
            price_delta: modifier.price || 0,
          }, dineInTrackExtra);
        }

        return [...prevModifiers, { modifierGroup, modifiers: [modifier] }];
      }
    });
  };

  const validateSelection = (): boolean => {
    const errors: ValidationError[] = [];
    const mandatoryGroups = getAllModifierGroups().filter(
      (group) => group?.config?.isMandatory,
    );

    if (mandatoryGroups?.length === 0 || !mandatoryGroups) {
      setValidationErrors([]);
      return true;
    }

    mandatoryGroups.forEach((mandatoryGroup) => {
      // Handle groups with same ID by using position-based unique identifier
      const allModifierGroups = getAllModifierGroups();
      const mandatoryGroupIndex = findGroupIndex(
        mandatoryGroup,
        allModifierGroups,
      );

      const selectedGroup = selectedModifiers.find((selected) => {
        const selectedGroupIndex = findGroupIndex(
          selected.modifierGroup,
          allModifierGroups,
        );
        return selectedGroupIndex === mandatoryGroupIndex;
      });

      if (!selectedGroup || selectedGroup.modifiers.length === 0) {
        errors.push({
          groupId: mandatoryGroup.id || mandatoryGroup._id,
          groupName: mandatoryGroup.name.en,
          message: `Please select options for ${mandatoryGroup.name.en}`,
        });
      }
    });

    setValidationErrors(errors);
    if (errors.length > 0) {
      toast("error", "Please select options for mandatory groups");
      return false;
    }
    return true;
  };

  // const offerTextVariant = (bestOffer: DiscountOffer, discountedPrice: number) => {
  //   if (bestOffer?.offerType === 1 && discountedPrice && +discountedPrice >= bestOffer?.discountConfig?.minimumSpendValue) {
  //       return "+ BOGO";
  //   } else if (bestOffer?.offerType === 2) {
  //       const discountType = bestOffer?.discountConfig?.type || undefined;
  //       const discountValue = bestOffer?.discountConfig?.value;
  //       if (discountType && discountValue && discountType === 1) {
  //       return `+ ${discountValue}% OFF`;
  //       } else if (discountType && discountValue && discountType === 2) {
  //       return `+ ${formatCurrency({amount: Number(discountValue)})} OFF`;
  //       }
  //   } else if (bestOffer?.offerType === 3) {
  //       const discountType = bestOffer?.discountConfig?.discountType || undefined;
  //       const discountValue = bestOffer?.discountConfig?.discountValue;
  //       if (discountType && discountValue && discountType === 1) {
  //           return `+ ${discountValue}% OFF`;
  //       } else if (discountType && discountValue && discountType === 2) {
  //           return `+ ${formatCurrency({amount: Number(discountValue)})} OFF`;
  //       }
  //   } else if (bestOffer?.offerType === 5 && discountedPrice && +discountedPrice >= bestOffer?.discountConfig?.minimumSpendValue) {
  //       return "+ FREE ITEM";
  //   }
  // }

  // QR flow (mobile only): single source — matching session ticket items for this product (quantity > 0).
  // On web, this is not used; web PDP can use a separate component. We only compute when isMobile && isQrFlow to avoid work on desktop.
  const matchingSessionItemsForProduct = useMemo(() => {
    if (!isMobile || !isQrFlow || !productData?.data?.id) return [];
    return sessionTicketItems.filter(
      (item) => item.itemId === productData.data.id && (item.quantity || 0) > 0,
    );
  }, [isMobile, isQrFlow, productData?.data?.id, sessionTicketItems]);

  const qrSessionQuantityForProduct = useMemo(() => {
    return matchingSessionItemsForProduct.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0,
    );
  }, [matchingSessionItemsForProduct]);

  const firstMatchingSessionItem = useMemo(() => {
    return matchingSessionItemsForProduct[0] ?? null;
  }, [matchingSessionItemsForProduct]);

  const getDistinctSessionLineCount = useMemo(
    () => matchingSessionItemsForProduct.length,
    [matchingSessionItemsForProduct],
  );

  /** Synthetic cart item for ticket quantity API when on PDP in QR flow */
  const syntheticCartItemForQr = useMemo((): CartItem | null => {
    if (!isQrFlow || !productData?.data || !firstMatchingSessionItem)
      return null;
    return sessionTicketItemToCartItem(
      firstMatchingSessionItem,
      productData.data,
      {
        quantity: qrSessionQuantityForProduct,
        variantIdOverride: selectedVariant?._id ?? "",
      },
    );
  }, [
    isQrFlow,
    productData?.data,
    firstMatchingSessionItem,
    qrSessionQuantityForProduct,
    selectedVariant?._id,
  ]);

  /** QR flow: session ticket items for this product as CartItem[] for MultipleCustomizations modal */
  const allSessionProductItemsAsCart = useMemo((): CartItem[] => {
    if (!productData?.data) return [];
    return matchingSessionItemsForProduct.map((t) =>
      sessionTicketItemToCartItem(t, productData.data),
    );
  }, [matchingSessionItemsForProduct, productData?.data]);

  const storeIdForQr =
    store?.currentStore?.id ?? qrResolveData?.storefrontId ?? undefined;
  const {
    handleAddRemovedItemQr,
    handleMultipleCustomizationsConfirmQr,
    handleRepeatLastQr,
  } = useQrFlowPdpHandlers({
    storeId: storeIdForQr,
    sessionId,
    sessionTableId,
    setLoading,
    toast: toast as (type: string, msg?: string) => void,
    showAddToCartSuccessToast,
    dispatch,
    syntheticCartItemForQr,
    handleTicketQuantity,
  });

  const getTotalProductQuantity = useMemo(() => {
    if (isQrFlow) return qrSessionQuantityForProduct;
    if (!cartData?.data?.items || !productData?.data?.id) {
      return CartProductData?.quantity || 0;
    }

    // Sum up quantities of all items with the same productId
    const totalQuantity = cartData.data.items
      .filter((item) => item.productId === productData.data.id)
      .reduce((sum, item) => sum + (item.quantity || 0), 0);

    return totalQuantity;
  }, [
    isQrFlow,
    qrSessionQuantityForProduct,
    cartData?.data?.items,
    productData?.data?.id,
    CartProductData?.quantity,
  ]);

  // Number of cart lines (distinct types) for this product. >= 2 → list popup; 1 → "I'll choose" / "Repeat last".
  const getDistinctProductLineCount = useMemo(() => {
    if (!cartData?.data?.items || !productData?.data?.id) return 0;
    return cartData.data.items.filter(
      (item) =>
        item.productId === productData.data.id && (item.quantity || 0) > 0,
    ).length;
  }, [cartData?.data?.items, productData?.data?.id]);

  // Shared derived values used by customization dialogs in both decrease/increase handlers.
  const {
    allProductItems: resolvedAllProductItems,
    lineCount: resolvedLineCount,
  } = useMemo(
    () =>
      getProductItemsAndLineCount({
        isQrFlow,
        allSessionProductItemsAsCart,
        cartItems: cartData?.data?.items,
        productId: productData?.data?.id,
        getDistinctSessionLineCount,
        getDistinctProductLineCount,
      }),
    [
      isQrFlow,
      allSessionProductItemsAsCart,
      cartData?.data?.items,
      productData?.data?.id,
      getDistinctSessionLineCount,
      getDistinctProductLineCount,
    ],
  );

  const repeatPrice = useMemo(() => {
    if (isQrFlow) {
      return normalizePrice(syntheticCartItemForQr?.unitBasePrice ?? 0);
    }
    return normalizePrice(
      CartProductData?.totalBasePrice ?? CartProductData?.unitBasePrice ?? 0,
    );
  }, [
    isQrFlow,
    syntheticCartItemForQr?.unitBasePrice,
    CartProductData?.totalBasePrice,
    CartProductData?.unitBasePrice,
  ]);

  const repeatDiscountedPrice = useMemo(() => {
    if (isQrFlow) {
      return normalizePrice(
        syntheticCartItemForQr?.totalBasePriceAfterBaseDiscount ?? 0,
      );
    }
    return normalizePrice(
      CartProductData?.totalBasePriceAfterBaseDiscount ??
        (CartProductData?.unitBasePrice ?? 0) -
          (CartProductData?.totalBaseDiscountAmount ?? 0),
    );
  }, [
    isQrFlow,
    syntheticCartItemForQr?.totalBasePriceAfterBaseDiscount,
    CartProductData?.totalBasePriceAfterBaseDiscount,
    CartProductData?.unitBasePrice,
    CartProductData?.totalBaseDiscountAmount,
  ]);

  /** Same line as repeat prices: session synthetic row in QR flow, else cart row (avoids empty dialog text when CartProductData lags Redux session). */
  const repeatCustomizationLineItem = useMemo((): CartItem | null => {
    if (isQrFlow && syntheticCartItemForQr) return syntheticCartItemForQr;
    return CartProductData;
  }, [isQrFlow, syntheticCartItemForQr, CartProductData]);

  // Helper function to check if cart item actually exists and has valid quantity
  // In QR flow, check session ticket items for this product; otherwise check cart
  const isValidCartItem = () => {
    if (isQrFlow) return qrSessionQuantityForProduct > 0;
    if (!cartData?.data?.items || !productData?.data?.id) {
      return (
        CartProductData &&
        CartProductData.quantity &&
        CartProductData.quantity > 0
      );
    }

    // Check if any item with the same productId exists in cart
    const hasProductInCart = cartData.data.items.some(
      (item) => item.productId === productData.data.id && item.quantity > 0,
    );
    return hasProductInCart;
  };

  const totalPrice = useMemo(() => {
    if (!selectedVariant && !selectedModifiers.length) {
      const basePrice = productData?.data?.basePrice || 0;

      if (productData?.data?.discountedPrice) {
        return (
          <FooterPriceRow
            sale={productData.data.discountedPrice}
            list={basePrice}
            listClassExtra="mr-2"
          />
        );
      }
      return <FooterPriceOnly amount={basePrice} />;
    }

    if (selectedVariant && !selectedModifiers.length) {
      const basePrice = selectedVariant.basePrice || 0;
      const variantOffer = bestOfferForVariant(selectedVariant, isQrFlow);

      if (selectedVariant.discountedPrice) {
        return (
          <FooterPriceRow
            sale={selectedVariant.discountedPrice}
            list={basePrice}
            pill={offerPillFromConfig(variantOffer)}
          />
        );
      }

      return <FooterPriceOnly amount={basePrice} />;
    }

    const totalSelectedModifiersPrice = selectedModifiers.reduce(
      (total, group) => {
        const groupTotal = group.modifiers.reduce(
          (sum, modifier) => sum + modifier.price,
          0,
        );
        return total + groupTotal;
      },
      0,
    );

    const variantOffer = bestOfferForVariant(selectedVariant, isQrFlow);

    if (selectedVariant) {
      const basePrice = selectedVariant.basePrice || 0;

      if (
        selectedVariant.discountedPrice !== undefined &&
        selectedVariant.discountedPrice !== null &&
        selectedVariant.discountedPrice > 0
      ) {
        return (
          <FooterPriceRow
            sale={selectedVariant.discountedPrice + totalSelectedModifiersPrice}
            list={basePrice + totalSelectedModifiersPrice}
            pill={offerPillFromConfig(variantOffer)}
          />
        );
      }

      return (
        <FooterPriceOnly amount={basePrice + totalSelectedModifiersPrice} />
      );
    }

    const basePrice = productData?.data?.basePrice || 0;

    if (
      productData?.data?.discountedPrice !== undefined &&
      productData?.data?.discountedPrice !== null &&
      productData?.data?.discountedPrice > 0
    ) {
      return (
        <FooterPriceRow
          sale={productData.data.discountedPrice + totalSelectedModifiersPrice}
          list={basePrice + totalSelectedModifiersPrice}
          listClassExtra="mr-2"
        />
      );
    }

    return <FooterPriceOnly amount={basePrice + totalSelectedModifiersPrice} />;
  }, [isQrFlow, selectedVariant, selectedModifiers, productData]);

  const createPayload = (): AddToCartPayload => {
    const modifierGroups =
      getAllModifierGroups()
        .filter((group) =>
          selectedModifiers?.find(
            (item) => item.modifierGroup?.name?.en == group?.name?.en,
          ),
        )
        .map((group) => {
          return {
            modifierGroupId: group?.id || group?._id,
            modifiers: group.modifiers
              .filter((modifier) =>
                selectedModifiers
                  .find(
                    (item) => item?.modifierGroup?.name?.en == group?.name?.en,
                  )
                  ?.modifiers.find(
                    (mod) => mod?.modifierId == modifier?.modifierId,
                  ),
              )
              .map((modifier) => ({
                modifierId: modifier?.modifierId,
                quantity: 1,
              })),
          };
        }) || [];

    const shouldSendVariantId = productData?.data?.type?.hasVariants === true;
    const variantId = selectedVariant?._id ? String(selectedVariant._id) : "";

    return {
      quantity: 1,
      productId: productData?.data?.id || "",
      menuSlug: menuSlug || "",
      ...(params?.menuSlug !== "all-day" &&
        params?.menuSlug && { menuSlug: params.menuSlug as string }),
      ...(shouldSendVariantId &&
        isVariantFlowEnabled &&
        variantId && { variantId }),
      ...(modifierGroups.length > 0 && { modifierGroups }),
      ...(specialInstructions.trim() && {
        specialInstructions: specialInstructions.trim(),
      }),
    };
  };

  const getSelectedModifiresCount = (modifierGroup: LinkedModifier) => {
    // Handle groups with same ID by using position-based unique identifier
    const allModifierGroups = getAllModifierGroups();
    const currentGroupIndex = findGroupIndex(modifierGroup, allModifierGroups);

    return (
      selectedModifiers.find((item) => {
        const itemGroupIndex = findGroupIndex(
          item.modifierGroup,
          allModifierGroups,
        );
        return itemGroupIndex === currentGroupIndex;
      })?.modifiers.length || 0
    );
  };

  /** UI cap for counts / copy: cannot select more options than exist in the group. */
  const getModifierGroupDisplayMax = (menu: LinkedModifier) => {
    const optionCount = menu.modifiers?.length ?? 0;
    const configuredMax = menu.config.max ?? 0;
    if (configuredMax <= 0) return configuredMax;
    return Math.min(configuredMax, optionCount);
  };

  const renderModifierGroupHeader = (
    menu: LinkedModifier,
    headingClassName: string,
    descriptionClassName: string,
    spaceBetweenNameAndMandatory: boolean,
  ) => (
    <>
      <h3 className={headingClassName}>
        {menu.name.en}
        {spaceBetweenNameAndMandatory ? " " : null}
        {menu.config.isMandatory && <span>*</span>}{" "}
        {menu.config.isMultiple && (
          <span>{`(${getSelectedModifiresCount(menu)} / ${getModifierGroupDisplayMax(menu)})`}</span>
        )}
      </h3>
      <p className={descriptionClassName}>
        {menu?.config?.max === 0 && !menu?.config?.isMandatory
          ? `${lang.optional} | ${lang.chooseAny} ${menu.name.en}`
          : menu?.config?.isMandatory
            ? `${lang.required} ${menu?.config?.isMultiple ? ` |  ${lang.youCanSelectUpTo} ${getModifierGroupDisplayMax(menu)} ${lang.items}` : ""}`
            : `${lang.optional}  |  ${lang.youCanSelectUpTo} ${getModifierGroupDisplayMax(menu)} ${lang.items}`}
      </p>
    </>
  );

  const showPriceInMobile = useMemo(() => {
    return (
      !productCustomizationRules.hasVariantOptions &&
      !productCustomizationRules.hasModifierOptions
    );
  }, [
    productCustomizationRules.hasVariantOptions,
    productCustomizationRules.hasModifierOptions,
  ]);

  const normalizeOptionalId = useCallback((value: unknown): string | null => {
    if (value === undefined || value === null) return null;
    const normalized = String(value).trim();
    if (!normalized || normalized === "null" || normalized === "undefined")
      return null;
    return normalized;
  }, []);

  const normalizeInstructions = useCallback((value: unknown): string => {
    if (value === undefined || value === null) return "";
    const normalized = String(value).trim();
    if (!normalized || normalized === "null" || normalized === "undefined")
      return "";
    return normalized;
  }, []);

  const referenceCartData = useMemo(() => {
    if (CartProductData) return CartProductData;
    if (isQrFlow) return syntheticCartItemForQr;
    if (!cartData?.data?.items || !productData?.data?.id) return null;

    return (
      cartData.data.items.find(
        (item) => String(item.productId) === String(productData.data.id),
      ) || null
    );
  }, [
    CartProductData,
    isQrFlow,
    syntheticCartItemForQr,
    cartData?.data?.items,
    productData?.data?.id,
  ]);

  // Function to check if current selections differ from cart data
  const hasSelectionChanged = useMemo(() => {
    if (!referenceCartData || Number(referenceCartData.quantity || 0) <= 0)
      return true;

    const isSimpleProduct = productCustomizationRules.isSimpleProduct;

    // Simple flow: only special request can differ.
    const currentInstructions = normalizeInstructions(specialInstructions);
    const cartInstructions = normalizeInstructions(
      referenceCartData.specialInstructions,
    );
    if (isSimpleProduct) return currentInstructions !== cartInstructions;

    // Variant flow: compare variant only when type says has variants.
    if (isVariantFlowEnabled) {
      const selectedVariantId = normalizeOptionalId(selectedVariant?._id);
      const cartVariantId = normalizeOptionalId(referenceCartData.variantId);
      if (selectedVariantId !== cartVariantId) return true;
    }

    if (currentInstructions !== cartInstructions) return true;

    const cartModifierGroups = referenceCartData.modifierGroup || [];
    if (cartModifierGroups.length !== selectedModifiers.length) return true;

    for (const cartGroup of cartModifierGroups) {
      const selectedGroup = selectedModifiers.find(
        (sg) =>
          String(sg.modifierGroup.id || sg.modifierGroup._id) ===
          String(cartGroup.modifierGroupId),
      );
      if (!selectedGroup) return true;

      const cartModifiers = cartGroup.modifiers || [];
      const selectedGroupModifiers = selectedGroup.modifiers || [];
      if (cartModifiers.length !== selectedGroupModifiers.length) return true;

      for (const cartMod of cartModifiers) {
        const found = selectedGroupModifiers.find(
          (sm) => String(sm.modifierId) === String(cartMod.modifierId),
        );
        if (!found) return true;
      }
    }

    return false;
  }, [
    referenceCartData,
    productCustomizationRules.isSimpleProduct,
    isVariantFlowEnabled,
    normalizeInstructions,
    specialInstructions,
    normalizeOptionalId,
    selectedVariant?._id,
    selectedModifiers,
  ]);

  const createPatchPayload = (): PatchCartPayload => {
    return {
      id: CartProductData?.cartId || "",
      customType: "UPDATE_MODIFIERS",
      cartItemId: CartProductData?.id || "",
      variantId:
        isVariantFlowEnabled && selectedVariant?._id
          ? `${selectedVariant?._id}`
          : "",
      modifierGroups: selectedModifiers.map(
        (modGrp: { modifierGroup: LinkedModifier; modifiers: Modifier[] }) => {
          return {
            modifierGroupId:
              modGrp?.modifierGroup?.id || modGrp?.modifierGroup?._id,
            modifiers: modGrp.modifiers.map((mod: Modifier) => {
              return {
                modifierId: mod?.modifierId,
                quantity: 1,
              };
            }),
          };
        },
      ),
      ...(specialInstructions.trim() && {
        specialInstructions: specialInstructions.trim(),
      }),
    };
  };

  /** Generic helper: build ticket items payload for QR flow (add/edit/remove). */
  const createTicketItemsPayload = (
    sessionId: string,
    customType: AddItemsToTicketPayload["items"][number]["customType"],
    overrides?: { quantity?: number },
  ): AddItemsToTicketPayload => {
    const payload = createPayload();
    const itemSku =
      selectedVariant?.sku ??
      (productData?.data as { sku?: string })?.sku ??
      productData?.data?.id ??
      "";
    const quantity = overrides?.quantity ?? payload.quantity ?? 1;

    // Find the ticket item ID from session data for UPDATE_MODIFIERS
    // Prefer cid from URL (source of truth when editing); then CartProductData.id; else first matching session item
    const cidFromUrl = searchParams?.get("cid") ?? null;
    const ticketItemId =
      customType === "UPDATE_MODIFIERS" &&
      (cidFromUrl || urlParams.cartItemId || CartProductData?.id)
        ? ((cidFromUrl || urlParams.cartItemId || CartProductData?.id) ?? "")
        : sessionTicketItems?.find(
            (ticketItem: SessionTicketItem) =>
              ticketItem.itemId === productData?.data?.id ||
              ticketItem.productId === productData?.data?.id,
          )?.id;

    return {
      sessionId,
      items: [
        {
          ...(customType === "UPDATE_MODIFIERS"
            ? { ticketItemId: ticketItemId || (productData?.data?.id ?? "") }
            : { itemId: productData?.data?.id ?? "" }),
          itemSku,
          quantity,
          sequenceNumber: 1,
          customType,
          ...(isVariantFlowEnabled &&
            payload.variantId && { variantId: payload.variantId }),
          ...(payload.modifierGroups &&
            payload.modifierGroups.length > 0 && {
              modifierGroups: payload.modifierGroups.map((g) => ({
                modifierGroupId: g.modifierGroupId,
                modifiers: g.modifiers.map((m) => ({
                  modifierId: String(m.modifierId),
                  quantity: m.quantity ?? 1,
                })),
              })),
            }),
          ...(payload.specialInstructions && {
            specialInstructions: payload.specialInstructions,
          }),
        },
      ],
    };
  };

  const runTicketAction = async (
    customType: AddItemsToTicketPayload["items"][number]["customType"],
  ) => {
    const effectiveSessionId =
      dineInSessionData?.sessionId ?? qrResolveData?.sessionId ?? sessionId;

    if (!effectiveSessionId) {
      toast("error", "Session not found. Please scan the table QR again.");
      return;
    }
    const storeId =
      store?.currentStore?.id || qrResolveData?.storefrontId || "";
    if (!storeId) {
      toast("error", "Store not found.");
      return;
    }
    const payload = createTicketItemsPayload(effectiveSessionId, customType);
    setLoading(true);
    try {
      // Mirror cart flow: PATCH for update (save changes), POST for add (add to cart)
      if (customType === "UPDATE_MODIFIERS") {
        await updateTicketItems(storeId, payload);
      } else {
        await addItemsToTicket(storeId, payload);
      }
      setShowAddToCartInsteadOfQuantity(false);
      setFlag(false);
      setIsClosingModal(true);
      setTimeout(() => {
        setIsOpenVarientModal(false);
        setIsClosingModal(false);
      }, 300);
      showAddToCartSuccessToast();
      // Refetch session so Redux has updated ticket items and PDP shows correct quantity
      const tableId =
        sessionTableId ??
        (dineInSessionData as { tableId?: string })?.tableId ??
        undefined;
      const sessionData = await getSession(storeId, {
        tableId,
        sessionId: effectiveSessionId,
      });
      dispatch(setDineInSessionData(sessionData));
      if (customType === "ADD_QUANTITY" && productData?.data) {
        try {
          const ticketPayload = createTicketItemsPayload(
            effectiveSessionId,
            customType,
          );
          const quantity = ticketPayload.items[0]?.quantity ?? 1;
          const attr = selectedVariant?.attributes?.[0];
          const variantKey = attr?.name || "size";
          const variantValue = attr?.value || "";
          const unitPrice = calculateProductPrice();
          void trackDineInAddToCart({
            product_id: productData.data.id,
            product_name: productData.data.name,
            variant: variantValue ? { [variantKey]: variantValue } : {},
            quantity,
            price: selectedVariant?.basePrice || 0,
            total_value: unitPrice * quantity,
            session_id: effectiveSessionId,
            ticket_id: ticketId || undefined,
            table_number: qrFlowTableNumber || undefined,
          });
        } catch {
          // ignore analytics errors
        }
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast("error", err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const patchCartHandeler = async () => {
    const isValid = validateSelection();
    if (!isValid || !productData) return;

    if (isQrFlow) {
      await runTicketAction("UPDATE_MODIFIERS");
      router.push(getCartUrl());
      return;
    }

    const payload = createPatchPayload();

    if (payload.variantId === "") {
      delete payload.variantId;
    }

    setLoading(true);
    try {
      await patchCart(store?.currentStore?.id || "", payload);
      router.push(getCartUrl());
    } catch {
      // handled silently for now
    } finally {
      setLoading(false);
    }
  };

  const addToCartHandler = async () => {
    const isValid = validateSelection();
    if (!isValid || !productData) return;

    if (isQrFlow) {
      await runTicketAction("ADD_QUANTITY");
      if (urlParams.redirectFromPlpChoose) {
        exitPlpChooseMode();
      }
      return;
    }

    setLoading(true);
    const payload = createPayload();
    if (isValid && productData) {
      try {
        await addToCart(store?.currentStore?.id || "", payload);
        // Track Add to Cart click
        try {
          const quantity = payload.quantity || 1;
          const attr = selectedVariant?.attributes?.[0];
          const variantKey = attr?.name || "size";
          const variantValue = attr?.value || "";
          const unitPrice = calculateProductPrice();
          const totalValue = unitPrice * quantity;

          await trackAddToCart({
            product_id: productData.data.id,
            product_name: productData.data.name,
            variant: variantValue ? { [variantKey]: variantValue } : {},
            quantity,
            price: selectedVariant?.basePrice || 0,
            total_value: totalValue,
          });
        } catch {
          // ignore analytics errors
        }

        // Reset the flag when item is added to cart
        setShowAddToCartInsteadOfQuantity(false);
        // Restore quantity selector in footer (flag stays true during "I'll choose" variant pick)
        setFlag(false);

        // Close the variant modal in mobile view with smooth transition after successfully adding to cart
        setIsClosingModal(true);
        setTimeout(() => {
          setIsOpenVarientModal(false);
          setIsClosingModal(false);
        }, 300);

        // Refresh cart data to update cart count
        await handleGetCart(store?.currentStore?.id || "");

        // Redirect to cart only when coming from cart quantity-increase flow (not PLP)
        if (urlParams.redirectFromQuantityIncrease) {
          showAddToCartSuccessToast();
          router.push(getCartUrl());
          return;
        }

        if (urlParams.redirectFromPlpChoose) {
          exitPlpChooseMode();
        }

        // Redirect to PLP page first
        // TODO: Commented out - Keep user on PDP page after adding to cart. Uncomment if redirect is needed in future.
        // redirectToCategoryOrCart();

        // Show toast after redirect
        showAddToCartSuccessToast();
      } catch (error) {
        const Error = error as { response: { data: { message: string } } };
        toast(
          "error",
          Error?.response?.data?.message || "Something went wrong",
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const onMobileAddToOrderHandler = async () => {
    if (isComboStepFlow && goToNextStep) {
      // Combo flow UX:
      // - If product has options (variant/modifiers): first tap opens modal ("Add"), second tap inside modal proceeds ("Next")
      // - If product has no options: directly proceed to next step ("Next")
      if (!showPriceInMobile && !isOpenVarientModal) {
        setIsOpenVarientModal(true);
        return;
      }

      const isValid = validateSelection();
      if (isValid) {
        persistComboSelectionForStep();
        goToNextStep();
      }
      return;
    }

    if (isQrFlow) {
      // No options → add to ticket directly
      if (showPriceInMobile) {
        await addToCartHandler();
        return;
      }
      // Modal already open → user clicked Add to cart inside modal → call ticket API
      if (isOpenVarientModal) {
        await addToCartHandler();
        return;
      }
      // Open variant modal for selection
      setIsOpenVarientModal(true);
      return;
    }
    if (showPriceInMobile) {
      await addToCartHandler();
    } else {
      setIsOpenVarientModal(true);
    }
  };
  const {
    handleQuantity,
    error,
    loading: quantityLoading,
  } = useQuantityControls(CartProductData?.cartId || "");
  useDisableBodyScroll(isMobile && isOpenVarientModal);

  const pdpQuantityItemId = isQrFlow
    ? productData?.data?.id
    : CartProductData?.id;
  const pdpQuantityItem = isQrFlow
    ? (syntheticCartItemForQr ?? undefined)
    : CartProductData || undefined;
  const pdpQuantityLoading =
    loading || quantityLoading || (isQrFlow && ticketQuantityLoading);
  const pdpQuantityError = error || ticketQuantityError || "";

  const persistComboSelectionForStep = usePersistComboSelectionForStep({
    isComboStepFlow,
    currentStepIndex,
    productId: productData?.data?.id,
    isVariantFlowEnabled,
    selectedVariantId: selectedVariant?._id,
    selectedModifiers,
  });

  // Helper function to handle "Repeat last" - increase quantity, redirect, and show toast
  const handleRepeatLast = async (customType: string, itemId: string) => {
    try {
      setLoading(true);

      // Close dialog first
      close_dialog(["customizationRepeat"]);

      // Increase quantity with same modifiers and special instructions (this already refreshes cart internally)
      await handleQuantity(
        customType,
        itemId,
        CartProductData?.specialInstructions,
      );

      // Redirect to PLP page
      // TODO: Commented out - Keep user on PDP page after adding to cart. Uncomment if redirect is needed in future.
      // redirectToCategoryOrCart();

      // Show toast after redirect
      showAddToCartSuccessToast();
    } catch (error) {
      const Error = error as { response: { data: { message: string } } };
      toast("error", Error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Reset the flag when selections change or when item is added to cart
  // Don't reset if showAddToCartInsteadOfQuantity is true (user clicked "I'll choose")
  useEffect(() => {
    if (showAddToCartInsteadOfQuantity) {
      return;
    }
    if (hasSelectionChanged || flag) {
      setShowAddToCartInsteadOfQuantity(false);
    }
  }, [hasSelectionChanged, flag, showAddToCartInsteadOfQuantity]);

  // PLP "I'll choose": keep Add to Cart mode even if urlParams state syncs after first paint
  useEffect(() => {
    if (!urlParams.redirectFromPlpChoose && !isPlpChooseFromUrl) return;
    setShowAddToCartInsteadOfQuantity(true);
  }, [urlParams.redirectFromPlpChoose, isPlpChooseFromUrl]);

  // Reset the flag when cart data changes (item removed or quantity changed externally)
  useEffect(() => {
    if (!CartProductData || !isValidCartItem()) {
      setShowAddToCartInsteadOfQuantity(false);
    }
  }, [CartProductData]);

  // Function to get modifier description from any cart item
  const getModifierDescriptionForItem = (item: CartItem | null): string => {
    return getModifierDescriptionForCartItem(item, language);
  };

  const repeatCustomizationDisplay = useMemo(
    () =>
      getCustomizationRepeatDisplayForCartItem(
        repeatCustomizationLineItem,
        language,
      ),
    [repeatCustomizationLineItem, language],
  );

  // Single flag used everywhere to show customization UI.
  const hasVariants = productCustomizationRules.hasCustomizations;

  // Simple check: product has only one variant and no modifiers
  const hasOnlyOneVariantNoModifiers =
    shouldShowVariantOptions &&
    productData?.data?.variants?.length === 1 &&
    !productData?.data?.linkedModifiers?.length;

  // Handler for quantity change in multiple customizations modal.
  // Trust the customType from the modal: ProductQuantitySelector uses local/optimistic quantity
  // and allowRemoveWhenOne to decide SUBTRACT_QUANTITY vs DELETE_ITEM. Do not override using
  // cartData here—cart can be stale (refetch lag), causing wrong DELETE_ITEM when we meant
  // SUBTRACT_QUANTITY (e.g. decreasing 3→2).
  const handleMultipleCustomizationQuantityChange = async (
    itemId: string,
    customType: string,
  ) => {
    try {
      // Find the item in cart to get its special instructions
      const cartItem = cartData?.data?.items?.find(
        (item) => item.id === itemId,
      );
      const itemSpecialInstructions = cartItem?.specialInstructions;

      // If trying to subtract and current quantity is 1, use DELETE_ITEM instead
      if (customType === "SUBTRACT_QUANTITY") {
        // Find the item in cart to check its current quantity
        if (cartItem && cartItem.quantity === 1) {
          // Use DELETE_ITEM to remove the item when quantity is 1
          await handleQuantity("DELETE_ITEM", itemId);
        } else {
          await handleQuantity(customType, itemId, itemSpecialInstructions);
        }
      } else {
        await handleQuantity(customType, itemId, itemSpecialInstructions);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // Handler to add back a removed item to cart
  const handleAddRemovedItem = async (removedItem: CartItem) => {
    if (isQrFlow) {
      return handleAddRemovedItemQr(removedItem);
    }
    try {
      setLoading(true);

      // Create payload from the removed item
      const payload: AddToCartPayload = {
        quantity: 1,
        productId: removedItem.productId || productData?.data?.id || "",
        menuSlug: menuSlug || "",
        ...(params?.menuSlug !== "all-day" &&
          params?.menuSlug && { menuSlug: params.menuSlug as string }),
        ...(isVariantFlowEnabled &&
          removedItem.variantId && { variantId: removedItem.variantId }),
        ...(removedItem.modifierGroup &&
          removedItem.modifierGroup.length > 0 && {
            modifierGroups: removedItem.modifierGroup.map(
              (modGroup: CartItemModifierGroup) => ({
                modifierGroupId: modGroup.modifierGroupId,
                modifiers: modGroup.modifiers.map((mod: CartItemModifier) => ({
                  modifierId: mod.modifierId,
                  quantity: 1,
                })),
              }),
            ),
          }),
      };

      await addToCart(store?.currentStore?.id || "", payload);

      // Refresh cart to update quantities
      await handleGetCart(store?.currentStore?.id || "");
    } catch (error) {
      const Error = error as { response: { data: { message: string } } };
      toast("error", Error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Handler for "Confirm" button in multiple customizations modal. Applies staged quantity changes only on Confirm. Closes dialog after get completes so modal can show loader until then.
  const handleMultipleCustomizationsConfirm = async (
    isRemoveDialog?: boolean,
    stagedState?: MultipleCustomizationsStagedState,
  ) => {
    if (isQrFlow) {
      return handleMultipleCustomizationsConfirmQr(isRemoveDialog, stagedState);
    }
    try {
      setLoading(true);
      // Redirect to PLP page
      // TODO: Commented out - Keep user on PDP page after adding to cart. Uncomment if redirect is needed in future.
      // redirectToCategoryOrCart();

      // Batch options: run all PATCHes first, then a single GET at the end (avoids N get calls for N quantity changes)
      const batchOptions = { skipGetCart: true } as const;

      if (stagedState) {
        const {
          items: stagedItems,
          removedItems: stagedRemoved,
          initialItems,
        } = stagedState;
        const initialById = new Map((initialItems || []).map((i) => [i.id, i]));
        const stagedById = new Map((stagedItems || []).map((i) => [i.id, i]));

        // 1. Delete items that user removed: in removedItems list, or in initial but not in staged / staged with qty 0
        const toDeleteIds = new Set<string>();
        (stagedRemoved || []).forEach((r) => {
          if (r?.id) toDeleteIds.add(r.id);
        });
        initialItems?.forEach((init) => {
          if (!init?.id) return;
          const staged = stagedById.get(init.id);
          if (!staged || (staged.quantity ?? 0) === 0) toDeleteIds.add(init.id);
        });
        for (const id of toDeleteIds) {
          await handleQuantity(
            "DELETE_ITEM",
            id,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            batchOptions,
          );
        }

        // 2. For each staged item with qty > 0, apply quantity delta vs initial
        for (const item of stagedItems || []) {
          if (!item?.id || (item.quantity ?? 0) === 0) continue;
          if (toDeleteIds.has(item.id)) continue;
          const initialItem = initialById.get(item.id);
          const initialQty = initialItem?.quantity ?? 0;
          const newQty = item.quantity ?? 0;
          const specialInstructions =
            item.specialInstructions ?? initialItem?.specialInstructions;
          const alreadyInCartQty = initialItem ? 0 : 1;

          if (newQty > initialQty + alreadyInCartQty) {
            const addCount = newQty - initialQty - alreadyInCartQty;
            for (let i = 0; i < addCount; i++) {
              await handleQuantity(
                "ADD_QUANTITY",
                item.id,
                specialInstructions ?? undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                batchOptions,
              );
            }
          } else if (initialItem && newQty < initialQty) {
            let currentQty = initialQty;
            const toReduce = initialQty - newQty;
            for (let i = 0; i < toReduce; i++) {
              if (currentQty === 1) {
                await handleQuantity(
                  "DELETE_ITEM",
                  item.id,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  batchOptions,
                );
                break;
              }
              await handleQuantity(
                "SUBTRACT_QUANTITY",
                item.id,
                specialInstructions ?? undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                batchOptions,
              );
              currentQty--;
            }
          }
        }
      }

      await handleGetCart(store?.currentStore?.id || "");

      close_dialog(["multipleCustomizations"]);

      if (!isRemoveDialog) {
        showAddToCartSuccessToast();
      }
    } catch (error) {
      const Error = error as { response: { data: { message: string } } };
      toast("error", Error?.response?.data?.message || "Something went wrong");
      // Sync cart on partial failure so UI matches server state
      await handleGetCart(store?.currentStore?.id || "");
    } finally {
      setLoading(false);
    }
  };

  // Custom handler for quantity decrease that shows dialog for variant/modifier products when count >= 2
  // Reused for both normal (cart) and QR (session) flow; data source and syncFromCart are condition-based
  const handleQuantityDecreaseWithDialog = (
    customType: string,
    itemId: string,
  ) => {
    const productHasVariants = shouldShowVariantOptions;
    const productHasModifiers =
      !isVariantFlowEnabled &&
      !!(
        productData?.data?.linkedModifiers &&
        productData.data.linkedModifiers.length > 0
      );
    const cartHasModifiers =
      CartProductData?.modifierGroup &&
      CartProductData.modifierGroup.length > 0;
    const cartHasVariants =
      CartProductData?.variantId ||
      (CartProductData?.variantAttributes &&
        Object.keys(CartProductData.variantAttributes || {}).length > 0);
    const sessionHasModifiers =
      isQrFlow &&
      allSessionProductItemsAsCart.some(
        (i) => i.modifierGroup && i.modifierGroup.length > 0,
      );
    const sessionHasVariants =
      isQrFlow &&
      allSessionProductItemsAsCart.some(
        (i) =>
          i.variantId ||
          (i.variantAttributes &&
            Object.keys(i.variantAttributes || {}).length > 0),
      );

    const hasVariantsOrModifiers =
      hasVariants ||
      productHasVariants ||
      productHasModifiers ||
      cartHasVariants ||
      cartHasModifiers ||
      sessionHasVariants ||
      sessionHasModifiers;

    const shouldShowMultipleDialog =
      hasVariantsOrModifiers &&
      resolvedLineCount >= 2 &&
      resolvedAllProductItems.length > 0 &&
      productData?.data?.id;

    if (shouldShowMultipleDialog) {
      try {
        open_dialog("multipleCustomizations", {
          open: true,
          propsData: {
            title: "Remove previous customisation?",
            items: resolvedAllProductItems,
            onQuantityChange: handleMultipleCustomizationQuantityChange,
            getModifierDescription: getModifierDescriptionForItem,
            productId: productData!.data!.id,
            showChooseButton: false,
            onConfirm: (stagedState: MultipleCustomizationsStagedState) =>
              handleMultipleCustomizationsConfirm(true, stagedState),
            onAddItem: handleAddRemovedItem,
            isRemoveDialog: true,
            syncFromCart: !isQrFlow,
            onClose: () => {
              // Reset modifiers and special instructions when user wants to choose fresh
              setSelectedModifiers([]);
              setSpecialInstructions("");
              // Reset variant to first if product has variants
              if (shouldShowVariantOptions) {
                setSelectedVariant(productData.data.variants[0]);
              } else if (!productData?.data?.variants?.length) {
                setSelectedVariant(null);
              }
              if (isMobile) {
                setShowAddToCartInsteadOfQuantity(true);
                setIsOpenVarientModal(true);
                close_dialog(["multipleCustomizations"]);
              } else {
                setShowAddToCartInsteadOfQuantity(true);
                close_dialog(["multipleCustomizations"]);
              }
            },
          },
          type: "multipleCustomizations",
          handlerDialog: () => {},
          handleClose: () => close_dialog(["multipleCustomizations"]),
          anchor: "bottom",
          className: "multiple-customizations-dialog",
          onlyDialog: false,
          dialogPosition: "bottom",
          sxStyle: { "& .MuiPaper-root": { width: "100%" } },
        });
      } catch (error) {
        console.error("Error opening multiple customizations dialog:", error);
        if (isQrFlow && syntheticCartItemForQr)
          handleTicketQuantity("SUBTRACT_QUANTITY", syntheticCartItemForQr.id!);
        else handleQuantity(customType, itemId);
      }
    } else {
      if (isQrFlow && syntheticCartItemForQr)
        handleTicketQuantity("SUBTRACT_QUANTITY", syntheticCartItemForQr.id!);
      else handleQuantity(customType, itemId);
    }
  };

  // Custom handler for quantity increase that shows dialog for variant/modifier products
  // Reused for both normal (cart) and QR (session) flow; data source and syncFromCart are condition-based
  const handleQuantityIncreaseWithDialog = (
    customType: string,
    itemId: string,
    specialInstructions?: string,
  ) => {
    const productHasVariants = shouldShowVariantOptions;
    const productHasModifiers =
      !isVariantFlowEnabled &&
      !!(
        productData?.data?.linkedModifiers &&
        productData.data.linkedModifiers.length > 0
      );
    const cartHasModifiers =
      CartProductData?.modifierGroup &&
      CartProductData.modifierGroup.length > 0;
    const cartHasVariants =
      CartProductData?.variantId ||
      (CartProductData?.variantAttributes &&
        Object.keys(CartProductData.variantAttributes || {}).length > 0);
    const sessionHasModifiers =
      isQrFlow &&
      allSessionProductItemsAsCart.some(
        (i) => i.modifierGroup && i.modifierGroup.length > 0,
      );
    const sessionHasVariants =
      isQrFlow &&
      allSessionProductItemsAsCart.some(
        (i) =>
          i.variantId ||
          (i.variantAttributes &&
            Object.keys(i.variantAttributes || {}).length > 0),
      );

    const hasVariantsOrModifiers =
      hasVariants ||
      productHasVariants ||
      productHasModifiers ||
      cartHasVariants ||
      cartHasModifiers ||
      sessionHasVariants ||
      sessionHasModifiers;

    // Check if product has only one variant - if so, treat it as a normal product
    const hasOnlyOneVariant =
      productHasVariants && productData?.data?.variants?.length === 1;
    const shouldSkipDialog =
      hasOnlyOneVariant &&
      !productHasModifiers &&
      !cartHasModifiers &&
      !sessionHasModifiers;

    const doDirectIncrease = () => {
      if (isQrFlow && syntheticCartItemForQr)
        handleTicketQuantity("ADD_QUANTITY", syntheticCartItemForQr.id!);
      else
        handleQuantity(
          customType,
          itemId,
          specialInstructions || CartProductData?.specialInstructions,
        );
    };

    if (hasVariantsOrModifiers && !shouldSkipDialog) {
      if (
        resolvedLineCount >= 2 &&
        resolvedAllProductItems.length > 0 &&
        productData?.data?.id
      ) {
        try {
          open_dialog("multipleCustomizations", {
            open: true,
            propsData: {
              title: lang.repeatTitle || "Repeat previous customisation?",
              items: resolvedAllProductItems,
              onQuantityChange: handleMultipleCustomizationQuantityChange,
              getModifierDescription: getModifierDescriptionForItem,
              productId: productData.data.id,
              onConfirm: (stagedState: MultipleCustomizationsStagedState) =>
                handleMultipleCustomizationsConfirm(false, stagedState),
              onAddItem: handleAddRemovedItem,
              isRemoveDialog: false,
              syncFromCart: !isQrFlow,
              onClose: () => {
                // Reset modifiers and special instructions when user wants to choose fresh
                setSelectedModifiers([]);
                setSpecialInstructions("");
                // Reset variant to first if product has variants
                if (shouldShowVariantOptions) {
                  setSelectedVariant(productData.data.variants[0]);
                } else if (!productData?.data?.variants?.length) {
                  setSelectedVariant(null);
                }
                if (isMobile) {
                  setShowAddToCartInsteadOfQuantity(true);
                  setIsOpenVarientModal(true);
                  close_dialog(["multipleCustomizations"]);
                } else {
                  setShowAddToCartInsteadOfQuantity(true);
                  close_dialog(["multipleCustomizations"]);
                }
              },
            },
            type: "multipleCustomizations",
            handlerDialog: () => {},
            handleClose: () => close_dialog(["multipleCustomizations"]),
            anchor: "bottom",
            className: "multiple-customizations-dialog",
            onlyDialog: false,
            dialogPosition: "bottom",
            sxStyle: { "& .MuiPaper-root": { width: "100%" } },
          });
        } catch (error) {
          console.error("Error opening multiple customizations dialog:", error);
          doDirectIncrease();
        }
      } else {
        try {
          open_dialog("customizationRepeat", {
            open: true,
            propsData: {
              title: lang.repeatTitle || "Repeat previous customisation?",
              ...(repeatCustomizationDisplay.productName
                ? { productName: repeatCustomizationDisplay.productName }
                : {}),
              ...(repeatCustomizationDisplay.description
                ? { description: repeatCustomizationDisplay.description }
                : {}),
              price: repeatPrice,
              discountedPrice: repeatDiscountedPrice,
              mobileTitle: lang.repeatTitle || "Repeat previous customisation?",
              yesButtonText: lang.repeatYes || "Repeat last",
              noButtonText: lang.repeatNo || "I'll choose",
              onYes: () => {
                if (isQrFlow) handleRepeatLastQr(customType, itemId);
                else handleRepeatLast(customType, itemId);
              },
              onNo: () => {
                setShowAddToCartInsteadOfQuantity(true);
                // Reset modifiers and special instructions when user wants to choose fresh
                setSelectedModifiers([]);
                setSpecialInstructions("");
                // Reset variant if product has variants
                if (shouldShowVariantOptions) {
                  const firstVariant = productData?.data?.variants?.[0];
                  if (firstVariant) setSelectedVariant(firstVariant);
                } else if (!productData?.data?.variants?.length) {
                  setSelectedVariant(null);
                }
                if (hasVariants || shouldShowVariantOptions)
                  setIsOpenVarientModal(true);
                close_dialog(["customizationRepeat"]);
              },
            },
            type: "customizationRepeat",
            handlerDialog: () => {},
            handleClose: () => close_dialog(["customizationRepeat"]),
            anchor: "bottom",
            onlyDialog: false,
            sxStyle: {
              "& .MuiPaper-root": {
                "@media (max-width: 768px)": { padding: "20px 16px" },
                "@media (min-width: 768px)": {
                  position: "fixed",
                  bottom: "50px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  top: "auto",
                  margin: 0,
                  maxWidth: "600px",
                  width: "100%",
                },
              },
              "& .MuiDialogContent-root": { padding: "20px 16px" },
            },
          });
        } catch (error) {
          console.error("Error opening dialog:", error);
          doDirectIncrease();
        }
      }
    } else {
      doDirectIncrease();
    }
  };

  // Check if mandatory variants or modifiers are selected (for enabling Add to Cart button)
  // This only applies when showing "Add to Cart" button (not when item is already in cart with no changes)
  const canAddToCart = useMemo(() => {
    // For simple products (no variants/modifiers), always allow adding to cart
    if (!hasVariants) {
      return true;
    }

    // Only check selection when we're in "add to cart" mode
    // (when item is not in cart, or has selection changes, or flag is set)
    const isAddToCartMode = flag || !isValidCartItem() || hasSelectionChanged;

    // If we're not in "add to cart" mode, allow (we'll show quantity selector instead)
    if (!isAddToCartMode) {
      return true;
    }

    // Check if there are mandatory variants or modifiers
    const productHasVariants = shouldShowVariantOptions;
    const allModifierGroups = getAllModifierGroups();
    const hasMandatoryModifiers = allModifierGroups.some(
      (group) => group?.config?.isMandatory,
    );

    // If there are variants, they are always mandatory - require variant selection
    if (productHasVariants && !selectedVariant) {
      return false;
    }

    // If there are mandatory modifiers, check if they are selected
    if (hasMandatoryModifiers) {
      // Check if all mandatory modifier groups have at least one selection
      const mandatoryGroups = allModifierGroups.filter(
        (group) => group?.config?.isMandatory,
      );
      const allMandatorySelected = mandatoryGroups.every((mandatoryGroup) => {
        // Find if this mandatory group has any selected modifiers
        return selectedModifiers.some((selected) => {
          const allModifierGroupsForCheck = getAllModifierGroups();
          const mandatoryGroupIndex = findGroupIndex(
            mandatoryGroup,
            allModifierGroupsForCheck,
          );
          const selectedGroupIndex = findGroupIndex(
            selected.modifierGroup,
            allModifierGroupsForCheck,
          );
          return (
            mandatoryGroupIndex === selectedGroupIndex &&
            selected.modifiers.length > 0
          );
        });
      });
      return allMandatorySelected;
    }

    // If no mandatory variants/modifiers, allow adding to cart (all are optional)
    return true;
  }, [
    hasVariants,
    productData,
    selectedVariant,
    selectedModifiers,
    flag,
    hasSelectionChanged,
    CartProductData,
    getAllModifierGroups,
    isValidCartItem,
    shouldShowVariantOptions,
  ]);

  const hasReviews = useMemo(() => {
    return hasReviewData(productData?.data || null);
  }, [productData]);

  const hasFaq = true; // FAQ is always shown

  // Determine border classes for each section
  const variantBorderClass = useMemo(() => {
    if (hasVariants && (hasReviews || hasFaq)) {
      return "md:border-b md:border-[var(--rating-border-primary)]";
    }
    return "";
  }, [hasVariants, hasReviews, hasFaq]);

  const reviewsBorderClass = useMemo(() => {
    if (hasReviews && hasFaq) {
      return "border-b border-[var(--rating-border-primary)]";
    }
    return "";
  }, [hasReviews, hasFaq]);

  // Extract unique attribute names from all variants
  const uniqueAttributeNames = useMemo(() => {
    const allNames =
      productData?.data?.variants
        ?.flatMap((variant) => variant.attributes || [])
        .map((attr) => attr?.name)
        .filter(Boolean) || [];

    return [...new Set(allNames)];
  }, [productData?.data?.variants]);

  const taxesWithCustomizationToggle = (
    <span className="extra-small-font text-[var(--secondary-text)] inline-flex flex-wrap items-center gap-x-1">
      +{lang.taxes}
      {allModifiers && (
        <>
          <span className="mx-0.5">•</span>
          <span
            onClick={() => setShowAllModifiers((prev) => !prev)}
            className="extra-small-font cursor-pointer text-[var(--accent-color)]"
          >
            {showAllModifiers
              ? lang.hideCustomizedItem
              : lang.showCustomizedItem}
          </span>
        </>
      )}
    </span>
  );

  const isValidCartItemState = isValidCartItem();
  const shouldShowSimpleQtyAndGoToCart =
    (!hasVariants || hasOnlyOneVariantNoModifiers) &&
    isValidCartItemState &&
    !flag &&
    !hasSelectionChanged &&
    !isChooseFreshCustomization;
  const shouldShowVariantQtyAndGoToCart =
    hasVariants &&
    !hasOnlyOneVariantNoModifiers &&
    isValidCartItemState &&
    !flag &&
    !urlParams.redirectFromCartToChose &&
    !showAddToCartInsteadOfQuantity &&
    !isChooseFreshCustomization &&
    (!urlParams.redirectFromCartToEdit || !hasSelectionChanged);
  const shouldShowAddToCartCta =
    flag ||
    !isValidCartItemState ||
    hasSelectionChanged ||
    isChooseFreshCustomization ||
    showAddToCartInsteadOfQuantity;

  const bestOfferToShow = useMemo((): DiscountOffer | undefined => {
    // Get first variant offer (prioritize first variant as requested)
    let offerFromVariant: DiscountOffer | undefined;
    const firstVariant = productData?.data?.variants?.[0];
    if (firstVariant) {
      const variant = firstVariant as unknown as {
        bestOfferRemote?: DiscountOffer;
        bestOfferInStore?: DiscountOffer;
        bestOffer?: DiscountOffer;
      };

      offerFromVariant = pickBestOfferByFlow(
        variant as unknown as {
          bestOfferRemote?: DiscountOffer;
          bestOfferInStore?: DiscountOffer;
        },
        isQrFlow,
      );

      // Check orderContext validation for first variant
      if (offerFromVariant) {
        const orderContext = (
          offerFromVariant?.orderContext ?? ""
        ).toUpperCase();

        if (!orderContext) {
          offerFromVariant = undefined;
        } else if (isQrFlow && orderContext !== "IN_STORE") {
          offerFromVariant = undefined;
        } else if (!isQrFlow && orderContext !== "REMOTE") {
          offerFromVariant = undefined;
        }
      }
    }

    let offerFromProduct: DiscountOffer | undefined;
    offerFromProduct = pickBestOfferByFlow(
      productData?.data as unknown as {
        bestOfferRemote?: DiscountOffer;
        bestOfferInStore?: DiscountOffer;
      } | null,
      isQrFlow,
    );

    // Check orderContext validation for product offer
    if (offerFromProduct) {
      const orderContext = (offerFromProduct?.orderContext ?? "").toUpperCase();

      if (!orderContext) {
        offerFromProduct = undefined;
      } else if (isQrFlow && orderContext !== "IN_STORE") {
        offerFromProduct = undefined;
      } else if (!isQrFlow && orderContext !== "REMOTE") {
        offerFromProduct = undefined;
      }
    }

    // Prioritize first variant offer, then fall back to product offer
    const offer = offerFromVariant ?? offerFromProduct;
    return offer;
  }, [isQrFlow, productData?.data]);

  return (
    <>
      <div
        ref={productOptionsRef}
        className={`content flex-1 h-full overflow-y-auto md:py-5  text-[var(--primary-text)] ${urlParams.isReviewTab ? "h-[100vh] max-h-[100vh]" : "md:h-[calc(100vh-82px)] md:max-h-[calc(100vh-82px)]"} ${isComboProductContext ? "combo-scrollbar" : ""}`}
      >
        {urlParams.isReviewTab && (
          <div className="w-full p-4 z-50 top-0 left-0 fixed flex bg-[var(--primary-background)] justify-between items-center  md:hidden">
            <h2 className="heading-4 font-700 text-[var(--primary-text)]">
              {lang.ratingAndReviews}
            </h2>
            <CrossIcon
              onClick={() => {
                router.back();
              }}
              pathFillColor="var(--primary-text)"
            />
          </div>
        )}

        {!urlParams.isReviewTab && (
          <>
            {bestOfferToShow && (
              <div className="px-4 md:p-3 md:pb-7 lg:px-10 md:mt-5 hidden md:block border-b border-[var(--rating-border-primary)]">
                {(() => {
                  const theme = getOfferTheme(bestOfferToShow);
                  return (
                    <OfferCard
                      offerData={bestOfferToShow}
                      containerClassName="py-2"
                      bgColor={theme.bg}
                      textColor={theme.text}
                      titleClassName={"!text-inherit"}
                      descriptionClassName="!text-inherit"
                      title={(() => {
                        const baseTitle = bestOfferToShow?.offerName?.en;
                        const suffix = bestOfferToShow
                          ? formatOfferBannerSuffixText(bestOfferToShow, lang)
                          : null;
                        if (!baseTitle) return baseTitle;
                        return suffix ? `${baseTitle} : ${suffix}` : baseTitle;
                      })()}
                      description={bestOfferToShow?.offerDescription?.en}
                      type={0}
                    />
                  );
                })()}
              </div>
            )}
            {hasVariants ? (
              <div
                className={`w-full py-8 p-4 md:p-3 lg:px-10 hidden md:block ${variantBorderClass}`}
              >
                <h2 className="heading-2 font-600 mt-5 md:mt-0">
                  {isComboProductContext
                    ? "This item is included in your combo"
                    : customiseTitle}
                </h2>
                <div className="w-full flex flex-col gap-6 mt-7 mb-16 md:mb-5">
                  {shouldShowVariantOptions && (
                    <div className="w-full flex flex-col gap-3">
                      <div>
                        <h3 className="heading-3 font-600 capitalize">
                          {uniqueAttributeNames[0] || "Size"}* (1/1)
                        </h3>
                        <p className="small-font text-[var(--secondary-text)]">
                          {lang.required}
                        </p>
                      </div>
                      <div className="flex flex-wrap flex-col md:flex-row gap-[10px] md:gap-4 ">
                        {productData?.data?.variants?.map((option, idx) => (
                          <CartOptionCard
                            containerClassName="w-full md:max-w-[225px] lg:max-w-[250px]"
                            onClick={() => {
                              // If user clicked "I'll choose", ensure flag is set to show Add to Cart button
                              setFlag(
                                !!urlParams.isPDP ||
                                  showAddToCartInsteadOfQuantity,
                              );
                              onSizeSelect(option);
                            }}
                            key={idx}
                            isSelected={selectedVariant?._id === option?._id}
                            showIcon={selectedVariant?._id === option?._id}
                            heading={getHeadingLabel(option)}
                            price={option?.basePrice}
                            discountedPrice={option?.discountedPrice}
                            bestOffer={option?.bestOffer || undefined}
                            showComboDefaultPrice={isComboProductContext}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {getAllModifierGroups().map((menu, idx) => (
                    <div key={idx} className="flex flex-col gap-3">
                      <div>
                        {renderModifierGroupHeader(
                          menu,
                          "heading-3 font-700",
                          "small-font text-[var(--secondary-text)]",
                          false,
                        )}
                      </div>
                      <div
                        className={`grid grid-col-1 md:grid-cols-2 xl:grid-cols-3 gap-[10px] md:gap-4`}
                      >
                        {menu.modifiers.map((option, idx) => {
                          // Handle groups with same ID by using position-based unique identifier
                          const allModifierGroups = getAllModifierGroups();
                          const currentGroupIndex = findGroupIndex(
                            menu,
                            allModifierGroups,
                          );

                          const isSelected = !!selectedModifiers
                            .find((item) => {
                              const itemGroupIndex = findGroupIndex(
                                item.modifierGroup,
                                allModifierGroups,
                              );
                              return itemGroupIndex === currentGroupIndex;
                            })
                            ?.modifiers.find(
                              (modifier) =>
                                modifier.modifierId === option?.modifierId,
                            );

                          return (
                            <CartOptionCard
                              onClick={() => {
                                setFlag(!!urlParams.isPDP);
                                onModifierSelectHandler(menu, option);
                              }}
                              isSelected={isSelected}
                              showIcon={isSelected}
                              key={idx}
                              heading={option?.name?.en}
                              details={formatCurrency({
                                amount: option?.price,
                              })}
                            />
                          );
                        })}
                      </div>
                      {getValidationErrorForGroup(menu) && (
                        <p className="text-red-500 small-font">
                          {getValidationErrorForGroup(menu)?.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null
            //   // Only show NoDataPlaceholder if there are no variants/modifiers AND no review data
            //   !hasReviewData(productData?.data || null) && (
            //     <div className="px-3 pb-6 md:px-0 md:px-4 md:pt-4 md:pb-1 pt-0  md:p-3 lg:px-10 md:mt-4 md:mb-10 ">
            //       <NoDataPlaceholder
            //       imageSrc={NO_VARIANT_PLACEHOLDER}
            //       imageWidth={160}
            //       imageHeight={160}
            //       title="Be the First to Review"
            //       subtitle="Share your experience with this product"
            //       buttonText="Write a Review"
            //       buttonAriaLabel="Write a Review"
            //       onButtonClick={() => {}}
            //        />
            //     </div>
            //   )
            // )}
            }
          </>
        )}

        {/* Special Request Section */}
        {!isComboProductContext && (
          <SpecialRequestSection
            specialInstructions={specialInstructions}
            setSpecialInstructions={setSpecialInstructions}
            lang={lang}
            containerClassName="mt-1 md:mt-0 md:px-4 px-4 mb-7 md:mb-0 md:py-6 lg:px-10 pt-1 special-request-border md:border-b md:border-[var(--rating-border-primary)]"
            titleClassName="heading-5 md-heading-2"
          />
        )}

        {/* --------------Reviews Section -------------- */}
        <div id="reviews-section" ref={reviewsSectionRef}>
          <ProductReviews
            urlParams={urlParams}
            productData={productData?.data || null}
            className={reviewsBorderClass}
          />
        </div>

        {/* --------------FAQ Section -------------- */}
        {productData?.data?.faq && productData.data.faq.length > 0 && (
          <FAQ
            className={hasReviews ? "pt-6" : "pt-1"}
            data={productData.data.faq}
          />
        )}

        {/* {!!allReviews?.length && <div ref={reviewsSectionRef} id="reviews-section" className={`p-4 pt-0  md:p-3 lg:px-10 md:mt-6 reviews-section ${urlParams.isReviewTab ? 'mt-14' : ''}`}>
          <h2 className={`description-font md:heading-2 font-600 ${urlParams.isReviewTab ? 'hidden md:block' : ''}`}>Rating and Reviews</h2>
          <div className="w-full mb-14 md:mb-0 mt-4 md:mt-8">
            <ReviewTab productData={productData} />
            {allReviews && allReviews.length > 0 && (
              <p onClick={onViewMoreHandler} className="small-font cursor-pointer text-[var(--accent-color)] mt-3 font-600">
                View More
              </p>
            )}
          </div>
        </div>} */}

        {!urlParams.isReviewTab && (
          <>
            <div className="w-full left-0  justify-end fixed bottom-0 bg-transparent hidden md:flex">
              <div className="flex-col w-full md:w-[60%] xl:w-[70%] bg-[var(--primary-tab-background)] justify-between items-center shadow-[0_-2px_4px_-2px_rgba(0,0,0,0.1)] py-2 px-3 lg:px-8 xl:px-10 right-0">
                {isComboStepFlow ? (
                  <div className="flex justify-between items-center w-full">
                    {/* Show Back button for combo steps that are not the first step */}
                    {currentStepIndex !== undefined &&
                    currentStepIndex > 0 &&
                    goToBackStep ? (
                      <button
                        className="h-14 w-36 rounded-lg border border-[var(--primary-text)] font-semibold cursor-pointer transition-all duration-200 hover:shadow-xl bg-[var(--primary-background)] heading-4"
                        onClick={goToBackStep}
                      >
                        Back
                      </button>
                    ) : (
                      <div></div>
                    )}
                    <CustomButton
                      className="font-700 rounded-lg !w-36 h-14 heading-4 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
                      onClick={() => {
                        // Validate mandatory selections before proceeding
                        const isValid = validateSelection();
                        if (isValid && goToNextStep) {
                          persistComboSelectionForStep();
                          goToNextStep();
                        }
                      }}
                    >
                      {lang.add}
                    </CustomButton>
                  </div>
                ) : (
                  <>
                    {showAllModifiers && (
                      <p className="small-font md:description-font text-[var(--primary-text)] pb-2 border-b border-[var(--rating-border-primary)] mb-2">
                        {allModifiers}
                      </p>
                    )}
                    <div className="flex justify-between items-center w-full">
                      <div className="flex flex-col justify-center">
                        {/* Always show price on left side */}
                        <div className="md-heading-4 text-[var(--primary-text)] dw">
                          {totalPrice}
                        </div>
                        {/* Always show taxes not included */}
                        <span className="small-font text-[var(--secondary-text)]">
                          {lang.taxesNotIncluded}
                          {/* Show customization toggle for variant/modifier products */}
                          {(flag ||
                            !isValidCartItem() ||
                            hasSelectionChanged) &&
                            allModifiers && (
                              <>
                                <span className="mx-1">•</span>
                                <span
                                  onClick={() =>
                                    setShowAllModifiers((prev) => !prev)
                                  }
                                  className="cursor-pointer text-[var(--accent-color)]"
                                >
                                  {showAllModifiers
                                    ? lang.hideCustomizedItem
                                    : lang.showCustomizedItem}
                                </span>
                              </>
                            )}
                        </span>
                      </div>
                      {/* For simple products in cart (not in edit mode), show quantity selector on right side */}
                      {shouldShowSimpleQtyAndGoToCart ? (
                        <div className="flex items-center justify-center gap-3">
                          <ProductQuantitySelector
                            quantity={getTotalProductQuantity}
                            loading={pdpQuantityLoading}
                            handleAddQuantity={
                              isQrFlow && syntheticCartItemForQr
                                ? () =>
                                    handleTicketQuantity(
                                      "ADD_QUANTITY",
                                      syntheticCartItemForQr.id!,
                                    )
                                : handleQuantity
                            }
                            itemId={pdpQuantityItemId}
                            error={pdpQuantityError}
                            item={pdpQuantityItem}
                            isPDP={true}
                            buttonSizeClassName="w-8 h-8 md:w-9 md:h-9"
                            textSizeClassName="md-heading-4 text-[var(--primary-text)] font-700"
                            increaseButtonClassName="bg-[var(--button-primary-background)]"
                            buttonTextClassName="heading-3"
                          />
                          <Link href={getCartUrl()} prefetch={true}>
                            <CustomButton
                              className={`flex justify-center items-center !min-w-[65%] xl:!min-w-[200px]`}
                            >
                              <p className="heading-4 font-700 text-center">
                                {lang.goToCart}
                              </p>
                            </CustomButton>
                          </Link>
                        </div>
                      ) : shouldShowVariantQtyAndGoToCart ? (
                        <div className="flex items-center justify-center gap-3">
                          <ProductQuantitySelector
                            quantity={getTotalProductQuantity}
                            loading={pdpQuantityLoading}
                            handleAddQuantity={handleQuantityIncreaseWithDialog}
                            handleDecreaseQuantity={
                              handleQuantityDecreaseWithDialog
                            }
                            itemId={pdpQuantityItemId}
                            error={pdpQuantityError}
                            item={pdpQuantityItem}
                            isPDP={true}
                            mainContainerClassName="justify-center"
                            buttonSizeClassName="w-9 h-9"
                            textSizeClassName="heading-4 text-[var(--primary-text)] font-700"
                            noButtonBackground={true}
                            buttonClassName="text-[var(--primary-text)]"
                            increaseButtonClassName="bg-[var(--button-primary-background)] text-[var(--primary-text-light)]"
                            buttonTextClassName="heading-3"
                            decreaseButtonTextClassName="bg-[var(--tertiary-background)]"
                          />
                          <Link href={getCartUrl()} prefetch={true}>
                            <CustomButton
                              className={`flex justify-center items-center !min-w-[65%] xl:!min-w-[200px]`}
                            >
                              <p className="heading-4 font-700 text-center">
                                {lang.goToCart}
                              </p>
                            </CustomButton>
                          </Link>
                        </div>
                      ) : shouldShowAddToCartCta ? (
                        <CustomButton
                          onClick={
                            hasSelectionChanged &&
                            urlParams.redirectFromCartToEdit &&
                            !isChooseFreshCustomization &&
                            !flag &&
                            isValidCartItem()
                              ? patchCartHandeler
                              : addToCartHandler
                          }
                          disabled={
                            !canAddToCart ||
                            loading ||
                            (showAddToCartInsteadOfQuantity && !canAddToCart) ||
                            (isChooseFreshCustomization &&
                              !canAddToCart)
                          }
                          className={`flex ${loading ? "justify-center" : "justify-between"} items-center min-w-[40%] xl:max-w-[290px] xl:min-w-[250px]`}
                        >
                          {loading ? (
                            <Loader color="black" size={24} />
                          ) : (
                            <>
                              <p
                                className={`heading-4 font-700 text-center ${!isValidCartItem() || flag || hasSelectionChanged || showAddToCartInsteadOfQuantity || isChooseFreshCustomization ? "w-full" : ""}`}
                              >
                                {hasSelectionChanged &&
                                urlParams.redirectFromCartToEdit &&
                                !isChooseFreshCustomization &&
                                !flag &&
                                isValidCartItem()
                                  ? lang.saveChanges
                                  : lang.addToCart}
                              </p>
                            </>
                          )}
                        </CustomButton>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Hide this section when second section shows price+quantity selector */}
            {!(
              isValidCartItem() &&
              !flag &&
              (((!hasVariants || hasOnlyOneVariantNoModifiers) &&
                !hasSelectionChanged) ||
                (hasVariants &&
                  !hasOnlyOneVariantNoModifiers &&
                  !urlParams.redirectFromCartToEdit &&
                  !urlParams.redirectFromCartToChose &&
                  !showAddToCartInsteadOfQuantity &&
                  !isChooseFreshCustomization)) &&
              (!isOpenVarientModal || showPriceInMobile)
            ) && (
              <div
                // style={{ zIndex: 1000 }}
                className="w-full left-0 flex z-40 justify-end fixed bottom-0 bg-transparent md:hidden"
              >
                <div className=" w-full bg-[var(--primary-background)]  shadow-[0_-2px_4px_-2px_rgba(0,0,0,0.1)] py-3 px-3 lg:px-8 xl:px-10 right-0">
                  {isComboStepFlow ? (
                    <div className="flex justify-end w-full">
                      <CustomButton
                        className="font-700 py-3 px-8 rounded-lg !w-full"
                        onClick={() => {
                          // Validate mandatory selections before proceeding
                          const isValid = validateSelection();
                          if (isValid && goToNextStep) {
                            persistComboSelectionForStep();
                            goToNextStep();
                          }
                        }}
                      >
                        {lang.next}
                      </CustomButton>
                    </div>
                  ) : (
                    <>
                      {isOpenVarientModal ? (
                        <>
                          {showAllModifiers && (
                            <p className="small-font md:description-font text-[var(--primary-text)] pb-4 border-b border-[var(--rating-border-primary)] mb-4">
                              {allModifiers}
                            </p>
                          )}
                          <div className="flex justify-between items-center w-full ">
                            <div className="flex flex-col justify-center">
                              <div className="md:heading-4 text-[var(--primary-text)] font-700">
                                {totalPrice}
                              </div>
                              {taxesWithCustomizationToggle}
                            </div>
                            <CustomButton
                              onClick={
                                urlParams.redirectFromCartToEdit &&
                                !isChooseFreshCustomization &&
                                !flag &&
                                isValidCartItem()
                                  ? patchCartHandeler
                                  : addToCartHandler
                              }
                              disabled={
                                !canAddToCart ||
                                loading ||
                                (isChooseFreshCustomization &&
                                  !canAddToCart)
                              }
                              className={`flex ${loading ? "justify-center" : "justify-between"} items-center min-w-[50%!important] w-[65%!important]`}
                            >
                              {loading ? (
                                <Loader color="black" size={24} />
                              ) : (
                                <>
                                  <p className="heading-4 font-700 text-center w-full">
                                    {lang.addToCart}
                                  </p>
                                </>
                              )}
                            </CustomButton>
                          </div>
                        </>
                      ) : !isValidCartItem() || flag || hasSelectionChanged ? (
                        <CustomButton
                          onClick={onMobileAddToOrderHandler}
                          className={`flex ${loading ? "justify-center" : "justify-between"} items-center w-full min-w-full`}
                        >
                          {loading ? (
                            <Loader color="black" size={24} />
                          ) : (
                            <>
                              <p className="heading-4 font-700 text-center w-full">
                                {lang.addToCart}
                              </p>
                            </>
                          )}
                        </CustomButton>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {!urlParams.isReviewTab && (
          <>
            {isOpenVarientModal && !showPriceInMobile ? (
              <div
                style={{ zIndex: 1000 }}
                className="w-full left-0 flex justify-end fixed bottom-0 bg-transparent md:hidden"
              >
                <div className=" w-full bg-[var(--primary-background)]  shadow-[0_-2px_4px_-2px_rgba(0,0,0,0.1)] py-3 px-3 lg:px-8 xl:px-10 right-0">
                  {isComboStepFlow ? (
                    <div className="flex justify-end w-full">
                      <CustomButton
                        className="font-700 py-3 px-8 rounded-lg !w-full"
                        onClick={() => {
                          // Validate mandatory selections before proceeding
                          const isValid = validateSelection();
                          if (isValid && goToNextStep) {
                            persistComboSelectionForStep();
                            goToNextStep();
                          }
                        }}
                      >
                        {lang.next}
                      </CustomButton>
                    </div>
                  ) : (
                    <>
                      {showAllModifiers && (
                        <p className="small-font md:description-font text-[var(--primary-text)] pb-4 border-b border-[var(--rating-border-primary)] mb-4">
                          {allModifiers}
                        </p>
                      )}
                      <div className="flex justify-between items-center w-full ">
                        <div className="flex flex-col justify-center">
                          {flag ||
                          !isValidCartItem() ||
                          hasSelectionChanged ||
                          (urlParams.redirectFromCartToEdit &&
                            isValidCartItem() &&
                            !hasSelectionChanged) ? (
                            <>
                              <div className="heading-4 text-[var(--primary-text)]">
                                {totalPrice}
                              </div>
                              {taxesWithCustomizationToggle}
                            </>
                          ) : // For variant/modifier products, don't show quantity selector separately when not in edit mode
                          // Quantity will be shown in the button instead
                          !hasVariants ||
                            hasOnlyOneVariantNoModifiers ||
                            urlParams.redirectFromCartToChose ? (
                            <ProductQuantitySelector
                              quantity={getTotalProductQuantity}
                              loading={pdpQuantityLoading}
                              handleAddQuantity={
                                isQrFlow && syntheticCartItemForQr
                                  ? () =>
                                      handleTicketQuantity(
                                        "ADD_QUANTITY",
                                        syntheticCartItemForQr.id!,
                                      )
                                  : handleQuantity
                              }
                              itemId={pdpQuantityItemId}
                              error={pdpQuantityError}
                              item={pdpQuantityItem}
                              isPDP={true}
                              buttonTextClassName="heading-3"
                              textSizeClassName="heading-4 text-[var(--primary-text-light)] font-700"
                            />
                          ) : (
                            // For variant products in cart (normal view), show price
                            <div className="heading-4 text-[var(--primary-text)] font-600">
                              {totalPrice}
                            </div>
                          )}
                        </div>

                        {/* For variant/modifier products in cart (not in edit mode), show quantity selector or Add to Cart based on user choice */}
                        {hasVariants &&
                        !hasOnlyOneVariantNoModifiers &&
                        isValidCartItem() &&
                        !flag &&
                        !urlParams.redirectFromCartToChose &&
                        !showAddToCartInsteadOfQuantity &&
                        !isChooseFreshCustomization &&
                        (!urlParams.redirectFromCartToEdit ||
                          !hasSelectionChanged) ? (
                          <div className="flex items-center justify-center rounded-lg p-2">
                            <ProductQuantitySelector
                              quantity={getTotalProductQuantity}
                              loading={pdpQuantityLoading}
                              handleAddQuantity={
                                handleQuantityIncreaseWithDialog
                              }
                              handleDecreaseQuantity={
                                handleQuantityDecreaseWithDialog
                              }
                              itemId={pdpQuantityItemId}
                              error={pdpQuantityError}
                              item={pdpQuantityItem}
                              isPDP={true}
                              mainContainerClassName="justify-center"
                              buttonSizeClassName="w-9 h-9"
                              textSizeClassName="heading-4 text-[var(--primary-text)] font-700 leading-[1]"
                              noButtonBackground={true}
                              // borderColor="var(--black)"
                              increaseButtonClassName="bg-[var(--button-primary-background)]"
                              buttonTextClassName="heading-3"
                              decreaseButtonTextClassName="bg-[var(--tertiary-background)] text-[var(--primary-text)]"
                            />
                          </div>
                        ) : !isValidCartItem() ||
                          flag ||
                          (hasSelectionChanged &&
                            (!urlParams.redirectFromCartToEdit ||
                              !isValidCartItem())) ||
                          (urlParams.redirectFromCartToEdit &&
                            hasSelectionChanged) ||
                          isChooseFreshCustomization ||
                          showAddToCartInsteadOfQuantity ? (
                          <CustomButton
                            onClick={
                              hasSelectionChanged &&
                              urlParams.redirectFromCartToEdit &&
                              !isChooseFreshCustomization &&
                              !flag &&
                              isValidCartItem()
                                ? patchCartHandeler
                                : addToCartHandler
                            }
                            disabled={
                              !canAddToCart ||
                              loading ||
                              (showAddToCartInsteadOfQuantity &&
                                !canAddToCart) ||
                              (isChooseFreshCustomization &&
                                !canAddToCart)
                            }
                            className={`flex ${loading ? "justify-center" : "justify-between"} items-center !min-w-[130px] w-auto`}
                          >
                            {loading ? (
                              <Loader color="black" size={24} />
                            ) : (
                              <>
                                <p
                                  className={`heading-4 font-700 text-center ${!isValidCartItem() || flag || hasSelectionChanged || showAddToCartInsteadOfQuantity || isChooseFreshCustomization ? "w-full" : ""}`}
                                >
                                  {hasSelectionChanged &&
                                  urlParams.redirectFromCartToEdit &&
                                  !isChooseFreshCustomization &&
                                  !flag &&
                                  isValidCartItem()
                                    ? lang.saveChanges
                                    : lang.addToCart}
                                </p>
                                {isValidCartItem() &&
                                  !flag &&
                                  !hasSelectionChanged &&
                                  !showAddToCartInsteadOfQuantity &&
                                  !isChooseFreshCustomization && (
                                    <div className="md-heading-4 text-[var(--primary-text)] font-700">
                                      {totalPrice}
                                    </div>
                                  )}
                              </>
                            )}
                          </CustomButton>
                        ) : (
                          <Link href={getCartUrl()} prefetch={true}>
                            <CustomButton
                              className={`flex justify-between items-center min-w-[50%!important] w-[65%!important]`}
                            >
                              {loading ? (
                                <Loader color="black" size={24} />
                              ) : (
                                <>
                                  <p
                                    className={`heading-4 font-700 text-center`}
                                  >
                                    {lang.goToCart}
                                  </p>
                                  <div className="md-heading-4 text-[var(--primary-text)] font-700">
                                    {totalPrice}
                                  </div>
                                </>
                              )}
                            </CustomButton>
                          </Link>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div
                // style={{ zIndex: 1000 }}
                className="w-full left-0 flex z-40 justify-end fixed bottom-0 bg-transparent md:hidden"
              >
                <div className="w-full bg-[var(--primary-background)] flex justify-between shadow-[0_-2px_4px_-2px_rgba(0,0,0,0.1)] py-4 px-3 lg:px-8 xl:px-10 right-0">
                  {/* For products in cart, show price on left and quantity on right */}
                  {isValidCartItem() &&
                  !flag &&
                  ((!hasVariants && !hasSelectionChanged) ||
                    (hasVariants &&
                      !urlParams.redirectFromCartToEdit &&
                      !urlParams.redirectFromCartToChose &&
                      !showAddToCartInsteadOfQuantity &&
                      !isChooseFreshCustomization)) ? (
                    <>
                      <div className="flex flex-col">
                        <div className="md-heading-4 text-[var(--primary-text)]">
                          {totalPrice}
                        </div>
                        <span className="extra-small-font text-[var(--secondary-text)]">
                          +{lang.taxes}
                        </span>
                      </div>
                      <div className="flex items-center justify-center">
                        <ProductQuantitySelector
                          quantity={getTotalProductQuantity}
                          loading={pdpQuantityLoading}
                          handleAddQuantity={
                            hasVariants
                              ? handleQuantityIncreaseWithDialog
                              : isQrFlow && syntheticCartItemForQr
                                ? () =>
                                    handleTicketQuantity(
                                      "ADD_QUANTITY",
                                      syntheticCartItemForQr.id!,
                                    )
                                : handleQuantity
                          }
                          {...(hasVariants ||
                          (isQrFlow && syntheticCartItemForQr)
                            ? {
                                handleDecreaseQuantity:
                                  handleQuantityDecreaseWithDialog,
                              }
                            : {})}
                          itemId={pdpQuantityItemId}
                          error={pdpQuantityError}
                          item={pdpQuantityItem}
                          isPDP={true}
                          increaseButtonClassName="bg-[var(--button-primary-background)]"
                          buttonSizeClassName="w-9 h-9 md:w-9 md:h-9"
                          textSizeClassName="heading-4 text-[var(--primary-text)] font-700"
                          mainContainerClassName="justify-center"
                          buttonTextClassName="heading-3"
                          noButtonBackground={true}
                        />
                      </div>
                    </>
                  ) : !isValidCartItem() ||
                    hasSelectionChanged ||
                    urlParams.redirectFromCartToEdit ||
                    showAddToCartInsteadOfQuantity ||
                    isChooseFreshCustomization ? (
                    <CustomButton
                      onClick={onMobileAddToOrderHandler}
                      // disabled={(!canAddToCart || loading) || (showAddToCartInsteadOfQuantity && !canAddToCart)}
                      className="flex justify-center items-center !w-full"
                    >
                      {loading ? (
                        <Loader color="black" size={24} />
                      ) : (
                        <>
                          <p className="heading-4 font-700 text-center">
                            {isComboStepFlow
                              ? showPriceInMobile
                                ? lang.next
                                : lang.add
                              : lang.addToCart}
                          </p>
                          {/* {showPriceInMobile && <div className="md-heading-4  font-700 text-[var(--primary-text)] text-left">
                              {totalPrice}
                            </div>} */}
                        </>
                      )}
                    </CustomButton>
                  ) : null}
                </div>
              </div>
            )}
          </>
        )}

        {isOpenVarientModal && !showPriceInMobile && (
          <Modal
            titleClassName="heading-4 leading-[1] capitalize"
            title={customiseTitle}
            productTitle={productData?.data?.name}
            productPrice={isComboProductContext ? undefined : totalPrice}
            productClassName="text-[var(--secondary-text)] text-xs font-[var(--font-regular)!important] pb-4"
            containerClassName="md:hidden"
            isOpen={isOpenVarientModal}
            onClose={() => {
              setIsClosingModal(true);
              setTimeout(() => {
                setIsOpenVarientModal(false);
                setIsClosingModal(false);
                // If the item is still in cart and user cancelled without adding,
                // restore the quantity selector view by resetting these flags
                if (isValidCartItem() && !urlParams.redirectFromCartToEdit) {
                  setShowAddToCartInsteadOfQuantity(false);
                  setFlag(false);
                }
              }, 300);
            }}
            className={`shadow-[0_-2px_4px_-2px_rgba(0,0,0,0.1)] pt-8 fixed left-0 right-0 bottom-[60px] max-h-[80vh] h-fit rounded-t-[10px] transition-transform duration-300 ease-out ${isClosingModal ? "translate-y-full" : "translate-y-0"}`}
            closeIconClassName="right-5 top-8"
            showScrollbar={true}
          >
            <div
              className={`w-full flex flex-col gap-5 h-full overflow-y-auto pb-4 pr-2`}
            >
              {shouldShowVariantOptions && (
                <div className="w-full flex flex-col">
                  <h2 className="description-font font-700 capitalize">
                    {uniqueAttributeNames[0] || "Size"}*
                  </h2>
                  <p className="extra-small-font text-[var(--secondary-text)]">
                    {lang.required}
                  </p>
                  <div className="flex flex-wrap flex-col md:flex-row gap-[10px] md:gap-4 mt-3">
                    {productData?.data?.variants?.map((option, idx) => (
                      <CartOptionCard
                        containerClassName="w-full md:max-w-[200px] lg:max-w-[220px]"
                        onClick={() => {
                          // If user clicked "I'll choose", ensure flag is set to show Add to Cart button
                          // Allow clicking even if variant is already selected - user should be able to change variant
                          if (
                            selectedVariant?._id !== option?._id ||
                            showAddToCartInsteadOfQuantity
                          ) {
                            setFlag(
                              !!urlParams.isPDP ||
                                showAddToCartInsteadOfQuantity,
                            );
                            onSizeSelect(option);
                          }
                        }}
                        key={idx}
                        isSelected={selectedVariant?._id === option?._id}
                        showIcon={selectedVariant?._id === option?._id}
                        heading={getHeadingLabel(option)}
                        price={option?.basePrice}
                        discountedPrice={option?.discountedPrice}
                        bestOffer={option?.bestOffer || undefined}
                        showComboDefaultPrice={isComboProductContext}
                        // details={formatCurrency({ amount: option?.basePrice })}
                      />
                    ))}
                  </div>
                </div>
              )}

              {getAllModifierGroups().map((menu, idx) => (
                <div key={idx} className="flex flex-col  md:gap-5">
                  {renderModifierGroupHeader(
                    menu,
                    "description-font font-700",
                    "extra-small-font text-[var(--secondary-text)]",
                    true,
                  )}

                  <div
                    className={`grid grid-col-1 mt-3 md:grid-cols-2 xl:grid-cols-3 gap-[10px] md:gap-4`}
                  >
                    {menu?.modifiers?.map((option, idx) => {
                      // Handle groups with same ID by using position-based unique identifier
                      const allModifierGroups = getAllModifierGroups();
                      const currentGroupIndex = findGroupIndex(
                        menu,
                        allModifierGroups,
                      );

                      const isSelected = !!selectedModifiers
                        .find((item) => {
                          const itemGroupIndex = findGroupIndex(
                            item.modifierGroup,
                            allModifierGroups,
                          );
                          return itemGroupIndex === currentGroupIndex;
                        })
                        ?.modifiers.find(
                          (modifier) =>
                            modifier.modifierId === option?.modifierId,
                        );

                      return (
                        <CartOptionCard
                          onClick={() => {
                            setFlag(!!urlParams.isPDP);
                            onModifierSelectHandler(menu, option);
                          }}
                          isSelected={isSelected}
                          showIcon={isSelected}
                          key={idx}
                          heading={option?.name?.en}
                          details={formatCurrency({ amount: option?.price })}
                        />
                      );
                    })}
                  </div>
                  {getValidationErrorForGroup(menu) && (
                    <p className="text-red-500 small-font">
                      {getValidationErrorForGroup(menu)?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Modal>
        )}
        {isViewMore && (
          <Modal
            className={`max-h-screen md:max-h-[90vh] md:max-w-[560px]  overflow-y-auto p-0 rounded-none ${theme === "light" ? "bg-white" : ""}`}
            isOpen={isViewMore}
            titleClassName="py-3 md:hidden text-[var(--primary-text)] "
            headerClassName="px-4 bg-[var(--primary-background)] md:bg-[var(--secondary-background)] mb-0"
            closeIconClassName="right-5 top-5"
            title="Review & Ratings"
            onClose={() => setIsViewMore(false)}
          >
            <div className="w-full mb-20 mt-5 px-4 md:mt-8">
              <ReviewTab productData={productData} />
            </div>
          </Modal>
        )}
      </div>
      <style>
        {`
        .small-font{
            font-size: var(--small-font);
        }
        .extra-small-font {
            font-size: var(--extraSmall-font);
        }
        .description-font {
            font-size: var(--description-font);
        }
        .heading-2 {
            font-size: var(--heading-h2);
        }
        .heading-3 {
            font-size: var(--heading-h3);
        }
        .heading-4 {
            font-size: var(--heading-h4);
        }
        .font-600 {
            font-weight: var(--font-semi-bold);
        }
        .font-700 {
            font-weight: var(--font-bold);
        }
        
        /* Hide scrollbar for combo flow */
        .combo-scrollbar {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* Internet Explorer 10+ */
        }
        .combo-scrollbar::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
        }
        .special-request-border {
          position: relative;
        }
        .special-request-border::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 1rem;
          right: 1rem;
          border-bottom: 1px solid var(--rating-border-primary);
        }
        @media (max-width: 768px) {
          .multiple-customizations-dialog {
            padding: 20px 16px !important;
          }
        }
        @media (min-width: 768px) {
          .md-heading-4 {
            font-size: var(--heading-h4);
          }
          .special-request-border::after {
            display: none;
          }
        }


      `}
      </style>
    </>
  );
};

export default ProductOptions;
