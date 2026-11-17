/**
* This is the homepage editor route (/pages/puck/)
* It loads the homepage content for editing
* Requires valid token in URL parameters for access
*/

import "@measured/puck/puck.css";
import "../styles.css";
import { Client } from "./[...puckPath]/client";
import { Metadata } from "next";
import { validateToken, extractTokenFromSearchParams } from "lib/tokenValidation";
import UnauthorizedAccess from "components/UnauthorizedAccess";

// Use ISR for editor with short revalidation to get fresh draft data
export const revalidate = 0; // Always revalidate (no caching for editor)

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Puck: Homepage Editor",
    publisher: process.env.NEXT_PUBLIC_PUBLISHER_NAME || "",
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_WEBSITE_URL || ''}/pages/puck`,
    },
  };
}

export default async function HomepageEditor({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Extract token from URL parameters
  const resolvedSearchParams = await searchParams;
  const token = extractTokenFromSearchParams(resolvedSearchParams);

  // Validate token - if invalid, show unauthorized page
  if (!validateToken(token)) {
    return (
      <UnauthorizedAccess 
        message="You are not allowed to view this page. A valid authentication token is required."
        showReturnHome={true}
      />
    );
  }

  // isDraft=true (default) from Draft tab; isDraft=false from Published tab
  const isDraft = resolvedSearchParams?.isDraft !== "false";

  return <Client path="/" isDraft={isDraft} editToken={token} />;
}
 