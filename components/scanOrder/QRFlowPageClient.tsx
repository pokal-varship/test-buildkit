'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQRCode } from '@hooks/useQRCode';
import Loader from '@components/loader/Loader';
import PageSuspense from '@components/PageSuspense';
import ScanOrderWelcome from '@components/scanOrder/ScanOrderWelcome';
import QRResolvePlaceholder, { type QRResolvePlaceholderVariant } from '@components/scanOrder/QRResolvePlaceholder';

/**
 * QR flow entry page. Fetches /qr/resolve, stores in Redux, renders welcome.
 * Route: /t/[token]
 */
export default function QRFlowPageClient() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string | undefined;
  const { data, loading, error } = useQRCode(token);

  if (loading) {
    return (
      <PageSuspense>
        <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--primary-background)]">
          <Loader size={40} type="spinner" color="var(--primary-color)" />
        </div>
      </PageSuspense>
    );
  }

  if (error || !data) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    const msg = error?.message?.toLowerCase() ?? '';
    const isWrongQr =
      status === 404 ||
      msg.includes('wrong') ||
      msg.includes('invalid') ||
      msg.includes("doesn't appear") ||
      msg.includes('not a restaurant');
    const variant: QRResolvePlaceholderVariant = isWrongQr ? 'wrong-qr' : 'timeout';

    return (
      <QRResolvePlaceholder
        variant={variant}
        onRetry={() => router.back()}
      />
    );
  }

  const storeSlug = data.storefrontSlug || token;
  const tableNumber = data.tableNumber || data.displayName || '—';
  const locationName = data?.restaurant?.name?.trim() || data?.storefrontName?.trim() || data?.spaceName?.trim() || undefined;
  const rating = data?.restaurant?.ratings?.average != null ? String(data.restaurant.ratings.average) : undefined;
  const reviewCount = data?.restaurant?.ratings?.totalReview != null ? String(data.restaurant.ratings.totalReview) : undefined;


  return (
    <PageSuspense>
      <ScanOrderWelcome
        storeSlug={storeSlug || ''}
        tableNumber={String(tableNumber)}
        locationName={locationName}
        rating={rating}
        reviewCount={reviewCount}
      />
    </PageSuspense>
  );
}
