"use client";
import React, { useEffect } from "react";
import Loader from "@components/loader/Loader";
import Icon from "@components/image/Icons";
import { CROSS_ICON } from "@config/Header/image.config";
import HomePage from "@components/homepage/HomePage";
import { HomePageLocationData } from "@components/type/home.type";
import useHomePageConfigData from "@hooks/homepage/useHomePageConfigData";
import { useAddress } from "@hooks/useAddress";

interface MenuModalProps {
  onClose: () => void;
  showCloseIcon?: boolean;
  header?: React.ReactNode;
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

const MenuModal: React.FC<MenuModalProps> = ({
  onClose,
  showCloseIcon = true,
  header,
  availableStores,
  productCategorySlug,
  linkedMenus,
  urlManagement,
  scanOrderMode = false,
  locationDisplayName,
  redirectToFullMenu,
}) => {
  const { pageConfigData, configLoading, configError, fetchPageConfigData } =
    useHomePageConfigData();
  const { fetchLocation } = useAddress();

  useEffect(() => {
    fetchLocation();
    fetchPageConfigData();
  }, []);

  return (
    <div className="relative h-full">
      {/* Sticky header with close icon */}
      <div className="sticky top-0 z-50 bg-[var(--cards-containers)] hidden md:block">
        {header ? (
          <span className="relative">{header}</span>
        ) : showCloseIcon ? (
          <div
            className="absolute top-7 md:top-2 right-4 cursor-pointer"
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
        ) : null}
      </div>

      {/* Scrollable content - no fixed min-height so content drives modal height */}
      <div className="overflow-y-auto overflow-x-hidden flex flex-col w-full">
        {configLoading ? (
          <div className="flex justify-center items-center min-h-[85vh] w-full">
            <Loader size={32} type="spinner" color="var(--primary-color)" />
          </div>
        ) : pageConfigData ? (
          <HomePage
            homePageData={pageConfigData as HomePageLocationData}
            onClose={onClose}
            availableStores={availableStores}
            productCategorySlug={productCategorySlug}
            linkedMenus={linkedMenus}
            urlManagement={urlManagement}
            scanOrderMode={scanOrderMode}
            locationDisplayName={locationDisplayName}
            redirectToFullMenu={redirectToFullMenu}
          />
        ) : (
          <div className="flex flex-col justify-center items-center py-8">
            <p className="text-gray-600 mb-2">No data available</p>
            {configError && (
              <p className="text-red-500 text-sm">Error: {configError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuModal;
