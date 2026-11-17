"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useWishlist } from "@hooks/useWishlist";
import {
  selectUniqueWishlistItemCount,
  selectRawWishlistData,
} from "@redux/slices/wishlistSlice";
import { LocationBar } from "@components/products/LocationBar";
import { ToggleView } from "@components/products/ToggleView";
import { SortBar, SortBarFilters } from "@components/products/SortBar";
import { useSelector } from "react-redux";
import { selectViewMode } from "@redux/slices/productViewSlice";
import { RootState } from "@redux/store";
import { ProductCardGrid } from "@components/products/ProductCardGrid";
import { ProductCardList } from "@components/products/ProductCardList";
import { FilterContainer } from "@components/products/filters/FilterContainer";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import useCategories from "@hooks/storepage/useCategories";
import { Category } from "@components/type/store.types";
import {
  TypesenseProduct,
  DiscountOffer,
  TypesenseSearchParams,
} from "@services/typesense";
import { selectCart } from "@redux/slices/cartSlice";
import { CartItem } from "@services/storePage";
import { setCookie } from "@lib/cookie";
import { fetchOffers } from "@services/offerService";
import useProductUrl from "@hooks/useProductUrl";
import useLang from "@hooks/useLang";
import { multiSearchProducts } from "@services/typesense/productService";
import {
  buildCommonFilterParts,
  buildProductIdFilter,
  DEFAULT_CALORIE_MIN,
  DEFAULT_CALORIE_MAX,
} from "../../utils/typesenseFilterBuilder";
import {
  getProductKindForAccountType,
  shouldUseRetailCatalogSearch,
} from "../../utils/typesenseRetailCatalog";
import WishlistHeartIcon from "@components/icons/WishlistHeartIcon";
import { useStoreDataBootstrap } from "@app/StoreDataProvider";
import { MENU_CARD_ICON } from "@config/Header/image.config";
import Icon from "@components/image/Icons";

const WishlistListing: React.FC = () => {
  const { wishlistLoading } = useWishlist();
  const rawWishlistData = useSelector(selectRawWishlistData);
  const viewMode = useSelector(selectViewMode);
  const uniqueWishlistCount = useSelector(selectUniqueWishlistItemCount);
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeSlug = params?.storeSlug as string;
  const menuId = params?.menuSlug as string;
  // Match PLP: "all-day" is a route placeholder, not a real menu — omit from categories API
  const menuSlug = menuId === "all-day" ? "" : menuId;
  const [menu, setMenu] = useState<boolean>(false);
  const cartData = useSelector(selectCart).cartData;
  const [offers, setOffers] = useState<DiscountOffer[]>([]);
  const { getProductUrl } = useProductUrl();
  const [lang] = useLang();
  const currentStore = useSelector(
    (state: RootState) => state.store.currentStore,
  );
  const homePageStoreData = useSelector(
    (state: RootState) => state.homePage?.storeData?.data,
  );
  const storeId = currentStore?.id || "";
  const catalogAccountType = useMemo(() => {
    return (
      currentStore?.accountType ||
      (Array.isArray(homePageStoreData)
        ? homePageStoreData[0]?.accountType
        : undefined)
    );
  }, [currentStore?.accountType, homePageStoreData]);
  const isRetailCatalog = shouldUseRetailCatalogSearch(catalogAccountType);
  const { bootstrapStore } = useStoreDataBootstrap();
  const [filteredProducts, setFilteredProducts] = useState<TypesenseProduct[]>(
    [],
  );
  const [filteringLoading, setFilteringLoading] = useState<boolean>(false);
  const [categoryCountsFromFacets, setCategoryCountsFromFacets] = useState<
    Record<string, number>
  >({});

  // Menu handlers
  const handleMenuOpen = useCallback(() => setMenu(true), []);
  const handleMenuClose = useCallback(() => setMenu(false), []);

  // Fetch categories for the sidebar
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    fetchCategories,
  } = useCategories();

  useEffect(() => {
    if (!storeId && storeSlug) {
      void bootstrapStore(storeSlug);
    }
  }, [bootstrapStore, storeId, storeSlug]);

  useEffect(() => {
    if (storeSlug) {
      fetchCategories(menuSlug, storeSlug);
    }
  }, [menuSlug, storeSlug]); //eslint-disable-line react-hooks/exhaustive-deps

  // Parse filters from URL
  const parseFiltersFromUrl = useMemo((): SortBarFilters => {
    const dietaryRestrictions =
      searchParams?.get("dietaryRestrictions")?.split(",").filter(Boolean) ||
      [];
    const offer = searchParams?.get("offer")?.split(",").filter(Boolean) || [];
    const calorieMin =
      Number(searchParams?.get("calorieMin")) || DEFAULT_CALORIE_MIN;
    const calorieMax =
      Number(searchParams?.get("calorieMax")) || DEFAULT_CALORIE_MAX;
    const vegetarianFilter = searchParams?.get("vegetarianFilter") || "non-veg";
    return {
      dietaryRestrictions,
      calorieRange: [calorieMin, calorieMax],
      vegetarianFilter,
      offer,
    };
  }, [searchParams]);

  const [currentFilters, setCurrentFilters] =
    useState<SortBarFilters>(parseFiltersFromUrl);

  // Fetch offers
  useEffect(() => {
    const getOffers = async () => {
      if (storeSlug) {
        try {
          const offerResponse = await fetchOffers(storeSlug);
          setOffers(offerResponse.data);
        } catch {
          // Error handled silently
        }
      }
    };
    getOffers();
  }, [storeSlug]);

  // Sync filter state with URL changes
  useEffect(() => {
    setCurrentFilters(parseFiltersFromUrl);
  }, [parseFiltersFromUrl]);

  // Handle filter changes from SortBar and update URL
  const handleFilterChange = useCallback(
    (filters: SortBarFilters) => {
      setCurrentFilters(filters);
      const params = new URLSearchParams(searchParams?.toString() || "");

      // Update dietary restrictions
      if (filters.dietaryRestrictions.length > 0) {
        params.set(
          "dietaryRestrictions",
          filters.dietaryRestrictions.join(","),
        );
      } else {
        params.delete("dietaryRestrictions");
      }

      // Update offers
      if (filters.offer && filters.offer.length > 0) {
        params.set("offer", filters.offer.join(","));
      } else {
        params.delete("offer");
      }

      // Update calorie range
      if (filters.calorieRange[0] !== DEFAULT_CALORIE_MIN) {
        params.set("calorieMin", filters.calorieRange[0].toString());
      } else {
        params.delete("calorieMin");
      }
      if (filters.calorieRange[1] !== DEFAULT_CALORIE_MAX) {
        params.set("calorieMax", filters.calorieRange[1].toString());
      } else {
        params.delete("calorieMax");
      }

      // Update vegetarian filter
      if (filters.vegetarianFilter === "") {
        params.set("vegetarianFilter", "veg");
      } else {
        params.delete("vegetarianFilter");
      }

      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router],
  );

  // Get product URL with optional cart item params
  const getWishlistProductUrl = useCallback(
    (product: TypesenseProduct) => {
      const baseUrl = getProductUrl(product, storeSlug);
      if (cartData?.data?.items) {
        const cartItem = cartData.data.items.findLast(
          (item: CartItem) => item.productId === product.productId,
        );
        return `${baseUrl}&rfcEdit=true${
          cartItem ? `&cid=${cartItem.id}` : ""
        }`;
      }
      return baseUrl;
    },
    [getProductUrl, storeSlug, cartData],
  );

  // Handle product click to set cookie before Link navigation
  const handleProductClick = useCallback(
    (product: TypesenseProduct) => {
      setCookie("cartRedirect", getWishlistProductUrl(product));
    },
    [getWishlistProductUrl],
  );

  // Build search params for Typesense filtering (using shared utility)
  // Restaurant/Laundry: existing filters. Retail/Grocery: productKind + storefront price mapping.
  const buildSearchParams = useCallback(
    (filters: SortBarFilters, productIds: string[]): TypesenseSearchParams => {
      const filterParts: string[] = [];

      const productIdFilter = buildProductIdFilter(productIds);
      if (productIdFilter) {
        filterParts.push(productIdFilter);
      }

      if (isRetailCatalog) {
        filterParts.push(
          `productKind:=${getProductKindForAccountType(catalogAccountType)}`,
        );
      } else {
        const commonFilters = buildCommonFilterParts(filters);
        filterParts.push(...commonFilters);
      }

      filterParts.push("status:=ACTIVE");

      if (isRetailCatalog) {
        return {
          q: "*",
          query_by: "name.en,productCategoryName.en,categoryHierarchy,brandName",
          filter_by: filterParts.join(" && "),
          per_page: 100,
          group_by: "name",
          group_limit: 1,
          __retailCatalog: true,
        };
      }

      return {
        q: "*",
        query_by: "name,description",
        filter_by: filterParts.join(" && "),
        per_page: 100,
      };
    },
    [isRetailCatalog, catalogAccountType],
  );

  // Get wishlist product IDs directly from raw wishlist API data (not from converted/enhanced items)
  // This ensures we only use products that are actually in the wishlist API response
  const wishlistProductIds = useMemo(() => {
    if (
      !rawWishlistData ||
      !Array.isArray(rawWishlistData) ||
      rawWishlistData.length === 0
    ) {
      return [];
    }

    // Extract product IDs from raw API data
    // API returns items with 'id', 'productId', or 'product_id' fields
    return rawWishlistData
      .map((item: Record<string, unknown>) => {
        const nested = item.product as Record<string, unknown> | undefined;
        const productId = (item.productId ||
          nested?.productId ||
          nested?.id ||
          item.id ||
          item.product_id) as string;
        return productId;
      })
      .filter((id): id is string => Boolean(id));
  }, [rawWishlistData]);

  // Category counts for sidebar/popup (from facet API). Pass undefined when empty so counts are not shown.
  const categoryProductCountsProp = useMemo(() => {
    const hasCounts = Object.keys(categoryCountsFromFacets).length > 0;
    return hasCounts ? categoryCountsFromFacets : undefined;
  }, [categoryCountsFromFacets]);

  // Favourites (wishlist) count for sidebar/popup.
  const favouriteProductsCountProp = useMemo(
    () => uniqueWishlistCount ?? rawWishlistData?.length ?? 0,
    [uniqueWishlistCount, rawWishlistData?.length],
  );

  // Total "Full Menu" count for sidebar/popup: sum of all category facet counts.
  const fullMenuProductCountProp = useMemo(() => {
    const facetCounts = Object.values(categoryCountsFromFacets);
    const total =
      facetCounts.length > 0
        ? facetCounts.reduce((sum, count) => sum + count, 0)
        : 0;
    return total > 0 ? total : undefined;
  }, [categoryCountsFromFacets]);

  const lastRequestRef = useRef<string>("");
  const requestGenRef = useRef(0);

  // Fetch wishlist products + category counts (facet) in a single multiSearch
  useEffect(() => {
    const fetchData = async () => {
      if (!storeId) return;
      // Wait for wishlist API on hard refresh — otherwise multi_search can run with
      // empty IDs and a stale response can leave Favourites blank after IDs arrive.
      if (wishlistLoading) return;
      // Restaurant/Laundry facet still needs menuSlug; Retail/Grocery does not
      if (!isRetailCatalog && !menuSlug) return;

      const requestKey = `${wishlistProductIds.join(",")}-${JSON.stringify(
        currentFilters,
      )}-${storeId}-${isRetailCatalog ? "retail" : "menu"}`;
      if (lastRequestRef.current === requestKey) return;

      const requestGen = ++requestGenRef.current;
      lastRequestRef.current = requestKey;

      const facetParams: TypesenseSearchParams = isRetailCatalog
        ? {
            per_page: 0,
            filter_by: [
              `productKind:=${getProductKindForAccountType(catalogAccountType)}`,
              "status:=ACTIVE",
            ].join(" && "),
            facet_by: "productCategorySlug",
            max_facet_values: 50,
            __retailCatalog: true,
          }
        : {
            per_page: 0,
            filter_by: [
              ...buildCommonFilterParts(currentFilters),
              `linkedMenus.menuSlug:=${menuSlug}`,
              "status:=ACTIVE",
            ].join(" && "),
            facet_by: "productCategorySlug",
            max_facet_values: 50,
          };

      const searchRequests: TypesenseSearchParams[] =
        wishlistProductIds.length > 0
          ? [buildSearchParams(currentFilters, wishlistProductIds), facetParams]
          : [facetParams];

      const productResultIndex = wishlistProductIds.length > 0 ? 0 : -1;
      const facetResultIndex = wishlistProductIds.length > 0 ? 1 : 0;

      try {
        if (wishlistProductIds.length > 0) setFilteringLoading(true);

        const results = await multiSearchProducts(searchRequests, storeId);

        // Ignore stale responses from an earlier empty-ids race
        if (requestGen !== requestGenRef.current) return;

        if (productResultIndex >= 0 && results[productResultIndex]?.products) {
          const wishlistProductIdSet = new Set(wishlistProductIds);
          const filtered = results[productResultIndex].products.filter(
            (product: TypesenseProduct) =>
              wishlistProductIdSet.has(product.productId) ||
              wishlistProductIdSet.has(product.id),
          );
          setFilteredProducts(filtered);
        } else {
          // No product query (empty wishlist) or empty hits — clear grid
          setFilteredProducts([]);
        }

        if (results[facetResultIndex]?.facets) {
          const counts: Record<string, number> = {};
          const slugFacet = results[facetResultIndex].facets.find(
            (f: { field_name: string }) =>
              f.field_name === "productCategorySlug",
          );
          slugFacet?.counts?.forEach((c: { value: string; count: number }) => {
            counts[c.value] = c.count;
          });
          setCategoryCountsFromFacets(counts);
        } else {
          setCategoryCountsFromFacets({});
        }
      } catch (error) {
        if (requestGen !== requestGenRef.current) return;
        console.error("Error fetching wishlist/facets:", error);
        setFilteredProducts([]);
        setCategoryCountsFromFacets({});
        lastRequestRef.current = "";
      } finally {
        if (requestGen === requestGenRef.current) {
          setFilteringLoading(false);
        }
      }
    };

    fetchData();
  }, [
    wishlistProductIds,
    currentFilters,
    storeId,
    menuSlug,
    buildSearchParams,
    isRetailCatalog,
    catalogAccountType,
    wishlistLoading,
  ]);

  // Use filtered products from Typesense API
  const wishlistProducts = filteredProducts;

  // Render content based on state (memoized to prevent unnecessary re-renders)
  const renderContent = useMemo(() => {
    const isWaitingForStore = !storeId && !!storeSlug;

    if (isWaitingForStore || wishlistLoading || filteringLoading) {
      return (
        <div className="w-full flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="heading-4 font-semibold mb-2">
              {lang.loadingYourWishlist}
            </h2>
            <p className="text-[var(--secondary-text)]">
              {lang.fetchingCompleteProductDetails}
            </p>
          </div>
        </div>
      );
    }

    if (uniqueWishlistCount === 0) {
      return (
        <div className="w-full flex justify-center items-center min-h-[400px] h-[85vh] md:h-auto">
          <div className="text-center">
            <div className="mb-4">
              <img
                src="/images/icon/wishlist-placeholder.svg"
                alt="Empty Wishlist"
                className="w-32 h-32 md:w-[160px] md:h-[160px] mx-auto "
              />
            </div>
            <h2 className=" text-xl md:text-2xl font-semibold mb-2">
              {lang.nothingSavedYet}
            </h2>
            <p className=" text-sm md:text-base mb-4 flex items-center gap-1 text-[var(--secondary-text)]">
              {lang?.tap}
              <WishlistHeartIcon
                height={16}
                width={16}
                className="animate-pulse"
                color={`var(--wishlist-heart-color)`}
              />
              {lang?.onAnyDishToSaveItHere}
              {/* {lang.startAddingYourFavoriteItemsToYourWishlist} */}
            </p>
            <button
              onClick={() => window.history.back()}
              className=" text-sm md:text-base px-4 py-2 bg-[var(--button-primary-background)] text-[var(--button-primary-text)] rounded-md hover:bg-opacity-90"
            >
              {lang.continueShopping}
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pb-6 pt-4 md:pt-0">
            {wishlistProducts.map((product) => (
              <ProductCardGrid
                key={product.productId}
                product={product}
                productLink={getWishlistProductUrl(product)}
                onProductClick={() => handleProductClick(product)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {wishlistProducts.map((product) => (
              <ProductCardList
                key={product.productId}
                product={product}
                productLink={getWishlistProductUrl(product)}
                onProductClick={() => handleProductClick(product)}
                className="md:w-[90%]"
                showAddButton={true}
              />
            ))}
          </div>
        )}
      </>
    );
  }, [
    uniqueWishlistCount,
    wishlistLoading,
    filteringLoading,
    storeId,
    storeSlug,
    viewMode,
    wishlistProducts,
    handleProductClick,
    getWishlistProductUrl,
    lang,
  ]);

  return (
    <main className="min-h-[100vh] bg-[var(--primary-background)] md:bg-[var(--primary-background)] relative text-[var(--primary-text)] w-full">
      {/* Mobile filter navbar */}
      <div className="md:hidden w-full overflow-x-auto max-width-container bg-[var(--primary-background)] mobile-order-2 fixed top-[69px] z-[5] mobile-filter-navbar">
        <div className="flex">
          <SortBar
            onFilterChange={handleFilterChange}
            currentFilters={currentFilters}
            facets={offers}
            productsCount={wishlistProducts.length}
          />
        </div>
      </div>
      {/* Mobile Layout - Horizontal
      <div className='md:hidden w-full flex items-center justify-between'>
            <h1 className="product-title-mob">Wishlist</h1>
            {!!wishlistProducts?.length && <ToggleView />}
          </div> */}

      {/* Desktop sort bar and toggle section */}
      <div className="relative md:fixed top-[60px] md:top-[76px] md:left-0 md:right-0 md:z-[4] w-full flex md:flex bg-[var(--cards-containers)] mobile-order-3">
        <div className="w-full md:h-[108px] bg-[var(--quaternary-background)] md:bg-[--cards-containers] hidden md:flex flex-col md:flex-row md:justify-between items-start md:items-center pt-2 max-width-container">
          <LocationBar />

          {/* Desktop Layout */}
          <div className="hidden md:flex md:flex-wrap items-center pb-4 lg:pt-11 justify-end">
            <SortBar
              onFilterChange={handleFilterChange}
              currentFilters={currentFilters}
              facets={offers}
            />
            {!!wishlistProducts?.length && <ToggleView />}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full md:!pt-[120px] md:pb-7 flex flex-col md:flex-row-reverse bg-[var(--quaternary-background)] md:bg-[transparent] max-width-container pb-4 pt-[60px]">
        <div className="w-full md:w-[80%] md:pl-4 pl-0">
          <div className="">
            {/* {uniqueWishlistCount > 0 ? (
              <h1 className="text-2xl font-semibold">Wishlist ({wishlistProducts.length} items)</h1>
            ) : (
              <h1 className="text-2xl font-semibold">Wishlist</h1>
            )} */}
            <h1 className="md-heading-1 heading-2 font-semibold md:mb-4">
              {lang.favourites}
            </h1>
          </div>
          {renderContent}
        </div>
        {/* Desktop filter sidebar - hidden on small screens */}
        <div className="hidden md:block md:w-[20%] h-[calc(100vh-120px)] sticky top-[120px]">
          <h2 className="pt-6 heading-h3 pl-4 font-600 pb-8">{lang.menu}</h2>
          <div className="h-[55vh] overflow-y-auto">
            <div className="pr-4 pb-4">
              <FilterContainer
                storeId={storeSlug}
                menuId={menuSlug}
                selectedCat="wishlist"
                loading={categoriesLoading}
                error={categoriesError}
                categories={categories as unknown as { data: Category[] }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button and Slider */}
      <div
        className="md:hidden fixed bottom-[36px] right-[20px]"
        onClick={handleMenuOpen}
        style={{ zIndex: "9" }}
      >
        <Icon
          icon={`${MENU_CARD_ICON}#menu-card`}
          width={60}
          height={67}
          viewBox="0 0 61 68"
          color="var(--accent-color)"
          strokeWidth={0}
        />  
      </div>
      {menu && (
        <div className="menu-wrapper" onClick={handleMenuClose}>
          <div className="menu-slider">
            <div className="h-[100%] overflow-auto">
              <FilterContainer
                storeId={storeSlug}
                menuId={menuSlug}
                selectedCat="wishlist"
                loading={categoriesLoading}
                error={categoriesError}
                categories={categories as unknown as { data: Category[] }}
                categoryProductCounts={categoryProductCountsProp}
                favouriteProductsCount={favouriteProductsCountProp}
                reorderProductsCount={0}
                fullMenuProductCount={fullMenuProductCountProp}
              />
            </div>
          </div>
        </div>
      )}
      <style>{`
        body.mobile-search-open .mobile-filter-navbar,
        body.mobile-menu-open .mobile-filter-navbar {
          opacity: 0 !important;
          pointer-events: none !important;
          z-index: -1 !important;
          visibility: hidden !important;
          display: none !important;
        }
        .product-title-mob {
          font-size: var(--heading-h2);
          font-weight: var(--font-semi-bold);
        }
        .menu-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: #00000040;
          z-index: 50;
        }
        .menu-slider {
          position: fixed;
          z-index: 51;
          bottom: 5vw;
          left: 5vw;
          width: 90vw;
          background-color: var(--cards-containers);
          box-sizing: border-box;
          border-radius: 10px;
          padding: 15px;
        }
      `}</style>
    </main>
  );
};

export default WishlistListing;
