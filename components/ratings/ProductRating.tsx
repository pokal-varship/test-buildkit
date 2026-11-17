import React from 'react';
import StarIcon from '@components/icons/Star';
import { truncateToFixed } from '../../utils/string-operations';
import { useLang } from '@hooks/useLang';

interface Rating {
  average?: number;
  count?: number;
}

interface OverallRatings {
  average?: number;
  totalReview?: number;
}

interface ProductRatingProps {
  rating?: Rating;
  overallRatings?: OverallRatings;
  className?: string;
}

const ProductRating: React.FC<ProductRatingProps> = ({
  rating,
  overallRatings,
  className
}) => {
  const currentRating = rating?.average ?? overallRatings?.average;
  const reviewCount = rating?.count ?? overallRatings?.totalReview ?? 0;
  const hasRating = typeof currentRating === 'number' && currentRating > 0;
  const hasReviews = typeof reviewCount === 'number' && reviewCount > 0;
  const [lang] = useLang();
  if (!hasRating && !hasReviews) return null;

  return (
    <>
    <div className={`${className || ""} extra-small-font md-heading-5 flex items-center text-[var(--secondary-text)] gap-1 text-nowrap`}>
      {hasRating && (
        <>
          {/* Mobile: smaller star, Desktop: larger star */}
          <StarIcon width="12" height="12" className="h-3 w-3 md:w-4 md:h-4" />
          {/* <StarIcon width="16" height="16" className="hidden md:block" /> */}
          <span className="extra-small-font md-heading-5">{truncateToFixed(currentRating,2)}</span>
        </>
      )}
      {hasRating && hasReviews && (
       <>
        <span className="lg:block hidden text-[var(--secondary-text)]"> | </span>
        </>
      )}
      {hasReviews && (
        <>
          <span className="extra-small-font md-heading-5 lg:hidden">({reviewCount})</span>
          <span className="extra-small-font md-heading-5 hidden lg:inline">{reviewCount} {lang.reviews}</span>
        </>
      )}
    </div>
    
    </>
  );
};

export default ProductRating; 