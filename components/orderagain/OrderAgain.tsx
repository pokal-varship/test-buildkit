import Link from "next/link";
import CustomButton from "@components/buttons/Button";
import useLang from "@hooks/useLang";
import { useReorderProducts } from "@hooks/useReorderProducts";
import { generateImageBase64FromUrl } from "@lib/helper/ImageGen/imageGen";
import formatCurrency from "@lib/helper/price";
import { RootState } from "@redux/store";
import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { LanguageCode, TranslationKeys } from "types";
import { useRouter } from "next/navigation";
import { getFormattedDateTime } from "@lib/helper/date";
import { ReorderProduct } from "./orderAgainType";
import { addToCart, getProductDetails } from "@services/pdp";
import { AddToCartPayload, LinkedModifier } from "@components/type/pdp.type";
import { useToast } from "@components/toast/Toast";
import Loader from "@components/loader/Loader";
import { useStoreCart } from "@hooks/storepage/useStore";
import { selectQrFlow } from "@redux/slices/qrFlowSlice";
import useProductUrl from "@hooks/useProductUrl";
import { getTenantConfig } from "@config/tenant.config";
import SliderNavigation from "@components/ui/SliderNavigation";
import { open_dialog, close_dialog } from "@lib/modalHandler";
import { OrderAgainAddon } from "@components/dialogDrawer/modal/OrderAgain/OrderAgainItemDetails";
import Icon from "@components/image/Icons";
import { KCAL_ICON, STAR_ICON } from "@config/Header/image.config";
import { cn } from "@lib/utils";
import useIsMobile from "@hooks/useIsMobile";
import DietaryIndicator from "@components/ui/DietaryIndicator";
const OrderAgain = ({
  storeSlug,
  menuSlug,
  headingClassName,
}: {
  storeSlug: string;
  menuSlug: string;
  headingClassName?: string;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lang, languageCode]: [TranslationKeys, LanguageCode] = useLang();
  const store = useSelector((state: RootState) => state.store);
  const isQrFlow = useSelector(selectQrFlow);
  const router = useRouter();
  const toast = useToast();
  const { handleGetCart } = useStoreCart();
  const { getCartItemProductUrl } = useProductUrl();
  const tenantConfig = getTenantConfig();
  const isMobile = useIsMobile();

  // Loading state for individual product add to cart operations
  const [loadingProducts, setLoadingProducts] = useState<Set<string>>(
    new Set()
  );

  // Use the custom hook to fetch reorder products
  const { products, loading, isAuthenticated } = useReorderProducts(
    storeSlug,
    menuSlug
  );

  const handleAddToCart = async (product: ReorderProduct) => {
    if (isQrFlow) return;
    // Add product to loading state
    setLoadingProducts((prev) => new Set(prev).add(product.productId));

    try {
      // First, fetch product details to check for variants
      const productDetails = await getProductDetails(
        product.categorySlug,
        product.productSlug,
        storeSlug
      );

      // Create base payload for add to cart
      const payload: AddToCartPayload = {
        quantity: 1,
        productId: product.productId,
        menuSlug: product.menuSlug,
      };

      // Check if product has variants and auto-select the first one
      if (
        productDetails?.data?.variants &&
        productDetails.data.variants.length > 0
      ) {
        payload.variantId = productDetails.data.variants[0]._id;
      }

      // Start with modifiers from the reorder product (previously selected modifiers)
      const modifierGroupsMap = new Map<
        string,
        {
          modifierGroupId: string;
          modifiers: { modifierId: string; quantity: number }[];
        }
      >();

      // Extract modifiers from product.modifierGroup (previously selected)
      if (product.modifierGroup && product.modifierGroup.length > 0) {
        product.modifierGroup.forEach((group) => {
          if (group.modifiers && group.modifiers.length > 0) {
            modifierGroupsMap.set(group.modifierGroupId, {
              modifierGroupId: group.modifierGroupId,
              modifiers: group.modifiers.map((modifier) => ({
                modifierId: modifier.modifierId,
                quantity: modifier.quantity,
              })),
            });
          }
        });
      }

      // Check if product has mandatory modifiers and merge them
      if (
        productDetails?.data?.linkedModifiers &&
        productDetails.data.linkedModifiers.length > 0
      ) {
        const mandatoryGroups = productDetails.data.linkedModifiers.filter(
          (group: LinkedModifier) => group.config?.isMandatory
        );

        mandatoryGroups.forEach((group: LinkedModifier) => {
          // Check if this mandatory group is already in the map (from reorder data)
          const existingGroup = modifierGroupsMap.get(group.id || group._id);

          if (!existingGroup && group.modifiers && group.modifiers.length > 0) {
            // Add mandatory modifier if not already present
            modifierGroupsMap.set(group.id || group._id, {
              modifierGroupId: group.id || group._id,
              modifiers: [
                {
                  modifierId: group.modifiers[0].modifierId,
                  quantity: 1,
                },
              ],
            });
          }
        });
      }

      // Convert map to array and add to payload
      if (modifierGroupsMap.size > 0) {
        payload.modifierGroups = Array.from(modifierGroupsMap.values());
      }

      // Call add to cart service
      await addToCart(store?.currentStore?.id || "", payload);

      // Refresh cart data to show latest information
      await handleGetCart(store?.currentStore?.id || "");

      // Show success message
      toast("success", lang.itemHasBeenAddedOnCart);
    } catch (error) {
      // Handle error
      const Error = error as { response: { data: { message: string } } };
      const errorMessage =
        Error?.response?.data?.message || "Something went wrong";

      // If it's a variant/modifier selection error, redirect to product page
      if (
        errorMessage.includes("variant") ||
        errorMessage.includes("modifier") ||
        errorMessage.includes("select")
      ) {
        toast(
          "info",
          "Product requires customization. Redirecting to product page..."
        );
        setTimeout(() => {
          router.push(getReorderProductUrl(product));
        }, 1000);
      } else {
        toast("error", errorMessage);
      }
    } finally {
      // Remove product from loading state
      setLoadingProducts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(product.productId);
        return newSet;
      });
    }
  };

  // Generate product URL for order again items
  // Format: /products/${productSlug}?store=${storeSlug}&menu=${menuSlug}&category=${categorySlug}
  const getReorderProductUrl = (product: ReorderProduct) => {
    return getCartItemProductUrl(
      product.productSlug,
      product.categorySlug,
      product.menuSlug,
      store?.currentStore?.slug
    );
  };

  // Extract addons from API response modifierGroup
  const extractAddonsFromProduct = (
    product: ReorderProduct
  ): OrderAgainAddon[] => {
    if (!product.modifierGroup || product.modifierGroup.length === 0) {
      return [];
    }

    const addons: OrderAgainAddon[] = [];

    // Flatten all modifiers from all modifier groups
    product.modifierGroup.forEach((group) => {
      if (group.modifiers && group.modifiers.length > 0) {
        group.modifiers.forEach((modifier) => {
          addons.push({
            id: modifier.id || modifier.modifierId,
            modifierName: modifier.modifierName,
            unitPrice: modifier.unitPrice,
            quantity: modifier.quantity,
          });
        });
      }
    });

    return addons;
  };

  // Handle opening the addons details modal
  const handleOpenAddonsModal = (product: ReorderProduct) => {
    const addons = extractAddonsFromProduct(product);
    const lastOrderedDate =
      getFormattedDateTime(Number(product?.lastOrderedAt)) || "Recently";

    open_dialog("orderAgainItemDetails", {
      open: true,
      propsData: {
        product,
        addons,
        lastOrderedDate,
        onAddToCart: () => {
          close_dialog(["orderAgainItemDetails"]);
          handleAddToCart(product);
        },
        isAddingToCart: loadingProducts.has(product.productId),
      },
      type: "orderAgainItemDetails",
      handlerDialog: () => {},
      handleClose: () => {
        close_dialog(["orderAgainItemDetails"]);
      },
      anchor: "bottom",
      sxStyle: {
        "& .MuiPaper-root": {
          maxWidth: "500px",
          width: "100%",
        },
      },
    });
  };

  // Scroll handlers for horizontal navigation
  const handlePrev = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: -320, // 300px card width + 16px gap
        behavior: "smooth",
      });
    }
  };

  const handleNext = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: 320, // 300px card width + 16px gap
        behavior: "smooth",
      });
    }
  };

  // Don't render anything if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    // Only show loading state if we have cached productsories with
    if (!products || products.length === 0) {
      return null;
    }

    return (
      <div className="order-again-container">
        <div className="mx-auto">
          <h1 className="order-again-heading mb-4">{lang.orderAgain}</h1>
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">{lang.loadingReorderProducts}</div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if there are no products
  if (!products || !Array.isArray(products) || products.length === 0) {
    return null;
  }

  return (
    <div className="order-again-container">
      <div className="mx-auto">
        <div className="order-again-header mb-2">
          <h1 className={cn('order-again-heading',headingClassName)}>{lang.orderAgain}</h1>
          <SliderNavigation
            onPrevClick={handlePrev}
            onNextClick={handleNext}
            disabled={false}
            size="md"
            variant="default"
            hideOnMobile={true}
            className="slider-nav-inline"
          />
        </div>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-container"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {products.map((product) => {
            const addons = extractAddonsFromProduct(product);
            const addonCount = addons.length;
            const originalAmount = product.originalAmount || 0;
            const discountedAmount = product.discountedAmount;
            const hasDiscount =
              discountedAmount != null &&
              discountedAmount > 0 &&
              discountedAmount !== originalAmount;

            return (
              <div key={product.productId} className="product-card">
                {/* Last Ordered Date - You might want to add this to the API response */}
                <div className="last-ordered-date mb-3">
                  Last ordered :{" "}
                  {getFormattedDateTime(Number(product?.lastOrderedAt)) ||
                    "Recently"}
                </div>

                {/* Product Preview Row */}
                <div className="product-preview-row mb-1">
                  {/* Product Image */}
                  <Link
                    href={getReorderProductUrl(product)}
                    className="product-image cursor-pointer"
                    prefetch={true}
                  >
                    <img
                      src={
                        generateImageBase64FromUrl({
                          url: product.media[0].url,
                          width: 64,
                        })?.fullEncodedUrl || ""
                      }
                      alt={
                        product.productName[
                          languageCode as keyof typeof product.productName
                        ] || ""
                      }
                      className="product-img"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          generateImageBase64FromUrl({
                            url: tenantConfig.productPlaceholderImageUrl || "",
                            width: 64,
                          })?.fullEncodedUrl || "";
                      }}
                    />
                    <DietaryIndicator
                      containsMeat={!!product.productAttributes?.containsMeat}
                      containerClassName="dietary-indicator-overlay"
                      size={{ width: 12, height: 12 }}
                      imageClassName="w-3 h-3"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="product-info">
                    <Link
                      href={getReorderProductUrl(product)}
                      className="product-name cursor-pointer"
                      prefetch={true}
                    >
                      {product.productName[
                        languageCode as keyof typeof product.productName
                      ] || ""}
                    </Link>

                    <div className="flex items-center gap-2">
                      {/* Show addons indicator if addons exist, otherwise show rating and calories */}
                        <>
                          {/* Rating and Reviews */}
                          {product?.rating &&
                            ((product.rating.average ?? 0) > 0 ||
                              (product.rating.totalReview ?? 0) > 0) && (
                              <div className="rating-section">
                                <div className="flex items-center gap-1">
                                  {(product.rating.average ?? 0) > 0 && (
                                    <>
                                      <Icon
                                        icon={`${STAR_ICON}#star2`}
                                        aria-label="Rating Star"
                                        width={15}
                                        height={15}
                                        color={"var(--rating-bg-primary)"}
                                        viewBox="0 0 28 26"
                                        className="mb-1"
                                      />
                                      <span className="rating-score">
                                        {product.rating.average}
                                      </span>
                                      <span className="rating-separator">•</span>
                                    </>
                                  )}
                                  <span className="review-count">
                                    {product.rating.totalReview ?? 0}{" "}
                                    {lang.reviews}
                                  </span>
                                </div>
                              </div>
                            )}
                          {/* Calories */}
                          {tenantConfig.showCaloriesInfo &&
                            product?.nutritionInfo?.values?.calories &&
                            product.nutritionInfo.values.calories > 0 && (
                              <div className="flex items-center gap-1">
                                <img
                                  src={`${KCAL_ICON}#kcal`}
                                  alt="kcal"
                                  className="kcal-icon"
                                  width={10}
                                  height={10}
                                />
                                <span className="calories-text">
                                  {product.nutritionInfo.values.calories}{" "}
                                  {lang.kcal || "Kcal"}
                                </span>
                              </div>
                            )}
                        </>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-between mb-2">
                {/* Pricing */}
                {hasDiscount ? (
                  <div className="pricing-section">
                    {tenantConfig.showStrikethroughPrice && (
                      <span className="original-price">
                        {formatCurrency({ amount: originalAmount })}
                      </span>
                    )}
                    <span className="discounted-price">
                      {formatCurrency({ amount: discountedAmount })}
                    </span>
                  </div>
                ) : (
                  <div className="pricing-section">
                    <span className="discounted-price">
                      {formatCurrency({ amount: originalAmount })}
                    </span>
                  </div>
                )}

                {addonCount > 0 ? (
                  <div
                    className="addons-indicator"
                    onClick={() => handleOpenAddonsModal(product)}
                  >
                    {isMobile
                      ? `+${addonCount} ${lang.addon}${addonCount !== 1 ? "s" : ""}`
                      : `${addonCount} ${lang.addon}${addonCount !== 1 ? "s" : ""} ${lang.included}`}
                  </div>
                ) : null}
                </div>

                {/* Add to Cart Button */}
                <CustomButton
                  className="add-to-cart-button"
                  onClick={() => handleAddToCart(product)}
                  disabled={loadingProducts.has(product.productId)}
                >
                  {loadingProducts.has(product.productId) ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader color="black" size={16} />
                      <span>Adding...</span>
                    </div>
                  ) : (
                    lang.addToCart
                  )}
                </CustomButton>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .order-again-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        
        .order-again-heading {
          font-size: 35px;
          font-weight: var(--font-bold);
          color: var(--primary-text);
          margin: 0;
        }
        
        .slider-nav-inline {
          flex-shrink: 0;
        }
        
        .product-card {
          background-color: var(--cards-containers);
          border: 1px solid var(--borders-dividers);
          border-radius: 12px;
          padding: 16px;
          width: 300px;
          min-width: 300px;
          display: flex;
          flex-direction: column;
        }
        
        .last-ordered-date {
          font-size: var(--extraSmall-font);
          color: var(--secondary-text);
          font-weight: var(--font-regular);
          flex-shrink: 0;
        }
        
        .product-preview-row {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-shrink: 0;
        }
        
        .product-image {
          flex-shrink: 0;
          position: relative;
          display: block;
        }

        .dietary-indicator-overlay {
          position: absolute;
          top: 4px;
          left: 4px;
          z-index: 1;
          padding: 0 !important;
        }
        
        .product-img {
          width: 64px;
          height: 64px;
          border-radius: 8px;
          object-fit: cover;
        }
        
        .product-info {
          flex: 1;
          min-width: 0;
        }
        
        .product-name {
          font-size: var(--heading-h6);
          font-weight: var(--font-bold);
          color: var(--primary-text);
          line-height: 1.2;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0 0 2px 0;
        }
        
        .category-section {
          display: flex;
          align-items: center;
        }
        
        .add-to-cart-button {
         font-weight: var(--font-bold);
        }
        .add-to-cart-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .rating-score {
          font-size: var(--extraSmall-font);
          color: var(--primary-text);
        }
        .rating-separator {
          font-size: var(--small-font);
          color: var(--primary-text);
        }
        .review-count {
          font-size: var(--extraSmall-font);
          color: var(--primary-text);
        }
        .calories-section {
          margin-top: 4px;
        }
        .flame-icon {
          flex-shrink: 0;
        }
        .calories-text {
          font-size: var(--extraSmall-font);
          color: var(--primary-text);
        }
        .original-price {
          font-size: var(--heading-h4);
          color: var(--secondary-text);
          text-decoration: line-through;
        }
        
        .discounted-price {
          font-size: var(--heading-h4);
          color: var(--primary-text);
          font-weight: var(--font-semi-bold);
        }

        .addons-indicator {
          font-size: var(--small-font);
          color: var(--accent-color);
          font-weight: var(--font-regular);
          cursor: pointer;
          transition: opacity 0.2s;
          text-decoration: underline;
        }
        .pricing-section {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        @media (max-width: 768px) {
          .order-again-heading {
            font-size: var(--heading-h2);
          }
        }
      `}</style>
    </div>
  );
};

export default OrderAgain;
