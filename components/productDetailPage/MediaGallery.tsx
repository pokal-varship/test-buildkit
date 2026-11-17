import MediaTumbnail from '@components/MediaTumbnail'
import { cn } from '@lib/utils';
import { MediaType } from '@components/type/pdp.type';
import React, { FC } from 'react'

type MediaGalleryProps = {
  media: MediaType[];
  containerClassName?: string;
  onMediaClick?: (index: number, media?: MediaType) => void;

}  



const MediaGallery: FC<MediaGalleryProps> = ({ media , containerClassName, onMediaClick}) => {
    
  return (
    <>
    <div className={cn('w-full grid grid-cols-4 md:grid-cols-7 gap-2 flex-wrap hide-scrollbar', containerClassName)}>
      {media.map((item, index) => (
        <MediaTumbnail onClick={() => onMediaClick?.(index, item)} containerClassName=' min-w-full h-full aspect-square' key={item.reviewId} showTotalCount={false} media={item} index={index} />
      ))}
      
    </div>
    </>
  )
}

export default MediaGallery