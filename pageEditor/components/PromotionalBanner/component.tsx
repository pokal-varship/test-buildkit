"use client";

import React from "react";
import { promotionalBannerSectionProps } from "./field";
import AnimatedArrow from "@components/icons/AnimatedArrow";
import useMenuModal from "@hooks/useMenuModal";
import useAnalytics from "@hooks/useAnalytics";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import { usePathname } from "next/navigation";

export const PromotionalBannerSection = (props: promotionalBannerSectionProps & Record<string, unknown>) => {
  const { handleOpenMenuModal } = useMenuModal();
  const { trackOrderOnlineClicked } = useAnalytics();
  const currentStore = useSelector((state: RootState) => state.store.currentStore);
  const pathname = usePathname();
  const {
    basicContent = {
      title: "Ready to Experience The Golden Spoon?",
      subtitle: "Order now for an unforgettable taste of British cuisine, delivered fresh to your door.",
      button: {
        actionType: "url",
        text: "Order Online Now",
        link: "/menu"
      }
    },
    styling = {},
    advanceSettings = {
      accessibility: {
        ariaLabel: "Promotional Banner",
        role: "banner"
      },
      buttonSettings: {
        showButton: true,
        showIcon: true,
        target: "_blank",
        rel: "noopener noreferrer"
      }
    }
  } = props;

  // Layout, Spacing, Typography, Button
  const layout = styling.layout || {};
  const spacing = styling.spacing || {};
  const typography = styling.typography || {};
  const button = styling.button || {};

  // Mobile overrides
  const layoutMobile = layout.mobile || {};
  const spacingMobile = spacing.mobile || {};
  const titleMobile = typography.title?.mobile || {};
  const subtitleMobile = typography.subtitle?.mobile || {};
  const buttonMobile = button.mobile || {};

  const { title, subtitle, button: buttonContent } = basicContent;
  const { accessibility, buttonSettings } = advanceSettings;

  return (
    <section 
      className="promotionalBannerSection" 
      aria-label={accessibility?.ariaLabel}
      role={accessibility?.role}
    >
      <div className="promotionalBannerContainer">
        <div className="promotionalBannerContent">
          <h2 className="promotionalBannerTitle">{title}</h2>
          <p className="promotionalBannerSubtitle">{subtitle}</p>
          
          {buttonSettings?.showButton && buttonContent?.text && (
            <div className="promotionalBannerButtonWrapper">
              {buttonContent?.actionType === "openPopup" ? (
                <button
                  type="button"
                  className="promotionalBannerButton group inline-flex items-center justify-center transition-all duration-300 mt-1"
                  onClick={async (e) => {
                    e.preventDefault();
                    // Track Order Online button click
                    const source = pathname === "/" ? "homepage" : (pathname || "homepage");
                    await trackOrderOnlineClicked({
                      source,
                      section: "about us promotional banner",
                      cta_text: buttonContent?.text || "",
                      restaurant_name: currentStore?.name || "",
                      city: currentStore?.address?.city || "",
                    });
                    handleOpenMenuModal();
                  }}
                >
                  <span className="buttonText">{buttonContent.text}</span>
                  {buttonSettings?.showIcon && (
                    <AnimatedArrow 
                      direction="right" 
                      color={button.textColor || "#ffffff"}
                    />
                  )}
                </button>
              ) : (
                <a
                  href={buttonContent.link || "/menu"}
                  className="promotionalBannerButton group inline-flex items-center justify-center transition-all duration-300 mt-1"
                  onClick={async () => {
                    // Track Order Online button click
                    const source = pathname === "/" ? "homepage" : (pathname || "homepage");
                    await trackOrderOnlineClicked({
                      source,
                      section: "about us promotional banner",
                      cta_text: buttonContent?.text || "",
                      restaurant_name: currentStore?.name || "",
                      city: currentStore?.address?.city || "",
                    });
                  }}
                >
                  <span className="buttonText">{buttonContent.text}</span>
                  {buttonSettings?.showIcon && (
                    <AnimatedArrow 
                      direction="right" 
                      color={button.textColor || "#ffffff"}
                    />
                  )}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .promotionalBannerSection {
          background-color: ${layout.backgroundColor || "var(--button-primary-background)"};
          padding: ${spacing.padding || "24px 0"};
          margin: ${spacing.margin || "0"};
          width: 100%;
        }
        
        .promotionalBannerContainer {
          max-width: ${layout.maxWidth || "1200px"};
          margin: 0 auto;
          padding: 48px 24px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .promotionalBannerContent {
          text-align: center;
          max-width: 800px;
          width: 100%;
        }
        
        .promotionalBannerTitle {
          font-size: ${typography.title?.fontSize || "40px"};
          font-weight: ${typography.title?.fontWeight || "600"};
          color: ${typography.title?.color || "var(--primary-text)"};
          line-height: ${typography.title?.lineHeight || "1.2"};
          text-align: ${typography.title?.alignment === "left" ? "left" : typography.title?.alignment === "right" ? "right" : "center"};
          margin: 0 0 24px 0;
        }
        
        .promotionalBannerSubtitle {
          font-size: ${typography.subtitle?.fontSize || "18px"};
          font-weight: ${typography.subtitle?.fontWeight || "500"};
          color: ${typography.subtitle?.color || "var(--primary-text)"};
          line-height: ${typography.subtitle?.lineHeight || "1.3"};
          text-align: ${typography.subtitle?.alignment === "left" ? "left" : typography.subtitle?.alignment === "right" ? "right" : "center"};
          margin: 0 0 32px 0;
        }
        
        .promotionalBannerButton {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: ${button.backgroundColor || "var(--button-secondary-background)"};
          color: ${button.textColor || "var(--button-secondary-text)"};
          font-size: ${button.fontSize || "16px"};
          font-weight: ${button.fontWeight || "600"};
          height: ${button.height || "48px"};
          width: ${button.width || "auto"};
          border-radius: ${button.borderRadius || "8px"};
          padding: ${button.padding || "10px 22px"};
          text-decoration: none;
          border: 1px solid ${button.borderColor || "var(--button-secondary-border-color)"};
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .promotionalBannerButton:hover {
          transform: translateY(-1px);
          box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .buttonText {
          white-space: nowrap;
        }
        
        .buttonIcon {
          flex-shrink: 0;
        }
        
        @media (max-width: 768px) {
          .promotionalBannerSection {
            background-color: ${layoutMobile.backgroundColor || layout.backgroundColor || "var(--button-primary-background)"} !important;
            padding: ${spacingMobile.padding || "20px 0"} !important;
            margin: ${spacingMobile.margin || "0"} !important;
          }
          
          .promotionalBannerContainer {
            max-width: ${layoutMobile.maxWidth || "100%"} !important;
            padding: 32px 0px !important;
          }
          
          .promotionalBannerContent {
            text-align: center;
            max-width: 100%;
            width: 100%;
          }
          
          .promotionalBannerTitle {
            font-size: ${titleMobile.fontSize || "32px"} !important;
            font-weight: ${titleMobile.fontWeight || "600"} !important;
            color: ${titleMobile.color || typography.title?.color || "var(--primary-text)"} !important;
            line-height: ${titleMobile.lineHeight || "1.2"} !important;
            text-align: ${titleMobile.alignment === "left" ? "left" : titleMobile.alignment === "right" ? "right" : "center"} !important;
            margin: 0 0 20px 0 !important;
          }
          
          .promotionalBannerSubtitle {
            font-size: ${subtitleMobile.fontSize || "16px"} !important;
            font-weight: ${subtitleMobile.fontWeight || "500"} !important;
            color: ${subtitleMobile.color || typography.subtitle?.color || "var(--primary-text)"} !important;
            line-height: ${subtitleMobile.lineHeight || "1.3"} !important;
            text-align: ${subtitleMobile.alignment === "left" ? "left" : subtitleMobile.alignment === "right" ? "right" : "center"} !important;
            margin: 0 !important;
          }
          
          .promotionalBannerButton {
            display: none !important;
            background-color: ${buttonMobile.backgroundColor || button.backgroundColor || "var(--button-secondary-background)"} !important;
            color: ${buttonMobile.textColor || button.textColor || "var(--button-secondary-text)"} !important;
            font-size: ${buttonMobile.fontSize || button.fontSize || "16px"} !important;
            font-weight: ${buttonMobile.fontWeight || button.fontWeight || "600"} !important;
            height: ${buttonMobile.height || "44px"} !important;
            width: ${buttonMobile.width || button.width || "auto"} !important;
            border-radius: ${buttonMobile.borderRadius || button.borderRadius || "8px"} !important;
            padding: ${buttonMobile.padding || button.padding || "10px 22px"} !important;
            border-color: ${buttonMobile.borderColor || button.borderColor || "var(--button-secondary-border-color)"} !important;
          }
        }
      `}</style>
    </section>
  );
};

export default PromotionalBannerSection;
