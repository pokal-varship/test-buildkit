import { useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Category } from '@components/type/store.types';
import { TypesenseProduct } from '@services/typesense';
import { useLanguage } from 'context/LanguageContext';
import useIsMobile from '@hooks/useIsMobile';
import { selectIsQrFlowActive } from '@redux/slices/qrFlowSlice';

// Hook to get header offset based on device type; use 220px when in QR flow (store bar + menu timing row + filter navbar)
export const useHeaderOffset = () => {
  const isMobile = useIsMobile();
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  return useMemo(() => (isQrFlowActive ? 160 : isMobile ? 160 : 190), [isMobile, isQrFlowActive]);
};

// Keep exported constant for backward compatibility (deprecated - use useHeaderOffset hook instead)
export const HEADER_OFFSET = 190;

interface GroupedProducts {
  [categorySlug: string]: {
    category: Category;
    products: TypesenseProduct[];
    categoryDescription?: string;
  };
}

interface UseFullMenuCategoriesProps {
  products: TypesenseProduct[];
  categories: { data: Category[] };
  includeDescriptions?: boolean;
}

interface UseFullMenuCategoriesReturn {
  groupedProducts: GroupedProducts;
  getCurrentCategory: (
    categoryRefs?: { [key: string]: HTMLElement | null },
    favouritesRef?: HTMLElement | null,
    isAuthenticated?: boolean,
    reorderProductsCount?: number,
    favouriteProductsCount?: number
  ) => string;
  handleCategoryClick: (
    categorySlug: string,
    categoryRefs?: { [key: string]: HTMLElement | null },
    favouritesRef?: HTMLElement | null
  ) => void;
}

export const useFullMenuCategories = ({
  products,
  categories,
  includeDescriptions = false,
}: UseFullMenuCategoriesProps): UseFullMenuCategoriesReturn => {
  const { selectedLang } = useLanguage();
  const language = selectedLang.code.toLowerCase();
  const headerOffset = useHeaderOffset();

  // Group products by category
  const groupedProducts = useMemo(() => {
    if (!products || !categories?.data) return {};
    
    const grouped: GroupedProducts = {};
    
    categories.data.forEach(category => {
      grouped[category.categorySlug || ''] = { 
        category, 
        products: [], 
        categoryDescription: undefined 
      };
    });
    
    products.forEach(product => {
      // Restaurant: productCategorySlug. Retail/Grocery: also categorySlugs[]
      const candidateSlugs = new Set<string>();
      if (product.productCategorySlug) {
        candidateSlugs.add(product.productCategorySlug);
      }
      if (Array.isArray(product.categorySlugs)) {
        product.categorySlugs.forEach((slug) => {
          if (slug) candidateSlugs.add(slug);
        });
      }

      candidateSlugs.forEach((categorySlug) => {
        if (!grouped[categorySlug]) return;

        grouped[categorySlug].products.push(product);

        if (
          includeDescriptions &&
          !grouped[categorySlug].categoryDescription &&
          product.categoryDetails
        ) {
          const categoryDetail = product.categoryDetails.find(
            (detail) => detail.Slug === categorySlug || !detail.Slug,
          );

          if (categoryDetail?.Description) {
            const description =
              categoryDetail.Description[language] ||
              categoryDetail.Description["en"] ||
              "";
            if (description) {
              grouped[categorySlug].categoryDescription = description;
            }
          }
        }
      });
    });
    
    return Object.fromEntries(Object.entries(grouped).filter(([, group]) => group.products.length > 0));
  }, [products, categories, language, includeDescriptions]);

  // Function to detect currently visible category based on scroll position
  const getCurrentCategory = useCallback((
    categoryRefs?: { [key: string]: HTMLElement | null },
    favouritesRef?: HTMLElement | null,
    isAuthenticated?: boolean,
    reorderProductsCount?: number,
    favouriteProductsCount?: number
  ): string => {
    const scrollY = window.scrollY;
    const viewportTop = scrollY + headerOffset;
    
    // Collect all sections (Order Again, Favourites, and Categories) and find the one closest to viewport top
    const sections: Array<{ slug: string; element: HTMLElement; top: number; bottom: number }> = [];
    
    // Add Order Again section if authenticated
    if (isAuthenticated && reorderProductsCount !== undefined && reorderProductsCount > 0) {
      const orderAgainElement = document.getElementById('order-again');
      if (orderAgainElement) {
        const rect = orderAgainElement.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        sections.push({
          slug: 'order-again',
          element: orderAgainElement,
          top: elementTop,
          bottom: elementTop + rect.height
        });
      }
    }
    
    // Add favourites section if authenticated
    if (isAuthenticated && favouriteProductsCount !== undefined && favouriteProductsCount > 0) {
      const favouritesElement = favouritesRef || document.getElementById('category-favourites');
      if (favouritesElement) {
        const rect = favouritesElement.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        sections.push({
          slug: 'favourites',
          element: favouritesElement,
          top: elementTop,
          bottom: elementTop + rect.height
        });
      }
    }
    
    // Add regular categories
    if (categoryRefs) {
      for (const [categorySlug, element] of Object.entries(categoryRefs)) {
        if (!element) continue;
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        sections.push({
          slug: categorySlug,
          element: element,
          top: elementTop,
          bottom: elementTop + rect.height
        });
      }
    } else {
      // Fallback to getElementById approach
      Object.keys(groupedProducts).forEach(categorySlug => {
        const element = document.getElementById(`category-${categorySlug}`);
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        sections.push({
          slug: categorySlug,
          element: element,
          top: elementTop,
          bottom: elementTop + rect.height
        });
      });
    }
    
    // Find the section whose top edge is closest to viewportTop
    // Strategy: Among sections near viewportTop, pick the one with top closest to viewportTop
    let currentCategory = '';
    let minDistance = Infinity;
    const nearViewportThreshold = 200; // Only consider sections whose top is within 200px of viewportTop
    
    // First pass: find sections that are near viewportTop
    const nearSections = sections.filter(section => {
      const { top, bottom } = section;
      // Section must be visible and its top must be within threshold of viewportTop
      return (bottom >= viewportTop && top <= scrollY + window.innerHeight) &&
             (top >= viewportTop - nearViewportThreshold);
    });
    
    // If we have sections near viewport, pick the one with top closest to viewportTop
    if (nearSections.length > 0) {
      nearSections.forEach(section => {
        const { top, slug } = section;
        const distance = Math.abs(top - viewportTop);
        
        // Prefer sections whose top is at or above viewportTop
        const adjustedDistance = top <= viewportTop ? distance : distance + 5000;
        
        if (adjustedDistance < minDistance) {
          minDistance = adjustedDistance;
          currentCategory = slug;
        }
      });
    } else {
      // Fallback: if no sections are near viewport, find the closest visible one
      sections.forEach(section => {
        const { top, bottom, slug } = section;
        
        if (bottom < viewportTop || top > scrollY + window.innerHeight) return;
        
        const distance = Math.abs(top - viewportTop);
        const adjustedDistance = top <= viewportTop ? distance : distance + 10000;
        
        if (adjustedDistance < minDistance) {
          minDistance = adjustedDistance;
          currentCategory = slug;
        }
      });
    }
    
    return currentCategory;
  }, [groupedProducts, headerOffset]);

  // Handle category click - scroll to category section
  const handleCategoryClick = useCallback((
    categorySlug: string,
    categoryRefs?: { [key: string]: HTMLElement | null },
    favouritesRef?: HTMLElement | null
  ): void => {
    if (categorySlug === 'order-again') {
      const orderAgainElement = document.getElementById('order-again');
      if (orderAgainElement) {
        const elementPosition = orderAgainElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    } else if (categorySlug === 'favourites' || categorySlug === 'wishlist') {
      const favouritesElement = favouritesRef || document.getElementById('category-favourites');
      if (favouritesElement) {
        const elementPosition = favouritesElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    } else {
      // Use ref if provided, otherwise getElementById
      const element = categoryRefs?.[categorySlug] || document.getElementById(`category-${categorySlug}`);
      if (element) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [headerOffset]);

  return {
    groupedProducts,
    getCurrentCategory,
    handleCategoryClick,
  };
};

