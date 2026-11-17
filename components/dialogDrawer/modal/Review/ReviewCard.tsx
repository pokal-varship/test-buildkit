'use client';
import Icon from '@components/image/Icons';
import Loader from '@components/loader/Loader';
import { CROSS_ICON, NAVIGATION_IMAGE, STAR_ICON, STAR_ICON_PDP } from '@config/Header/image.config';
import useLang from '@hooks/useLang';
import { getCookie, removeCookie } from '@lib/cookie';
import { getRatingColor, getRatingBackgroundColor, getRatingBorderColor, getProgressBarClass, formatRating } from '@lib/helper/ratingColors';
import { close_dialog } from '@lib/modalHandler';
import { RootState } from '@redux/store';
import { getHomePageStoreReview } from '@services/reviewRatingService';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { LanguageCode, TranslationKeys } from 'types';

interface ParameterRating {
    parameterName: string;
    avgRating: number;
}

interface OverallRating {
    average: number;
    rating: number;
    totalReview: number;
    percentages: Record<string, number>;
    starDistribution: Record<string, number>;
    parameterRatings: ParameterRating[];
}

interface Review {
    overall_rating: number;
    user_firstname: string;
    user_lastname: string;
    content: string;
    daysAgo: string;
    updated_at: string;
    created_at: string;
}

interface StoreReview {
    overallrating: OverallRating;
    reviews: Review[];
    totalReviews?: number; // Add this if your API returns total count

}

const formatDaysAgo = (timestamp: number) => {
    const days =
      ((Date.now() - new Date(timestamp * 1000).setHours(0, 0, 0, 0)) /
        (1000 * 60 * 60 * 24)) | 0;
  
    return days === 0 ? 'Today' : days === 1 ? '1 Day ago' : `${days} Days ago`;
  };

const ReviewCard: React.FC = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const storeId = useSelector((state: RootState) => state.store.storeId);
    const getCookieStoreId = getCookie('storeId');
    const [storeReview, setStoreReview] = useState<StoreReview | null>(null);
    const [allReviews, setAllReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());
    const [lang]: [TranslationKeys, LanguageCode] = useLang();
    const storeData = JSON.parse(getCookie('store') || '[]');

    const ITEMS_PER_PAGE = 5;

    const handleClose = () => {
        window.history.back();
        close_dialog(['reviewCard']);
        removeCookie('storeId');
        removeCookie('store');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                handleClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleGetHomePageStoreReview = async (page: number = 1) => {
        setIsLoading(true);
        try {
            if (storeId || getCookieStoreId) {
                const skip = (page - 1) * ITEMS_PER_PAGE;
                const data = await getHomePageStoreReview(storeId || getCookieStoreId || '', ITEMS_PER_PAGE, skip);
                if (data) {
                    // Update the overall rating data
                    setStoreReview(data);

                    // Append new reviews to the existing ones
                    setAllReviews(prev => {
                        if (page === 1) {
                            return data.reviews;
                        }
                        return [...prev, ...data.reviews];
                    });

                    // Calculate total pages based on total reviews
                    const totalReviews = data.totalReviews || data.overallrating?.totalReview;
                    setTotalPages(Math.ceil(totalReviews / ITEMS_PER_PAGE));
                }
            }
            setIsLoading(false);
        } catch {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (storeId || getCookieStoreId) {
            handleGetHomePageStoreReview(currentPage);
        }
    }, [storeId, getCookieStoreId, currentPage]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const maxVisiblePages = 10;

        // Calculate start and end page numbers
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Adjust start page if we're near the end
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Previous button
        pages.push(
            <button
                key="prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`pagination-btn ${currentPage === 1 ? 'pagination-btn-disabled' : 'pagination-btn-prev'}`}
            >
                Previous
            </button>
        );

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`pagination-btn ${currentPage === i ? 'pagination-btn-active' : 'pagination-btn-number'}`}
                >
                    {i}
                </button>
            );
        }

        // Next button
        pages.push(
            <button
                key="next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`pagination-btn ${currentPage === totalPages ? 'pagination-btn-disabled' : 'pagination-btn-next'}`}
            >
                Next
            </button>
        );

        return (
            <div className="pagination-container desktop-only">
                <div className="pagination-wrapper">
                    {pages}
                </div>
            </div>
        );
    };

    const toggleReviewExpansion = (reviewIndex: number) => {
        setExpandedReviews(prev => {
            const newSet = new Set(prev);
            if (newSet.has(reviewIndex)) {
                newSet.delete(reviewIndex);
            } else {
                newSet.add(reviewIndex);
            }
            return newSet;
        });
    };

    const truncateText = (text: string, maxLength: number = 150) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const renderReviewContent = (content: string, reviewIndex: number, isExpanded: boolean) => {
        const truncatedContent = truncateText(content);
        const shouldShowViewMore = content.length > 150;

        return (
            <div>
                <p className="text-[var(--primary-text)] review-name-content">
                    {isExpanded ? content : truncatedContent}
                </p>
                {shouldShowViewMore && (
                    <button
                        onClick={() => toggleReviewExpansion(reviewIndex)}
                        className="text-[var(--primary-color)] text-[10px] mt-1 font-medium hover:underline focus:outline-none"
                    >
                        {isExpanded ? 'View Less' : 'View More'}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="review-card-container" ref={containerRef}>
            {isLoading && (
                <div className="flex items-center justify-center h-screen">
                    <Loader />
                </div>
            )}
            {/* Close Button */}
            <div className='cross-icon-desktop'>
                <div className='flex items-center justify-end px-0 sm:px-0'>
                    <Icon
                        icon={`${CROSS_ICON}#cross`}
                        width={16}
                        height={16}
                        color={"var(--primary-text)"}
                        className="cursor-pointer cross-icon"
                        viewBox='0 0 16 16'
                        onClick={handleClose}
                    />
                </div>
            </div>
            
            {/* Desktop Store Header */}
            <div className='desktop-store-header px-4 sm:px-6 py-4 bg-[var(--primary-background)] mt-3 mb-6'>
                <div className="flex items-center justify-between">
                    <h2 className="restaurant-name">{storeData?.name}</h2>
                    {storeData?.distance !== undefined && (
                        <span className="distance">{storeData?.distance} {lang.away}</span>
                    )}
                </div>
                <span className="address flex items-center gap-1 justify-start">
                    {storeData?.address}
                </span>
                <div className="flex items-center gap-1 justify-start store-header-rating">
                    {storeReview?.overallrating?.average && <img src={STAR_ICON_PDP} alt="star" className="w-4 h-4" />}
                    <span className="store-rating-text">{storeReview?.overallrating?.average}</span>
                    {storeReview?.overallrating?.totalReview && (
                        <>
                            <span className="rating-separator">•</span>
                            <span className="review-count-link">{storeReview.overallrating.totalReview} {lang.totalReviews}</span>
                        </>
                    )}
                </div>
            </div>

            <div className='cross-icon-mobile px-5 py-4 bg-[var(--primary-background)]'>
                <div className="flex items-center gap-1 justify-end">

                    <Icon
                        icon={`${CROSS_ICON}#cross`}
                        width={16}
                        height={16}
                        color={"var(--primary-text)"}
                        className="cursor-pointer cross-icon"
                        viewBox='0 0 16 16'
                        onClick={handleClose}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <h2 className="restaurant-name">{storeData?.name}</h2>
                    {storeData?.distance !== undefined && (
                        <span className="distance">{storeData?.distance} {lang.away}</span>
                    )}
                </div>
                <span className="address flex items-start gap-1 justify-start mt-1">
                    <Icon
                        icon={`${NAVIGATION_IMAGE}#nav-icon`}
                        width={20}
                        height={20}
                        color={"var(--primary-text)"}
                        className="cursor-pointer cross-icon-mobile"
                        viewBox="0 0 15 17"
                    />
                    {storeData?.address}
                </span>
            </div>

            {/* Rating and Star Breakdown */}
            <div className="flex flex-row py-6 md:mt-0  gap-6 review-rating-container">
                <div className="text-center sm:text-left min-w-[120px]">
                    <div className="flex items-center gap-1 justify-center mb-1">
                        <span className="rating-text-desktop font-bold">{Number(storeReview?.overallrating?.average).toFixed(1)}</span>
                        {storeReview?.overallrating?.average && (
                            <Icon
                                icon={`${STAR_ICON}#star2`}
                                aria-label="Rating Star"
                                width={28}
                                height={28}
                                color={getRatingColor(storeReview?.overallrating?.average || 0)}
                                viewBox="0 0 28 26"
                            />
                        )}
                    </div>
                    {/* Desktop Rating Counts */}
                    <div className="flex items-center gap-1 desktop-rating-counts">
                        {storeReview?.overallrating?.rating && storeReview?.overallrating?.totalReview && (
                            <div className="rating-counts text-[var(--primary-text)] mt-2">
                                {storeReview?.overallrating?.rating} {lang.totalRatings} 
                                {/* <span className="mx-1">/</span>  */}
                                <span className="mx-1" />
                                {storeReview?.overallrating?.totalReview} {lang.totalReviews}
                            </div>
                        )}
                    </div>
                    {/* Mobile Rating Counts */}
                    <div className="flex items-center gap-1 mobile-rating-counts">
                        {storeReview?.overallrating?.rating && storeReview?.overallrating?.totalReview && (
                            <div className="rating-counts text-xs text-[var(--primary-text)] mt-1">
                                <span>{storeReview?.overallrating?.rating} {lang.totalRatings} </span>
                                <span>{storeReview?.overallrating?.totalReview} {lang.totalReviews}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="progress-bar-container">
                    {Object.entries(storeReview?.overallrating.percentages || {})
                        .sort(([a], [b]) => Number(b) - Number(a))
                        .map(([star, percentage]) => {
                            const count = storeReview?.overallrating.starDistribution?.[star] || 0;
                            return (
                              <div
                                key={star}
                                className="flex items-center gap-2 text-xs"
                              >
                                <span className="text-right inline-flex items-center gap-0.5 font-semibold text-[var(--primary-text)]">
                                  {star}
                                  <Icon
                                    icon={`${STAR_ICON}#star2`}
                                    aria-label="Rating Star"
                                    width={10}
                                    height={10}
                                    color={getRatingColor(star)}
                                    viewBox="0 0 28 26"
                                    className="mb-1"
                                  />{" "}
                                </span>
                                <progress
                                  className={`flex-1 appearance-none h-2 rounded bg-gray-200 ${getProgressBarClass(
                                    star
                                  )}`}
                                  value={Number(percentage)}
                                  max={100}
                                />
                                <span className="text-[var(--primary-text)] w-5 text-right">
                                  {count}
                                </span>
                              </div>
                            );
                        })}
                </div>
            </div>

            {/* Parameters */}
            <div className="flex flex-wrap justify-start px-3 md:px-0 text-center text-xs mb-6 gap-3">
                {storeReview?.overallrating?.parameterRatings.map((item: ParameterRating, i: number) => (
                    <div key={i} className="border rounded-lg py-3 px-2 sm:px-4 flex flex-col items-center w-fit sm:w-auto sm:min-w-[120px]"
                        style={{
                            backgroundColor: getRatingBackgroundColor(item?.avgRating || 0),
                            borderColor: getRatingBorderColor(item?.avgRating || 0)
                        }}
                    >
                        <div className="inline-flex items-center gap-0.5 mb-1">
                            <span className="parameter-rating font-bold text-[var(--primary-text)]">{Number(item.avgRating).toFixed(1)}</span>
                            <Icon
                                icon={`${STAR_ICON}#star2`}
                                aria-label="Rating Star"
                                width={16}
                                height={16}
                                color={getRatingColor(item?.avgRating || 0)}
                                viewBox="0 0 28 26"
                                className="w-4 h-4"
                            />
                        </div>
                        <div className="text-[var(--primary-text)] whitespace-nowrap text-[10px] sm:text-xs font-medium">{item.parameterName}</div>
                    </div>
                ))}
            </div>

            {/* AI Summary Box */}
            {/* <div className="bg-purple-50 p-4 sm:p-6 rounded-xl text-xs mb-6 mx-4 sm:mx-0 ai-summary-box">
                <h3 className="flex items-center gap-1 mb-2">
                    <img src={AI_ICON} alt="ai" className="w-6 h-6 sm:w-8 sm:h-8" />
                    <div className="flex flex-col">
                        <h4 className="ai-title">{lang.whatOurCustomersSay}</h4>
                        <p className="ai-description">{lang.aiGeneratedFromTheCustomerReviews}</p>
                    </div>
                </h3>
                <div className="grid gap-3 sm:gap-4">
                    {aiSummaryData.map((item, i) => (
                        <div key={i} className="bg-white rounded-lg p-3 shadow-sm ai-summary-box-item">
                            <div className="rating-badge rounded-full flex items-center gap-1 w-fit mb-2">
                                {"4"}<span className="text-black">★</span>
                            </div>
                            <h4 className="ai-card-title mb-1 flex items-center gap-1">
                                {item.title}
                            </h4>

                            {item.description ? (
                                <p className="ai-card-description">{item.description}</p>
                            ) : (
                                ""
                                <ul className="list-disc list-outside pl-3">
                                    {item.list?.map((point, j) => (
                                        <li key={j} className="ai-card-description">{point}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </div> */}

            <div className='review-container-border'></div>

            {/* Reviews - Desktop Only */}
            <div className="desktop-only">
                {isLoading ? <div className="flex items-center justify-center h-screen">
                    <Loader />
                </div> :
                    <>
                        {storeReview?.reviews && storeReview.reviews.length > 0 && <div className='review-container-title px-4 sm:px-0'>{lang.Reviews}</div>}
                        <div className="space-y-4 mb-2 px-4 sm:px-0">
                            {storeReview?.reviews?.map((r: Review, i: number) => (
                                <div key={i} className="border-b pb-2 last:border-b-0">
                                    <div className="flex items-center gap-2 pb-2">
                                        <div className="rating-badge rounded-full flex items-center gap-1">
                                            {formatRating(r.overall_rating)}<span className="text-[va(--button-primary-text)]">★</span>
                                        </div>
                                        <p className="font-semibold review-name">{r.user_firstname} {r.user_lastname}</p>
                                    </div>
                                    {renderReviewContent(r.content, i, expandedReviews.has(i))}
                                    <p className="text-[var(--secondary-text)] review-date pt-1">{formatDaysAgo(Number(r.created_at))}</p>
                                </div>
                            ))}
                        </div>
                    </>
                }
            </div>

            {/* Reviews - Mobile Only */}
            <div className="mobile-only">
                {allReviews && allReviews.length > 0 && <div className='review-container-title px-4 sm:px-0'>{lang.Reviews}</div>}
                <div className="space-y-4 mb-2 px-4 sm:px-0">
                    {allReviews?.map((r: Review, i: number) => (
                        <div key={i} className="border-b pb-2 last:border-b-0">
                            <div className="flex items-center gap-2 pb-2">
                                <div className="rating-badge rounded-full flex items-center gap-1">
                                    {formatRating(r.overall_rating)}<span className="text-black">★</span>
                                </div>
                                <p className="font-semibold text-sm review-name">{r.user_firstname} {r.user_lastname}</p>
                            </div>
                            {renderReviewContent(r.content, i, expandedReviews.has(i))}
                            <p className="text-[var(--secondary-text)] extra-small-font mt-1">{formatDaysAgo(Number(r.updated_at))}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination - Desktop Only */}
            {renderPagination()}

            {/* Load More button for mobile only */}
            <div className="mobile-only mb-5 border-t border-gray-200 mx-3">
                {currentPage < totalPages && (
                    <div className="flex justify-start mt-4">
                        <button
                            className="font-semibold text-[#FF6A00] focus:outline-none flex items-center gap-2 bg-transparent border-none cursor-pointer"
                            style={{ fontSize: 'var(--heading-h5)' }}
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader size={16} />
                                    Loading...
                                </>
                            ) : (
                                'Load More'
                            )}
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                .review-card-container {
                    background-color:var(--cards-containers);
                    width:100%;
                    min-width:500px;
                    margin:0 auto;
                    max-width:601px;
                    position:relative;
                    overflow-x: hidden;
                }
                
                /* Pagination Styles */
                .pagination-container {
                    margin: 20px 0;
                }
                
                .pagination-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px 0;
                    width:100%;
                    border-top: 1px solid #e5e7eb;
                }
                
                .pagination-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 32px;
                    height: 32px;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: var(--small-font);
                    font-weight: var(--font-medium);
                    cursor: pointer;
                }
                
                .pagination-btn-active {
                    background-color: var(--primary-color);
                    color:var(--black);
                    border-radius: 50%;
                    border:1px solid var(--primary-color);
                }
                
                .pagination-btn-active:hover {
                    background-color: var(--primary-color);
                    color:var(--black);
                    border-radius: 50%;
                    border:1px solid var(--primary-color);
                }
                
                .pagination-btn-prev,
                .pagination-btn-next {
                    color:var(--accent-color);
                    border-color:var(--primary-color);
                }
                
                .pagination-btn-prev:hover,
                .pagination-btn-next:hover {
                    color:var(--accent-color);
                    border-color:var(--primary-color);
                }
                
                .pagination-btn-disabled {
                    color:var(--secondary-text);
                    border-color:var(--borders-dividers);
                    cursor: not-allowed;
                }
                
                .pagination-btn-disabled:hover {
                    color:var(--secondary-text);
                    border-color:var(--borders-dividers);
                }
                
                .pagination-btn-number {
                    color:var(--primary-text);
                    border-color:var(--primary-color);
                    border-radius: 50%;
                    border:1px solid var(--primary-color);
                }
                .pagination-btn-number:hover {
                    color:var(--primary-text);
                    border-radius: 50%;
                    border:1px solid var(--primary-color);
                }
                
                .desktop-only {
                    display: block;
                }
                
                .rating-text-desktop {
                    color:var(--primary-text);
                    font-size:var(--heading-h1);
                    font-weight:var(--font-semi-bold);
                }
                .rating-counts {
                    color:var(--primary-text);
                    font-size:var(--small-font);
                    line-height:0;
                }
                .ai-title {
                    font-size:var(--heading-h4);
                    font-weight:var(--font-semi-bold);
                    margin-bottom:5px;
                    color:var(--primary-text);
                }
                .ai-description {
                    font-size:var(--extraSmall-font);
                    color:var(--primary-text);
                }
                .ai-card-title {
                    font-size:var(--heading-h6);
                    font-weight:var(--font-semi-bold);
                    color:var(--primary-text);
                }
                .ai-card-description {
                    font-size:var(--extraSmall-font);
                    color:var(--primary-text);
                }
                .review-container-border {
                    border-bottom: 4px solid var(--borders-dividers);
                    margin: 20px 0;
                    opacity: 0.4;
                }
                .review-container-title {
                    font-size:var(--heading-h4);
                    font-weight:var(--font-semi-bold);
                    color:var(--primary-text);
                    margin-bottom:10px;
                }
                .rating-badge {
                    background-color:var(--primary-color);
                    color:var(--button-primary-text);
                    font-size:var(--small-font);
                    font-weight:var(--font-semi-bold);
                    padding:2px 8px;
                }
                .parameter-card {
                    min-width: 120px;
                    margin: 0 8px 8px 0;
                    background: #fff;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
                }
                .parameter-rating {
                    font-size: var(--heading-h4);
                    font-weight: var(--font-bold);
                    margin-right: 2px;
                }
                .review-name {
                    color:var(--primary-text);
                    font-size:var(--heading-h6);
                }
                .review-name-content {
                    font-size:var(--small-font);
                }
                .review-date {
                    font-size:var(--small-font);
                }
                .ai-summary-box {
                    background-color:var(--primary-background);
                    color:var(--black);
                }
                .ai-summary-box-item {
                    background-color:var(--primary-background);
                    color:var(--black);
                    border:1px solid var(--inner-allignment-border);
                }
                /* Progress bar custom colors */
                .progress-bar-5,
                .progress-bar-4,
                .progress-bar-3,
                .progress-bar-2,
                .progress-bar-1 {
                    width: 128px;
                    height: 4px;
                    border-radius: 100px;
                    background-color: var(--rating-bg-primary); /* For Firefox and fallback */
                }
                .progress-bar-5::-webkit-progress-bar,
                .progress-bar-4::-webkit-progress-bar,
                .progress-bar-3::-webkit-progress-bar,
                .progress-bar-2::-webkit-progress-bar,
                .progress-bar-1::-webkit-progress-bar {
                    border-radius: 100px;
                    background-color: #E1E3E5;
                }
                .progress-bar-5::-webkit-progress-value { background-color: var(--rating-bg-success-primary); border-radius: 3px; }
                .progress-bar-4::-webkit-progress-value { background-color: var(--rating-bg-success-secondary); border-radius: 3px; }
                .progress-bar-3::-webkit-progress-value { background-color: var(--rating-bg-warning-primary); border-radius: 3px; }
                .progress-bar-2::-webkit-progress-value { background-color: var(--rating-bg-warning-secondary); border-radius: 3px; }
                .progress-bar-1::-webkit-progress-value { background-color: var(--rating-bg-error-primary); border-radius: 3px; }
                .progress-bar-5::-moz-progress-bar { background-color: var(--rating-bg-success-primary); border-radius: 3px; }
                .progress-bar-4::-moz-progress-bar { background-color: var(--rating-bg-success-secondary); border-radius: 3px; }
                .progress-bar-3::-moz-progress-bar { background-color: var(--rating-bg-warning-primary); border-radius: 3px; }
                .progress-bar-2::-moz-progress-bar { background-color: var(--rating-bg-warning-secondary); border-radius: 3px; }
                .progress-bar-1::-moz-progress-bar { background-color: var(--rating-bg-error-primary); border-radius: 3px; }
                .progress-bar-5::-ms-fill { background-color: var(--rating-bg-success-primary); border-radius: 3px; }
                .progress-bar-4::-ms-fill { background-color: var(--rating-bg-success-secondary); border-radius: 3px; }
                .progress-bar-3::-ms-fill { background-color: var(--rating-bg-warning-primary); border-radius: 3px; }
                .progress-bar-2::-ms-fill { background-color: var(--rating-bg-warning-secondary); border-radius: 3px; }
                .progress-bar-1::-ms-fill { background-color: var(--rating-bg-error-primary); border-radius: 3px; }
                .progress-bar-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .desktop-rating-counts {
                    display: block;
                }
                .mobile-rating-counts {
                    display: none;
                }
                .review-rating-container {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-around;
                }
                .cross-icon-desktop {
                    display: block;
                }
                .cross-icon-mobile {
                    display: none;
                }
                .desktop-store-header {
                    display: block;
                    border-radius: 10px;
                }
                .mobile-only {
                    display: none;
                }
                .desktop-only {
                    display: block;
                }
                .restaurant-name {
                    font-size: var(--heading-h3);
                    font-weight: var(--font-semi-bold);
                    color: var(--primary-text);
                }
                .distance {
                    font-size: var(--description-font);
                    color: var(--primary-text);
                }
                .address {
                    font-size: var(--small-font);
                    color: var(--secondary-text);
                    font-weight: var(--font-regular);
                }
                .store-header-rating {
                    margin-top: 4px;
                }
                .store-rating-text {
                    color: var(--secondary-text);
                    font-size: var(--small-font);
                    font-weight: var(--font-semibold);
                }
                .rating-separator {
                    color: var(--secondary-text);
                    font-size: var(--small-font);
                    margin: 0 2px;
                }
                .review-count-link {
                    color: var(--secondary-text);
                    font-size: var(--small-font);
                    font-weight: var(--font-regular);
                    text-decoration: underline;
                    cursor: pointer;
                }
                @media (max-width: 640px) {
                    .review-card-container {
                        min-width: 100%;
                        padding: 0;
                    }
                    .rating-text-desktop {
                        font-size:2rem;
                    }
                    .parameter-rating {
                        font-size: 1rem;
                    }
                    .desktop-rating-counts {
                        display: none;
                    }
                    .mobile-rating-counts {
                        display: block;
                    }
                    .review-rating-container {
                        align-items: center;
                        justify-content: center;
                    }
                    .rating-counts {
                        color:var(--secondary-text);
                        font-size:var(--extraSmall-font);
                        margin-bottom:10px;
                    }
                    .cross-icon-desktop {
                        display: none;
                    }
                    .cross-icon-mobile {
                        display: block;
                    }
                    .desktop-store-header {
                        display: none;
                    }
                    /* Hide pagination on mobile */
                    .desktop-only {
                        display: none;
                    }
                    .mobile-only {
                        display: block;
                    }
                }
            `}</style>
        </div>
    );
};

export default ReviewCard;