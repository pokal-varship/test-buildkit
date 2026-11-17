import Modal from "@components/dialogDrawer/modal/Modal";
import CloseCircleIcon from "@components/icons/CloseCircleIcon";
// import { generateImageBase64FromUrl } from "@lib/helper/ImageGen/imageGen";
import React, { useState } from "react";
import MediaCarousel from "./MediaCarousel";
import ReviewTile from "./ReviewTile";
import { MediaType } from "@components/type/pdp.type";
import { LEFT_ARROW_ICON, RIGHT_ARROW_ICON } from "@config/Header/image.config";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import { timeSince } from "@lib/helper/date";
import { generateImageBase64FromUrl } from "@lib/helper/ImageGen/imageGen";
import Icon from "@components/image/Icons";

// Utility function to extract media URL
function extractMediaUrl(mediaObj: MediaType | undefined): string | undefined {
    if (!mediaObj) return undefined;
    if (typeof mediaObj.media === 'object' && mediaObj.media !== null && 'value' in mediaObj.media)
        return (mediaObj.media as { value: string }).value;
    if (typeof mediaObj.media === 'string') return mediaObj.media;
    if (typeof mediaObj.value === 'object' && mediaObj.value !== null && 'value' in mediaObj.value)
        return (mediaObj.value as { value: string }).value;
    if (typeof mediaObj.value === 'string') return mediaObj.value;
    return undefined;
}

type ReviewDetailsPopUpProps = {
    isReviewMediaOpen: boolean;
    onClose: () => void;
    media: MediaType[];
    activeIndex: number;
    handlePrevious: () => void;
    handleNext: () => void;
    onMediaClick: (index: number, media?: MediaType) => void;
};
const ReviewDetailsPopUp = ({
    isReviewMediaOpen,
    onClose,
    media,
    activeIndex,
    handlePrevious,
    handleNext,
    onMediaClick
}: ReviewDetailsPopUpProps) => {
    const { currentReview } = useSelector((state: RootState) => state.productReviews);
    const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

    const handleDescriptionToggle = (reviewId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedDescriptions(prev => ({
            ...prev,
            [reviewId]: !prev[reviewId]
        }));
    };
 
    return (
        <>
        <Modal
            showBackArrow={true}
            backArrowClassName="review-details-close-icon-mobile md:hidden"
            customBackIcon={<CloseCircleIcon width={30} height={30} />}
            title="Review Media"
            isOpen={isReviewMediaOpen}
            className="md:max-w-[954px] md:min-h-fit md:rounded-[20px] h-screen md:max-h-[465px] p-0"
            closeIconClassName="static md:absolute hidden md:block"
            titleClassName="hidden"
            headerClassName="p-4 md:p-0 md:mb-0 sticky top-0 left-0 right-0 z-50 md:static"
            onClose={onClose}
        >
            <div className="flex flex-col md:flex-row w-full h-full">
                <div className="w-full md:w-1/2 h-full relative mt-14 md:mt-0 md:rounded-[16px] overflow-hidden md:mr-[30px]">
                    <div onClick={handlePrevious} className="absolute top-1/2 -translate-y-1/2 left-4 md:hidden h-8 w-8 rounded-full flex items-center justify-center z-20">
                    <Icon
                        icon= {`${LEFT_ARROW_ICON}#left-arrow` }
                        width={30}
                        height={30}
                        viewBox="0 0 30 30"
                        className="cursor-pointer"
                        color="var(--primary-background)"
                    />
                    </div>
                    <div className="relative w-full h-full">
                        <img
                            fetchPriority="high"
                            src={(() => {
                                const url = extractMediaUrl(media[activeIndex]) || "";
                                if (typeof url === 'string' && url.startsWith('http')) return url;
                                return generateImageBase64FromUrl({
                                    url,
                                    width: 800,
                                    height: 800,
                                    quality: 100,
                                })?.fullEncodedUrl;
                            })()}
                            alt={`Product ${activeIndex + 1}`}
                            className="w-full h-full aspect-square object-cover overflow-hidden"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/100 pointer-events-none" />
                    </div>
                    <div onClick={handleNext} className="absolute top-1/2 -translate-y-1/2 right-4 md:hidden h-8 w-8 rounded-full flex items-center justify-center">
                    <Icon
                        icon= {`${RIGHT_ARROW_ICON}#right-arrow` }
                        width={30}
                        height={30}
                        viewBox="0 0 30 30"
                        className="cursor-pointer"
                        color="var(--primary-background)"
              />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/99 to-transparent pointer-events-none z-10" />

                    <MediaCarousel
                        containerClassName="w-[93%] flex absolute bottom-5 left-1/2 -translate-x-1/2 gap-2 hidden md:flex"
                        thumbnailContainerClassName="min-w-[50px] h-[50px] max-w-[50px] max-h-[50px] "
                        handlePrevious={handlePrevious}
                        handleNext={handleNext}
                        mediaItems={media}
                        activeIndex={activeIndex}
                        onMediaClick={onMediaClick}
                    />
                </div>
                <div className="w-full md:w-1/2  md:border-l border-[var(--borders-dividers)] md:pl-[30px]">
                    <ReviewTile
                        media={[]}
                        rating={currentReview?.rating || 0}
                        title={`${currentReview?.firstName || ''} ${currentReview?.lastName || ''}`}
                        description={currentReview?.content}
                        date={timeSince(Number(currentReview?.createdAt) || 0)}
                        className="border-b-0 md:mt-0 mt-16 md:px-0 px-4"
                        reviewId={currentReview?.reviewId || 'popup-review'}
                        productId={currentReview?.productId}
                        likes={currentReview?.likes}
                        dislikes={currentReview?.dislikes}
                        reactionPlacement="footer"
                        expandedDescriptions={expandedDescriptions}
                        onDescriptionToggle={handleDescriptionToggle}
                    />
                </div>
            </div>
        </Modal>
        <style>{`
          /* Fixed position on mobile so close icon stays top-right on iOS (avoids sticky/flex quirks) */
          .review-details-close-icon-mobile {
            position: fixed !important;
            top: max(1rem, env(safe-area-inset-top)) !important;
            right: max(1rem, env(safe-area-inset-right)) !important;
            left: auto !important;
            z-index: 60;
          }
        `}</style>
    </>
    );
};

export default ReviewDetailsPopUp;
