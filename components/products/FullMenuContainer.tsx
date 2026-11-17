"use client";
import React, { useState, useRef, useMemo } from "react";
import { enrichWishlistProductsWithMenuData } from "utils/wishlistToTypesenseConverter";
import { TypesenseProduct } from "@services/typesense";
import { Category } from "@components/type/store.types";
import useLang from "@hooks/useLang";
import { LanguageCode, TranslationKeys } from "types";
import { useLanguage } from 'context/LanguageContext';
import { ProductContainer } from './ProductContainer';
import { useAuth } from '@hooks/useAuth';
import { useRawWishlist } from '@hooks/useRawWishlist';
import useDisableBodyScroll from '@hooks/useDisableBodyScroll';
import { FilterContainer } from './filters/FilterContainer';
import { useSession } from 'next-auth/react';
import { ExtendedSession } from '@components/header/types';
import { useFullMenuCategories, useHeaderOffset } from '@hooks/products/useFullMenuCategories';
import OrderAgain from '@components/orderagain/OrderAgain';
import { ReorderProduct } from '@components/orderagain/orderAgainType';
import { useSelector } from 'react-redux';
import { selectDineInSessionProductCount, selectIsQrFlowActive, selectSessionTablePin } from '@redux/slices/qrFlowSlice';
import Icon from '@components/image/Icons';
import { MENU_CARD_ICON } from '@config/Header/image.config';

interface FullMenuContainerProps {
  products: TypesenseProduct[];
  favouriteProducts?: TypesenseProduct[]; // Filtered favourites from Typesense API (via multiSearch)
  categories: {data: Category[]};
  loading?: boolean;
  error?: Error | null;
  storeSlug: string;
  menuSlug: string;
  reorderProducts?: ReorderProduct[];
  reorderLoading?: boolean;
  excludedFromOfferProductIds?: string[];
}

export const FullMenuContainer: React.FC<FullMenuContainerProps> = ({
  products,
  favouriteProducts: favouriteProductsFiltered = [],
  categories,
  loading,
  error,
  storeSlug,
  menuSlug,
  reorderProducts = [],
  reorderLoading = false,
  excludedFromOfferProductIds,
}) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const { selectedLang } = useLanguage();
  const language = selectedLang.code.toLowerCase();
  const { isAuthenticated } = useAuth();
  const { favouriteProducts, loading: wishlistLoading } = useRawWishlist(); // For count only
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const favouritesRef = useRef<HTMLDivElement | null>(null);
  const headerOffset = useHeaderOffset();
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const qrProductCount = useSelector(selectDineInSessionProductCount);
  const sessionTablePin = useSelector(selectSessionTablePin);
  const showMobileCartSummary = isQrFlowActive && qrProductCount > 0;
  useDisableBodyScroll(menuOpen);

  // Use shared hook for category logic
  const { groupedProducts, getCurrentCategory: getCurrentCategoryFromHook, handleCategoryClick: handleCategoryClickFromHook } = useFullMenuCategories({
    products,
    categories,
    includeDescriptions: true,
  });

  const enrichedFavouriteProducts = useMemo(
    () => enrichWishlistProductsWithMenuData(favouriteProductsFiltered, products),
    [favouriteProductsFiltered, products]
  );

  // Wrapper for getCurrentCategory to use refs and session
  const getCurrentCategory = (): string => {
    const hasReorderProducts =
      !!(
        session?.user?.email &&
        reorderProducts &&
        reorderProducts.length > 0 &&
        !isQrFlowActive
      );
    return getCurrentCategoryFromHook(
      categoryRefs.current,
      favouritesRef.current,
      hasReorderProducts ? true : !!isAuthenticated,
      reorderProducts?.length || 0,
      favouriteProducts?.length || 0
    );
  };

  // Update selected category when menu opens
  const handleMenuOpen = () => {
    const currentCat = getCurrentCategory();
    setSelectedCategory(currentCat);
    setMenuOpen(true);
  };

  // Wrapper for handleCategoryClick to close menu first
  const handleCategoryClick = (categorySlug: string) => {
    setMenuOpen(false);
    // Small delay to ensure menu closes before scrolling
    setTimeout(() => {
      handleCategoryClickFromHook(categorySlug, categoryRefs.current, favouritesRef.current);
    }, 100);
  };

  // Handle loading state
  if (loading) {
    return (
      <ProductContainer 
        products={[]} 
        loading={true} 
        error={null} 
        catDesc="" 
        catTitle="" 
        storeSlug={storeSlug} 
      />
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="w-full md:w-[80%] text-center text-[var(--error-light)] p-4">
        <p>{lang.errorProducts}</p>
        <p className="heading-6 mt-2">{error.message}</p>
      </div>
    );
  }

  // Handle no products state
  if (!products || products?.length === 0) {
    return (
      <div className="w-full md:pl-4 pl-0">
        <div className="w-full h-[70vh] pt-24 text-center p-4 flex flex-wrap justify-center items-center content-center">
          <img
            fetchPriority="high"
            src="/images/no-product.svg"
            alt="No Product found"
            title="No Product found"
            width={100}
            height={100}
            className="text-center"
          />
          <p className="w-full text-center pt-2 font-[var(--font-semi-bold)]">
            {lang.NoProductsFound}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Order Again Section - only on full menu page, above Favourites */}
      {session?.user?.email &&
        !isQrFlowActive &&
        !reorderLoading &&
        reorderProducts &&
        reorderProducts.length > 0 && (
        <div 
          id="order-again" 
          className='w-full bg-[var(--cards-containers)] md:bg-[transparent] md:!pt-0 border-b-8 border-[var(--primary-background)] pt-4 md:border-none mb-4'
          style={{ scrollMarginTop: `${headerOffset}px` }}
        >
          <div className='w-full pb-0 md:pt-4 md:pl-4'>
            <OrderAgain storeSlug={storeSlug} menuSlug={menuSlug} headingClassName="md-heading-1"/>
          </div>
        </div>
      )}
      
      {/* Only show Favourites section if we have favourite products from Typesense API */}
      {isAuthenticated && enrichedFavouriteProducts.length > 0 && (
        <div 
          id="category-favourites"
          ref={favouritesRef}
          className={`pt-4 md:border-none md:pt-0 md:pb-4 ${Object.keys(groupedProducts).length > 0 ? 'border-b-8 border-[var(--primary-background)]' : ''}`}
          style={{ scrollMarginTop: `${headerOffset}px` }}
        >
          <div className="w-full md:pl-4 pl-0 mb-4">
            <h2 className="heading-2 md-heading-1 font-semibold mb-2 text-[var(--primary-text)]">
              {lang.favourites}
            </h2>
          </div>
          <ProductContainer 
            products={enrichedFavouriteProducts} 
            loading={wishlistLoading} 
            error={null} 
            catDesc="" 
            catTitle="" 
            storeSlug={storeSlug} 
            excludedFromOfferProductIds={excludedFromOfferProductIds}
          />
        </div>
      )}

      {Object.entries(groupedProducts).map(([categorySlug, group], index) => {
        const { category, products: categoryProducts, categoryDescription } = group;
        const categoryName = category.displayName || category?.categoryName?.[language as keyof typeof category.categoryName] || '';
        const isLastCategory = index === Object.keys(groupedProducts).length - 1;
        
        return (
          <div 
            key={categorySlug} 
            id={`category-${categorySlug}`}
            ref={(el) => {
              categoryRefs.current[categorySlug] = el;
            }}
            className={`pt-4 md:border-none md:pt-0 md:pb-4 ${!isLastCategory ? 'border-b-8 border-[var(--primary-background)]' : ''}`}
          style={{ scrollMarginTop: `${headerOffset}px` }}
          >
            <ProductContainer 
              products={categoryProducts} 
              loading={false} 
              error={null} 
              catDesc={categoryDescription || ""} 
              catTitle={categoryName} 
              storeSlug={storeSlug} 
              isFullMenu={true}
              excludedFromOfferProductIds={excludedFromOfferProductIds}
            />
          </div>
        );
      })}

      {/* Desktop Menu Icon - visible on desktop; on mobile only in QR flow. Higher when MobileCartSummary is shown (product count > 0). */}
      <div 
        className={`${isQrFlowActive ? (showMobileCartSummary ? (sessionTablePin ? 'block bottom-[177px]' : 'block bottom-[160px]') : 'block bottom-[89px]') : 'hidden md:block bottom-[36px]'} fixed right-[20px] cursor-pointer z-[9]`}
        onClick={handleMenuOpen}
      >
        <Icon
          icon={`${MENU_CARD_ICON}#menu-card`}
          width={60}
          height={67}
          viewBox="0 0 61 68"
          color="var(--accent-color)"
          strokeWidth={0}
        />
      </div>

      {/* Category Popup Menu - Desktop always; mobile in QR flow */}
      {menuOpen && (
        <div 
          className={`${isQrFlowActive ? 'block' : 'hidden md:block'} fixed top-0 left-0 w-full h-full bg-[#00000040] z-[9999]`}
          onClick={() => setMenuOpen(false)}
        >
          <div 
            className='fixed z-[51] bottom-[36px] left-1/2 bg-[var(--cards-containers)] rounded-[10px] p-[15px] overflow-auto'
            style={{ 
              transform: 'translateX(-50%)',
              width: '530px',
              maxWidth: '90vw',
              ...(isQrFlowActive && { bottom: '23vw' })
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <FilterContainer
              categories={categories}
              selectedCat={selectedCategory}
              storeId={storeSlug}
              menuId=""
              loading={false}
              error={null}
              onCategoryClick={handleCategoryClick}
              onFavouritesClick={() => handleCategoryClick('favourites')}
              onOrderAgainClick={() => handleCategoryClick('order-again')}
              groupedProducts={groupedProducts}
              favouriteProductsCount={favouriteProducts?.length || 0}
              reorderProductsCount={
                isQrFlowActive ? 0 : reorderProducts?.length || 0
              }
              showFullMenu={false}
              hideZeroCountCategories
            />
          </div>
        </div>
      )}
    </div>
  );
};

