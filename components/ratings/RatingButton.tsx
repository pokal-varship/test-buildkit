import StarIcon from "@components/icons/Star";
import { cn } from "@lib/utils";
import React from "react";
type RatingButtonProps = {
  rating?: number;
  showStar?: boolean;
  description?: string;
  mainContainerClassName?: string;
  ratingContainerClassName?: string;
  ratingTextClassName?: string;
  starHeight?: string;
  starWidth?: string;
  starColor?: string;
  starIconClassName?: string;
  descriptionClassName?: string;
};
const RatingButton = ({
  rating,
  showStar = true,
  description,
  mainContainerClassName,
  ratingContainerClassName,
  ratingTextClassName,
  starHeight = "18",
  starWidth = "18",
  starColor = "var(--rating-bg-primary)",
  starIconClassName,
  descriptionClassName,
}: RatingButtonProps) => {
  const borderAndBgClass = rating
    ? rating >= 4
      ? "bg-[var( --rating-bg-success-opacity)] border-[var(--rating-bg-success-primary)]"
      : rating > 2
      ? "bg-[var(--rating-bg-warning-opacity)] bg-opacity-[0.05] border-[var(--rating-bg-warning-primary)]"
      : "bg-[var(--rating-bg-error-opacity)] bg-opacity-[0.05] border-[var(--rating-bg-error-primary)]"
    : "bg-[var(--rating-bg-primary)]  border-[var(--rating-border)]";
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg justify-center items-center border border-gray-200 p-[10px] w-full",
        borderAndBgClass,
        mainContainerClassName
      )}
    >
      <div className={cn("flex items-center gap-1", ratingContainerClassName)}>
        {(rating || rating == 0) && (
          <span className={cn("text-lg font-bold", ratingTextClassName)}>
            {rating}
          </span>
        )}
        {showStar && (
          <StarIcon
            pathFillColor={starColor}
            height={starHeight}
            width={starWidth}
            className={starIconClassName}
          />
        )}
      </div>
      {description && (
        <p className={cn("text-sm", descriptionClassName)}>{description}</p>
      )}
    </div>
  );
};

export default RatingButton;
