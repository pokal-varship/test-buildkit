import { BreadcrumbItem } from '@components/schema/BreadcrumbSchema';

interface GenerateBreadcrumbsParams {
  baseUrl: string;
  menuSlug?: string;
  menuName?: string;
  categorySlug?: string;
  categoryName?: string;
  storeSlug?: string;
  storeName?: string;
  productSlug?: string;
  productName?: string;
}

/**
 * Generates breadcrumb items for schema.org BreadcrumbList
 * @param params - Parameters to generate breadcrumbs
 * @returns Array of breadcrumb items
 */
export function generateBreadcrumbs(params: GenerateBreadcrumbsParams): BreadcrumbItem[] {
  const {
    baseUrl,
    menuSlug,
    menuName,
    categorySlug,
    categoryName,
    storeSlug,
    storeName,
    productSlug,
    productName
  } = params;

  const breadcrumbs: BreadcrumbItem[] = [];
  let position = 1;

  // Always start with Home
  breadcrumbs.push({
    position: position++,
    name: "Home",
    item: baseUrl
  });

  // Add store if available
  if (storeSlug && storeName) {
    breadcrumbs.push({
      position: position++,
      name: storeName,
      item: `${baseUrl}/${storeSlug}`
    });
  }

  // Add menu if available
  if (menuSlug && menuName) {
    const menuUrl = storeSlug 
      ? `${baseUrl}/${storeSlug}/${menuSlug}`
      : `${baseUrl}?menu=${menuSlug}`;
    
    breadcrumbs.push({
      position: position++,
      name: menuName,
      item: menuUrl
    });
  }

  // Add category if available
  if (categorySlug && categoryName) {
    let categoryUrl = '';
    
    if (storeSlug && menuSlug) {
      categoryUrl = `${baseUrl}/${storeSlug}/${menuSlug}/${categorySlug}`;
    } else if (menuSlug) {
      categoryUrl = `${baseUrl}?menu=${menuSlug}&category=${categorySlug}`;
    } else {
      categoryUrl = `${baseUrl}?category=${categorySlug}`;
    }
    
    breadcrumbs.push({
      position: position++,
      name: categoryName,
      item: categoryUrl
    });
  }

  // Add product if available (for PDP)
  if (productSlug && productName) {
    let productUrl = '';
    
    if (storeSlug && menuSlug && categorySlug) {
      productUrl = `${baseUrl}/${storeSlug}/${menuSlug}/${categorySlug}/${productSlug}`;
    } else if (categorySlug && storeSlug) {
      productUrl = `${baseUrl}/products/${productSlug}?category=${categorySlug}&store=${storeSlug}`;
    } else if (categorySlug) {
      productUrl = `${baseUrl}/products/${productSlug}?category=${categorySlug}`;
    } else {
      productUrl = `${baseUrl}/products/${productSlug}`;
    }
    
    breadcrumbs.push({
      position: position++,
      name: productName,
      item: productUrl
    });
  }

  return breadcrumbs;
}

/**
 * Converts slug to human-readable name
 * @param slug - The slug to convert
 * @returns Human-readable name
 */
export function slugToName(slug: string): string {
  if (!slug) return '';
  
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

