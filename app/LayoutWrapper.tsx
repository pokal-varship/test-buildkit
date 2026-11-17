"use client";

import { usePathname, useParams } from "next/navigation";
import { Header } from "@components/header/header";
import Footer from "@components/footer/Footer";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { selectIsQrFlowActive } from "@redux/slices/qrFlowSlice";
import React, { Suspense } from "react";
import { selectComboRuntimeUi } from "@redux/selectors/comboSelectors";
import { showSearchBar } from "@components/header/config";
import { useHandleLogout } from "@services/logoutService";
import MobileCartSummary from "@components/cart/MobileCartSummary";
import FloatingCartButton from "@components/cart/FloatingCartButton";
import { PreviewThemeReceiver } from "./theme-config/components/PreviewThemeReceiver";
import { useIsAppWebView } from "@hooks/useIsAppWebView";
import { useAppSearchParam } from "@context/SearchParamsContext";
import HeaderShell from "@components/layout/HeaderShell";

const DialogHoc = dynamic(() => import("hoc/dialogHoc"), {
  ssr: false,
  loading: () => <div></div>,
});
const QRFlowBottomNav = dynamic(
  () =>
    import("../components/scanOrder/QRFlowBottomNav").then((mod) => ({
      default: mod.default,
    })),
  { ssr: false },
);

function PreviewThemeGate() {
  const isPreview = useAppSearchParam("preview") === "true";
  if (!isPreview) return null;
  return <PreviewThemeReceiver />;
}

function SiteHeader({
  normalizedParams,
}: {
  normalizedParams: {
    storeSlug?: unknown;
    categorySlug?: string;
    menuSlug?: string;
  };
}) {
  return (
    <Header
      primary
      showCartButton={false}
      showSearchInput={false}
      showOrderMenu={!showSearchBar(normalizedParams)}
    />
  );
}

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const isAppWebView = useIsAppWebView();
  useHandleLogout();
  const pathname = usePathname();
  const params = useParams();
  const productSlug = params?.productSlug;

  const normalizedParams: {
    storeSlug?: unknown;
    categorySlug?: string;
    menuSlug?: string;
  } = {
    storeSlug: Array.isArray(params?.storeSlug)
      ? params.storeSlug[0]
      : params?.storeSlug,
    categorySlug: (Array.isArray(params?.categorySlug)
      ? params.categorySlug[0]
      : params?.categorySlug) as string | undefined,
    menuSlug: (Array.isArray(params?.menuSlug)
      ? params.menuSlug[0]
      : params?.menuSlug) as string | undefined,
  };

  const matchesPath = (
    currentPath: string | null,
    pathsToMatch: string[],
  ): boolean => {
    if (!currentPath) return false;

    return pathsToMatch.some((path) => {
      if (path.endsWith("/edit")) {
        return (
          currentPath === path ||
          currentPath.endsWith("/" + path.split("/").pop())
        );
      }
      if (path === "/pages/puck") {
        return currentPath.startsWith(path);
      }
      return (
        currentPath === path ||
        currentPath.startsWith(path + "/") ||
        currentPath.endsWith(path)
      );
    });
  };

  const hideLayoutPaths = [
    "/cart",
    "/qr-checkout",
    "/checkout",
    "/payment",
    `/${productSlug}`,
    "/about-us/edit",
    "/pages/puck",
    "/edit",
    "/theme-config",
    "/admin",
    "/t",
    "/editProfile/updateEmail",
    "/editProfile/updatePhone",
  ];
  const hideFooterPaths = [
    "/editProfile",
    "/updateEmail",
    "/updatePhone",
    "/checkout",
    "/qr-checkout",
    "/payment",
    "/about-us/edit",
    "/pages/puck",
    "/edit",
    "/theme-config",
    "/admin",
  ];

  const shouldHideLayout =
    matchesPath(pathname, hideLayoutPaths) ||
    (pathname?.includes("/product") && !pathname?.endsWith("/products"));
  const shouldHideFooter =
    matchesPath(pathname, hideFooterPaths) ||
    (pathname?.includes("/product") && !pathname?.endsWith("/products"));

  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const pathSegments = pathname?.split("/").filter(Boolean) ?? [];
  const isPdpPage =
    !!(pathname?.includes("/product") && !pathname?.endsWith("/products")) ||
    pathSegments.length === 4;
  const isCartPage = pathname?.endsWith("/cart") ?? false;
  const isQrCheckoutPage = pathname?.endsWith("/qr-checkout") ?? false;
  const isOrdersPage =
    pathname === "/orders" || (pathname?.startsWith("/orders/") ?? false);

  const showSiteHeader =
    !shouldHideLayout && !(isQrFlowActive && isOrdersPage) && !isAppWebView;
  const showSiteFooter =
    !shouldHideLayout && !shouldHideFooter && !isAppWebView;
  const useRootLayoutPadding = showSiteHeader && showSiteFooter;

  const isEditProfilePage =
    pathname === "/editProfile" ||
    (pathname?.startsWith("/editProfile/") ?? false);
  const isUpdateEmailPhonePage =
    pathname?.endsWith("/updateEmail") || pathname?.endsWith("/updatePhone");
  const isPlpPage =
    (pathname?.includes("full-menu") ?? false) ||
    (pathSegments.length === 3 &&
      !pathname?.endsWith("/cart") &&
      !pathname?.endsWith("/qr-checkout"));
  const shouldShowQRFlowBottomNav =
    isQrFlowActive &&
    !isPdpPage &&
    !isUpdateEmailPhonePage &&
    (isPlpPage ||
      isCartPage ||
      isOrdersPage ||
      isEditProfilePage ||
      isQrCheckoutPage);

  const menuSlug = normalizedParams?.menuSlug;
  const categorySlug = normalizedParams?.categorySlug;
  const showMobileCartSummarySlugs = [menuSlug, categorySlug].filter(Boolean);
  const shouldShowCartSummary = !!(
    pathname &&
    showMobileCartSummarySlugs.some((slug) => pathname.endsWith(`/${slug}`))
  );

  const comboRuntimeUi = useSelector(selectComboRuntimeUi);
  const isComboGroupPlpPage =
    (pathname?.startsWith("/products/") ?? false) &&
    comboRuntimeUi?.currentView === "list" &&
    typeof comboRuntimeUi?.currentStep === "number" &&
    comboRuntimeUi.currentStep > 0;

  return (
    <>
      <PreviewThemeGate />
      <DialogHoc />
      {showSiteHeader && (
        <Suspense fallback={<HeaderShell />}>
          <SiteHeader normalizedParams={normalizedParams} />
        </Suspense>
      )}
      <div
        className={`${useRootLayoutPadding ? "root-layout" : ""} ${shouldShowQRFlowBottomNav ? "pb-20" : ""} ${(isQrFlowActive && isOrdersPage) || isAppWebView ? "!pt-0" : ""}`}
      >
        {children}
      </div>
      {showSiteFooter && (
        <Footer shouldShowCartSummary={shouldShowCartSummary} />
      )}
      {(shouldShowCartSummary ||
        (!isQrFlowActive && isPdpPage) ||
        (isQrFlowActive && (isPlpPage || isPdpPage || isQrCheckoutPage))) && (
        <FloatingCartButton
          isPdpPage={isPdpPage}
          isQrFlowPlpPage={isQrFlowActive && isPlpPage}
          isQrCheckoutPage={isQrFlowActive && isQrCheckoutPage}
          isComboGroupPlpPage={isComboGroupPlpPage}
        />
      )}
      {isQrFlowActive && isPlpPage && <MobileCartSummary />}
      {shouldShowQRFlowBottomNav && <QRFlowBottomNav />}
    </>
  );
};

export default LayoutWrapper;
