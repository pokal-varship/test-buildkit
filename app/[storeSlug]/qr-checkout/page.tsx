'use client';

import React from 'react';
import QrCheckoutOrderView from '@components/order/QrCheckoutOrderView';

/**
 * QR Checkout page: /{storeSlug}/qr-checkout?qrToken={qrToken}
 * Used when user taps the active order tile in QR/dine-in flow.
 * Renders order-details-style view (same layout as Order Details page).
 */
export default function QrCheckoutPage() {
  return <QrCheckoutOrderView />;
}
