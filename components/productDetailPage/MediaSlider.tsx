import Modal from "@components/dialogDrawer/modal/Modal";
import MediaTumbnail from "@components/MediaTumbnail";
import { MediaType } from "@components/type/pdp.type";
import { cn } from "@lib/utils";
import { setCurrentReview } from "@redux/slices/productReviewSlice";
import { RootState } from "@redux/store";
import { FC, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MediaGallery from "./MediaGallery";
type MediaSliderProps = {
  media?: MediaType[];
  onMediaClick?: (index: number, media?: MediaType) => void;
  showTotalCount?: boolean;
  containerClassName?: string;
  thumbnailContainerClassName?: string;
  thumbnailImageClassName?: string;
  thumbnailPlayIconClassName?: string;
  thumbnailTotalCountClassName?: string;
  thumbnailOpacityBgClassName?: string;
  showViewMore?: boolean;
  viewMoreClassName?: string;
};
// export const mediaData: MediaType[] = [
//   {
//     reviewId: "1",
//     media: "/plateaway/products/1744283720175_Classic Chicken pizza.jpeg"
//   },
//   {
//     reviewId: "2",
//     media: "/plateaway/products/1744283720175_Classic Chicken pizza.jpeg"
//   },
//   {
//     reviewId: "3",
//     media: "/plateaway/products/1744283720175_Classic Chicken pizza.jpeg"
//   },
//   {
//     reviewId: "4",
//     media: "/plateaway/products/1744283720175_Classic Chicken pizza.jpeg"
//   }
// ];

const MediaSlider: FC<MediaSliderProps> = ({
  media = [],
  showTotalCount = true,
  containerClassName,
  onMediaClick,
  thumbnailContainerClassName,
  thumbnailImageClassName,
  thumbnailPlayIconClassName,
  thumbnailTotalCountClassName,
  thumbnailOpacityBgClassName,
  showViewMore = false,
  viewMoreClassName
}) => {
  const [isShowReviewDetailsPopup, setIsShowReviewDetailsPopup] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [activeMedia, setActiveMedia] = useState<number>(0);
  const {allReviews} = useSelector((state: RootState) => state.productReviews);
  const dispatch = useDispatch();

  const onMediaClickHandler = (index: number, mediaData?: MediaType) => {
    if (onMediaClick) {
      onMediaClick(index, mediaData);
    } else {
      if (index >= media.length - 1 && showTotalCount && media.length > 9) {
        setIsGalleryOpen(true);
      } else {
        const review = allReviews.find(item => item.reviewId === mediaData?.reviewId);
        if(review){
          dispatch(setCurrentReview(review));
          setIsShowReviewDetailsPopup(true);
        }
        setActiveMedia(index);
      }
    }
  }

  // const onReviewDetailsMediaClick = (index: number) => {
  //   setActiveMedia(index);
  // }

  // const onReviewDetailsPopupClose = () => {
  //   setIsShowReviewDetailsPopup(false);
  // }
  const onGalleryMediaClick = (index: number, mediaData?: MediaType) => {
    const review = allReviews.find(item => item.reviewId === mediaData?.reviewId);
    if(review){
      dispatch(setCurrentReview(review));
      setIsShowReviewDetailsPopup(true);
    }
    setActiveMedia(index);
  };
  const onGalleryClose = () => {
    setIsGalleryOpen(false);
  }

  // const handlePrevious = () => {
  //   const previousIndex = activeMedia === 0 ? media.length - 1 : activeMedia - 1;
  //   setActiveMedia(previousIndex);
  //   const review = allReviews.find(item => item.reviewId === media[previousIndex]?.reviewId);
  //   if(review){
  //     dispatch(setCurrentReview(review));
  //   }
  // }

  // const handleNext = () => {
  //   const nextIndex = activeMedia === media.length - 1 ? 0 : activeMedia + 1;
  //   setActiveMedia(nextIndex);
  //   const review = allReviews.find(item => item.reviewId === media[nextIndex]?.reviewId);
  //   if(review){
  //     dispatch(setCurrentReview(review));
  //   }
  // }

  const onViewMoreClick = () => {
    setIsGalleryOpen(true);
    const review = allReviews.find(item => item.reviewId === media[activeMedia].reviewId);
    if(review){
      dispatch(setCurrentReview(review));
    }
  }

  return (
    <>
      {
        showViewMore && (
          <span onClick={onViewMoreClick} className={cn("small-font text-[var(--accent-color)] absolute top-0 right-0 md:hidden", viewMoreClassName)}>view more</span>
        )
      }
      <div
        className={cn(
          "flex gap-2 overflow-x-auto hide-scrollbar",
          containerClassName
        )}
      >
        {media.map((item, index) => (
          <MediaTumbnail
            containerClassName={thumbnailContainerClassName}
            imageClassName={thumbnailImageClassName}
            playIconClassName={thumbnailPlayIconClassName}
            totalCountClassName={thumbnailTotalCountClassName}
            opacityBgClassName={thumbnailOpacityBgClassName}
            onClick={onMediaClickHandler}
            isLastIndex={index === media.length - 1}
            showTotalCount={showTotalCount && media.length > 9}
            totalCount={media.length}
            key={index}
            media={item}
            index={index}
          />
        ))}

        {/* {isShowReviewDetailsPopup && (
          <ReviewDetailsPopUp isReviewMediaOpen={isShowReviewDetailsPopup} onClose={onReviewDetailsPopupClose} media={media} activeIndex={activeMedia} handlePrevious={handlePrevious} handleNext={handleNext} onMediaClick={onReviewDetailsMediaClick} />
        )} */}
        {(isGalleryOpen && !isShowReviewDetailsPopup) && (
          <Modal
            showBackArrow={true}
            backArrowClassName="static md:hidden"
            title="Medias from Reviews"
            headerClassName="justify-start gap-2"
            titleClassName="text-left heading-4 font-800"
            className="md:max-w-[954px] max-h-screen h-[100vh] rounded-none md:rounded-lg md:max-h-[70vh]"
            isOpen={isGalleryOpen}
            onClose={onGalleryClose}
            closeIconClassName="static hidden md:block"
          >
            <MediaGallery media={media} onMediaClick={onGalleryMediaClick} />
          </Modal>
        )}
      </div>
    </>
  );
  <style>
    {`
            .small-font{
                font-size: var(--small-font);
            }
                .heading-4{
                    font-size: var(--heading-4);
                }

                .font-800{
                    font-weight: var(--font-extra-bold);
                }
        `}
  </style>
};

export default MediaSlider;
