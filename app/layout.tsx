import React, { Suspense } from "react";
import "./globals.css";
import "../styles/theme.css";
import { getThemeConfig } from "@config/theme.config";
import ReduxProvider from "../redux/ReduxProvider";
import dynamic from "next/dynamic";
import { ThemeProvider } from "../context/ThemeProvider";
import { Theme } from "types";
import LayoutWrapper from "./LayoutWrapper";
import GoogleFont from "@components/GoogleFont";
import type { Store } from "@components/type/store.types";
// Import logger to initialize console override
import "@lib/logger";
import LoggerInitializer from "@components/LoggerInitializer";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { RudderStackScript } from "@components/analytics/RudderStackScript";
import { PageViewTracker } from "@components/analytics/PageViewTracker";
import { UtmCapture } from "@components/analytics/UtmCapture";
import ClientProviders from "./ClientProviders";
import { SearchParamsProvider } from "@context/SearchParamsContext";

// Dynamically import client-side providers
const ToastProvider = dynamic(() => import("@components/toast/Toast"));
const LanguageProvider = dynamic(() => import("context/LanguageContext"));
const AuthProvider = dynamic(() => import("components/provider/AuthProvider"));
const AnalyticsProvider = dynamic(
  () => import("components/provider/AnalyticsProvider"),
);
const StoreDataProvider = dynamic<{ children: React.ReactNode }>(
  () => import("./StoreDataProvider"),
);

interface StoreDataResponse {
  data: Store[];
}
const emptyStoreData: StoreDataResponse = { data: [] };

const Layout: React.FC<{
  children: React.ReactNode;
  modal: React.ReactNode;
}> = ({ children, modal }) => {
  const themeConfig = getThemeConfig();
  // Static defaults — no cookies() here keeps the layout fully ISR-compatible.
  // ThemeProvider / LanguageProvider self-correct from cookies client-side.
  // StoreDataProvider (client component below) fetches getTenantStore on
  // mount using cookie coordinates and seeds Redux in the background.
  const theme: Theme = "light";
  const language = "en";

  return (
    <html lang={language} data-theme={theme}>
      <head>
        <link
          rel="preconnect"
          href={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}`}
        />
        <link
          rel="dns-prefetch"
          href={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}`}
        />
        {/* Umami tracking code */}
        {/* <Script
          defer
          src="/api/umamiScript.js"
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          strategy="beforeInteractive"
        ></Script> */}
        <RudderStackScript />
        <GoogleFont />
      </head>
      <body>
        <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID || ""}>
          <SearchParamsProvider>
            <LoggerInitializer />
            <AuthProvider>
              <AnalyticsProvider>
                <ToastProvider>
                  <ThemeProvider initialTheme={theme}>
                    <ReduxProvider storePropsData={emptyStoreData}>
                      <StoreDataProvider>
                        <Suspense fallback={null}>
                          <UtmCapture />
                          <PageViewTracker />
                        </Suspense>
                        <LanguageProvider initialLanguage={language}>
                          <ClientProviders storePropsData={emptyStoreData}>
                            <LayoutWrapper>
                              <div>{children}</div>
                              {modal}
                            </LayoutWrapper>
                          </ClientProviders>
                        </LanguageProvider>
                      </StoreDataProvider>
                    </ReduxProvider>
                  </ThemeProvider>
                </ToastProvider>
              </AnalyticsProvider>
            </AuthProvider>
          </SearchParamsProvider>
        </GoogleOAuthProvider>
      </body>
      <style precedence="default" href="unique-style-identifier">{`
            
            :root {
              --primary-background: ${themeConfig.light["primary-background-light"]};
              --primary-text: ${themeConfig.light["primary-text-light"]};
              --secondary-text: ${themeConfig.light["secondary-text-light"]};
              --primary-color: ${themeConfig.light["primary-color-light"]};
              --cta-hover: ${themeConfig.light["cta-hover-light"]};
              --accent-color: ${themeConfig.light["accent-color-light"]};
              --success: ${themeConfig.light["success-light"]};
              --warning-light: ${themeConfig.light["warning-light"]};
              --warning-opac: ${themeConfig.light["warning-opac-light"]};
              --error: ${themeConfig.light["error-light"]};
              --borders-dividers: ${themeConfig.light["borders-dividers-light"]};
              --cards-containers: ${themeConfig.light["cards-containers-light"]};
              --primary-icon-color: ${themeConfig.light["primary-icon-color-light"]};
              --hover-active-icon-color: ${themeConfig.light["hover-active-icon-color-light"]};
              --white: ${themeConfig.light["white-light"]};
              --black: ${themeConfig.light["black-light"]};
              --secondary-background: ${themeConfig.light["secondary-background-light"]};
              --font-family: ${themeConfig.fontFamily.primary};
              --base-font-size: ${themeConfig.fontStyles.baseFontSize};
              font-size: ${themeConfig.fontStyles.baseFontSize};
              --border-primary: ${themeConfig.light["black-light"]};
              --tertiary-background: ${themeConfig.light["background-tertiary-light"]};
              --inner-allignment-border: ${themeConfig.light["inner-allignment-border-light"]};
              --center-alignment: ${themeConfig.light["center-alignment-light"]};
              --success-opacity: ${themeConfig.light["success-opacity-light"]};
              --accent-color-opacity: ${themeConfig.light["accent-color-opacity-light"]};
              --primary-text-light: ${themeConfig.light["primary-text-light-2"] || themeConfig.light["primary-text-light"]};
              --offer-bg-light: ${themeConfig.light["offer-details-light"]};
              --border-dividers-color: ${themeConfig.light["border-light"]};
              --freebies-background: ${themeConfig.light["freebies-background-light"]};
              --product-offer-bg-start: ${themeConfig.light["product-offer-bg-start-light"]};
              --product-offer-bg-end: ${themeConfig.light["product-offer-bg-end-light"]};
              --freebie-tag-color: ${themeConfig.light["freebie-tag-color-light"]};
              --order-type-badge-bg: ${themeConfig.light["order-type-badge-bg-light"]};
              --transaction-history-bg: ${themeConfig.light["transaction-history-bg-light"]};
              --secondary-active-background: ${themeConfig.light["secondary-active-background-light"]};
              --tertiary-active-background: ${themeConfig.light["tertiary-active-background-light"]};
              --primary-active-background: ${themeConfig.light["primary-active-background-light"]};
              --quaternary-background: ${themeConfig.light["white-light"]};
              --border-secondary: ${themeConfig.buttonPrimaryLight.activeBackground};
              --primary-tab-background: ${themeConfig.light["secondary-background-light"]};
              --quaternary-background: ${themeConfig.light["white-light"]};
              --primary-color-opacity: ${themeConfig.light["primary-color-opacity-light"]};
              --order-summary-bg: ${themeConfig.light["order-summary-bg-light"]};
              /* Font Weights */
              --font-light: ${themeConfig.fontStyles.weights.light};
              --font-regular: ${themeConfig.fontStyles.weights.regular};
              --font-medium: ${themeConfig.fontStyles.weights.medium};
              --font-semi-bold: ${themeConfig.fontStyles.weights.semiBold};
              --font-bold: ${themeConfig.fontStyles.weights.bold};
              --font-extra-bold: ${themeConfig.fontStyles.weights.extraBold};

              /* Heading Font Sizes */
              --heading-h1: ${themeConfig.fontStyles.headings.h1};
              --heading-h2: ${themeConfig.fontStyles.headings.h2};
              --heading-h3: ${themeConfig.fontStyles.headings.h3};
              --heading-h4: ${themeConfig.fontStyles.headings.h4};
              --heading-h5: ${themeConfig.fontStyles.headings.h5};
              --heading-h6: ${themeConfig.fontStyles.headings.h6};

              /* Description & Small Text */
              --description-font: ${themeConfig.fontStyles.text.description};
              --small-font: ${themeConfig.fontStyles.text.small};
              --extraSmall-font: ${themeConfig.fontStyles.text.extraSmall};

              /* Button Primary Light */
              --button-primary-background: ${themeConfig.buttonPrimaryLight.background};
              --button-primary-text: ${themeConfig.buttonPrimaryLight.text};
              --button-primary-hover-text: ${themeConfig.buttonPrimaryLight.hoverText};
              --button-primary-hover-background: ${themeConfig.buttonPrimaryLight.hoverBackground};
              --button-primary-font-size: ${themeConfig.buttonPrimaryLight.fontSize};
              --button-primary-border-color: ${themeConfig.buttonPrimaryLight.borderColor};
              --button-primary-border-width: ${themeConfig.buttonPrimaryLight.borderWidth};
              --button-primary-active-background: ${themeConfig.buttonPrimaryLight.activeBackground};

              /* Button Secondary */
              --button-secondary-background: ${themeConfig.buttonSecondary.background};
              --button-secondary-text: ${themeConfig.buttonSecondary.text};
              --button-secondary-hover-text: ${themeConfig.buttonSecondary.hoverText};
              --button-secondary-hover-background: ${themeConfig.buttonSecondary.hoverBackground};
              --button-secondary-font-size: ${themeConfig.buttonSecondary.fontSize};
              --button-secondary-border-color: ${themeConfig.buttonSecondary.borderColor};
              --button-secondary-border-width: ${themeConfig.buttonSecondary.borderWidth}; 
              --tertiary-button-hover-bg: ${themeConfig.buttonSecondary.tertiaryHoverBg};
              --button-secondary-active-background: ${themeConfig.buttonPrimaryLight.activeBackground};
              --slider-arrow-background: ${themeConfig.buttonSecondary.background};
              --slider-arrow-color: ${themeConfig.sliderArrow.light};
              --header-link-hover-background: ${themeConfig.headerLink.hoverBackgroundLight};

              /* Rating Light */
              --rating-bg-primary: ${themeConfig.light.rating.primary};
              --rating-bg-secondary: ${themeConfig.light.rating.secondary};
              --rating-bg-success-primary: ${themeConfig.light.rating.successPrimary};
              --rating-bg-success-secondary: ${themeConfig.light.rating.successSecondary};
              --rating-bg-warning-primary: ${themeConfig.light.rating.warningPrimary};
              --rating-bg-warning-secondary: ${themeConfig.light.rating.warningSecondary};
              --rating-bg-error-primary: ${themeConfig.light.rating.errorPrimary};
              --rating-border: ${themeConfig.light.rating.border};
              --rating-border-secondary: ${themeConfig.light.rating.borderSecondary};
              --rating-bg-success-opacity: ${themeConfig.light.rating.successOpacity};
              --rating-bg-warning-opacity: ${themeConfig.light.rating.warningOpacity};
              --rating-bg-erorr-opacity: ${themeConfig.light.rating.erorrOpacity};
              --rating-bg-warning-secondary-opacity: ${themeConfig.light.rating.secondaryOpacity};
              --rating-border-primary: ${themeConfig.light.rating.borderPrimary};

              --borders-light: ${themeConfig.light["borders-light"]};
              --wishlist-heart-color: ${themeConfig?.wishlistHeartColor?.light};
              --dinein-info-border: ${themeConfig.dineInInfoBox.border};
              --dinein-info-bg: ${themeConfig.dineInInfoBox.background};
              --dinein-info-text: ${themeConfig.dineInInfoBox.text};
              --offer-type-2-bg: ${themeConfig.light.offerTheme.offerType2.background};
              --offer-type-2-text: ${themeConfig.light.offerTheme.offerType2.text};
              --offer-type-3-bg: ${themeConfig.light.offerTheme.offerType3.background};
              --offer-type-3-text: ${themeConfig.light.offerTheme.offerType3.text};
              --offer-type-4-bg: ${themeConfig.light.offerTheme.offerType4.background};
              --offer-type-4-text: ${themeConfig.light.offerTheme.offerType4.text};
              --offer-type-5-bg: ${themeConfig.light.offerTheme.offerType5.background};
              --offer-type-5-text: ${themeConfig.light.offerTheme.offerType5.text};
              --offer-default-bg: ${themeConfig.light.offerTheme.default.background};
              --offer-default-text: ${themeConfig.light.offerTheme.default.text};
              --loyalty-badge-bg: ${themeConfig.light["loyalty-badge-bg-light"]};

            }

            [data-theme="dark"] {
              --primary-background: ${themeConfig.dark["primary-background-dark"]};
              --primary-text: ${themeConfig.dark["primary-text-dark"]};
              --secondary-text: ${themeConfig.dark["secondary-text-dark"]};
              --primary-color: ${themeConfig.dark["primary-color-dark"]};
              --cta-hover: ${themeConfig.dark["cta-hover-dark"]};
              --accent-color: ${themeConfig.dark["accent-color-dark"]};
              --success: ${themeConfig.dark["success-dark"]};
              --warning: ${themeConfig.dark["warning-dark"]};
              --warning-opac: ${themeConfig.dark["warning-opac-dark"]};
              --error: ${themeConfig.dark["error-dark"]};
              --borders-dividers: ${themeConfig.dark["borders-dividers-dark"]};
              --cards-containers: ${themeConfig.dark["cards-containers-dark"]};
              --primary-icon-color: ${themeConfig.dark["primary-icon-color-dark"]};
              --hover-active-icon-color: ${themeConfig.dark["hover-active-icon-color-dark"]};
              --white: ${themeConfig.dark["white-dark"]};
              --black: ${themeConfig.dark["black-dark"]}; 
              --secondary-background: ${themeConfig.dark["secondary-background-dark"]};
              --border-primary: ${themeConfig.dark["white-dark"]};
              --tertiary-background: ${themeConfig.dark["background-tertiary-dark"]};
              --inner-allignment-border: ${themeConfig.dark["inner-allignment-border-dark"]};
              --center-alignment: ${themeConfig.dark["center-alignment-dark"]};
              --secondary-active-background: ${themeConfig.dark["secondary-active-background-dark"]};
              --tertiary-active-background: ${themeConfig.dark["tertiary-active-background-dark"]};
              --primary-active-background: ${themeConfig.dark["primary-active-background-dark"]};
              --quaternary-background: ${themeConfig.dark["primary-background-dark"]};
              --border-secondary: ${themeConfig.buttonPrimaryLight.borderColor};
              --primary-text-light: ${themeConfig.light["primary-text-light-2"] || themeConfig.light["primary-text-light"]};
              --border-dividers-color: ${themeConfig.dark["border-dark"]};
              --freebies-background: ${themeConfig.dark["freebies-background-dark"]};
              --product-offer-bg-start: ${themeConfig.dark["product-offer-bg-start-dark"]};
              --product-offer-bg-end: ${themeConfig.dark["product-offer-bg-end-dark"]};
              --freebie-tag-color: ${themeConfig.dark["freebie-tag-color-dark"]};
              --order-type-badge-bg: ${themeConfig.dark["order-type-badge-bg-dark"]};
              --primary-tab-background: ${themeConfig.dark["cards-containers-dark"]};
              --quaternary-background: ${themeConfig.dark["primary-background-dark"]};
              --primary-color-opacity: ${themeConfig.dark["primary-color-opacity-dark"]};
              --success-opacity: ${themeConfig.dark["success-opacity-dark"]};
              --transaction-history-bg: ${themeConfig.dark["transaction-history-bg-dark"]};
              --accent-color-opacity: ${themeConfig.dark["accent-color-opacity-dark"]};
              --order-summary-bg: ${themeConfig.dark["order-summary-bg-dark"]};
              /* Button Primary Dark */
              --button-primary-background: ${themeConfig.buttonPrimaryDark.background};
              --button-primary-text: ${themeConfig.buttonPrimaryDark.text};
              --button-primary-hover-text: ${themeConfig.buttonPrimaryDark.hoverText};
              --button-primary-hover-background: ${themeConfig.buttonPrimaryDark.hoverBackground};
              --button-primary-font-size: ${themeConfig.buttonPrimaryDark.fontSize};
              --button-primary-border-color: ${themeConfig.buttonPrimaryDark.borderColor};
              --button-primary-border-width: ${themeConfig.buttonPrimaryDark.borderWidth};
              --button-primary-active-background: ${themeConfig.buttonPrimaryDark.activeBackground};

              /* Button Secondary Dark */
              --button-secondary-background: ${themeConfig.buttonSecondaryDark.background};
              --button-secondary-text: ${themeConfig.buttonSecondaryDark.text};
              --button-secondary-hover-text: ${themeConfig.buttonSecondaryDark.hoverText};
              --button-secondary-hover-background: ${themeConfig.buttonSecondaryDark.hoverBackground};
              --button-secondary-font-size: ${themeConfig.buttonSecondaryDark.fontSize};
              --button-secondary-border-color: ${themeConfig.buttonSecondaryDark.borderColor};
              --button-secondary-border-width: ${themeConfig.buttonSecondaryDark.borderWidth};
              --tertiary-button-hover-bg: ${themeConfig.buttonSecondaryDark.tertiaryHoverBg};
              --button-secondary-active-background: ${themeConfig.buttonPrimaryDark.activeBackground};
              --slider-arrow-background: ${themeConfig.buttonSecondaryDark.background};

              /* Rating Dark */
              --rating-bg-primary: ${themeConfig.dark.rating.primary};
              --rating-bg-secondary: ${themeConfig.dark.rating.secondary};
              --rating-bg-success-primary: ${themeConfig.dark.rating.successPrimary};
              --rating-bg-success-secondary: ${themeConfig.dark.rating.successSecondary};
              --rating-bg-warning-primary: ${themeConfig.dark.rating.warningPrimary};
              --rating-bg-warning-secondary: ${themeConfig.dark.rating.warningSecondary};
              --rating-bg-error-primary: ${themeConfig.dark.rating.errorPrimary};
              --rating-border: ${themeConfig.dark.rating.border};
              --rating-border-secondary: ${themeConfig.dark.rating.borderSecondary};

              --rating-bg-success-opacity: ${themeConfig.dark.rating.successOpacity};
              --rating-bg-warning-opacity: ${themeConfig.dark.rating.warningOpacity};
              --rating-bg-erorr-opacity: ${themeConfig.dark.rating.erorrOpacity};
              --rating-border-primary: ${themeConfig.dark.rating.borderPrimary};

              --borders-light: ${themeConfig.dark["borders-dark"]};

              --slider-arrow-color: ${themeConfig.sliderArrow.dark};
              --header-link-hover-background: ${themeConfig.headerLink.hoverBackgroundDark};
              --wishlist-heart-color: ${themeConfig?.wishlistHeartColor?.dark};
              --dinein-info-border: ${themeConfig.dineInInfoBox.border};
              --dinein-info-bg: ${themeConfig.dineInInfoBox.background};
              --dinein-info-text: ${themeConfig.dineInInfoBox.text};
              --offer-type-2-bg: ${themeConfig.dark.offerTheme.offerType2.background};
              --offer-type-2-text: ${themeConfig.dark.offerTheme.offerType2.text};
              --offer-type-3-bg: ${themeConfig.dark.offerTheme.offerType3.background};
              --offer-type-3-text: ${themeConfig.dark.offerTheme.offerType3.text};
              --offer-type-4-bg: ${themeConfig.dark.offerTheme.offerType4.background};
              --offer-type-4-text: ${themeConfig.dark.offerTheme.offerType4.text};
              --offer-type-5-bg: ${themeConfig.dark.offerTheme.offerType5.background};
              --offer-type-5-text: ${themeConfig.dark.offerTheme.offerType5.text};
              --offer-default-bg: ${themeConfig.dark.offerTheme.default.background};
              --offer-default-text: ${themeConfig.dark.offerTheme.default.text};
              --loyalty-badge-bg: ${themeConfig.dark["loyalty-badge-bg-dark"]};
            }
          `}</style>
    </html>
  );
};

export default Layout;
