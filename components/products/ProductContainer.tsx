"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useSelector, useDispatch } from "react-redux";
import { selectViewMode } from "@redux/slices/productViewSlice";
import { TypesenseProduct } from "@services/typesense";
import useLang from "@hooks/useLang";
import { LanguageCode, TranslationKeys } from "types";
import Shimmer from "@components/ui/Shimmer";
import { setCookie } from "@lib/cookie";
import { AppDispatch } from '@redux/store';
import { resetComboState } from '@redux/slices/comboSlice';
import useProductUrl from "@hooks/useProductUrl";
import { cn } from "@lib/utils";
import { useAnalytics } from "@hooks/useAnalytics";
import {
  selectIsQrFlowActive,
  selectSessionId,
  selectQrFlowTableNumber,
} from "@redux/slices/qrFlowSlice";
import { DINE_IN_ANALYTICS_CONTEXT } from "@lib/analytics/dineInAnalytics";
import { getTenantConfig } from "@config/tenant.config";

const ProductCardList = dynamic(() => import('./ProductCardList').then(mod => mod.ProductCardList));
const ProductCardGrid = dynamic(() => import('./ProductCardGrid').then(mod => mod.ProductCardGrid));

interface ProductContainerProps {
  products: TypesenseProduct[];
  loading?: boolean;
  error?: Error | null;
  catDesc: string;
  catTitle: string;
  storeSlug: string;
  containerClassName?: string;
  isFullMenu?: boolean;
  excludedFromOfferProductIds?: string[];
}

export const ProductContainer: React.FC<ProductContainerProps> = ({
  products,
  loading,
  error,
  catDesc,
  catTitle,
  storeSlug,
  containerClassName,
  isFullMenu = false,
  excludedFromOfferProductIds,
}) => {
  const viewMode = useSelector(selectViewMode);
  const { getProductUrl } = useProductUrl();
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const [expanded, setExpanded] = useState(false);
  const { showCategoryDescription } = getTenantConfig();
  const dispatch = useDispatch<AppDispatch>();
  const { trackProductClicked } = useAnalytics();
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const qrSessionId = useSelector(selectSessionId);
  const qrFlowTableNumber = useSelector(selectQrFlowTableNumber);


  // Handle click to reset state, track analytics, and set cookie before Link navigation
  const handleProductClick = async (product: TypesenseProduct) => {
    // Analytics: Dish Clicked (before PDP / add-to-cart)
    const price = product.discountedPrice || product.basePrice || 0;
    await trackProductClicked({
      product_id: product.productId || product.id || "",
      product_name: product.name?.en || "",
      category_name: catTitle,
      store_id: product.storefrontId || "",
      price,
      currency: "INR",
      ...(isQrFlowActive
        ? {
            funnel: DINE_IN_ANALYTICS_CONTEXT.funnel,
            table_number: String(qrFlowTableNumber || ""),
            session_id: String(qrSessionId || ""),
          }
        : {}),
    });

    // Reset combo state when navigating from PLP to ensure fresh start
    dispatch(resetComboState());
    // For PLP navigation, NEVER include cid parameter to prevent cart restoration
    setCookie("cartRedirect", getProductUrl(product, storeSlug));
  };
  
  if (error) {
    return (
      <div className="w-full md:w-[80%] text-center text-[var(--error-light)] p-4">
        <p>{lang.errorProducts}</p>
        <p className="text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className= {cn("w-full md:pl-4 pl-0", containerClassName)}>
      {!!(catTitle || (catDesc && showCategoryDescription)) && (
        <div className="category-header md:mb-4">
          {catTitle && (
            <h1 className={cn(
              "heading-2 md-heading-1 font-semibold mb-2 text-[var(--primary-text)]",
              !isFullMenu && "hidden md:block"
            )}>
              {catTitle}
            </h1>
          )}
          {catDesc && showCategoryDescription && (
            <div className="description-container">
            <p
              className={`block md:hidden text-[var(--secondary-text)] text-sm md:text-base`}
            >
              {expanded
                ? catDesc
                : catDesc.length > 98
                ? `${catDesc.slice(0, 98)}...`
                : catDesc}
              {catDesc.length > 98 && (
                <span
                  onClick={() => setExpanded(!expanded)}
                  className="text-[var(--accent-color)] text-sm mt-2 cursor-pointer ml-1"
                >
                  {expanded ? "View less" : "View more"}
                </span>
              )}
            </p>
            <p
              className={`product-description hidden md:block text-[var(--secondary-text)]`}
            >
              {expanded
                ? catDesc
                : catDesc.length > 200
                ? `${catDesc.slice(0, 200)}...`
                : catDesc}
              {catDesc.length > 200 && (
                <span
                  onClick={() => setExpanded(!expanded)}
                  className="text-[var(--accent-color)] text-sm mt-2 cursor-pointer ml-1"
                >
                  {expanded ? "view less" : "view more"}
                </span>
              )}
            </p>
            </div>
          )}
        </div>
      )}
      {(!products || products?.length === 0) && !loading && (
        <div className="w-full h-[70vh] pt-24 md:w-[80%] text-center p-4 flex flex-wrap justify-center items-center content-center">
          <img
            fetchPriority="high"
            src="/images/no-product.svg"
            alt="No Product found"
            title="No Product found"
            width={100}
            height={100}
            className="text-center"
          />
          <p className="w-full text-center pt-2 font-[var(--font-semi-bold)]">
            {lang.NoProductsFound}
          </p>
        </div>
      )}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pb-6 pt-4 md:pt-0">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-full">
                <div className="bg-[var(--cards-containers)] rounded-md p-3 md:p-4 flex flex-col h-[245px] md:h-[350px]">
                  <div className="flex-1 flex flex-col justify-between">
                    <Shimmer
                      className="w-full h-8 md:h-12 rounded"
                      height={"70%"}
                    />
                    <div className="mb-2">
                      <Shimmer className="w-3/4 h-5 mb-2 rounded" />
                      <Shimmer className="w-1/2 h-4 mb-2 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {viewMode === "list" ? (
              // List view
              <div className="pt-1 flex flex-col md:gap-4">
                {/* API Cards */}
                {products?.map((product) => (
                  <ProductCardList
                    key={product.id}
                    product={product}
                    productLink={getProductUrl(product, storeSlug)}
                    onProductClick={() => handleProductClick(product)}
                    excludedFromOfferProductIds={excludedFromOfferProductIds}
                    className="md:w-[90%]"
                    showAddButton={true}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pb-6 pt-4 md:pt-0">
                {products?.map((product) => (
                  <ProductCardGrid
                    key={product?.id}
                    product={product}
                    productLink={getProductUrl(product, storeSlug)}
                    onProductClick={() => handleProductClick(product)}
                    excludedFromOfferProductIds={excludedFromOfferProductIds}
                  />
                ))}
              </div>
            )}
          </>
        )}

    <style>{`
        .description-text {
          max-height: 3em;
          overflow: hidden;
          transition: max-height 0.3s ease-out;
        }
        .description-text.expanded {
          max-height: 1000px;
          transition: max-height 0.5s ease-in;
        } 
        .border-custom {
          border: 1px solid var(--borders-dividers);
        }
        .product-title-desk {
          font-size: var(--heading-h1);
          font-weight: var(--font-semi-bold);
        }
        .product-description {
          font-size: var(--description-font);
          font-weight: var(--font-regular);
          margin-bottom: 10px;
        }
        .desktop-order-again {
          display: block;
        }
        @media (max-width: 768px) {
          .product-description {
            font-size: var(--small-font);
          }
          .desktop-order-again {
            display: none;
          }
      `}</style>
    </div>
  );
};
