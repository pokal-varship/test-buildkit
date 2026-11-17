
import StarIcon from '@components/icons/Star';
import { cn } from '@lib/utils';
import { FC } from 'react';
import ProgressBar from './ProgressBar';

export type Breakdown = {
  rating: number;
  count: number;
  color: string;
};

type RatingBreakdownProps = {
  breakdownData: Breakdown[];
  icon?: React.ReactNode;
  progressBarClassName?: string;
  remainingPercentageColor?: string;
  progressPercentageClassName?: string;
  progressBarHeight?: string;
  ratingCountClassName?: string;
  ratingItemClassName?: string;
  className?: string;
  maxRating?: number;
  ratingTextClassName?: string;
};

const RatingBreakdown: FC<RatingBreakdownProps> = ({
  breakdownData,
  progressBarClassName,
  remainingPercentageColor = 'var(--rating-bg-secondary)',
  progressPercentageClassName,
  progressBarHeight,
  ratingCountClassName,
  ratingItemClassName,
  className,
  maxRating = 5,
  ratingTextClassName,
}) => {
  const totalCount = breakdownData?.reduce((acc, curr) => acc + curr.count, 0);
  return (
    <div className={cn('', className)}>
      {breakdownData?.map((item, index) => (
        <div
          key={item?.rating}
          className={cn('flex items-center gap-x-2 md:gap-x-2 min-w-0 w-full', ratingItemClassName)}
        >
         <p className={cn('flex items-center gap-2 small-font', ratingTextClassName)}>
            {maxRating - index}
            <StarIcon width="14" height="14" className="mb-0.5" />
          </p>
          <ProgressBar
            percentage={(item.count / totalCount) * 100}
            color={item.color ?? 'var(--primary-text)'}
            className={cn('w-full', progressBarClassName)}
            remainingPercentageColor={remainingPercentageColor}
            progressPercentageClassName={progressPercentageClassName}
            progressBarHeight={progressBarHeight}
          />
           
          <p className={cn('small-font flex md:text-sm whitespace-nowrap min-w-fit', ratingCountClassName)}>
          <span className='inline-block w-5 text-left'>{item?.count}</span>
          </p>
        </div>
      ))}
    </div>
  );
};
export default RatingBreakdown;