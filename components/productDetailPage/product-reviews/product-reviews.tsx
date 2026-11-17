import { ProductData, ReviewData } from '@components/type/pdp.type';
import useLang from '@hooks/useLang';
import React, { FC, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';

// Components
import ParameterRatings from "@components/ratings/ParameterRatings";
import RatingBreakdown from "@components/ratings/RatingBreakdown";
import SideBarGallery from '../SideBarGallery';
import AllMediaModal from './AllMediaModal';

// Types
import ArrowLeftIcon from '@components/icons/ArrowLeft';
import StarIcon from '@components/icons/Star';
import { timeSince } from '@lib/helper/date';
import { LanguageCode, TranslationKeys } from 'types';
import ReviewTile from '../ReviewTile';
import { getAllMediaUrl } from '../productConfig';
import { MediaType } from '@components/type/pdp.type';
import { useGetAllProductReviewsForMedia, useProductUserReviewLikes } from '@hooks/useGetProductReviews';
import useIsMobile from '@hooks/useIsMobile';
import BackArrow from '@components/icons/BackArrow';
import tenantConfig from '@config/tenant.config';

// Constants
const PAGINATION_CONFIG = {
  WEB_LIMIT: 4,
  MOBILE_LIMIT: 5,
  MOBILE_DRAWER_LIMIT: 5,
  SCROLL_THRESHOLD: 0.8,
  DEBOUNCE_DELAY: 150,
  PAGINATION_DELTA: 2,
} as const;

const STAR_COLORS: Record<string, string> = {
  '5': 'var(--rating-bg-success-primary)',
  '4': 'var(--rating-bg-success-secondary)', 
  '3': 'var(--rating-bg-warning-primary)',
  '2': 'var(--rating-bg-warning-secondary)',
  '1': 'var(--rating-bg-error-primary)'
} as const;

type UrlParams = {
  menuId: string;
  cartItemId: string;
  categoryId: string;
  storeId: string;
  rfcEdit: string;
  redirectFromCartToChose: boolean;
  redirectFromCartToEdit: boolean;
  isPDP: boolean;
  isReviewTab: boolean;
};

type ProductReviewsProps = {
  className?: string;
  productData: ProductData | null;
  urlParams: UrlParams | null;
};

type MobileDrawerState = {
  currentPage: number;
  hasMore: boolean;
};

// Helper function to check if there's meaningful review data
export const hasReviewData = (productData: ProductData | null): boolean => {
  if (!productData) return false;
  
  const averageRating = productData?.overallRatings?.average;
  const totalReviews = productData?.overallRatings?.totalReview;
  const starDistribution = productData?.overallRatings?.starDistribution;
  const parameterAverages = productData?.parameterAverages;
  
  // Calculate total from starDistribution
  const totalFromStarDistribution = starDistribution 
    ? Object.values(starDistribution).reduce((total, count) => total + count, 0)
    : 0;
  
  const displayTotal = totalFromStarDistribution || totalReviews || 0;
  
  // Check if there's any meaningful rating data or parameter data
  const hasRatingData = !!averageRating || displayTotal > 0 || !!(parameterAverages && parameterAverages.length > 0);
  
  return hasRatingData;
};

// Helper function to calculate total reviews from star distribution
const calculateTotalFromStarDistribution = (starDist: Record<string, number> | undefined): number => {
  if (!starDist) return 0;
  return Object.values(starDist).reduce((total, count) => total + count, 0);
};

// Helper function to transform star distribution to breakdown data
const transformToBreakdownData = (starDistribution: Record<string, number> | undefined) => {
  if (!starDistribution) return [];
  
  return Object.entries(starDistribution)
    .sort(([a], [b]) => Number(b) - Number(a)) // Sort 5 to 1
    .map(([rating, count]) => ({
      rating: Number(rating),
      count: count,
      color: STAR_COLORS[rating] || 'var(--primary-text)'
    }));
};

const ProductReviews: FC<ProductReviewsProps> = ({ 
  productData,
  // urlParams
}) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const isMobile = useIsMobile();
  const showPdpReviewsList = tenantConfig.showPdpReviewsList;

  // Main state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviewsCount, setTotalReviewsCount] = useState(0);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [isAllMediaModalOpen, setIsAllMediaModalOpen] = useState(false);
  const [allMediaList, setAllMediaList] = useState<MediaType[]>([]);
  const [isAllReviewsDrawerOpen, setIsAllReviewsDrawerOpen] = useState(false);
  
  // Mobile drawer state
  const [mobileDrawerState, setMobileDrawerState] = useState<MobileDrawerState>({
    currentPage: 1,
    hasMore: true,
  });

  // Refs for performance optimization
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reviewsSectionRef = useRef<HTMLDivElement>(null);
  const mobileDrawerScrollRef = useRef<HTMLDivElement>(null);

  // Derived values
  const limit = isMobile ? PAGINATION_CONFIG.MOBILE_LIMIT : PAGINATION_CONFIG.WEB_LIMIT;
  
  const averageRating = productData?.overallRatings?.average;
  const totalReviews = productData?.overallRatings?.totalReview;
  const starDistribution = productData?.overallRatings?.starDistribution;
  const parameterAverages = productData?.parameterAverages;

  // Memoized calculations
  const totalReviewsFromStarDistribution = useMemo(() => 
    calculateTotalFromStarDistribution(starDistribution), 
    [starDistribution]
  );
  
  const displayTotalReviews = useMemo(() => 
    totalReviewsFromStarDistribution || totalReviews || 0, 
    [totalReviewsFromStarDistribution, totalReviews]
  );

  const breakdownData = useMemo(() => 
    transformToBreakdownData(starDistribution), 
    [starDistribution]
  );

  const { allReviewsForMedia, isLoading: ratingsLoading } = useSelector((state: RootState) => state.productReviews);
  const allReviewMedia = useMemo(() => 
    getAllMediaUrl(allReviewsForMedia), 
    [allReviewsForMedia]
  );

  const reviewsData = useMemo(() => 
    allReviewsForMedia.slice((currentPage - 1) * limit, currentPage * limit), 
    [allReviewsForMedia, currentPage, limit]
  );

  const drawerReviews = useMemo(() => 
    allReviewsForMedia.slice(0, mobileDrawerState.currentPage * PAGINATION_CONFIG.MOBILE_DRAWER_LIMIT), 
    [allReviewsForMedia, mobileDrawerState.currentPage]
  );

  // Effects
  useEffect(() => {
    setTotalReviewsCount(allReviewsForMedia.length);
    setTotalPages(Math.ceil(allReviewsForMedia.length / limit));
  }, [allReviewsForMedia, limit]);

  useEffect(() => {
    return () => {
      setExpandedDescriptions({});
    };
  }, []);

  useEffect(() => {
    setExpandedDescriptions({});
  }, [reviewsData]);

  useEffect(() => {
    const scrollElement = mobileDrawerScrollRef.current;
    if (scrollElement && isAllReviewsDrawerOpen) {
      const handleScroll = () => {
        if (!scrollElement || !mobileDrawerState.hasMore) {
          return;
        }

        const { scrollTop, scrollHeight, clientHeight } = scrollElement;
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

        if (scrollPercentage > PAGINATION_CONFIG.SCROLL_THRESHOLD) {
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }

          scrollTimeoutRef.current = setTimeout(() => {
            const nextPage = mobileDrawerState.currentPage + 1;
            const nextReviewsCount = nextPage * PAGINATION_CONFIG.MOBILE_DRAWER_LIMIT;
            const hasMore = nextReviewsCount < allReviewsForMedia.length;
            setMobileDrawerState({ currentPage: nextPage, hasMore });
          }, PAGINATION_CONFIG.DEBOUNCE_DELAY);
        }
      };

      scrollElement.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        scrollElement.removeEventListener('scroll', handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, [mobileDrawerState.hasMore, mobileDrawerState.currentPage, allReviewsForMedia.length, isAllReviewsDrawerOpen]);

  useEffect(() => {
    if (!isAllReviewsDrawerOpen) {
      setMobileDrawerState({
        currentPage: 1,
        hasMore: true,
      });
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    } else {
      // Update hasMore when drawer opens
      const initialCount = PAGINATION_CONFIG.MOBILE_DRAWER_LIMIT;
      setMobileDrawerState(prev => ({
        ...prev,
        hasMore: allReviewsForMedia.length > initialCount,
      }));
    }
  }, [isAllReviewsDrawerOpen, allReviewsForMedia.length]);

  // Event handlers
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setTimeout(() => {
        reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  }, [totalPages]);

  const handleDescriptionToggle = useCallback((reviewId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedDescriptions(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  }, []);

  const handleViewMoreClick = useCallback(() => {
    setAllMediaList(allReviewMedia);
    setIsAllMediaModalOpen(true);
  }, [allReviewMedia]);

  const handleViewAllReviewsClick = useCallback(() => {
    setIsAllReviewsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsAllReviewsDrawerOpen(false);
  }, []);

  // Render functions
  const renderPagination = useCallback(() => {
    if (totalPages <= 1 && totalReviewsCount <= limit) return null;

    const getVisiblePages = () => {
      const range = [];
      const rangeWithDots = [];

      range.push(1);

      for (let i = Math.max(2, currentPage - PAGINATION_CONFIG.PAGINATION_DELTA); i <= Math.min(totalPages - 1, currentPage + PAGINATION_CONFIG.PAGINATION_DELTA); i++) {
        range.push(i);
      }

      if (totalPages > 1) {
        range.push(totalPages);
      }

      const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

      for (let i = 0; i < uniqueRange.length; i++) {
        rangeWithDots.push(uniqueRange[i]);
        
        if (uniqueRange[i + 1] && uniqueRange[i + 1] - uniqueRange[i] > 1) {
          rangeWithDots.push('...');
        }
      }

      return rangeWithDots;
    };

    const visiblePages = getVisiblePages();

    return (
      <div className="flex justify-center items-center gap-2 mb-7 md:mb-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`w-8 h-8 mr-5 rounded-full flex items-center justify-center transition-all duration-200 ${
            currentPage === 1 
              ? 'bg-gray-50 text-gray-300 cursor-not-allowed' 
              : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }`}
        >
          <ArrowLeftIcon pathFillColor='var(--secondary-text)' />
        </button>

        {visiblePages.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-4 py-2 text-gray-400 small-font">...</span>
            ) : (
              <button
                onClick={() => handlePageChange(page as number)}
                className={`w-8 h-8 rounded-full small-font font-medium transition-all duration-200 ${
                  currentPage === page
                    ? 'bg-[var(--button-primary-background)] text-[var(--button-primary-text)] shadow-md transform scale-105'
                    : 'text-[var(--primary-text)] rounded-full border border-[var(--button-primary-background)]'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`w-8 h-8 ml-5 rounded-full flex items-center justify-center transition-all duration-200 ${
            currentPage === totalPages 
              ? 'bg-gray-50 text-gray-300 cursor-not-allowed' 
              : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }`}
        >
          <ArrowLeftIcon 
            className="cursor-pointer rotate-180" 
            pathFillColor='var(--secondary-text)' 
          />
        </button>
      </div>
    );
  }, [currentPage, totalPages, totalReviewsCount, limit, handlePageChange]);

  const renderRatingSection = useCallback(() => {
    if (!hasReviewData(productData)) return null;

    return (
      <>
      {averageRating && averageRating > 0 ? (
        <>
        <div className="flex flex-row mb-7 items-center review-rating-container w-full xl:px-7">
          <div className="text-center min-w-fit">
            <div className="flex md:flex-col items-center justify-center mb-1 gap-2">
              <span className="rating-text avg-rating heading-2 font-bold mb-[-7px]">{averageRating}</span>
              {averageRating && (
                <>
                  <div className="hidden md:flex flex-row gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} width="28" height="36" className="w-7 h-9" />
                    ))}
                  </div>
                  <StarIcon width="28" height="28" className="md:hidden w-7 h-7" />
                </>
              )}
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-1 desktop-rating-counts mt-3 md:mt-0">
              {displayTotalReviews > 0 && (
                <span className="rating-counts small-font extra-small-font text-[var(--secondary-text)] text-center md:pr-1">
                  {displayTotalReviews} {lang.rating}
                </span>
              )}
              <span className='extra-small-font hidden md:block'>|</span>
              {totalReviews && totalReviews > 0 && (
                <span className="rating-counts small-font extra-small-font text-[var(--secondary-text)] text-center md:pl-1">
                  {totalReviews} {lang.totalReviews}
                </span>
              )}
            </div>
          </div>

          <div className='border-r h-32 border-[var(--rating-border-primary)] hidden md:block'></div>
          <RatingBreakdown 
            breakdownData={breakdownData}
            progressBarClassName=""
            progressBarHeight="4px"
            className="flex flex-col gap-2 w-full"
          />
        </div>
        </>
      ) : null}
        <ParameterRatings parameterAverages={parameterAverages || []} showBottomBorder={showPdpReviewsList} />
      </>
    );
  }, [productData, averageRating, displayTotalReviews, totalReviews, lang, breakdownData, parameterAverages, showPdpReviewsList]);

  const renderReviewTile = useCallback((review: ReviewData, index: number, isLast: boolean, prefix: string = '') => (
    <ReviewTile 
      key={`${prefix}${review.reviewId}-${index}`}
      productReviewData={review}
      rating={review?.rating}
      title={review?.firstName + " " + review?.lastName}
      description={review?.content}
      media={review?.media}
      date={timeSince(Number(review?.createdAt) || 0)}
      onTileClick={() => {}}
      className={isLast ? "border-b-0" : ""}
      reviewId={review?.reviewId || `review-${index}`}
      expandedDescriptions={expandedDescriptions}
      onDescriptionToggle={handleDescriptionToggle}
    />
  ), [expandedDescriptions, handleDescriptionToggle]);

  // Hooks - Only call when productData.id exists and reviews list is enabled
  useGetAllProductReviewsForMedia({ 
    productId: showPdpReviewsList ? (productData?.id || '') : ''
  });
  useProductUserReviewLikes(showPdpReviewsList ? productData?.id : undefined);

  // Early return if no meaningful data to display
  const hasRatingData = averageRating || displayTotalReviews || (parameterAverages && parameterAverages.length > 0);
  const hasReviewDataToShow = showPdpReviewsList && allReviewsForMedia && allReviewsForMedia.length > 0;
  
  if (!hasRatingData && !hasReviewDataToShow) {
    return null;
  }

  return (
    <>
      {showPdpReviewsList && (
        <AllMediaModal
          isOpen={isAllMediaModalOpen}
          onClose={() => setIsAllMediaModalOpen(false)}
          mediaList={allMediaList}
          title={lang.mediaFromReviews}
        />
      )}

      {/* All Reviews Drawer for Mobile */}
      {showPdpReviewsList && isMobile && isAllReviewsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end md:hidden">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleCloseDrawer}
          />
          
          <div className="relative w-full h-full bg-[var(--primary-background)] shadow-xl transform transition-all duration-300 ease-out overflow-hidden animate-slide-right">
            <div className="flex flex-col h-[100vh]">
              <div className="flex items-center py-3 px-4 border-b border-[var(--rating-border-primary)]">
                <BackArrow onClick={handleCloseDrawer} />
                <h3 className="text-lg font-semibold pl-4">{lang.allReviews}</h3>
              </div>
              
              <div 
                ref={mobileDrawerScrollRef}
                className="flex-1 overflow-y-auto p-4"
              >
                {ratingsLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--accent-color)]" />
                  </div>
                ) : (
                  <>
                    {hasRatingData && renderRatingSection()}
                    
                    {drawerReviews.map((review, index) => 
                      renderReviewTile(
                        { 
                          ...review, 
                          parameter_review: [],
                          firstName: review.firstName || '',
                          lastName: review.lastName || '',
                          profilePic: review.profilePic || '',
                          status: review.status.toString(),
                          media: review.media.map(url => ({ value: url, media: url }))
                        }, 
                        index, 
                        index === drawerReviews.length - 1, 
                        'drawer-'
                      )
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
     
      {/* --------------------- Web View ------------------- */}
      <div ref={reviewsSectionRef} className="md:px-4 md:pt-0 p-4 pb-0 px-3 pt-0 md:p-3 lg:px-10 md:mt-6 reviews-section border-b border-[var(--rating-border-primary)]">
        <h2 className="description-font md-heading-2 font-600 mb-4">{lang.ratingAndReviews}</h2>
      
        {hasRatingData && renderRatingSection()}

        {/* Reviews List */}
        {showPdpReviewsList && (ratingsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-color)]" />
          </div>
        ) : reviewsData && reviewsData.length > 0 ? (
          <>
            <div className='mb-3 md:mb-2'>
              {/* Media section - Only show on desktop since we don't fetch media on mobile */}
              {productData?.id && allReviewMedia && allReviewMedia.length > 0 && (
                <div className="mb-7 mt-5">
                  <div className='flex justify-between items-center'>
                    <h3 className="md-heading-3 heading-4 font-semibold">{lang.mediaFromReviews}</h3>
                    <span className='more-text-inline small-font' onClick={handleViewMoreClick} style={{cursor:'pointer'}}>{lang.viewMore}</span>
                  </div>
                  <SideBarGallery productId={productData.id} variant="row" onShowAllMedia={handleViewMoreClick} />
                </div>
              )}

              {reviewsData.map((review, index) => 
                renderReviewTile(
                  { 
                    ...review, 
                    parameter_review: [],
                    firstName: review.firstName || '',
                    lastName: review.lastName || '',
                    profilePic: review.profilePic || '',
                    status: review.status.toString(),
                    media: review.media.map(url => ({ value: url, media: url }))
                  }, 
                  index, 
                  index === reviewsData.length - 1
                )
              )}

              {/* Show "View All Reviews" button on mobile if there are more than 5 reviews total */}
              {isMobile && totalReviewsCount > 5 && (
                <div className="text-start pt-3 pb-2 border-t border-[var(--rating-border-primary)]">
                  <button
                    onClick={handleViewAllReviewsClick}
                    className="view-all-reviews-button text-sm font-semibold"
                  >
                    View all ({totalReviewsCount}) reviews 
                  </button>
                </div>
              )}
            </div>

            {/* Pagination - Only show on desktop */}
            {!isMobile && renderPagination()}
          </>
        ) : (
          <div className="text-center pt-8 pb-5">
            <p className="text-[var(--secondary-text)]">No reviews available yet</p>
          </div>
        ))}
      </div>

      <style>{`
      @media only screen and (min-width: 1024px) {
        .review-rating-container{
          gap: 36px;
        }
      }
      @media only screen and (min-width: 768px) and (max-width: 1024px)  {
        .review-rating-container{
          gap: 20px;
        }
      }
      @media only screen and (max-width: 768px) {
        .review-rating-container{
          gap: 17px;
        }
         .heading-h2{
          font-size: var(--heading-h2) !important;
        }
      }

      @media only screen and (min-width: 768px) {
        .small-font{
          font-size: var(--small-font) !important;
        }
        .avg-rating{
          font-size: var(--heading-h1) !important;
        }
      }

      .view-all-reviews-button {
        color:var(--accent-color) !important;
      }

      @keyframes slide-right {
        from {
          transform: translateX(100%);
        }
        to {
          transform: translateX(0);
        }
      }

      .animate-slide-right {
        animation: slide-right 0.3s ease-out;
      }
      `}</style>
    </>
  );
};

export default ProductReviews;