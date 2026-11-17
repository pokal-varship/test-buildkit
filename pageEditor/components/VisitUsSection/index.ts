import type { ComponentConfig, ComponentData } from "@measured/puck";
import { VisitUsSection } from "./component";
import { visitUsSectionFields as fields, visitUsSectionDefaultProps as defaultProps, type VisitUsSectionProps } from "./fields";
import { visitUsDataContext } from "../../contexts/visitUsDataContext";
import { RESERVED_ROUTES } from "@config/routes.config";

/**
 * Extracts store slug from the current URL path.
 * Works for /store-slug, /store-slug/edit, and /pages/puck/store-slug patterns.
 */
const getStoreSlugFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const pathname = window.location.pathname;
  
  // Remove /edit suffix if present
  let cleanPath = pathname.replace(/\/edit$/, '');
  
  // Remove /pages/puck prefix if present (internal editor route)
  cleanPath = cleanPath.replace(/^\/pages\/puck/, '');
  
  // Get the first path segment (store slug)
  const segments = cleanPath.split('/').filter(Boolean);
  
  if (segments.length >= 1) {
    const slug = segments[0];
    // Check if it's not a reserved route
    if (!RESERVED_ROUTES.includes(slug) && !slug.includes('.')) {
      return slug;
    }
  }
  
  return null;
};

// Data resolution function for Puck editor
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resolveData = async (data: Omit<ComponentData<VisitUsSectionProps, string, Record<string, any>>, "type">, params: Record<string, any> = {}) => {
  const { props } = data;
  
  // Extract token and timezone from params if available
  const token = params?.token;
  const timezone = params?.timezone; // Timezone from server-side (e.g., from cookies)
  let storeSlug = params?.storeSlug;
  
  // If storeSlug not provided and we're in browser (editor mode), get it from URL
  if (!storeSlug && typeof window !== 'undefined') {
    storeSlug = getStoreSlugFromUrl();
  }
  
  // Use shared data context with storeSlug to filter to specific store
  const resolvedData = await visitUsDataContext.getResolvedDataFromProps(props, token, timezone, storeSlug);
  
  return {
    props: {
      ...props,
      resolvedData
    }
  };
};

export const visitUsSectionConfig: ComponentConfig<VisitUsSectionProps> = {
  fields: fields,
  defaultProps: defaultProps,
  render: VisitUsSection,
  resolveData,
  label: "Visit Us",
};

export { VisitUsSection };
export type { VisitUsSectionProps } from "./fields"; 