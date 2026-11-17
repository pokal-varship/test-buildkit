"use client";
import Link from "next/link";
import { MENU_CART_ICON, MENU_SEARCH_ICON, PROFILE_ICON } from '@config/Header/image.config';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { open_dialog } from '@lib/modalHandler';
import ProfileDropdown from './profileDropdown';
import { useSession } from 'next-auth/react';
// import { LanguageCode, TranslationKeys } from 'types';
import { ExtendedSession } from './types';
import MobileSearch from './mobilesearch';
import Icon from '@components/image/Icons';
import { RecentSearchPayload, RecentSearchResponse } from '@services/recentSearchService';
import { usePathname } from 'next/navigation';
import { useStoreCart } from '@hooks/storepage/useStore';
import useProductUrl from '@hooks/useProductUrl';
import { useAnalytics } from '@hooks/useAnalytics';
import { selectIsQrFlowActive, selectQrFlowTableNumber } from '@redux/slices/qrFlowSlice';
import useLang from '@hooks/useLang';
import TablePinBadge from '@components/TablePinBadge';
import SecondaryButton from '@components/buttons/secondaryButton';

interface LoginProps {
    primary: boolean | undefined;
    search: boolean;
    fetchRecentSearchSuggestions: (
        params: {
            skip?: number;
            limit?: number;
            menuId?: string | null;
            q?: string;
        },
        storeId: string,
    ) => Promise<void>;
    recentData: RecentSearchResponse | null;
    triggerRecentSearch: (payload: RecentSearchPayload, storeId: string, token?: string) => Promise<void>;
}

const Login: React.FC<LoginProps> = ({ primary, search, fetchRecentSearchSuggestions, triggerRecentSearch, recentData }) => {
    const pathname = usePathname();
    const isQrFlowActive = useSelector(selectIsQrFlowActive);
    const qrFlowTableNumber = useSelector(selectQrFlowTableNumber);
    const [lang] = useLang();
    const pathSegments = pathname?.split('/').filter(Boolean) ?? [];
    const isPlpPage = (pathname?.includes('full-menu') ?? false) || (pathSegments.length === 3 && !pathname?.endsWith('/cart'));
    const isStorePage = pathSegments.length >= 1 && 
        !['menu', 'about-us', 'orders', 'events', 'full-menu', 'cart'].includes(pathSegments[0]) &&
        !pathname?.startsWith('/orders/');
    const hideCartIcon = pathname === '/' || pathname === '/menu' || pathname === '/about-us' || pathname === '/orders' || pathname?.startsWith('/orders/') || pathname === '/events' || pathname === '/events/event-details' || isPlpPage || isStorePage ;
    const { data: session } = useSession() as { data: ExtendedSession | null };
    const [showMobileSearch, setShowMobileSearch] = useState<boolean>(false);
    const { cartData } = useStoreCart();
    const { getCartUrl } = useProductUrl();
    const { trackSignIn } = useAnalytics();
    
    // Calculate cart items count
    const cartItemsCount = cartData?.data?.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;

    const handleLoginClick = async () => {
        const source = pathname === "/" ? "homepage" : (pathname || "homepage");
        await trackSignIn(source, "navbar");
        open_dialog("login", {
            open: true,
            propsData: {},
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
    };

    const handleLogoutClick = () => {
        // Handle logout functionality
    };

    return (
        <div>
            <div className="auth-button">
                {search ? (
                    isQrFlowActive && isPlpPage && qrFlowTableNumber ? (
                        <div className="block">
                            <TablePinBadge lang={lang} className="ml-2" forceSinglePart={true} />
                        </div>
                    ) : (
                        <div className="address-input-container-mobile" onClick={() => setShowMobileSearch(true)}>
                            <Icon
                                icon={`${MENU_SEARCH_ICON}#search-icon`}
                                width={22}
                                height={22}
                                color={"var(--primary-text)"}
                                className="contact-icon-mobile"
                                viewBox="0 0 22 22"
                            />
                        </div>
                    )
                ) : null}
                {!hideCartIcon && !isQrFlowActive && <Link href={getCartUrl()} prefetch={true} className="address-input-container-mobile cart-icon-container">
                    <Icon
                        icon={`${MENU_CART_ICON}#cart-mobile`}
                        width={26}
                        height={26}
                        color={"var(--primary-text)"}
                        className="contact-icon-mobile mt-1.5"
                        viewBox="0 0 26 26"
                    />
                    {cartItemsCount > 0 && (
                        <div className="cart-count-badge">
                            {cartItemsCount > 99 ? '99+' : cartItemsCount < 10 ? '0' + cartItemsCount : cartItemsCount}
                        </div>
                    )}
                </Link>}
                {showMobileSearch && <MobileSearch visible={showMobileSearch} onClose={() => setShowMobileSearch(false)} recentData={recentData} triggerRecentSearch={triggerRecentSearch} fetchRecentSearchSuggestions={fetchRecentSearchSuggestions} />}
                {!(session?.user && (session.user.email || session.user.phoneNumber)) ? 
                <div className='flex items-center gap-2'>
                    {/* Desktop Button */}
                    <SecondaryButton
                        className="block md:block ml-1 md:ml-0 !px-3 md:!px-2 xl:!px-5 !py-2 lg:!py-2 !bg-[var(--primary-background)] font-600 transition max-md:hidden text-nowrap"
                        label={primary ? "Sign In" : "Sign Out"}
                        onClick={primary ? handleLoginClick : handleLogoutClick}
                    />
                    
                    {/* Mobile Profile Icon - hidden in scan-order (QR) flow */}
                    {!isQrFlowActive && (
                    <div 
                        className="hidden max-md:flex items-center justify-center px-2  cursor-pointer" 
                        onClick={primary ? handleLoginClick : handleLogoutClick}
                    >
                        <Icon
                            icon={`${PROFILE_ICON}#profile`}
                            width={26}
                            height={26}
                            color={"var(--primary-text)"}
                            className="transition-colors duration-200 cursor-pointer mt-0.5"
                            viewBox="0 0 24 24"
                        />
                    </div>
                    )}
                </div>
                : 
                <>
                    <div className="profile-dropdown-container-desktopview">
                        <ProfileDropdown session={session} />
                    </div>
                    {/* <div className="profile-dropdown-container-mobileview px-[10px]">
                        <ProfileMenuMobile session={session} />
                    </div> */}
                    
                </>}
            </div>

            <style>{`

            .heading-6{
                font-size: var(--heading-h6);
            }
                .auth-button {
                    display: flex;
                    align-items: center;
                    color: var(--primary-text);
                    font-weight: var(--font-semi-bold);
                    font-size: var(--font-sm);
                    cursor: pointer;
                    gap:12px;
                }

                .desktop-container {
                    display: none; /* Hide by default */
                }

                .mobile-container {
                    display: none; /* Hide by default */
                }

                @media (min-width: 768px) {
                    .desktop-container {
                        display: block; /* Show on desktop */
                    }
                    .md-heading-5{
                        font-size: var(--heading-h5) !important;
                    }
                }

                @media (max-width: 767px) {
                    .mobile-container {
                        display: block; /* Show on mobile */
                    }
                }

                .auth-button button {
                    /* background-color: transparent; Adjust as needed */
                    /* border: none; */
                    /* cursor: pointer; */
                    /* font-size: var(--description-font); */
                    /* margin-left: 10px; */
                    /* margin-right: 10px; */
                    /* font-weight: var(--font-semi-bold); */
                }

                .address-input-container-mobile{
                    display: none;
                }

                .login-text{
                    font-size: var(--description-font);
                    font-weight: var(--font-semi-bold);
                    font-family: var(--font-family);
                    padding-left: 5px;
                    cursor: pointer;
                    display: block;
                }

                .profile-dropdown-container-desktopview{
                    display: block;
                }
                .profile-dropdown-container-mobileview{
                    display: none;
                }

                @media (max-width: 768px) {
                    .address-input-container-mobile{
                        display: block;
                        padding: 0 7px;
                    }
                    .address-input-container-mobile img{
                        width: 60px;
                        height: 20px;
                    }
                    .profile-dropdown-container-mobileview{
                        display: block;
                    }
                    .profile-dropdown-container-desktopview{
                        display: none;
                    }
                    .login-text{
                        display: none;
                    }
                }

                @media (max-width: 480px) {
                    .logo {
                        width: 150px;
                    }
                    .auth-button {
                        font-size: var(--font-xs);
                        gap: 0;
                    }
                    .address-input-container-mobile img{
                        width: 20px;
                        height: 20px;
                    }
                    .login-text{
                        display: none;
                    }
                }

                .cart-icon-container {
                    position: relative;
                }

                .cart-count-badge {
                    position: absolute;
                    top: -1px;
                    right: 1px;
                    background-color: var(--warning-light);
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

            `}</style>
        </div>
    );
};

export default Login;
