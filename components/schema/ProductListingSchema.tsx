'use client';
import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { TypesenseProduct } from '@services/typesense';
import { generateImageBase64FromUrl } from '@lib/helper/ImageGen/imageGen';
import BreadcrumbSchema from './BreadcrumbSchema';
import { generateBreadcrumbs, slugToName } from '@lib/breadcrumbHelper';

interface ProductListingSchemaProps {
  products?: TypesenseProduct[];
  categoryId?: string;
  categoryName?: string;
  categoryDescription?: string;
  storeSlug?: string;
  storeName?: string;
  totalFound?: number;
}

const ProductListingSchema: React.FC<ProductListingSchemaProps> = React.memo(function ProductListingSchema({
  products = [],
  categoryId = '',
  categoryName = '',
  categoryDescription = '',
  totalFound = 0,
  storeSlug = '',
  storeName = ''
}) {
  const params = useParams();
  const menuSlug = params?.menuSlug as string | undefined;
  const categorySlug = params?.categorySlug as string | undefined;  
  // Generate a unique ID based on products and filters with fallback
  const uniqueId = `product-listing-schema-${categoryId || 'default'}`;
  
  // Cleanup function to remove script tag on unmount or when props change
  useEffect(() => {
    // Cleanup function that runs on unmount or before effect reruns
    return () => {
      // Find and remove any existing script tags with similar IDs to prevent duplicates
      const existingScripts = document.querySelectorAll('script[id^="product-listing-schema-"]');
      existingScripts.forEach(script => {
        if (script.id !== uniqueId) {
          script.remove();
        }
      });
    };
  }, [uniqueId, products?.length]);

  // Add useEffect to verify schema is added to DOM
  useEffect(() => {
    if (!Array.isArray(products) || products.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      const schemaElement = document.getElementById(uniqueId) as HTMLScriptElement;
      if (schemaElement) {
        // Validate JSON structure
        try {
          JSON.parse(schemaElement.innerHTML);
        } catch {
          // Invalid JSON - silently handle
        }
      }
    }, 100); // Small delay to ensure DOM is updated

    return () => clearTimeout(timer);
  }, [uniqueId, products, categoryName]);
  
  // Add check for valid products array - this should not happen now due to conditional rendering
  if (!Array.isArray(products) || products.length === 0) {
    return null;
  }

  // Helper function to remove undefined values from objects
  const cleanObject = (obj: unknown): unknown => {
    if (Array.isArray(obj)) {
      return obj.map(cleanObject).filter(item => item !== undefined);
    }
    
    if (obj !== null && typeof obj === 'object') {
      const cleaned: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        if (value !== undefined && value !== null && value !== '') {
          cleaned[key] = cleanObject(value);
        }
      }
      return Object.keys(cleaned).length > 0 ? cleaned : undefined;
    }
    
    return obj;
  };

  // Helper function to safely get product image URL
  const getProductImageUrl = (product: TypesenseProduct): string => {
    try {
      const mediaArray = product?.media;
      
      if (!Array.isArray(mediaArray) || mediaArray.length === 0) {
        return '';
      }
      
      const firstMedia = mediaArray[0];
      if (!firstMedia?.url) {
        return '';
      }

      const generatedImage = generateImageBase64FromUrl({
        url: firstMedia.url,
        width: 250,
        height: 250
      });
      
      const imageUrl = generatedImage?.fullEncodedUrl || '';
      
      return imageUrl;
    } catch {
      return '';
    }
  };

  // Helper function to safely get product URL
  const getProductUrl = (product: TypesenseProduct): string => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_WEBSITE_URL || '';
      const customSlug = product?.seo?.urlManagement?.customSlug || product?.slug || product?.productId || 'unknown-product';
      const categorySlug = product?.productCategorySlug || '';
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (storeSlug) queryParams.append('store', storeSlug);
      if (categorySlug) queryParams.append('category', categorySlug);
      if (menuSlug) queryParams.append('menu', menuSlug);
      
      const queryString = queryParams.toString();
      const urlPath = `/products/${customSlug}${queryString ? `?${queryString}` : ''}`;
      
      // Use origin if available, otherwise fallback to website URL env var
      if (!origin) {
        const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || '';
        return websiteUrl ? `${websiteUrl}${urlPath}` : urlPath;
      }
      
      const productUrl = `${origin}${urlPath}`;
      
      return productUrl;
    } catch {
      // Return fallback relative URL without hardcoded domain
      return `/products/${product?.productId || 'unknown'}`;
    }
  };

  // Helper function to safely clean description
  const getCleanDescription = (product: TypesenseProduct): string => {
    try {
      const description = product?.description?.en || '';
      const cleanDescription = description ? description.replace(/<[^>]+>/g, '') : '';
      
      return cleanDescription;
    } catch {
      return '';
    }
  };

  // Helper function to safely get product price
  const getProductPrice = (product: TypesenseProduct): string => {
    try {
      const discountedPrice = product?.discountedPrice;
      const basePrice = product?.basePrice;
      
      if (typeof discountedPrice === 'number' && discountedPrice > 0) {
        return discountedPrice.toString();
      }
      
      if (typeof basePrice === 'number' && basePrice > 0) {
        return basePrice.toString();
      }
      
      return '0';
    } catch {
      return '0';
    }
  };

  // Filter valid products first
  const validProducts = products.filter(product => {
    const isValid = product && typeof product === 'object' && product?.productId;
    return isValid;
  });

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': `${categoryName || 'Products'} - Product Listing`,
    'description': categoryDescription || '',
    'numberOfItems': totalFound || validProducts.length || 0,
    'itemListOrder': 'https://schema.org/ItemListOrderDescending',
    'publisher': {
      '@type': 'Organization',
      'name': process.env.NEXT_PUBLIC_PUBLISHER_NAME || ''
    },
    'itemListElement': validProducts
      .map((product, index) => {
        try {
          const productUrl = getProductUrl(product);
          const productImage = getProductImageUrl(product);
          const productPrice = getProductPrice(product);
          const productName = product?.name?.en || product?.name || 'Product';
          const productDescription = getCleanDescription(product);
          
          const rawProductSchema = {
            '@type': 'ListItem',
            'position': index + 1,
            'item': {
              '@type': 'Product',
              '@id': productUrl, // Add unique identifier
              'name': productName,
              'description': productDescription || `${productName} - Available for order`,
              'image': productImage || undefined, // Only include if image exists
              'sku': product?.sku || undefined, // Only include if SKU exists
              'brand': {
                '@type': 'Brand',
                'name': process.env.NEXT_PUBLIC_APP_NAME || ''
              },
              'publisher': {
                '@type': 'Organization',
                'name': process.env.NEXT_PUBLIC_PUBLISHER_NAME || ''
              },
              'url': productUrl,
              'offers': {
                '@type': 'Offer',
                '@id': `${productUrl}#offer`, // Add unique identifier for offer
                'priceCurrency': process.env.NEXT_PUBLIC_CURRENCY_CODE || 'INR',
                'price': productPrice,
                'priceValidUntil': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Valid for 1 year
                'availability': 'https://schema.org/InStock',
                'itemCondition': 'https://schema.org/NewCondition',
                'url': productUrl,
                'seller': {
                  '@type': 'Organization',
                  'name': process.env.NEXT_PUBLIC_APP_NAME || ''
                }
              }
            }
          };
          
          // Clean the schema to remove undefined values
          const productSchema = cleanObject(rawProductSchema);
          
          return productSchema;
        } catch {
          // Return a minimal valid schema item to prevent complete failure
          const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_WEBSITE_URL || '';
          const fallbackUrl = origin ? `${origin}/products/unknown` : '/products/unknown';
          
          return {
            '@type': 'ListItem',
            'position': index + 1,
            'item': {
              '@type': 'Product',
              '@id': fallbackUrl,
              'name': 'Product',
              'description': 'Product - Available for order',
              'brand': {
                '@type': 'Brand',
                'name': process.env.NEXT_PUBLIC_APP_NAME || ''
              },
              'publisher': {
                '@type': 'Organization',
                'name': process.env.NEXT_PUBLIC_PUBLISHER_NAME || ''
              },
              'url': fallbackUrl,
              'offers': {
                '@type': 'Offer',
                '@id': `${fallbackUrl}#offer`,
                'priceCurrency': process.env.NEXT_PUBLIC_CURRENCY_CODE || 'INR',
                'price': '0',
                'priceValidUntil': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                'availability': 'https://schema.org/OutOfStock',
                'itemCondition': 'https://schema.org/NewCondition',
                'url': fallbackUrl,
                'seller': {
                  '@type': 'Organization',
                  'name': process.env.NEXT_PUBLIC_APP_NAME || ''
                }
              }
            }
          };
        }
      })
      .filter(item => {
        return item !== null;
      })
  };

  // Clean the final schema data to remove any undefined values
  const cleanedSchemaData = cleanObject(schemaData) as typeof schemaData;

  // Generate breadcrumbs
  const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_WEBSITE_URL || '';
  const breadcrumbs = generateBreadcrumbs({
    baseUrl: origin,
    menuSlug: menuSlug,
    menuName: menuSlug || '',
    categorySlug: categorySlug,
    categoryName: categoryName,
    storeSlug: storeSlug,
    storeName: storeName || slugToName(storeSlug)
  });

  try {
    return (
      <>
        <script
          id={uniqueId}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanedSchemaData, null, 0) }}
        />
        <BreadcrumbSchema items={breadcrumbs} id={`breadcrumb-plp-${categoryId || 'default'}`} />
      </>
    );
  } catch {
    // Return null instead of crashing the component
    return null;
  }
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo to prevent unnecessary re-renders
  return (
    prevProps.products?.length === nextProps.products?.length &&
    prevProps.categoryId === nextProps.categoryId &&
    prevProps.categoryName === nextProps.categoryName &&
    prevProps.categoryDescription === nextProps.categoryDescription &&
    prevProps.totalFound === nextProps.totalFound &&
    prevProps.storeSlug === nextProps.storeSlug &&
    prevProps.storeName === nextProps.storeName &&
    // Compare product IDs to detect changes in product data
    JSON.stringify(prevProps.products?.map(p => p?.productId)) === 
    JSON.stringify(nextProps.products?.map(p => p?.productId))
  );
});

export default ProductListingSchema;