import React from 'react'; 
import { getStorePageData } from '@services/storePage';
import { notFound } from 'next/navigation';
import StoreList from '@components/storeFront/StorePage';
import { StoreData, StorePageData } from '@components/type/store.types';
import { SEO } from 'types/metadata.type';
import PageSuspense from '@components/PageSuspense';
import { getMetaDatBaseUrl } from '@lib/helper';
import { getTenantConfig } from '@config/tenant.config';

// Helper function to validate slug pattern
function isValidSlug(slug: string): boolean {
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

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ storeSlug: string, menuSlug: string }> }): Promise<SEO> {
    const config = getTenantConfig();
    const { storeSlug: slug, menuSlug } = await params;
    
    if (!isValidSlug(slug) || !isValidSlug(menuSlug)) {
        return {
            title: process.env.NEXT_PUBLIC_APP_OG_TITLE || '',
            description: process.env.NEXT_PUBLIC_APP_OG_DESC || '',
            metaTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE || '',
            metaDescription: process.env.NEXT_PUBLIC_APP_OG_DESC || '',
            keywords: [],
            robots: '',
            metadataBase: getMetaDatBaseUrl(),
            publisher: process.env.NEXT_PUBLIC_PUBLISHER_NAME || "",
            openGraph: {
                title: '',
                description: '',
                images: '',
                type: 'website'
            },
            structuredData: {
                properties: {
                    name: '',
                    url: '',
                },
                type: '',
            },
            alternates: {
                canonical: `${process.env.NEXT_PUBLIC_WEBSITE_URL || ''}/${slug}/${menuSlug}`,
            }
        };
    }
    
    const storePageData: StoreData | null = await getStorePageData('STORE', slug); // Fetch data
    return {
        title: storePageData?.data?.seo?.metaTitle || process.env.NEXT_PUBLIC_APP_OG_TITLE || '',
        description: storePageData?.data?.seo?.metaDescription || process.env.NEXT_PUBLIC_APP_OG_TITLE || '',
        metaTitle: storePageData?.data?.seo?.metaTitle || process.env.NEXT_PUBLIC_APP_OG_DESC || '',
        metaDescription: storePageData?.data?.seo?.metaDescription || process.env.NEXT_PUBLIC_APP_OG_DESC || '',
        keywords: storePageData?.data?.seo?.keywords || [],
        robots: storePageData?.data?.seo?.robots || '',
        metadataBase: getMetaDatBaseUrl(),
        publisher: process.env.NEXT_PUBLIC_PUBLISHER_NAME || "",
        alternates: {
            canonical: storePageData?.data?.seo?.canonicalUrl || `${process.env.NEXT_PUBLIC_WEBSITE_URL || ''}/${slug}/${menuSlug}`,
        },
        openGraph: {
            title: storePageData?.data?.seo?.openGraph?.title || '',
            description: storePageData?.data?.seo?.openGraph?.description || '',
            images: storePageData?.data?.seo?.openGraph?.image || config?.lightLogoUrl || config?.darkLogoUrl || "",
            type: (['website', 'article'].includes(storePageData?.data?.seo?.openGraph?.type) ?
                storePageData?.data?.seo?.openGraph?.type : 'website') || ""
        },
        structuredData: storePageData?.data?.seo?.structuredData ? {
            type: storePageData?.data?.seo?.structuredData?.type || "",
            properties: {
                name: storePageData?.data?.seo?.structuredData?.properties?.name || "",
                url: storePageData?.data?.seo?.structuredData?.properties?.url || process.env.NEXT_PUBLIC_WEBSITE_URL || "",
            },
        } : {
            properties: {
                name: "",
                url: "",
            },
            type: "",
        }
    };
}

// In server components, params are passed as props
async function StorePage({ params }: { params: Promise<{ storeSlug: string, menuSlug: string }> }) {
    let storeData: StoreData | null = null; // Updated type for storeData
    const { storeSlug: slug, menuSlug } = await params;
    
    if (!isValidSlug(slug) || !isValidSlug(menuSlug)) {
        notFound();
    }
    
    let storeSlug = '';
    try {
        (storeSlug  = (slug));
        // Access params directly from the props

        storeData = await getStorePageData('STORE', storeSlug);

    } catch {

        // Optional: redirect to 404 page if store not found
        notFound();
    }

    return (
        <>
            <StoreList storeData={storeData as StorePageData} />
        </>
    );
};

export default async function StorePageSuspense({ params }: { params: Promise<{ storeSlug: string, menuSlug: string }> }) {
    return <PageSuspense><StorePage params={params}/></PageSuspense>;
}; 