'use client';
import React from 'react';
import { FilterItem } from './FilterItem';
import { Category } from '@components/type/store.types';
import { TypesenseProduct } from '@services/typesense';
import Shimmer from '@components/ui/Shimmer';
import Link from 'next/link';
import { useAuth } from '@hooks/useAuth';
import useProductUrl from '@hooks/useProductUrl';
import useLang from '@hooks/useLang';
import { LanguageCode, TranslationKeys } from 'types';

interface FilterContainerProps {
  categories: {data: Category[];};
  loading: boolean;
  error: string | null;
  selectedCat: string;
  storeId: string;
  menuId : string;
  onCategoryClick?: (categorySlug: string) => void;
  onFavouritesClick?: () => void;
  onOrderAgainClick?: () => void;
  groupedProducts?: {[categorySlug: string]: {category: Category, products: TypesenseProduct[], categoryDescription?: string}};
  /** Category counts from facets (when on category page) */
  categoryProductCounts?: Record<string, number>;
  favouriteProductsCount?: number;
  reorderProductsCount?: number;
  fullMenuProductCount?: number;
  showFullMenu?: boolean;
  /** When true, categories with 0 products are not rendered (e.g. full-menu category popup) */
  hideZeroCountCategories?: boolean;
}

export const FilterContainer: React.FC<FilterContainerProps> = ({ 
  categories, 
  selectedCat, 
  storeId, 
  menuId, 
  loading,
  onCategoryClick,
  onFavouritesClick,
  onOrderAgainClick,
  groupedProducts,
  categoryProductCounts,
  favouriteProductsCount,
  reorderProductsCount,
  fullMenuProductCount,
  showFullMenu = true,
  hideZeroCountCategories = false,
}) => {
  const { isAuthenticated } = useAuth();
  const { getWishlistUrl, getFullMenuUrl } = useProductUrl();
  const [lang]: [TranslationKeys, LanguageCode] = useLang();

  if (loading) {
    return (
      <div className="w-full">
        <div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full h-10 flex items-center mb-4">
              <Shimmer className="w-full h-8 rounded" height={28} width={"80%"} />
            </div>
          ))}
        </div>
      </div>
    );
  }
  const handleFavouritesClick = () => {
    if (onFavouritesClick) {
      onFavouritesClick();
    }
  };

  const handleOrderAgainClick = () => {
    if (onOrderAgainClick) {
      onOrderAgainClick();
    }
  };

  return (
    <div className="w-full">
        {/* Desktop view - vertical filter items */}
        <div className="space-y-2">
            {/* Full Menu Item */}
            {showFullMenu && (
              <div>
                {onCategoryClick ? (
                  <div
                    onClick={() => onCategoryClick('full-menu')}
                    className={`${selectedCat === 'full-menu' ? "text-[var(--accent-color)] font-600" : "font-500"} flex items-center cursor-pointer`}
                  >
                    <div className="flex items-center justify-between py-2 capitalize w-full heading-5 px-4">
                      <h3 className="heading-5">
                        {lang.fullMenu}
                      </h3>
                      {fullMenuProductCount !== undefined && (
                        <span className={`ml-auto md:hidden ${selectedCat === 'full-menu' ? "text-[var(--accent-color)]" : ""}`}>
                          {fullMenuProductCount.toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <Link
                    href={getFullMenuUrl()}
                    className={`${selectedCat === 'full-menu' ? "text-[var(--accent-color)] md:text-[var(--primary-color)] font-600 md:border-l-4 border-l-[var(--primary-color)] md:bg-[var(--secondary-active-background)] opacity-90" : "font-500"} flex items-center cursor-pointer`}
                    prefetch={true}
                  >
                    <div className="flex items-center justify-between py-2 capitalize w-full heading-5 px-4">
                      <h3 className="heading-5">
                        {lang.fullMenu}
                      </h3>
                      {fullMenuProductCount !== undefined && (
                        <span className={`ml-auto md:hidden ${selectedCat === 'full-menu' ? "md:text-[var(--primary-color)] text-[var(--accent-color)]" : ""}`}>
                          {fullMenuProductCount.toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  </Link>
                )}
              </div>
            )}

            {/* Order Again Item - Only show if user is authenticated and has reorder products */}
            {isAuthenticated && reorderProductsCount !== undefined && reorderProductsCount > 0 && (
              <div>
                {onOrderAgainClick ? (
                  <div
                    onClick={handleOrderAgainClick}
                    className="flex items-center cursor-pointer"
                  >
                    <div className={`flex items-center justify-between py-2 w-full heading-5 px-4 ${selectedCat === 'order-again' ? "text-[var(--accent-color)] font-600" : "font-500 text-[var(--primary-text)]"}`}>
                      <h3 className="heading-5">
                        {lang.orderAgain}
                      </h3>
                      <span className={`ml-auto ${selectedCat === 'order-again' ? "text-[var(--accent-color)]" : ""}`}>
                        {reorderProductsCount.toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Wishlist Item - Only show if user is authenticated */}
            {isAuthenticated && (
              <div>
                {onFavouritesClick ? (
                  <div
                    onClick={handleFavouritesClick}
                    className="flex items-center cursor-pointer"
                  >
                    <div className={`flex items-center justify-between py-2 w-full heading-5 px-4 ${selectedCat === 'favourites' || selectedCat === 'wishlist' ? "text-[var(--accent-color)] font-600" : "font-500 text-[var(--primary-text)]"}`}>
                      <h3 className="heading-5">
                        {lang.favourites}
                      </h3>
                      {favouriteProductsCount !== undefined && (
                        <span className={`ml-auto ${selectedCat === 'favourites' || selectedCat === 'wishlist' ? "text-[var(--accent-color)]" : ""}`}>
                          {favouriteProductsCount.toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <Link
                    href={getWishlistUrl()}
                    className={`${selectedCat === 'wishlist' ? "text-[var(--accent-color)] md:text-[var(--primary-color)] font-600 md:border-l-4 border-l-[var(--primary-color)] md:bg-[var(--secondary-active-background)]" : ""} flex items-center cursor-pointer`}
                    prefetch={true}
                  >
                    <div className="flex items-center justify-between py-2 capitalize w-full heading-5 px-4">
                      <h3 className="heading-5">
                        {lang.favourites}
                      </h3>
                      {favouriteProductsCount !== undefined && (
                        <span className={`ml-auto md:hidden ${selectedCat === 'favourites' || selectedCat === 'wishlist' ? "text-[var(--accent-color)]" : ""}`}>
                          {favouriteProductsCount.toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  </Link>
                )}
              </div>
            )}
            
            {/* Regular Categories */}
            {!!categories?.data?.length && categories.data.map(category => {
              const categorySlug = category.categorySlug || '';
              const productCount = (categoryProductCounts?.[categorySlug] ?? groupedProducts?.[categorySlug]?.products?.length) ?? 0;
              if (hideZeroCountCategories && productCount === 0) return null;

              return (
                <FilterItem 
                  storeId={storeId}
                  menuId={menuId}
                  key={category.categoryId} 
                  category={category} 
                  selectedCat={selectedCat}
                  onClick={onCategoryClick}
                  productCount={productCount}
                />
              );
            })}
        </div>
    </div>
  );
};
