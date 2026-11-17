/**
 * Store landing page draft preview — requires ?token= or ?editToken=
 */

import DraftPreviewPage from "components/puck/DraftPreviewPage";
import { Metadata } from "next";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}): Promise<Metadata> {
  const { storeSlug } = await params;

  return {
    title: `${storeSlug} Draft Preview`,
    publisher: process.env.NEXT_PUBLIC_PUBLISHER_NAME || "",
    robots: "noindex, nofollow",
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_WEBSITE_URL || ""}/${storeSlug}/draft`,
    },
  };
}

export default async function StoreDraftPreview({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { storeSlug } = await params;
  const pagePath = `/${storeSlug}`;

  return (
    <DraftPreviewPage
      pagePath={pagePath}
      liveHref={pagePath}
      editPath={`${pagePath}/edit`}
      pageLabel="this page"
      searchParams={searchParams}
    />
  );
}
