import StarIcon from "@components/icons/Star";
import { cn } from "@lib/utils";
import Image from "next/image";
import { FC, ReactNode } from "react";

type StarRatingSummaryProps = {
  rating?: number;
  totalRatings?: string;
  totalReviews?: string;
  className?: string;
  avgRatingWrapperClassName?: string;
  ratingWrapperClassName?: string;
  totalRatingsTextClassName?: string;
  reviewsTextClassName?: string;
  avgRatingTextClassName?: string;
  starIcon?: ReactNode;
};

const StarRatingSummary: FC<StarRatingSummaryProps> = ({
  rating,
  totalRatings,
  totalReviews,
  className,
  avgRatingWrapperClassName,
  ratingWrapperClassName,
  totalRatingsTextClassName,
  reviewsTextClassName,
  avgRatingTextClassName,
  starIcon = <StarIcon width={'28px'} height={'28px'} pathFillColor={'var(--rating-bg-primary)'} />,
}) => (
  <div
    className={cn('flex flex-col gap-3 justify-center items-center', className)}
  >
    {rating ? <div className={cn('flex items-center gap-1', avgRatingWrapperClassName)}>
      <span className={cn('text-[27px] md:text-3xl font-semibold', avgRatingTextClassName)}>
        {rating}
      </span>
      {starIcon}
    </div> : null}

    {totalRatings || totalReviews ?
      <div className={cn('flex gap-3 items-center text-xs md:text-sm', ratingWrapperClassName)}>
        {totalRatings && <span className={cn(' ', totalRatingsTextClassName)}>
          {totalRatings}
        </span>}
        {totalReviews && <span className={cn(' ', reviewsTextClassName)}>
          {totalReviews}
        </span>}
      </div> : <Image src="/images/icon/error.svg" alt="Error" className='w-[82px] h-[82px] md:w-[100px] md:h-[100px]' width={100} height={100} />}
  </div>
);
export default StarRatingSummary;