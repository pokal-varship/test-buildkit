import React from 'react';
import WishlistListing from '@components/wishlist/WishlistListing';
import { getMetaDatBaseUrl } from '@lib/helper';
import { SEO } from 'types/metadata.type';

/** Shell is static; wishlist data loads client-side in WishlistListing. */
export const dynamic = 'force-static';

export async function generateMetadata({ params }: { params: Promise<{ city: string, areaName: string, storeSlug: string, menuSlug: string }> }): Promise<SEO> {
    const resolvedParams = await params;
    const { storeSlug, menuSlug } = resolvedParams;
    
    if (!storeSlug) {
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
                canonical: `${process.env.NEXT_PUBLIC_WEBSITE_URL || ''}/${storeSlug}/${menuSlug}/wishlist`,
            },
        };
    }

    return {
        title: `Wishlist - ${storeSlug} | ${process.env.NEXT_PUBLIC_APP_OG_TITLE || ''}`,
        description: `View your saved items and favorites at ${storeSlug}`,
        keywords: ['wishlist', 'favorites', 'saved items'],
        metadataBase: getMetaDatBaseUrl(),
        publisher: process.env.NEXT_PUBLIC_PUBLISHER_NAME || "",
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_WEBSITE_URL || ''}/${storeSlug}/${menuSlug}/wishlist`,
        },
        openGraph: {
            title: `Wishlist - ${storeSlug}`,
            description: `View your saved items and favorites at ${storeSlug}`,
            images: '',
            type: 'website'
        },
    };
}

export default async function WishlistPage({ params }: { params: Promise<{ city: string, areaName: string, storeSlug: string, menuSlug: string }> }) {
    const resolvedParams = await params;
    const { storeSlug } = resolvedParams;
    
    if (!storeSlug) {
        return (
            <div className='w-full flex justify-center bg-[var(--cards-containers)]'>
                <WishlistListing />
            </div>
        );
    }

    return (
        <div className='w-full flex justify-center bg-[var(--cards-containers)]'>
            <WishlistListing />
        </div>
    );
} 