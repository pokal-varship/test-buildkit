/**
* This file implements a *magic* catch-all route that renders the Puck editor.
*
* This route exposes /puck/[...puckPath], but is disabled by middleware.ts. The middleware
* then rewrites all URL requests ending in `/edit` to this route, allowing you to visit any
* page in your application and add /edit to the end to spin up a Puck editor.
*
* This approach enables public pages to be statically rendered whilst the /puck route can
* remain dynamic.
*
* This route now includes token-based authentication for security
*/

import "@measured/puck/puck.css";
import "../../styles.css";
import { Client } from "./client";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { validateToken, extractTokenFromSearchParams } from "lib/tokenValidation";
import UnauthorizedAccess from "components/UnauthorizedAccess";

// Use ISR for editor with no caching to get fresh draft data  
export const revalidate = 0; // Always revalidate (no caching for editor)

// Helper function to validate puck path pattern
function isValidPuckPath(puckPath: string[]): boolean {
    // Check if puckPath array is empty or undefined
    if (!puckPath || !Array.isArray(puckPath)) {
        return false;
    }

    // Check if any path segment contains dots (like com.chrome.devtools or file.json)
    return !puckPath.some(segment => segment.includes('.'));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ puckPath: string[] }>;
}): Promise<Metadata> {
  const { puckPath = [] } = await params;

  if (!isValidPuckPath(puckPath)) {
    return {
      title: "Page Not Found",
      description: "The requested page could not be found",
      publisher: process.env.NEXT_PUBLIC_PUBLISHER_NAME || "",
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_WEBSITE_URL || ''}/pages/puck/${puckPath.join('/')}`,
      },
    };
  }

  const path = `/${puckPath.join("/")}`;

  // Format page title for editor
  const formatPageTitle = (pagePath: string): string => {
    if (pagePath === "/") {
      return "Homepage Edit | Home page";
    }
    // Remove leading slash and split by hyphens
    const pageName = pagePath.replace(/^\//, "") || "home";
    const capitalizedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);

    return `Edit | ${capitalizedPageName} page`;
  };

  return {
    title: formatPageTitle(path),
    publisher: process.env.NEXT_PUBLIC_PUBLISHER_NAME || "",
    robots: "noindex, nofollow", // Prevent search engines from indexing editor pages
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_WEBSITE_URL || ''}/pages/puck${path}`,
    },
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ puckPath: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { puckPath = [] } = await params;

  if (!isValidPuckPath(puckPath)) {
    return notFound();
  }

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

  const path = `/${puckPath.join("/")}`;

  // isDraft=true (default) from Draft tab; isDraft=false from Published tab
  const isDraft = resolvedSearchParams?.isDraft !== "false";

  return <Client path={path} isDraft={isDraft} editToken={token} />;
}
 