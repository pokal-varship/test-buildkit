"use client";
import React, { useCallback, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { TypesenseProduct } from "@services/typesense";
import useLang from "@hooks/useLang";
import { LanguageCode, TranslationKeys } from "types";
import { generateImageBase64FromUrl } from "@lib/helper/ImageGen/imageGen";
import {
  deleteRecentSearch,
  RecentSearchResponse,
} from "@services/recentSearchService";
import { getTenantConfig } from "@config/tenant.config";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import CustomButton from "@components/buttons/Button";
import ShowMoreTextContainer from "@components/ShowMoreTextContainer";
import formatCurrency from "@lib/helper/price";
import Icon from "@components/image/Icons";
import { X_ICON, KCAL_ICON } from "@config/Header/image.config";
import NoProductPlaceholderIcon from "@components/icons/NoProductPlaceholderIcon";
import StarIcon from "@components/icons/Star";
import useProductUrl from "@hooks/useProductUrl";
import DietaryIndicator from "@components/ui/DietaryIndicator";
import NoDataPlaceholder from "@components/no-data-placeholder/no-data-placeholder";
import { useStoreDataBootstrap } from "@app/StoreDataProvider";

interface SearchResultsProps {
  products: TypesenseProduct[];
  loading: boolean;
  totalFound: number;
  visible: boolean;
  onAddToCart?: (product: TypesenseProduct) => void;
  recentData: RecentSearchResponse | null;
  showResults: boolean;
  onRecentSelection: (data: string) => void;
  inputData: string;
  fetchRecentSearchSuggestions: (
    params: {
      skip?: number;
      limit?: number;
      menuId?: string | null;
      q?: string;
    },
    storeId: string,
  ) => Promise<void>;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  products,
  loading,
  visible,
  recentData,
  showResults,
  onRecentSelection,
  inputData,
  fetchRecentSearchSuggestions,
}) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const storeSlug = useSelector(
    (state: RootState) => state.store?.currentStore?.slug,
  );
  const storeId = useSelector(
    (state: RootState) => state.store?.currentStore?.id,
  );
  const params = useParams<{ storeSlug?: string | string[] }>();
  const paramsStoreSlug = Array.isArray(params?.storeSlug)
    ? params.storeSlug[0]
    : params?.storeSlug;
  const resolvedStoreSlug = storeSlug || paramsStoreSlug;
  const { bootstrapStore } = useStoreDataBootstrap();
  const { getSearchProductUrl } = useProductUrl();
  const searchParams = useSearchParams();
  const menuId = searchParams?.get("menu_id") || "";
  const tenantConfig = getTenantConfig();
  const [expandedProductId, setExpandedProductId] = useState<string | null>(
    null,
  );

  const resolveStoreId = useCallback(async () => {
    if (storeId) return storeId;
    const bootstrappedStore = await bootstrapStore(paramsStoreSlug);
    return bootstrappedStore?.id || "";
  }, [bootstrapStore, paramsStoreSlug, storeId]);

  if (!visible && !showResults) return null;

  const handleDeleteRecentSearch = async (id: string) => {
    try {
      const effectiveStoreId = await resolveStoreId();
      if (!effectiveStoreId) return;

      await deleteRecentSearch(effectiveStoreId, id);
      fetchRecentSearchSuggestions({ menuId: menuId }, effectiveStoreId);
    } catch {
      // Handle silently
    }
  };

  return (
    <div className="search-results-container">
      {inputData.length < 3 && recentData?.data?.length && (
        <>
          <div className="search-results-header pl-3 pt-3">
            <h4>{lang.recentSearches}</h4>
          </div>
          {recentData.data.map((data: { id: string; searchQuery: string }) => (
            <div
              key={data.id}
              className="flex justify-between items-center recent-search-item cursor-pointer"
            >
              <div
                className="search-result-item search-result-item-recent"
                onClick={() => onRecentSelection(data.searchQuery)}
              >
                {data.searchQuery}
              </div>
              <Icon
                icon={`${X_ICON}#cross`}
                width={16}
                height={16}
                color="var(--primary-text)"
                className="mr-2 cursor-pointer"
                viewBox="0 0 24 24"
                onClick={() => handleDeleteRecentSearch(data.id)}
              />
            </div>
          ))}
        </>
      )}

      {inputData.length >= 3 && (
        <div>
          {loading ? (
            <div className="search-results-loading">{lang.loading}</div>
          ) : products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.id}
                className="search-result-item xl:gap-10 gap-5 border-b border-[var(--rating-border-primary)]"
              >
                <div className="product-info">
                  <Link
                    href={getSearchProductUrl(product, resolvedStoreSlug)}
                    prefetch={true}
                  >
                    <DietaryIndicator
                      containsMeat={!!product?.productAttributes?.containsMeat}
                      containerClassName="items-center justify-center"
                      imageClassName="w-4 h-4"
                    />
                    <div className="product-name">{product.name.en}</div>

                    <div className="flex items-center gap-1 mt-1">
                      {!!product.overallRatings?.average ||
                      !!product.overallRatings?.totalReview ? (
                        <div className="flex items-center text-[var(--secondary-text)] mb-1">
                          {!!product.overallRatings?.average && (
                            <>
                              <StarIcon />
                              <span className="ml-1 md-heading-6">
                                {Number(product.overallRatings.average).toFixed(
                                  2,
                                )}
                              </span>
                            </>
                          )}
                          {!!product.overallRatings?.average &&
                            product.overallRatings?.totalReview && (
                              <span className="mx-1">|</span>
                            )}
                          {!!product.overallRatings?.totalReview && (
                            <span className="md-heading-6">
                              {product.overallRatings.totalReview}{" "}
                              {lang.reviews}
                            </span>
                          )}
                        </div>
                      ) : null}

                      {(() => {
                        const calories =
                          product?.nutritionInfo?.values?.calories;
                        const hasRatingOrReviews = !!(
                          product.overallRatings?.average ||
                          product.overallRatings?.totalReview
                        );
                        return (
                          tenantConfig.showCaloriesInfo &&
                          !!calories && (
                            <div className="flex items-center gap-1 mb-1">
                              {hasRatingOrReviews && (
                                <span className="self-center text-sm h-1 w-1 rounded-full bg-[var(--secondary-text)]"></span>
                              )}
                              <img
                                src={`${KCAL_ICON}#kcal`}
                                alt="kcal"
                                className="w-[14px] h-[14px]"
                                width={14}
                                height={14}
                              />
                              <span className="text-[var(--secondary-text)] extra-small-font md-heading-6">
                                {calories} {lang.kcal}
                              </span>
                            </div>
                          )
                        );
                      })()}
                    </div>
                    {!!product.discountedPrice ? (
                      <div className="product-price">
                        {tenantConfig.showStrikethroughPrice && (
                          <span className="original-price">
                            {formatCurrency({ amount: product.basePrice })}
                          </span>
                        )}
                        <span className="discounted-price">
                          {formatCurrency({ amount: product.discountedPrice })}
                        </span>
                      </div>
                    ) : (
                      <div className="product-price">
                        {formatCurrency({ amount: product.basePrice })}
                      </div>
                    )}
                  </Link>

                  {!!product?.description?.en?.length && (
                    <div className="product-description-wrapper">
                      <ShowMoreTextContainer
                        isHtml={true}
                        description={product.description.en || ""}
                        className="font-normal small-font mt-2 text-[var(--secondary-text)]"
                        showLessClassName="text-[var(--primary-text)!important] mt-1 text-[var(--accent-color)]"
                        showMoreClassName="text-[var(--primary-text)!important] show-more-gradient text-[var(--accent-color)]"
                        showLessButtonText="less"
                        showMoreButtonText="more"
                        isExpanded={expandedProductId === product.id}
                        onExpandedChange={(expanded: boolean) => {
                          setExpandedProductId(expanded ? product.id : null);
                        }}
                      />
                    </div>
                  )}
                </div>

                <Link
                  href={getSearchProductUrl(product, storeSlug)}
                  className="product-image-container"
                  prefetch={true}
                >
                  <img
                    fetchPriority="high"
                    title={product.name?.en}
                    src={
                      generateImageBase64FromUrl({
                        url:
                          product.media?.[0]?.url ||
                          tenantConfig.productPlaceholderImageUrl ||
                          "",
                        width: 80,
                        height: 80,
                      })?.fullEncodedUrl || ""
                    }
                    alt={product.name?.en || "Product"}
                    width={80}
                    height={80}
                    className="product-image"
                  />
                  <CustomButton className="add-to-cart-button">
                    <span className="add-to-order">{lang.addToCart}</span>
                  </CustomButton>
                </Link>
              </div>
            ))
          ) : (
            <NoDataPlaceholder
              title={lang.NoProductsFound}
              subtitle={
                <>
                  {lang.weCannotFindWhatYouAreLookingFor}
                  <br />
                  {lang.pleaseCheckYourSearchQuery}
                </>
              }
              imageWidth={140}
              imageHeight={140}
              image={
                <NoProductPlaceholderIcon width={140} height={140} color="var(--primary-color)" />
              }
              regionLabel="No search results"
              className="w-full h-[65vh] text-center p-4 border-none"
              titleClassName="md-heading-4"
              subtitleClassName="md-heading-5"
            />
          )}
        </div>
      )}

      <style>{`
        .search-results-container {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          width: 75%;
          justify-self: end;
          background: var(--cards-containers, var(--primary-background));
          color: var(--primary-text);
          border-radius: 10px;
          margin-top: 6px;
          box-shadow: 0 4px 12px var(--box-shadow-primary);
          z-index: 999;
          max-height: 65vh;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--primary-color) transparent;
        }
        .search-results-container::-webkit-scrollbar { width: 6px; }
        .search-results-container::-webkit-scrollbar-thumb { background: var(--primary-color); border-radius: 6px; }

        .search-result-item {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 10px 0;
          margin: 0 12px;
        }
        .search-result-item:last-child { border-bottom: none; }

        .product-info {
          flex: 1;
          min-width: 0;
        }
        .product-name {
          font-weight: var(--font-semi-bold);
          font-size: var(--description-font);
          margin-bottom: 4px;
        }
        .product-price {
          font-weight: var(--font-regular);
          margin-bottom: 6px;
        }
        .original-price {
          color: var(--secondary-text);
          text-decoration: line-through;
          margin-right: 6px;
        }
        .discounted-price {
          color: var(--primary-text);
        }

        .product-image-container {
          flex-shrink: 0;
          width: 96px;
          height: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .product-image {
          width: 96px;
          height: 96px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 6px;
        }

        .add-to-cart-button {
          font-size: var(--small-font) !important;
          font-weight: var(--font-bold) !important;
          border-radius: 6px !important;
          min-width: 80px !important;
          height: 35px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          white-space: nowrap !important;
        }
        .add-to-cart-button:hover {
          background-color: var(--primary-color) !important;
        }

        .recent-search-item {
          border-bottom: 1px solid var(--rating-border-primary);
        }

        .show-more-gradient {
          background: linear-gradient(270deg, var(--cards-containers) 80%, transparent);
        }

        @media (max-width: 768px) {
          .search-results-container {
            position: fixed;
            top: 60px;
            left: 4%;
            right: 4%;
            width: 92%;
            max-height: 70vh;
            border-radius: 12px;
          }
          .search-result-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          .product-image-container {
            width: 100%;
            height: auto;
          }
          .product-image {
            width: 100%;
            height: 160px;
          }
          .add-to-cart-button {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchResults;
