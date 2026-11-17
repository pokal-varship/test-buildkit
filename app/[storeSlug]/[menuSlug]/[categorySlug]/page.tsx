import React from 'react';
import { StoreData } from '@components/type/store.types';
import { getStorePageData } from '@services/storePage';
import ProductListing from '@components/product-listing/page';
import { getMetaDatBaseUrl } from '@lib/helper';
import { getTenantConfig } from '@config/tenant.config';
import { SEO } from 'types/metadata.type';
import { unstable_cache } from 'next/cache';
import { cookies } from 'next/headers';
import { fetchGuestTokenServer } from '@services/guestToken';
import BreadcrumbSchema from '@components/schema/BreadcrumbSchema';
import { generateBreadcrumbs, slugToName } from '@lib/breadcrumbHelper';

export const revalidate = 900; // 15 minutes in seconds

// Helper function to validate category slug pattern
function isValidCategorySlug(slug: string): boolean {
    // Check if slug is empty or undefined
    if (!slug || typeof slug !== 'string') {
        return false;
    }
    
    // Check if it contains dots (like com.chrome.devtools or file.json)
    if (slug.includes('.')) {
        return false;
    }
    
    return true;
}

// Create a cached version of getStorePageData to avoid duplicate API calls
const getCachedStorePageData = unstable_cache(
    async (pageType: string, store: string, category: string, token?: string) => {
        try {
            return await getStorePageData(pageType, store, category, undefined, undefined, undefined, undefined, token);
        } catch {

            return null;
        }
    },
    ['store-category-page'],
    { revalidate: 900, tags: ['store-category'] }
);

export async function generateMetadata({ params }: { params: Promise<{ city: string, areaName: string, storeSlug: string, menuSlug: string, categorySlug: string }> }): Promise<SEO> {
    const config = getTenantConfig();
    const resolvedParams = await params;
    const { storeSlug, menuSlug, categorySlug } = resolvedParams;
    
    if (!storeSlug || !categorySlug || !isValidCategorySlug(categorySlug)) {
        return {
            title: process.env.NEXT_PUBLIC_APP_OG_TITLE || '',
            description: process.env.NEXT_PUBLIC_APP_OG_DESC || '',
            keywords: [],
            metadataBase: getMetaDatBaseUrl(),
            publisher: process.env.NEXT_PUBLIC_PUBLISHER_NAME || "",
            openGraph: {
                title: '',
                description: '',
                images: '',
                type: 'website'
            },
            alternates: {
                canonical: `${process.env.NEXT_PUBLIC_WEBSITE_URL || ''}/${storeSlug}/${menuSlug}/${categorySlug}`,
            },
        };
    }
    
    // Get server-side token from cookies
    const cookieStore = await cookies();
    let accessToken = cookieStore.get('token')?.value;
    if (!accessToken) {
        accessToken = await fetchGuestTokenServer();
    }
    const storePageData: StoreData | null = await getCachedStorePageData('PRODUCTS', storeSlug, categorySlug, accessToken);

    return {
        title: storePageData?.data?.seo?.metaTitle || process.env.NEXT_PUBLIC_APP_OG_TITLE || '',
        description: storePageData?.data?.seo?.metaDescription || process.env.NEXT_PUBLIC_APP_OG_DESC || '',
        keywords: storePageData?.data?.seo?.keywords || [],
        metadataBase: getMetaDatBaseUrl(),
        publisher: process.env.NEXT_PUBLIC_PUBLISHER_NAME || "",
        openGraph: {
            title: storePageData?.data?.seo?.openGraph?.title || '',
            description: storePageData?.data?.seo?.openGraph?.description || '',
            images: storePageData?.data?.seo?.openGraph?.image || config?.lightLogoUrl || config?.darkLogoUrl || "",
            type: (storePageData?.data?.seo?.openGraph?.type && ['website', 'article'].includes(storePageData?.data?.seo?.openGraph?.type) ?
                storePageData?.data?.seo?.openGraph?.type : 'website')
        },
        alternates: {
            canonical: storePageData?.data?.seo?.canonicalUrl || `${process.env.NEXT_PUBLIC_WEBSITE_URL || ''}/${storeSlug}/${menuSlug}/${categorySlug}`,
        },
    };
}

export default async function CategoryPage({ params }: { params: Promise<{ city: string, areaName: string, storeSlug: string, menuSlug: string, categorySlug: string }> }) {
    const resolvedParams = await params;
    const { storeSlug, categorySlug, menuSlug } = resolvedParams;
    const config = getTenantConfig();
    const baseUrl = config.webUrl || process.env.NEXT_PUBLIC_WEBSITE_URL || '';
    
    if (!storeSlug || !categorySlug || !isValidCategorySlug(categorySlug)) {
        return (
            <div className='w-full flex justify-center bg-[var(--cards-containers)]'>
                <ProductListing 
                    catDesc="" 
                    catTitle=""
                />
            </div>
        );
    }
    
    // Get server-side token from cookies
    const cookieStore = await cookies();
    let accessToken = cookieStore.get('token')?.value;
    if (!accessToken) {
        accessToken = await fetchGuestTokenServer();
    }
    // Use the same cached function to avoid duplicate API calls
    const storePageData = await getCachedStorePageData('PRODUCTS', storeSlug, categorySlug, accessToken);
    
    const catTitle = storePageData?.data?.pageConfig?.title || '';
    const catDesc = storePageData?.data?.pageConfig?.subheader || '';
    
    // Generate breadcrumbs for PLP
    const breadcrumbs = generateBreadcrumbs({
        baseUrl: baseUrl,
        menuSlug: menuSlug,
        menuName: menuSlug || '',
        categorySlug: categorySlug,
        categoryName: catTitle || slugToName(categorySlug),
        storeSlug: storeSlug,
        storeName: slugToName(storeSlug)
    });

    return (
        <>
            <BreadcrumbSchema items={breadcrumbs} id={`breadcrumb-plp-${categorySlug}`} />
            <div className='w-full flex justify-center bg-[var(--cards-containers)]'>
                    <ProductListing 
                        catDesc={catDesc} 
                        catTitle={catTitle}
                    />
            </div>
        </>
    );
} 