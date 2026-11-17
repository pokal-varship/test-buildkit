import { MediaType } from '@components/type/pdp.type';
import { CustomError } from '@components/header/types';
import { NO_CATEGORY_PLACEHOLDER } from '@config/Header/image.config';
import { getTenantConfig } from '@config/tenant.config';
import { close_dialog, open_dialog } from '@lib/modalHandler';
import { setAllReviewsForMedia, setUserReviewReactions } from '@redux/slices/productReviewSlice';
import { AppDispatch } from '@redux/store';
import { fetchAllProductReviews } from '@services/pdp';
import {
  getProductUserReviewLikes,
  ProductUserReviewLikesResponse,
  ReviewReactionType,
} from '@services/reviewRatingService';

const DEFAULT_THUMBNAIL =
  getTenantConfig().productPlaceholderImageUrl || NO_CATEGORY_PLACEHOLDER;

const LOGIN_DIALOG = {
  open: true,
  type: 'login' as const,
  handlerDialog: () => {},
  handleClose: () => {},
  anchor: 'bottom' as const,
  onlyDialog: false,
  sxStyle: {
    '& .MuiDialogContent-root': {
      padding: '20px 16px',
      backgroundColor: 'var(--tertiary-background)',
    },
  },
};

const REPORT_REVIEW_DIALOG = {
  anchor: 'bottom' as const,
  type: 'reportReview' as const,
  handlerDialog: () => {},
  onlyDialog: false,
  dialogPosition: 'bottom' as const,
  sxStyle: {
    '& .MuiPaper-root': {
      maxWidth: '500px',
      width: '100%',
    },
    '& .MuiDialogContent-root': {
      padding: '24px',
    },
    '& .MuiDrawer-paper': {
      padding: '24px 16px',
    },
  },
};

export const getReviewReactionErrorMessage = (error: unknown, fallback: string) =>
  (error as CustomError).response?.data?.message || fallback;

export const getNextReviewReaction = (
  type: ReviewReactionType,
  current: ReviewReactionType | null,
  setLikes: (fn: (n: number) => number) => void,
  setDislikes: (fn: (n: number) => number) => void
): ReviewReactionType | null => {
  const removing = current === type;

  if (current === 'like') setLikes((n) => Math.max(0, n - 1));
  else if (current === 'dislike') setDislikes((n) => Math.max(0, n - 1));

  if (!removing) {
    if (type === 'like') setLikes((n) => n + 1);
    else setDislikes((n) => n + 1);
  }

  return removing ? null : type;
};

export const openLoginForReviewAction = (onSuccess: () => void | Promise<void>) => {
  open_dialog('login', { ...LOGIN_DIALOG, propsData: { onSuccess } });
};

export const openReportReviewModal = (reviewId: string, storeId: string) => {
  open_dialog('reportReview', {
    ...REPORT_REVIEW_DIALOG,
    open: true,
    propsData: { reviewId, storeId },
    handleClose: () => close_dialog(['reportReview']),
  });
};

export const getReviewThumbnailUrl = (media?: MediaType[]): string => {
  const first = media?.[0];
  if (!first) return DEFAULT_THUMBNAIL;
  return first.thumbnail || first.url || first.value || first.media || DEFAULT_THUMBNAIL;
};

export const parseUserReviewReactions = (
  response: ProductUserReviewLikesResponse | null | undefined
): Record<string, ReviewReactionType> => {
  const items = Array.isArray(response) ? response : response?.data;
  if (!Array.isArray(items)) return {};

  return items.reduce<Record<string, ReviewReactionType>>((acc, item) => {
    const reviewId = item.review_id ?? item.reviewId;
    const type = (item.reaction_type ?? item.reactionType)?.toLowerCase();

    if (reviewId != null && (type === 'like' || type === 'dislike')) {
      acc[String(reviewId)] = type;
    }
    return acc;
  }, {});
};

export const syncUserReviewLikes = async (
  dispatch: AppDispatch,
  productId: string,
  storeId: string
) => {
  const response = await getProductUserReviewLikes(productId, storeId);
  dispatch(
    setUserReviewReactions({
      productId,
      reactions: parseUserReviewReactions(response),
    })
  );
};

export const syncProductReviews = async (
  dispatch: AppDispatch,
  productId: string,
  storeId: string
) => {
  const reviews = await fetchAllProductReviews(productId, storeId);
  dispatch(setAllReviewsForMedia(reviews));
};

export const syncReviewReactionData = (
  dispatch: AppDispatch,
  productId: string,
  storeId: string
) =>
  Promise.allSettled([
    syncUserReviewLikes(dispatch, productId, storeId),
    syncProductReviews(dispatch, productId, storeId),
  ]);
