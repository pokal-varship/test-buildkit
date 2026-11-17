import ArrowLeftIcon from '@components/icons/ArrowLeft'
import React, { FC, useEffect, useRef } from 'react'
import { MediaType } from '@components/type/pdp.type'
import MediaTumbnail from '@components/MediaTumbnail';
import { cn } from '@lib/utils';
type MediaCarouselProps = {
  mediaItems: MediaType[];
  handlePrevious: () => void;
  activeIndex?: number;
  handleNext: () => void;
  onMediaClick: (index: number, media?: MediaType) => void;
  containerClassName?: string;
  previousButtonClassName?: string;
  nextButtonClassName?: string;
  mediaContainerClassName?: string;
  thumbnailContainerClassName?: string;
}

const MediaCarousel: FC<MediaCarouselProps> = ({ mediaItems, handlePrevious, handleNext, onMediaClick, containerClassName, previousButtonClassName, nextButtonClassName, mediaContainerClassName, activeIndex, thumbnailContainerClassName }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof activeIndex === 'number' && thumbRefs.current[activeIndex]) {
      thumbRefs.current[activeIndex]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeIndex]);

  return (
    <div className={cn(" flex justify-between items-center gap-4 mt-12", containerClassName)}>
      {mediaItems?.length > 1 && <ArrowLeftIcon 
      className={cn("cursor-pointer outline-none focus:bg-transparent active:bg-transparent focus:outline-none select-none", previousButtonClassName)} 
      onClick={handlePrevious} 
      pathFillColor='var(--primary-text)'
      />}
      <div ref={containerRef} className={cn("flex gap-2 w-full overflow-x-auto hide-scrollbar justify-center", mediaContainerClassName)}>
        {mediaItems.map((item, idx) => (
          <div
            key={idx}
            ref={el => { thumbRefs.current[idx] = el; }}
          >
            <MediaTumbnail
              onClick={onMediaClick}
              containerClassName={cn(
                "min-w-[80px] h-[80px] max-w-[80px] max-h-[80px] rounded-md overflow-hidden",
                thumbnailContainerClassName
              )}
              isActive={activeIndex === idx}
              showActiveBorder={true}
              media={item}
              index={idx}
              showTotalCount={false}
            />
          </div>
        ))}
      </div>
      {mediaItems?.length > 1 && <ArrowLeftIcon 
      className={cn("cursor-pointer rotate-180 outline-none focus:bg-transparent active:bg-transparent focus:outline-none select-none", nextButtonClassName)} 
      onClick={handleNext} 
      pathFillColor='var(--primary-text)'
      />}
    </div>
  )
}

export default MediaCarousel