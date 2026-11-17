import MediaTumbnail from '@components/MediaTumbnail'
import React, { useMemo, useState, useRef, useEffect } from 'react'
import ReviewDetailsPopUp from './ReviewDetailsPopUp'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@redux/store'
import { getAllMediaUrl } from './productConfig'
import { MediaType } from '@components/type/pdp.type'
import { setCurrentReview } from '@redux/slices/productReviewSlice'
import { useGetAllProductReviewsForMedia } from '@hooks/useGetProductReviews'

const SideBarGallery = ({ productId, variant = "grid", onShowAllMedia }: { productId: string, variant?: "grid" | "row", onShowAllMedia?: () => void }) => {
    const [activeMedia, setActiveMedia] = useState<number>(0)
    const [isShowReviewDetailsPopup, setIsShowReviewDetailsPopup] = useState<boolean>(false)
    const [visibleCount, setVisibleCount] = useState(8)
    const [rowExpanded, setRowExpanded] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const dispatch = useDispatch()

    useGetAllProductReviewsForMedia({ productId })
    const { allReviewsForMedia } = useSelector((state: RootState) => state.productReviews)
    const mediaData = useMemo(() => getAllMediaUrl(allReviewsForMedia), [allReviewsForMedia])

    useEffect(() => {
        if (variant !== "row") return
        const updateVisibleCount = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth
                const thumbWidth = 108 // 100px thumb + 8px gap
                const count = Math.floor(containerWidth / thumbWidth)
                setVisibleCount(count > 0 ? count : 1)
            }
        }
        updateVisibleCount()
        window.addEventListener('resize', updateVisibleCount)
        return () => window.removeEventListener('resize', updateVisibleCount)
    }, [variant])

    const updateActiveMedia = (index: number, mediaData?: MediaType) => {
        setActiveMedia(index)
        const review = allReviewsForMedia.find(item => item.reviewId === mediaData?.reviewId)
        if (review) {
            dispatch(setCurrentReview(review))
            if (mediaData) setIsShowReviewDetailsPopup(true)
        }
    }

    const handleNavigation = (direction: 'prev' | 'next') => {
        const newIndex = direction === 'prev' 
            ? (activeMedia === 0 ? mediaData.length - 1 : activeMedia - 1)
            : (activeMedia === mediaData.length - 1 ? 0 : activeMedia + 1)
        const review = allReviewsForMedia.find(item => item.reviewId === mediaData[newIndex]?.reviewId)
        if (review) dispatch(setCurrentReview(review))
        setActiveMedia(newIndex)
    }

    const onMediaClick = (index: number, mediaData?: MediaType) => {
        const isLastWithOverlay = index === displayMedia.length - 1 && overlayCount > 0
        
        if (variant === "grid" && isLastWithOverlay && typeof onShowAllMedia === 'function') {
            onShowAllMedia()
            return
        }
        
        if (variant === "row" && !rowExpanded && isLastWithOverlay) {
            setRowExpanded(true)
            return
        }
        
        updateActiveMedia(index, mediaData)
    }

    const onReviewDetailsMediaClick = (index: number, mediaData?: MediaType) => {
        updateActiveMedia(index, mediaData)
        setIsShowReviewDetailsPopup(false)
    }

    // --- Overlay logic for grid: show on last image of last full row ---
    const getGridColumns = () => {
        if (typeof window === 'undefined' || variant !== 'grid') return 2; // SSR fallback
        if (window.innerWidth >= 1024) return 4; // lg
        if (window.innerWidth >= 768) return 3; // md
        return 2; // base
    };
    const [gridColumns, setGridColumns] = useState(getGridColumns());
    useEffect(() => {
        if (variant !== 'grid') return;
        const handleResize = () => setGridColumns(getGridColumns());
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [variant]);

    // Always show 3 rows, overlay on last image of 3rd row if more images exist
    let displayMedia = mediaData;
    let overlayIndex = -1;
    let overlayCount = 0;
    if (variant === 'grid' && mediaData.length > 0) {
        const columns = gridColumns;
        const maxDisplay = columns * 3;
        if (mediaData.length > maxDisplay) {
            // More images than 3 rows: show only 3 rows, overlay on last image
            displayMedia = mediaData.slice(0, maxDisplay);
            overlayIndex = maxDisplay - 1;
            overlayCount = mediaData.length - maxDisplay;
        } else {
            // Fewer images: show all, overlay only if last row is full and there are more images
            displayMedia = mediaData;
            if (mediaData.length % columns === 0 && mediaData.length >= columns) {
                overlayIndex = mediaData.length - 1;
                overlayCount = 0; // No overlay unless there are more images
            } else {
                overlayIndex = -1;
                overlayCount = 0;
            }
        }
    } else if (variant === 'row') {
        const maxItems = visibleCount;
        const shouldLimit = !rowExpanded && mediaData.length > visibleCount;
        if (shouldLimit) {
            displayMedia = mediaData.slice(0, maxItems);
            overlayIndex = displayMedia.length - 1;
            overlayCount = mediaData.length - maxItems;
        } else {
            displayMedia = mediaData;
        }
    }

    const isLastWithOverlay = (idx: number) => idx === overlayIndex && overlayCount > 0;

    return (
        <>
            <div
                ref={variant === "row" ? containerRef : undefined}
                className={
                    variant === "row"
                        ? "flex gap-2 mt-4 overflow-x-auto hide-scrollbar"
                        : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-4 mt-4"
                }
            >
                {displayMedia.map((item, idx) => (
                    <MediaTumbnail
                        key={idx}
                        onClick={onMediaClick}
                        containerClassName={
                            variant === "row"
                                ? "min-w-[110px] max-w-[110px] max-h-[110px] overflow-hidden"
                                : "min-w-full max-w-full aspect-square h-full"
                        }
                        media={item}
                        index={idx}
                        isLastIndex={isLastWithOverlay(idx)}
                        showTotalCount={isLastWithOverlay(idx)}
                        totalCount={overlayCount}
                        overlayClickable={isLastWithOverlay(idx)}
                    />
                ))}
            </div>
            
            {isShowReviewDetailsPopup && (
                <ReviewDetailsPopUp
                    isReviewMediaOpen={isShowReviewDetailsPopup}
                    onClose={() => setIsShowReviewDetailsPopup(false)}
                    media={mediaData}
                    activeIndex={activeMedia}
                    handlePrevious={() => handleNavigation('prev')}
                    handleNext={() => handleNavigation('next')}
                    onMediaClick={onReviewDetailsMediaClick}
                />
            )}
        </>
    )
}

export default SideBarGallery