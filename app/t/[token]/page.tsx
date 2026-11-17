import { notFound } from 'next/navigation';
import QRFlowPageClient from '@components/scanOrder/QRFlowPageClient';

interface QRFlowPageProps {
  params: Promise<{ token: string }>;
}

/**
 * QR flow entry. Token from URL /t/[token] is used to resolve table/store via API.
 */
export default async function QRFlowPage({ params }: QRFlowPageProps) {
  const { token } = await params;

  if (!token?.trim()) {
    return notFound();
  }

  return <QRFlowPageClient />;
}
