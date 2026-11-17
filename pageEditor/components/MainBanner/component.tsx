"use client";

import React, { useState } from "react";
import { MainBannerProps } from "./fields";
import { useImagePreload } from "utils/image-optimization";
import Link from "next/link";
import useIsMobile from "@hooks/useIsMobile";
import AnimatedArrow from "@components/icons/AnimatedArrow";
import useMenuModal from "@hooks/useMenuModal";
import Image from "next/image";
import useAnalytics from "@hooks/useAnalytics";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import { usePathname } from "next/navigation";

export const MainBanner = (props: MainBannerProps) => {
  const { handleOpenMenuModal } = useMenuModal();
  const { trackOrderOnlineClicked } = useAnalytics();
  const currentStore = useSelector((state: RootState) => state.store.currentStore);
  const pathname = usePathname();
  // State to track image loading errors
  const [fallbackError, setFallbackError] = useState(false);

  // Destructure grouped props
  const {
    basicContent = {},
    styling = {},
    advanceSettings = {},
  } = props;

  // Destructure advanced settings
  const imageSettings = advanceSettings.imageSettings || {};
  const buttonSettings = advanceSettings.buttonSettings || {};
  const accessibilitySettings = advanceSettings.accessibility || {};

  // Map props to variables
  const url = basicContent.image?.url || "https://res.cloudinary.com/dtg06lpdc/image/upload/c_crop,w_1320,h_592/v1753251340/Main-Banner_drhuil.webp?format=webp";
  // const mobileUrl = basicContent.image?.mobileUrl || "https://res.cloudinary.com/dtg06lpdc/image/upload/v1753944716/hero-banner-mobile_min3un.webp";
  const altText = imageSettings?.altText || "Hero background image";
  const ariaLabel = accessibilitySettings?.ariaLabel || imageSettings?.ariaLabel || "Banner section";
  const title = basicContent?.title || "Experience Authentic British Cuisine — Right in the Heart of Iconic London";
  const description = basicContent?.description || "";
  const textPosition = styling?.layout?.contentAlignment || "left";
  const textColor = styling?.typography?.textColor || "#ffffff";
  const fontWeight = styling?.typography?.fontWeight || "600";
  const fontSize = styling?.typography?.fontSize || "56px";
  const lineHeight = styling?.typography?.lineHeight || "1.2";
  const buttonText = basicContent?.button?.text || "Order Online";
  const buttonLink = basicContent?.button?.link || "#";
  const buttonBackgroundColor = styling?.button?.backgroundColor || "var(--button-primary-background)";
  const buttonTextColor = styling?.button?.textColor || "var(--button-primary-text)";
  const buttonHoverBackgroundColor = styling?.button?.hoverBackgroundColor || "var(--button-primary-hover-background)";
  const mobileButtonHoverBackgroundColor = styling?.button?.mobile?.hoverBackgroundColor || "var(--button-primary-hover-background)";
  const buttonFontWeight = styling.button?.fontWeight || "600";
  const buttonFontSize = styling.button?.fontSize || "14px";
  const buttonHeight = styling.button?.height || "48px";
  const buttonWidth = styling.button?.width || "auto";
  const buttonBorderRadius = styling.button?.borderRadius || "8px";
  const buttonPadding = styling.button?.padding || "10px 24px";
  const showButton = buttonSettings?.showButton || false;
  const buttonBoxShadow = styling?.button?.boxShadow || undefined;
  const borderRadius = styling?.image?.borderRadius || "12px";
  const maxWidth = styling?.image?.maxWidth || styling?.layout?.maxWidth || "100%";
  const paddingWeb = styling?.spacing?.paddingWeb || "40px 30px";
  const paddingMobile = styling?.spacing?.paddingMobile || "24px 16px";
  const minHeight = styling.layout?.minHeight || 500;
  const mobileHeight = styling.layout?.mobileHeight || 400;
  const overlayColor = styling?.image?.overlayColor || "#000000";
  const overlayOpacity = styling?.image?.overlayOpacity !== undefined ? styling?.image?.overlayOpacity : 0.3;
  const showOverlay = styling?.image?.overlayOpacity !== undefined;
  const mobileBorderRadius = styling?.image?.mobile?.borderRadius || "14px";
  const mobileMaxWidth = styling?.image?.mobile?.maxWidth || "100%";
  const mobileObjectFit = styling?.image?.mobile?.objectFit || "cover";
  const mobileBackgroundPosition = styling?.image?.mobile?.backgroundPosition || "center";
  const descriptionFontSize = styling?.typography?.description?.fontSize || "16px";
  const descriptionFontWeight = styling?.typography?.description?.fontWeight || "400";
  const descriptionColor = styling?.typography?.description?.color || "#ffffff";
  const descriptionAlignment = styling?.typography?.description?.alignment || "left";
  const descriptionLineHeight = styling?.typography?.description?.lineHeight || "1.3";

  const descriptionMobileSettings = styling?.typography?.description?.mobile || {};
  const mobileDescriptionFontSize = descriptionMobileSettings.fontSize || descriptionFontSize;
  const mobileDescriptionFontWeight = descriptionMobileSettings.fontWeight || descriptionFontWeight;
  const mobileDescriptionColor = descriptionMobileSettings.color || descriptionColor;
  const mobileDescriptionAlignment = descriptionMobileSettings.alignment || descriptionAlignment;
  const mobileDescriptionLineHeight = descriptionMobileSettings.lineHeight || descriptionLineHeight;
  // Aspect ratio logic
  const aspectRatio = imageSettings.aspectRatio || {};
  const customAspectRatio = aspectRatio.customAspectRatio || {};
  const isMobile = useIsMobile();
  
  // Preload the image
  useImagePreload(url);

  // Helper to convert '16:9' or '540/480' to '16 / 9' or '540 / 480' for CSS
  const getAspectRatioValue = (ratio: string | undefined) => {
    if (!ratio) return undefined;
    if (ratio.includes(':')) {
      const [w, h] = ratio.split(':').map(Number);
      if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
        return `${w} / ${h}`;
      }
    } else if (ratio.includes('/')) {
      const [w, h] = ratio.split('/').map(Number);
      if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
        return `${w} / ${h}`;
      }
    }
    return undefined;
  };

  // Desktop aspect ratio
  const desktopAspectRatio =
    aspectRatio.desktop === 'custom'
      ? getAspectRatioValue(customAspectRatio.desktop)
      : getAspectRatioValue(aspectRatio.desktop);

  // Mobile aspect ratio
  const mobileAspectRatio =
    aspectRatio.mobile === 'custom'
      ? getAspectRatioValue(customAspectRatio.mobile)
      : getAspectRatioValue(aspectRatio.mobile);

  // if (!url) return <div className="hero-placeholder p-8 text-center bg-gray-100 rounded-lg">Please add an image URL to display the hero section</div>;

  // Text position classes
  const textPositionClasses: Record<string, string> = {
    left: "justify-start text-left",
    center: "justify-center text-center",
    right: "justify-end text-right",
  };

  // Mobile button settings
  const buttonMobileSettings = styling.button?.mobile || {};
  const mobileButtonBackgroundColor = buttonMobileSettings.backgroundColor || buttonBackgroundColor;
  const mobileButtonTextColor = buttonMobileSettings.textColor || buttonTextColor;
  const mobileButtonFontWeight = buttonMobileSettings.fontWeight || buttonFontWeight;
  const mobileButtonFontSize = buttonMobileSettings.fontSize || buttonFontSize;
  const mobileButtonHeight = buttonMobileSettings.height || buttonHeight;
  const mobileButtonWidth = buttonMobileSettings.width || buttonWidth;
  const mobileButtonBorderRadius = buttonMobileSettings.borderRadius || buttonBorderRadius;
  const mobileButtonPadding = buttonMobileSettings.padding || buttonPadding;
  const mobileButtonBoxShadow = buttonMobileSettings.boxShadow || buttonBoxShadow;

  // Mobile text settings
  const textMobileSettings = styling.typography?.mobile || {};
  const mobileTextColor = textColor;
  const mobileFontWeight = textMobileSettings.fontWeight || fontWeight;
  const mobileFontSize = textMobileSettings.fontSize || fontSize;
  const mobileLineHeight = textMobileSettings.lineHeight || lineHeight;

     return (
       <>
         <div className="hero-section w-full max-w-full mx-auto" aria-label={ariaLabel} role={accessibilitySettings.role || undefined}>
        <div 
          tabIndex={0} 
          title={altText}
          className={`hero-container cursor-pointer relative overflow-hidden flex items-center ${textPositionClasses[textPosition || "left"]} rounded-xl`}
          style={{
            width: maxWidth,
            borderRadius: borderRadius,
            margin: "0 auto",
            ...(desktopAspectRatio
              ? { aspectRatio: desktopAspectRatio }
              : { minHeight: minHeight ? `${minHeight}px` : undefined }
            ),
          }}
        >
                     {/* Image - Force regular img tag for S3 URLs to avoid Next.js 403 errors */}
           {url.includes('s3.amazonaws.com') ? (
             <>
               <img
                 src={url}
                 alt={altText}
                 title={altText}
                 className="absolute inset-0 w-full h-full object-cover"
                 onError={() => setFallbackError(true)}
                 onLoad={() => {

                 }}
               />
             </>
           ) : fallbackError ? (
             <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center">
               <div className="text-gray-500 text-center">
                 <div className="text-2xl mb-2">📷</div>
                 <div className="text-sm">Image unavailable</div>
               </div>
             </div>
           ) : (
             <>
               <Image
                 src={url}
                 alt={altText}
                 title={altText}
                 className="absolute inset-0 w-full h-full object-cover"
                 priority={true}
                 height={592}
                 width={1320}
                 unoptimized={true}
                 quality={85}
                 placeholder="blur"
                 blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                 onError={() => {
                   setFallbackError(true);
                 }}
               />
             </>
           )}

          {/* Overlay */}
          {showOverlay && (
            <div 
              className="hero-overlay absolute inset-0 rounded-xl"
              style={{
                backgroundColor: overlayColor,
                opacity: overlayOpacity,
              }}
            ></div>
          )}

          {/* Content */}
          <div className="hero-content absolute bottom-[16px] left-[16px] right-[16px] md:bottom-[36px] md:left-[36px] md:right-[50px] text-white">
            <div className="max-w-xl md:max-w-2xl xl:max-w-4xl">
              {/* Title */}
              {title && (
                <h1 className={`hero-title drop-shadow-lg mr-4 mb-3 md:mr-0  ${description ? ' md:mb-4' : 'md:mb-6'}`}>
                  {title}
                </h1>
              )}
              {description && (
                <p className={`hero-description drop-shadow-lg mr-4 md:mr-0  ${showButton && buttonText ? 'mb-3' : 'mb-0'}`}>
                  {description}
                </p>
              )}

              {/* Button */}
              {showButton && buttonText && (
                basicContent?.button?.actionType === "openMenu" ? (
                  <button
                    type="button"
                    className="hero-button group inline-flex items-center justify-center transition-all duration-300 mt-1"
                    onClick={async (e) => {
                      e.preventDefault();
                      // Track hero CTA click
                      const source = pathname === "/" ? "homepage" : (pathname || "homepage");
                      await trackOrderOnlineClicked({
                        source,
                        section: "hero",
                        cta_text: buttonText,
                        restaurant_name: currentStore?.name || "",
                        city: currentStore?.address?.city || "",
                      });
                      handleOpenMenuModal();
                    }}
                  >
                    {buttonText}
                    <AnimatedArrow 
                      direction="right" 
                      color={isMobile ? mobileButtonTextColor : buttonTextColor} 
                    />
                  </button>
                ) : (
                  <Link 
                    href={buttonLink || "#"}
                    className="hero-button group inline-flex items-center justify-center transition-all duration-300 mt-1"
                    target={buttonSettings?.target}
                    rel={buttonSettings?.rel}
                    onClick={async () => {
                      // Track hero CTA click for link buttons too
                      const source = pathname === "/" ? "homepage" : (pathname || "homepage");
                      await trackOrderOnlineClicked({
                        source,
                        section: "hero",
                        cta_text: buttonText,
                        restaurant_name: currentStore?.name || "",
                        city: currentStore?.address?.city || "",
                      });
                    }}
                  >
                    {buttonText}
                    <AnimatedArrow 
                      direction="right" 
                      color={isMobile ? mobileButtonTextColor : buttonTextColor} 
                    />
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .hero-section {
          padding: ${paddingWeb};
        }
        .hero-title {
          font-size: ${fontSize};
          font-weight: ${fontWeight};
          color: ${textColor};
          text-align: ${textPosition};
          line-height: ${lineHeight} !important;
        }
        .hero-button {
          background-color: ${buttonBackgroundColor};
          color: ${buttonTextColor};
          font-size: ${buttonFontSize};
          font-weight: ${buttonFontWeight};
          height: ${buttonHeight};
          width: ${buttonWidth};
          border-radius: ${buttonBorderRadius};
          padding: ${buttonPadding};
          box-shadow: ${buttonBoxShadow || 'none'};
          border: none;
          text-decoration: none;
          cursor: pointer;
        }
        
        .hero-button:hover {
          background: ${buttonHoverBackgroundColor};
        }
        .hero-description {
          font-size: ${descriptionFontSize};
          font-weight: ${descriptionFontWeight};
          color: ${descriptionColor};
          text-align: ${descriptionAlignment};
          line-height: ${descriptionLineHeight};
        }
        @media only screen and (max-width: 768px) {
          .hero-title {
            font-size: ${mobileFontSize || "32px"} !important;
            font-weight: ${mobileFontWeight || "700"} !important;
            color: ${mobileTextColor || "#ffffff"} !important;
            line-height: ${mobileLineHeight || "1.2"} !important;
          }
          .hero-button {
            background-color: ${mobileButtonBackgroundColor} !important;
            color: ${mobileButtonTextColor} !important;
            font-size: ${mobileButtonFontSize} !important;
            font-weight: ${mobileButtonFontWeight} !important;
            height: ${mobileButtonHeight} !important;
            width: ${mobileButtonWidth} !important;
            border-radius: ${mobileButtonBorderRadius} !important;
            padding: ${mobileButtonPadding} !important;
            box-shadow: ${mobileButtonBoxShadow || 'none'} !important;
          }
          .hero-button:hover {
            background: ${mobileButtonHoverBackgroundColor} !important;
          }
          .hero-section {
            padding: ${paddingMobile} !important;
          }
          .hero-container {
            border-radius: ${mobileBorderRadius} !important;
            max-width: ${mobileMaxWidth} !important;
            object-fit: ${mobileObjectFit} !important;
            background-position: ${mobileBackgroundPosition} !important;
            ${mobileAspectRatio ? `aspect-ratio: ${mobileAspectRatio} !important;` : `min-height: ${mobileHeight}px !important;`}
          }
           .hero-description {
            font-size: ${mobileDescriptionFontSize} !important;
            font-weight: ${mobileDescriptionFontWeight} !important;
            color: ${mobileDescriptionColor} !important;
            text-align: ${mobileDescriptionAlignment} !important;
            line-height: ${mobileDescriptionLineHeight} !important;
          }
        }
      `}</style>
       </>
     );
   }; 