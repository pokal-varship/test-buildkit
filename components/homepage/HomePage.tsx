"use client";
import React from "react";
import { SearchInput } from "@components/address/SearchInput";
import { StoreFrontList } from "../storeFront/StoreFrontList";
import {
  CROSS_ICON,
  LOCATION_IMAGE,
  SEARCH_ICON,
} from "@config/Header/image.config";
import { LocationsClientProps } from "@components/type/home.type";
import { useAddress } from "@hooks/useAddress";
import WebsiteSchema from "@components/WebsiteSchema";
import Icon from "@components/image/Icons";
// import { generateImageBase64FromUrl } from "../../lib/helper/ImageGen/imageGen";

interface ExtendedLocationsClientProps extends LocationsClientProps {
  availableStores?: string[];
  productCategorySlug?: string;
  linkedMenus?: Array<{
    menuId: string;
    menuSlug: string;
  }>;
  urlManagement?: {
    canonicalUrl: string;
    currentUrl: string;
    customSlug: string;
    urlPattern: string;
  };
  scanOrderMode?: boolean;
  locationDisplayName?: string;
  redirectToFullMenu?: boolean;
}

export default function LocationsClient({
  homePageData,
  onClose,
  availableStores,
  productCategorySlug,
  linkedMenus,
  urlManagement,
  scanOrderMode,
  locationDisplayName,
  redirectToFullMenu,
}: ExtendedLocationsClientProps) {
  const homePageConfig = homePageData?.data?.pageConfig;
  const homePageImageUrl = homePageData?.data?.pageConfig?.images?.[0]?.url;

  const {
    userAddress,
    suggestions,
    showDropdown,
    handleChange,
    handleSelect,
    setShowDropdown,
    handleAddressChange,
  } = useAddress();

  return (
    <div className="content">
      <WebsiteSchema data={homePageData?.data?.seo?.structuredData} />
      <div className="text-and-image">
        {/* {homePageImageUrl && (
          <div className="image-content-mobile">
            <img fetchPriority="high" 
              title="Restaurant"
              src={
                generateImageBase64FromUrl({
                  url: homePageImageUrl,
                  width: 400,
                  quality: 90,
                })?.fullEncodedUrl || ""
              }
              alt="Restaurant"
              width={400}
              height={584}
            />
          </div>
        )} */}
        <div className={`text-content ${scanOrderMode ? 'scan-order-mode' : ''}`}>
          {!scanOrderMode && (
            <>
              <h1 className="heading-h1">{homePageConfig?.title}</h1>
              <div className="heading-h2-container">
                <h2 className="heading-h2">{homePageConfig?.title}</h2>
                {onClose && (
                  <div
                    className="heading-close-icon cursor-pointer"
                    onClick={onClose}
                  >
                    <Icon
                      icon={`${CROSS_ICON}#cross`}
                      width={18}
                      height={18}
                      color={"var(--primary-text)"}
                      viewBox="0 0 16 16"
                    />
                  </div>
                )}
              </div>
              <div className="address-field-container">
                <SearchInput
                  placeholder={homePageConfig?.addressPlaceholder}
                  searchIcon={SEARCH_ICON}
                  locationIcon={LOCATION_IMAGE}
                  search={false}
                  location={true}
                  handleInputChange={handleAddressChange}
                  inputData={
                    typeof userAddress === "string"
                      ? userAddress
                      : userAddress?.display_name || ""
                  }
                  handleInputDataChange={handleChange}
                  suggestions={suggestions.map((suggestion) => {
                    return { ...suggestion, title: suggestion.display_name };
                  })}
                  handleSelect={
                    handleSelect as (
                      suggestion: string | { [key: string]: string }
                    ) => void
                  }
                  showDropdown={showDropdown}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  crossShow={true}
                  crossIcon={`${CROSS_ICON}`}
                  crossIconClassName="mt-2"
                  crossIconColor="var(--secondary-text)"
                  inputClassName="input-text"
                  suggestionClassName="suggestion-text"
                  width="100%"
                />
              </div>
            </>
          )}
          <div className="restaurant-list-container">
            <StoreFrontList 
              onClose={onClose} 
              availableStores={availableStores} 
              productCategorySlug={productCategorySlug}
              linkedMenus={linkedMenus}
              urlManagement={urlManagement}
              scanOrderMode={scanOrderMode}
              locationDisplayName={locationDisplayName}
              redirectToFullMenu={redirectToFullMenu}
            />
          </div>
        </div>
        {/* {homePageImageUrl && (
          <div className="image-content-desktop fixed-image">
            <img fetchPriority="high" 
              title="Restaurant"
              src={
                generateImageBase64FromUrl({
                  url: homePageImageUrl,
                  width: 768,
                  quality: 90,
                })?.fullEncodedUrl || ""
              }
              alt="Restaurant"
            />
          </div>
        )} */}
      </div>
      <style>{`
                .home-page {
                    font-family: var(--font-family);
                    background-color: var(--background-home-page);
                }
                .heading-h1 {
                    font-size: var(--heading-h2);
                    font-weight: bold;
                    text-align: left;
                    color: var(--primary-text);
                    position: fixed;
                    z-index: 1;
                    background: var(--primary-background);
                    padding: 20px 12px 8px 0;
                    width: 100%;
                    max-width: 553px;
                    margin-top: -24px;
                    z-index:10;
                }
                .heading-h2{
                    display:none;
                }
                .sub-heading {
                    font-size: var(--description-font);
                    color: var(--secondary-text);
                    text-align: center;
                    margin: 0 auto;
                    width: 100%;
                    white-space: pre-line;
                }
                .address-field-container {
                    width: 100%;
                    max-width: 552px;
                    margin: 10px auto;
                    padding-top: 32px;
                    position: fixed;
                    z-index: 9999;
                    background: var(--primary-background);
                    padding: 20px 0 16px 0;
                    margin-top: 12px;
                    z-index:10;
                }

                .input-text {
                    color: var(--secondary-text) !important;
                }

                .suggestion-text {
                    color: var(--secondary-text) !important;
                }

                .content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin: 0 auto;
                    width: 100%;
                }
                .text-and-image {
                    display: flex;
                    column-gap: 0px;
                    width: 100%;
                }
                .text-content {
                    width: ${homePageImageUrl ? "100%" : "100%"};
                    padding-bottom: 10px;
                }
                .restaurant-list {
                    padding-top: 90px;
                    display: flex;
                    flex-direction: column;
                    gap: 0px;
                    width: 100%;
                    margin: 0 auto;
                }
                .text-content.scan-order-mode .restaurant-list {
                    padding: 0 !important;
                }
                .text-content.scan-order-mode .restaurant-card{
                    margin: 0 !important;                    
                    background: var(--primary-background) !important;
                }
                    
                .restaurant-item {
                    width: 100%;
                    padding: 20px;
                    border-radius: 12px;
                    background-color: var(--background-home-page);
                    box-shadow: 0px 2px 8px rgba(0,0,0,0.1);
                    margin: 15px 0;
                }
                .image-content-desktop {
                    flex: 1;
                    display: none;
                    justify-content: center;
                }
                .image-content-desktop img {
                    max-width: 100%;
                    height: auto;
                    width: 100%;
                    object-fit: cover;
                }
                .image-content-mobile {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                }
                .image-content-mobile img {
                    max-width: 100%;
                    height: auto;
                    width: 100%;
                }
                .fixed-image {
                    position: fixed;
                    right: 0;
                    top: 80px;
                    width: 50%;
                    height: calc(100% - 80px);
                }
                @media (max-width: 768px) {
                    .address-field-container{
                        padding-inline: 16px !important;
                        margin-top: 60px;
                        padding-top: 0;
                        padding-bottom: 16px;
                        width: calc(100% - 8px);
                        max-width: 100%;
                    }
                    .text-content {
                        padding-top: 0px;
                        width: 100%;
                        padding-bottom: 0px;
                    }
                    .restaurant-list {
                        width: 100%;
                        padding-inline: 16px;
                        padding-top: 135px;
                    }
                    .heading-h1{
                        display:none;
                    }
                    .heading-h2-container{
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        position: fixed;
                        z-index: 10;
                        background: var(--primary-background);
                        width: calc(100% - 17px);
                        border-radius: 10px 10px 0 0;
                        padding: 20px 7px 8px 16px;
                    }
                    .heading-h2{
                        display:block;
                        font-size: var(--heading-h2);
                        font-weight: bold;
                        text-align: left;
                        color: var(--primary-text);
                        margin: 0;
                        flex: 1;
                    }
                    .heading-close-icon{
                        margin-left: 12px;
                        flex-shrink: 0;
                    }
                    .sub-heading {
                        font-size: var(--small-font);
                    }
                }

                @media (min-width: 768px) {
                    .content {
                        flex-direction: row;
                        justify-content: space-between;
                    }
                    .sub-heading {
                        font-size: var(--small-font);
                    }
                    .image-content-mobile {
                        display: none;
                    }
                    .image-content-desktop {
                        display: flex;
                    }
                }
            `}</style>
    </div>
  );
}
