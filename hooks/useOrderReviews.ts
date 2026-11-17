import { useState, useEffect, useCallback, useRef } from "react";
import { getReview, getStoreReviewUser } from "@services/reviewRatingService";
import { MediaType } from "@components/type/pdp.type";

interface StoreReviewData {
  ratings: Array<{
    id: string;
    parameter_name: string;
    rating: number;
  }>;
  content?: string;
}

interface ProductReviewData {
  reviewId: string;
  productId: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  title: string;
  content: string;
  sourceChannel: string;
  orderId: string;
  createdAt: number;
  status: string;
  rating: number;
  likes: number;
  dislikes: number;
  media: MediaType[];
  parameter_review: Array<{
    product_id: string;
    parameter_id: string;
    parameter_name: string;
    rating: number;
    review_id: number;
  }>;
}

export const useOrderReviews = (orderNumber?: string, orderStatus?: string) => {
  const [storeReview, setStoreReview] = useState<StoreReviewData | null>(null);
  const [productReviews, setProductReviews] = useState<ProductReviewData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetchedOrderRef = useRef<string | null>(null);

  const fetchReviews = useCallback(async (force = false) => {
    if (!orderNumber) return;
    if (!force && fetchedOrderRef.current === orderNumber) return;

    fetchedOrderRef.current = orderNumber;
    setIsLoading(true);
    try {
      const [storeReviewResponse, productReviewResponse] = await Promise.all([
        getStoreReviewUser(orderNumber),
        getReview(orderNumber),
      ]);

      if (storeReviewResponse?.data && storeReviewResponse.data.length > 0) {
        setStoreReview(storeReviewResponse.data[0]);
      }

      if (productReviewResponse?.data?.reviews && productReviewResponse.data.reviews.length > 0) {
        setProductReviews(productReviewResponse.data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    if (orderNumber && orderStatus === "DELIVERED") {
      fetchReviews();
    }
  }, [orderNumber, orderStatus, fetchReviews]);

  // Helper function to calculate store average rating
  const getStoreAverageRating = useCallback(() => {
    if (!storeReview?.ratings || storeReview.ratings.length === 0) return 0;
    const total = storeReview.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    return total / storeReview.ratings.length;
  }, [storeReview]);

  // Helper function to get product review by ID
  const getProductReview = useCallback((productId: string) => {
    return productReviews.find(review => review.productId === productId);
  }, [productReviews]);

  return {
    storeReview,
    productReviews,
    isLoading,
    getStoreAverageRating,
    getProductReview,
    refetchReviews: () => fetchReviews(true),
  };
};
