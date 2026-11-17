"use client";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { SearchInput } from "../address/SearchInput";
import CartButton from "../buttons/CartButton";
import { showMiniCart, showSearchBar } from "@components/header/config";
import { useParams, usePathname } from "next/navigation";
import { useAppSearchParam } from "@context/SearchParamsContext";
import { getTenantConfig } from "@config/tenant.config";
import Login from "./login";
import {
  LOCATION_IMAGE,
  MENU,
  SEARCH_ICON,
  X_ICON,
  MENU_ICON,
  ABOUT_US_ICON,
  EVENTS_ICON,
  CROSS_ICON_NEW,
  // ORDER_IMAGE,
  // CONTACT_PROFILE_IMAGE,
  // ARROW_RIGHT_ICON,
  // QR_LOGOUT_ICON,
  // ORDER_ICON,
} from "@config/Header/image.config";
import Link from "next/link";
import useLang from "@hooks/useLang";

import { LanguageCode, TranslationKeys } from "types";
import { useTypesenseProducts } from "@hooks/products/usetypesenseproducts";
import SearchResults from "./SearchResults";
import { TypesenseProduct } from "@services/typesense";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import { selectIsQrFlowActive } from "@redux/slices/qrFlowSlice";
import useRecentSearch from "@hooks/storepage/useRecentSearch";
import { useStoreCart } from "@hooks/storepage/useStore";
import Icon from "@components/image/Icons";
// import { useTheme } from "next-themes";
import useMenuModal from "@hooks/useMenuModal";
import AppLogo from "@components/app-logo/app-logo";
import OrderOnlineButton from "./OrderOnlineButton";
import { useAnalytics } from "@hooks/useAnalytics";
import { MobileMenuDrawer } from "@components/mobileMenu/MobileMenuDrawer";
import { useStoreDataBootstrap } from "@app/StoreDataProvider";
import { buildHeaderProductSearchRequest } from "../../utils/typesenseRetailCatalog";

// Reusable mobile navigation link component is now in MobileMenuDrawer

// Reusable mobile navigation button component is now in MobileMenuDrawer

export const Header: React.FC<{
  primary?: boolean;
  showCartButton?: boolean;
  showSearchInput?: boolean;
  showOrderMenu?: boolean;
}> = ({ primary, showCartButton, showSearchInput, showOrderMenu }) => {
  const pathname = usePathname() || "";
  const rawParams = useParams();
  // const router = useRouter();

  // Memoize params to prevent unnecessary re-renders
  const memoizedParams = useMemo(() => rawParams || {}, [rawParams]);
  const paramsStoreSlug =
    typeof memoizedParams === "object" &&
    memoizedParams !== null &&
    "storeSlug" in memoizedParams
      ? Array.isArray(memoizedParams.storeSlug)
        ? memoizedParams.storeSlug[0]
        : (memoizedParams.storeSlug as string | undefined)
      : undefined;
  const menuId = useAppSearchParam("menu_id") || "";
  const isShowSearchBar = showSearchBar(memoizedParams);
  const isShowMiniCart = showMiniCart(memoizedParams);
  const tenantConfig = getTenantConfig();
  const logoUrl = tenantConfig.lightLogoUrl || tenantConfig.darkLogoUrl;
  const [lang]: [TranslationKeys, LanguageCode] = useLang();

  const storeId = useSelector(
    (state: RootState) => state.store.currentStore?.id,
  );
  const store = useSelector((state: RootState) => state.store);
  const homePageStoreData = useSelector(
    (state: RootState) => state.homePage?.storeData?.data,
  );
  const catalogAccountType = useMemo(() => {
    return (
      store.currentStore?.accountType ||
      (Array.isArray(homePageStoreData)
        ? homePageStoreData[0]?.accountType
        : undefined)
    );
  }, [store.currentStore?.accountType, homePageStoreData]);
  const { products, loading, totalFound, multiSearch } = useTypesenseProducts({
    storeId,
  });
  const [inputData, setInputData] = useState<string>("");
  const { recentData, triggerRecentSearch, fetchRecentSearchSuggestions } =
    useRecentSearch(menuId, inputData, storeId || "");
  const { bootstrapStore } = useStoreDataBootstrap();

  const [localProducts, setLocalProducts] = useState<TypesenseProduct[]>([]);
  const [localCount, setLocalCount] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { handleGetCart } = useStoreCart();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { handleOpenMenuModal } = useMenuModal();
  const { trackNavigation, trackProductSearched, trackOrderOnlineClicked } =
    useAnalytics();
  // useTheme();

  const handleSearch = async () => {
    const payloadTS = buildHeaderProductSearchRequest({
      q: inputData,
      menuId,
      accountType: catalogAccountType,
    });
    await multiSearch([payloadTS]);

    // Analytics: Product Searched (navbar - desktop)
    if (inputData.trim().length > 0) {
      await trackProductSearched(inputData.trim(), "category_listing");
    }
    setShowResults(true);
  };

  const handleAddToCart = () => {
    // Implement add to cart functionality here
    // You could dispatch to a cart state manager or call an API
  };

  // Logout functionality is now handled in MobileMenuDrawer

  const resolveStoreId = useCallback(async () => {
    if (storeId) return storeId;
    const bootstrappedStore = await bootstrapStore(paramsStoreSlug);
    return bootstrappedStore?.id || "";
  }, [bootstrapStore, paramsStoreSlug, storeId]);

  const handleSuggesstions = async (inputStr: string) => {
    const effectiveStoreId = await resolveStoreId();
    if (!effectiveStoreId) return;

    await triggerRecentSearch(
      { searchQuery: inputStr, menuId: menuId || "" },
      effectiveStoreId,
    );
  };

  const handleSuggesstionsGet = async () => {
    setShowResults(true);
    const effectiveStoreId = await resolveStoreId();
    if (!effectiveStoreId) return;

    fetchRecentSearchSuggestions(
      {
        menuId: menuId,
      },
      effectiveStoreId,
    );
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (inputData.length >= 3) {
      handleSearch();
      handleSuggesstions(inputData);
    } else {
      setLocalProducts([]);
      setLocalCount(0);
    }
  }, [inputData]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (products && products.length > 0) {
      setLocalProducts(products);
      setLocalCount(totalFound);
    }
  }, [products, totalFound]);

  useEffect(() => {
    if (storeId && (showCartButton || isShowMiniCart)) {
      handleGetCart(storeId as string);
    }
  }, [storeId, showCartButton, isShowMiniCart]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear input data when URL changes
  useEffect(() => {
    setInputData("");
    setShowResults(false);
    setLocalProducts([]);
    setLocalCount(0);
  }, [memoizedParams, menuId]);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  // Toggle body class for mobile menu state to control sticky button z-index
  useEffect(() => {
    if (showMobileMenu) {
      document.body.classList.add("mobile-menu-open");
    } else {
      document.body.classList.remove("mobile-menu-open");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("mobile-menu-open");
    };
  }, [showMobileMenu]);

  const navLinks: Array<{
    href: string;
    label: string;
    icon: string;
    onClick?: () => void;
  }> = [
    {
      href: "#",
      label: lang.menu,
      icon: MENU_ICON,
      onClick: async () => {
        await trackNavigation("Menu", pathname === "/" ? "homepage" : pathname);
        handleOpenMenuModal();
      },
    },
    { href: "/about-us", label: lang.aboutUs, icon: ABOUT_US_ICON },
    { href: "/events", label: lang.events, icon: EVENTS_ICON },
    // { href: "/contact-us", label: "Contact Us" },
  ];

  const isCategoryPage =
    /^\/[^/]+\/[^/]+$/.test(pathname) &&
    !["/menu", "/about-us", "/events", "/contact-us"].includes(pathname);

  const isPLPPage =
    typeof memoizedParams === "object" &&
    "menuSlug" in memoizedParams &&
    "categorySlug" in memoizedParams;

  const isWishlistPage = pathname.includes("/wishlist");

  // Only hide 'Home' and 'Contact Us' on these pages
  const filteredNavLinks =
    isCategoryPage || isPLPPage || isWishlistPage
      ? navLinks.filter(
          (link) => link.label !== "Home" && link.label !== "Contact Us",
        )
      : navLinks;

  // Check if search results or recent searches are showing
  const isSearchResultsVisible =
    showResults &&
    (inputData.length >= 3 || (recentData?.data && recentData.data.length > 0));
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const hideHeaderOnMobileQrEditProfile =
    isQrFlowActive && pathname?.startsWith("/editProfile");

  return (
    <>
      <header
        className={`flex items-center justify-between px-4 md:px-4 xl:px-[30px] bg-[var(--primary-background)] font-[var(--font-family)] fixed w-full z-[5] gap-3 md:gap-0 ${!isQrFlowActive ? "border-b border-[var(--rating-border-primary)] py-[17px]" : "py-[18px]"} ${hideHeaderOnMobileQrEditProfile ? "hidden" : ""}`}
      >
        <div className="flex gap-2">
          {/* Hamburger or Cross icon for mobile - hidden in scan-order (QR) flow */}
          {!isQrFlowActive &&
            (showMobileMenu ? (
              <Icon
                className="md:hidden cursor-pointer self-center"
                icon={`${CROSS_ICON_NEW}#cross`}
                width={22}
                height={22}
                color={"var(--primary-text)"}
                viewBox="0 0 22 22"
                onClick={() => setShowMobileMenu(false)}
              />
            ) : (
              <Icon
                className="md:hidden cursor-pointer self-center"
                icon={`${MENU}#menu`}
                width={26}
                height={26}
                color={"var(--primary-text)"}
                viewBox="0 0 24 24"
                onClick={() => setShowMobileMenu(true)}
              />
            ))}

          <AppLogo
            logoUrl={logoUrl}
            alt={`${tenantConfig.appName} Logo`}
            title={`${tenantConfig.appName} Logo`}
            imageClassName="logo"
          />

          <nav className="flex-1 justify-center items-center md:pl-3 xl:pl-6 hidden md:flex">
            <ul className="flex items-center md:gap-3 xl:gap-6 heading-6 md-heading-5 font-medium text-[var(--primary-text)]">
              {filteredNavLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <li key={link.href}>
                    {link.onClick ? (
                      <button
                        onClick={link.onClick}
                        className={`font-700 hover:bg-[var(--header-link-hover-background)] hover:text-[var(--button-primary-background)] rounded-md p-1 ${
                          isActive ? "text-[var(--primary-color)]" : ""
                        }`}
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className={`font-700 link-text hover:bg-[var(--header-link-hover-background)] hover:text-[var(--button-primary-background)] rounded-md p-1 text-nowrap ${
                          isActive ? "text-[var(--primary-color)]" : ""
                        }`}
                        onClick={async () => {
                          await trackNavigation(
                            link.label,
                            pathname === "/" ? "homepage" : pathname,
                          );
                        }}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {showSearchInput || isShowSearchBar ? (
          <div
            className={`address-input-container-desktop mr-2 xl:mr-5 relative hidden md:block ${
              isSearchResultsVisible ? "!ml-8 lg:!ml-20" : "ml-2 xl:ml-5"
            }`}
            ref={searchContainerRef}
          >
            <SearchInput
              placeholder={lang.searchItems}
              searchIcon={SEARCH_ICON}
              locationIcon={LOCATION_IMAGE}
              search={true}
              location={false}
              inputData={inputData}
              handleInputDataChange={setInputData}
              onFocus={handleSuggesstionsGet}
              crossShow={true}
              crossIcon={X_ICON}
              crossIconColor={"var(--primary-text)"}
              width="75%"
            />
            <SearchResults
              products={localProducts}
              loading={loading}
              recentData={recentData}
              totalFound={localCount}
              showResults={showResults}
              visible={showResults && inputData.length >= 3}
              inputData={inputData}
              onRecentSelection={setInputData}
              onAddToCart={handleAddToCart}
              fetchRecentSearchSuggestions={fetchRecentSearchSuggestions}
            />
          </div>
        ) : null}

        <div className="auth-cart-container">
          {!isSearchResultsVisible && (
            <Login
              primary={primary}
              search={showSearchInput || isShowSearchBar}
              recentData={recentData}
              triggerRecentSearch={triggerRecentSearch}
              fetchRecentSearchSuggestions={fetchRecentSearchSuggestions}
            />
          )}

          {showOrderMenu ? (
            <OrderOnlineButton
              onClick={async () => {
                // Track Order Online button click
                const source =
                  pathname === "/" ? "homepage" : pathname || "homepage";
                await trackOrderOnlineClicked({
                  source,
                  section: "navbar",
                  cta_text: lang.orderOnline,
                  restaurant_name: store?.currentStore?.name || "",
                  city: store?.currentStore?.address?.city || "",
                });
                handleOpenMenuModal();
              }}
              className="group !px-6 !py-2 font-600 !ml-2 hidden md:flex"
            />
          ) : null}

          {!isSearchResultsVisible && (showCartButton || isShowMiniCart) ? (
            <div className="order-toggle">
              <CartButton />
            </div>
          ) : null}
        </div>

        {/* Mobile Menu Drawer - below header */}
        <MobileMenuDrawer
          isOpen={showMobileMenu}
          onClose={() => setShowMobileMenu(false)}
          showProfileHeader={true}
          isQRFlow={false}
        />

        <style>{`
                .logo {
                    width: auto;
                    height: 40px;
                }
                .contact-icon {
                    width: 15px;
                    height: auto;
                }
                .address-input-container-desktop {
                    flex-grow: 1; 
                    
                }
                .auth-cart-container{
                    display: flex;
                    align-items: center;
                }
                .heading-6{
                  font-size: var(--heading-h6);
                }
                .font-700{
                  font-weight: var(--font-bold);
                } 
                
                /* Hide sticky button when mobile menu is open */
                body.mobile-menu-open .sticky-button-container {
                    z-index: 10 !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                }
               
                @media (max-width: 768px) {
                    .address-input-container {
                        width: 100%;
                        margin-top: 10px;
                    }
                    .address-input-container{
                        // display: none;
                    }
                    .order-toggle{
                        display: none;
                    }
                    .logout-icon {
                        margin-left: 3px;
                    }
                }
                @media (max-width: 480px) {
                    .logo {
                        width: auto !important;
                        height: 34px !important;
                    }
                    .menu{
                      margin-left: 8px;
                    }
                }
            `}</style>
      </header>
    </>
  );
};
