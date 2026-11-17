'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import useLang from '@hooks/useLang';
import { useSession, signOut } from 'next-auth/react';
import { open_dialog, close_dialog } from '@lib/modalHandler';
import { logout } from '@services/authService';
import { removeCookie } from '@lib/cookie';
import { useAnalytics } from '@hooks/useAnalytics';
import useMenuModal from '@hooks/useMenuModal';
import { useProductUrl } from '@hooks/useProductUrl';
import {
  MENU_ICON,
  ABOUT_US_ICON,
  EVENTS_ICON,
  ORDER_IMAGE,
  QR_LOGOUT_ICON,
  CONTACT_PROFILE_IMAGE,
  ARROW_RIGHT_ICON,
  CASH_WALLET_ICON,
  COIN_ICON,
} from '@config/Header/image.config';
import formatCurrency from '@lib/helper/price';
import useWallet from '@hooks/useWallet';
import Icon from '@components/image/Icons';
import { LanguageCode, TranslationKeys } from 'types';
import { RootState } from '@redux/store';
import OrderOnlineButton from '@components/header/OrderOnlineButton';
import { ExtendedSession } from '@components/header/types';

// Reusable mobile navigation link component
const MobileNavLink: React.FC<{
  href: string;
  icon: string;
  iconId: string;
  label: string;
  onClose: () => void;
  onTrack?: () => void;
}> = ({ href, icon, iconId, label, onClose, onTrack }) => {
  return (
    <Link
      href={href}
      className="py-4 px-4 border-b border-[var(--rating-border-primary)] heading-5 text-[var(--primary-text)] hover:text-[var(--primary-color)] flex items-center gap-2"
      onClick={async () => {
        if (onTrack) {
          await onTrack();
        }
        onClose();
      }}
    >
      <Icon
        icon={`${icon}#${iconId}`}
        width={24}
        height={24}
        color="var(--primary-text)"
        className="flex-shrink-0"
        viewBox="0 0 22 22"
      />
      {label}
    </Link>
  );
};

// Reusable mobile navigation button component
const MobileNavButton: React.FC<{
  icon: string;
  iconId: string;
  label: string;
  onClick: () => void;
  viewBox?: string;
  className?: string;
}> = ({ icon, iconId, label, onClick, viewBox, className }) => {
  return (
    <button
      onClick={onClick}
      className="py-4 px-4 border-b border-[var(--rating-border-primary)] heading-5 text-[var(--primary-text)] hover:text-[var(--primary-color)] text-left w-full flex items-center gap-2"
    >
      <Icon
        icon={`${icon}#${iconId}`}
        width={24}
        height={24}
        color="var(--primary-text)"
        className={`${className} flex-shrink-0`}
        viewBox={viewBox}
      />
      {label}
    </button>
  );
};

/** Login sheet content only — layer order uses MUI defaults (drawer ~1200, modal ~1300) */
const LOGIN_DRAWER_SX = {
  '& .MuiDialogContent-root': {
    padding: '20px 16px',
    backgroundColor: 'var(--tertiary-background)',
  },
} as const;

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  showProfileHeader?: boolean;
  isQRFlow?: boolean;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  onClose,
  showProfileHeader = true,
  isQRFlow = false,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const { handleOpenMenuModal } = useMenuModal();
  const { getOrdersUrl, getEditProfileUrl } = useProductUrl();
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const { trackNavigation, trackSignIn, trackOrderOnlineClicked } = useAnalytics();
  const store = useSelector((state: RootState) => state.store);
  const userId = session?.user?.userId || session?.user?.id || '';
  const { summary, handleGetWallet, handleClearWallet } = useWallet();

  const walletBalance = summary?.cashBalance ?? 0;
  const loyaltyPointsBalance = summary?.loyaltyPoints ?? 0;

  const isLoggedIn = Boolean(session?.user && (session.user.email || session.user.phoneNumber));

  useEffect(() => {
    if (!isOpen || !isLoggedIn || !userId) return;
    handleGetWallet(userId, { page: 1, limit: 1 }).catch(() => undefined);
  }, [isOpen, isLoggedIn, userId, handleGetWallet]);

  const handleEditProfile = () => {
    router.push(getEditProfileUrl());
    onClose();
  };

  const handleWalletClick = () => {
    router.push('/wallet');
    onClose();
  };

  const handleOrders = () => {
    if (isLoggedIn) {
      router.push(getOrdersUrl());
      onClose();
    } else {
      const source = window.location.pathname === '/' ? 'homepage' : (window.location.pathname || 'homepage');
      trackSignIn(source, 'orders');
      onClose();
      open_dialog('login', {
        open: true,
        propsData: {
          onSuccess: () => {
            router.push(getOrdersUrl());
          },
        },
        type: 'login',
        handlerDialog: () => {},
        handleClose: () => {},
        anchor: 'bottom',
        onlyDialog: false,
        sxStyle: LOGIN_DRAWER_SX,
      });
    }
  };

  const handleLogin = () => {
    const source = window.location.pathname === '/' ? 'homepage' : (window.location.pathname || 'homepage');
    trackSignIn(source, 'mobile_menu');
    // onClose();
    open_dialog('login', {
      open: true,
      propsData: {
        onSuccess: () => {
          // Login successful, the component will re-render with updated session
        },
      },
      type: 'login',
      handlerDialog: () => {},
      handleClose: () => {},
      anchor: 'bottom',
      onlyDialog: false,
      sxStyle: LOGIN_DRAWER_SX,
    });
  };

  const handleLogout = async () => {
    if (!session?.user) return;
    close_dialog(['logout']);
    onClose();
    try {
      if (session.user.clientName) {
        await logout(
          String(session.user.clientName),
          String(session.user.userId),
          String(session.user?.refreshToken || '')
        );
      }
      handleClearWallet();
      await signOut();
      removeCookie('token');
      window.location.reload();
      removeCookie('orderType');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const confirmLogoutDialog = async () => {
    open_dialog('logout', {
      open: true,
      propsData: { logout: handleLogout },
      type: 'logout',
      handlerDialog: () => {},
      handleClose: () => {},
      anchor: 'bottom',
      className: 'logout-dialog'
    });
    onClose();
  };

  // Toggle body class for mobile menu state to control sticky button z-index
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur effect */}
      <div 
        className={`fixed inset-0 z-[1010] md:hidden ${isQRFlow ? 'top-0' : 'top-[69px]'}`}
        onClick={onClose}
      />

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed left-0 right-0 z-[1020] md:hidden animate-slideDown ${isQRFlow ? 'top-0 bottom-0 h-full' : 'top-[69px] h-auto'}`}
      >
        <div className={`w-full h-full ${isQRFlow ? 'bg-[var(--cards-containers)] pt-2' : 'bg-[var(--primary-background)] rounded-bl-[20px] rounded-br-[20px]'} flex flex-col shadow-lg relative `}>
          
          {/* Profile Header - show when logged in OR when in QR flow */}
          {showProfileHeader && (isLoggedIn || isQRFlow) && (
            <div 
              className="bg-[var(--button-primary-background)] p-2 flex items-center mx-4 mt-4 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={isLoggedIn ? handleEditProfile : handleLogin}
            >
              <img 
                fetchPriority="high" 
                title='contact profile' 
                src={CONTACT_PROFILE_IMAGE} 
                alt="contact profile" 
                width={45} 
                height={45} 
              />
              <div className="flex items-center justify-between w-full">
                <div className="ml-3">
                  <p className="text-[length:var(--description-font)] text-[var(--primary-text-light)] capitalize font-[var(--font-semi-bold)] m-0">
                    {isLoggedIn ? `${session?.user?.firstName} ${session?.user?.lastName}` : 'Login'}
                  </p>
                  <p className="text-[length:var(--description-font)] text-[var(--primary-text-light)] m-0 mt-0.5 font-[var(--font-regular)]">
                    {isLoggedIn 
                      ? (session?.user?.email || (session?.user?.countryCode && session?.user?.phoneNumber ? `${session.user.countryCode} ${session.user.phoneNumber}` : ''))
                      : 'For better experience & features'
                    }
                  </p>
                </div>
                <Icon
                  icon={`${ARROW_RIGHT_ICON}#arrow-right`}
                  width={20}
                  height={20}
                  color="var(--button-primary-text)"
                  className="flex-shrink-0"
                  viewBox="0 0 24 24"
                />
              </div>
            </div>
          )}

          {isLoggedIn && (
            <div className="flex gap-3 mx-4 mt-3 mb-1">
              <button
                type="button"
                onClick={handleWalletClick}
                className={`flex-1 flex items-center gap-3 p-2.5 rounded-xl text-left min-w-0 border-0 cursor-pointer transition-opacity duration-200 active:opacity-[0.85] ${isQRFlow ? 'bg-[var(--primary-background)]' : 'bg-[var(--cards-containers)]'}`}
              >
                <span className="w-10 h-10 rounded-full bg-[#8F90FB66] flex-shrink-0 flex items-center justify-center">
                <img
                  src={CASH_WALLET_ICON}
                  alt={lang.walletBalance}
                  width={20}
                  height={20}
                  className="flex-shrink-0"
                />
                </span>
                <div className="min-w-0">
                  <p className="heading-5 font-700 text-[var(--primary-text)] leading-tight m-0 truncate">
                    {formatCurrency({ amount: walletBalance }).trim()}
                  </p>
                  <p className="extra-small-font font-[var(--font-regular)] text-[var(--secondary-text)] leading-tight m-0 mt-0.5 truncate">
                    {lang.walletBalance}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleWalletClick}
                className={`flex-1 flex items-center gap-3 p-2.5 rounded-xl text-left min-w-0 border-0 cursor-pointer transition-opacity duration-200 active:opacity-[0.85] ${isQRFlow ? 'bg-[var(--primary-background)]' : 'bg-[var(--cards-containers)]'}`}
              >
                <span className="w-10 h-10 rounded-full bg-[#F6C71966] flex-shrink-0 flex items-center justify-center">
                  <img
                    src={COIN_ICON}
                    alt={lang.loyaltyPoints}
                    width={20}
                    height={20}
                  />
                </span>
                <div className="min-w-0">
                  <p className="heading-5 font-700 text-[var(--primary-text)] leading-tight m-0 truncate">
                    {loyaltyPointsBalance.toLocaleString()}
                  </p>
                  <p className="extra-small-font font-[var(--font-regular)] text-[var(--secondary-text)] leading-tight m-0 mt-0.5 truncate">
                    {lang.loyaltyPoints}
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Combined Navigation Menu */}
          <nav className="flex-1 flex flex-col gap-0">
            {/* Menu - hide in QR flow */}
            {!isQRFlow && (
              <MobileNavButton
                icon={MENU_ICON}
                iconId="menu"
                label={lang.menu}
                onClick={async () => {
                  await trackNavigation('Menu', (pathname === '/' ? 'homepage' : pathname) || 'homepage');
                  handleOpenMenuModal();
                  onClose();
                }}
                viewBox="0 0 22 22"
              />
            )}

            {/* My Orders - only show when user is logged in */}
            {isLoggedIn && (
              <MobileNavButton
                icon={ORDER_IMAGE}
                iconId="orders"
                label={isQRFlow ? 'Past Orders' : lang.order.myOrdersTitle}
                onClick={handleOrders}
                viewBox="0 0 24 24"
              />
            )}

            {/* About Us */}
            <MobileNavLink
              href="/about-us"
              icon={ABOUT_US_ICON}
              iconId="about-us"
              label={lang.aboutUs}
              onClose={onClose}
              onTrack={async () => {
                await trackNavigation('About Us', (pathname === '/' ? 'homepage' : pathname) || 'homepage');
              }}
            />

            {/* Events */}
            <MobileNavLink
              href="/events"
              icon={EVENTS_ICON}
              iconId="events"
              label={lang.events}
              onClose={onClose}
              onTrack={async () => {
                await trackNavigation('Events', (pathname === '/' ? 'homepage' : pathname) || 'homepage');
              }}
            />

            {/* Logout - only show when user is logged in */}
            {isLoggedIn && (
              <MobileNavButton
                icon={QR_LOGOUT_ICON}
                iconId="qr-logout"
                label={lang.logout}
                onClick={confirmLogoutDialog}
                viewBox="0 0 24 24"
                className="ml-[3px]"
              />
            )}

            {/* Order Online Button - only show when user is not logged in and not in QR flow */}
            {!isLoggedIn && !isQRFlow && (
              <div className="flex px-4 py-4 justify-center">
                <OrderOnlineButton
                  onClick={async () => {
                    // Track Order Online button click
                    const source = pathname === '/' ? 'homepage' : (pathname || 'homepage');
                    await trackOrderOnlineClicked({
                      source,
                      section: 'navbar',
                      cta_text: lang.orderOnline,
                      restaurant_name: store?.currentStore?.name || '',
                      city: store?.currentStore?.address?.city || '',
                    });
                    handleOpenMenuModal();
                    onClose();
                  }}
                  className="w-full border-none rounded-[10px] py-3 px-5 font-700 transition-opacity duration-200 hover:opacity-90 active:opacity-80"
                  arrowProps={{ width: 5, height: 5, color: 'var(--button-primary-text)' }}
                />
              </div>
            )}
          </nav>
        </div>
      </div>

      <style>{`
        /* Hide sticky button when mobile menu is open */
        body.mobile-menu-open .sticky-button-container {
          z-index: 10 !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
    </>
  );
};
