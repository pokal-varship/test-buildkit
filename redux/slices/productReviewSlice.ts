import { Review, ReviewResponse } from "@components/type/pdp.type";
import { ReviewReactionType } from "@services/reviewRatingService";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface OrdersState {
  reviewsData: ReviewResponse | null;
  allReviews: Review[] | [];
  allReviewsForMedia: Review[] | [];
  isLoading: boolean;
  error: Error | null;
  currentReview: Review | null;
  userReviewReactions: Record<string, ReviewReactionType>;
  userReviewReactionsProductId: string | null;
}

const initialState: OrdersState = {
  reviewsData: null,
  allReviews: [],
  allReviewsForMedia: [],
  isLoading: false,
  error: null,
  currentReview: null,
  userReviewReactions: {},
  userReviewReactionsProductId: null,
};

const productReviewSlice = createSlice({
  name: "productReview",
  initialState,
  reducers: {
    setReviewsData: (state, action: PayloadAction<ReviewResponse | null>) => {
      state.reviewsData = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<Error | null>) => {
      state.error = action.payload;
    },
    setCurrentReview: (state, action: PayloadAction<Review | null>) => {
        state.currentReview = action.payload;
    },
    setAllReviews: (state, action: PayloadAction<Review[]>) => {
      state.allReviews = action.payload;
    },
    setAllReviewsForMedia: (state, action: PayloadAction<Review[]>) => {
      state.allReviewsForMedia = action.payload;
    },
    setUserReviewReactions: (
      state,
      action: PayloadAction<{ productId: string; reactions: Record<string, ReviewReactionType> }>
    ) => {
      state.userReviewReactionsProductId = action.payload.productId;
      state.userReviewReactions = action.payload.reactions;
    },
    setUserReviewReaction: (
      state,
      action: PayloadAction<{ reviewId: string; reaction: ReviewReactionType | null }>
    ) => {
      if (action.payload.reaction === null) {
        delete state.userReviewReactions[action.payload.reviewId];
        return;
      }

      state.userReviewReactions[action.payload.reviewId] = action.payload.reaction;
    },
    clearUserReviewReactions: (state) => {
      state.userReviewReactions = {};
      state.userReviewReactionsProductId = null;
    },
  },
});

export const {
  setReviewsData,
  setIsLoading,
  setError,
  setCurrentReview,
  setAllReviews,
  setAllReviewsForMedia,
  setUserReviewReactions,
  setUserReviewReaction,
  clearUserReviewReactions,
} = productReviewSlice.actions;

export default productReviewSlice.reducer;
