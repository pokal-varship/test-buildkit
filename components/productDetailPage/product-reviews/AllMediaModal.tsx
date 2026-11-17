import React, { useState } from 'react';
import Modal from '@components/dialogDrawer/modal/Modal';
import MediaTumbnail from '@components/MediaTumbnail';
import { MediaType } from '@components/type/pdp.type';
import ReviewDetailsPopUp from '../ReviewDetailsPopUp';
// import { useSelector } from 'react-redux';
// import { RootState } from '@redux/store';

interface AllMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaList: MediaType[];
  title?: string;
}

const AllMediaModal = ({ isOpen, onClose, mediaList, title }: AllMediaModalProps) => {
  // const { allReviewsForMedia } = useSelector((state: RootState) => state.productReviews);
  const [isReviewDetailsOpen, setIsReviewDetailsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // const getReviewDataForMedia = (media: MediaType) =>
  //   (allReviewsForMedia as ReviewData[]).find(review => review.reviewId === media.reviewId);

  const handleThumbnailClick = (idx: number) => {
    setActiveIndex(idx);
    setIsReviewDetailsOpen(true);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title || 'Medias From Reviews'}
        className="max-w-2xl w-full h-screen md:max-w-[954px] md:max-h-[620px] md:h-[75vh] md:p-4 py-4 px-0"
        containerClassName="z-[100]"
        showCloseIcon={true}
        showBackArrow={false}
        backArrowClassName="static ml-2"
        titleClassName="heading-4 font-bold pl-10"
        headerClassName="justify-start gap-3 pl-2"
        closeIconPosition="left"
      >
        <div className="grid grid-cols-3 md:grid-cols-7 md:gap-3 px-0 py-2 md:p-4">
          {mediaList.length > 0 ? (
            mediaList.map((media, idx) => (
              <MediaTumbnail
                key={idx}
                media={media}
                index={idx}
                containerClassName="min-w-full max-w-full aspect-square h-full"
                showTotalCount={false}
                onClick={() => handleThumbnailClick(idx)}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-[var(--secondary-text)] py-8">No media available</div>
          )}
        </div>
      </Modal>
      {isReviewDetailsOpen && (
        <div className="z-[200] fixed inset-0">
          <ReviewDetailsPopUp
            isReviewMediaOpen
            onClose={() => setIsReviewDetailsOpen(false)}
            media={mediaList}
            activeIndex={activeIndex}
            handlePrevious={() => setActiveIndex(prev => (prev === 0 ? mediaList.length - 1 : prev - 1))}
            handleNext={() => setActiveIndex(prev => (prev === mediaList.length - 1 ? 0 : prev + 1))}
            onMediaClick={setActiveIndex}
            // productReviewData={getReviewDataForMedia(mediaList[activeIndex])}
          />
        </div>
      )}
    </>
  );
};

export default AllMediaModal; 