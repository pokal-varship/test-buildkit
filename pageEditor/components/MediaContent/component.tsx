"use client";

import React from "react";
import { MediaContentProps } from "./fields";
import "./styles.css";
import { getOptimizedImageUrl } from "utils/image-optimization";
import AnimatedArrow from "@components/icons/AnimatedArrow";
import useMenuModal from "@hooks/useMenuModal";
import Image from "next/image";
import Link from "next/link";
import useAnalytics from "@hooks/useAnalytics";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import { usePathname } from "next/navigation";

export const MediaContent = (props: MediaContentProps & Record<string, any>) => {
  const { handleOpenMenuModal } = useMenuModal();
  const { trackOrderOnlineClicked } = useAnalytics();
  const currentStore = useSelector((state: RootState) => state.store.currentStore);
  const pathname = usePathname();
  // Destructure new prop structure
  const { basic = {}, styling = {}, advanced = {} } = props;
  const {
    title = "British Cuisine... The Way It Should Be!",
    description = "At The Golden Spoon, we honour the rich traditions of British cooking with a modern touch. Our chefs craft each dish using the freshest local ingredients, blending classic flavours with contemporary techniques to create a dining experience that's both familiar and refreshingly new.",
    image: basicImage = {},
    button: basicButton = {},
  } = basic;

  const {
    layout = {},
    spacing = {},
    typography = {},
    image: imageStyling = {},
    button: buttonStyling = {},
  } = styling;

  const {
    accessibility = {},
    imageSettings = {},
    buttonSettings = {},
  } = advanced;

  // Layout
  // const contentAlignment = layout.contentAlignment || "left";
  const maxWidth = layout.maxWidth || "800px";
  const backgroundColor = layout.backgroundColor || "transparent";

  // Spacing
  const desktopPadding = spacing.desktop?.padding || "20px";
  const desktopMargin = spacing.desktop?.margin || "0";
  const mobilePadding = spacing.mobile?.padding || "20px";
  const mobileMargin = spacing.mobile?.margin || "0";

  // Typography
  const titleTypography = typography.title || {};
  const descriptionTypography = typography.description || {};
  // Mobile typography
  const titleMobile = titleTypography.mobile || {};
  const descMobile = descriptionTypography.mobile || {};

  // Image
  const imageUrl = basicImage?.url || "https://res.cloudinary.com/dtg06lpdc/image/upload/c_crop,w_540,h_480/v1753252917/British-Cuisine_fc8jta.png";
  const imageActionType = basicImage?.actionType || "non-navigation";
  const imageLink = basicImage?.link || "";
  
  const imageAlt = imageSettings.altText || accessibility.ariaLabel || title || "Image";
  const imageTitle = imageSettings.title || title || "Image";
  
  // Check if image should be clickable
  const isImageClickable = imageActionType === "navigation" && imageLink;
  const imagePosition = imageStyling.position || "left";
  const imageMobile = imageStyling.mobile || {};
  const imageObjectFit = imageStyling.objectFit || "cover";
  const imageBorderRadius = imageStyling.borderRadius ?? "20px";
  const imageBorderRadiusMobile = imageMobile.borderRadius ?? "14px";
  const imageMaxWidth = imageStyling.maxWidth || "400px";
  const imageHeight = imageStyling.height || "380";
  const imageWidth = imageStyling.width || "440";
  const imageHeightMobile = imageMobile.height || "305";
  const imageWidthMobile = imageMobile.width || "343";

  // const responsiveImages = generateResponsiveUrls(optimizedUrl);

  // Helper to calculate aspect ratio
  function calcAspectRatio(width?: string, height?: string): string | undefined {
    const w = Number(width);
    const h = Number(height);
    if (w > 0 && h > 0) return `${w}/${h}`;
    return undefined;
  }

  // Helper to format aspect ratio from dropdown/custom
  function formatAspectRatio(value: string | undefined): string | undefined {
    if (!value) return undefined;
    return value.replace(':', '/');
  }

  // Desktop aspect ratio
  let aspectRatioDesktop: string | undefined;
  if (imageSettings.aspectRatio) {
    if (imageSettings.aspectRatio.desktop === 'custom') {
      aspectRatioDesktop = formatAspectRatio(imageSettings?.aspectRatio.custom?.desktop);
    } else if (imageSettings.aspectRatio.desktop) {
      aspectRatioDesktop = formatAspectRatio(imageSettings.aspectRatio.desktop);
    }
  }
  if (!aspectRatioDesktop) {
    aspectRatioDesktop = calcAspectRatio(imageWidth, imageHeight);
  }

  // Mobile aspect ratio
  let aspectRatioMobile: string | undefined;
  if (imageSettings.aspectRatio) {
    if (imageSettings.aspectRatio.mobile === 'custom') {
      aspectRatioMobile = formatAspectRatio(imageSettings?.aspectRatio.custom?.mobile);
    } else if (imageSettings.aspectRatio.mobile) {
      aspectRatioMobile = formatAspectRatio(imageSettings.aspectRatio.mobile);
    }
  }
  if (!aspectRatioMobile) {
    aspectRatioMobile = calcAspectRatio(imageWidthMobile, imageHeightMobile);
  }

  // Button
  const showButton = buttonSettings.showButton ?? false;
  const buttonText = basicButton.text || "Order Now";
  const buttonLink = basicButton.link || "/order";
  const buttonActionType = basicButton.actionType || "url";
  // Desktop button styles
  const buttonBg = buttonStyling.backgroundColor || "var(--button-primary-background)";
  const buttonFontColor = buttonStyling.textColor || "var(--button-primary-text)";
  const buttonFontWeight = buttonStyling.fontWeight || "600";
  const buttonFontSize = buttonStyling.fontSize || "1rem";
  const buttonHeight = buttonStyling.height || "auto";
  const buttonWidth = buttonStyling.width || "auto";
  const buttonBorderRadius = buttonStyling.borderRadius || "8px";
  const buttonPadding = buttonStyling.padding || "10px 22px";
  const buttonBoxShadow = buttonStyling.boxShadow || "none";
  const buttonHoverBackgroundColor = buttonStyling.hoverBackgroundColor || "var(--button-primary-hover-background)";
  // Mobile button styles
  const buttonMobile = buttonStyling.mobile || {};
  const buttonBgMobile = buttonMobile.backgroundColor || buttonBg;
  const buttonHoverBackgroundColorMobile = buttonMobile.hoverBackgroundColor || buttonBgMobile;
  const buttonFontColorMobile = buttonMobile.textColor || buttonFontColor;
  const buttonFontWeightMobile = buttonMobile.fontWeight || buttonFontWeight;
  const buttonFontSizeMobile = buttonMobile.fontSize || buttonFontSize;
  const buttonHeightMobile = buttonMobile.height || buttonHeight;
  const buttonWidthMobile = buttonMobile.width || buttonWidth;
  const buttonBorderRadiusMobile = buttonMobile.borderRadius || buttonBorderRadius;
  const buttonPaddingMobile = buttonMobile.padding || buttonPadding;
  const buttonBoxShadowMobile = buttonMobile.boxShadow || buttonBoxShadow;

  // Accessibility
  const ariaLabel = accessibility.ariaLabel || undefined;
  const role = accessibility.role || undefined;

  // Responsive helpers
  const isImageLeft = imagePosition === "left";

  // Dynamic classes
  const getAlignmentClass = (align: string | undefined) => {
    switch (align) {
      case "center": return "text-center";
      case "right": return "text-right";
      default: return "text-left";
    }
  };
  const getJustifyClass = (align: string | undefined) => {
    switch (align) {
      case "center": return "justify-center";
      case "right": return "justify-end";
      default: return "justify-start";
    }
  };

  // CSS custom properties for dynamic values
  const cssVariables = {
    '--border-radius': imageBorderRadius ?? "20px",
    '--border-radius-mobile': imageBorderRadiusMobile ?? "14px",
    '--max-width-mobile': imageMobile.maxWidth ?? "100%",
    '--object-fit': imageObjectFit,
    '--object-fit-mobile': imageMobile.objectFit ?? "cover",
    '--title-font-weight': titleTypography.fontWeight || "600",
    '--title-font-size': titleTypography.fontSize || "2rem",
    '--title-line-height': titleTypography.lineHeight || "120%",
    '--title-font-weight-mobile': titleMobile.fontWeight || titleTypography.fontWeight || "600",
    '--title-font-size-mobile': titleMobile.fontSize || titleTypography.fontSize || "1.5rem",
    '--title-line-height-mobile': titleMobile.lineHeight || titleTypography.lineHeight || "1.2",
    '--description-font-weight': descriptionTypography.fontWeight || "400",
    '--description-font-size': descriptionTypography.fontSize || "1rem",
    '--description-line-height': descriptionTypography.lineHeight || "120%",
    '--description-font-weight-mobile': descMobile.fontWeight || descriptionTypography.fontWeight || "400",
    '--description-font-size-mobile': descMobile.fontSize || descriptionTypography.fontSize || "14px",
    '--description-line-height-mobile': descMobile.lineHeight || descriptionTypography.lineHeight || "1.3",
    '--button-bg': buttonBg,
    '--button-color': buttonFontColor,
    '--button-font-weight': buttonFontWeight,
    '--button-font-size': buttonFontSize,
    '--button-height': buttonHeight,
    '--button-width': buttonWidth,
    '--button-border-radius': buttonBorderRadius,
    '--button-padding': buttonPadding,
    '--button-box-shadow': buttonBoxShadow,
    // Mobile button variables
    '--button-bg-mobile': buttonBgMobile,
    '--button-color-mobile': buttonFontColorMobile,
    '--button-font-weight-mobile': buttonFontWeightMobile,
    '--button-font-size-mobile': buttonFontSizeMobile,
    '--button-height-mobile': buttonHeightMobile,
    '--button-width-mobile': buttonWidthMobile,
    '--button-border-radius-mobile': buttonBorderRadiusMobile,
    '--button-padding-mobile': buttonPaddingMobile,
    '--button-box-shadow-mobile': buttonBoxShadowMobile,
    '--max-width': maxWidth,
    '--background-color': backgroundColor,
    '--desktop-padding': desktopPadding,
    '--desktop-margin': desktopMargin,
    '--mobile-padding': mobilePadding,
    '--mobile-margin': mobileMargin,
    '--image-max-width': imageMaxWidth,
    // Add gap as a variable for easier override
    '--media-content-gap-desktop': '80px',
    '--media-content-gap-mobile': '24px',
  } as React.CSSProperties;

  // Handler for openMenu action (uses modalHandler)
  const handleOpenMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    handleOpenMenuModal();
  };

  return (
    <div
      className="media-content-section container mx-auto box-border"
      style={cssVariables}
      aria-label={ariaLabel}
      role={role}
    >
      <div
        className={`media-content-container flex flex-col items-stretch w-full ${isImageLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} lg:items-center`}
        style={{ backgroundColor, maxWidth, padding: desktopPadding, margin: desktopMargin, gap: undefined }}
      >
        {/* Image Container */}
        <div className="media-image-wrapper w-full flex-shrink-0 lg:w-1/2 order-1 lg:order-none">
          {/* Desktop Image */}
          <div
            className="relative w-full h-auto desktop-image"
            style={{
              aspectRatio: aspectRatioDesktop,
              borderRadius: imageBorderRadius,
            }}
          >
            {isImageClickable ? (
              imageLink.startsWith('http://') || imageLink.startsWith('https://') ? (
                <a href={imageLink} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                  {imageUrl.includes('s3.amazonaws.com') ? (
                    <img
                      src={imageUrl}
                      alt={imageAlt}
                      title={imageTitle}
                      height={Number(imageHeight)}
                      width={Number(imageWidth)}
                      className="media-desktop-image cursor-pointer w-full h-full block"
                      style={{ objectFit: imageObjectFit, borderRadius: imageBorderRadius }}
                      onError={() => {

                      }}
                      onLoad={() => {

                      }}
                    />
                  ) : (
                    <Image
                      height={Number(imageHeight)}
                      width={Number(imageWidth)}
                      unoptimized={true}
                      src={getOptimizedImageUrl(imageUrl, false, Number(imageWidth), Number(imageHeight))}
                      alt={imageAlt}
                      loading="lazy"
                      title={imageTitle}
                      className="media-desktop-image cursor-pointer w-full h-full block"
                      style={{ objectFit: imageObjectFit, borderRadius: imageBorderRadius }}
                      onError={(e) => {
                        if (getOptimizedImageUrl(imageUrl, false) !== imageUrl) {
                          e.currentTarget.src = imageUrl;
                        }
                      }}
                    />
                  )}
                </a>
              ) : (
                <Link href={imageLink} className="block w-full h-full">
                  {imageUrl.includes('s3.amazonaws.com') ? (
                    <img
                      src={imageUrl}
                      alt={imageAlt}
                      title={imageTitle}
                      height={Number(imageHeight)}
                      width={Number(imageWidth)}
                      className="media-desktop-image cursor-pointer w-full h-full block"
                      style={{ objectFit: imageObjectFit, borderRadius: imageBorderRadius }}
                      onError={() => {

                      }}
                      onLoad={() => {

                      }}
                    />
                  ) : (
                    <Image
                      height={Number(imageHeight)}
                      width={Number(imageWidth)}
                      unoptimized={true}
                      src={getOptimizedImageUrl(imageUrl, false, Number(imageWidth), Number(imageHeight))}
                      alt={imageAlt}
                      loading="lazy"
                      title={imageTitle}
                      className="media-desktop-image cursor-pointer w-full h-full block"
                      style={{ objectFit: imageObjectFit, borderRadius: imageBorderRadius }}
                      onError={(e) => {
                        if (getOptimizedImageUrl(imageUrl, false) !== imageUrl) {
                          e.currentTarget.src = imageUrl;
                        }
                      }}
                    />
                  )}
                </Link>
              )
            ) : (
              <>
                {imageUrl.includes('s3.amazonaws.com') ? (
                  <img
                    src={imageUrl}
                    alt={imageAlt}
                    title={imageTitle}
                    height={Number(imageHeight)}
                    width={Number(imageWidth)}
                    className="media-desktop-image w-full h-full block"
                    style={{ objectFit: imageObjectFit, borderRadius: imageBorderRadius }}
                    onError={() => {

                    }}
                    onLoad={() => {

                    }}
                  />
                ) : (
                  <Image
                    height={Number(imageHeight)}
                    width={Number(imageWidth)}
                    unoptimized={true}
                    src={getOptimizedImageUrl(imageUrl, false, Number(imageWidth), Number(imageHeight))}
                    alt={imageAlt}
                    loading="lazy"
                    title={imageTitle}
                    className="media-desktop-image w-full h-full block"
                    style={{ objectFit: imageObjectFit, borderRadius: imageBorderRadius }}
                    onError={(e) => {
                      if (getOptimizedImageUrl(imageUrl, false) !== imageUrl) {
                        e.currentTarget.src = imageUrl;
                      }
                    }}
                  />
                )}
              </>
            )}
          </div>
          {/* Mobile Image */}
          <div
            className="relative w-full h-auto block lg:hidden mobile-image"
            style={{
              aspectRatio: aspectRatioMobile,
              borderRadius: imageBorderRadiusMobile,
            }}
          >
            {isImageClickable ? (
              imageLink.startsWith('http://') || imageLink.startsWith('https://') ? (
                <a href={imageLink} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                  {imageUrl.includes('s3.amazonaws.com') ? (
                    <img
                      src={imageUrl}
                      alt={imageAlt}
                      title={imageTitle}
                      height={Number(imageHeightMobile)}
                      width={Number(imageWidthMobile)}
                      className="media-mobile-image cursor-pointer w-full h-full block"
                      style={{ objectFit: imageMobile.objectFit || imageObjectFit, borderRadius: imageBorderRadiusMobile }}
                      onError={() => {

                      }}
                      onLoad={() => {

                      }}  
                    />
                  ) : (
                    <Image
                      height={Number(imageHeightMobile)}
                      width={Number(imageWidthMobile)}
                      unoptimized={true}
                      loading="lazy"
                      src={getOptimizedImageUrl(imageUrl, true, Number(imageWidthMobile), Number(imageHeightMobile))}
                      alt={imageAlt}
                      title={imageTitle}
                      className="media-mobile-image cursor-pointer w-full h-full block"
                      style={{ objectFit: imageMobile.objectFit || imageObjectFit, borderRadius: imageBorderRadiusMobile }}
                    />
                  )}
                </a>
              ) : (
                <Link href={imageLink} className="block w-full h-full">
                  {imageUrl.includes('s3.amazonaws.com') ? (
                    <img
                      src={imageUrl}
                      alt={imageAlt}
                      title={imageTitle}
                      height={Number(imageHeightMobile)}
                      width={Number(imageWidthMobile)}
                      className="media-mobile-image cursor-pointer w-full h-full block"
                      style={{ objectFit: imageMobile.objectFit || imageObjectFit, borderRadius: imageBorderRadiusMobile }}
                      onError={() => {

                      }}
                      onLoad={() => {

                      }}  
                    />
                  ) : (
                    <Image
                      height={Number(imageHeightMobile)}
                      width={Number(imageWidthMobile)}
                      unoptimized={true}
                      loading="lazy"
                      src={getOptimizedImageUrl(imageUrl, true, Number(imageWidthMobile), Number(imageHeightMobile))}
                      alt={imageAlt}
                      title={imageTitle}
                      className="media-mobile-image cursor-pointer w-full h-full block"
                      style={{ objectFit: imageMobile.objectFit || imageObjectFit, borderRadius: imageBorderRadiusMobile }}
                    />
                  )}
                </Link>
              )
            ) : (
              <>
                {imageUrl.includes('s3.amazonaws.com') ? (
                  <img
                    src={imageUrl}
                    alt={imageAlt}
                    title={imageTitle}
                    height={Number(imageHeightMobile)}
                    width={Number(imageWidthMobile)}
                    className="media-mobile-image w-full h-full block"
                    style={{ objectFit: imageMobile.objectFit || imageObjectFit, borderRadius: imageBorderRadiusMobile }}
                    onError={() => {

                    }}
                    onLoad={() => {

                    }}  
                  />
                ) : (
                  <Image
                    height={Number(imageHeightMobile)}
                    width={Number(imageWidthMobile)}
                    unoptimized={true}
                    loading="lazy"
                    src={getOptimizedImageUrl(imageUrl, true, Number(imageWidthMobile), Number(imageHeightMobile))}
                    alt={imageAlt}
                    title={imageTitle}
                    className="media-mobile-image w-full h-full block"
                    style={{ objectFit: imageMobile.objectFit || imageObjectFit, borderRadius: imageBorderRadiusMobile }}
                  />
                )}
              </>
            )}
          </div>
        </div>
        {/* Content Container */}
        <div className="media-content-wrapper gap-5 md:gap-8 flex-1 flex flex-col justify-center w-full lg:w-1/2 order-2 lg:order-none min-w-0">
          {title && (
            <h2
              className={`media-title-element  font-bold break-words ${getAlignmentClass(titleTypography.alignment)} lg:${getAlignmentClass(titleTypography.alignment).replace('text-', '')}`}
            >
              {title}
            </h2>
          )}
          {description && (
            <p
              className={`media-description-element m-0 leading-normal  break-words ${getAlignmentClass(descriptionTypography.alignment)} lg:${getAlignmentClass(descriptionTypography.alignment).replace('text-', '')}`}
            >
              {description}
            </p>
          )}
          {showButton && buttonText && (
            <div className={`media-button-wrapper  flex w-full ${getJustifyClass(descriptionTypography.alignment)} lg:${getJustifyClass(descriptionTypography.alignment)}`}>
              {buttonActionType === "url" ? (
                <a
                  href={buttonLink}
                  className="media-button-element group inline-flex items-center justify-center  rounded-md no-underline transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-semibold text-sm sm:text-base"
                  style={{
                    border: "2px solid transparent"
                  }}
                  onClick={async () => {
                    // Track Order Online button click
                    const source = pathname === "/" ? "homepage" : (pathname || "homepage");
                    await trackOrderOnlineClicked({
                      source,
                      section: "media content",
                      cta_text: buttonText,
                      restaurant_name: currentStore?.name || "",
                      city: currentStore?.address?.city || "",
                    });
                  }}
                >
                  {buttonText}
                  <AnimatedArrow direction="right" />
                </a>
              ) : (
                <button
                  type="button"
                  className="media-button-element group inline-flex items-center justify-center  rounded-md no-underline transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-semibold text-sm sm:text-base"
                  style={{
                    border: "2px solid transparent"
                  }}
                  onClick={async (e) => {
                    // Track Order Online button click
                    const source = pathname === "/" ? "homepage" : (pathname || "homepage");
                    await trackOrderOnlineClicked({
                      source,
                      section: "media content",
                      cta_text: buttonText,
                      restaurant_name: currentStore?.name || "",
                      city: currentStore?.address?.city || "",
                    });
                    handleOpenMenu(e);
                  }}
                >
                  {buttonText}
                  <AnimatedArrow direction="right" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`
        .media-content-container {
          gap: var(--media-content-gap-mobile);
          padding: var(--desktop-padding);
          margin: var(--desktop-margin);
        }
        .media-image-wrapper {
          aspect-ratio: var(--aspect-ratio-desktop);
          border-radius: var(--border-radius);
        }
        .media-image-container {
          border-radius: var(--border-radius);
        }

        .media-button-element {
          background: var(--button-bg);
          color: var(--button-color);
          font-weight: var(--button-font-weight);
          font-size: var(--button-font-size);
          height: var(--button-height);
          width: var(--button-width);
          border-radius: var(--button-border-radius);
          padding: var(--button-padding);
          transition: all 0.2s ease;
          box-shadow: var(--button-box-shadow);
          cursor: pointer;
        }

        .media-button-element:hover {
          transform: translateY(-1px);
          box-shadow: var(--button-box-shadow);
          background: ${buttonHoverBackgroundColor};
        }

        .media-title-element {
          font-weight: var(--title-font-weight) !important;
          font-size: var(--title-font-size);
          line-height: var(--title-line-height);
        }
        .media-description-element {
          font-weight: var(--description-font-weight) !important;
          font-size: var(--description-font-size) !important;
          line-height: var(--description-line-height) !important;
        }
        .media-desktop-image {
          object-fit: var(--object-fit) !important;
        }
        @media (min-width: 768px) {
          .media-content-container {
            gap: var(--media-content-gap-desktop);
            padding: var(--desktop-padding);
            margin: var(--desktop-margin);
          }
          .media-description-element {
            font-weight: var(--description-font-weight);
            font-size: var(--description-font-size);
            line-height: var(--description-line-height);
          }
          .mobile-image {
            display: none !important;
          }
          .media-desktop-image {
            object-fit: var(--object-fit) !important;
          }
        }
    
         @media only screen and (max-width: 768px) {

          .media-content-container {
            padding: var(--mobile-padding) !important;
            margin: var(--mobile-margin) !important;
          }
          .media-image-container {
          border-radius: var(--border-radius-mobile) !important;
          }

          .desktop-image {
            display: none !important;
          }

          .media-title-element {
            font-weight: var(--title-font-weight-mobile) !important;
            font-size: var(--title-font-size-mobile) !important;
            line-height: var(--title-line-height-mobile) !important;
          }
          .media-button-element {
            background: var(--button-bg-mobile) !important;
            color: var(--button-color-mobile) !important;
            font-weight: var(--button-font-weight-mobile) !important;
            font-size: var(--button-font-size-mobile) !important;
            height: var(--button-height-mobile) !important;
            width: var(--button-width-mobile) !important;
            border-radius: var(--button-border-radius-mobile) !important;
            padding: var(--button-padding-mobile) !important;
            box-shadow: var(--button-box-shadow-mobile) !important;
          }
          .media-button-element:hover {
            background: ${buttonHoverBackgroundColorMobile} !important;
          }
          .media-description-element {
            font-weight: var(--description-font-weight-mobile) !important;
            font-size: var(--description-font-size-mobile) !important;
            line-height: var(--description-line-height-mobile) !important;
          }
        }
        .media-image-wrapper {
          border-radius: var(--border-radius-mobile);
          max-width: var(--max-width-mobile) ;
          object-fit: var(--object-fit-mobile);
          aspect-ratio: var(--aspect-ratio-mobile);
        }
            .media-mobile-image {
          border-radius: var(--border-radius-mobile) !important;
          max-width: var(--max-width-mobile) !important;
          object-fit: var(--object-fit-mobile) !important;
        }
      }
      
      `}</style>
    </div>
  );
}; 