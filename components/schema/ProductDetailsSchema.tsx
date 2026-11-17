'use client';
import React from 'react';
import { ProductResponse } from '@components/type/pdp.type';
import { generateImageBase64FromUrl } from '@lib/helper/ImageGen/imageGen';
import BreadcrumbSchema from './BreadcrumbSchema';
import { generateBreadcrumbs, slugToName } from '@lib/breadcrumbHelper';

interface ProductDetailsSchemaProps {
  product: ProductResponse | null;
  categoryId: string;
  storeId: string;
  menuId: string;
  productSlug: string | string[] | undefined;
  categoryName?: string;
  storeName?: string;
}

const ProductDetailsSchema: React.FC<ProductDetailsSchemaProps> = ({
  product,
  menuId,
  categoryId,
  storeId,
  productSlug,
  categoryName,
  storeName
}) => {

  if (!product) return null;

  const generateProductSchema = (product: ProductResponse | null) => {
    if (!product) return null;

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    // Use productSlug from props, or fallback to product's customSlug or product id
    const slug = (typeof productSlug === 'string' ? productSlug : productSlug?.[0]) || 
                 product.data?.seo?.urlManagement?.customSlug || 
                 product.data?.customSlug || 
                 product.data?.id;
    const productUrl = `${origin}/products/${slug}?category=${categoryId}&store=${storeId}&menu=${menuId}`;

    const getPrimaryImage = () => {
      const primary = product.data.media?.find((img) => img?.metadata?.isPrimary);
      return primary?.url || product.data.media?.[0]?.url || '';
    };

    const getBestVariant = () => {
      return product.data.variants?.[0] || {};
    };

    const variant = getBestVariant();

    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': product?.data?.name || '',
      'description': product?.data?.description?.replace(/<\/?[^>]+(>|$)/g, '') || '', // strip HTML
      'image': generateImageBase64FromUrl({url: getPrimaryImage(), width: 250, height: 250})?.fullEncodedUrl || "",
      'price': product?.data?.basePrice || 0,
      'sku': variant.sku || '',
      'brand': {
        '@type': 'Brand',
        'name': process.env.NEXT_PUBLIC_APP_NAME || ''
      },
      'offers': {
        '@type': 'Offer',
        'priceCurrency': process.env.NEXT_PUBLIC_CURRENCY_CODE || 'INR',
        'price': product?.data?.discountedPrice || product?.data?.basePrice || 0,
        'availability': 'https://schema.org/InStock',
        'url': productUrl
      },
      'url': productUrl,
      'nutrition': {
        '@type': 'NutritionInformation',
        ...(product?.data?.nutritionInfo?.values || variant.nutritionInfo?.values || {})
      },
      'isConsumableForDiet': Object.entries(product?.data?.ingredients?.dietaryInfo || {})
        .filter(([, val]) => val === true)
        .map(([key]) => `https://schema.org/${key.charAt(0).toUpperCase() + key.slice(1)}`)
    };
  };

  // Generate breadcrumbs
  const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_WEBSITE_URL || '';
  const breadcrumbs = generateBreadcrumbs({
    baseUrl: origin,
    menuSlug: menuId,
    menuName: menuId || '',
    categorySlug: categoryId,
    categoryName: categoryName || slugToName(categoryId),
    storeSlug: storeId,
    storeName: storeName || slugToName(storeId),
    productSlug: typeof productSlug === 'string' ? productSlug : productSlug?.[0],
    productName: product?.data?.name || ''
  });

  return (
    <>
      <script
        id={product?.data?.id}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateProductSchema(product)) }}
      />
      <BreadcrumbSchema items={breadcrumbs} id={`breadcrumb-pdp-${product?.data?.id}`} />
    </>
  );
};

export default ProductDetailsSchema;