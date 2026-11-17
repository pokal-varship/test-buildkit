/**
 * About Us draft preview — requires ?token= or ?editToken=
 */

import DraftPreviewPage from "components/puck/DraftPreviewPage";
import { Metadata } from "next";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "About Us Draft Preview",
    publisher: process.env.NEXT_PUBLIC_PUBLISHER_NAME || "",
    robots: "noindex, nofollow",
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_WEBSITE_URL || ""}/about-us/draft`,
    },
  };
}

export default function AboutUsDraftPreview({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <DraftPreviewPage
      pagePath="/about-us"
      liveHref="/about-us"
      editPath="/about-us/edit"
      pageLabel="the About Us page"
      searchParams={searchParams}
    />
  );
}
