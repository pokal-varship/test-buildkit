"use client";

import { Data } from "@measured/puck";
import PuckClientRenderer from "./PuckClientRenderer";

interface PuckClientRendererWithDraftProps {
  data: Data; // Draft data fetched server-side
}

/**
 * PuckClientRendererWithDraft Component
 * 
 * This component renders draft data passed from the server.
 * 
 * Data Flow:
 * 1. Server-side: Draft data is fetched in app/page.tsx using getPageDraft()
 * 2. Client-side: Component receives data as prop and renders it
 * 
 * Props:
 * - data: Draft data fetched server-side
 * 
 * Benefits:
 * - Server-side fetch = faster first render, better SEO, no duplicate API calls
 * - Simple and efficient = no unnecessary client-side API calls
 */
export default function PuckClientRendererWithDraft({ 
  data
}: PuckClientRendererWithDraftProps) {
  // Render using data from server-side fetch
  return <PuckClientRenderer data={data} />;
}
