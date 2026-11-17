import { getCustomerReviews, CustomerReviewsData } from "@services/reviewRatingService";
import { TestimonialsSectionProps } from "../components/TestimonialsSection/fields";

interface TestimonialsResolvedData {
  testimonials: Array<{
    id: string;
    name: string;
    rating: number;
    review: string;
    avatar: string;
    location: string;
    orderId: string;
    createdAt: string;
    status: string;
  }>;
  loading: boolean;
  error: string | null;
  totalReviews: number;
}

export async function fetchTestimonialsResolvedData(props: TestimonialsSectionProps, token?: string, storeId?: string): Promise<TestimonialsResolvedData> {
  try {
    const response: CustomerReviewsData | null = await getCustomerReviews(token, storeId);
    
    if (!response?.data?.length) {
      return {
        testimonials: [],
        loading: false,
        error: null,
        totalReviews: 0
      };
    }

    // Transform the API response to match the testimonials format
    const transformedTestimonials = response.data.map((review) => ({
      id: review.id?.toString() || Math.random().toString(),
      name: `${review.user_firstname || 'Anonymous'} ${review.user_lastname || ''}`.trim(),
      rating: review.overall_rating || 0,
      review: review.content || review.title || 'No review content available',
      avatar: review.user_profilepic || '',
      location: '', // Not available in the API response
      orderId: review.order_id || '',
      createdAt: review.created_at || '',
      status: review.status || 'active'
    }));

    // Filter out reviews that need moderation if configured
    const filteredTestimonials = props?.advanceSettings?.filterModeratedReviews 
      ? transformedTestimonials.filter((testimonial) => testimonial.status === 'active')
      : transformedTestimonials;

    // Limit the number of testimonials if configured
    const limitedTestimonials = props?.advanceSettings?.maxTestimonials 
      ? filteredTestimonials.slice(0, props.advanceSettings.maxTestimonials)
      : filteredTestimonials;

    return {
      testimonials: limitedTestimonials,
      loading: false,
      error: null,
      totalReviews: response.data.length
    };
  } catch (error: unknown) {
    return {
      testimonials: [],
      loading: false,
      error: error instanceof Error ? error.message : "Failed to fetch testimonials data",
      totalReviews: 0
    };
  }
} 