"use client";

import React, { useRef } from "react";
import { useStickyButton } from "../../../hooks/useStickyButton";
import AnimatedArrow from "@components/icons/AnimatedArrow";
import useMenuModal from "@hooks/useMenuModal";
import useAnalytics from "@hooks/useAnalytics";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import { usePathname } from "next/navigation";
import { useIsAppWebView } from "@hooks/useIsAppWebView";

interface StickyButtonProps {
  basicContent?: {
    text?: string;
    link?: string;
    target?: string;
    rel?: string;
  };
  styling?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: string;
    fontWeight?: string;
    padding?: string;
    borderRadius?: string;
    boxShadow?: string;
    zIndex?: string;
  };
  behavior?: {
    showWhenBannerHidden?: boolean;
    scrollThreshold?: number;
    animationDuration?: number;
    showOnMobile?: boolean;
  };
}

// Accepts both Puck and direct props
export const StickyButton = (props: any) => {
  const { handleOpenMenuModal } = useMenuModal();
  const { trackOrderOnlineClicked } = useAnalytics();
  const currentStore = useSelector((state: RootState) => state.store.currentStore);
  const pathname = usePathname();
  const isAppWebView = useIsAppWebView();
  // Puck passes props as props.props, direct usage passes as props
  const { basicContent = {}, styling = {}, behavior = {} } = props.props ? props.props : props;

  // Destructure props
  const buttonText = basicContent.text || "Order Online";
  const buttonLink = basicContent.link || "#";
  const target = basicContent.target || "_self";
  const rel = basicContent.rel || "";

  // Styling props
  const backgroundColor = styling.backgroundColor || "var(--button-primary-background)";
  const hoverBackgroundColor = styling.hoverBackgroundColor || "var(--button-primary-hover-background)";
  const textColor = styling.textColor || "#000000";
  const fontSize = styling.fontSize || "16px";
  const fontWeight = styling.fontWeight || "600";
  const padding = styling.padding || "12px 24px";
  const borderRadius = styling.borderRadius || "8px";
  const boxShadow = styling.boxShadow || "0 4px 12px rgba(0, 0, 0, 0.15)";
  const zIndex = styling.zIndex || "1000";
  const animationDuration = behavior.animationDuration || 300;

  // Behavior props
  const showWhenBannerHidden = behavior.showWhenBannerHidden ?? true;
  const scrollThreshold = behavior.scrollThreshold || 100;
  const showOnMobile = behavior.showOnMobile ?? true;

  // Use custom hook for sticky button logic
  const { isVisible } = useStickyButton({
    showWhenBannerHidden,
    scrollThreshold,
    showOnMobile,
  });

  const stickyButtonRef = useRef<HTMLDivElement>(null);

  if (isAppWebView) {
    return <></>;
  }

  return (
    <>
      <div
        ref={stickyButtonRef}
        className="sticky-button-container"
        style={{
          ...(isVisible ? {} : { display: 'none' }),
          position: "fixed",
          bottom: "0px",
          right: "0px",
          left: "50%",
          overflow: "hidden",
          transform: "translateX(-50%)",
          width: "100%",
          background: "var(--button-primary-background)",
          borderRadius: "0px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          padding: "10px 16px",
          zIndex:"1000",
          backgroundColor: "var(--cards-containers)",
        }}
      >
        <button
          type="button"
          className="sticky-button"
          onClick={async (e) => {
            e.preventDefault();
            // Track sticky button click
            const source = pathname === "/" ? "homepage" : (pathname || "homepage");
            await trackOrderOnlineClicked({
              source,
              section: "footer",
              cta_text: buttonText,
              restaurant_name: currentStore?.name || "",
              city: currentStore?.address?.city || "",
            });
            handleOpenMenuModal();
          }}
        >
          {buttonText}
          <AnimatedArrow className="ml-2" />
        </button>
      </div>
      <style>{`
        .sticky-button-container {
          display: flex;
          justify-content: center;
          animation: slideUp var(--sticky-anim) ease-out;
          transition: all var(--sticky-anim) ease-in-out;
        }
        .sticky-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-color: var(--button-primary-background);
          padding: 13px 16px;
          border-radius: 8px;
          color: var(--button-primary-text) !important;
          font-size: var(--heading-h5);
          font-weight: var(--font-bold);
          text-decoration: none;
          cursor: pointer;
         
        }
        .sticky-button:hover, .sticky-button:focus {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
          background: ${hoverBackgroundColor};
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        /* Hide sticky button on desktop/tablet - only show on mobile */
        @media (min-width: 769px) {
          .sticky-button-container {
            display: none !important;
          }
        }
        
        @media (max-width: 768px) {
          .sticky-button-container {
            bottom: 0px;
            transform: none;
            border-radius: 0px !important;
          }
          .sticky-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}; 