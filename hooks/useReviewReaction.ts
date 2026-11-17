import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MediaType } from '@components/type/pdp.type';
import {
  getNextReviewReaction,
  getReviewReactionErrorMessage,
  getReviewThumbnailUrl,
  openLoginForReviewAction,
  openReportReviewModal,
  syncReviewReactionData,
} from '@components/reviews/reviewReaction.utils';
import { useToast } from '@components/toast/Toast';
import { useAuth } from '@hooks/useAuth';
import { setUserReviewReaction } from '@redux/slices/productReviewSlice';
import { RootState } from '@redux/store';
import {
  buildReviewReactionPayload,
  postReviewReaction,
  ReviewReactionType,
} from '@services/reviewRatingService';

export type UseReviewReactionParams = {
  reviewId: string;
  productId?: string;
  initialLikes?: number;
  initialDislikes?: number;
  media?: MediaType[];
};

/**
 * Per-review like/dislike/report actions for ReviewReactionActions.
 * - Optimistic UI for counts and user's reaction highlight
 * - Syncs with API and refreshes Redux after like/dislike
 * - Opens login or report modal when needed
 */
export const useReviewReaction = ({
  reviewId,
  productId: productIdProp,
  initialLikes = 0,
  initialDislikes = 0,
  media = [],
}: UseReviewReactionParams) => {
  const dispatch = useDispatch();
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const storeId = useSelector(
    (state: RootState) => state.store.storeId || process.env.NEXT_PUBLIC_STORE_ID || ''
  );
  const userReaction = useSelector(
    (state: RootState) => state.productReviews.userReviewReactions[reviewId] ?? null
  );
  const reactionsProductId = useSelector(
    (state: RootState) => state.productReviews.userReviewReactionsProductId
  );

  const productId = productIdProp || reactionsProductId || undefined;

  useEffect(() => {
    setLikes(initialLikes);
    setDislikes(initialDislikes);
  }, [reviewId, initialLikes, initialDislikes]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const closeMenu = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, [isMenuOpen]);

  const runWithAuth = useCallback(
    (action: () => Promise<void>) => {
      if (isAuthenticated) return action();
      openLoginForReviewAction(action);
    },
    [isAuthenticated]
  );

  const handleReaction = useCallback(
    (type: ReviewReactionType) =>
      runWithAuth(async () => {
        if (!reviewId || isSubmitting) return;

        const snapshot = { likes, dislikes, reaction: userReaction };
        const nextReaction = getNextReviewReaction(type, userReaction, setLikes, setDislikes);
        dispatch(setUserReviewReaction({ reviewId, reaction: nextReaction }));

        try {
          setIsSubmitting(true);
          await postReviewReaction(
            buildReviewReactionPayload(reviewId, type, getReviewThumbnailUrl(media)),
            storeId
          );
          if (productId) await syncReviewReactionData(dispatch, productId, storeId);
        } catch (error) {
          setLikes(snapshot.likes);
          setDislikes(snapshot.dislikes);
          dispatch(setUserReviewReaction({ reviewId, reaction: snapshot.reaction }));
          toast('error', getReviewReactionErrorMessage(error, 'Unable to update reaction'));
        } finally {
          setIsSubmitting(false);
        }
      }),
    [dispatch, isSubmitting, likes, dislikes, media, productId, reviewId, runWithAuth, storeId, toast, userReaction]
  );

  const handleReport = useCallback(() => {
    if (!reviewId) return;

    const openModal = () => {
      setIsMenuOpen(false);
      openReportReviewModal(reviewId, storeId);
    };

    if (isAuthenticated) {
      openModal();
      return;
    }

    openLoginForReviewAction(openModal);
  }, [isAuthenticated, reviewId, storeId]);

  return {
    likes,
    dislikes,
    userReaction,
    isSubmitting,
    isMenuOpen,
    menuRef,
    setIsMenuOpen,
    handleLike: () => handleReaction('like'),
    handleDislike: () => handleReaction('dislike'),
    handleReport,
  };
};
