'use client'
import React from 'react';
import { StorePageData } from '@components/type/store.types';
import { generateImageBase64FromUrl } from '@lib/helper/ImageGen/imageGen';
import { usePathname, useSearchParams } from 'next/navigation';

interface RestaurantSchemaProps {
  storeData: StorePageData | null;
}

const RestaurantSchema: React.FC<RestaurantSchemaProps> = ({ storeData }) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const pathWithQueryParams = `${pathname}?${searchParams}`
  // Default restaurant data
  const restaurantData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": storeData?.data?.seo?.structuredData?.properties?.name || process.env.NEXT_PUBLIC_APP_OG_TITLE,
    "description": storeData?.data?.seo?.openGraph?.description || process.env.NEXT_PUBLIC_APP_OG_DESC,
    "url": storeData?.data?.seo?.structuredData?.properties?.url + pathWithQueryParams,
    "image": generateImageBase64FromUrl({url: storeData?.data?.seo?.structuredData?.properties?.image[0] || "", width: 768, quality: 90,})?.fullEncodedUrl,
    "telephone": storeData?.data?.seo?.structuredData?.properties?.telephone || process.env.NEXT_PUBLIC_SUPPORT_PHONE || "",
    "email": storeData?.data?.seo?.structuredData?.properties?.email || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": storeData?.data?.seo?.structuredData?.properties?.address?.addressLine2 || "",
      "addressLocality": storeData?.data?.seo?.structuredData?.properties?.address?.city || "",
      "addressRegion": storeData?.data?.seo?.structuredData?.properties?.address?.state || "",
      "postalCode": storeData?.data?.seo?.structuredData?.properties?.address?.zipCode || "",
      "addressCountry": storeData?.data?.seo?.structuredData?.properties?.address?.country || ""
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": storeData?.data?.seo?.structuredData?.properties?.address?.coordinates.latitude,
      "longitude": storeData?.data?.seo?.structuredData?.properties?.address?.coordinates.longitude
    },
    "openingHoursSpecification": storeData?.data?.seo?.structuredData?.properties?.workingHours?.map(data => ({
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [data.day],
      "opens": data.timeSlots?.[0]?.startTime,
      "closes": data.timeSlots?.[0]?.endTime,
    })),
    "menu": storeData?.data?.seo?.structuredData?.properties?.url + pathWithQueryParams,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantData) }}
    />
  );
};

export default RestaurantSchema;
