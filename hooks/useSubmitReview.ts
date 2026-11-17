import { ReviewPayload } from "@components/type/order.type";
import { postReview, postStoreReview } from "@services/reviewRatingService";
import { CustomError } from "@components/header/types";
import { useToast } from "@components/toast/Toast";

interface StoreReviewPayload {
  storeid: string;
  user_firstname: string;
  user_lastname: string;
  title: string;
  content: string;
  source_channel: string;
  store_rating: Array<{
    parameter_id: string;
    rating: number;
  }>;
}

export const useSubmitReview = () => {
  const toast = useToast();

  const submitReview = async (payload: ReviewPayload[], storePayload: StoreReviewPayload, storeId: string) => {
    try {
      // Handle both product and store reviews
      if (payload?.length > 0 && storePayload?.store_rating?.length > 0) {
        const [response, storeResponse] = await Promise.all([
          postReview(payload as unknown, storeId),
          postStoreReview(storePayload as unknown, storeId)
        ]);
        return { response, storeResponse };
      } 
      // Handle only product reviews
      else if (payload?.length > 0) {
        const response = await postReview(payload as unknown, storeId);
        return response;
      }
      // Handle only store reviews
      else if (storePayload?.store_rating?.length > 0) {
        const storeResponse = await postStoreReview(storePayload as unknown, storeId);
        return storeResponse;
      }
    } catch (error) {
      const err = error as CustomError;
      toast('error', err.response?.data?.message || "Error posting review");
      throw error;
    }
  };

  return { submitReview };
}; 