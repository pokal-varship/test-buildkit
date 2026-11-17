'use client';
import React, { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useWishlist } from '@hooks/useWishlist';
import { useProductLikeCount } from '@hooks/useProductLikeCount';
import { useAuth } from '@hooks/useAuth';
import { open_dialog } from '@lib/modalHandler';
import { useToast } from '@components/toast/Toast';
import useAnalytics from '@hooks/useAnalytics';

const WishlistHeartIcon = dynamic(() => import('@components/icons/WishlistHeartIcon'), { ssr: false });
const WishlistHeartOutlineIcon = dynamic(() => import('@components/icons/WishlistHeartOutlineIcon'), { ssr: false });


interface WishlistButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    totalLikes?: number;
  };
  className?: string;
  classNameWhenCountShown?: string;
  showCount?: boolean;
  iconColor?: string;
  textColor?: string;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  product,
  className = '',
  classNameWhenCountShown = '',
  showCount = true,
  iconColor = 'var(--primary-text)',
  textColor = 'var(--primary-text)',
}) => {
  const { toggleProductLike } = useWishlist();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const { trackSignIn, trackProductWishlisted } = useAnalytics();
  // Use the hook for consistent like counts - this is the single source of truth
  const { totalLikeCount, isInWishlist } = useProductLikeCount({
    productId: product.id,
    typesenseLikeCount: Number(product.totalLikes) || 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleToggleWishlist = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Check if user is authenticated, if not open login modal
    if (!isAuthenticated) {
      const source = window.location.pathname === "/" ? "homepage" : (window.location.pathname || "homepage");
      trackSignIn(source, "wishlist");
      open_dialog("login", {
        open: true,
        propsData: {
          onSuccess: () => {
            // After successful login, automatically call the wishlist API
            toast('success', 'Login successful! Adding to wishlist...');
            toggleProductLike(product);
          }
        },
        type: "login",
        handlerDialog: () => { },
        handleClose: () => { },
        anchor: 'bottom',
        onlyDialog: false,
        sxStyle: {
          '& .MuiDialogContent-root': {
              padding: '20px 16px',
              backgroundColor: 'var(--tertiary-background)',
          },
      },
      });
      return;
    }
    // Prevent rapid multiple clicks (debounce)
    const now = Date.now();
    if (now - lastClickTime < 500) { // 500ms debounce
      return;
    }
    setLastClickTime(now);

    if (isLoading) return; // Prevent multiple clicks while loading

    setIsLoading(true);
    try {
      // Analytics: Wishlist / Favourite Clicked
      // Fire before toggle: currently wishlisted → remove (0), otherwise add (1)
      const source =
        typeof window !== "undefined" && window.location.pathname.startsWith("/products")
          ? "product_detail"
          : "category_listing";
      await trackProductWishlisted(
        product.id,
        product.name,
        source,
        isInWishlist ? 0 : 1,
      );

      // No need to manage local state - the hook will handle updates
      await toggleProductLike(product);
    } catch {
      // Error handling is done by the hook and Redux state
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isLoading, toggleProductLike, product, lastClickTime, toast, trackProductWishlisted, isInWishlist]);

  // Memoize button props to prevent unnecessary re-renders
  const buttonProps = useMemo(() => {
    const hasCount = showCount && totalLikeCount >= 1;
    return {
      onClick: handleToggleWishlist,
      disabled: isLoading,
      'aria-label': isInWishlist ? 'Remove from wishlist' : 'Add to wishlist',
      className: `
        flex items-center gap-2 rounded-full border border-[var(--rating-border-primary)] bg-[var(--primary-tab-background)] md:bg-[var(--primary-background)] justify-center 
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
        ${hasCount ? classNameWhenCountShown : ''}
      `,
    };
  }, [handleToggleWishlist, isLoading, isInWishlist, className, classNameWhenCountShown, showCount, totalLikeCount]);

  return (
    <button
      {...buttonProps}
    >
      {showCount && totalLikeCount > 0 && <span style={{ color: textColor }}>{totalLikeCount}</span>}
      {isInWishlist ? (
        <WishlistHeartIcon
          width={16}
          height={16}
          color={iconColor}
          className={isLoading ? 'animate-pulse' : ''}
        />
      ) : (
        <WishlistHeartOutlineIcon
          width={16}
          height={16}
          color={iconColor}
          className={isLoading ? 'animate-pulse' : ''}
        />
      )}
    </button>
  );
};

export default WishlistButton;
