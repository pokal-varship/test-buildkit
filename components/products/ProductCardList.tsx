"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { generateImageBase64FromUrl } from "@lib/helper/ImageGen/imageGen";
import WishlistButton from "@components/ui/WishlistButton";
import CustomButton from "@components/buttons/Button";
import DietaryIndicator from "@components/ui/DietaryIndicator";
import ProductRating from "@components/ratings/ProductRating";
import { TypesenseProduct } from "@services/typesense/types";
import { getTenantConfig } from "@config/tenant.config";
import formatCurrency from "@lib/helper/price";
import { useSelector } from "react-redux";
import { selectCart } from "@redux/slices/cartSlice";
import { selectIsQrFlowActive } from "@redux/slices/qrFlowSlice";
import { useSessionTicketItems } from "@hooks/useQrSessionDerivedState";
import {
  KCAL_ICON,
  COIN_ICON,
  OFFER_LABEL_ICON,
  OFFER_TYPE_ICON,
} from "@config/Header/image.config";
import { getOfferTheme } from "@lib/offers/selectOffers";
import Icon from "@components/image/Icons";
import useLang from "@hooks/useLang";
import { LanguageCode, TranslationKeys } from "types";
import { useProductOffer } from "@components/products/ProductOffer";
import { pickBestOfferByFlow } from "@lib/offers/selectOffers";
import {
  useLoyaltyPointsRate,
  fetchLoyaltyPointsRate,
} from "@hooks/useLoyaltyPointsRate";
import { cn } from "@lib/utils";
import { usePlpProductCartActions } from "@hooks/usePlpProductCartActions";

interface ProductCardProps {
  product: TypesenseProduct;
  productLink?: string;
  onProductClick?: () => void;
  onCardClick?: (product: TypesenseProduct) => void;
  isGridMode?: boolean;
  hidePrice?: boolean;
  showAddButton?: boolean;
  onAddClick?: (product: TypesenseProduct) => void;
  excludedFromOfferProductIds?: string[];
  className?: string;
}

export const ProductCardList: React.FC<ProductCardProps> = ({
  product,
  productLink,
  onProductClick,
  onCardClick,
  isGridMode = false,
  hidePrice = false,
  showAddButton = false,
  onAddClick,
  excludedFromOfferProductIds,
  className,
}) => {
  const searchParams = useSearchParams();
  const isComboFromUrl = searchParams?.get("combo") === "true";

  const {
    name,
    media,
    primaryVariant,
    basePrice,
    discountedPrice,
    description,
    rating,
    overallRatings,
  } = product;

  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const imgRef = useRef<HTMLImageElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpandedMob, setIsExpandedMob] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const containsMeat = product?.productAttributes?.containsMeat;
  const tenantConfig = getTenantConfig();
  const calories =
    primaryVariant?.nutritionInfo?.values?.calories ??
    product?.nutritionInfo?.values?.calories;
  const hasRatingOrReviews = !!(
    (overallRatings &&
      ((overallRatings?.average ?? 0) > 0 ||
        (overallRatings?.totalReview ?? 0) > 0)) ||
    (rating && ((rating?.average ?? 0) > 0 || (rating?.count ?? 0) > 0))
  );
  const hasCalories = tenantConfig.showCaloriesInfo && !!calories;
  const shouldShowRatingCaloriesRow = hasRatingOrReviews || hasCalories;

  const hasSyncedRef = useRef(false);

  // Sync product like count immediately when component renders (only once)
  if (
    product.productId &&
    product.totalLikes !== undefined &&
    !hasSyncedRef.current
  ) {
    hasSyncedRef.current = true;
  }

  // Check if description is long enough to need a view more button
  const isLongDescriptionWeb = description?.en?.length > 200;
  const isLongDescriptionMob = description?.en?.length > 90;
  const variantsBestOffer =
    product.variants?.find((itm) => itm.bestOffer)?.bestOffer || null;

  // Get cart data and calculate product count (normal flow: cart API; QR flow: session ticket items)
  const cartData = useSelector(selectCart).cartData;
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const sessionTicketItems = useSessionTicketItems();
  const offerSource = pickBestOfferByFlow(product, isQrFlowActive);
  const bestOffer =
    !!offerSource && offerSource?.offerType > 0 && offerSource?.offerType < 5
      ? offerSource
      : null;

  // const renderWishlistAndArrowButtons = (containerClassName: string) => (
  //   <div className={containerClassName}>
  //     <WishlistButton
  //       product={{
  //         id: product.productId || '',
  //         name: name?.en || '',
  //         price: effectiveBasePrice,
  //         imageUrl: media?.[0]?.url,
  //         totalLikes: product.totalLikes || 0,
  //       }}
  //       showCount={false}
  //       className="relative w-7 !h-7 z-5"
  //       classNameWhenCountShown="!w-14 md:!w-12"
  //     />
  //     {showAddButton ? (
  //       <button
  //         className="rounded-full transition-colors border border-[var(--rating-border-primary)] bg-[var(--primary-tab-background)] md:bg-[var(--primary-background)] flex items-center justify-center w-7 h-7 md:w-7 md:h-7"
  //         onClick={(e) => {
  //           e.stopPropagation();
  //           if (onProductClick) onProductClick(product);
  //         }}
  //       >
  //         <Icon
  //           icon={`${ARROW_RIGHT}#arrow-right`}
  //           width={18}
  //           height={18}
  //           color={"var(--primary-text)"}
  //           className="w-5 h-5"
  //           viewBox="0 0 15 15"
  //         />
  //       </button>
  //     ) : (
  //       <button className="rounded-full transition-colors border border-[var(--rating-border-primary)] bg-[var(--primary-tab-background)] md:bg-[var(--primary-background)] flex items-center justify-center w-7 h-7 md:w-7 md:h-7">
  //         <Icon
  //           icon={`${ARROW_RIGHT}#arrow-right`}
  //           width={18}
  //           height={18}
  //           color={"var(--primary-text)"}
  //           className="w-5 h-5"
  //           viewBox="0 0 15 15"
  //         />
  //       </button>
  //     )}
  //   </div>
  // );

  const isExcludedFromOffer = useMemo(() => {
    const id =
      product.productId || (product as unknown as { id?: string })?.id || "";
    if (!id) return false;
    return !!excludedFromOfferProductIds?.includes(id);
  }, [excludedFromOfferProductIds, product]);

  const selectedItemsBadgeText = useMemo(() => {
    if (bestOffer?.offerType !== 2) return null;
    const dc = bestOffer.discountConfig as unknown as {
      type?: number | string;
      value?: number | string;
      minimumSpendValue?: number | string;
    };
    const min = Number(dc?.minimumSpendValue);
    const value = Number(dc?.value);
    const type = Number(dc?.type);
    if (!Number.isFinite(value) || value <= 0) return null;
    if (type === 1)
      return Number.isFinite(min) && min > 0
        ? `${value}% OFF ABOVE ₹${min}`
        : `${value}% OFF`;
    if (type === 2)
      return Number.isFinite(min) && min > 0
        ? `₹${value} OFF ABOVE ₹${min}`
        : `₹${value} OFF`;
    return null;
  }, [bestOffer]);

  const showGenericOfferLabel =
    !selectedItemsBadgeText &&
    !isExcludedFromOffer &&
    !!bestOffer &&
    bestOffer.offerType !== 4;

  const effectiveBasePrice = primaryVariant?.basePrice ?? basePrice;
  const effectiveDiscountedPrice =
    primaryVariant?.discountedPrice ?? discountedPrice;
  const isCustomisable =
    (product.type?.hasVariants && (primaryVariant?.variantCount ?? 0) > 1) ||
    product.type?.hasModifiers === true ||
    product.type?.category === "COMBO";

  const productCartCount = useMemo(() => {
    if (isQrFlowActive && sessionTicketItems?.length > 0) {
      return sessionTicketItems.reduce(
        (
          count: number,
          item: {
            itemId: string;
            quantity: number;
            itemName?: string;
            productName?: Record<string, string>;
          },
        ) => {
          const matchById = item.itemId === product.productId;
          const ticketItemName = item.productName?.en ?? item.itemName ?? "";
          const plpProductName = name?.en || "";
          const matchByName =
            ticketItemName.startsWith(plpProductName) ||
            ticketItemName === plpProductName ||
            plpProductName.startsWith(ticketItemName);
          if (matchById || matchByName) {
            return count + (item.quantity || 0);
          }
          return count;
        },
        0,
      );
    }

    if (!cartData?.data?.items) return 0;

    const count = cartData.data.items.reduce(
      (count: number, item: { productId: string; quantity?: number }) => {
        const matchById = item.productId === product.productId;
        if (matchById) {
          return count + (item.quantity || 0);
        }
        return count;
      },
      0,
    );

    return count;
  }, [
    isQrFlowActive,
    sessionTicketItems,
    cartData?.data?.items,
    name?.en,
    product.productId,
  ]);

  const {
    isCartActionLoading,
    handleAddButtonClick,
    handleIncrease,
    handleDecrease,
  } = usePlpProductCartActions({
    product,
    isCustomisable,
    productLink,
    onProductClick,
    onAddClick,
  });

  const showInlineQuantityControls =
    showAddButton && productCartCount > 0;

  const { rate: defaultPointsRate, setRate: setPointsRate, canEarnLoyalty, setCanEarnLoyalty } =
    useLoyaltyPointsRate();
  useEffect(() => {
    fetchLoyaltyPointsRate().then(({ rate, canEarnLoyalty }) => {
      setPointsRate(rate);
      setCanEarnLoyalty(canEarnLoyalty);
    });
  }, [setPointsRate, setCanEarnLoyalty]);
  const loyaltyPoints = useMemo(() => {
    if (
      product.loyaltyPoints != null &&
      Number.isFinite(product.loyaltyPoints) &&
      product.loyaltyPoints > 0
    ) {
      return product.loyaltyPoints;
    }
    if (defaultPointsRate) {
      const price = effectiveDiscountedPrice || effectiveBasePrice;
      const calculated = Math.floor(price * defaultPointsRate);
      return calculated > 0 ? calculated : null;
    }
    return null;
  }, [
    product.loyaltyPoints,
    defaultPointsRate,
    effectiveDiscountedPrice,
    effectiveBasePrice,
  ]);
  const showLoyaltyTag =
    canEarnLoyalty && loyaltyPoints != null && loyaltyPoints > 0;

  const hasTopRowBadge =
    isExcludedFromOffer || !!selectedItemsBadgeText || showGenericOfferLabel;

  // Preload the image for LCP optimization
  useEffect(() => {
    if (media?.[0]?.url && imgRef.current) {
      // Create a link element for preloading
      const preloadLink = document.createElement("link");
      preloadLink.rel = "preload";
      preloadLink.as = "image";
      preloadLink.href =
        generateImageBase64FromUrl({
          url: media[0].url,
          width: 315,
          height: 315,
        })?.fullEncodedUrl || "";
      document.head.appendChild(preloadLink);
    }
  }, [media]);

  const basePriceFormat = formatCurrency({ amount: effectiveBasePrice });
  const discountedPriceFormat = formatCurrency({
    amount: effectiveDiscountedPrice,
  });

  const { offerTextVariantElem } = useProductOffer(
    bestOffer,
    variantsBestOffer,
    effectiveBasePrice,
    effectiveDiscountedPrice,
    basePriceFormat,
    {
      productPriceClassName: "product-price",
      scratchPriceClassName: "scratch-price",
    },
  );

  const productImageSrc = media?.[0]?.url
    ? isComboFromUrl
      ? media[0].url
      : generateImageBase64FromUrl({
          url: media[0].url,
          width: 315,
          height: 315,
        })?.fullEncodedUrl || ""
    : generateImageBase64FromUrl({
        url: tenantConfig.productPlaceholderImageUrl || "",
        width: 315,
        height: 315,
      })?.fullEncodedUrl || "";

  const placeholderImageSrc =
    generateImageBase64FromUrl({
      url: tenantConfig.productPlaceholderImageUrl || "",
      width: 315,
      height: 315,
    })?.fullEncodedUrl || "";

  const offerBadgesNode = !hasTopRowBadge ? null : isExcludedFromOffer ? (
    <div className="flex items-center gap-1 z-[2] bg-[#F9E2DE] text-[#C4645D] font-semibold px-3 py-1 rounded-lg shadow-md max-w-full">
      <span className="text-[10px] md-extra-small-font font-semibold uppercase truncate">
        {lang.notInOffer}
      </span>
    </div>
  ) : selectedItemsBadgeText ? (
    <div
      className={`flex items-center gap-1 z-[2] bg-[var(--offer-type-2-bg)] text-[var(--offer-type-2-text)] font-semibold px-2 py-1 rounded-3xl shadow-md max-w-full`}
    >
      {!!bestOffer && (
        <Icon
          icon={`${OFFER_TYPE_ICON}#offers`}
          width={16}
          height={16}
          viewBox="0 0 15 15"
          color={getOfferTheme(bestOffer).text}
          className="w-3 h-3 shrink-0"
        />
      )}
      <span className="text-[10px] md-heading-6 font-semibold uppercase truncate">
        {selectedItemsBadgeText}
      </span>
    </div>
  ) : showGenericOfferLabel ? (
    <div
      className={`flex items-center gap-1 z-[2] bg-[var(--accent-color)] text-[var(--white)] font-semibold px-1 md:px-2 py-0.5 md:py-1 rounded-md md:rounded-lg shadow-md offer-label max-w-full`}
    >
      <img
        src={OFFER_LABEL_ICON}
        alt="offers"
        title="offers"
        className="w-3 h-3 md:w-4 md:h-4 shrink-0"
      />
      <span className="text-[10px] md-heading-6 font-semibold uppercase truncate">
        {lang?.offer}
      </span>
    </div>
  ) : null;

  const loyaltyBadgeClassName =
    "flex items-center gap-1 bg-[#A03DFB] text-[var(--white)] font-semibold px-1 md:px-2 py-0.5 rounded-md md:rounded-lg shadow-md loyalty-label shrink-0 max-w-full";

  const addButtonNode = showAddButton ? (
    showInlineQuantityControls ? (
      <div className="add-btn-overlay flex items-center justify-between gap-2 !min-w-[96px] !px-3 !py-2 !rounded-md font-bold !bg-[var(--primary-tab-background)] md:!bg-[var(--primary-background)] !border !border-[var(--rating-border-primary)] !shadow-sm !text-[var(--primary-text)]">
        <button
          type="button"
          className="w-6 h-6 flex items-center justify-center text-lg leading-none disabled:opacity-50"
          onClick={handleDecrease}
          disabled={isCartActionLoading}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="min-w-[20px] text-center text-sm font-bold">
          {productCartCount}
        </span>
        <button
          type="button"
          className="w-6 h-6 flex items-center justify-center text-lg leading-none disabled:opacity-50"
          onClick={handleIncrease}
          disabled={isCartActionLoading}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    ) : (
      <CustomButton
        className="add-btn-overlay !min-w-[72px] !px-10 !py-2 !rounded-md font-bold !bg-[var(--primary-tab-background)] md:!bg-[var(--primary-background)] !border !border-[var(--rating-border-primary)] font-700 !text-[var(--primary-text)]"
        onClick={handleAddButtonClick}
        disabled={isCartActionLoading}
      >
        {lang.add}
      </CustomButton>
    )
  ) : null;

  const card = (
    <div className="relative">
      <div
        className={`flex flex-col justify-between items-start py-4 md:p-4 transition-colors bg-[var(--quaternary-background)] md:bg-[var(--cards-containers)] md:rounded-lg border-b md:border ${productCartCount > 0 ? "md:border-[var(--primary-color)]" : "border-[var(--rating-border-primary)] md:border-[var(--borders-dividers)]"} ${isGridMode ? `md:h-full md:rounded-md md:shadow-sm ${showAddButton ? "md:min-h-[200px]" : "md:min-h-[165px]"}` : ""}`}
      >
        {/* <div className={`flex items-center gap-2 w-full pb-3 ${hasTopRowBadge ? 'justify-between' : 'justify-end'}`}>
        {isExcludedFromOffer ? (
          <div className="flex items-center gap-1 z-[2] bg-[#F9E2DE] text-[#C4645D] font-semibold px-3 py-1 rounded-lg shadow-md">
            <span className="extra-small-font md-extra-small-font font-semibold uppercase truncate">NOT IN OFFER</span>
          </div>
        ) : selectedItemsBadgeText ? (
          <div className={`flex items-center gap-1 z-[2] bg-[var(--offer-type-2-bg)] text-[var(--offer-type-2-text)] font-semibold px-2 py-1 rounded-3xl shadow-md`}>
            {!!bestOffer && (
              <Icon
                icon={`${OFFER_TYPE_ICON}#offers`}
                width={16}
                height={16}
                viewBox="0 0 15 15"
                color={getOfferTheme(bestOffer).text}
                className="w-3 h-3"
              />
            )}
            <span className="extra-small-font font-semibold uppercase truncate">{selectedItemsBadgeText}</span>
          </div>
        ) : showGenericOfferLabel ? (
          <div className={`flex items-center gap-1 z-[2] bg-[var(--accent-color)] text-[var(--white)] font-semibold px-2 py-1 rounded-md shadow-md offer-label`}>
            <img src={OFFER_LABEL_ICON} alt="offers" title="offers" className="w-4 h-4" />
            <span className="extra-small-font font-semibold uppercase truncate">{lang?.offer}</span>
          </div>
        ) : null}
        {renderWishlistAndArrowButtons("flex items-center gap-2")}
      </div> */}

        <div className="flex items-start gap-2 justify-between w-full">
          <div className="flex-1 pr-2 md:pr-4 min-w-0">
            {hasTopRowBadge && (
              <div className="hidden md:flex items-center gap-2 w-full pb-3">
                {offerBadgesNode}
              </div>
            )}
            {/* Dietary Indicator */}
            <DietaryIndicator
              containsMeat={!!containsMeat}
              containerClassName="mt-[5px] md:mt-0 p-0 mb-1"
            />
            <h3 className="heading-5 md-heading-4 capitalize product-name flex items-start">
              <span className="flex-1 min-w-0">
                {name?.en}
                {product.variantAttributes &&
                  Object.keys(product.variantAttributes).length > 0 && (
                    <span className="inline-block">
                      ({Object.values(product.variantAttributes).join(", ")})
                    </span>
                  )}
              </span>
            </h3>

            {shouldShowRatingCaloriesRow && (
              <div className="flex gap-2">
                {hasRatingOrReviews && (
                  <ProductRating
                    rating={rating}
                    overallRatings={overallRatings}
                    className="mt-1"
                  />
                )}
                {hasCalories && (
                  <>
                    {hasRatingOrReviews && (
                      <span className="self-center h-1 w-1 rounded-full bg-[var(--secondary-text)] mt-1"></span>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <img
                        src={`${KCAL_ICON}#kcal`}
                        alt="kcal"
                        className="w-3 h-3 md:w-4 md:h-4"
                        width={12}
                        height={12}
                      />
                      <span className="text-[var(--secondary-text)] extra-small-font md-heading-5">
                        {calories} {lang.kcal}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {!hidePrice && (
              <div className="flex items-center mt-2 gap-2">
                <div>
                  {!!effectiveDiscountedPrice ? (
                    <div className="flex flex-wrap items-center">
                      {tenantConfig.showStrikethroughPrice && (
                        <span className="scratch-price text-[var(--secondary-text)] line-through mr-1">
                          {basePriceFormat}
                        </span>
                      )}
                      <span className="product-price mr-1">
                        {/* {bestOffer?.offerName?.en && bestOffer?.discountConfig?.value 
                      ? formatCurrency({amount: effectiveDiscountedPrice - Number(bestOffer.discountConfig.value)})
                      : discountedPriceFormat} */}
                        {discountedPriceFormat}
                      </span>
                      {/*
                    OfferText badge hidden for now (all offer types)
                    {!!variantsBestOffer && offerTextVariant() ? (
                      <span className='whitespace-nowrap inline-block bg-[var(--success-opacity)] text-[10px] md-extra-small-font text-[var(--success)] rounded-[3px] md:rounded-[5px] px-1 py-[3px] font-600'>
                        {offerTextVariant()}
                      </span>
                    ) : bestOffer && offerText() ? (
                      <span className='whitespace-nowrap inline-block bg-[var(--success-opacity)] text-[10px] md-extra-small-font text-[var(--success)] rounded-[3px] md:rounded-[5px] px-1 py-[3px] font-600'>
                        {offerText()}
                */}
                    </div>
                  ) : (
                    <>
                      {!!variantsBestOffer && offerTextVariantElem() ? (
                        offerTextVariantElem()
                      ) : !!bestOffer ? (
                        <>
                          <span className="product-price">
                            {basePriceFormat}
                          </span>
                          {/*
                        OfferText badge hidden for now (all offer types)
                        {offerText() && (
                          <span className='whitespace-nowrap inline-block bg-[var(--success-opacity)] text-[10px] md-extra-small-font text-[var(--success)] rounded-[3px] md:rounded-[5px] px-1 py-[3px] font-600 ml-1'>
                            {offerText()}
                          </span>
                        )}
                      */}
                        </>
                      ) : (
                        <>
                          {/* <span className="scratch-price text-[var(--secondary-text)] line-through mr-1">{basePriceFormat}</span> */}
                          <span className="product-price">
                            {basePriceFormat}
                          </span>
                        </>
                      )}
                    </>
                  )}
                </div>
                {showLoyaltyTag && (
                  <div className={`hidden md:flex ${loyaltyBadgeClassName}`}>
                    <span className="text-[10px] md-heading-6 font-semibold uppercase truncate">
                      {lang.earn}
                    </span>
                    <img
                      src={COIN_ICON}
                      alt="loyalty points"
                      title="loyalty points"
                      className="w-4 h-4"
                    />
                    <span className="text-[10px] md-heading-6 font-semibold uppercase truncate">
                      {loyaltyPoints} {lang.pts}
                    </span>
                  </div>
                )}
              </div>
            )}
            {/* Mobile Description */}
            {description?.en && (
              <div className="block md:hidden">
                <div className="relative">
                  <div
                    ref={descriptionRef}
                    className={`text-sm md:text-sm text-[var(--secondary-text)] mt-2 description-container ${!isExpandedMob && isLongDescriptionMob ? "line-clamp-2" : ""}`}
                    dangerouslySetInnerHTML={{
                      __html: description.en,
                    }}
                  />
                  {isLongDescriptionMob && !isExpandedMob && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsExpandedMob(!isExpandedMob);
                      }}
                      className="pl-1 absolute bottom-0 right-0 text-sm md:text-xs text-[var(--warning)] font-medium hover:underline focus:outline-none transition-colors bg-[var(--cards-containers)]"
                    >
                      ...{lang.more}
                    </button>
                  )}
                  {isLongDescriptionMob && isExpandedMob && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsExpandedMob(!isExpandedMob);
                      }}
                      className="text-sm md:text-xs text-[var(--warning)] mt-1 font-medium hover:underline focus:outline-none transition-colors"
                    >
                      {lang.less}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Desktop Description */}
            {description?.en && (
              <div className="hidden md:block">
                <div className="relative">
                  <div
                    ref={descriptionRef}
                    className={`text-xs md:text-sm text-[var(--secondary-text)] mt-2 description-container ${!isExpanded && isLongDescriptionWeb ? "line-clamp-2" : ""}`}
                    dangerouslySetInnerHTML={{
                      __html: description.en,
                    }}
                  />
                  {isLongDescriptionWeb && !isExpanded && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                      }}
                      className="absolute pl-2 bottom-0 right-0 text-xs md:text-xs text-[var(--accent-color)] font-medium hover:underline focus:outline-none transition-colors bg-[var(--cards-containers)] "
                    >
                      {lang.viewMore}
                    </button>
                  )}
                  {isLongDescriptionWeb && isExpanded && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                      }}
                      className="text-xs md:text-xs text-[var(--accent-color)] mt-1 font-medium hover:underline focus:outline-none transition-colors"
                    >
                      {lang.showLess}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 flex flex-col items-center">
            <div
              className={cn(
                "relative w-[156px] rounded-2xl",
                showAddButton
                  ? cn(
                      "overflow-visible pb-5",
                    )
                  : "h-[156px] overflow-hidden",
              )}
            >
              {!productLink && (
                <WishlistButton
                  product={{
                    id: product.productId || "",
                    name: name?.en || "",
                    price: effectiveBasePrice,
                    imageUrl: media?.[0]?.url,
                    totalLikes: product.totalLikes || 0,
                  }}
                  showCount={false}
                  className="absolute top-2 right-2 z-[3] !w-8 !h-8 shadow-sm"
                  classNameWhenCountShown="!w-14 md:!w-12"
                />
              )}
              <div className="relative h-[156px] w-full">
                <img
                  ref={imgRef}
                  title={name?.en}
                  src={productImageSrc}
                  alt={name?.en || "Placeholder Product Image"}
                  width={300}
                  height={300}
                  className="relative z-0 w-full h-[156px] object-cover rounded-2xl"
                  fetchPriority="high"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = placeholderImageSrc;
                  }}
                />
                {(hasTopRowBadge || (showLoyaltyTag && !hidePrice)) && (
                  <div className="pointer-events-none absolute top-2 left-2 z-[2] flex max-w-[calc(100%-3.5rem)] flex-col items-start gap-1 md:hidden">
                    {showLoyaltyTag && !hidePrice && (
                      <div
                        className={`pointer-events-auto ${loyaltyBadgeClassName}`}
                      >
                        <span className="text-[10px] md-heading-6 font-semibold uppercase truncate">
                          {lang.earn}
                        </span>
                        <img
                          src={COIN_ICON}
                          alt="loyalty points"
                          title="loyalty points"
                          className="w-1.5 h-1.5"
                        />
                        <span className="text-[10px] md-heading-6 font-semibold uppercase truncate">
                          {loyaltyPoints} {lang.pts}
                        </span>
                      </div>
                    )}
                    {hasTopRowBadge && offerBadgesNode ? (
                      <div className="pointer-events-auto min-w-0">
                        {offerBadgesNode}
                      </div>
                    ) : null}
                  </div>
                )}
                {!productLink && addButtonNode && (
                  <div className="absolute bottom-0 left-1/2 z-[3] -translate-x-1/2 translate-y-1/2 pointer-events-auto">
                    {addButtonNode}
                  </div>
                )}
              </div>
            </div>
            {showAddButton && isCustomisable && (
              <span className="text-[var(--secondary-text)] extra-small-font mt-1 text-center block">
                {lang.customisable}
              </span>
            )}
          </div>
        </div>
        <style>{`
        .product-name {
          font-weight: 540;
        }
        .semi-bold-weight {
          font-weight: var(--font-medium);
        }
        .product-price {
          font-weight: var(--font-semi-bold);
          font-size: var(--heading-h4);
        }
        .scratch-price {
          font-size: var(--heading-h4);
        }
        @media (max-width: 768px) {
          .scratch-price {
            font-size: var(--heading-h5);
          }
          .product-price {
            font-size: var(--heading-h5);
            }
          }
        .description-container {
          transition: max-height 0.3s ease-in-out, opacity 0.2s ease-in-out;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
        {/* Cart Count Badge (hidden when inline quantity controls are shown) */}
        {productCartCount > 0 && !showInlineQuantityControls && (
          <div className="absolute bottom-3  md:bottom-0 right-0 z-5 bg-[var(--button-primary-background)] text-[var(--button-primary-text)] font-bold w-9 h-9 rounded-tl-md rounded-br-md flex items-center justify-center">
            <span className="heading-6">{productCartCount}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={cn("w-full", className)}
      onClick={
        !productLink && onCardClick && !showAddButton
          ? () => onCardClick(product)
          : undefined
      }
      style={{
        cursor:
          !productLink && onCardClick && !showAddButton ? "pointer" : undefined,
      }}
    >
      <div className="isolate grid [&>*]:col-start-1 [&>*]:row-start-1">
        {productLink ? (
          <Link
            href={productLink}
            onClick={onProductClick}
            className="block w-full cursor-pointer"
            prefetch
          >
            {card}
          </Link>
        ) : (
          card
        )}
        {productLink && (
          <div className="z-[3] col-start-1 row-start-1 pointer-events-none">
            <div className="flex items-start gap-2 justify-between w-full py-4 md:p-4">
              <div className="flex-1 min-w-0" />
              <div className="flex-shrink-0 flex flex-col items-center w-[156px]">
                <div
                  className={cn(
                    "relative w-[156px]",
                    showAddButton &&
                      cn(
                        showInlineQuantityControls ? "pb-7" : "pb-5",
                      ),
                  )}
                >
                  <div className="relative h-[156px] w-full overflow-visible rounded-2xl">
                    <div className="absolute top-2 right-2 pointer-events-auto z-[3]">
                      <WishlistButton
                        product={{
                          id: product.productId || "",
                          name: name?.en || "",
                          price: effectiveBasePrice,
                          imageUrl: media?.[0]?.url,
                          totalLikes: product.totalLikes || 0,
                        }}
                        showCount={false}
                        className="!w-8 !h-8 shadow-sm"
                        classNameWhenCountShown="!w-14 md:!w-12"
                      />
                    </div>
                    <div className="relative h-[156px] w-full">
                      {addButtonNode && (
                        <div className="absolute bottom-0 left-1/2 z-[3] -translate-x-1/2 translate-y-1/2 pointer-events-auto">
                          {addButtonNode}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
