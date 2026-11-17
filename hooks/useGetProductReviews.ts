import { useState, useEffect, useCallback} from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@redux/store";
import { setIsLoading, setError, clearUserReviewReactions } from "@redux/slices/productReviewSlice";
import { getProductRatingsAndReviews, fetchAllProductReviews } from "@services/pdp";
import { setAllReviews, setReviewsData, setAllReviewsForMedia } from "@redux/slices/productReviewSlice";
import { syncUserReviewLikes } from "@components/reviews/reviewReaction.utils";
import { useAuth } from "@hooks/useAuth";

type UseProductReviewsParams = {
  productId?: string;
  status: number;
};  

// Global cache to prevent duplicate API calls across components
const globalFetchedProducts = new Set<string>();
const globalFetchingProducts = new Set<string>();
const globalFetchedUserReviewLikes = new Set<string>();
const globalFetchingUserReviewLikes = new Set<string>();

export const useGetProductReviews = ({
  productId,
  status,
}: UseProductReviewsParams) => {
  const dispatch = useDispatch();
  const { allReviews } = useSelector((state: RootState) => state.productReviews);
  const [page, setPage] = useState<number>(1);
  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  const fetchReviews = useCallback(async (reset = false) => {
    if (!productId) return;
    dispatch(setIsLoading(true));
    dispatch(setError(null));

    try {
      const response = await getProductRatingsAndReviews(
        {
          productId,
          storeId: process.env.NEXT_PUBLIC_STORE_ID || "",
          tenantId: process.env.NEXT_PUBLIC_TENANT_ID || "",
          token: process.env.NEXT_PUBLIC_API_TOKEN || "",
          page,
          limit: 10,
          isProductReview: 1,
        }
      );
      if (reset) {
        dispatch(setReviewsData(response));
        dispatch(setAllReviews(response.data?.reviews));
      } else {
        dispatch(setReviewsData(response));
        dispatch(setAllReviews([...allReviews, ...response.data?.reviews]));
      }
    } catch (err) {
      dispatch(setError(err instanceof Error ? err : new Error(String(err))));
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [productId, status]);

  useEffect(() => {
    if(productId){
      if(page === 1) {
        fetchReviews(true)
      }else{
        fetchReviews();
      }
    }
  }, [page, fetchReviews, productId]);

  return { allReviews, refetch: fetchReviews, loadMore };
};

export const useGetAllProductReviewsForMedia = ({
  productId,
}: { productId?: string }) => {
  const dispatch = useDispatch();

  const fetchAllReviewsForMedia = useCallback(async () => {
    if (!productId || globalFetchedProducts.has(productId) || globalFetchingProducts.has(productId)) {
      return;
    }

    globalFetchingProducts.add(productId);
    dispatch(setIsLoading(true));
    dispatch(setError(null));
    
    try {
      const allReviews = await fetchAllProductReviews(
        productId,
        process.env.NEXT_PUBLIC_STORE_ID || ""
      );

      dispatch(setAllReviewsForMedia(allReviews));
      globalFetchedProducts.add(productId);
    } catch (err) {
      dispatch(setError(err instanceof Error ? err : new Error(String(err))));
    } finally {
      dispatch(setIsLoading(false));
      globalFetchingProducts.delete(productId);
    }
  }, [productId, dispatch]);

  useEffect(() => {
    if (productId && !globalFetchedProducts.has(productId)) {
      fetchAllReviewsForMedia();
    }
  }, [productId, fetchAllReviewsForMedia]);
};

/**
 * Fetches the logged-in user's like/dislike state for all reviews on a product (PDP).
 * Cached per productId — skips refetch when returning to the same PDP.
 * Stores result in Redux: productReviews.userReviewReactions
 */
export const useProductUserReviewLikes = (productId?: string) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const storeId =
    useSelector((state: RootState) => state.store.storeId) ||
    process.env.NEXT_PUBLIC_STORE_ID ||
    '';

  useEffect(() => {
    if (!productId || !isAuthenticated) {
      dispatch(clearUserReviewReactions());
      if (!isAuthenticated) globalFetchedUserReviewLikes.clear();
      return;
    }

    if (
      globalFetchedUserReviewLikes.has(productId) ||
      globalFetchingUserReviewLikes.has(productId)
    ) {
      return;
    }

    let cancelled = false;
    globalFetchingUserReviewLikes.add(productId);

    syncUserReviewLikes(dispatch, productId, storeId)
      .then(() => {
        if (!cancelled) globalFetchedUserReviewLikes.add(productId);
      })
      .catch(() => {
        if (!cancelled) dispatch(clearUserReviewReactions());
      })
      .finally(() => {
        globalFetchingUserReviewLikes.delete(productId);
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, isAuthenticated, productId, storeId]);
};

