import { useEffect, useState, useRef, useCallback } from 'react';

interface UseStickyButtonOptions {
  showWhenBannerHidden?: boolean;
  scrollThreshold?: number;
  showOnMobile?: boolean;
}

export const useStickyButton = (options: UseStickyButtonOptions = {}) => {
  const {
    showWhenBannerHidden = true,
    scrollThreshold = 100,
    showOnMobile = true,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const bannerRef = useRef<HTMLElement | null>(null);

  // Find banner element
  const findBannerElement = useCallback(() => {
    const heroSection = document.querySelector('.hero-section');
    const mainBanner = document.querySelector('[data-puck-component="MainBanner"]');
    return heroSection || mainBanner;
  }, []);

  // Check mobile state
  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  // Handle scroll logic
  const handleScroll = useCallback(() => {
    if (!bannerRef.current) {
      bannerRef.current = findBannerElement() as HTMLElement;
      if (!bannerRef.current) return;
    }

    const bannerRect = bannerRef.current.getBoundingClientRect();
    const bannerBottom = bannerRect.bottom;
    const windowHeight = window.innerHeight;

    // Check if banner is visible in viewport
    const bannerVisible = bannerBottom > 0 && bannerRect.top < windowHeight;
    setIsBannerVisible(bannerVisible);

    // Show sticky button based on conditions
    let shouldShow = false;

    if (showWhenBannerHidden) {
      // Show when banner is not visible
      shouldShow = !bannerVisible;
    } else {
      // Show when scrolled past threshold
      shouldShow = window.scrollY > scrollThreshold;
    }

    // Check mobile visibility
    if (!showOnMobile && isMobile) {
      shouldShow = false;
    }

    setIsVisible(shouldShow);
  }, [showWhenBannerHidden, scrollThreshold, showOnMobile, isMobile, findBannerElement]);

  useEffect(() => {
    // Initial checks
    checkMobile();
    handleScroll();

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    window.addEventListener('resize', checkMobile, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, [handleScroll, checkMobile]);

  return {
    isVisible,
    isBannerVisible,
    bannerRef,
  };
}; 