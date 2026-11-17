'use client';

import { useState, useEffect } from 'react';
import { getCustomerReviews, CustomerReviewsData } from '@services/reviewRatingService';
import { getCookie } from '@lib/cookie';

interface Testimonial {
  id: string;
  name: string;
  rating: number;
  review: string;
  avatar: string;
  location: string;
  orderId: string;
  createdAt: string;
  status: string;
}

interface TestimonialsResolvedData {
  testimonials: Testimonial[];
  loading: boolean;
  error: string | null;
  totalReviews: number;
}

interface UseTestimonialsDataOptions {
  filterModeratedReviews?: boolean;
  maxTestimonials?: number;
  storeId?: string;
}

/**
 * Hook to fetch testimonials data client-side
 * Used for streaming/progressive loading - allows static shell to render while data loads
 */
export function useTestimonialsData(
  shouldFetch: boolean,
  options: UseTestimonialsDataOptions = {}
): TestimonialsResolvedData {
  const [data, setData] = useState<TestimonialsResolvedData>({
    testimonials: [],
    loading: shouldFetch,
    error: null,
    totalReviews: 0
  });

  useEffect(() => {
    if (!shouldFetch) {
      return;
    }

    let isMounted = true;

    async function fetchTestimonials() {
      try {
        const token = getCookie('token') || undefined;
        const authToken = token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : undefined;
        const response: CustomerReviewsData | null = await getCustomerReviews(authToken, options.storeId);
        
        if (!isMounted) return;

        if (!response?.data?.length) {
          setData({
            testimonials: [],
            loading: false,
            error: null,
            totalReviews: 0
          });
          return;
        }

        const transformedTestimonials: Testimonial[] = response.data.map((review) => ({
          id: review.id?.toString() || Math.random().toString(),
          name: `${review.user_firstname || 'Anonymous'} ${review.user_lastname || ''}`.trim(),
          rating: review.overall_rating || 0,
          review: review.content || review.title || 'No review content available',
          avatar: review.user_profilepic || '',
          location: '',
          orderId: review.order_id || '',
          createdAt: review.created_at || '',
          status: review.status || 'active'
        }));

        const filteredTestimonials = options.filterModeratedReviews 
          ? transformedTestimonials.filter((testimonial) => testimonial.status === 'active')
          : transformedTestimonials;

        const limitedTestimonials = options.maxTestimonials 
          ? filteredTestimonials.slice(0, options.maxTestimonials)
          : filteredTestimonials;

        setData({
          testimonials: limitedTestimonials,
          loading: false,
          error: null,
          totalReviews: response.data.length
        });
      } catch (error) {
        if (!isMounted) return;
        
        setData({
          testimonials: [],
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch testimonials',
          totalReviews: 0
        });
      }
    }

    fetchTestimonials();

    return () => {
      isMounted = false;
    };
  }, [shouldFetch, options.filterModeratedReviews, options.maxTestimonials, options.storeId]);

  return data;
}

export default useTestimonialsData;

