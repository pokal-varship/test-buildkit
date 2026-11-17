'use client';

import React, { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import useLang from '@hooks/useLang';
import { useProductUrl } from '@hooks/useProductUrl';
import { useSession } from 'next-auth/react';
import { open_dialog } from '@lib/modalHandler';
import { useAnalytics } from '@hooks/useAnalytics';
import { MENU_ICON, MENU_SEARCH_ICON, PROFILE_ICON, ACTIVE_ORDER_ICON } from '@config/Header/image.config';
import Icon from '@components/image/Icons';
import { LanguageCode, TranslationKeys } from 'types';
import { RootState } from '@redux/store';
import {
  // selectDraftTicketsItemCountSum,
  selectDineInSessionProductCount,
  selectDineInSessionData,
  // selectSessionTicketItems,
  selectSessionId,
} from '@redux/slices/qrFlowSlice';
// import { useStoreCart } from '@hooks/storepage/useStore';
import { useQrFullMenuNavigation } from '@hooks/useQrFullMenuNavigation';
import useRecentSearch from '@hooks/storepage/useRecentSearch';
import MobileSearch from '@components/header/mobilesearch';
import { MobileMenuDrawer } from '@components/mobileMenu/MobileMenuDrawer';
import { useQRToken } from '@components/provider/QRProvider';
import SessionClosedPlaceholder from '@components/scanOrder/SessionClosedPlaceholder';

const NAV_ICON_SIZE = 24;
const NAV_HEIGHT = 64;

export default function QRFlowBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const menuId = searchParams?.get('menu_id') || '';
  const storeId = useSelector((state: RootState) => state.store.currentStore?.id);
  const [lang] = useLang() as [TranslationKeys, LanguageCode];
  const { getQrCheckoutUrl } = useProductUrl();
  const { data: session } = useSession();
  const { trackSignIn, trackDineInNavClicked, trackDineInSessionClosedPlaceholderViewed } = useAnalytics();
  // const sessionTicketItems = useSelector(selectSessionTicketItems);
  // const draftTicketsItemCountSum = useSelector(selectDraftTicketsItemCountSum);
  const dineInSessionProductCount = useSelector(selectDineInSessionProductCount);
  const dineInSessionData = useSelector(selectDineInSessionData);
  const sessionId = useSelector(selectSessionId);
  const storeData = useSelector((state: RootState) => state.homePage?.storeData?.data);
  const { navigateToQrFullMenu } = useQrFullMenuNavigation();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSessionClosed, setShowSessionClosed] = useState(false);
  const { recentData, triggerRecentSearch, fetchRecentSearchSuggestions } = useRecentSearch(menuId, '', storeId || '');
  const qrTokenFromUrlOrRedux = useQRToken();
  const isProfileDrawerOpen = showMobileMenu;

  const isLoggedIn = Boolean(session?.user);
  // const cartUrl = getCartUrl();
  // const { cartData } = useStoreCart();
  // const cartItemsCount = cartData?.data?.items?.length || 0;
  /** In QR flow badge = sum(itemCount) across all DRAFT tickets; fallback to draft items length; then cart count */
  // const cartBadgeCount =
  //   draftTicketsItemCountSum > 0
  //     ? draftTicketsItemCountSum
  //     : sessionTicketItems.length > 0
  //       ? sessionTicketItems.length
  //       : cartItemsCount;
  const hasActiveOrder = dineInSessionProductCount > 0;

  const closeOverlays = () => {
    setShowMobileMenu(false);
    setShowMobileSearch(false);
  };

  /**
   * Post-payment: backend closes dine-in session and we clear Redux.
   * If user still has `qrToken` in URL and lands on Orders, bottom nav actions should show a placeholder
   * rather than navigating to QR pages that require session state.
   */
  const isOrdersRoute = pathname === '/orders' || (pathname?.startsWith('/orders/') ?? false);
  const isQrSessionMissing = Boolean(qrTokenFromUrlOrRedux) && !dineInSessionData && !sessionId;
  const shouldBlockNavClicks = isOrdersRoute && isQrSessionMissing;

  const runOrShowSessionClosed = (fn?: () => void) => {
    if (shouldBlockNavClicks) {
      closeOverlays();
      setShowSessionClosed(true);
      void trackDineInSessionClosedPlaceholderViewed({
        source_path: pathname || "",
      });
      return;
    }
    fn?.();
  };

  const trackNavClick = (
    nav_item: "menu" | "orders" | "search" | "profile",
  ) => {
    void trackDineInNavClicked({
      nav_item,
      source: pathname || "",
      has_active_order: hasActiveOrder,
      session_id: sessionId || undefined,
    });
  };

  const handleMenuClick = () => {
    runOrShowSessionClosed(() => {
      trackNavClick("menu");
      closeOverlays();
      const navigated = navigateToQrFullMenu();
      if (!navigated && storeData) {
        // If QR navigation fails, keep user on current page (no-op).
      }
    });
  };

  const handleOrdersClick = () => {
    runOrShowSessionClosed(() => {
      trackNavClick("orders");
      closeOverlays();
      if (isLoggedIn) {
        router.push(getQrCheckoutUrl());
      } else {
        const source = pathname === '/' ? 'homepage' : (pathname || 'homepage');
        trackSignIn(source, 'dine_in_orders_nav', { funnel: 'dine_in' });
        open_dialog('login', {
          open: true,
          propsData: {
            onSuccess: () => router.push(getQrCheckoutUrl()),
          },
          type: 'login',
          handlerDialog: () => {},
          handleClose: () => {},
          anchor: 'bottom',
          onlyDialog: false,
          sxStyle: {
            '& .MuiDialogContent-root': {
              padding: '20px 16px',
              backgroundColor: 'var(--tertiary-background)',
            },
          },
        });
      }
    });
  };

  const handleProfileClick = () => {
    runOrShowSessionClosed(() => {
      trackNavClick("profile");
      setShowMobileSearch(false);
      setShowMobileMenu(!showMobileMenu);
    });
  };

  const handleSearchClick = () => {
    runOrShowSessionClosed(() => {
      trackNavClick("search");
      setShowMobileMenu(false);
      setShowMobileSearch(true);
    });
  };

  const segments = pathname?.split('/').filter(Boolean) ?? [];
  const isOnMenuPage =
    (pathname?.includes('full-menu') ?? false) ||
    (segments.length >= 3 && !['orders', 'editProfile', 't', 'cart'].includes(segments[0]));
  const isOnQRCheckoutPage = pathname?.includes('qr-checkout');

  const navItems = [
    {
      id: 'menu',
      label: lang.menu,
      icon: MENU_ICON,
      onClick: handleMenuClick,
      href: undefined as string | undefined,
      isActive: isOnMenuPage,
      viewBox: '0 0 22 22',
    },
    {
      id: 'search-icon',
      label: 'Search',
      icon: MENU_SEARCH_ICON,
      onClick: handleSearchClick,
      href: undefined as string | undefined,
      isActive: false,
    },
    // {
    //   id: 'cart-mobile',
    //   label: lang.cart,
    //   icon: MENU_CART_ICON,
    //   href: cartUrl,
    //   onClick: undefined,
    //   isActive: pathname?.endsWith('/cart'),
    //   badgeCount: cartBadgeCount,
    //   viewBox: '0 0 22 22',
    // },
    {
      id: 'orders',
      label: lang.order?.orders ?? 'Orders',
      icon: ACTIVE_ORDER_ICON,
      onClick: handleOrdersClick,
      href: undefined,
      isActive: pathname?.includes('/qr-checkout'),
      showDot: hasActiveOrder,
      viewBox: '0 0 28 24',
    },
    {
      id: 'profile',
      label: lang.editProfile,
      icon: PROFILE_ICON,
      href: undefined as string | undefined,
      onClick: handleProfileClick,
      isActive: pathname?.startsWith('/editProfile') || showMobileMenu,
      viewBox: '0 0 22 22',
    },
  ];

  return (
    <>
      <SessionClosedPlaceholder
        open={showSessionClosed}
        onClose={() => setShowSessionClosed(false)}
        onStartNewSession={() => {
          setShowSessionClosed(false);
          // Start "fresh" outside QR flow (no qrToken/session context).
          router.push('/');
        }}
      />
      <nav
        className={`qr-flow-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-[1030] bg-[var(--cards-containers)] border-t  ${isOnQRCheckoutPage ? 'border-[#D8DEF3]' : 'border-[var(--borders-dividers)]'}`}
        aria-label="QR flow navigation"
      >
      <div className="qr-flow-bottom-nav-inner flex items-center justify-around p-2">
        {navItems.map((item) => {
          const isActiveEffective = isProfileDrawerOpen ? item.id === 'profile' : item.isActive;
          const iconColor = isActiveEffective ? 'var(--accent-color)' : 'var(--secondary-text)';
          const labelColor = isActiveEffective ? 'var(--accent-color)' : 'var(--secondary-text)';
          const badgeCount = 'badgeCount' in item ? (item as { badgeCount?: number }).badgeCount : undefined;
          const showDot = 'showDot' in item ? (item as { showDot?: boolean }).showDot : false;
          const content = (
            <>
              <span className="qr-flow-nav-icon-wrapper">
                <Icon
                  icon={`${item.icon}#${item.id}`}
                  width={NAV_ICON_SIZE}
                  height={NAV_ICON_SIZE}
                  color={iconColor}
                  viewBox={item.viewBox}
                  className={`${showDot ? 'mb-[-9px]' : ''}`}
                />
                {showDot &&<span className="bg-[var(--success)] text-[var(--white)] text-[7px] px-0.5 font-500 tracking-wider rounded-3xl">Active</span>}
                {badgeCount != null && badgeCount > 0 && (
                  <span className="qr-flow-cart-count-badge">
                    {badgeCount > 99 ? '99+' : badgeCount < 10 ? `0${badgeCount}` : badgeCount}
                  </span>
                )}
              </span>
              <span
                className={`font-500 heading-6 ${showDot ? 'mt-[-6px]' : ''}`}
                style={{ color: labelColor }}

              >
                {item.label}
              </span>
            </>
          );

          if (item.href) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center justify-center ${item.id === 'orders' && showDot ? '' : 'gap-2'} flex-1 min-w-0 text-[var(--primary-text)] hover:text-[var(--primary-color)] hover:opacity-90 transition-opacity`}
                prefetch={true}
                onClick={(e) => {
                  if (shouldBlockNavClicks) {
                    e.preventDefault();
                    closeOverlays();
                    setShowSessionClosed(true);
                    return;
                  }
                  closeOverlays();
                }}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                runOrShowSessionClosed(item.onClick);
              }}
              className={`flex flex-col items-center justify-center  ${item.id === 'orders' && showDot ? '' : 'gap-2'} flex-1 min-w-0 bg-transparent border-0 cursor-pointer text-[var(--primary-text)] hover:text-[var(--primary-color)] hover:opacity-90 transition-opacity`}
            >
              {content}
            </button>
          );
        })}
      </div>
      <style jsx>{`
        .qr-flow-bottom-nav {
          padding-bottom: max(12px, env(safe-area-inset-bottom));
        }
        .qr-flow-bottom-nav-inner {
          height: ${NAV_HEIGHT}px;
        }
        .qr-flow-nav-icon-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .qr-flow-cart-count-badge {
          position: absolute;
          top: -6px;
          right: -8px;
          background-color: var(--primary-color);
          color: var(--primary-text-light);
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          font-family: var(--font-family);
          min-width: 16px;
          box-sizing: border-box;
        }
        @media (min-width: 768px) {
          .qr-flow-bottom-nav {
            display: none;
          }
        }
      `}</style>
    </nav>
      {showMobileSearch && (
        <MobileSearch
          visible={showMobileSearch}
          onClose={() => setShowMobileSearch(false)}
          recentData={recentData}
          triggerRecentSearch={triggerRecentSearch}
          fetchRecentSearchSuggestions={fetchRecentSearchSuggestions}
        />
      )}
      
      <MobileMenuDrawer
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        showProfileHeader={true}
        isQRFlow={true}
      />
    </>
  );
}
