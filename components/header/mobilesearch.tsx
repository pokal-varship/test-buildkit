"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CROSS_ICON,
  KCAL_ICON,
  SEARCH_ICON,
} from "@config/Header/image.config";
import useLang from "@hooks/useLang";
import { useTypesenseProducts } from "@hooks/products/usetypesenseproducts";
import { TypesenseProduct } from "@services/typesense";
import { useParams, useSearchParams } from "next/navigation";
import { LanguageCode, TranslationKeys } from "types";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import { generateImageBase64FromUrl } from "@lib/helper/ImageGen/imageGen";
import {
  deleteRecentSearch,
  RecentSearchPayload,
  RecentSearchResponse,
} from "@services/recentSearchService";
import { getTenantConfig } from "@config/tenant.config";
import StarIcon from "@components/icons/Star";
import CustomButton from "@components/buttons/Button";
import Icon from "@components/image/Icons";
import formatCurrency from "@lib/helper/price";
import SmartTruncatedText from "@components/ui/SmartTruncatedText";
import NoDataPlaceholder from "@components/no-data-placeholder/no-data-placeholder";
import useProductUrl from "@hooks/useProductUrl";
import useAnalytics from "@hooks/useAnalytics";
import { selectIsQrFlowActive } from "@redux/slices/qrFlowSlice";
import { DINE_IN_ANALYTICS_CONTEXT } from "@lib/analytics/dineInAnalytics";
import DietaryIndicator from "@components/ui/DietaryIndicator";
import { useStoreDataBootstrap } from "@app/StoreDataProvider";
import { buildHeaderProductSearchRequest } from "../../utils/typesenseRetailCatalog";

interface MobileSearchProps {
  visible: boolean;
  onClose: () => void;
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
  triggerRecentSearch: (
    payload: RecentSearchPayload,
    storeId: string,
    token?: string,
  ) => Promise<void>;
}

const MobileSearch: React.FC<MobileSearchProps> = ({
  visible,
  onClose,
  fetchRecentSearchSuggestions,
  triggerRecentSearch,
  recentData,
}) => {
  const storeId = useSelector(
    (state: RootState) => state.store.currentStore?.id,
  );
  const storeAccountType = useSelector(
    (state: RootState) => state.store.currentStore?.accountType,
  );
  const homePageStoreData = useSelector(
    (state: RootState) => state.homePage?.storeData?.data,
  );
  const catalogAccountType = useMemo(() => {
    return (
      storeAccountType ||
      (Array.isArray(homePageStoreData)
        ? homePageStoreData[0]?.accountType
        : undefined)
    );
  }, [storeAccountType, homePageStoreData]);
  const storeSlug = useSelector(
    (state: RootState) => state.store.currentStore?.slug,
  );
  const params = useParams<{ storeSlug?: string | string[] }>();
  const paramsStoreSlug = Array.isArray(params?.storeSlug)
    ? params.storeSlug[0]
    : params?.storeSlug;
  const { bootstrapStore } = useStoreDataBootstrap();
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const { products, loading, multiSearch } = useTypesenseProducts({ storeId });
  const { getSearchProductUrl } = useProductUrl();
  const searchParams = useSearchParams();
  const menuId = searchParams?.get("menu_id") || "";
  const [inputData, setInputData] = useState<string>("");
  const [localProducts, setLocalProducts] = useState<TypesenseProduct[]>([]);
  // const [localCount, setLocalCount] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<
    Record<string, boolean>
  >({});
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tenantConfig = getTenantConfig();
  const { trackProductSearched } = useAnalytics();
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const dineInTrackExtra = isQrFlowActive ? DINE_IN_ANALYTICS_CONTEXT : undefined;

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

  const toggleDescription = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking the More button
    setExpandedDescriptions((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleSearch = async () => {
    const payloadTS = buildHeaderProductSearchRequest({
      q: inputData,
      menuId,
      accountType: catalogAccountType,
    });

    await multiSearch([payloadTS]);

    // Analytics: Product Searched (navbar - mobile)
    if (inputData.trim().length > 0) {
      await trackProductSearched(inputData.trim(), "navbar", dineInTrackExtra);
    }
    setShowResults(true);
  };

  // Close modal after Link navigation
  const handleLinkClick = () => {
    setTimeout(() => {
      onClose();
    }, 2500);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visible, onClose]);

  // Manage body class for mobile search state
  useEffect(() => {
    if (visible) {
      document.body.classList.add("mobile-search-open");
    } else {
      document.body.classList.remove("mobile-search-open");
    }

    return () => {
      document.body.classList.remove("mobile-search-open");
    };
  }, [visible]);

  // Handle search with debouncing
  useEffect(() => {
    if (inputData.length >= 3) {
      // Clear any existing timeout to implement debouncing
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      // Set a new timeout that will trigger the search after 500ms of inactivity
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch();
        handleSuggesstions(inputData);
      }, 500);
      // Cleanup function to clear the timeout if the component unmounts or inputData changes again
      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    } else {
      setLocalProducts([]);
      // setLocalCount(0);
    }
  }, [inputData]);

  useEffect(() => {
    if (products && products.length > 0) {
      setLocalProducts(products);
      // setLocalCount(totalFound);
    }
  }, [products]);

  if (!visible) return null;

  // const handleATC = (e: React.MouseEvent<HTMLButtonElement>) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  // };

  const handleDeleteRecentSearch = async (id: string) => {
    try {
      const effectiveStoreId = await resolveStoreId();
      if (!effectiveStoreId) return;

      await deleteRecentSearch(effectiveStoreId, id);
      fetchRecentSearchSuggestions(
        {
          menuId: menuId,
        },
        effectiveStoreId,
      );
    } catch {}
  };

  return (
    <div className="mobile-search-overlay" ref={searchContainerRef}>
      <div className="mobile-search-container">
        <div className="search-input-wrapper">
          <Icon
            icon={`${CROSS_ICON}#cross`}
            width={30}
            height={30}
            color={"var(--primary-text)"}
            className="contact-icon-mobile pr-3"
            viewBox="0 0 17 17"
            onClick={onClose}
          />
          {/* <img title="Arrow Left" src={CIRCLE_ARROW_LEFT_IMAGE} alt="arrow left" width={100} height={100} className='w-[35px] pr-3' /> */}
          <div className="custom-search-input">
            <Icon
              icon={`${SEARCH_ICON}#search-icon`}
              width={20}
              height={20}
              color={"var(--primary-text)"}
              className="contact-icon-mobile mt-[-4px]"
              viewBox="0 0 21 20"
            />
            <input
              type="text"
              placeholder={lang.searchItems}
              className="search-input"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              autoFocus
              onFocus={handleSuggesstionsGet}
            />
            {!!inputData && (
              <Icon
                icon={`${CROSS_ICON}#cross`}
                width={16}
                height={16}
                color={"var(--primary-text)"}
                viewBox="0 0 16 16"
                className="clear-icon"
                onClick={() => setInputData("")}
              />
            )}
          </div>
        </div>
        {inputData.length < 3 && (
          <div className="flex-1 flex flex-col p-[4px_16px]">
            <div className="search-results-header">
              <span>Recent Searches</span>
            </div>
            {recentData?.data && recentData.data.length > 0 ? (
              <div className="search-results-list">
                {recentData.data.map(
                  (item: { id: string; searchQuery: string }) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center recent-search-item"
                    >
                      <div
                        className="search-result-item"
                        onClick={() => setInputData(item.searchQuery)}
                      >
                        {item.searchQuery}
                      </div>
                      <Icon
                        icon={`${CROSS_ICON}#cross`}
                        width={10}
                        height={10}
                        color={"var(--primary-text)"}
                        className="ml-2"
                        viewBox="0 0 16 16"
                        onClick={() => handleDeleteRecentSearch(item.id)}
                      />
                    </div>
                  ),
                )}
              </div>
            ) : recentData !== null ? (
              <div className="flex-1 flex items-center justify-center p-[0px_16px]">
                <NoDataPlaceholder
                  title={lang.thereIsNothingHere}
                  subtitle={
                    <>
                      {lang.weCannotFindWhatYouAreLookingFor}
                      <br />
                      {lang.pleaseCheckYourSearchQuery}
                    </>
                  }
                  imageSrc="/images/no-product.svg"
                  imageAlt="No recent searches"
                  imageWidth={80}
                  imageHeight={80}
                  className="text-center p-[0] border-none"
                />
              </div>
            ) : null}
          </div>
        )}
        {inputData.length >= 3 && showResults && (
          <div className="mobile-search-results pl-3">
            {/* {!!localCount && <div className="search-results-header">
              <span>{localCount} {lang.Results}</span>
            </div>} */}
            <div
              className={`search-results-list pr-3 pr:md-0 ${!localProducts.length && "mt-[75px]"}`}
            >
              {loading ? (
                <div className="search-results-loading">{lang.loading}</div>
              ) : localProducts.length > 0 ? (
                localProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={getSearchProductUrl(product, storeSlug)}
                    className="flex justify-between items-center py-4 border-b border-[var(--rating-border-primary)]"
                    onClick={handleLinkClick}
                    prefetch={true}
                  >
                    <div className="product-info">
                      <DietaryIndicator
                        containsMeat={
                          !!product?.productAttributes?.containsMeat
                        }
                        containerClassName="items-center justify-center"
                        imageClassName="w-3 h-3"
                      />
                      <div className="product-name line-clamp-2 leading-[1.2]">
                        {product.name.en}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {!!product.overallRatings?.average ||
                        !!product.overallRatings?.totalReview ? (
                          <div className="flex items-center text-[var(--secondary-text)] leading-[0.5px] mb-1 font-400">
                            {!!product.overallRatings?.average && (
                              <>
                                <StarIcon />
                                <span className="mx-1 heading-6">
                                  {Number(
                                    product.overallRatings.average,
                                  ).toFixed(2)}
                                </span>
                              </>
                            )}
                            {!!product.overallRatings?.totalReview && (
                              <span
                                className="heading-6"
                                style={{ fontSize: "var(--extraSmall-font)" }}
                              >
                                ({product.overallRatings.totalReview}{" "}
                                {lang.reviews})
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
                              <div className="flex items-center gap-1 mb-1 font-400">
                                {hasRatingOrReviews && (
                                  <span className="self-center text-sm h-1 w-1 rounded-full bg-[var(--secondary-text)]"></span>
                                )}
                                <img
                                  src={`${KCAL_ICON}#kcal`}
                                  alt="kcal"
                                  className="w-[14px] h-[14px]"
                                  width={10}
                                  height={12}
                                />
                                <span className="text-[var(--secondary-text)] heading-6">
                                  {calories} {lang.kcal}
                                </span>
                              </div>
                            )
                          );
                        })()}
                      </div>
                      {!!product.discountedPrice ? (
                        <div className="flex">
                          {tenantConfig.showStrikethroughPrice && (
                            <div className="product-price original-price">
                              {formatCurrency({ amount: product.basePrice })}
                            </div>
                          )}
                          <div className="product-price discounted-price">
                            {formatCurrency({
                              amount: product.discountedPrice,
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="product-price">
                          {formatCurrency({ amount: product.basePrice })}
                        </div>
                      )}
                      {product?.description?.en?.length && (
                        <SmartTruncatedText
                          text={product?.description?.en}
                          maxLines={2}
                          className="description-inline-container heading-6 text-[var(--primary-text)] mt-2 font-400"
                          expandedDescriptions={expandedDescriptions}
                          productId={product.id}
                          onToggle={toggleDescription}
                        />
                      )}
                    </div>
                    <div className="flex w-[100px] flex-wrap justify-center pl-2">
                      {product.media?.[0]?.url ? (
                        <img
                          fetchPriority="high"
                          title={product.name?.en}
                          src={
                            generateImageBase64FromUrl({
                              url: product.media?.[0]?.url,
                              width: 100,
                              height: 100,
                            })?.fullEncodedUrl || ""
                          }
                          alt={product.name?.en}
                          width={100}
                          height={100}
                          className="object-cover rounded-[10px] overflow-hidden"
                        />
                      ) : (
                        <img
                          fetchPriority="high"
                          title={product.name?.en}
                          src={
                            generateImageBase64FromUrl({
                              url:
                                tenantConfig.productPlaceholderImageUrl || "",
                              width: 100,
                              height: 100,
                            })?.fullEncodedUrl || ""
                          }
                          alt={product.name?.en || "Placeholder Product Image"}
                          width={100}
                          height={100}
                          className="object-cover rounded-[10px] overflow-hidden"
                        />
                      )}
                      <CustomButton className="!p-2 mt-[-9px] w-[85%!important] bg-[var(--primary-color)!important] rounded-[5px!important] extra-small-font">
                        <span className="text-[var(--primary-text-light)] font-700 text-nowrap">
                          {lang.addToCart}
                        </span>
                      </CustomButton>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="w-full h-[min-content] text-center p-4 flex flex-wrap justify-center items-center content-center">
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
                  <p className="font-[var(--font-regular)] text-[var(--secondary-text)] text-xs">
                    We cannot find what are you looking for.
                    <br />
                    Please check your search query.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .add-to-order {
          padding: 0!important;
          margin: 0!important;
          color: black;
          font-size: calc(var(--extraSmall-font) - 1px)!important;
        }
        .clear-icon {
          width: 10px;
          margin-right: 5px;
        }
        .mobile-search-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--cards-containers);
          z-index: 2300;
          display: flex;
          flex-direction: column;
        }

        .mobile-search-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .search-input-wrapper {
          width: 100%;
          background-color: var(--primary-background);
          border-top: 1px solid var(--borders-dividers);
          border-bottom: 1px solid var(--borders-dividers);
          display: flex;
          padding: 16px 10px 16px 17px;
          align-items: center;
        }
        
        .custom-search-input {
          display: flex;
          align-items: center;
          border: 1px solid var(--borders-dividers);
          border-radius: 8px;
          padding: 8px;
          background-color: var(--cards-containers);
          width: 100%;
          font-family: var(--font-family);
        }
        
        .search-input {
          flex: 1;
          padding: 0px 10px 0px 10px;
          border: none;
          outline: none;
          color: var(--primary-text);
          background-color: transparent;
          font-family: var(--font-family);
          font-weight: var(--font-regular);
          font-size: var(--description-font);
        }
        
        .search-icon {
          width: 16px;
          height: auto;
          margin: 0 0 0 5px;
        }

        .mobile-search-results {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          padding: 0 0 0 16px;
          background-color: var(--cards-containers);
        }

        .search-results-header {
          padding: 10px 5px 0 0;
          font-weight: var(--font-bold);
          font-size: var(--description-font, 14px);
        }

        .search-results-list {
          flex: 1;
          overflow-y: auto;
        }

        .search-result-item {
          display: flex;
          justify-content: space-between;
          align-items: start;
          padding: 10px 0;
          cursor: pointer;
          font-weight: var(--font-regular);
          // border-bottom: 1px solid var(--borders-dividers, #e5e5e5);
        }

        .search-result-item:last-child {
          border-bottom: none;
        }

        .product-info {
          display: flex;
          flex-direction: column;
          width: 65%;
        }

        .product-name {
          font-weight: var(--font-semi-bold);
          font-size: var(--description-font);
        }

        .product-price {
          font-size: var(--description-font);
          font-weight: var(--font-semi-bold);
        }
        
        .original-price {
          color: var(--secondary-text);
          text-decoration-line: line-through;
          margin-right: 8px;
          font-weight: var(--font-regular);
          }
          
        .discounted-price {
            color: var(--primary-text);
            font-weight: var(--font-semi-bold);
        }

        .add-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid var(--warning, #FF6B00);
          background-color: transparent;
          color: var(--warning, #FF6B00);
          cursor: pointer;
          transition: background-color 0.2s, color 0.2s;
        }

        .add-button:hover {
          background-color: var(--primary-color, #FF6B00);
          color: var(--white);
        }

        .plus-icon {
          font-size: var(--heading-h4);
          line-height: 1;
        }

        .search-results-loading,
        .search-results-empty {
          padding: 16px;
          text-align: center;
          color: var(--secondary-text, #666);
          font-size: var(--description-font, 14px);
        }
        
        .description-container {
          position: relative;
          transition: all 0.3s ease;
        }
        
        .description-container div {
          transition: max-height 0.3s ease, opacity 0.2s ease;
        }

        .description-inline-container {
          position: relative;
          display: inline;
        }

        .more-text-inline {
          color: var(--accent-color);
          font-weight: var(--font-medium);
          display: inline;
        }

        .recent-search-item {
          border-bottom: 1px solid var(--borders-dividers, #e5e5e5);
        }
      `}</style>
    </div>
  );
};

export default MobileSearch;
