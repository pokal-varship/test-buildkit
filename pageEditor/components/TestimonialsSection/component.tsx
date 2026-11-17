"use client";

import React from "react";
import { TestimonialsSectionProps, testimonialsSectionDefaultProps } from "./fields";
import SliderNavigation from "@components/ui/SliderNavigation";
import useSwiperNavigation from "@hooks/useSwiperNavigation";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import useIsMobile from "@hooks/useIsMobile";
import StarIcon from "@components/icons/Star";

// Helper to truncate review text

export const TestimonialsSection = (props: Partial<TestimonialsSectionProps> & Record<string, any>) => {
  // Check if resolvedData is available (injected from server-side)
  const resolvedData = props.resolvedData;
  
  // Merge props with defaults, ensuring all nested objects are defined
  const mergedProps: TestimonialsSectionProps = {
    ...testimonialsSectionDefaultProps,
    ...props,
    basicContent: {
      ...testimonialsSectionDefaultProps.basicContent,
      ...(props.basicContent || {}),
      // Use resolvedData testimonials if available, otherwise use props
      testimonials: resolvedData?.testimonials || props.basicContent?.testimonials || testimonialsSectionDefaultProps.basicContent?.testimonials || [],
    },
    styling: {
      ...testimonialsSectionDefaultProps.styling,
      ...(props.styling || {}),
      layout: {
        ...((testimonialsSectionDefaultProps.styling && testimonialsSectionDefaultProps.styling.layout) || {}),
        ...(props.styling?.layout || {}),
      },
      spacing: {
        ...((testimonialsSectionDefaultProps.styling && testimonialsSectionDefaultProps.styling.spacing) || {}),
        ...(props.styling?.spacing || {}),
        desktop: {
          ...((testimonialsSectionDefaultProps.styling && testimonialsSectionDefaultProps.styling.spacing && testimonialsSectionDefaultProps.styling.spacing.desktop) || {}),
          ...(props.styling?.spacing?.desktop || {}),
        },
        mobile: {
          ...((testimonialsSectionDefaultProps.styling && testimonialsSectionDefaultProps.styling.spacing && testimonialsSectionDefaultProps.styling.spacing.mobile) || {}),
          ...(props.styling?.spacing?.mobile || {}),
        },
      },
      typography: {
        ...((testimonialsSectionDefaultProps.styling && testimonialsSectionDefaultProps.styling.typography) || {}),
        ...(props.styling?.typography || {}),
        title: {
          ...((testimonialsSectionDefaultProps.styling && testimonialsSectionDefaultProps.styling.typography && testimonialsSectionDefaultProps.styling.typography.title) || {}),
          ...(props.styling?.typography?.title || {}),
          mobile: {
            ...((testimonialsSectionDefaultProps.styling && testimonialsSectionDefaultProps.styling.typography && testimonialsSectionDefaultProps.styling.typography.title && testimonialsSectionDefaultProps.styling.typography.title.mobile) || {}),
            ...(props.styling?.typography?.title?.mobile || {}),
          },
        },
        subtitle: {
          ...((testimonialsSectionDefaultProps.styling && testimonialsSectionDefaultProps.styling.typography && testimonialsSectionDefaultProps.styling.typography.subtitle) || {}),
          ...(props.styling?.typography?.subtitle || {}),
          mobile: {
            ...((testimonialsSectionDefaultProps.styling && testimonialsSectionDefaultProps.styling.typography && testimonialsSectionDefaultProps.styling.typography.subtitle && testimonialsSectionDefaultProps.styling.typography.subtitle.mobile) || {}),
            ...(props.styling?.typography?.subtitle?.mobile || {}),
          },
        },
      },
      rating: {
        ...((testimonialsSectionDefaultProps.styling && testimonialsSectionDefaultProps.styling.rating) || {}),
        ...(props.styling?.rating || {}),
        mobile: {
          ...((testimonialsSectionDefaultProps.styling && testimonialsSectionDefaultProps.styling.rating && testimonialsSectionDefaultProps.styling.rating.mobile) || {}),
          ...(props.styling?.rating?.mobile || {}),
        },
      },
      card: {
        ...((testimonialsSectionDefaultProps.styling && testimonialsSectionDefaultProps.styling.card) || {}),
        ...(props.styling?.card || {}),
        review: {
          ...((testimonialsSectionDefaultProps.styling && testimonialsSectionDefaultProps.styling.card && testimonialsSectionDefaultProps.styling.card.review) || {}),
          ...(props.styling?.card?.review || {}),
          mobile: {
            ...((testimonialsSectionDefaultProps.styling && testimonialsSectionDefaultProps.styling.card && testimonialsSectionDefaultProps.styling.card.review && testimonialsSectionDefaultProps.styling.card.review.mobile) || {}),
            ...(props.styling?.card?.review?.mobile || {}),
          },
        },
        location: {
          ...((testimonialsSectionDefaultProps.styling && testimonialsSectionDefaultProps.styling.card && testimonialsSectionDefaultProps.styling.card.location) || {}),
          ...(props.styling?.card?.location || {}),
          mobile: {
            ...((testimonialsSectionDefaultProps.styling && testimonialsSectionDefaultProps.styling.card && testimonialsSectionDefaultProps.styling.card.location && testimonialsSectionDefaultProps.styling.card.location.mobile) || {}),
            ...(props.styling?.card?.location?.mobile || {}),
          },
        },
      },
      button: {
        ...((testimonialsSectionDefaultProps.styling && testimonialsSectionDefaultProps.styling.button) || {}),
        ...(props.styling?.button || {}),
        mobile: {
          ...((testimonialsSectionDefaultProps.styling && testimonialsSectionDefaultProps.styling.button && testimonialsSectionDefaultProps.styling.button.mobile) || {}),
          ...(props.styling?.button?.mobile || {}),
        },
      },
    },
    advanceSettings: {
      ...testimonialsSectionDefaultProps.advanceSettings,
      ...(props.advanceSettings || {}),
      ratings: {
        ...((testimonialsSectionDefaultProps.advanceSettings && testimonialsSectionDefaultProps.advanceSettings.ratings) || {}),
        ...(props.advanceSettings?.ratings || {}),
      },
      cardSettings: {
        ...((testimonialsSectionDefaultProps.advanceSettings && testimonialsSectionDefaultProps.advanceSettings.cardSettings) || {}),
        ...(props.advanceSettings?.cardSettings || {}),
      },
      buttonSettings: {
        ...((testimonialsSectionDefaultProps.advanceSettings && testimonialsSectionDefaultProps.advanceSettings.buttonSettings) || {}),
        ...(props.advanceSettings?.buttonSettings || {}),
      },
      accessibility: {
        ...((testimonialsSectionDefaultProps.advanceSettings && testimonialsSectionDefaultProps.advanceSettings.accessibility) || {}),
        ...(props.advanceSettings?.accessibility || {}),
      },
      // Use resolvedData for loading, error, and totalReviews if available
      loading: resolvedData?.loading ?? false,
      error: resolvedData?.error ?? null,
      totalReviews: resolvedData?.totalReviews ?? 0,
    },
  };

  const {
    basicContent,
    styling,
    advanceSettings,
  } = mergedProps;

  const {
    title = "What Our Customers Say",
    subtitle = "Read testimonials from our satisfied customers",
    testimonials = [],
    button,
  } = basicContent || {};

  const {
    layout = { backgroundColor: "#ffffff", maxWidth: "100%" },
    spacing = { desktop: { padding: "80px 20px", margin: "0 auto" } },
    typography = {
      title: { fontSize: "36px", fontWeight: "600", color: "#2d2d2d", lineHeight: "1.2", alignment: "center" },
      subtitle: { fontSize: "18px", fontWeight: "400", color: "#757575", lineHeight: "1.5", alignment: "center" }
    },
    rating: ratingStyle,
    card: cardStyle,
    button: buttonStyle,
  } = styling || {};

  const {
    ratings: ratingsSettings,
    cardSettings,
    buttonSettings,
    accessibility,
    loading = false,
    error = null,
    totalReviews = 0,
  } = advanceSettings || {};

  // Use the navigation hook for slider functionality
  const { swiperRef, onPrevClick, onNextClick, isBeginning, isEnd } = useSwiperNavigation();
  const isMobile = useIsMobile();
  
  // Ensure Swiper initializes properly on page load
  React.useEffect(() => {
    const swiper = swiperRef.current?.swiper;
    if (swiper && swiper.width !== undefined) {
      // Force Swiper to update its dimensions and layout
      setTimeout(() => {
        try {
          swiper.update();
          swiper.updateSize();
          swiper.updateSlides();
        } catch {

        }
      }, 100);
    }
  }, [testimonials.length]);
  
  // Generate star rating component
  const renderStars = (rating: number) => {
    const stars = [];
    const safeRating = Math.max(0, Math.min(5, rating || 0)); // Ensure rating is between 0-5
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= safeRating;
      stars.push(
        <StarIcon
          key={i}
          className="testimonial-star"
          pathFillColor={isFilled ? 'var(--testimonial-rating-star-color, var(--rating-bg-primary))' : '#E5E7EB'}
          borderColor={isFilled ? 'var(--testimonial-rating-star-color, var(--rating-bg-primary))' : '#E5E7EB'}
        />
      );
    }
    return stars;
  };

  const truncateText = (text: string, maxLength: number, mobileMaxLength: number) => {
    if (!text || typeof text !== 'string') return '';
    const safeText = text.toString();
    return isMobile ? safeText.length > mobileMaxLength ? safeText.slice(0, mobileMaxLength) + '...' : safeText : safeText.length > maxLength ? safeText.slice(0, maxLength) + '...' : safeText;
  }

  // Set CSS variables for dynamic values
  const cssVars: React.CSSProperties = {
    // Layout
    '--testimonials-bg': layout?.backgroundColor || '#ffffff',
    '--testimonials-max-width': layout?.maxWidth || '100%',
    '--testimonials-padding': spacing?.desktop?.padding || '40px 30px',
    '--testimonials-padding-mobile': spacing?.mobile?.padding || '24px 16px',
    // Typography
    '--testimonials-title-font-size': typography?.title?.fontSize || '32px',
    '--testimonials-title-color': typography?.title?.color || '#2d2d2d',
    '--testimonials-title-font-weight': typography?.title?.fontWeight || '600',
    '--testimonials-title-line-height': typography?.title?.lineHeight || '1.2',
    '--testimonials-title-align': typography?.title?.alignment || 'center',
    '--testimonials-title-mobile-font-size': (typography?.title && 'mobile' in typography.title && typography.title.mobile?.fontSize) || '24px',
    '--testimonials-title-mobile-font-weight': (typography?.title && 'mobile' in typography.title && typography.title.mobile?.fontWeight) || '600',
    '--testimonials-title-mobile-line-height': (typography?.title && 'mobile' in typography.title && typography.title.mobile?.lineHeight) || '1.2',
    '--testimonials-title-mobile-color': (typography?.title && 'mobile' in typography.title && typography.title.mobile?.color) || typography?.title?.color || '#2d2d2d',
    '--testimonials-subtitle-font-size': typography?.subtitle?.fontSize || '16px',
    '--testimonials-subtitle-color': typography?.subtitle?.color || '#757575',
    '--testimonials-subtitle-font-weight': typography?.subtitle?.fontWeight || '400',
    '--testimonials-subtitle-line-height': typography?.subtitle?.lineHeight || '1.5',
    '--testimonials-subtitle-align': typography?.subtitle?.alignment || 'center',
    '--testimonials-subtitle-mobile-font-size': (typography?.subtitle && 'mobile' in typography.subtitle && typography.subtitle.mobile?.fontSize) || '14px',
    '--testimonials-subtitle-mobile-font-weight': (typography?.subtitle && 'mobile' in typography.subtitle && typography.subtitle.mobile?.fontWeight) || '400',
    '--testimonials-subtitle-mobile-line-height': (typography?.subtitle && 'mobile' in typography.subtitle && typography.subtitle.mobile?.lineHeight) || '1.5',
    '--testimonials-subtitle-mobile-color': (typography?.subtitle && 'mobile' in typography.subtitle && typography.subtitle.mobile?.color) || typography?.subtitle?.color || '#757575',

    // Rating
    '--testimonial-rating-font-size': ratingStyle?.fontSize || '16px',
    '--testimonial-rating-color': ratingStyle?.color || '#757575',
    '--testimonial-rating-star-color': ratingStyle?.starColor || 'var(--rating-bg-primary)',
    '--testimonial-rating-align': ratingStyle?.alignment || 'left',
    '--testimonial-rating-mobile-font-size': (ratingStyle && 'mobile' in ratingStyle && ratingStyle.mobile?.fontSize) || '14px',
    '--testimonial-rating-mobile-color': (ratingStyle && 'mobile' in ratingStyle && ratingStyle.mobile?.color) || ratingStyle?.color || '#757575',
    '--testimonial-rating-mobile-star-color': (ratingStyle && 'mobile' in ratingStyle && ratingStyle.mobile?.starColor) || ratingStyle?.starColor || 'var(--rating-bg-primary)',
    // Card
    '--testimonial-card-bg': cardStyle?.backgroundColor || '#ffffff',
    '--testimonial-card-radius': cardStyle?.borderRadius || '10px',
    '--testimonial-card-padding': cardStyle?.padding || '24px',
    '--testimonial-card-shadow': cardSettings?.boxShadow ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
    '--testimonial-card-min-height': cardSettings?.minHeight || '250px',
    '--testimonial-card-mobile-min-height': (cardSettings && 'mobile' in cardSettings && cardSettings.mobile?.minHeight) || cardSettings?.minHeight || '150px',
    // Review
    '--testimonial-review-font-size': cardStyle?.review?.fontSize || '14px',
    '--testimonial-review-color': cardStyle?.review?.color || '#333333',
    '--testimonial-review-font-weight': cardStyle?.review?.fontWeight || '400',
    '--testimonial-review-line-height': cardStyle?.review?.lineHeight || '1.5',
    '--testimonial-review-mobile-font-size': (cardStyle?.review && 'mobile' in cardStyle.review && cardStyle.review.mobile?.fontSize) || '14px',
    '--testimonial-review-mobile-color': (cardStyle?.review && 'mobile' in cardStyle.review && cardStyle.review.mobile?.color) || cardStyle?.review?.color || '#333333',
    '--testimonial-review-mobile-font-weight': (cardStyle?.review && 'mobile' in cardStyle.review && cardStyle.review.mobile?.fontWeight) || '400',
    '--testimonial-review-mobile-line-height': (cardStyle?.review && 'mobile' in cardStyle.review && cardStyle.review.mobile?.lineHeight) || '1.5',
    // Location
    '--testimonial-location-font-size': cardStyle?.location?.fontSize || '12px',
    '--testimonial-location-color': cardStyle?.location?.color || '#666666',
    '--testimonial-location-font-weight': cardStyle?.location?.fontWeight || '400',
    '--testimonial-location-line-height': cardStyle?.location?.lineHeight || '1.5',
    '--testimonial-location-mobile-font-size': (cardStyle?.location && 'mobile' in cardStyle.location && cardStyle.location.mobile?.fontSize) || '12px',
    '--testimonial-location-mobile-color': (cardStyle?.location && 'mobile' in cardStyle.location && cardStyle.location.mobile?.color) || cardStyle?.location?.color || '#666666',
    '--testimonial-location-mobile-font-weight': (cardStyle?.location && 'mobile' in cardStyle.location && cardStyle.location.mobile?.fontWeight) || '400',
    '--testimonial-location-mobile-line-height': (cardStyle?.location && 'mobile' in cardStyle.location && cardStyle.location.mobile?.lineHeight) || '1.5',
    // Button
    '--testimonial-btn-bg': buttonStyle?.backgroundColor || '#007bff',
    '--testimonial-btn-color': buttonStyle?.textColor || '#ffffff',
    '--testimonial-btn-font-weight': buttonStyle?.fontWeight || '500',
    '--testimonial-btn-font-size': buttonStyle?.fontSize || '16px',
    '--testimonial-btn-height': buttonStyle?.height || '48px',
    '--testimonial-btn-width': buttonStyle?.width || 'auto',
    '--testimonial-btn-radius': buttonStyle?.borderRadius || '8px',
    '--testimonial-btn-padding': buttonStyle?.padding || '12px 24px',
    '--testimonial-btn-shadow': buttonStyle?.boxShadow || 'none',
    '--testimonial-btn-mobile-bg': (buttonStyle && 'mobile' in buttonStyle && buttonStyle.mobile?.backgroundColor) || buttonStyle?.backgroundColor || '#007bff',
    '--testimonial-btn-mobile-color': (buttonStyle && 'mobile' in buttonStyle && buttonStyle.mobile?.textColor) || buttonStyle?.textColor || '#ffffff',
    '--testimonial-btn-mobile-font-weight': (buttonStyle && 'mobile' in buttonStyle && buttonStyle.mobile?.fontWeight) || buttonStyle?.fontWeight || '500',
    '--testimonial-btn-mobile-font-size': (buttonStyle && 'mobile' in buttonStyle && buttonStyle.mobile?.fontSize) || '14px',
    '--testimonial-btn-mobile-height': (buttonStyle && 'mobile' in buttonStyle && buttonStyle.mobile?.height) || '40px',
    '--testimonial-btn-mobile-width': (buttonStyle && 'mobile' in buttonStyle && buttonStyle.mobile?.width) || 'auto',
    '--testimonial-btn-mobile-radius': (buttonStyle && 'mobile' in buttonStyle && buttonStyle.mobile?.borderRadius) || '8px',
    '--testimonial-btn-mobile-padding': (buttonStyle && 'mobile' in buttonStyle && buttonStyle.mobile?.padding) || '10px 22px',
    '--testimonial-btn-mobile-shadow': (buttonStyle && 'mobile' in buttonStyle && buttonStyle.mobile?.boxShadow) || 'none',
  } as React.CSSProperties;

  // Don't render the section if there are no testimonials and not loading
  if (!loading && !error && testimonials.length === 0) {
    return <></>;
  }

  return (
    <div
      className="testimonials-section container mx-auto"
      aria-label={accessibility?.ariaLabel}
      role={accessibility?.role}
      tabIndex={accessibility?.tabIndex}
      style={cssVars}
    >
      <div className="testimonials-header flex flex-col ">
        <h2 className="testimonials-title">{title}</h2>
        {ratingsSettings?.showGoogleRating && ratingsSettings?.googleRating !== undefined && ratingsSettings?.googleRatingText && (
          <div className="google-rating">
            <div className="google-stars">
              {renderStars(Math.round(ratingsSettings.googleRating || 0))}
            </div>
            <span className="google-rating-text">{ratingsSettings.googleRatingText}</span>
          </div>
        )}
        <p className="testimonials-subtitle m-0">{subtitle}</p>
        {/* {totalReviews > 0 && (
          <p className="testimonials-count m-0 mt-2 text-sm text-gray-500">
            Showing {testimonials.length} of {totalReviews} reviews
          </p>
        )} */}
      </div>
      
      {loading && (
        <div className="testimonials-loading text-center py-8">
          <div className="loading-spinner inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading testimonials...</p>
        </div>
      )}
      
      {error && (
        <div className="testimonials-error text-center py-8">
          <div className="error-icon text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-red-600 mb-2">Failed to load testimonials</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      )}
      
      {!loading && !error && testimonials.length > 0 && (
        <div className="testimonials-slider-container">
          <Swiper
            ref={swiperRef}
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={16}
            slidesPerView={isMobile ? 1.125 : 3}
            breakpoints={{
              320: { slidesPerView: 1.125, spaceBetween: 8 },
              640: { slidesPerView: 2, spaceBetween: 24 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
            }}
            autoplay={false}
            loop={true}
            className="testimonials-swiper"
          >
            {testimonials?.map((testimonial: typeof testimonials[0]) => (
              <SwiperSlide key={testimonial?.id || Math.random().toString()}>
                <div className="testimonial-card">
                  <div className="testimonial-content">
                    <div className="testimonial-rating">{renderStars(testimonial?.rating || 0)}</div>
                    <p className="testimonial-review">"{truncateText(testimonial?.review || '', 800, 420)}"</p>
                  </div>
                  <div className="testimonial-author">
                    <div className="author-info">
                      <div className="author-name">{testimonial?.name || 'Anonymous'}</div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          <SliderNavigation
            onPrevClick={onPrevClick}
            onNextClick={onNextClick}
            disabled={isBeginning && isEnd}
            size="md"
            variant="default"
            hideOnMobile={false}
            className="testimonials-navigation"
          />
        </div>
      )}
      <style>{`
        .testimonials-section {
          background: transparent !important;
          padding: var(--testimonials-padding);
          margin: 0 auto;
          box-sizing: border-box;
        }
        .testimonials-header {
          text-align: var(--testimonials-title-align, center);
          margin-bottom: 56px;
        }
        .testimonials-title {
          font-size: var(--testimonials-title-font-size);
          color: var(--testimonials-title-color);
          font-weight: var(--testimonials-title-font-weight);
          line-height: var(--testimonials-title-line-height);
          margin-bottom: 1.5rem;
        }
        .testimonials-subtitle {
          font-size: var(--testimonials-subtitle-font-size);
          color: var(--testimonials-subtitle-color);
          font-weight: var(--testimonials-subtitle-font-weight);
          line-height: var(--testimonials-subtitle-line-height);
          margin-top: 1rem;
        }

        /* Slider Layout Styles */
        .testimonials-slider-container {
          position: relative;
          margin-bottom: 0;
        }
        
        .testimonials-swiper {
          overflow: hidden;
          padding-bottom: 56px;
        }
        
        .testimonials-navigation {
          margin-top: 0;
        }
        .testimonial-card {
          background: var(--testimonial-card-bg);
          border-radius: var(--testimonial-card-radius);
          padding: var(--testimonial-card-padding);
          box-shadow: var(--testimonial-card-shadow);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: var(--testimonial-card-min-height);
          height: 100%;
        }
        .testimonial-content {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        .testimonial-rating {
          display: flex;
          gap: 2px;
          margin-bottom: 16px;
          text-align: var(--testimonial-rating-align, left);
        }
        .testimonial-review {
          font-size: var(--testimonial-review-font-size);
          color: var(--testimonial-review-color);
          font-weight: var(--testimonial-review-font-weight);
          line-height: var(--testimonial-review-line-height);
          margin-bottom: 16px;
          flex-grow: 1;
        }
        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: auto;
        }
        .author-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }
        .author-info {
          flex: 1;
        }
        .author-name {
          font-size: var(--testimonial-location-font-size);
          color: var(--testimonial-location-color);
          font-weight: var(--testimonial-location-font-weight);
          margin: 0;
        }
        .author-location {
          font-size: var(--testimonial-location-font-size);
          color: var(--testimonial-location-color);
          margin: 0;
        }
        .view-more-container {
          text-align: center;
        }
        .view-more-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--testimonial-btn-bg);
          color: var(--testimonial-btn-color);
          font-weight: var(--testimonial-btn-font-weight);
          font-size: var(--testimonial-btn-font-size);
          height: var(--testimonial-btn-height);
          width: var(--testimonial-btn-width);
          border-radius: var(--testimonial-btn-radius);
          padding: var(--testimonial-btn-padding);
          box-shadow: var(--testimonial-btn-shadow);
          border:1px solid var(--primary-color) !important;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          justify-content: center;
        }
        .button-arrow {
          font-size: calc(var(--testimonial-btn-font-size, 16px) * 0.8);
          margin-left: 2px;
        }
        .google-rating {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 16px;
          color: var(--secondary-text);
        }
        .google-stars {
          display: flex;
          gap: 1px;
        }
        .google-rating-text {
          font-weight: 600;
          font-size: var(--testimonial-rating-font-size);
          color: var(--testimonial-rating-color);
          line-height: var(--testimonial-rating-line-height);
        }
        .testimonials-count {
          font-size: 14px;
          color: #6b7280;
          margin-top: 8px;
        }
        .testimonials-loading,
        .testimonials-error,
        .testimonials-empty {
          min-height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .loading-spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .testimonials-swiper .swiper-slide {
            width: calc(100% / 3.125) !important;
            margin-right: 24px !important;
           
          }

        @media (max-width: 768px) {
          .testimonials-section {
            overflow-x: hidden;
            position: relative;
          }
          .testimonials-header {
            margin-bottom: 24px !important;
          }
          .testimonials-title {
            font-size: var(--testimonials-title-mobile-font-size, 24px) !important;
            font-weight: var(--testimonials-title-mobile-font-weight, 700) !important;
            line-height: var(--testimonials-title-mobile-line-height, 1.2) !important;
            color: var(--testimonials-title-mobile-color, var(--testimonials-title-color)) !important;
            margin-bottom: 1.25rem !important;
          }
          .testimonials-subtitle {
            font-size: var(--testimonials-subtitle-mobile-font-size, 14px) !important;
            font-weight: var(--testimonials-subtitle-mobile-font-weight, 400) !important;
            line-height: var(--testimonials-subtitle-mobile-line-height, 1.5) !important;
            color: var(--testimonials-subtitle-mobile-color, var(--testimonials-subtitle-color)) !important;
            margin-top: 0.75rem !important;
          }
          .testimonials-section {
            padding: var(--testimonials-padding-mobile, 24px 16px) !important;
          }
          .testimonial-card {
            padding: var(--testimonial-card-mobile-padding, 16px) !important;
            min-height: var(--testimonial-card-mobile-min-height);
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: stretch;
          }
          .testimonial-rating {
            font-size: var(--testimonial-rating-mobile-font-size, 14px) !important;
          }
          .testimonial-review {
            font-size: var(--testimonial-review-mobile-font-size, 14px) !important;
            color: var(--testimonial-review-mobile-color, var(--testimonial-review-color)) !important;
            font-weight: var(--testimonial-review-mobile-font-weight, 400) !important;
            line-height: var(--testimonial-review-mobile-line-height, 1.5) !important;
          }
          .google-rating-text {
            font-size: var(--testimonial-rating-mobile-font-size, 14px) !important;
            color: var(--testimonial-rating-mobile-color, var(--testimonial-rating-color)) !important;
            font-weight: 600 !important;
            line-height: var(--testimonial-rating-mobile-line-height, 1.5) !important;
          }
          .author-name, .author-location {
            font-size: var(--testimonial-location-mobile-font-size, 12px) !important;
            color: var(--testimonial-location-mobile-color, var(--testimonial-location-color)) !important;
            font-weight: var(--testimonial-location-mobile-font-weight, 400) !important;
            line-height: var(--testimonial-location-mobile-line-height, 1.5) !important;
          }
          .view-more-button {
            background: var(--testimonial-btn-mobile-bg, var(--testimonial-btn-bg));
            color: var(--testimonial-btn-mobile-color, var(--testimonial-btn-color));
            font-weight: var(--testimonial-btn-mobile-font-weight, var(--testimonial-btn-font-weight));
            font-size: var(--testimonial-btn-mobile-font-size, 14px);
            height: var(--testimonial-btn-mobile-height, 40px);
            width: var(--testimonial-btn-mobile-width, auto);
            border-radius: var(--testimonial-btn-mobile-radius, 8px);
            padding: var(--testimonial-btn-mobile-padding, 10px);
            box-shadow: var(--testimonial-btn-mobile-shadow, none);
          }
            .testimonials-swiper {
              margin-right: -16px !important;
              padding-left: 0 !important;
              padding-right: 0 !important;
              overflow: visible !important;
              padding-bottom:24px !important;
            }

           .testimonials-swiper .swiper-slide {
            width: calc(100% / 1.110) !important;
            margin-right: 10px !important;
          }
        }
      `}</style>
    </div>
  );
};
