"use client";

import React, { useEffect, useState } from "react";
import { getTenantConfig } from '@config/tenant.config';
import type { TypesenseProduct } from '@services/typesense/types';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { PopularItemsSectionProps } from './fields';
import SliderNavigation from '@components/ui/SliderNavigation';
import useSwiperNavigation from '@hooks/useSwiperNavigation';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Link from "next/link";
import useIsMobile from "@hooks/useIsMobile";
import { truncateToFixed } from "utils/string-operations";
import AnimatedArrow from "@components/icons/AnimatedArrow";
import useMenuModal from "@hooks/useMenuModal";
import { useProductStoreAvailability } from "@hooks/products/useProductStoreAvailability";
import { useRouter } from "next/navigation";
import formatCurrency from "@lib/helper/price";
import useProductUrl from "@hooks/useProductUrl";
import useAnalytics from "@hooks/useAnalytics";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import useHomePageData from "@hooks/homepage/useHomePageData";
import { isTimeZone } from "@lib/helper";
import type { RestaurantData } from "@components/type/store.types";
import DietaryIndicator from "@components/ui/DietaryIndicator";
import StarIcon from "@components/icons/Star";

// Temporary simple image component for debugging
const SimpleImageWithFallback: React.FC<{
  src: string | undefined;
  alt: string;
  className?: string;
}> = ({ src, alt, className }) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasErrored, setHasErrored] = useState(false);

  const handleError = () => {
    if (!hasErrored) {
      setHasErrored(true);
      setCurrentSrc('/images/placeholder/no-category-placeholder.svg');
    }
  };
  
  useEffect(() => {
    setCurrentSrc(src);
    setHasErrored(false);
  }, [src]);

  const imageUrl = currentSrc || '/images/placeholder/no-category-placeholder.svg';
  
  return (
    <img 
      src={imageUrl}
      alt={alt}
      title={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};

/** Display data for a popular item card derived from TypesenseProduct */
export interface PopularItemDisplayData {
  displayName: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  basePrice: number;
  discountedPrice: number;
  calories: number;
  containsMeat: boolean | undefined;
}

/** Single helper: derives all display fields for a TypesenseProduct used in the popular items card */
export function getProductDisplayData(product: TypesenseProduct): PopularItemDisplayData {
  const tenantConfig = getTenantConfig();
  const imageBaseUrl = tenantConfig?.imageBaseUrl ?? '';
  const primaryImage = product?.media?.find((m) => m.metadata?.isPrimary) ?? product?.media?.[0];
  const primaryImageUrl = primaryImage?.url ?? '';
  const imageUrl = primaryImageUrl
    ? primaryImageUrl.startsWith('http')
      ? primaryImageUrl
      : imageBaseUrl + (primaryImageUrl.startsWith('/') ? '' : '/') + primaryImageUrl
    : tenantConfig?.productPlaceholderImageUrl ?? '/images/placeholder/no-category-placeholder.svg';

  const name = product?.name;
  const displayName = !name
    ? 'Unknown Product'
    : typeof name === 'string'
      ? name
      : name.en ?? name[Object.keys(name)[0]] ?? 'Unknown Product';

  const basePrice = product?.basePrice ?? 0;
  const rawDiscounted = product?.discountedPrice ?? 0;
  const discountedPrice = rawDiscounted > 0 && rawDiscounted < basePrice ? rawDiscounted : 0;

  return {
    displayName,
    imageUrl,
    rating: product?.overallRatings?.average ?? product?.rating?.average ?? 0,
    reviewCount: product?.overallRatings?.totalReview ?? product?.rating?.count ?? 0,
    basePrice,
    discountedPrice,
    calories: product?.nutritionInfo?.values?.calories ?? 0,
    containsMeat: product?.productAttributes?.containsMeat,
  };
}

/** Helper to get the effective slug from a TypesenseProduct (used in navigation) */
export const getProductSlug = (product: TypesenseProduct): string => {
  return product?.seo?.urlManagement?.customSlug ?? product?.slug ?? product?.productCategorySlug ?? '';
};

function getSwiperSettings(isMobile: boolean) {
  if (isMobile) {
    return {
      loop: false,
      autoplay: false, // disables autoplay
      speed: 1000,
      freeMode: false,
    };
  } else {
    return {
      loop: true,
      autoplay: {
        delay: 500, // 0.5 seconds between slides - smooth slow movement
        disableOnInteraction: false, // Keep running after user interaction
        pauseOnMouseEnter: true, // Pause when hovering
        reverseDirection: false,
      },
      speed: 8000, // 8 seconds smooth transition
      freeMode: false, // Disable free mode for smooth autoplay
      allowTouchMove: true,
    };
  }
}

export default function PopularItemsSection(props: PopularItemsSectionProps & { items?: TypesenseProduct[] }) {
  const { 
    basicContent,
    styling,
    advanceSettings,
    items = [],
  } = props;

  // ALL HOOKS MUST BE CALLED FIRST - before any conditional logic
  const isMobile = useIsMobile();
  const { swiperRef, onPrevClick, onNextClick, isBeginning, isEnd } = useSwiperNavigation();
  const { 
    fetchProductStores
  } = useProductStoreAvailability();
  const router = useRouter();
  const { handleOpenMenuModal } = useMenuModal();
  const { getCartItemProductUrl } = useProductUrl();
  const { trackPopularItemClicked } = useAnalytics();
  const pathname = usePathname();
  const location = useSelector((state: RootState) => state.location) as { latitude: number; longitude: number };
  const { storeData } = useHomePageData(location?.latitude ?? 0, location?.longitude ?? 0, isTimeZone());
  const tenantConfig = getTenantConfig();

  // Force Swiper to update on mount and when items change
  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.update();
    }
  }, [items, swiperRef]);

  // Extract loading and error from advanceSettings
  const loading = advanceSettings?.loading || false;
  const error = advanceSettings?.error || null;

  // Extract values from the new structure
  const title = basicContent?.title;
  const subtitle = basicContent?.subtitle;
  const button = basicContent?.button;
  const layout = styling?.layout;
  const spacing = styling?.spacing;
  const typography = styling?.typography;
  const card = styling?.card;
  const buttonStyling = styling?.button;
  const slider = advanceSettings?.slider;
  const buttonSettings = advanceSettings?.buttonSettings;
  const accessibility = advanceSettings?.accessibility;



  /**
   * Pauses the Swiper autoplay when user interacts with the slider
   * Autoplay will resume automatically to maintain continuous slow sliding
   */
  const handleStopAutoplay = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      const swiper = swiperRef.current.swiper;
      
      // Pause autoplay temporarily if it's running
      if (swiper.autoplay && swiper.autoplay.running) {
        swiper.autoplay.pause();
        
        // Resume autoplay after 2 seconds to continue smooth sliding
        setTimeout(() => {
          if (swiper.autoplay && !swiper.autoplay.running) {
            swiper.autoplay.start();
            console.log('Autoplay resumed - continuous slow sliding');
          }
        }, 2000);
      }
    }
  };


  // Use a simple CSS class name
  const cssClassName = "popular-items-section";

  // CSS custom properties for dynamic values with proper fallbacks
  const cssVariables = {
    // Layout and spacing
    '--layout-background-color': layout?.backgroundColor || 'transparent',
    '--layout-max-width': layout?.maxWidth || '1200px',
    '--layout-mobile-max-width': layout?.mobile?.maxWidth || '100%',
    '--layout-mobile-background-color': layout?.mobile?.backgroundColor || 'transparent',
    '--spacing-padding': spacing?.padding || '50px 20px',
    '--spacing-margin': spacing?.margin || '0',
    '--spacing-mobile-padding': spacing?.mobile?.padding || '24px 16px',
    '--spacing-mobile-margin': spacing?.mobile?.margin || '0',

    // Typography
    '--title-font-size': typography?.title?.fontSize || '36px',
    '--title-mobile-font-size': typography?.title?.mobile?.fontSize || '32px',
    '--title-font-weight': typography?.title?.fontWeight || '700',
    '--title-color': typography?.title?.color || 'var(--primary-text)',
    '--title-line-height': typography?.title?.lineHeight || '1.2',
    '--title-alignment': typography?.title?.alignment || 'center',
    '--title-mobile-font-weight': typography?.title?.mobile?.fontWeight || '700',
    '--title-mobile-color': typography?.title?.mobile?.color || 'var(--primary-text)',
    '--title-mobile-line-height': typography?.title?.mobile?.lineHeight || '1.2',
    '--title-mobile-alignment': typography?.title?.mobile?.alignment || 'center',

    '--subtitle-font-size': typography?.subtitle?.fontSize || '18px',
    '--subtitle-mobile-font-size': typography?.subtitle?.mobile?.fontSize || '16px',
    '--subtitle-font-weight': typography?.subtitle?.fontWeight || '500',
    '--subtitle-color': typography?.subtitle?.color || 'var(--secondary-text)',
    '--subtitle-line-height': typography?.subtitle?.lineHeight || '1.4',
    '--subtitle-alignment': typography?.subtitle?.alignment || 'center',
    '--subtitle-mobile-font-weight': typography?.subtitle?.mobile?.fontWeight || '500',
    '--subtitle-mobile-color': typography?.subtitle?.mobile?.color || 'var(--secondary-text)',
    '--subtitle-mobile-line-height': typography?.subtitle?.mobile?.lineHeight || '1.4',
    '--subtitle-mobile-alignment': typography?.subtitle?.mobile?.alignment || 'center',

    // Card styling
    '--card-image-height': card?.imageHeight || '320px',
    '--card-border-radius': card?.borderRadius || '12px',
    '--card-padding': card?.padding || '16px',
    '--card-product-name-lines': card?.productName?.lines || 1,
    '--card-product-name-font-size': card?.productName?.fontSize || '16px',
    '--card-product-name-font-weight': card?.productName?.fontWeight || '700',
    '--card-rating-gap': card?.rating?.gap || '4px',
    '--card-rating-font-size': card?.rating?.fontSize || '16px',
    '--card-rating-font-weight': card?.rating?.fontWeight || '400',
    '--card-price-font-size': card?.price?.fontSize || '18px',
    '--card-price-font-weight': card?.price?.fontWeight || '700',

    // Mobile card styling
    '--card-mobile-image-height': card?.mobile?.imageHeight || '200px',
    '--card-mobile-border-radius': card?.mobile?.borderRadius || '8px',
    '--card-mobile-padding': card?.mobile?.padding || '12px',
    '--card-mobile-product-name-lines': card?.mobile?.productName?.lines || 2,
    '--card-mobile-product-name-font-size': card?.mobile?.productName?.fontSize || '14px',
    '--card-mobile-rating-gap': card?.mobile?.rating?.gap || '2px',
    '--card-mobile-rating-font-size': card?.mobile?.rating?.fontSize || '12px',
    '--card-mobile-rating-font-weight': card?.mobile?.rating?.fontWeight || '700',
    '--card-mobile-price-font-size': card?.mobile?.price?.fontSize || '14px',
    '--card-mobile-price-font-weight': card?.mobile?.price?.fontWeight || '700',

    // Button styling
    '--button-height': buttonStyling?.height || 'auto',
    '--button-width': buttonStyling?.width || 'auto',
    '--button-background-color': buttonStyling?.backgroundColor || 'var(--button-primary-background)',
    '--button-text-color': buttonStyling?.textColor || 'var(--button-primary-text)',
    '--button-border-radius': buttonStyling?.borderRadius || '8px',
    '--button-font-size': buttonStyling?.fontSize || '16px',
    '--button-font-weight': buttonStyling?.fontWeight || '600',
    '--button-padding': buttonStyling?.padding || '12px 24px',
    '--button-border-color': buttonStyling?.borderColor || 'transparent',
    '--button-hover-background-color': buttonStyling?.hoverBackgroundColor || 'var(--cta-hover)',

    // Mobile button styling
    '--button-mobile-height': buttonStyling?.mobile?.height || 'auto',
    '--button-mobile-width': buttonStyling?.mobile?.width || 'auto',
    '--button-mobile-background-color': buttonStyling?.mobile?.backgroundColor || 'var(--button-primary-background)',
    '--button-mobile-text-color': buttonStyling?.mobile?.textColor || 'var(--button-primary-text)',
    '--button-mobile-border-radius': buttonStyling?.mobile?.borderRadius || '6px',
    '--button-mobile-font-size': buttonStyling?.mobile?.fontSize || '14px',
    '--button-mobile-font-weight': buttonStyling?.mobile?.fontWeight || '600',
    '--button-mobile-padding': buttonStyling?.mobile?.padding || '10px 20px',
    '--button-mobile-border-color': buttonStyling?.mobile?.borderColor || 'transparent',
    '--button-mobile-hover-background-color': buttonStyling?.mobile?.hoverBackgroundColor || 'var(--cta-hover)',
 
    // Slider styling (convert to string for CSS variables)
    '--slider-web-slides-per-view': slider?.breakpoints?.web?.slidesPerView || 5.125  ,
    '--slider-mobile-slides-per-view': slider?.breakpoints?.mobile?.slidesPerView || 1.25,
  } as React.CSSProperties;

  // Do not render section at all if there was an error (e.g. 404) and no items
  if (error && (!items || items.length === 0)) {
    return <></>;
  }

  // Show loading state
  if (loading) {
    return (
      <>
        <section className={cssClassName} style={cssVariables}>
          <div className="section-container">
            <div className="section-header">
              <h2 className="popular-items-section-title">
                {title}
              </h2>
              <p className="section-subtitle">
                {subtitle}
              </p>
            </div>
            <div className="loading-container">
              <div className="loader">Loading popular items...</div>
            </div>
          </div>
        </section>
        <style>{`
          .popular-items-section {
            width: 100%;
            padding: var(--spacing-padding);
            margin: var(--spacing-margin);
            background-color: var(--layout-background-color);
            box-sizing: border-box;
            max-width: var(--layout-max-width);
            margin-left: auto;
            margin-right: auto;
          }
          
          .section-container {
            width: 100%;
          }
          
          .section-header {
            margin-bottom: 2rem;
            text-align: var(--title-alignment);
          }
          
          .popular-items-section-title {
            font-size: var(--title-font-size);
            font-weight: var(--title-font-weight);
            color: var(--title-color);
            text-align: var(--title-alignment);
            margin-bottom: 0.5rem;
            margin-top: 0;
            line-height: var(--title-line-height);
          }
          
          .section-subtitle {
            font-size: var(--subtitle-font-size);
            font-weight: var(--subtitle-font-weight);
            color: var(--subtitle-color);
            text-align: var(--subtitle-alignment);
            margin-bottom: 1rem;
            margin-top: 0;
            line-height: var(--subtitle-line-height);
          }
          
          .loading-container, 
          .error-container, 
          .empty-container {
            min-height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 2rem;
          }
          
          .loader {
            font-size: 1.1rem;
            color: #6b7280;
          }

          @media (max-width: 768px) {
            .popular-items-section {
              padding: var(--spacing-mobile-padding);
              margin: var(--spacing-mobile-margin);
              max-width: var(--layout-mobile-max-width);
              background-color: var(--layout-mobile-background-color);
            }
            .popular-items-section-title {
              font-size: var(--title-mobile-font-size);
              font-weight: var(--title-mobile-font-weight);
              color: var(--title-mobile-color);
              line-height: var(--title-mobile-line-height);
              text-align: var(--title-mobile-alignment);
            }
            .section-subtitle {
              font-size: var(--subtitle-mobile-font-size);
              font-weight: var(--subtitle-mobile-font-weight);
              color: var(--subtitle-mobile-color);
              line-height: var(--subtitle-mobile-line-height);
              text-align: var(--subtitle-mobile-alignment);
            }
          }
        `}</style>
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <section className={cssClassName} style={cssVariables}>
          <div className="section-container">
            <div className="section-header">
              <h2 className="popular-items-section-title">
                {title}
              </h2>
              <p className="section-subtitle">
                {subtitle}
              </p>
            </div>
            <div className="error-container">
              <p className="error-message">Error loading popular items: {error}</p>
            </div>
          </div>
        </section>
        <style>{`
          .popular-items-section {
            width: 100%;
            padding: var(--spacing-padding);
            margin: var(--spacing-margin);
            background-color: var(--layout-background-color);
            box-sizing: border-box;
            max-width: var(--layout-max-width);
            margin-left: auto;
            margin-right: auto;
          }
          
          .section-container {
            width: 100%;
          }
          
          .section-header {
            margin-bottom: 2rem;
            text-align: var(--title-alignment);
          }
          
          .popular-items-section-title {
            font-size: var(--title-font-size);
            font-weight: var(--title-font-weight);
            color: var(--title-color);
            text-align: var(--title-alignment);
            margin-bottom: 0.5rem;
            margin-top: 0;
            line-height: var(--title-line-height);
          }
          
          .section-subtitle {
            font-size: var(--subtitle-font-size);
            font-weight: var(--subtitle-font-weight);
            color: var(--subtitle-color);
            text-align: var(--subtitle-alignment);
            margin-bottom: 1rem;
            margin-top: 0;
            line-height: var(--subtitle-line-height);
          }
          
          .loading-container, 
          .error-container, 
          .empty-container {
            min-height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 2rem;
          }
          
          .error-message {
            color: #ef4444;
          }

          @media (max-width: 768px) {
            .popular-items-section {
              padding: var(--spacing-mobile-padding);
              margin: var(--spacing-mobile-margin);
              max-width: var(--layout-mobile-max-width);
              background-color: var(--layout-mobile-background-color);
            }
            .popular-items-section-title {
              font-size: var(--title-mobile-font-size);
              font-weight: var(--title-mobile-font-weight);
              color: var(--title-mobile-color);
              line-height: var(--title-mobile-line-height);
              text-align: var(--title-mobile-alignment);
            }
            .section-subtitle {
              font-size: var(--subtitle-mobile-font-size);
              font-weight: var(--subtitle-mobile-font-weight);
              color: var(--subtitle-mobile-color);
              line-height: var(--subtitle-mobile-line-height);
              text-align: var(--subtitle-mobile-alignment);
            }
          }
        `}</style>
      </>
    );
  }

  // Don't render section if no items
  if (!items || items.length === 0) {
    return <></>;
  }

  const swiperSettings = getSwiperSettings(isMobile);

  /**
   * Handles product store navigation based on available stores and linked menus
   * 
   * Navigation Logic:
   * 1. Single store + No linked menus: Direct redirect to products page
   * 2. Single store + Has linked menus: Show menu selection modal
   * 3. Multiple stores: Show store selection modal
   * 
   * @param productId - The unique identifier for the product
   * @param productDetails - Optional product details containing linked menus and SEO data
   */
  const handleGetProductStore = async (productId: string, productDetails?: TypesenseProduct) => {
    // Extract and validate required data from product details
    const linkedMenus = productDetails?.linkedMenus || [];
    const productCategorySlug = productDetails?.productCategorySlug || '';
    const slug = productDetails ? getProductSlug(productDetails) : '';
    
    // Get URL management configuration with fallback to basic slug
    const urlManagement = productDetails?.seo?.urlManagement || {
      canonicalUrl: '',
      currentUrl: '',
      customSlug: slug,
      urlPattern: ''
    };
    
    try {
      // Fetch available stores for this product
      const response = await fetchProductStores(productId);
      const stores = Array.isArray(response?.data) ? response.data : (response?.data?.data || []);
      
      // Extract store slug - handles both string and object formats
      const getStoreSlug = (store: string | { storeSlug?: string; slug?: string } | undefined): string => {
        if (!store) return '';
        if (typeof store === 'string') return store;
        return store.storeSlug || store.slug || '';
      };
      
      const firstStoreSlug = getStoreSlug(stores[0]);
      
      // Early return if no stores found
      if (!stores.length || !firstStoreSlug) {
        return;
      }

      // Case 1: Single store with no linked menus - direct navigation to PDP
      if (stores.length === 1 && linkedMenus.length === 0) {
        const productsUrl = getCartItemProductUrl(
          urlManagement.customSlug,
          productCategorySlug || '',
          '',
          firstStoreSlug
        );
        router.push(productsUrl);
        return;
      }

      // Case 2: Single store with exactly one linked menu - direct navigation to PDP (no modal)
      if (stores.length === 1 && linkedMenus.length === 1 && linkedMenus[0]?.menuSlug) {
        const productsUrl = getCartItemProductUrl(
          urlManagement.customSlug,
          productCategorySlug || '',
          linkedMenus[0].menuSlug,
          firstStoreSlug
        );
        router.push(productsUrl);
        return;
      }

      // Normalize store slugs and detect if user is on a store page (e.g. /paris-panini-bengaluru-indiranagar)
      const normalizedStores = stores.map((store: string | { storeSlug?: string; slug?: string }) => getStoreSlug(store)).filter(Boolean) as string[];
      const currentStoreSlug = (pathname || "").replace(/^\//, "").split("/")[0] || "";
      const isOnStorePage = currentStoreSlug && normalizedStores.includes(currentStoreSlug);

      // Case 3: On a store page and product is in multiple stores – use only current store
      if (stores.length >= 2 && isOnStorePage) {
        // 3a: One menu → direct redirect to current store's PDP
        if (linkedMenus.length <= 1) {
          const menuSlug = linkedMenus.length === 1 ? linkedMenus[0].menuSlug : "";
          const productsUrl = getCartItemProductUrl(
            urlManagement.customSlug,
            productCategorySlug || "",
            menuSlug,
            currentStoreSlug
          );
          router.push(productsUrl);
          return;
        }
        // 3b: Multiple menus → if only one store + one menu would be shown (after menu-period filter), redirect to PDP
        const restaurantData: RestaurantData[] = Array.isArray(storeData?.data) ? storeData.data : [];
        const availableForModal = [currentStoreSlug];
        let filteredStores = restaurantData.filter((r: RestaurantData) => availableForModal.includes(r.slug));
        if (linkedMenus.length > 0) {
          const linkedSlugs = linkedMenus.map((m) => m.menuSlug.toLowerCase());
          filteredStores = filteredStores.filter((r: RestaurantData) =>
            r.menuPeriods?.some((p: { slug?: string }) => linkedSlugs.includes((p.slug || "").toLowerCase()))
          );
        }
        if (filteredStores.length === 1 && linkedMenus.length === 1) {
          const productsUrl = getCartItemProductUrl(
            urlManagement.customSlug,
            productCategorySlug || "",
            linkedMenus[0].menuSlug,
            filteredStores[0].slug
          );
          router.push(productsUrl);
          return;
        }
        const modalPropsData = {
          productId,
          availableStores: [currentStoreSlug],
          productCategorySlug,
          linkedMenus,
          slug,
          urlManagement,
        };
        handleOpenMenuModal(modalPropsData);
        return;
      }

      // Case 4: Homepage (show all stores) OR single store with multiple menus – show modal
      const shouldShowModal =
        (stores.length === 1 && linkedMenus.length > 1) || (stores.length >= 2 && !isOnStorePage);

      if (shouldShowModal) {
        // If after menu-period filter only one store and one menu would be shown, redirect to PDP
        const restaurantDataForModal: RestaurantData[] = Array.isArray(storeData?.data) ? storeData.data : [];
        let filteredStoresForModal = restaurantDataForModal.filter((r: RestaurantData) =>
          normalizedStores.includes(r.slug)
        );
        if (linkedMenus.length > 0) {
          const linkedSlugs = linkedMenus.map((m) => m.menuSlug.toLowerCase());
          filteredStoresForModal = filteredStoresForModal.filter((r: RestaurantData) =>
            r.menuPeriods?.some((p: { slug?: string }) => linkedSlugs.includes((p.slug || "").toLowerCase()))
          );
        }
        if (filteredStoresForModal.length === 1 && linkedMenus.length === 1) {
          const productsUrl = getCartItemProductUrl(
            urlManagement.customSlug,
            productCategorySlug || "",
            linkedMenus[0].menuSlug,
            filteredStoresForModal[0].slug
          );
          router.push(productsUrl);
          return;
        }
        const modalPropsData = {
          productId,
          availableStores: normalizedStores,
          productCategorySlug,
          linkedMenus,
          slug,
          urlManagement,
        };
        handleOpenMenuModal(modalPropsData);
      }
    } catch {
      // Log error with context for debugging

      // Optionally show user-friendly error message
      // toast.error('Unable to load store information. Please try again.');
    }
  }

  return (
    <>
      <section 
        className={cssClassName}
        style={cssVariables}
        role={accessibility?.role || "region"}
        aria-label={accessibility?.ariaLabel || "Popular items section"}
      >
        <div className="section-container">
          <div className="section-header flex flex-col md:gap-6 gap-5">
            <h2 className="popular-items-section-title capitalize">
              {title}
            </h2>
            <p className="section-subtitle">
              {subtitle}
            </p>
            {buttonSettings?.showButton && button && (
              <div className="view-menu-container flex justify-center ">
                {button.actionType === "openMenu" ? (
                  <button
                    type="button"
                    className="view-menu-button group"
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpenMenuModal();
                    }}
                  >
                    {button.text}
                    <AnimatedArrow direction="right" />
                  </button>
                ) : (
                  <Link
                    href={button.link || '#'} 
                    className="view-menu-button group"
                    target={buttonSettings.target || "_self"}
                    rel={buttonSettings.rel || "noopener noreferrer"}
                  >
                    {button.text}
                    <AnimatedArrow direction="right" />
                  </Link>
                )}
              </div>
            )}
          </div>
        
          <div className="slider-container">
           
            <Swiper
              ref={swiperRef}
              modules={[Navigation, Pagination, Autoplay]}
              {...swiperSettings}
              spaceBetween={isMobile ? slider?.breakpoints?.mobile?.spaceBetween || 15 : slider?.breakpoints?.web?.spaceBetween || 20}
              slidesPerView={isMobile ? slider?.breakpoints?.mobile?.slidesPerView || 1.5 : slider?.breakpoints?.web?.slidesPerView || 5.125}
              pagination={false}
              breakpoints={{
                320: {
                  slidesPerView: slider?.breakpoints?.mobile?.slidesPerView || 1.5,
                  spaceBetween: slider?.breakpoints?.mobile?.spaceBetween || 15,
                },
                480: {
                  slidesPerView: slider?.breakpoints?.mobile?.slidesPerView || 1.5,
                  spaceBetween: slider?.breakpoints?.mobile?.spaceBetween || 18,
                },
                640: {
                  slidesPerView: 2.2,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 2.8,
                  spaceBetween: 22,
                },
                1024: {
                  slidesPerView: slider?.breakpoints?.web?.slidesPerView || 5.125,
                  spaceBetween: slider?.breakpoints?.web?.spaceBetween || 20,
                },
                1200: {
                  slidesPerView: slider?.breakpoints?.web?.slidesPerView || 5.125,
                  spaceBetween: slider?.breakpoints?.web?.spaceBetween || 20,
                },
               
              }}
              className="items-swiper"
              key={isMobile ? "mobile" : "desktop"}
            >
              {items.map((item: TypesenseProduct, index: number) => {
                const { displayName, imageUrl, rating, reviewCount, basePrice, discountedPrice, calories, containsMeat } =
                  getProductDisplayData(item);

                return (
                <SwiperSlide key={item.productId ? `${item.productId}-${index}` : index}>
                  <div className="item-card">
                    <div 
                      className="item-image"
                      onClick={async () => {
                        // Stop autoplay when user clicks on item
                        handleStopAutoplay();
                        // Track popular item clicked
                        const source = pathname === "/" ? "homepage" : (pathname || "homepage");
                        const price = discountedPrice > 0 ? discountedPrice : basePrice;
                        await trackPopularItemClicked({
                          source,
                          list_name: "Popular Items",
                          product_id: item.productId || "",
                          product_name: displayName,
                          price,
                          currency: tenantConfig.currencyCode || "INR",
                        });
                        // Handle product navigation
                        handleGetProductStore(item.productId || '', item);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <SimpleImageWithFallback 
                        src={imageUrl} 
                        alt={displayName}
                        className="item-img"
                      />
                    </div>

                    <div className="item-content">
                      {containsMeat !== undefined && (
                        <DietaryIndicator 
                          containsMeat={containsMeat} 
                          containerClassName="!pb-2"
                          size={{ width: 16, height: 16 }}
                        />
                      )}
                      <h3 
                        className="item-name" 
                        style={{ minHeight: 24 }}
                        onClick={async () => {
                          // Stop autoplay when user clicks on item name
                          handleStopAutoplay();
                          // Track popular item clicked
                          const source = pathname === "/" ? "homepage" : (pathname || "homepage");
                          const price = discountedPrice > 0 ? discountedPrice : basePrice;
                          await trackPopularItemClicked({
                            source,
                            list_name: "Popular Items",
                            product_id: item.productId || "",
                            product_name: displayName,
                            price,
                            currency: tenantConfig.currencyCode || "INR",
                          });
                          // Handle product navigation
                          handleGetProductStore(item.productId || '', item);
                        }}
                      >
                        {displayName || <span style={{ opacity: 0 }}>No Name</span>}
                      </h3>
                      {(() => {
                        const showCalories = tenantConfig.showCaloriesInfo && calories > 0;
                        return (rating > 0) || (reviewCount > 0) || showCalories ? (
                           <div className="item-rating flex items-center flex-wrap gap-1" style={{ minHeight: 24 }}>
                           {rating > 0 ? (
                            <span className="rating-stars flex items-center">
                               <span className='star-filled'>
                                 <StarIcon className="w-4 h-4"/>
                               </span>
                               <span className="rating-text px-1">
                                {truncateToFixed(rating, 2)}
                               </span>
                               {(reviewCount > 0) || showCalories ? (
                                 <span className="rating-text mx-1">|</span>
                               ) : null}
                             </span>
                           ) : (
                             null
                           )}
                           {reviewCount > 0 ? (
                             <>
                               <span className="rating-text pl-0">
                                 {reviewCount} {reviewCount > 1 ? 'Reviews' : 'Review'}
                               </span>
                               {showCalories ? (
                                 <span className="circle mx-1" />
                               ) : null}
                             </>
                           ) : (
                            null
                           )}
                           {showCalories ? (
                             <span className="calories-info flex items-center gap-1">
                               <img src="/images/review/kcal-icon.svg" alt="calories" width={12} height={14} />
                               <span className="rating-text">{calories} Kcal</span>
                             </span>
                           ) : null}
                         </div>
                      ) : (
                        null
                      );
                      })()}
                      <div className="item-price" style={{ minHeight: `${(rating > 0 || reviewCount > 0) || (tenantConfig.showCaloriesInfo && calories > 0) ? '24px' : '59px'}` }}>
                        {discountedPrice > 0 ? (
                          <div className="flex flex-wrap items-center gap-1">
                            {tenantConfig.showStrikethroughPrice && (
                              <span className="scratch-price text-[var(--secondary-text)] line-through mr-1">{formatCurrency({amount: basePrice})}</span>
                            )}
                            <span className="product-price mr-1">{formatCurrency({amount: discountedPrice})}</span>
                          </div>
                        ) : (
                          <span className="product-price">{formatCurrency({amount: basePrice})}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                );
              })}
            </Swiper>
            
            {/* Slider Navigation */}
            <SliderNavigation
              onPrevClick={() => {
                handleStopAutoplay();
                onPrevClick();
              }}
              onNextClick={() => {
                handleStopAutoplay();
                onNextClick();
              }}
              disabled={isBeginning && isEnd}
              size="md"
              variant="default"
              hideOnMobile={false}
              hideOnWeb={true}
            />
          </div>
        </div>
      </section>
      <style>{`
        .popular-items-section {
          width: 100%;
          padding: var(--spacing-padding);
          margin: var(--spacing-margin);
          background-color: var(--layout-background-color);
          box-sizing: border-box;
          max-width: var(--layout-max-width);
          margin-left: auto;
          margin-right: auto;
        }
        
        .section-container {
          width: 100%;
        }
        
        .section-header {
          margin-bottom: 2rem;
          text-align: var(--title-alignment);
        }
        
        .popular-items-section-title {
          font-size: var(--title-font-size);
          font-weight: var(--title-font-weight);
          color: var(--title-color);
          text-align: var(--title-alignment);
          margin-top: 0;
          line-height: var(--title-line-height);
        }
        
        .section-subtitle {
          font-size: var(--subtitle-font-size);
          font-weight: var(--subtitle-font-weight);
          color: var(--subtitle-color);
          text-align: var(--subtitle-alignment);
          margin-top: 0;
          line-height: var(--subtitle-line-height);
        }

        .view-menu-button {
          height: var(--button-height);
          width: var(--button-width);
          color: var(--button-text-color);
          background-color: var(--button-background-color);
          border-radius: var(--button-border-radius);
          padding: var(--button-padding);
          border: 1px solid var(--button-border-color);
          font-size: var(--button-font-size);
          font-weight: var(--button-font-weight);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          text-decoration: none;
          cursor: pointer;
        }

        .view-menu-button:hover {
           transform: translateY(-1px);
           background: var(--button-hover-background-color);
         }
        
        .slider-container {
          position: relative;
          padding: 1.25rem 0 0;
          overflow: hidden;
          width: 100%;
        }
        
        .items-swiper {
          overflow: visible;
          width: 100%;
          // padding-bottom: 3.75rem;
        }
        
        .item-card {
          background: var(--cards-containers);
          border-radius: var(--card-border-radius);
          border:1px solid var(--rating-border-primary);
          overflow: hidden;
          height: 100%;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          margin: 0;
        }
        
        .item-image {
          height: var(--card-image-height);
          overflow: hidden;
          position: relative;
          cursor: pointer;
        }
        
        .item-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }
        
        .item-card:hover .item-img {
          transform: scale(1.05);
        }
        
        .item-content {
          padding: var(--card-padding);
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .item-name {
          font-size: var(--card-price-font-size);
          font-weight: var(--card-product-name-font-weight);
          color: var(--primary-text);
          margin-bottom: 0.5rem;
          display: -webkit-box;
          -webkit-line-clamp: var(--card-product-name-lines);
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
          cursor: pointer;
        }
        
        .item-rating {
          display: flex;
          align-items: center;
          gap: var(--card-rating-gap);
          margin-bottom: 0.5rem;
        }
        
        .rating-stars {
          font-size: var(--card-rating-font-size);
          font-weight: var(--card-rating-font-weight);
          
        }

        .circle {
          display: inline-block;
          height: 5px;
          width: 5px;
          border-radius: 100%;
          background-color: var(--secondary-text);
        }
        
        .rating-text {
          font-size: var(--card-rating-font-size);
          color: var(--secondary-text);
          font-weight: 400;
        }

        .calories-info {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .item-price {
          font-size: var(--card-price-font-size);
          font-weight: var(--card-price-font-weight);
          color: var(--primary-text);
        }
        
        .scratch-price {
          font-size: 16px;
          color: var(--secondary-text);
          text-decoration: line-through;
          font-weight: 500;

        }
        
        .product-price {
          font-size: var(--card-price-font-size);
          font-weight: var(--card-price-font-weight);
          color: var(--primary-text);
          font-weight: 500;
        }

        .loading-container, 
        .error-container, 
        .empty-container {
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
        }
        
        .loader {
          font-size: 1.1rem;
          color: #6b7280;
        }
        
        .error-message {
          color: #ef4444;
        }
        
        .empty-message {
          color: #6b7280;
        }

          .items-swiper .swiper-slide {
             width: calc(100% / var(--slider-web-slides-per-view)) !important;
            margin-right: ${slider?.breakpoints?.web?.spaceBetween}px !important;
          }
        
        @media (max-width: 768px) {
          .popular-items-section {
            padding: var(--spacing-mobile-padding);
            margin: var(--spacing-mobile-margin);
            max-width: var(--layout-mobile-max-width);
            background-color: var(--layout-mobile-background-color);
            overflow-x: hidden !important;
          }
          
          .popular-items-section-title {
            font-size: var(--title-mobile-font-size);
            font-weight: var(--title-mobile-font-weight);
            color: var(--title-mobile-color);
            line-height: var(--title-mobile-line-height);
            text-align: var(--title-mobile-alignment);
          }
          
          .section-subtitle {
            font-size: var(--subtitle-mobile-font-size);
            font-weight: var(--subtitle-mobile-font-weight);
            color: var(--subtitle-mobile-color);
            line-height: var(--subtitle-mobile-line-height);
            text-align: var(--subtitle-mobile-alignment);
          }
          
          .view-menu-button {
            height: var(--button-mobile-height);
            width: var(--button-mobile-width);
            background-color: var(--button-mobile-background-color);
            color: var(--button-mobile-text-color);
            border-radius: var(--button-mobile-border-radius);
            font-size: var(--button-mobile-font-size);
            font-weight: var(--button-mobile-font-weight);
            padding: var(--button-mobile-padding);
            border-color: var(--button-mobile-border-color);
          }

          .view-menu-button:hover {
            background: var(--button-mobile-hover-background-color) !important;
          }

          .section-header {
             margin-bottom: 1.5rem !important;
           }

          .item-card {
            margin: 0;
            width: 100%;
            max-width: none;
          }
          
          .slider-container {
            margin: 0;
            padding: 0; 
          }

          .item-image {
            height: var(--card-mobile-image-height);
          }

          .item-content {
            padding: var(--card-mobile-padding);
          }

          .item-name {
            font-size: var(--card-mobile-product-name-font-size);
            -webkit-line-clamp: var(--card-mobile-product-name-lines) !important;
          }

          .item-rating {
            gap: var(--card-mobile-rating-gap);
          }

          .rating-stars,
          .rating-text {
            font-size: var(--card-mobile-rating-font-size);
            font-weight: var(--card-mobile-rating-font-weight);
          }

          .item-price {
            font-size: var(--card-mobile-price-font-size);
            font-weight: var(--card-mobile-price-font-weight);
          }
          
          .scratch-price {
            font-size: var(--card-mobile-rating-font-size);
          }
          
          .product-price {
            font-size: var(--card-mobile-price-font-size);
            font-weight: var(--card-mobile-price-font-weight);
          }
          .slider-container {
            margin-right: -16px !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            overflow: visible !important;
          }
          .items-swiper {
            margin-right: 0;
            margin-left: 0;
            padding-bottom: 1.5rem !important;
          }
          .item-card {
            margin: 0;
            width: 100%;
          }
          .items-swiper .swiper-slide {
             width: calc(100% / var(--slider-mobile-slides-per-view)) !important;
             margin-right: ${slider?.breakpoints?.mobile?.spaceBetween}px !important;
          }
        }
      `}</style>  
    </>
  );
}   