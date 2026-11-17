import React from "react";
import ProductDetailPage from "@components/product/MainProduct";
import { getStorePageData, StoreData } from "@services/storePage";
import { unstable_cache } from "next/cache";
import { getMetaDatBaseUrl } from "@lib/helper";
import { getTenantConfig } from "@config/tenant.config";
import { SEO } from "types/metadata.type";
import { cookies } from "next/headers";
import { fetchGuestTokenServer } from "@services/guestToken";
import { ProductResponse } from "@components/type/pdp.type";
import { getCachedProductDetails } from "@lib/cache";
import BreadcrumbSchema from "@components/schema/BreadcrumbSchema";
import { generateBreadcrumbs, slugToName } from "@lib/breadcrumbHelper";
import { getPageSearchParams, PageSearchParams } from "@lib/page-search-params";
import { productUrlParamsFromRecord } from "types/product-url-params";

export const revalidate = 900; // Revalidate every 15 minutes (900 seconds)

const getCachedPageConfig = unstable_cache(
  async (pageType: string, s, c, productSlug, token: string | undefined) => {
    try {
      return await getStorePageData(
        "PRODUCT",
        s,
        c,
        "",
        productSlug,
        undefined,
        undefined,
        token,
      );
    } catch {
      return null;
    }
  },
  ["pdp"],
  { revalidate: 900, tags: ["pdp"] },
);

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{
    storeSlug: string;
    menuSlug: string;
    categorySlug: string;
    productSlug: string;
  }>;
  searchParams: Promise<{
    s?: string;
    c?: string;
    menu_id?: string;
    rfcEdit?: string;
    cid?: string;
    isPDP?: string;
    type?: string;
  }>;
}): Promise<SEO> {
  const config = getTenantConfig();
  const { productSlug, categorySlug, storeSlug, menuSlug } = await params;
  const { s, c } = await searchParams;

  const cookieStore = await cookies();
  let accessToken = cookieStore.get("token")?.value;
  if (!accessToken) {
    accessToken = await fetchGuestTokenServer();
  }

  const storePageData: StoreData | null = await getCachedPageConfig(
    "PRODUCT",
    s || storeSlug,
    c || categorySlug,
    productSlug,
    accessToken,
  );

  return {
    title:
      storePageData?.data?.seo?.metaTitle ||
      process.env.NEXT_PUBLIC_APP_OG_TITLE ||
      "",
    description:
      storePageData?.data?.seo?.metaDescription ||
      process.env.NEXT_PUBLIC_APP_OG_DESC ||
      "",
    keywords: storePageData?.data?.seo?.keywords || [],
    metadataBase: getMetaDatBaseUrl(),
    publisher: process.env.NEXT_PUBLIC_PUBLISHER_NAME || "",
    openGraph: {
      title: storePageData?.data?.seo?.openGraph?.title || "",
      description: storePageData?.data?.seo?.openGraph?.description || "",
      images:
        storePageData?.data?.seo?.openGraph?.image ||
        config?.lightLogoUrl ||
        config?.darkLogoUrl ||
        "",
      type:
        (["product"].includes(
          storePageData?.data?.seo?.openGraph?.type as string,
        )
          ? storePageData?.data?.seo?.openGraph?.type
          : "website") || "",
    },
    alternates: {
      canonical:
        storePageData?.data?.seo?.canonicalUrl ||
        `${process.env.NEXT_PUBLIC_WEBSITE_URL || ""}/${storeSlug}/${menuSlug}/${categorySlug}/${productSlug}`,
    },
  };
}

type SearchParams = {
  s?: string;
  c?: string;
  menu_id?: string;
  rfcEdit?: string;
  cid?: string;
  isPDP?: string;
  type?: string;
};

type Props = {
  params: Promise<{
    storeSlug: string;
    menuSlug: string;
    categorySlug: string;
    productSlug: string;
  }>;
  searchParams: Promise<SearchParams>;
};

async function ProductDetail({ params, searchParams }: Props) {
  const { productSlug, categorySlug, storeSlug, menuSlug } = await params;
  const parsedSearchParams = await getPageSearchParams(searchParams);
  const { s, c } = parsedSearchParams;
  const effectiveStoreSlug = s || storeSlug;
  const initialUrlParams = productUrlParamsFromRecord(parsedSearchParams, {
    menuSlug,
    storeSlug: effectiveStoreSlug,
  });
  const config = getTenantConfig();
  const baseUrl = config.webUrl || process.env.NEXT_PUBLIC_WEBSITE_URL || "";

  if (!productSlug) throw new Error("Product slug is required");

  // Get cached product data using LRU cache
  const productData = await getCachedProductDetails(
    c || categorySlug,
    productSlug,
    s || storeSlug,
  );

  // Generate breadcrumbs for PDP
  const breadcrumbs = generateBreadcrumbs({
    baseUrl: baseUrl,
    menuSlug: menuSlug,
    menuName: menuSlug || "",
    categorySlug: c || categorySlug,
    categoryName:
      productData?.data?.productCategoryName || slugToName(c || categorySlug),
    storeSlug: s || storeSlug,
    storeName: slugToName(s || storeSlug),
    productSlug: productSlug,
    productName: productData?.data?.name || slugToName(productSlug),
  });

  return (
    <PageSearchParams params={parsedSearchParams}>
      <BreadcrumbSchema
        items={breadcrumbs}
        id={`breadcrumb-pdp-${productSlug}`}
      />
      <ProductDetailPage
        initialProductData={productData as ProductResponse}
        initialUrlParams={initialUrlParams}
        storeSlug={effectiveStoreSlug}
      />
    </PageSearchParams>
  );
}

export default ProductDetail;
