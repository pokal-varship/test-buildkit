"use client";
import React, { useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { generateImageBase64FromUrl } from "@lib/helper/ImageGen/imageGen";
import WishlistButton from "@components/ui/WishlistButton";
import ProductRating from "@components/ratings/ProductRating";
import DietaryIndicator from "@components/ui/DietaryIndicator";
import { TypesenseProduct } from "@services/typesense/types";
import { getTenantConfig } from "@config/tenant.config";
import formatCurrency from "@lib/helper/price";
import {
  KCAL_ICON,
  COIN_ICON,
  OFFER_LABEL_ICON,
  OFFER_TYPE_ICON,
} from "@config/Header/image.config";
import { getOfferTheme } from "@lib/offers/selectOffers";
import Icon from "@components/image/Icons";
import { LanguageCode, TranslationKeys } from "types";
import useLang from "@hooks/useLang";
import { useSelector } from "react-redux";
import { selectCart } from "@redux/slices/cartSlice";
import { selectIsQrFlowActive } from "@redux/slices/qrFlowSlice";
import { useProductOffer } from "@components/products/ProductOffer";
import { pickBestOfferByFlow } from "@lib/offers/selectOffers";
import { useSessionTicketItems } from "@hooks/useQrSessionDerivedState";
import {
  useLoyaltyPointsRate,
  fetchLoyaltyPointsRate,
} from "@hooks/useLoyaltyPointsRate";

interface ProductCardGridProps {
  product: TypesenseProduct;
  productLink?: string;
  onProductClick?: () => void;
  excludedFromOfferProductIds?: string[];
}

export const ProductCardGrid: React.FC<ProductCardGridProps> = ({
  product,
  productLink,
  onProductClick,
  excludedFromOfferProductIds,
}) => {
  const {
    name,
    media,
    primaryVariant,
    basePrice,
    discountedPrice,
    rating,
    overallRatings,
  } = product;

  const hasSyncedRef = useRef(false);

  // Sync product like count immediately when component renders (only once)
  if (
    product.productId &&
    product.totalLikes !== undefined &&
    !hasSyncedRef.current
  ) {
    hasSyncedRef.current = true;
  }

  const imgRef = useRef<HTMLImageElement>(null);
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const tenantConfig = getTenantConfig();
  const variantsBestOffer =
    product.variants?.find((itm) => itm.bestOffer)?.bestOffer || null;
  const containsMeat = product?.productAttributes?.containsMeat;
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

  // Get cart data and calculate product count (normal flow: cart API; QR flow: session ticket items)
  const cartData = useSelector(selectCart).cartData;
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const sessionTicketItems = useSessionTicketItems();

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
      (
        count: number,
        item: {
          productId: string;
          quantity?: number;
          productName?: { en?: string };
        },
      ) => {
        const matchById = item.productId === product.productId;
        const cartProductName = item.productName?.en || "";
        const plpProductName = name?.en || "";
        const matchByName =
          cartProductName.startsWith(plpProductName) ||
          cartProductName === plpProductName ||
          plpProductName.startsWith(cartProductName);
        if (matchByName || matchById) {
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

  const effectiveBasePrice = primaryVariant?.basePrice ?? basePrice;
  const effectiveDiscountedPrice =
    primaryVariant?.discountedPrice ?? discountedPrice;

  const basePriceFormat = formatCurrency({ amount: effectiveBasePrice });
  const discountedPriceFormat = formatCurrency({
    amount: effectiveDiscountedPrice,
  });

  const offerSource = pickBestOfferByFlow(product, isQrFlowActive);
  const bestOffer =
    !!offerSource && offerSource?.offerType > 0 && offerSource?.offerType < 5
      ? offerSource
      : null;

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

  const showOfferTag =
    !isExcludedFromOffer &&
    (!!selectedItemsBadgeText || (!!bestOffer && bestOffer.offerType !== 4));

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

  const card = (
    <div
      className={`group bg-[var(--tertiary-background)] md:bg-[var(--cards-containers)] rounded-lg overflow-hidden  pb-[10px] h-full flex flex-col  ${productCartCount > 0 ? "border border-[var(--primary-color)]" : "border border-[var(--borders-dividers)]"}`}
    >
      <div className="relative w-full flex justify-center itmes-center">
        {/* Cart Count Badge - Top Left */}
        {productCartCount > 0 && (
          <div className="absolute top-0 left-0 z-[2] bg-[var(--button-primary-background)] text-[var(--button-primary-text)] font-bold px-2 py-1 min-w-[39px] h-[39px] rounded-br-md flex items-center justify-center">
            <span className="heading-5">{productCartCount}</span>
          </div>
        )}

        {/* Loyalty always on top; offer badges stacked below when applicable */}
        {(showLoyaltyTag || isExcludedFromOffer || showOfferTag) && (
          <div className="absolute bottom-2 left-2 z-[2] flex flex-col items-start gap-1">
            {showLoyaltyTag && (
              <div className="flex items-center gap-1 bg-[#A03DFB] text-[var(--white)] font-semibold px-2 py-1 rounded-lg shadow-md loyalty-label">
                <span className="extra-small-font md-heading-6 font-semibold uppercase truncate">
                  {lang.earn}
                </span>
                <img
                  src={COIN_ICON}
                  alt="loyalty points"
                  title="loyalty points"
                  className="w-4 h-4"
                />
                <span className="extra-small-font md-heading-6 font-semibold uppercase truncate">
                  {loyaltyPoints} {lang.pts}
                </span>
              </div>
            )}
            {isExcludedFromOffer ? (
              <div className="flex items-center gap-1 bg-[#F9E2DE] text-[#C4645D] font-semibold px-3 py-1 rounded-lg shadow-md">
                <span className="extra-small-font font-semibold uppercase">
                  {lang.notInOffer}
                </span>
              </div>
            ) : selectedItemsBadgeText ? (
              <div className="flex items-center gap-1 bg-[var(--offer-type-2-bg)] text-[var(--offer-type-2-text)] font-semibold px-2 py-1 rounded-md shadow-md">
                {!!bestOffer && (
                  <Icon
                    icon={`${OFFER_TYPE_ICON}#offers`}
                    width={12}
                    height={12}
                    viewBox="0 0 15 15"
                    color={getOfferTheme(bestOffer).text}
                    className="w-3 h-3"
                  />
                )}
                <span className="extra-small-font md-heading-6 font-semibold uppercase truncate">
                  {selectedItemsBadgeText}
                </span>
              </div>
            ) : (
              showOfferTag && (
                <div className="flex items-center gap-1 bg-[var(--accent-color)] text-[var(--white)] font-semibold px-2 py-1 rounded-md shadow-md offer-label">
                  <img
                    src={OFFER_LABEL_ICON}
                    alt="offers"
                    title="offers"
                    className="w-4 h-4"
                  />
                  <span className="extra-small-font md-heading-6 font-semibold uppercase truncate">
                    {lang?.offer}
                  </span>
                </div>
              )
            )}
          </div>
        )}

        <div className="flex w-full justify-center items-center overflow-hidden relative z-[1]">
          {media?.[0]?.url ? (
            <img
              ref={imgRef}
              title={name?.en}
              src={
                generateImageBase64FromUrl({
                  url: media?.[0]?.url,
                  width: 315,
                  height: 315,
                })?.fullEncodedUrl ||
                generateImageBase64FromUrl({
                  url: tenantConfig.productPlaceholderImageUrl || "",
                  width: 315,
                  height: 315,
                })?.fullEncodedUrl ||
                ""
              }
              alt={name?.en}
              width={315}
              height={315}
              className="object-cover aspect-square transition-transform duration-300 ease-out group-hover:scale-110"
              fetchPriority="high"
            />
          ) : (
            <img
              ref={imgRef}
              src={
                generateImageBase64FromUrl({
                  url: tenantConfig.productPlaceholderImageUrl || "",
                  width: 315,
                  height: 315,
                })?.fullEncodedUrl
              }
              alt={name?.en}
              width={315}
              height={315}
              className="object-cover aspect-square transition-transform duration-300 ease-out group-hover:scale-110"
              fetchPriority="high"
            />
          )}
        </div>
      </div>
      <div className="py-1 w-full px-[10px]">
        {/* Dietary Indicator */}
        <DietaryIndicator
          containsMeat={!!containsMeat}
          containerClassName="md:pb-3"
        />
        <h3 className="product-name-clamp">{name?.en}</h3>
        {shouldShowRatingCaloriesRow && (
          <div className="flex gap-1 md:gap-2 pt-1">
            {/* Rating Section */}
            {hasRatingOrReviews && (
              <ProductRating
                rating={rating}
                overallRatings={overallRatings}
                className=""
              />
            )}
            {/* {!!totalPrepTime && (
          <div className="hidden md:flex items-center gap-1 mt-1">
            {hasRatingOrReviews && <span className="self-center text-sm h-1 w-1 rounded-full bg-[var(--secondary-text)]"></span>}
            <ClockIcon width={14} height={14} />
            <span className="text-[var(--secondary-text)] small-font md:heading-5">{totalPrepTime} {lang.mins}</span>
          </div>
        )} */}

            {hasCalories && (
              <>
                {hasRatingOrReviews && (
                  <span className="self-center text-sm h-1 w-1 rounded-full bg-[var(--secondary-text)]"></span>
                )}
                <div className="flex items-center gap-1 text-nowrap">
                  <img
                    src={`${KCAL_ICON}#kcal`}
                    alt="kcal"
                    className="kcal-icon w-3 h-3 md:w-4 md:h-4"
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

        <div className="flex justify-between items-end md:mt-2">
          <div>
            {!!discountedPrice ? (
              <div className="flex flex-wrap items-center">
                {tenantConfig.showStrikethroughPrice && (
                  <span className="scratch-price text-[var(--secondary-text)] line-through mr-1">
                    {basePriceFormat}
                  </span>
                )}
                <span className="product-price mr-1">
                  {discountedPriceFormat}
                  {/* {bestOffer?.offerName?.en && bestOffer?.discountConfig?.value
                    ? formatCurrency({amount: discountedPrice - bestOffer.discountConfig.value})
                    : discountedPriceFormat} */}
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
                    </span>
                  ) : (
                    ""
                  )}
                */}
              </div>
            ) : (
              <>
                {!!variantsBestOffer && offerTextVariantElem() ? (
                  offerTextVariantElem()
                ) : !!bestOffer ? (
                  <>
                    <span className="product-price">{basePriceFormat}</span>
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
                    <span className="product-price">{basePriceFormat}</span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .product-name-clamp {
          font-size: var(--heading-h4);
          font-weight: var(--font-semi-bold);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.2;
        }
        .product-price {
          font-size: var(--heading-h4);
          font-weight: var(--font-semi-bold);
        }
        .scratch-price {
          font-size: var(--heading-h4);
        }
        @media (max-width: 768px) {
          .product-price {
            font-size: var(--small-font);
            font-weight: var(--font-semi-bold);
          }
          .scratch-price {
            font-size: var(--small-font);
          }
          .product-name-clamp {
            font-size: var(--description-font);
          }
          .offer-label img {
            width: 14px !important;
            height: 14px !important;
          }
          .offer-label span {
            font-size: 11px !important;
          }
          .loyalty-label img {
            width: 14px !important;
            height: 14px !important;
          }
          .loyalty-label span {
            font-size: 11px !important;
          }
        }
      `}</style>
    </div>
  );

  return (
    <div className="isolate grid [&>*]:col-start-1 [&>*]:row-start-1">
      {productLink ? (
        <Link
          href={productLink}
          onClick={onProductClick}
          className="min-w-0 block cursor-pointer"
          prefetch
        >
          {card}
        </Link>
      ) : (
        card
      )}
      <div className="z-[3] m-2 justify-self-end self-start pointer-events-none">
        <WishlistButton
          product={{
            id: product.productId || "",
            name: name?.en || "",
            price: effectiveBasePrice,
            imageUrl: media?.[0]?.url,
            totalLikes: product.totalLikes || 0,
          }}
          className="pointer-events-auto w-8 h-8"
          showCount={false}
          classNameWhenCountShown="!w-14 md:!w-16"
        />
      </div>
    </div>
  );
};
