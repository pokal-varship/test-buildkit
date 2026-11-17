import dynamic from "next/dynamic";
// import Link from "next/link";
import Breadcrumb from "@components/breadcrumb/BreadCrumb";
import Icon from "@components/image/Icons";
import ShowMoreTextContainer from "@components/ShowMoreTextContainer";
import { MediaType, ProductResponse, Variant } from "@components/type/pdp.type";
import { CROSS_ICON, KCAL_ICON, COIN_ICON } from "@config/Header/image.config";
import ClockIcon from "@components/icons/ClockIcon";
import CaloriesPdpIcon from "@components/icons/CaloriesPdpIcon";
import tenantConfig from "@config/tenant.config";
import useLang from "@hooks/useLang";
import { generateImageBase64FromUrl } from "@lib/helper/ImageGen/imageGen";
import formatCurrency from "@lib/helper/price";
import { RootState } from "@redux/store";
import { selectIsQrFlowActive } from "@redux/slices/qrFlowSlice";
// import { syncTypesenseLikeCount } from "@redux/slices/wishlistSlice";
import { StoreCartData } from "@services/storePage";
import { DiscountOffer } from "@services/typesense";
import { useParams, useSearchParams } from "next/navigation";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import type { Swiper as SwiperCore } from "swiper";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { LanguageCode, TranslationKeys } from "types";
import MediaIndicator from "./MediaIndicator";
import MediaModal from "./MediaModal";
import OfferCard from "./OfferCard";
import SideBarGallery from "./SideBarGallery";
import TabChange, { hasTabData } from "./TabChange";
import StarIcon from "@components/icons/Star";
import DietaryIndicator from '@components/ui/DietaryIndicator';
import { getAllMediaUrl } from "./productConfig";
import AllMediaModal from './product-reviews/AllMediaModal';
import WishlistButton from "@components/ui/WishlistButton";
import useProductUrl from "@hooks/useProductUrl";
import { slugToName } from "@lib/breadcrumbHelper";
import useIsMobile from "@hooks/useIsMobile";
import CustomDialog from "@components/dialogDrawer/dialog";
import PrepTimeContent from "./PrepTimeContent";
import { formatOfferBannerSuffixText, getOfferTheme, pickBestOfferByFlow } from "@lib/offers/selectOffers";
import { useLoyaltyPointsRate, fetchLoyaltyPointsRate } from "@hooks/useLoyaltyPointsRate";
const VideoPlayer = dynamic(() => import("./VideoPlayer"), { ssr: false });

type SideBarProps = {
  productData: ProductResponse | null;
  selectedVariant: Variant | null;
  menuId: string | null | undefined;
  handleScrollToReviewsSection: () => void;
  handlePlpRedirect: () => void;
  cartData: StoreCartData | null;
};

const SideBar: FC<SideBarProps> = ({
  productData,
  selectedVariant,
  menuId,
  handleScrollToReviewsSection,
  handlePlpRedirect,
  // cartData
}) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const isMobile = useIsMobile();
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const store = useSelector((state: RootState) => state.store);
  const searchParams = useSearchParams();
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  // const sessionTicketItems = useSelector(selectSessionTicketItems);
  // const draftTicketsItemCountSum = useSelector(selectDraftTicketItemCount);
  const isReviewTab = searchParams?.get("reviewTab") === "true";
  const isComboFromUrl = searchParams?.get("combo") === "true";
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [showPrepTimeDialog, setShowPrepTimeDialog] = useState(false);
  const productNameRef = useRef<HTMLHeadingElement | null>(null);
  const swiperRef = useRef<SwiperCore | null>(null);
  // const cartItemsCount =
  // isQrFlowActive
  // ? (draftTicketsItemCountSum > 0
  //     ? draftTicketsItemCountSum
  //     : sessionTicketItems?.length || 0): (cartData?.data?.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0);
  const { getMenuUrl, getCategoryUrl } = useProductUrl();

  const renderScratchPrice = (
    price: string,
    className = "scratch-price text-[var(--secondary-text)] line-through mr-1",
  ) =>
    tenantConfig.showStrikethroughPrice ? (
      <span className={className}>{price}</span>
    ) : null;
  
  /** Match PLP + ProductOptions footer: selected variant, else listing-aligned variant, else product-level. */
  const variantForPrice = useMemo((): Variant | null => {
    if (selectedVariant) return selectedVariant;
    const variants = productData?.data?.variants;
    if (!productData?.data?.type?.hasVariants || !variants?.length) return null;
    const listingDiscounted = productData?.data?.discountedPrice;
    const listingBase = productData?.data?.basePrice;
    const match = variants.find(
      (v) =>
        (listingDiscounted != null && v.discountedPrice === listingDiscounted) ||
        (listingDiscounted == null &&
          listingBase != null &&
          v.basePrice === listingBase),
    );
    return match ?? variants[0] ?? null;
  }, [
    selectedVariant,
    productData?.data?.variants,
    productData?.data?.type?.hasVariants,
    productData?.data?.discountedPrice,
    productData?.data?.basePrice,
  ]);

  const effectivePrices = useMemo(() => {
    const basePrice =
      variantForPrice?.basePrice ?? productData?.data?.basePrice ?? 0;
    const discountedPrice =
      variantForPrice?.discountedPrice ?? productData?.data?.discountedPrice;
    return { basePrice, discountedPrice };
  }, [
    variantForPrice?.basePrice,
    variantForPrice?.discountedPrice,
    productData?.data?.basePrice,
    productData?.data?.discountedPrice,
  ]);

  const basePriceFormat = formatCurrency({
    amount: effectivePrices.basePrice,
  });
  const discountedPriceFormat = formatCurrency({
    amount: effectivePrices.discountedPrice,
  });
  const variantWithOffer = productData?.data?.variants?.find((v) =>
    !!pickBestOfferByFlow(
      v as unknown as { bestOfferRemote?: DiscountOffer; bestOfferInStore?: DiscountOffer },
      isQrFlowActive
    )
  );
  const variantsBestOffer =
    pickBestOfferByFlow(
      variantWithOffer as unknown as { bestOfferRemote?: DiscountOffer; bestOfferInStore?: DiscountOffer } | null,
      isQrFlowActive
    ) ?? null;
  const offerSource = pickBestOfferByFlow(
    productData?.data as unknown as { bestOfferRemote?: DiscountOffer; bestOfferInStore?: DiscountOffer } | null,
    isQrFlowActive
  );
  const bestOffer =
    !!offerSource && offerSource?.offerType > 0 && offerSource?.offerType <= 5
      ? offerSource
      : null;

  /** Match ProductOptions desktop banner: first variant offer, orderContext gate, then product-level offer. */
  const bestOfferToShow = useMemo((): DiscountOffer | undefined => {
    let offerFromVariant: DiscountOffer | undefined;
    const firstVariant = productData?.data?.variants?.[0];
    if (firstVariant) {
      offerFromVariant = pickBestOfferByFlow(
        firstVariant as unknown as {
          bestOfferRemote?: DiscountOffer;
          bestOfferInStore?: DiscountOffer;
        },
        isQrFlowActive
      );
      if (offerFromVariant) {
        const orderContext = (offerFromVariant.orderContext ?? "").toUpperCase();
        if (!orderContext) {
          offerFromVariant = undefined;
        } else if (isQrFlowActive && orderContext !== "IN_STORE") {
          offerFromVariant = undefined;
        } else if (!isQrFlowActive && orderContext !== "REMOTE") {
          offerFromVariant = undefined;
        }
      }
    }

    let offerFromProduct = pickBestOfferByFlow(
      productData?.data as unknown as {
        bestOfferRemote?: DiscountOffer;
        bestOfferInStore?: DiscountOffer;
      } | null,
      isQrFlowActive
    );
    if (offerFromProduct) {
      const orderContext = (offerFromProduct.orderContext ?? "").toUpperCase();
      if (!orderContext) {
        offerFromProduct = undefined;
      } else if (isQrFlowActive && orderContext !== "IN_STORE") {
        offerFromProduct = undefined;
      } else if (!isQrFlowActive && orderContext !== "REMOTE") {
        offerFromProduct = undefined;
      }
    }

    return offerFromVariant ?? offerFromProduct;
  }, [isQrFlowActive, productData?.data]);
  const [mediaItems, setMediaItems] = useState<MediaType[]>([]);
  const params = useParams();
  const { allReviewsForMedia } = useSelector((state: RootState) => state.productReviews);
  const mediaData = useMemo(() => getAllMediaUrl(allReviewsForMedia), [allReviewsForMedia]);
  const [isAllMediaModalOpen, setIsAllMediaModalOpen] = useState(false);

  const  storeSlugFromStore  = store?.currentStore?.slug || "";

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // entry.isIntersecting is true when in viewport
        setShowStickyHeader(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "-1px 0px 0px 0px", // fire when it's almost at top
      }
    );

    if (productNameRef.current) {
      observer.observe(productNameRef.current);
    }

    return () => {
      if (productNameRef.current) {
        observer.unobserve(productNameRef.current);
      }
    };
  }, []);

  // Assuming media is an array of objects with type and url
  const mediaItemsArr = useMemo(() => {
    return (
      productData?.data?.media?.map((item, idx) => ({
        id: idx,
        media: item.url || item.value,
        type: item.type,
        url: item.url,
        thumbnail: item.metadata?.thumbnail,
      })) || []
    );
  }, [productData]);

  // Preload the main product image (400x400)
  useEffect(() => {
    if (mediaItemsArr.length > 0) {
      mediaItemsArr.forEach((mediaItem, mindex) => {
        const preloadUrl = generateImageBase64FromUrl({
          url: mediaItem?.type.startsWith("image/")
            ? mediaItem?.url
            : mediaItem?.thumbnail || "",
          width: 400,
          height: 400,
          quality: 90,
        })?.fullEncodedUrl;
        if (preloadUrl) {
          const preloadLink = document.createElement("link");
          preloadLink.rel = "preload";
          preloadLink.as = "image";
          preloadLink.href = preloadUrl;
          document.head.appendChild(preloadLink);
        }
        if(mindex === mediaItemsArr?.length - 1) {
          setMediaItems(mediaItemsArr.map((item) => ({
            ...item,
            value: item.media,
          })));
        }
      });
    }
  }, [mediaItemsArr]);

  const breadcrumbItems = useMemo(() => {
    const pathMenuRaw = params?.menuSlug;
    const pathMenuSlug =
      (Array.isArray(pathMenuRaw) ? pathMenuRaw[0] : pathMenuRaw) || "";
    // Query `?menu=` (PLP) or path segment /[store]/[menuSlug]/… (canonical PDP / cart edit)
    const menuSlugStr = menuId || pathMenuSlug;
    const categorySlug = productData?.data?.productCategorySlug || params?.categorySlug as string || '';
    const menuBreadcrumbLabel =
      !menuSlugStr
        ? ""
        : menuId
          ? String(menuId === "all-day" ? "All Day" : menuId)
          : slugToName(menuSlugStr);
    
    return [
      { label: "Home", link: "/", isLink: true },
      {
        label: String(store?.currentStore?.name || ""),
        link: getMenuUrl(menuSlugStr, storeSlugFromStore),
        isLink: true,
      },
      {
        label: menuBreadcrumbLabel,
        link: getMenuUrl(menuSlugStr, storeSlugFromStore),
        isLink: true,
      },
      {
        label: String(productData?.data.productCategoryName || params?.categorySlug || ""),
        isLink: true,
        link: getCategoryUrl(categorySlug, menuSlugStr, storeSlugFromStore),
      },
      { label: String(productData?.data.name || ""), isLink: false },
    ];
  }, [productData, menuId, store, params, getMenuUrl, getCategoryUrl, storeSlugFromStore]);

  const calories = selectedVariant
    ? selectedVariant?.nutritionInfo?.values?.calories
    : productData?.data?.nutritionInfo?.values?.calories;
  const energyValue =
    tenantConfig.showCaloriesInfo && calories && typeof calories === "number"
      ? `${calories} ${lang.kcal}`: "";
  const preparationDetails = productData?.data?.preparationDetails;
  const totalPrepTime = preparationDetails?.totalTime;
  const cookingTime = preparationDetails?.cookingTime;
  const preparationTime = preparationDetails?.preparationTime;

  // Check if there's any data to display in TabChange
  const hasTabDataValue = useMemo(() => {
    return hasTabData(productData, selectedVariant, calories);
  }, [productData, selectedVariant, calories]);
  const offerText = (discountedPrice: number) => {
    if (
      bestOffer?.offerType === 1 &&
      discountedPrice >= bestOffer?.discountConfig?.minimumSpendValue
    ) {
      return "+ BOGO";
    } else if (bestOffer?.offerType === 2) {
      const discountType = bestOffer?.discountConfig?.type || undefined;
      const discountValue = bestOffer?.discountConfig?.value;
      if (discountType && discountValue && discountType === 1) {
        return `+ ${discountValue}% OFF`;
      } else if (discountType && discountValue && discountType === 2) {
        return `+ ${formatCurrency({ amount: Number(discountValue) })} OFF`;
      }
    } else if (bestOffer?.offerType === 3) {
      const discountType = bestOffer?.discountConfig?.discountType || undefined;
      const discountValue = bestOffer?.discountConfig?.discountValue;
      if (discountType && discountValue && discountType === 1) {
        return `+ ${discountValue}% OFF`;
      } else if (discountType && discountValue && discountType === 2) {
        return `+ ${formatCurrency({ amount: Number(discountValue) })} OFF`;
      }
    } else if (
      bestOffer?.offerType === 5 &&
      discountedPrice >= bestOffer?.discountConfig?.minimumSpendValue
    ) {
      return "+ FREE ITEM";
    }
  };

  const offerTextVariant = (discountedPrice: number) => {
    if (
      variantsBestOffer?.offerType === 1 &&
      discountedPrice >= variantsBestOffer?.discountConfig?.minimumSpendValue
    ) {
      return "+ BOGO";
    } else if (variantsBestOffer?.offerType === 2) {
      const discountType = variantsBestOffer?.discountConfig?.type || undefined;
      const discountValue = variantsBestOffer?.discountConfig?.value;
      if (discountType && discountValue && discountType === 1) {
        return `+ ${discountValue}% OFF`;
      } else if (discountType && discountValue && discountType === 2) {
        return `+ ${formatCurrency({ amount: Number(discountValue) })} OFF`;
      }
    } else if (variantsBestOffer?.offerType === 3) {
      const discountType =
        variantsBestOffer?.discountConfig?.discountType || undefined;
      const discountValue = variantsBestOffer?.discountConfig?.discountValue;
      if (discountType && discountValue && discountType === 1) {
        return `+ ${discountValue}% OFF`;
      } else if (discountType && discountValue && discountType === 2) {
        return `+ ${formatCurrency({ amount: Number(discountValue) })} OFF`;
      }
    } else if (
      variantsBestOffer?.offerType === 5 &&
      discountedPrice >= variantsBestOffer?.discountConfig?.minimumSpendValue
    ) {
      return "+ FREE ITEM";
    }
  };

  const offerTextVariantElem = (basePrice: number | undefined) => {
    if (variantsBestOffer?.offerType === 1) {
      return (
        <>
          <span className="product-price">{basePriceFormat}</span>
          {!!(
            +basePriceFormat >=
            variantsBestOffer?.discountConfig?.minimumSpendValue
          ) && (
            <span className="ml-1 bg-[var(--success)] text-[10px] md:text-xs text-[var(--white)] rounded-[3px] md:rounded-[5px] px-1 py-[3px]">
              + BOGO
            </span>
          )}
        </>
      );
    } else if (variantsBestOffer?.offerType === 2) {
      const discountType = variantsBestOffer?.discountConfig?.type || undefined;
      const discountValue = variantsBestOffer?.discountConfig?.value;
      if (discountType && discountValue && discountType === 1) {
        return (
          <>
            {renderScratchPrice(basePriceFormat)}
            <span className="product-price">
              {basePrice &&
                formatCurrency({
                  amount: basePrice - (basePrice * Number(discountValue)) / 100,
                })}
            </span>
          </>
        );
      } else if (discountType && discountValue && discountType === 2) {
        return (
          <>
            {renderScratchPrice(basePriceFormat)}
            <span className="product-price">
              {basePrice &&
                formatCurrency({ amount: basePrice - discountValue })}
            </span>
          </>
        );
      }
    } else if (variantsBestOffer?.offerType === 3) {
      const discountType =
        variantsBestOffer?.discountConfig?.discountType || undefined;
      const discountValue = variantsBestOffer?.discountConfig?.discountValue;
      if (discountType && discountValue && discountType === 1) {
        return (
          <>
            {renderScratchPrice(basePriceFormat)}
            <span className="product-price">
              {basePrice &&
                formatCurrency({
                  amount: basePrice - (basePrice * Number(discountValue)) / 100,
                })}
            </span>
          </>
        );
      } else if (discountType && discountValue && discountType === 2) {
        return (
          <>
            {renderScratchPrice(basePriceFormat)}
            <span className="product-price">
              {basePrice &&
                formatCurrency({ amount: basePrice - discountValue })}
            </span>
          </>
        );
      }
    } else if (variantsBestOffer?.offerType === 5) {
      return (
        <>
          <span className="product-price">{basePriceFormat}</span>
          {!!(
            +basePriceFormat >=
            variantsBestOffer?.discountConfig?.minimumSpendValue
          ) && (
            <span className="ml-1 bg-[var(--success)] text-[10px] md:text-xs text-[var(--white)] rounded-[3px] md:rounded-[5px] px-1 py-[3px]">
              + FREE ITEM
            </span>
          )}
        </>
      );
    }
  };

  const offerTextElem = (basePrice: number) => {
    if (bestOffer?.offerType === 1) {
      return (
        <>
          <span className="product-price">{basePriceFormat}</span>
          {!!(
            +basePriceFormat >= bestOffer?.discountConfig?.minimumSpendValue
          ) && (
            <span className="ml-1 bg-[var(--success)] text-[10px] md:text-xs text-[var(--white)] rounded-[3px] md:rounded-[5px] px-1 py-[3px]">
              + BOGO
            </span>
          )}
        </>
      );
    } else if (bestOffer?.offerType === 2) {
      const discountType = bestOffer?.discountConfig?.type || undefined;
      const discountValue = bestOffer?.discountConfig?.value;
      if (discountType && discountValue && discountType === 1) {
        return (
          <>
            {renderScratchPrice(basePriceFormat)}
            <span className="product-price">
              {formatCurrency({
                amount: basePrice - (basePrice * Number(discountValue)) / 100,
              })}
            </span>
          </>
        );
      } else if (discountType && discountValue && discountType === 2) {
        return (
          <>
            {renderScratchPrice(basePriceFormat)}
            <span className="product-price">
              {formatCurrency({ amount: basePrice - discountValue })}
            </span>
          </>
        );
      }
    } else if (bestOffer?.offerType === 3) {
      const discountType = bestOffer?.discountConfig?.discountType || undefined;
      const discountValue = bestOffer?.discountConfig?.discountValue;
      if (discountType && discountValue && discountType === 1) {
        return (
          <>
            {renderScratchPrice(basePriceFormat)}
            <span className="product-price">
              {formatCurrency({
                amount: basePrice - (basePrice * Number(discountValue)) / 100,
              })}
            </span>
          </>
        );
      } else if (discountType && discountValue && discountType === 2) {
        return (
          <>
            {renderScratchPrice(basePriceFormat)}
            <span className="product-price">
              {formatCurrency({ amount: basePrice - discountValue })}
            </span>
          </>
        );
      }
    } else if (bestOffer?.offerType === 5) {
      return (
        <>
          <span className="product-price">{basePriceFormat}</span>
          {!!(
            +basePriceFormat >= bestOffer?.discountConfig?.minimumSpendValue
          ) && (
            <span className="ml-1 bg-[var(--success)] text-[10px] md:text-xs text-[var(--white)] rounded-[3px] md:rounded-[5px] px-1 py-[3px]">
              + FREE ITEM
            </span>
          )}
        </>
      );
    }
  };

  const handleShowAllMedia = () => setIsAllMediaModalOpen(true);

  const { rate: defaultPointsRate, setRate: setPointsRate, canEarnLoyalty, setCanEarnLoyalty } = useLoyaltyPointsRate();
  useEffect(() => {
    fetchLoyaltyPointsRate().then(({ rate, canEarnLoyalty }) => {
      setPointsRate(rate);
      setCanEarnLoyalty(canEarnLoyalty);
    });
  }, [setPointsRate, setCanEarnLoyalty]);
  const loyaltyPoints = useMemo(() => {
    if (defaultPointsRate) {
      const price =
        effectivePrices.discountedPrice || effectivePrices.basePrice || 0;
      if (price > 0) {
        const calculated = Math.floor(price * defaultPointsRate);
        if (calculated > 0) return calculated;
      }
    }
    const pts = productData?.data?.loyaltyPoints;
    if (pts != null && Number.isFinite(pts) && pts > 0) return pts;
    return null;
  }, [
    effectivePrices.discountedPrice,
    effectivePrices.basePrice,
    defaultPointsRate,
    productData?.data?.loyaltyPoints,
  ]);
  const showLoyaltyBadge =
    canEarnLoyalty && loyaltyPoints != null && loyaltyPoints > 0;

  const loyaltyBadgeBaseClass =
    "flex items-center gap-1 rounded-md px-1 md:px-2 py-0.5 md:py-1 loyalty-label";

  const renderLoyaltyBadge = (placement: "overlay" | "inline" = "overlay") =>
    showLoyaltyBadge ? (
      <div
        className={
          placement === "overlay"
            ? `absolute left-2 top-2 z-10 max-w-[calc(100%-1rem)] hidden md:flex bg-[var(--loyalty-badge-bg)] ${loyaltyBadgeBaseClass}`
            : `w-fit max-w-full bg-[#A03DFB1A]
] ${loyaltyBadgeBaseClass}`
        }
        aria-label={`Earn ${loyaltyPoints} loyalty points`}
      >
        <span className="extra-small-font md-heading-6 font-semibold uppercase tracking-tight text-[var(--loyalty-badge-bg)] md:text-[var(--white)] shrink-0">
          EARN
        </span>
        <img
          src={COIN_ICON}
          alt=""
          width={16}
          height={16}
          className="h-2.5 md:h-4 w-2.5 md:w-4 shrink-0"
        />
        <span className="truncate extra-small-font md-heading-6 font-semibold uppercase text-[var(--loyalty-badge-bg)] md:text-[var(--white)]">
          {loyaltyPoints} PTS
        </span>
      </div>
    ) : null;

  return (
    <div className={`left-side-bar w-full md:w-[40%] xl:w-[30%] h-full md:h-screen md:max-h-screen overflow-y-auto md:p-3 lg:p-10 bg-[var(--primary-background)] md:bg-[var(--primary-color)] md:text-[var(--primary-text-light)] text-[var(--primary-text)] ${isComboFromUrl ? 'md:pt-[20px]' : ''}`}>
      {showStickyHeader && (
        <div
          className={`fixed top-0 left-0 flex items-center justify-between w-full p-[15px_24px] z-50 bg-[var(--primary-background)] text-[var(--primary-text)] header-text md:hidden ${
            isReviewTab ? "hidden" : ""
          }`}
        >
          <div className="flex items-center w-[88%]">
            <div className="mr-5">
              <Icon
                icon={`${CROSS_ICON}#cross`}
                width={20}
                height={20}
                color={"var(--primary-text)"}
                viewBox="0 0 16 16"
                onClick={handlePlpRedirect}
              />
            </div>
            <div className="truncate">{productData?.data.name}</div>
          </div>
          {/* <Link href={getCartUrl()} prefetch={true} className="relative">
            <Icon
              icon={`${CART_ICON}#cart-mobile`}
              width={20}
              height={20}
              color={"var(--primary-text)"}
              viewBox="0 0 17 17"
              className=""
            />
            {cartItemsCount > 0 && (
                <div className="cart-count-badge-header">
                    {cartItemsCount > 99 ? '99+' : cartItemsCount < 10 ? '0' + cartItemsCount : cartItemsCount}
                </div>
            )}
          </Link> */}
        </div>
      )}

      <div className={`${isReviewTab ? "hidden md:block" : ""}`}>
        <Breadcrumb
          containerClassName="hidden md:block"
          items={breadcrumbItems || []}
        />
        <Swiper
          modules={[Pagination]}
          slidesPerView={1}
          pagination={{ clickable: true }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            swiper.slideTo(currentIndex);
          }}
          initialSlide={currentIndex}
          onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
          className="relative md:mt-4"
        >

          {!!mediaItems.length ? (
            mediaItems.map((item, index) => (
              <SwiperSlide key={index}>
                {item.type?.startsWith("video") ? (
                  <div 
                    className="relative md:rounded-[10px] w-full h-full aspect-square cursor-pointer overflow-hidden"
                    onDoubleClick={() => setShowModal(true)}
                    style={{ height: '100%', }}
                  >
                    {index === 0 && renderLoyaltyBadge()}
                    <VideoPlayer
                      videoUrl={item?.url || item?.media || ""}
                      thumbnail={item?.thumbnail}
                      type={item?.type}
                      className="md:rounded-[10px] w-full h-full"
                      isActive={true}
                      index={index}
                    />
                  </div>
                ) : (
                  <div 
                    className="relative md:rounded-[10px] w-full h-full aspect-square cursor-pointer overflow-hidden"
                    onClick={() => setShowModal(true)}
                    style={{ height: '100%',}}
                  >
                    {index === 0 && renderLoyaltyBadge()}
                    <img
                      fetchPriority="high"
                      decoding="async"
                      className="w-full h-full object-cover"
                      alt={`${productData?.data.name || "Product"} image ${
                        index + 1
                      }`}
                      src={
                        isComboFromUrl 
                          ? (item.url || item.thumbnail || "") // Combo PDP: Direct URL
                          : generateImageBase64FromUrl({      // Normal PDP: Original method
                              url: item.type?.startsWith("image") || item.type?.startsWith("image/")
                                ? item?.url || item?.media || item?.value || ""
                                : item?.thumbnail || "",
                              width: 400,
                              height: 400,
                              quality: 90,
                            })?.fullEncodedUrl || ""
                      }
                      width={400}
                      height={400}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 'inherit'
                      }}
                    />
                  </div>
                )}
              </SwiperSlide>
            ))
          ) : (
            <div 
              className="relative md:rounded-[10px] w-full h-full aspect-square cursor-pointer overflow-hidden"
              style={{ height: '100%'}}
            >
              {renderLoyaltyBadge()}
              <img
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover"
                alt={`Placeholder Image`}
                src={
                  generateImageBase64FromUrl({
                    url: tenantConfig.productPlaceholderImageUrl || "",
                    width: 400,
                    height: 400,
                    quality: 90,
                  })?.fullEncodedUrl || ""
                }
                width={400}
                height={400}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 'inherit'
                }}
              />
            </div>
          )}
        </Swiper>

        {mediaItems.length > 1 && <div className="flex w-full justify-center overflow-x-auto py-3 bg-transparent">
          <MediaIndicator
            items={mediaItems}
            activeIndex={currentIndex}
            onSelect={(index) => {
              setCurrentIndex(index);
              swiperRef.current?.slideTo(index);
            }}
          />
        </div>}
        <div className="md:mt-5 bg-[var(--primary-background)] md:bg-transparent p-4 pb-0 md:p-0 mobile-border-after">
          <div className="flex items-center justify-between w-full">
            <div>
              <DietaryIndicator
                containsMeat={!!productData?.data?.productAttributes?.containsMeat}
                containerClassName="items-center justify-center"
                imageClassName="w-4 h-4 md:w-5 md:h-5"
              />
            </div>

            {/* Wishlist Button */}
            <WishlistButton
              product={{
              id: productData?.data?.id?.split('-')[0] || productData?.data?.id || '',
              name: productData?.data?.name || '',
              price: productData?.data?.basePrice || 0,
              imageUrl: mediaItems?.[0]?.url || '',
              totalLikes: Number(productData?.data?.totalLikes) || 0, // Ensure it's a number
            }}
            showCount={true}
            className="relative z-10 w-8 h-8"
            classNameWhenCountShown="!w-16"
            />
          </div>

          <h1
            ref={productNameRef}
            className="font-600 heading-4 md-heading-2 leading-tight"
          >
            {productData?.data.name}
          </h1>         
          {((!!productData?.data?.overallRatings?.average || !!productData?.data?.overallRatings?.totalReview) || !!energyValue || !!totalPrepTime) && (
            <div
              className="rating cursor-pointer pt-2 md:pt-3 flex items-center gap-2"
            >
              {((productData?.data?.overallRatings?.average ?? 0) > 0 || (productData?.data?.overallRatings?.totalReview ?? 0) > 0) && (
                <div 
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={handleScrollToReviewsSection}
                >
                  {(productData?.data?.overallRatings?.average ?? 0) > 0 && (
                    <>
                      <StarIcon pathFillColor="var(--primary-text-light)" borderColor="var(--primary-text-light)" className="hidden md:block" />
                      <StarIcon className=" md:hidden" />
                    </>
                  )}
                  <div className="border-b border-[var(--secondary-text)] md:border-[var(--primary-text-light)] inline-flex items-center gap-1">
                    {(productData?.data?.overallRatings?.average ?? 0) > 0 && (
                      <span className="text-[var(--secondary-text)] md:text-[var(--primary-text-light)]">{productData?.data?.overallRatings?.average}</span>
                    )}
                    {(productData?.data?.overallRatings?.totalReview ?? 0) > 0 && (
                      <span className="text-[var(--secondary-text)] md:text-[var(--primary-text-light)] text-nowrap">({productData?.data?.overallRatings?.totalReview} {lang.reviews})</span>
                    )}
                  </div>
                </div>
              )}
              {totalPrepTime && (
                <>
                  {((productData?.data?.overallRatings?.average ?? 0) > 0 || (productData?.data?.overallRatings?.totalReview ?? 0) > 0) && (
                    <span className="h-1 w-1 flex-shrink-0 inline-block min-w-[4px] min-h-[4px] rounded-full bg-[var(--secondary-text)] md:bg-[var(--primary-text-light)]"></span>
                  )}
                  <div className="relative group">
                  <div 
                    className="flex items-center gap-1 cursor-pointer md:cursor-default"
                    onClick={() => {
                      if (isMobile) {
                        setShowPrepTimeDialog(true);
                      }
                    }}
                  >
                    {/* Mobile: Orange clock, Web: Black clock */}
                    <ClockIcon 
                      width={14} 
                      height={14} 
                      className="flex-shrink-0 md:hidden"
                    />
                    <ClockIcon 
                      width={14} 
                      height={14} 
                      className="flex-shrink-0 hidden md:block"
                      bgColor="var(--primary-text-light)"
                      handColor="var(--primary-color)"
                    />
                    <span className="text-nowrap text-[var(--secondary-text)] md:text-[var(--primary-text-light)] border-b border-[var(--secondary-text)] md:border-[var(--primary-text-light)]">{totalPrepTime} {lang.mins}</span>
                  </div>
                  {/* Tooltip for desktop - hover */}
                  <div className="prep-time-tooltip hidden md:block absolute left-0 top-full mt-2 bg-[var(--tertiary-background)] shadow-lg rounded-lg p-[10px] w-max min-w-48 max-w-xs z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <PrepTimeContent
                      preparationTime={preparationTime}
                      cookingTime={cookingTime}
                      totalTime={totalPrepTime}
                    />
                  </div>
                </div>
                </>
              )}
              {energyValue && (
                <>
                  {((productData?.data?.overallRatings?.average ?? 0) > 0 || (productData?.data?.overallRatings?.totalReview ?? 0) > 0 || totalPrepTime) && (
                    <span className="h-1 w-1 flex-shrink-0 inline-block min-w-[4px] min-h-[4px] rounded-full bg-[var(--secondary-text)] md:bg-[var(--primary-text-light)]"></span>
                  )}
                 <div className="flex items-center gap-1">
                  <img
                    src={`${KCAL_ICON}`}
                    alt="calories"
                    className="w-4 h-4 md:hidden"
                    width={16}
                    height={16}
                  />
                  <CaloriesPdpIcon
                    className="w-4 h-4 hidden md:block md:text-[var(--primary-text-light)]"
                    width={16}
                    height={16}
                  />
                  <span className="text-nowrap text-[var(--secondary-text)] md:text-[var(--primary-text-light)]">{energyValue}</span>
                 </div>
                </>
              )}
            </div>
          )}
          {!isComboFromUrl && (
            <div className="mt-2 md:hidden flex items-center justify-between">
              <div>
              {!!effectivePrices.discountedPrice ? (
                <>
                  <span className="text-sm md:text-base font-[var(--font-semi-bold)]">
                    {discountedPriceFormat}
                  </span>
                  {tenantConfig.showStrikethroughPrice && (
                    <span className="line-through text-[var(--secondary-text)] ml-1 text-sm md:text-base">
                      {basePriceFormat}
                    </span>
                  )}
                  {/* {!!variantsBestOffer &&
                  offerTextVariant(productData?.data?.discountedPrice) ? (
                    <span className="ml-2 bg-[var(--success)] text-[11px] text-[var(--white)] rounded-[5px] px-1 py-[2px]">
                      {offerTextVariant(productData?.data?.discountedPrice)}
                    </span>
                  ) : bestOffer &&
                    offerText(productData?.data?.discountedPrice) ? (
                    <span className="ml-2 bg-[var(--success)] text-[11px] text-[var(--white)] rounded-[5px] px-1 py-[2px]">
                      {offerText(productData?.data?.discountedPrice)}
                    </span>
                  ) : (
                    ""
                  )} */}
                </>
              ) : (
                <span className="text-sm md:text-base font-[var(--font-semi-bold)]">
                  {basePriceFormat}
                </span>
              )}
               
              {/* {!!productData?.data.discountedPrice ? (
                <>
                  <span className="line-through text-[var(--secondary-text)] mr-1 text-sm">{basePriceFormat}</span>
                  <span className="text-md font-[var(--font-semi-bold)]">{discountedPriceFormat}</span>
                  {offerTextVariant(productData?.data?.bestOffer, productData?.data?.discountedPrice)}
                </>
              ) : productData?.data?.bestOffer ?
              offerTextVariantElem(productData?.data?.bestOffer, productData?.data?.basePrice)
              : basePriceFormat && <span className="text-md font-[var(--font-semi-bold)]">{basePriceFormat}</span>} */}
            </div>
            {renderLoyaltyBadge("inline")}
            </div>
          )}
       
          <ShowMoreTextContainer
            isHtml={true}
            lineClamp={3}
            useDrawer={true}
            containsMeat={productData?.data?.productAttributes?.containsMeat}
            productName={productData?.data.name}
            rating={productData?.data?.overallRatings?.average}
            reviewCount={productData?.data?.overallRatings?.totalReview}
            energy={energyValue}
            description={productData?.data.description || ""}
            className="font-normal small-font mt-3 md:mt-4 text-[var(--primary-text)] md:text-[var(--primary-text-light)]"
            showLessClassName={'md:bg-[var(--button-primary-background)] bg-[var(--primary-background)]'}
            showMoreClassName={'px-2 ml-1 md:bg-[var(--button-primary-background)] bg-[var(--primary-background)] md:text-[var(--primary-text-light)]'}
          />
          {/* <div className="mt-5 border-t border-[var(--borders-dividers)] md:border-none"></div> */}
       
          {bestOfferToShow && (
            <div className="md:hidden mt-3">
              {(() => {
                const theme = getOfferTheme(bestOfferToShow);
                const baseTitle = bestOfferToShow?.offerName?.en;
                const suffix = formatOfferBannerSuffixText(bestOfferToShow, lang);
                const title = baseTitle
                  ? suffix
                    ? `${baseTitle} : ${suffix}`
                    : baseTitle
                  : baseTitle;
                return (
                  <OfferCard
                    offerData={bestOfferToShow}
                    containerClassName="py-1"
                    bgColor={theme.bg}
                    textColor={theme.text}
                    titleClassName={"!text-inherit"}
                    descriptionClassName="!text-inherit"
                    description={bestOfferToShow?.offerDescription?.en}
                    title={title}
                    type={0}
                  />
                );
              })()}
            </div>
          )}
        </div>

        {isReviewTab ? (
          ""
        ) : tenantConfig.showPdpProductTabs && (isMobile ? hasTabDataValue : true) ? (
          <div className="pt-3 pb-2 w-full px-4 md:px-0">           
            <TabChange
              selectedVariant={selectedVariant}
              productData={productData}
            />
          </div>
        ) : null}
      </div>
        {/* Temporarily hidden: media for reviews section
        {productData?.data?.id && mediaData.length > 0 && (
      <div className="pt-6 mt-4 border-t border-top hidden md:block">
          <>
            <h3 className="heading-3 font-semibold mb-4">{lang.mediaForReviews}</h3>
            <SideBarGallery productId={productData.data.id} variant="grid" onShowAllMedia={handleShowAllMedia} />
            <AllMediaModal
              isOpen={isAllMediaModalOpen}
              onClose={() => setIsAllMediaModalOpen(false)}
              mediaList={mediaData}
              title={lang.mediaFromReviews}
            />
          </>
      </div>
        )}
          
      {showModal && (
        <MediaModal
          handleMediaClick={(index) => {
            setCurrentIndex(index);
          }}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          mediaItems={mediaItems}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Preparation Timeline - small modal at bottom center of viewport */}
      <CustomDialog
        open={showPrepTimeDialog}
        anchor="bottom"
        type="prepTimeline"
        propsData={{
          preparationTime: preparationTime,
          cookingTime: cookingTime,
          totalTime: totalPrepTime,
        }}
        handlerDialog={() => setShowPrepTimeDialog(false)}
        handleClose={() => setShowPrepTimeDialog(false)}
        onlyDialog={true}
        sxStyle={{
          '& .MuiPaper-root': {
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            top: 'auto',
            margin: 0,
            maxWidth: 'calc(100vw - 30px)',
            width: '100%',
          },
          '& .MuiDialogContent-root': {
            padding: 0,
          },
        }}
      />

      <style>
        {`
            .rating{
              font-size: 13px !important;
            }
            .border-top{
              border-color: #E1B940
            }
              .cart-count-badge-header {
                position: absolute;
                top: -9px;
                right: -9px;
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
              .header-text{
                font-size: var(--heading-h4);
                text-transform: capitalize;
                font-weight: var(--font-semi-bold);
              } 
                .left-side-bar {
                    font-family: var(--font-family);
                    scrollbar-width: none; 
                    -ms-overflow-style: none;      
                }
                .left-side-bar::-webkit-scrollbar {
                    display: none; 
                }
                   .small-font{
                font-size: var(--small-font);
              }
              .extra-small-font {
                font-size: var(--extraSmall-font);
              }
                .description-font{
                    font-size: var(--description-font);
                }
                   .font-600{
                        font-weight: var(--font-semi-bold);
                    }
                        .heading-4{
                        font-size: var(--heading-h4);
                    }
                        @media (min-width: 768px) {
                            .md-heading-2{
                                font-size: var(--heading-h2);
                            }
                        }

                        .swiper-pagination {
                           display: none !important;
                          }
                        .mobile-border-after::after {
                          content: '';
                          display: block;
                          margin-top: 1rem;
                          padding: 0 1rem;
                          border-bottom: 1px solid var(--rating-border-primary);
                        }
                        @media (min-width: 768px) {
                          .mobile-border-after::after {
                            display: none;
                          }
                        }
                `}
      </style>
    </div>
  );
};

export default SideBar;
