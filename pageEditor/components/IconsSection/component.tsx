"use client";

/**
 * IconsSection Component
 * 
 * A flexible and customizable icons section that supports multiple icon types:
 * 
 * 1. **SVG Icons** (iconType: 'svg'):
 *    - Add complete SVG code in the iconSvg field
 *    - Supports color customization via iconColor prop
 *    - Example: <svg width="24" height="24">...</svg>
 * 
 * 2. **Local Images** (iconType: 'local'):
 *    - Use local file paths starting with '/'
 *    - Optimized with Next.js Image component
 *    - Example: /images/icon.svg, /public/icons/service.png
 * 
 * 3. **External URLs** (iconType: 'url'):
 *    - Use full URLs starting with 'http' or '//'
 *    - Example: https://example.com/icon.svg
 * 
 * Features:
 * - Responsive design with customizable grid columns
 * - Hover effects and animations
 * - Configurable styling for each element
 * - Support for theme variables
 * - Fallback placeholders for missing icons
 * - Mobile-specific settings for alignment and typography
 * - Shadow toggle option
 * 
 * @param props - IconsSectionProps containing all configuration options
 * @returns JSX.Element - The rendered icons section
 */

import React from 'react';
import Image from 'next/image';
import { IconsSectionProps, IconCard } from './fields';
import { open_dialog } from '@lib/modalHandler';
import { useIsCurrentPage } from 'utils/useIsCurrentPage';

export default function OurServices(props: IconsSectionProps & Record<string, unknown>) {
  const {
    basicContent = {
      title: "Our Services",
      subtitle: "Discover what we offer",
      iconCards: []
    },
    styling = {
      layout: {
        backgroundColor: "transparent",
        maxWidth: "unset"
      },
      spacing: {
        spacing: {
          desktop: {
            padding: "48px",
            margin: "0 auto"
          },
          mobile: {
            padding: "24px 16px",
            margin: "0 auto"
          }
        }
      },
      typography: {
        title: {
          fontSize: "20px",
          fontWeight: "700",
          lineHeight: "1.2",
          color: "var(--primary-text)",
          alignment: "center",
          mobile: {
            fontSize: "16px",
            fontWeight: "500",
            lineHeight: "1.2"
          }
        },
        subtitle: {
          fontSize: "16px",
          fontWeight: "400",
          lineHeight: "1.5",
          color: "var(--secondary-text)",
          alignment: "center",
          mobile: {
            fontSize: "14px",
            fontWeight: "400",
            lineHeight: "1.5"
          }
        }
      },
      grid: {
        columns: 3,
        spacing: 32,
        mobileColumns: 2,
        mobileSpacing: 20
      },
      card: {
        title: {
          color: "var(--primary-text)",
          fontSize: "16px",
          fontWeight: "600",
          mobile: {
            fontSize: "14px",
            fontWeight: "500",
            lineHeight: "1.2"
          }
        },
        description: {
          color: "var(--secondary-text)",
          fontSize: "14px",
          fontWeight: "400",
          mobile: {
            fontSize: "12px",
            fontWeight: "400",
            lineHeight: "1.5"
          }
        },
        backgroundColor: "#ffffff",
        padding: "16px",
        borderRadius: "8px",
        shadow: true,
        shadowType: "small",
        hoverColor: "#f8f9fa",
        backgroundVisibility: 1
      }
    },
    advanceSettings = {}
  } = props;

  const { title, subtitle, iconCards, enableModal = true, showViewMore = false, viewMoreText = "View more" } = basicContent;
  const { layout, spacing, typography, grid, card } = styling;

  const isAboutusPage = useIsCurrentPage("/about-us");

  // Text alignment class mapping for Tailwind
  const getAlignmentClass = (alignment: string) => {
    switch (alignment) {
      case 'left': return 'text-left';
      case 'right': return 'text-right';
      default: return 'text-center';
    }
  };

  // Border radius class mapping for Tailwind
  const getBorderRadiusClass = (radius: string) => {
    switch (radius) {
      case '0px': return 'rounded-none';
      case '4px': return 'rounded';
      case '8px': return 'rounded-md';
      case '12px': return 'rounded-lg';
      case '16px': return 'rounded-xl';
      case '20px': return 'rounded-2xl';
      case '24px': return 'rounded-3xl';
      case '9999px': return 'rounded-full';
      default: return 'rounded-none';
    }
  };

  // Shadow class mapping for Tailwind
  const getShadowClass = (hasShadow: boolean, shadowType: string) => {
    if (!hasShadow) return 'shadow-none';
    switch (shadowType) {
      case 'small': return 'shadow-sm hover:shadow-md';
      case 'medium': return 'shadow-md hover:shadow-lg';
      case 'large': return 'shadow-lg hover:shadow-xl';
      case 'xl': return 'shadow-xl hover:shadow-2xl';
      case '2xl': return 'shadow-2xl hover:shadow-3xl';
      default: return 'shadow-sm hover:shadow-md';
    }
  };

  // Render icon based on type
  const renderIcon = (iconCard: IconCard, index: number) => {
    if (iconCard.iconType === 'svg' && iconCard.iconSvg) {
      return (
        <div 
          className={`flex items-center justify-center flex-shrink-0 icon-svg-${index}`}
          dangerouslySetInnerHTML={{ __html: iconCard.iconSvg }}
        />
      );
    } else if (iconCard.iconType === 'local' && iconCard.iconUrl) {
      return (
        <Image
          src={iconCard.iconUrl}
          alt={iconCard.title}
          title={iconCard.title}
          width={iconCard.iconSize}
          height={iconCard.iconSize}
          className={`object-contain flex-shrink-0 icon-image-${index}`}
        />
      );
    } else if (iconCard.iconType === 'url' && iconCard.iconUrl) {
      return (
        <Image
          src={iconCard.iconUrl}
          alt={iconCard.title}
          title={iconCard.title}
          width={iconCard.iconSize}
          height={iconCard.iconSize}
          className={`object-contain flex-shrink-0 icon-image-${index}`}
        />
      );
    }
    return (
      <div className={`flex-shrink-0 select-none bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold icon-placeholder-${index}`}>
        ?
      </div>
    );
  };

  return (
    <section
      id={advanceSettings.sectionId}
      aria-label={advanceSettings.sectionAriaLabel}
      role={advanceSettings.sectionRole}
      tabIndex={advanceSettings.tabIndex}
      className="w-full flex flex-col items-center box-border section-wrapper container mx-auto"
      {...(advanceSettings.dataAttributes
        ? Object.fromEntries(
            Object.entries(advanceSettings.dataAttributes).map(([key, value]) => [
              `data-${key}`, value
            ])
          )
        : {})}
    >
      <div className="w-full text-center mx-auto">
        {/* Section Title */}
        {title && (
          <h2
            className={`
              mb-5 leading-tight our-services-title md:text-xl lg:text-2xl xl:text-3xl md:mb-4
              ${getAlignmentClass(typography.title?.alignment ?? 'center')}
            `}
          >
            {title}
          </h2>
        )}
        {/* Section Subtitle */}
        {subtitle && (
          <p
            className={`
              md:mb-6 leading-relaxed our-services-subtitle md:mt-2
              ${getAlignmentClass(typography.subtitle?.alignment ?? 'center')}
            `}
          >
            {subtitle}
          </p>
        )}
        {/* Icons Grid */}
        <div
          className={`icons-grid w-full md:w-[700px] lg:w-[800px] xl:w-[1000px] mx-auto md:pt-3
            ${(iconCards?.length ?? 0) <= 3 ? 'few-cards px-0' : ''}
          `}
        >
          {iconCards?.map((iconCard: IconCard, index: number) => (
            <div
              key={iconCard.id || index}
              className={`
                transition-all duration-300 border border-transparent
                flex flex-col items-center justify-center min-h-[140px]
                icon-card xl:min-w-[${isAboutusPage ? '282px' : '100px'}]
                ${getShadowClass(card.shadow, card.shadowType)}
                ${getBorderRadiusClass(card.borderRadius)}
                sm:min-h-[160px] lg:min-h-[200px]
                ${enableModal ? 'cursor-pointer hover:transform hover:-translate-y-1' : ''}
              `}
              onClick={enableModal ? () => {
                open_dialog("featureModal", {
                  open: true,
                  type: "featureModal",
                  handlerDialog: () => {},
                  handleClose: () => {},
                  anchor: "bottom", 
                  propsData: {
                    title: iconCard?.title,
                    longDescription: iconCard?.longDescription,
                    icon: renderIcon(iconCard, index),
                  },
                  sxStyle: {
                    '& .MuiPaper-root': {
                      width: '100%',
                      height: 'auto',
                      borderRadius: '12px',
                      '@media screen and (max-width: 768px)': {
                        borderRadius: '12px 12px 0 0',
                      },
                    },
                    '& .MuiDialogContent-root': {
                      padding: '30px',
                    },
                  },
                });
              } : undefined}
            >
              {/* Icon */}
              <div className="mb-5 flex justify-center items-center">
                {renderIcon(iconCard, index)}
              </div>
              {/* Card Title */}
              {iconCard.title && (
                <h3
                  className={`
                    mb-2 leading-tight card-title
                  `}
                >
                  {iconCard.title}
                </h3>
              )}
              {/* Card Description */}
              {iconCard.description && (
                <p
                  className={`
                    m-0 leading-relaxed card-description `}
                >
                  {iconCard.description}
                </p>
              )}

              {/* View More Button */}
              {showViewMore && (
                <button 
                  className='viewMoreButton mt-2'
                >
                  {viewMoreText}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* CSS Styles with Responsive Variables */}
      <style>{`
        .icons-grid {
          display: grid;
          gap: ${grid.spacing || 32}px;
          grid-template-columns: repeat(${grid.columns || 3}, 1fr);
        }
    
        .section-wrapper {
          background-color: ${layout.backgroundColor};
          max-width: ${layout.maxWidth};
          padding: ${spacing.spacing?.desktop?.padding || '48px'};
          margin: ${spacing.spacing?.desktop?.margin || '0 auto'};
        }
        .our-services-title {
          font-size: ${typography.title?.fontSize || '20px'};
          font-weight: ${typography.title?.fontWeight || '700'};
          line-height: ${typography.title?.lineHeight || '1.2'};
          color: ${typography.title?.color || 'var(--primary-text)'};
        }
        .our-services-subtitle {
          font-size: ${typography.subtitle?.fontSize || '16px'};
          font-weight: ${typography.subtitle?.fontWeight || '400'};
          line-height: ${typography.subtitle?.lineHeight || '1.5'};
          color: ${typography.subtitle?.color || 'var(--secondary-text)'};
        }
        .icon-card {
          background-color: ${card.backgroundVisibility === 0 ? card.hoverColor : card.backgroundColor};
          padding: ${card.padding || '16px'};
          border-radius: ${card.borderRadius || '8px'};
        }
        ${card.backgroundVisibility === 1 ? `
        .icon-card:hover {
          background-color: ${card.hoverColor};
        }
        ` : ''}
        .card-title {
          color: ${card.title?.color || '#333333'};
          font-size: ${card.title?.fontSize || '16px'};
          font-weight: ${card.title?.fontWeight || '600'};
        }
        .card-description {
          color: ${card.description?.color || '#666666'};
          font-size: ${card.description?.fontSize || '14px'};
          font-weight: ${card.description?.fontWeight || '400'};
        }
        .viewMoreButton {
          color: ${card.viewMore?.color || 'var(--accent-color)'} !important;
          font-size: ${card.viewMore?.fontSize || '14px'} !important;
          font-weight: ${card.viewMore?.fontWeight || '400'} !important;
          background: none !important;
          border: none !important;
          cursor: pointer !important;
          padding: 0 !important;
        }
            ${iconCards?.map((iconCard: IconCard, index: number) => `
          .icon-svg-${index} {
            width: ${iconCard.iconSize || 48}px;
            height: ${iconCard.iconSize || 48}px;
            color: ${iconCard.iconColor || '#000'};
          }
          .icon-image-${index} {
            width: ${iconCard.iconSize || 48}px;
            height: ${iconCard.iconSize || 48}px;
          }
          .icon-placeholder-${index} {
            width: ${iconCard.iconSize || 48}px;
            height: ${iconCard.iconSize || 48}px;
            font-size: ${(iconCard.iconSize || 48) * 0.4}px;
          }
        `).join('') || ''}
        
        @media screen and (max-width: 768px) {
          .section-wrapper {
            padding: ${spacing.spacing?.mobile?.padding ?? '24px 16px 8px'} !important;
            margin: ${spacing.spacing?.mobile?.margin ?? '0 auto'} !important;
          }
          .our-services-title {
            font-size: ${(typography.title && 'mobile' in typography.title && typography.title.mobile?.fontSize) ?? '16px'} !important;
            font-weight: ${(typography.title && 'mobile' in typography.title && typography.title.mobile?.fontWeight) ?? '500'} !important;
            line-height: ${(typography.title && 'mobile' in typography.title && typography.title.mobile?.lineHeight) ?? '1.2'} !important;
          }
          .our-services-subtitle {
            font-size: ${(typography.subtitle && 'mobile' in typography.subtitle && typography.subtitle.mobile?.fontSize) ?? '14px'} !important;
            font-weight: ${(typography.subtitle && 'mobile' in typography.subtitle && typography.subtitle.mobile?.fontWeight) ?? '400'} !important;
            line-height: ${(typography.subtitle && 'mobile' in typography.subtitle && typography.subtitle.mobile?.lineHeight) ?? '1.5'} !important;
            margin-bottom: 1rem !important;
          }
          .card-title {
            font-size: ${(card.title && 'mobile' in card.title && card.title.mobile?.fontSize) ?? '14px'} !important;
            font-weight: ${(card.title && 'mobile' in card.title && card.title.mobile?.fontWeight) ?? '500'} !important;
            line-height: ${(card.title && 'mobile' in card.title && card.title.mobile?.lineHeight) ?? '1.2'} !important;
          }
          .card-description {
            font-size: ${(card.description && 'mobile' in card.description && card.description.mobile?.fontSize) ?? '12px'} !important;
            font-weight: ${(card.description && 'mobile' in card.description && card.description.mobile?.fontWeight) ?? '400'} !important;
            line-height: ${(card.description && 'mobile' in card.description && card.description.mobile?.lineHeight) ?? '1.5'} !important;
          }
          .viewMoreButton {
            font-size: ${(card.viewMore && 'mobile' in card.viewMore && card.viewMore.mobile?.fontSize) ?? '12px'} !important;
            font-weight: ${(card.viewMore && 'mobile' in card.viewMore && card.viewMore.mobile?.fontWeight) ?? '500'} !important;
            line-height: ${(card.viewMore && 'mobile' in card.viewMore && card.viewMore.mobile?.lineHeight) ?? '1.4'} !important;
          }
          .icons-grid {
            gap: ${grid.mobileSpacing || 20}px !important;
            grid-template-columns: repeat(${grid.mobileColumns || 2}, 1fr) !important;
          }

         .icons-grid.few-cards {
            display: flex !important;
            flex-direction: column !important;
          }
         }
        }

    
      
      `}</style>
      <style>{`
      
      `}</style>
    </section>
  );
} 