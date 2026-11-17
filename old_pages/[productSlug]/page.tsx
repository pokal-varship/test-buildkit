import React from "react";
import ProductDetailPage from "@components/product/MainProduct";
import { getStorePageData, StoreData } from "@services/storePage";
import { unstable_cache } from "next/cache";
import { getMetaDatBaseUrl } from "@lib/helper";
import { SEO } from "types/metadata.type";
import { cookies } from "next/headers";
import { fetchGuestTokenServer } from "@services/guestToken";
import { ProductResponse } from "@components/type/pdp.type";
import { getCachedProductDetails } from "@lib/cache";

export const revalidate = 300; // This sets the revalidation time for the page to 300 seconds (5 minutes)

const getCachedPageConfig = unstable_cache(
  async (pageType: string, s, c, productSlug, token: string | undefined) => {
    try {
      return await getStorePageData("PRODUCT", s, c, "", productSlug, undefined, undefined, token);
    } catch {

      return null;
    }
  },
  ["pdp"],
  { revalidate: 900, tags: ["pdp"] }
);

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ s: string; c: string }>;
}): Promise<SEO> {
  const { id: productSlug } = await params;
  const { c, s } = await searchParams;
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("token")?.value;
  if (!accessToken) {
    accessToken = await fetchGuestTokenServer();
  }
  const storePageData: StoreData | null = await getCachedPageConfig(
    "PRODUCT",
    s,
    c,
    productSlug,
    accessToken
  ); // Fetch data

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
    publisher: process.env.NEXT_PUBLIC_PUBLISHER_NAME || "Appscrip",
    openGraph: {
      title: storePageData?.data?.seo?.openGraph.title || "",
      description: storePageData?.data?.seo?.openGraph.description || "",
      images: storePageData?.data?.seo?.openGraph.image || "",
      type:
        (["product"].includes(
          storePageData?.data?.seo?.openGraph?.type as string
        )
          ? storePageData?.data?.seo?.openGraph?.type
          : "website") || "",
    },
    alternates: {
      canonical: storePageData?.data?.seo?.canonicalUrl || `${process.env.NEXT_PUBLIC_WEBSITE_URL || ''}/${productSlug}`,
    },
  };
}

type SearchParams = {
  c?: string;
  s?: string;
  menu?: string;
  category?: string;
  store?: string;
};

type Props = {
  params: Promise<{ id: string, storeSlug: string, categorySlug: string, productSlug: string }>;
  searchParams: Promise<SearchParams>;
};

async function Product({
  params,
}: Props) {
  const {storeSlug, categorySlug, productSlug } = await params;
  if (!productSlug) throw new Error("Product ID is required");

  // Get cached product data using LRU cache
  const productData = await getCachedProductDetails(
    categorySlug || "",
    productSlug,
    storeSlug
  );
  
  return (
    <ProductDetailPage initialProductData={productData as ProductResponse} />
  );
}
export default Product;

