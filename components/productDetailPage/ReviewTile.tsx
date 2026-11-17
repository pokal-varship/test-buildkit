'use client';

import StarIcon from '@components/icons/Star';
import SmartTruncatedText from '@components/ui/SmartTruncatedText';
import ReviewReactionActions from '@components/reviews/ReviewReactionActions';
import { cn } from '@lib/utils';
import React, { useState } from 'react';
import MediaSlider from './MediaSlider';
import { MediaType, ReviewData } from '@components/type/pdp.type';
import ReviewDetailsPopUp from './ReviewDetailsPopUp';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentReview } from '@redux/slices/productReviewSlice';
import { RootState } from '@redux/store';

type ReviewTileProps = {
  rating: number;
  title?: string;
  description?: string;
  media?: MediaType[];
  date: string;
  className?: string;
  cardHeaderClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  dateClassName?: string;
  onTileClick?: () => void;
  productReviewData?: ReviewData;
  likes?: number;
  dislikes?: number;
  reviewId: string;
  productId?: string;
  reactionPlacement?: 'header' | 'footer';
  expandedDescriptions: Record<string, boolean>;
  onDescriptionToggle: (reviewId: string, e: React.MouseEvent) => void;
};

const ReviewTile: React.FC<ReviewTileProps> = ({
  rating,
  title,
  description,
  date,
  className,
  cardHeaderClassName,
  titleClassName,
  descriptionClassName,
  dateClassName,
  media = [],
  productReviewData,
  likes: likesProp,
  dislikes: dislikesProp,
  onTileClick,
  reviewId,
  productId,
  reactionPlacement = 'header',
  expandedDescriptions,
  onDescriptionToggle
}) => {
  const [isReviewMediaOpen, setIsReviewMediaOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const dispatch = useDispatch();
  const { allReviewsForMedia } = useSelector((state: RootState) => state.productReviews);
  const reviewMedia = media.length > 0 ? media : productReviewData?.media;

  const onMediaClick = (index: number) => {
    if (productReviewData) {
      const review = allReviewsForMedia.find(item => item.reviewId === productReviewData.reviewId);
      if (review) {
        dispatch(setCurrentReview(review));
      }
    }
    setIsReviewMediaOpen(true);
    setActiveIndex(index);
    onTileClick?.();
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const reactionActions = (
    <ReviewReactionActions
      reviewId={reviewId}
      productId={productId ?? productReviewData?.productId}
      initialLikes={likesProp ?? productReviewData?.likes ?? 0}
      initialDislikes={dislikesProp ?? productReviewData?.dislikes ?? 0}
      media={reviewMedia}
    />
  );

  return (
    <>
      <div className={cn('pr-2 mt-5 pb-5 flex flex-col gap-2 border-b border-[var(--rating-border-primary)]', className)}>
        <div className={cn('flex items-center gap-3', reactionPlacement === 'header' && 'justify-between', cardHeaderClassName)}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className='flex text-[var(--primary-text-light)] small-font items-center gap-1 bg-[var(--rating-bg-primary)] rounded-3xl px-3 py-1 outline-none focus:bg-transparent active:bg-transparent focus:outline-none select-none shrink-0'>
              {rating}
              <StarIcon height={'12'} width={'12'} pathFillColor={'var(--primary-text-light)'} borderColor={'var(--primary-text-light)'} />
            </div>
            <span
              title={title}
              className={cn('text-[var(--primary-text)] title font-semibold truncate', titleClassName)}
            >
              {title}
            </span>
          </div>

          {reactionPlacement === 'header' && reactionActions}
        </div>

        {media && media.length > 0 && (
          <MediaSlider onMediaClick={onMediaClick} thumbnailContainerClassName='min-w-[70px] mt-2 max-w-[70px] h-[70px] max-h-[70px]' media={media} showTotalCount={false} />
        )}
        {description && (
          <SmartTruncatedText
            text={description}
            maxLines={2}
            className={cn('text-[var(--primary-text)] description small-font mt-1', descriptionClassName)}
            expandedDescriptions={expandedDescriptions}
            productId={reviewId}
            onToggle={onDescriptionToggle}
            moreText=" View more"
            lessText=" View less"
          />
        )}

        {reactionPlacement === 'footer' ? (
          <div className="flex items-center justify-between gap-3">
            <span className={cn('text-gray-400 text-xs', dateClassName)}>
              {date}
            </span>
            {reactionActions}
          </div>
        ) : (
          <span className={cn('text-gray-400 text-xs', dateClassName)}>
            {date}
          </span>
        )}
      </div>
      {isReviewMediaOpen && (
        <ReviewDetailsPopUp
          isReviewMediaOpen={isReviewMediaOpen}
          onClose={() => setIsReviewMediaOpen(false)}
          media={media}
          activeIndex={activeIndex}
          handlePrevious={handlePrevious}
          handleNext={handleNext}
          onMediaClick={onMediaClick}
        />
      )}
    </>
  );
};

export default ReviewTile;
