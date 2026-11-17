'use client';

import DislikeIcon from '@components/icons/DislikeIcon';
import LikeIcon from '@components/icons/LikeIcon';
import Icon from '@components/image/Icons';
import { MediaType } from '@components/type/pdp.type';
import { REVIEW_MORE_ICON } from '@config/Header/image.config';
import { useReviewReaction } from '@hooks/useReviewReaction';
import { cn } from '@lib/utils';
import { ReviewReactionType } from '@services/reviewRatingService';
import React from 'react';
import useLang from '@hooks/useLang';
import { TranslationKeys } from 'types';
import { LanguageCode } from 'types';

export type ReviewReactionActionsProps = {
  reviewId: string;
  productId?: string;
  initialLikes?: number;
  initialDislikes?: number;
  media?: MediaType[];
  className?: string;
  iconSize?: number;
  showReport?: boolean;
  stopClickPropagation?: boolean;
};

type ReactionButtonProps = {
  type: ReviewReactionType;
  count: number;
  active: boolean;
  disabled: boolean;
  iconSize: number;
  onClick: (e: React.MouseEvent) => void;
};

const ReactionButton: React.FC<ReactionButtonProps> = ({
  type,
  count,
  active,
  disabled,
  iconSize,
  onClick,
}) => {
  const fill = active ? 'var(--primary-color)' : 'var(--secondary-text)';
  const IconComponent = type === 'like' ? LikeIcon : DislikeIcon;

  return (
    <button
      type="button"
      aria-label={`${type} review`}
      disabled={disabled}
      onClick={onClick}
      className="flex items-center gap-1 text-[var(--secondary-text)] disabled:opacity-60"
    >
      <IconComponent width={iconSize} height={iconSize} fill={fill} className="cursor-pointer" />
      <span className="extra-small-font">{count}</span>
    </button>
  );
};

const ReviewReactionActions: React.FC<ReviewReactionActionsProps> = ({
  reviewId,
  productId,
  initialLikes = 0,
  initialDislikes = 0,
  media = [],
  className,
  iconSize = 16,
  showReport = true,
  stopClickPropagation = true,
}) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const {
    likes,
    dislikes,
    userReaction,
    isSubmitting,
    isMenuOpen,
    menuRef,
    setIsMenuOpen,
    handleLike,
    handleDislike,
    handleReport,
  } = useReviewReaction({ reviewId, productId, initialLikes, initialDislikes, media });

  const onAction = (e: React.MouseEvent, action: () => void) => {
    if (stopClickPropagation) e.stopPropagation();
    action();
  };

  return (
    <div className={cn('flex items-center gap-3 shrink-0', className)}>
      <ReactionButton
        type="like"
        count={likes}
        active={userReaction === 'like'}
        disabled={isSubmitting}
        iconSize={iconSize}
        onClick={(e) => onAction(e, handleLike)}
      />
      <ReactionButton
        type="dislike"
        count={dislikes}
        active={userReaction === 'dislike'}
        disabled={isSubmitting}
        iconSize={iconSize}
        onClick={(e) => onAction(e, handleDislike)}
      />

      {showReport && (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Review options"
            onClick={(e) => onAction(e, () => setIsMenuOpen((open) => !open))}
            className="flex items-center justify-center"
          >
            <Icon
              icon={`${REVIEW_MORE_ICON}#review-more`}
              width={4}
              height={14}
              viewBox="0 0 4 14"
              color="var(--secondary-text)"
              className="cursor-pointer"
            />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 z-20 min-w-[120px] rounded-lg border border-[var(--rating-border-primary)] bg-[var(--primary-background)] shadow-md py-1">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={(e) => onAction(e, handleReport)}
                className="w-full px-3 py-2 text-left text-sm text-[var(--primary-text)] hover:bg-[var(--tertiary-background)] disabled:opacity-60"
              >
                {lang.report}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewReactionActions;
