/**
 * Homepage draft preview — requires ?token= or ?editToken=
 */

import DraftPreviewPage from "components/puck/DraftPreviewPage";
import { Metadata } from "next";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Homepage Draft Preview",
    publisher: process.env.NEXT_PUBLIC_PUBLISHER_NAME || "",
    robots: "noindex, nofollow",
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_WEBSITE_URL || ""}/draft`,
    },
  };
}

export default function HomepageDraftPreview({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <DraftPreviewPage
      pagePath="/"
      liveHref="/"
      editPath="/edit"
      pageLabel="the homepage"
      searchParams={searchParams}
    />
  );
}
