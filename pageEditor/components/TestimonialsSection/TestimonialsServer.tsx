import { Suspense } from 'react';
import { TestimonialsSection } from './component';
import { TestimonialsSkeleton } from './TestimonialsSkeleton';
import { testimonialsDataContext } from 'pageEditor/contexts/testimonialsDataContext';
import { TestimonialsSectionProps } from './fields';

interface TestimonialsServerProps {
  props: TestimonialsSectionProps;
  token?: string;
}

/**
 * Async Server Component that fetches testimonials data
 * This component is wrapped in Suspense for PPR (Partial Prerendering)
 */
async function TestimonialsContent({ props, token }: TestimonialsServerProps) {
  // Fetch testimonials data server-side
  const resolvedData = await testimonialsDataContext.getResolvedData(props, token);
  
  // Pass resolved data to the client component
  return <TestimonialsSection {...props} resolvedData={resolvedData} />;
}

/**
 * Server Component wrapper with Suspense boundary for Partial Prerendering
 * 
 * This enables:
 * 1. Static shell to be pre-rendered and cached (ISR)
 * 2. Testimonials content to be streamed when ready
 * 3. Skeleton fallback shown while data is loading
 * 
 * Usage in page.tsx:
 * ```tsx
 * <TestimonialsWithSuspense props={testimonialsProps} token={accessToken} />
 * ```
 */
export function TestimonialsWithSuspense({ props, token }: TestimonialsServerProps) {
  return (
    <Suspense fallback={<TestimonialsSkeleton />}>
      <TestimonialsContent props={props} token={token} />
    </Suspense>
  );
}

export default TestimonialsWithSuspense;

