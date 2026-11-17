'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Category } from '@components/type/store.types';
import { TypesenseProduct } from '@services/typesense';
import { useLanguage } from 'context/LanguageContext';
import useLang from '@hooks/useLang';
import { LanguageCode, TranslationKeys } from 'types';
import { useFullMenuCategories } from '@hooks/products/useFullMenuCategories';
import { cn } from '@lib/utils';

interface CategoryScrollBarProps {
  categories: { data: Category[] };
  products: TypesenseProduct[];
  isAuthenticated: boolean;
  reorderProductsCount?: number;
  favouriteProductsCount?: number;
  selectedCategory?: string;
  categoryContainerClassName?: string;
}

export const CategoryScrollBar: React.FC<CategoryScrollBarProps> = ({
  categories,
  products,
  isAuthenticated,
  reorderProductsCount = 0,
  favouriteProductsCount = 0,
  categoryContainerClassName,
}) => {
  const { selectedLang } = useLanguage();
  const language = selectedLang.code.toLowerCase();
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef<boolean>(false);
  const clickedCategoryRef = useRef<string | null>(null);

  // Use shared hook for category logic
  const { groupedProducts, getCurrentCategory, handleCategoryClick } = useFullMenuCategories({
    products,
    categories,
    includeDescriptions: false,
  });

  // Track current category on scroll with debouncing
  useEffect(() => {
    const handleScroll = () => {
      // If we're in a programmatic scroll, don't update at all
      // The handleClick function will handle verification after scroll completes
      if (isScrollingRef.current) {
        return;
      }

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // For manual/user scrolls, check immediately
      const current = getCurrentCategory(
        undefined, // no refs, use getElementById
        undefined, // no favouritesRef, use getElementById
        isAuthenticated,
        reorderProductsCount,
        favouriteProductsCount
      );
      if (current) {
        setSelectedCategory(current);
      }

      // Debounce: wait for scroll to settle before final check
      scrollTimeoutRef.current = setTimeout(() => {
        // Double-check we're still not in a programmatic scroll
        if (!isScrollingRef.current) {
          const finalCurrent = getCurrentCategory(
            undefined,
            undefined,
            isAuthenticated,
            reorderProductsCount,
            favouriteProductsCount
          );
          if (finalCurrent) {
            setSelectedCategory(finalCurrent);
          }
        }
      }, 150);
    };

    // Initial check with delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const current = getCurrentCategory(
        undefined,
        undefined,
        isAuthenticated,
        reorderProductsCount,
        favouriteProductsCount
      );
      if (current) {
        setSelectedCategory(current);
      }
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, [getCurrentCategory, isAuthenticated, reorderProductsCount, favouriteProductsCount]);

  // Build category list with Order Again and Favourites
  const categoryList = useMemo(() => {
    const list: Array<{ slug: string; name: string; count?: number }> = [];
    
    // Add Order Again if authenticated and has products
    if (isAuthenticated && reorderProductsCount > 0) {
      list.push({ slug: 'order-again', name: lang.orderAgain });
    }
    
    // Add Favourites if authenticated and has products
    if (isAuthenticated && favouriteProductsCount > 0) {
      list.push({ slug: 'favourites', name: lang.favourites });
    }
    
    // Add categories with products
    Object.entries(groupedProducts).forEach(([categorySlug, group]) => {
      const categoryName = group.category.displayName || 
        group.category?.categoryName?.[language as keyof typeof group.category.categoryName] || '';
      if (categoryName) {
        list.push({ slug: categorySlug, name: categoryName });
      }
    });
    
    return list;
  }, [groupedProducts, language, isAuthenticated, reorderProductsCount, favouriteProductsCount, lang]);

  if (categoryList.length === 0) {
    return null;
  }

  // Handle category click with immediate highlight update
  const handleClick = (categorySlug: string) => {
    // Clear any pending scroll timeouts
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
    
    // Immediately set the selected category (optimistic update)
    // Normalize 'wishlist' to 'favourites' for consistency
    const normalizedSlug = categorySlug === 'wishlist' ? 'favourites' : categorySlug;
    setSelectedCategory(normalizedSlug);
    clickedCategoryRef.current = normalizedSlug;
    isScrollingRef.current = true;
    
    // Perform the scroll
    handleCategoryClick(categorySlug, undefined, undefined);
    
    // Verify after scroll animation completes (smooth scroll typically takes ~500-600ms)
    // Check multiple times to ensure we catch the correct category after scroll settles
    const verifyAfterScroll = () => {
      const current = getCurrentCategory(
        undefined,
        undefined,
        isAuthenticated,
        reorderProductsCount,
        favouriteProductsCount
      );
      
      // Update to the detected category if it's valid
      // The improved detection logic should now correctly identify the clicked category
      if (current) {
        setSelectedCategory(current);
      } else {
        // If detection failed, keep the clicked category as fallback
        setSelectedCategory(normalizedSlug);
      }
      
      // Reset flags after a short delay to allow scroll handler to take over
      setTimeout(() => {
        isScrollingRef.current = false;
        clickedCategoryRef.current = null;
      }, 150);
    };
    
    // Check after scroll completes - use longer timeout to ensure animation is done
    setTimeout(verifyAfterScroll, 700);
  };

  return (
    <div className={cn("w-full overflow-x-auto scrollbar-hide bg-[var(--primary-background)]", categoryContainerClassName)}>
      <div className="flex gap-3 pt-2">
        {categoryList.map((item) => {
          const isSelected = selectedCategory === item.slug || 
            (item.slug === 'favourites' && selectedCategory === 'wishlist');
          
          return (
            <button
              key={item.slug}
              onClick={() => handleClick(item.slug)}
              className={`whitespace-nowrap heading-6 transition-colors font-500 border-b-2 pb-2
                ${isSelected 
                  ? 'text-[var(--accent-color)]' 
                  : 'text-[var(--primary-text)] border-transparent'
                }
              `}
              style={isSelected ? { borderBottomColor: 'var(--accent-color)' } : undefined}
            >
              {item.name}
            </button>
          );
        })}
      </div>
      <style>{`
        .scrollbar-hide {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE 10+ */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
    </div>
  );
};

