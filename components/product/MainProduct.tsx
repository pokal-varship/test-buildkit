"use client";

// import Link from "next/link";
import CloseCircleIcon from "@components/icons/CloseCircleIcon";
import ProductOptions from "@components/productDetailPage/ProductOptions";
import SideBar from "@components/productDetailPage/SideBar";
import ProductDetailsSchema from "@components/schema/ProductDetailsSchema";
import { ProductResponse, Variant } from "@components/type/pdp.type";
import Shimmer from "@components/ui/Shimmer";
import { useStoreCart } from "@hooks/storepage/useStore";
import { RootState } from "@redux/store";
import {
  selectIsQrFlowActive,
  selectSessionId,
  selectQrFlowTableNumber,
} from "@redux/slices/qrFlowSlice";
import { DINE_IN_ANALYTICS_CONTEXT } from "@lib/analytics/dineInAnalytics";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Store } from "@components/type/store.types";
import { CartItem } from "@services/storePage";
import type { SessionTicketItem } from "@services/sessionService";
import { sessionTicketItemToCartItem } from "../../utils/sessionTicketItemToCartItem";
import { useProductCache } from "@hooks/useProductCache";
import { PLPParams } from "@components/order/order.type";
import ComboFlow from "@components/products/ComboFlow";
import { getComboProductData } from "@services/combo";
import {
  mapComboApiToOptions,
  ComboApiResponse,
} from "@lib/mapComboApiToOptions";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@redux/store";
import {
  setSelectedCombo,
  setComboData,
  setOriginalApiResponse,
} from "@redux/slices/comboSlice";
import useProductUrl from "@hooks/useProductUrl";
import useAnalytics from "@hooks/useAnalytics";
import useIsMobile from "@hooks/useIsMobile";
import { getTenantConfig } from "@config/tenant.config";
import { useStoreDataBootstrap } from "@app/StoreDataProvider";
import { useSessionTicketItems } from "@hooks/useQrSessionDerivedState";
import { useAppSearchParams } from "@context/SearchParamsContext";
import { searchParamsFingerprint } from "@lib/commit-search-params";
import {
  productUrlParamsFromRecord,
  type ProductUrlParams,
} from "types/product-url-params";

interface ProductDetailPageProps {
  initialProductData?: ProductResponse | null;
  /** Parsed on the server from `searchParams` — avoids useSearchParams() during ISR. */
  initialUrlParams?: ProductUrlParams;
  hideComboFlow?: boolean;
  goToNextStep?: () => void;
  goToBackStep?: () => void;
  isCombo?: boolean;
  currentStepIndex?: number;
  comboPrefillEnabled?: boolean;
  storeSlug?: string;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  initialProductData,
  hideComboFlow = false,
  goToNextStep,
  goToBackStep,
  isCombo = false,
  currentStepIndex,
  comboPrefillEnabled = false,
  storeSlug,
  initialUrlParams,
}) => {
  const params = useParams() as PLPParams;
  const router = useRouter();
  const id = params?.productSlug || params?.id; // Support both routes: [productSlug] and [id]
  const appSearchParams = useAppSearchParams();
  const { getCachedProduct } = useProductCache();
  const { bootstrapStore } = useStoreDataBootstrap();

  const dispatch = useDispatch<AppDispatch>();

  const pathSegments = useMemo(
    () => ({
      menuSlug: Array.isArray(params?.menuSlug)
        ? params.menuSlug[0]
        : (params?.menuSlug as string | undefined),
      storeSlug: Array.isArray(params?.storeSlug)
        ? params.storeSlug[0]
        : (params?.storeSlug as string | undefined),
    }),
    [params?.menuSlug, params?.storeSlug],
  );

  const [urlParams, setUrlParams] = useState<ProductUrlParams>(
    () => initialUrlParams ?? productUrlParamsFromRecord({}, pathSegments),
  );

  const contextUrlParams = useMemo(
    () => productUrlParamsFromRecord(appSearchParams.params, pathSegments),
    [appSearchParams.params, pathSegments],
  );

  const contextFingerprint = useMemo(
    () => searchParamsFingerprint(appSearchParams.params),
    [appSearchParams.params],
  );

  useEffect(() => {
    if (contextFingerprint === "") return;
    setUrlParams((prev) => {
      const same =
        prev.menuId === contextUrlParams.menuId &&
        prev.cartItemId === contextUrlParams.cartItemId &&
        prev.categoryId === contextUrlParams.categoryId &&
        prev.storeId === contextUrlParams.storeId &&
        prev.rfcEdit === contextUrlParams.rfcEdit &&
        prev.redirectFromCartToChose ===
          contextUrlParams.redirectFromCartToChose &&
        prev.redirectFromCartToEdit ===
          contextUrlParams.redirectFromCartToEdit &&
        prev.redirectFromQuantityIncrease ===
          contextUrlParams.redirectFromQuantityIncrease &&
        prev.redirectFromPlpChoose === contextUrlParams.redirectFromPlpChoose &&
        prev.isPDP === contextUrlParams.isPDP &&
        prev.isReviewTab === contextUrlParams.isReviewTab;
      return same ? prev : contextUrlParams;
    });
  }, [contextFingerprint, contextUrlParams]);

  const { cartData, handleGetCart } = useStoreCart();
  const pdpProductFromRedux = useSelector(
    (state: RootState) => state.pdpProduct.pdpProduct,
  );
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const qrSessionId = useSelector(selectSessionId);
  const qrFlowTableNumber = useSelector(selectQrFlowTableNumber);
  const sessionTicketItems = useSessionTicketItems();
  const [productData, setProductData] = useState<ProductResponse | null>(
    initialProductData || pdpProductFromRedux || null,
  );
  const [CartProductData, setCartProductData] = useState<CartItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    productData?.data?.variants?.[0] || null,
  );
  const [showComboFlow, setShowComboFlow] = useState(false);
  const store = useSelector((state: RootState) => state.store);
  const [storeData, setStoreData] = useState<Store | null | undefined>();
  const routeStoreSlug =
    storeSlug ||
    urlParams.storeId ||
    (Array.isArray(params?.storeSlug)
      ? params.storeSlug[0]
      : (params?.storeSlug as string | undefined)) ||
    "";

  const cartItemsCount = isQrFlowActive
    ? sessionTicketItems?.reduce(
        (total, item) => total + (item.quantity || 0),
        0,
      ) || 0
    : cartData?.data?.items?.reduce(
        (total, item) => total + (item.quantity || 0),
        0,
      ) || 0;

  const reviewsSectionRef = useRef<HTMLDivElement>(null);
  const { trackProductDetailPageViewed } = useAnalytics();
  const isMobile = useIsMobile();
  const tenantConfig = getTenantConfig();

  const hasFetchedProduct = useRef(false);
  const hasFetchedCombo = useRef(false);
  const hasTrackedPDP = useRef(false);

  useEffect(() => {
    if (store.currentStore?.id) {
      setStoreData(store.currentStore);
      return;
    }

    if (!routeStoreSlug) {
      setStoreData(store.currentStore);
      return;
    }

    let cancelled = false;
    void bootstrapStore(routeStoreSlug).then((bootstrappedStore) => {
      if (!cancelled && bootstrappedStore) {
        setStoreData(bootstrappedStore);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [bootstrapStore, routeStoreSlug, store.currentStore]);

  const handleScrollToReviewsSection = () => {
    if (reviewsSectionRef.current) {
      reviewsSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (cartData === null && storeData?.id) {
      handleGetCart(storeData?.id as string);
      return;
    }

    if (!productData?.data) return;

    let foundCartItem: CartItem | null = null;

    // QR flow: get item from session ticket items
    if (isQrFlowActive && sessionTicketItems?.length > 0) {
      const sessionItem = urlParams.cartItemId
        ? sessionTicketItems.find(
            (t: SessionTicketItem) =>
              t.id === urlParams.cartItemId && t.itemId === productData.data.id,
          )
        : sessionTicketItems.find(
            (t: SessionTicketItem) => t.itemId === productData.data.id,
          );

      if (sessionItem) {
        foundCartItem = sessionTicketItemToCartItem(
          sessionItem,
          productData.data,
        );
      }
    }

    // Normal flow: get item from cart
    if (!foundCartItem && cartData?.data?.items) {
      if (urlParams.cartItemId) {
        foundCartItem =
          cartData.data.items.find(
            (item) => item.id === urlParams.cartItemId,
          ) || null;
      } else if (productData.data.id) {
        foundCartItem =
          cartData.data.items.find(
            (item) => item.productId === productData.data.id,
          ) || null;
      }
    }

    if (foundCartItem) {
      setCartProductData((prev) =>
        prev?.id === foundCartItem.id &&
        prev?.quantity === foundCartItem.quantity &&
        prev?.variantId === foundCartItem.variantId
          ? prev
          : foundCartItem,
      );
      // Only pre-select variant when explicitly editing (redirectFromCartToEdit)
      if (
        urlParams.redirectFromCartToEdit &&
        !urlParams.redirectFromQuantityIncrease &&
        !urlParams.redirectFromPlpChoose &&
        productData.data.variants &&
        productData.data.variants.length > 0 &&
        foundCartItem.variantId
      ) {
        const matchingVariant = productData.data.variants.find(
          (variant) => variant._id === foundCartItem?.variantId,
        );
        if (matchingVariant) {
          setSelectedVariant(matchingVariant);
        }
      } else if (
        productData.data.variants &&
        productData.data.variants.length > 0
      ) {
        setSelectedVariant(productData.data.variants[0]);
      }
    } else {
      setCartProductData(null);
      if (productData.data.variants && productData.data.variants.length > 0) {
        setSelectedVariant(productData.data.variants[0]);
      }
    }
  }, [
    cartData,
    productData?.data,
    storeData?.id,
    urlParams.cartItemId,
    urlParams.rfcEdit,
    isQrFlowActive,
    sessionTicketItems,
    handleGetCart,
    urlParams.redirectFromCartToEdit,
    urlParams.redirectFromQuantityIncrease,
    urlParams.redirectFromPlpChoose,
  ]);

  useEffect(() => {
    if (pdpProductFromRedux) {
      setProductData(pdpProductFromRedux);
      setIsLoading(false);
      return;
    }
    if (initialProductData) {
      setProductData(initialProductData);
      setIsLoading(false);
      return;
    }
    if (
      id &&
      params?.categorySlug &&
      params?.storeSlug &&
      !hasFetchedProduct.current
    ) {
      hasFetchedProduct.current = true;
      setIsLoading(true);
      getCachedProduct(
        params?.categorySlug as string,
        id as string,
        params?.storeSlug as string,
      )
        .then((data) => {
          setProductData(data);
          setIsLoading(false);
        })
        .catch(() => {
          // Error handled silently
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [
    id,
    params?.categorySlug,
    params?.storeSlug,
    getCachedProduct,
    pdpProductFromRedux,
    initialProductData,
  ]);

  // Fetch combo data for combo products
  useEffect(() => {
    if (
      productData?.data &&
      productData.data.type?.category === "COMBO" &&
      !hasFetchedCombo.current
    ) {
      const finalStoreSlug = storeSlug || storeData?.slug || params?.storeSlug;
      const finalProductSlug =
        productData.data.seo?.urlManagement?.customSlug || productData.data.id;

      if (
        !finalStoreSlug ||
        !finalProductSlug ||
        !productData.data.productCategoryId
      ) {
        return;
      }

      hasFetchedCombo.current = true;

      getComboProductData(
        productData.data.productCategoryId,
        finalProductSlug,
        finalStoreSlug,
      )
        .then((response) => {
          dispatch(setOriginalApiResponse(response.data as ComboApiResponse));
          const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "";
          const comboOptions = mapComboApiToOptions(
            response.data as ComboApiResponse,
            imageBaseUrl,
          );

          if (comboOptions.length > 0) {
            const option = comboOptions[0];
            dispatch(setSelectedCombo(option));

            const comboData = {
              comboId: option.id,
              comboName: option.title,
              comboPrice: option.discountedPrice,
              comboOriginalPrice: option.price,
              comboSteps: [
                {
                  name: option.primaryProduct.name,
                  productSlug:
                    (option.primaryProduct.customSlug as string) ||
                    option.primaryProduct.name
                      .toLowerCase()
                      .replace(/\s+/g, "-"),
                  categorySlug:
                    (option.primaryProduct.productCategorySlug as string) ||
                    "sandwich",
                  categoryName:
                    (option.primaryProduct.productCategoryName as string) ||
                    option.primaryProduct.name,
                  component: "mainProduct" as const,
                },
                ...(option.groupDetails || []).map((detail, index) => ({
                  name: detail.name,
                  productSlug:
                    ((detail as Record<string, unknown>)
                      .customSlug as string) ||
                    detail.name.toLowerCase().replace(/\s+/g, "-"),
                  categorySlug:
                    ((detail as Record<string, unknown>)
                      .productCategorySlug as string) ||
                    (index === 0 ? "beverages" : "deserts"),
                  categoryName:
                    ((detail as Record<string, unknown>)
                      .categoryName as string) || detail.name,
                  component: "productList" as const,
                })),
              ],
            };
            dispatch(setComboData(comboData));

            // Show combo flow for combo products
            setShowComboFlow(true);
          }
        })
        .catch(() => {
          // Error handled silently
          hasFetchedCombo.current = false;
        });
    }
  }, [
    productData?.data,
    dispatch,
    storeSlug,
    storeData?.slug,
    params?.storeSlug,
  ]);

  useEffect(() => {
    if (productData?.data?.variants && !urlParams.rfcEdit && !CartProductData) {
      setSelectedVariant(productData?.data?.variants?.[0] || null);
    }
  }, [productData, urlParams.rfcEdit, CartProductData]);

  // Track product detail page view when product data is loaded
  useEffect(() => {
    if (
      !isLoading &&
      productData?.data &&
      storeData &&
      !hasTrackedPDP.current
    ) {
      hasTrackedPDP.current = true;

      const basePrice = productData.data.basePrice || 0;
      const rating = productData.data.overallRatings?.average || 0;
      const reviewCount = productData.data.overallRatings?.totalReview || 0;
      const prepTimeMinutes =
        productData.data.preparationDetails?.preparationTime ||
        productData.data.preparationDetails?.cookingTime ||
        productData.data.preparationDetails?.totalTime ||
        0;
      const isVeg = productData.data.productAttributes?.vegetarian || false;
      const platform = isMobile ? "mobile_web" : "web";

      trackProductDetailPageViewed({
        product_id: productData?.data?.id || "",
        product_name: productData?.data?.name || "",
        page_type: "product_detail",
        store_id: storeData?.id || "",
        store_name: storeData?.name || "",
        category_name: productData?.data?.productCategoryName || "",
        city: storeData?.address?.city || "",
        currency: tenantConfig?.currencyCode || "INR",
        funnel: isQrFlowActive
          ? DINE_IN_ANALYTICS_CONTEXT.funnel
          : "order_online",
        platform,
        base_price: basePrice,
        rating,
        review_count: reviewCount,
        prep_time_minutes: prepTimeMinutes,
        is_veg: isVeg,
        ...(isQrFlowActive
          ? {
              table_number: String(qrFlowTableNumber || ""),
              session_id: String(qrSessionId || ""),
            }
          : {}),
      });
    }
  }, [
    isLoading,
    productData,
    storeData,
    isMobile,
    trackProductDetailPageViewed,
    tenantConfig,
    isQrFlowActive,
    qrSessionId,
    qrFlowTableNumber,
  ]);

  const { getCategoryUrl } = useProductUrl();

  const handlePlpRedirect = () => {
    if (urlParams.isReviewTab) {
      router.back();
    } else if (productData?.data?.type?.category === "COMBO") {
      router.back();
    } else {
      const menuSlug = params?.menuSlug as string;
      const categorySlug = params?.categorySlug as string;
      const storeSlug = storeData?.slug || "";

      if (menuSlug && categorySlug) {
        router.push(getCategoryUrl(categorySlug, menuSlug, storeSlug));
      } else {
        router.back();
      }
    }
  };

  return (
    <>
      {(productData?.data?.type?.category === "COMBO" || showComboFlow) &&
      !hideComboFlow ? (
        <ComboFlow
          storeData={storeData}
          cartData={cartData}
          selectedVariant={selectedVariant}
          setSelectedVariant={setSelectedVariant}
          urlParams={urlParams}
          setUrlParams={setUrlParams}
          reviewsSectionRef={reviewsSectionRef}
          CartProductData={CartProductData}
          handlePlpRedirect={handlePlpRedirect}
          cartItemsCount={cartItemsCount}
          params={params}
          isLoading={isLoading}
          onProductClick={() => {
            // Handle product click if needed
          }}
        />
      ) : (
        <div className="pdp-page mx-auto h-full overflow-hidden ">
          <ProductDetailsSchema
            menuId={urlParams.menuId || ""}
            categoryId={(params?.categorySlug as string) || ""}
            storeId={(params?.storeSlug as string) || ""}
            product={productData}
            productSlug={id}
            categoryName={productData?.data?.productCategoryName || ""}
            storeName={storeData?.name || ""}
          />
          {isLoading && !productData?.data?.id ? (
            <div className="full flex flex-col md:flex-row gap-x-4 h-screen">
              <div className="w-full md:w-[40%] lg:w-[30%] flex flex-col gap-4 ">
                <Shimmer className="w-full h-full" height="100%" />
              </div>
              <div className="w-full flex-1 flex flex-col justify-between ">
                <Shimmer className="w-full h-full" height="48%" />
                <Shimmer className="w-full h-full md:hidden" height="50%" />
              </div>
            </div>
          ) : (
            <div
              className={`pdp-container ${cartItemsCount > 0 ? "pb-28" : "pb-12"} md:pb-0 flex flex-col md:flex-row h-full items-stretch`}
            >
              <div className="product-icons-overlay">
                {!(
                  isCombo || productData?.data?.type?.category === "COMBO"
                ) && (
                  <button
                    type="button"
                    aria-label="Close product detail page"
                    className="cursor-pointer z-20 border-2 rounded-full border-[var(--rating-border-primary)] w-10 h-10 flex items-center justify-center focus:outline-none bg-[var(--primary-background)] hover:bg-[var(--rating-border-primary)]"
                    onClick={handlePlpRedirect}
                  >
                    <CloseCircleIcon
                      width={40}
                      height={40}
                      className="flex-shrink-0"
                    />
                  </button>
                )}
                {/* <Link
                  href={getCartUrl()}
                  prefetch={true}
                  className="relative z-20 flex items-center justify-center border-2 rounded-full border-[var(--rating-border-primary)] w-10 h-10 bg-[var(--primary-background)] hover:bg-[var(--rating-border-primary)] md:hidden"
                >
                  <Icon
                    icon={`${CART_ICON}#cart-mobile`}
                    width={18}
                    height={18}
                    color={"var(--primary-text)"}
                    className="flex-shrink-0 cursor-pointer"
                    viewBox="0 0 17 17"
                  />
                  {cartItemsCount > 0 && (
                    <div className="cart-count-badge">
                      {cartItemsCount > 99 ? '99+' : cartItemsCount < 10 ? '0' + cartItemsCount : cartItemsCount}
                    </div>
                  )}
                </Link> */}
              </div>
              {!(isCombo || productData?.data?.type?.category === "COMBO") && (
                <button
                  type="button"
                  aria-label="Close product detail page"
                  className="cursor-pointer z-20 hidden md:absolute top-1 left-3 md:top-[5px] md:left-auto md:right-11 border rounded-full border-[var(--rating-border-primary)] w-10 h-10 md:flex items-center justify-center focus:outline-none bg-[var(--primary-background)] hover:bg-[var(--rating-border-primary)]"
                  onClick={handlePlpRedirect}
                >
                  <CloseCircleIcon
                    width={40}
                    height={40}
                    className="flex-shrink-0"
                  />
                </button>
              )}
              <SideBar
                handlePlpRedirect={handlePlpRedirect}
                menuId={urlParams.menuId}
                productData={productData}
                selectedVariant={selectedVariant}
                handleScrollToReviewsSection={handleScrollToReviewsSection}
                cartData={cartData}
              />
              <ProductOptions
                productData={productData}
                storeData={storeData}
                reviewsSectionRef={reviewsSectionRef}
                CartProductData={CartProductData}
                selectedVariant={selectedVariant}
                setSelectedVariant={setSelectedVariant}
                urlParams={urlParams}
                setUrlParams={setUrlParams}
                goToNextStep={goToNextStep}
                goToBackStep={goToBackStep}
                currentStepIndex={currentStepIndex}
                isCombo={isCombo}
                comboPrefillEnabled={comboPrefillEnabled}
              />
            </div>
          )}
        </div>
      )}
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
          top: -1px;
          right: -1px;
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
        `}
      </style>
    </>
  );
};

export default ProductDetailPage;
