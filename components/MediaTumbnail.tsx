// import { generateImageBase64FromUrl } from "@lib/helper/ImageGen/imageGen";
import React, { FC } from "react";
import PlayIcon from "./icons/PlayIcon";
import { cn } from "@lib/utils";
import { MediaType } from "./type/pdp.type";
import { generateImageBase64FromUrl } from "@lib/helper/ImageGen/imageGen";

type MediaTumbnailProps = {
  media: MediaType;
  index: number;
  isLastIndex?: boolean;
  showTotalCount?: boolean;
  totalCount?: number;
  containerClassName?: string;
  imageClassName?: string;
  playIconClassName?: string;
  totalCountClassName?: string;
  opacityBgClassName?: string;
  onClick?: (index: number, media?: MediaType) => void;
  isActive?: boolean;
  showActiveBorder?: boolean;
  overlayClickable?: boolean; // NEW
};

const MediaTumbnail: FC<MediaTumbnailProps> = ({
  media,
  index,
  isLastIndex,
  showTotalCount = true,
  totalCount,
  containerClassName,
  imageClassName,
  playIconClassName,
  totalCountClassName,
  opacityBgClassName,
  onClick,
  isActive,
  showActiveBorder,
  overlayClickable = false, // NEW
}) => {
  const getImageSrc = () => {
    const value =
      (typeof media.media === 'object' && media.media !== null && 'value' in media.media
        ? (media.media as { value: string }).value
        : typeof media.media === 'string'
          ? media.media
          : undefined) ||
      (typeof media.value === 'object' && media.value !== null && 'value' in media.value
        ? (media.value as { value: string }).value
        : typeof media.value === 'string'
          ? media.value
          : undefined) ||
      "";

    if (typeof value === 'string' && value.startsWith('http')) return value;

    return generateImageBase64FromUrl({
      url: value,
      width: 100,
      height: 100,
    })?.fullEncodedUrl;
  };

  return (
    <>
      <div
        className={cn(`relative min-w-[110px] h-[110px] cursor-pointer ${(isActive && showActiveBorder) ? 'border-2 border-[var(--button-primary-background)]' : ''} outline-none focus:bg-transparent active:bg-transparent focus:outline-none select-none`, containerClassName)}
        tabIndex={0}
        onClick={overlayClickable ? undefined : () => onClick?.(index, media)}
      >
        <img
          fetchPriority="high"
          className={cn(`w-full h-full object-cover`, imageClassName)}
          alt="product-img"
          title={"product-img"}
          src={getImageSrc()}
          width={100}
          height={100}
        />

        {/* Video overlay with play button */}
        {(
          (typeof media.type === 'string' && (media.type.includes('video') || media.type.includes('mp4')))
          || (typeof media.value === 'string' && (media.value.includes('video') || media.value.includes('mp4')))
          || (typeof media.media === 'string' && (media.media.includes('video') || media.media.includes('mp4')))
        ) && (
          <div
            className={cn(
              `absolute inset-0 flex items-center justify-center media-overlay`,
              opacityBgClassName
            )}
          >
            <PlayIcon className={playIconClassName} height="20" width="20" />
          </div>
        )}

        {/* Last item overlay showing remaining count */}
        {isLastIndex && showTotalCount && (
          <div
            className={cn(
              `absolute inset-0 flex items-center justify-center media-overlay z-10`,
              opacityBgClassName
            )}
            onClick={overlayClickable ? () => onClick?.(index, media) : undefined}
            style={{ cursor: 'pointer' }}
          >
            <span
              className={cn(
                `text-[var(--white)] text-xl font-semibold`,
                totalCountClassName
              )}
            >
              +{totalCount}
            </span>
          </div>
        )}
         <style>{`
          .media-overlay {
            background-color: var(--overlay-color, rgba(0, 0, 0, 0.5));
          }
        `}
        </style>
      </div>
    </>
  );
};

export default MediaTumbnail;
