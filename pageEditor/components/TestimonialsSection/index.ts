import type { ComponentConfig, ComponentData } from "@measured/puck";
import { TestimonialsSection } from "./component";
import { testimonialsSectionFields, testimonialsSectionDefaultProps, type TestimonialsSectionProps } from "./fields";
import { testimonialsDataContext } from "../../contexts/testimonialsDataContext";
import { getStoreIdBySlugClient } from "@services/storeServiceClient";
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
const resolveData = async (data: Omit<ComponentData<TestimonialsSectionProps, string, Record<string, any>>, "type">, params: Record<string, any> = {}) => {
  const { props } = data;
  
  // Extract token from params if available
  const token = params?.token;
  let storeId = params?.storeId;
  
  // If storeId not provided and we're in browser (editor mode), get it from URL
  if (!storeId && typeof window !== 'undefined') {
    const storeSlug = getStoreSlugFromUrl();
    if (storeSlug) {
      try {
        storeId = await getStoreIdBySlugClient(storeSlug);
      } catch {
        // Failed to get store ID, continue without it
      }
    }
  }
  
  // Use shared data context with storeId
  const resolvedData = await testimonialsDataContext.getResolvedData(props, token, storeId);
  
  return {
    props: {
      ...props,
      resolvedData
    }
  };
};

export const testimonialsSectionConfig: ComponentConfig<TestimonialsSectionProps> = {
  fields: testimonialsSectionFields,
  defaultProps: testimonialsSectionDefaultProps,
  render: TestimonialsSection,
  resolveData,
  label: "Testimonials",
};

export { TestimonialsSection, type TestimonialsSectionProps };
export { TestimonialsWithSuspense } from './TestimonialsServer';
export { TestimonialsSkeleton } from './TestimonialsSkeleton'; 