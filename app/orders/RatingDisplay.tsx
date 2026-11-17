import React, { FC } from "react";
import { MediaType } from "@components/type/pdp.type";
import StarIcon from "@components/icons/Star";

interface RatingDisplayProps {
  title: string;
  rating: number;
  reviewText?: string;
  media?: MediaType[];
  onEditClick: () => void;
  showMedia?: boolean;
  gradientBackground?: boolean;
}

const RatingDisplay: FC<RatingDisplayProps> = ({
  title,
  rating,
  reviewText,
  media = [],
  // onEditClick,
  showMedia = false,
  gradientBackground = false,
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const starSize = "28px";
    const filledColor = "var(--rating-bg-primary)";
    const filledBorder = "var(--rating-border)";
    const emptyColor = "var(--rating-bg-secondary)";
    const emptyBorder = "var(--rating-border-secondary)";

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIcon
            key={i}
            width={starSize}
            height={starSize}
            pathFillColor={filledColor}
            borderColor={filledBorder}
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="relative inline-flex items-center justify-center w-7 h-7">
            <StarIcon
              width={starSize}
              height={starSize}
              pathFillColor={emptyColor}
              borderColor={emptyBorder}
            />
            <span className="absolute left-0 top-0 overflow-hidden w-1/2 h-7">
              <StarIcon
                width={starSize}
                height={starSize}
                pathFillColor={filledColor}
                borderColor={filledBorder}
              />
            </span>
          </span>
        );
      } else {
        stars.push(
          <StarIcon
            key={i}
            width={starSize}
            height={starSize}
            pathFillColor={emptyColor}
            borderColor={emptyBorder}
          />
        );
      }
    }
    return stars;
  };

  return (
    <div
      className={`border border-[var(--borders-dividers)] rounded-lg p-4${gradientBackground ? "" : " bg-[var(--cards-containers)]"}`}
      style={gradientBackground ? { background: "linear-gradient(90deg, #FFFFFF 0%, #FFF2DA 100%)" } : undefined}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="heading-5 font-500 text-[var(--primary-text)]">{title}</h3>
        {/* <button
          onClick={onEditClick}
          className="text-[var(--accent-color)] font-600 small-font hover:underline"
        >
          Edit
        </button> */}
      </div>
      
      <div className="flex items-center gap-x-2 mb-2">
        <div className="flex items-center gap-x-1">
          {renderStars(rating)}
        </div>
        <span className="font-600 text-[var(--primary-text)] flex items-center" style={{ fontSize: 'var(--heading-h2)', height: '28px' }}>
          {rating}
        </span>
      </div>

      {reviewText && (
        <div className="mb-2">
          <p className="small-font text-[var(--primary-text)]">
            {reviewText}
          </p>
        </div>
      )}

      {/* Media Display - only show if showMedia is true and media exists */}
      {showMedia && media && media.length > 0 && (
        <div className="flex gap-x-2">
          {media.slice(0, 2).map((mediaItem, index) => (
            <div key={index} className="relative">
              {mediaItem.type === 'video' ? (
                <div className="w-20 h-20 rounded-md bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl">▶</span>
                </div>
              ) : (
                <img 
                  src={mediaItem.value} 
                  alt="Review media" 
                  className="w-20 h-20 rounded-md object-cover"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RatingDisplay;
