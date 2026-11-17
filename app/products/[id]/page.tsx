import { getStorePageData, StoreData } from "@services/storePage";
import { unstable_cache } from "next/cache";
import { getMetaDatBaseUrl } from "@lib/helper";
import { getTenantConfig } from "@config/tenant.config";
import { SEO } from "types/metadata.type";
import { cookies } from "next/headers";
import { fetchGuestTokenServer } from "@services/guestToken";
import { getCachedProductDetails } from "@lib/cache";
import ProductDetailPage from "@components/product/MainProduct";
import { ProductResponse } from "@components/type/pdp.type";
import { Suspense } from "react";
import ProductDetailLoading from "./loading";
import { getPageSearchParams, PageSearchParams } from "@lib/page-search-params";
import { productUrlParamsFromRecord } from "types/product-url-params";

export const revalidate = 900; // Revalidate every 15 minutes (900 seconds)

// Helper function to validate product id pattern
function isValidProductId(id: string): boolean {
  // Check if id is empty or undefined
  if (!id || typeof id !== "string") {
    return false;
  }

  // Check if it contains dots (like com.chrome.devtools or file.json)
  if (id.includes(".")) {
    return false;
  }

  return true;
}

const getCachedPageConfig = unstable_cache(
  async (
    pageType: string,
    s: string,
    c: string,
    productSlug: string,
    token: string | undefined,
  ) => {
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
      // Error handled silently
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
  params: Promise<{ id: string }>;
  searchParams: Promise<{ store?: string; category?: string; menu?: string }>;
}): Promise<SEO> {
  const config = getTenantConfig();
  const { id: productSlug } = await params;
  const { category, store, menu } = await searchParams;

  if (!isValidProductId(productSlug)) {
    return {
      title: process.env.NEXT_PUBLIC_APP_OG_TITLE || "",
      description: process.env.NEXT_PUBLIC_APP_OG_DESC || "",
      keywords: [],
      metadataBase: getMetaDatBaseUrl(),
      publisher: process.env.NEXT_PUBLIC_PUBLISHER_NAME || "",
      openGraph: {
        title: "",
        description: "",
        images: "",
        type: "website",
      },
      alternates: {
        canonical: (() => {
          const baseUrl = `${process.env.NEXT_PUBLIC_WEBSITE_URL || ""}/products/${productSlug}`;
          const queryParams = new URLSearchParams();
          if (store) queryParams.append("store", store);
          if (category) queryParams.append("category", category);
          if (menu) queryParams.append("menu", menu);
          const queryString = queryParams.toString();
          return queryString ? `${baseUrl}?${queryString}` : baseUrl;
        })(),
      },
    };
  }

  const cookieStore = await cookies();
  let accessToken = cookieStore.get("token")?.value;
  if (!accessToken) {
    accessToken = await fetchGuestTokenServer();
  }
  const storePageData: StoreData | null = await getCachedPageConfig(
    "PRODUCT",
    store || "",
    category || "",
    productSlug,
    accessToken,
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
        (() => {
          const baseUrl = `${process.env.NEXT_PUBLIC_WEBSITE_URL || ""}/products/${productSlug}`;
          const queryParams = new URLSearchParams();
          if (store) queryParams.append("store", store);
          if (category) queryParams.append("category", category);
          if (menu) queryParams.append("menu", menu);
          const queryString = queryParams.toString();
          return queryString ? `${baseUrl}?${queryString}` : baseUrl;
        })(),
    },
  };
}

type SearchParams = {
  c?: string;
  s?: string;
  store?: string;
  category?: string;
  menu?: string;
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
};

// Async component that fetches product data
async function ProductContent({
  productId,
  categoryId,
  storeId,
  initialUrlParams,
}: {
  productId: string;
  categoryId: string;
  storeId: string;
  initialUrlParams: ReturnType<typeof productUrlParamsFromRecord>;
}) {
  // Get cached product data using LRU cache
  const productData = await getCachedProductDetails(
    categoryId,
    productId,
    storeId,
  );

  return (
    <ProductDetailPage
      initialProductData={productData as ProductResponse}
      initialUrlParams={initialUrlParams}
      storeSlug={storeId}
    />
  );
}

async function Product({ params, searchParams }: Props) {
  const { id: productId } = await params;
  const parsedSearchParams = await getPageSearchParams(searchParams);
  const { category: categoryId, store: storeId } = parsedSearchParams;
  const initialUrlParams = productUrlParamsFromRecord(parsedSearchParams);

  if (!isValidProductId(productId)) {
    throw new Error("Invalid product ID");
  }

  // Use Suspense to enable streaming - shows loading skeleton immediately
  // while product data is being fetched in the background
  return (
    <PageSearchParams params={parsedSearchParams}>
      <Suspense fallback={<ProductDetailLoading />}>
        <ProductContent
          productId={productId}
          categoryId={categoryId || ""}
          storeId={storeId || ""}
          initialUrlParams={initialUrlParams}
        />
      </Suspense>
    </PageSearchParams>
  );
}

export default Product;
