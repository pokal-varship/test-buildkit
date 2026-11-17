"use client";
import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import useCategories from "@hooks/storepage/useCategories";
import { useTypesenseProducts } from "@hooks/products/usetypesenseproducts";
import { Category } from "@components/type/store.types";
import { DiscountOffer, TypesenseSearchParams } from "@services/typesense";
import ProductListingSchema from "@components/schema/ProductListingSchema";
import { ToggleView } from "@components/products/ToggleView";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import { selectCart } from "@redux/slices/cartSlice";
import {
  selectDineInSessionProductCount,
  selectIsQrFlowActive,
  selectSessionId,
  selectQrFlowTableNumber,
} from "@redux/slices/qrFlowSlice";
import { DINE_IN_ANALYTICS_CONTEXT } from "@lib/analytics/dineInAnalytics";
import useDisableBodyScroll from "@hooks/useDisableBodyScroll";
import { fetchOffers } from "@services/offerService";
import { SortBarFilters } from "@components/products/SortBar";
import dynamic from "next/dynamic";
import { useSetPLPUrl } from "@hooks/usePLPUrl";
import { PLPParams } from "@components/order/order.type";
import WishlistListing from "@components/wishlist/WishlistListing";
import { useAuth } from "@hooks/useAuth";
import { useRawWishlist } from "@hooks/useRawWishlist";
import { useReorderProducts } from "@hooks/useReorderProducts";
import { TypesenseProduct } from "@services/typesense";
import { buildCommonFilterParts } from "../../utils/typesenseFilterBuilder";
import {
  buildRetailCatalogSearchRequests,
  shouldUseRetailCatalogSearch,
} from "../../utils/typesenseRetailCatalog";
import { useAnalytics } from "@hooks/useAnalytics";
import { useStoreDataBootstrap } from "@app/StoreDataProvider";
import { useFullMenuCategories } from "@hooks/products/useFullMenuCategories";
import useLang from "@hooks/useLang";
// import AddressBar from '@components/address/AddressBar';
import useMenuModal from "@hooks/useMenuModal";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {
  ARROW_DOWN_HEADER_ICON,
  MENU_CARD_ICON,
  OFFER_DETAIL_ICON,
  OFFER_TYPE_ICON,
} from "@config/Header/image.config";
import Icon from "@components/image/Icons";
import {
  formatEntireMenuExcludeBannerText,
  formatOfferBannerSuffixText,
  getOfferTheme,
  selectBannerOffersByFlow,
} from "@lib/offers/selectOffers";
import OfferDetailsModal from "@components/ui/OfferDetailsModal";
import Loader from "@components/loader/Loader";

const SortBar = dynamic(() =>
  import("@components/products/SortBar").then((module) => ({
    default: module.SortBar,
  })),
);
const ProductContainer = dynamic(() =>
  import("@components/products/ProductContainer").then((module) => ({
    default: module.ProductContainer,
  })),
);
const FullMenuContainer = dynamic(() =>
  import("@components/products/FullMenuContainer").then((module) => ({
    default: module.FullMenuContainer,
  })),
);
const FilterContainer = dynamic(() =>
  import("@components/products/filters/FilterContainer").then((module) => ({
    default: module.FilterContainer,
  })),
);
const LocationBar = dynamic(() =>
  import("@components/products/LocationBar").then((module) => ({
    default: module.LocationBar,
  })),
);
const CategoryScrollBar = dynamic(() =>
  import("@components/products/CategoryScrollBar").then((module) => ({
    default: module.CategoryScrollBar,
  })),
);

type RouteParams = {
  store: string;
  category: string;
  menuId: string;
  menuSlug: string;
  storeSlug: string;
  categorySlug: string;
};

interface ProductListingProps {
  catDesc: string;
  catTitle: string;
}

function setPLPUrlFromParams(params: PLPParams) {
  if (
    typeof window !== "undefined" &&
    params &&
    typeof params.city === "string" &&
    typeof params.areaName === "string" &&
    typeof params.storeSlug === "string" &&
    typeof params.menuSlug === "string" &&
    typeof params.categorySlug === "string"
  ) {
    const plpUrl = `/${params.city}/${params.areaName}/${params.storeSlug}/${params.menuSlug}/${params.categorySlug}`;
    localStorage.setItem("lastPLP", plpUrl);
  }
}

// Remove comboStaticProductMap and all logic that injects static products

function ProductListing({ catDesc, catTitle }: ProductListingProps) {
  const params = useParams() as RouteParams;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleOpenMenuModal } = useMenuModal();
  const { bootstrapStore } = useStoreDataBootstrap();
  const storeSlug = params.storeSlug;
  const paramsStoreSlug = params.storeSlug;
  const currentStore = useSelector(
    (state: RootState) => state.store.currentStore,
  );
  const homePageStoreData = useSelector(
    (state: RootState) => state.homePage?.storeData?.data,
  );
  const { cartData } = useSelector(selectCart);
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const qrSessionId = useSelector(selectSessionId);
  const qrFlowTableNumber = useSelector(selectQrFlowTableNumber);
  const qrProductCount = useSelector(selectDineInSessionProductCount);
  // QR flow only: extra bottom padding when MobileCartSummary bar is visible (cart has items)
  const showQrFlowCartSummary = isQrFlowActive && qrProductCount > 0;
  // const qrFlowTableNumber = useSelector(selectQrFlowTableNumber);
  const [lang] = useLang();
  const storeId = useMemo(() => currentStore?.id || "", [currentStore]);
  const storeName = useMemo(() => currentStore?.name || "", [currentStore]);
  /**
   * Resolve store id for PLP search without waiting on currentStore.
   * On hard refresh StoreDataProvider loads the list but may not set currentStore;
   * previously multiSearch bootstrapped it — retail early-return blocked that.
   */
  const resolvedStoreId = useMemo(() => {
    if (
      currentStore?.id &&
      (!paramsStoreSlug || currentStore.slug === paramsStoreSlug)
    ) {
      return currentStore.id;
    }
    if (Array.isArray(homePageStoreData) && paramsStoreSlug) {
      const matched = homePageStoreData.find(
        (s: { slug?: string; id?: string }) => s?.slug === paramsStoreSlug,
      );
      if (matched?.id) return matched.id;
    }
    return storeId;
  }, [currentStore, homePageStoreData, paramsStoreSlug, storeId]);
  /** For QR flow bar: use currentStore if set, else resolve store from homePage data by slug (scan-order doesn't set currentStore). */
  const qrBarStore = useMemo(() => {
    if (currentStore?.slug === paramsStoreSlug) return currentStore;
    if (!Array.isArray(homePageStoreData) || !paramsStoreSlug) return null;
    return (
      homePageStoreData.find(
        (s: { slug?: string }) => s?.slug === paramsStoreSlug,
      ) ?? null
    );
  }, [currentStore, homePageStoreData, paramsStoreSlug]);

  /** accountType from /v1/tenant/store — prefer matched store, else data[0] */
  const catalogStoreMeta = useMemo(() => {
    const matchedStore =
      (currentStore?.slug === paramsStoreSlug ? currentStore : null) ??
      (Array.isArray(homePageStoreData)
        ? (homePageStoreData.find(
            (s: { slug?: string }) => s?.slug === paramsStoreSlug,
          ) ??
          homePageStoreData[0])
        : null) ??
      currentStore;

    return {
      accountType: matchedStore?.accountType,
    };
  }, [currentStore, homePageStoreData, paramsStoreSlug]);

  const isRetailCatalogSearch = shouldUseRetailCatalogSearch(
    catalogStoreMeta.accountType,
  );

  const storeForMenu = qrBarStore ?? currentStore;
  const currentMenuPeriod = useMemo(() => {
    const slug = (params?.menuSlug as string) || "";
    if (!storeForMenu?.menuPeriods?.length || !slug) return null;
    return (
      storeForMenu.menuPeriods.find(
        (p: { slug?: string }) =>
          (p?.slug || "").toLowerCase() === slug.toLowerCase(),
      ) ?? null
    );
  }, [storeForMenu, params?.menuSlug]);

  const menuDisplayName = currentMenuPeriod
    ? (currentMenuPeriod.type
        ?.replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c: string) => c.toUpperCase()) ??
      currentMenuPeriod.slug)
    : null;
  const menuTimingDisplay = currentMenuPeriod
    ? `${currentMenuPeriod.openTime} - ${currentMenuPeriod.closeTime}`
    : null;
  const menuNameAndTiming =
    menuDisplayName && menuTimingDisplay
      ? `${menuDisplayName} - ${menuTimingDisplay}`
      : null;
  const { trackMenuCategoryViewed } = useAnalytics();

  const handleOpenStoreMenuModal = useCallback(() => {
    handleOpenMenuModal({
      availableStores: paramsStoreSlug ? [paramsStoreSlug] : undefined,
      scanOrderMode: true,
      locationDisplayName: storeForMenu?.name ?? undefined,
      redirectToFullMenu: true,
    });
  }, [handleOpenMenuModal, paramsStoreSlug, storeForMenu?.name]);

  // Calculate hasCartItems - updates automatically when cartData changes
  const hasCartItems = !!(
    cartData?.data?.items && cartData.data.items.length > 0
  );

  const category = params.categorySlug;
  const menuId = params.menuSlug as string;
  const menuSlug = menuId === "all-day" ? "" : menuId;
  const [offers, setOffers] = useState<DiscountOffer[]>([]);

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    fetchCategories,
  } = useCategories();

  useEffect(() => {
    if (storeSlug) {
      fetchCategories(menuSlug, storeSlug);
    }
  }, [menuSlug, storeSlug]); //eslint-disable-line react-hooks/exhaustive-deps

  const {
    freebiesOffer: remoteFreebiesOffer,
    minimumSpendOffer,
    entireMenuOffer,
  } = useMemo(
    () => selectBannerOffersByFlow(offers, isQrFlowActive),
    [offers, isQrFlowActive],
  );

  const freebiesBannerText = useMemo(() => {
    if (!remoteFreebiesOffer) return null;
    return formatOfferBannerSuffixText(remoteFreebiesOffer, lang);
  }, [remoteFreebiesOffer, lang]);

  const minimumSpendBannerText = useMemo(() => {
    if (!minimumSpendOffer) return null;
    return formatOfferBannerSuffixText(minimumSpendOffer, lang);
  }, [minimumSpendOffer, lang]);

  const entireMenuBannerText = useMemo(() => {
    if (!entireMenuOffer) return null;
    // const excludeIds = entireMenuOffer.discountConfig.excludeData ?? [];
    // const excludedLabel = excludeIds
    //     .map((id) => {
    //         const cat = categories?.data?.find((c) => c.categoryId === id);
    //         return cat?.displayName?.trim() || cat?.categoryName?.en?.trim() || "";
    //     })
    //     .filter(Boolean)
    //     .join(", ");

    return formatEntireMenuExcludeBannerText(entireMenuOffer, lang);
  }, [entireMenuOffer, lang]);

  const excludedFromOfferProductIds = useMemo(() => {
    const dc = entireMenuOffer?.discountConfig;
    if (!dc || dc.excludeType !== 2 || !dc.isExcludeData) return [];
    return Array.isArray(dc.excludeData) ? dc.excludeData : [];
  }, [entireMenuOffer]);

  const desktopBannerText =
    freebiesBannerText ??
    entireMenuBannerText ??
    minimumSpendBannerText ??
    null;
  const desktopBannerLabel = "";
  const desktopTopPaddingClass = desktopBannerText
    ? isQrFlowActive
      ? "!pt-[145px] md:!pt-[145px]"
      : "!pt-[100px] md:!pt-[156px]"
    : "md:!pt-[120px]";
  const desktopSidebarStickyClass = desktopBannerText
    ? "top-[210px] h-[calc(100vh-210px)]"
    : "top-[178px] h-[calc(100vh-180px)]";

  const desktopBannerOffer = freebiesBannerText
    ? remoteFreebiesOffer
    : entireMenuBannerText
      ? entireMenuOffer
      : minimumSpendBannerText
        ? minimumSpendOffer
        : null;
  const bannerTheme = useMemo(
    () => getOfferTheme(desktopBannerOffer),
    [desktopBannerOffer],
  );
  const showOfferDetailsCta = Boolean(desktopBannerOffer?.offerDescription?.en);
  const [isOfferDetailsModalOpen, setIsOfferDetailsModalOpen] = useState(false);

  useEffect(() => {
    setIsOfferDetailsModalOpen(false);
  }, [desktopBannerOffer?.offerId]);

  // Use refs to track previous values
  const prevStoreSlugRef = useRef<string | undefined>(undefined);
  const prevMenuSlugRef = useRef<string | undefined>(undefined);
  const prevCategoryRef = useRef<string | undefined>(undefined);

  useSetPLPUrl();

  // Parse filters from URL
  const parseFiltersFromUrl = (): SortBarFilters => {
    const dietaryRestrictions =
      searchParams?.get("dietaryRestrictions")?.split(",").filter(Boolean) ||
      [];
    const offer = searchParams?.get("offer")?.split(",").filter(Boolean) || [];
    const calorieMin = Number(searchParams?.get("calorieMin")) || 10;
    const calorieMax = Number(searchParams?.get("calorieMax")) || 900;
    const vegetarianFilter = searchParams?.get("vegetarianFilter") || "non-veg";
    return {
      dietaryRestrictions,
      calorieRange: [calorieMin, calorieMax],
      vegetarianFilter,
      offer,
    };
  };

  const [menu, setMenu] = useState<boolean>(false);
  useDisableBodyScroll(menu);
  // Check if we're on the wishlist page or full-menu page
  const isWishlistPage = category === "wishlist";
  const isFullMenuPage = category === "full-menu";
  const [selectedCat] = useState<string>(
    isWishlistPage ? "wishlist" : isFullMenuPage ? "full-menu" : category,
  );
  const [currentFilters, setCurrentFilters] = useState<SortBarFilters>(
    parseFiltersFromUrl(),
  );

  // Hooks for CategoryScrollBar (only needed for full menu page)
  const { isAuthenticated } = useAuth();
  const { favouriteProducts } = useRawWishlist();
  const { products: reorderProducts, loading: reorderLoading } =
    useReorderProducts(
      isFullMenuPage ? paramsStoreSlug : "",
      isFullMenuPage ? menuSlug : "",
      { enabled: !(isFullMenuPage && isQrFlowActive) },
    );
  const [favouriteProductsFiltered, setFavouriteProductsFiltered] = useState<
    TypesenseProduct[]
  >([]);
  // Only count wishlist items for current store so popup doesn't show another store's count
  const favouriteProductsForCurrentStore = useMemo(
    () =>
      (favouriteProducts ?? []).filter(
        (p) => !p.storefrontId || p.storefrontId === storeId,
      ),
    [favouriteProducts, storeId],
  );

  // Refs to prevent duplicate multiSearch calls
  const fetchingRef = useRef(false);
  const lastRequestRef = useRef<string>("");

  // Prepare search parameters based on filters (using shared utility)
  // Restaurant / Laundry default path only — Retail/Grocery uses buildRetailCatalogSearchRequests
  const getSearchParams = useCallback(
    (filters: SortBarFilters): TypesenseSearchParams => {
      const filterParts: string[] = [];

      // Build common filters (vegetarian, calorie, offers, dietary restrictions)
      const commonFilters = buildCommonFilterParts(filters);
      filterParts.push(...commonFilters);

      // Add category filter - exclude for full-menu page
      if (category && category !== "full-menu") {
        filterParts.push(`productCategorySlug:=${category}`);
      }
      // Add menu filter to check if menuId exists in linkedMenuIds array
      if (menuSlug) {
        filterParts.push(`linkedMenus.menuSlug:=${menuSlug}`);
      }
      // Add status filter for active products
      filterParts.push("status:=ACTIVE");

      // Combine all filter parts
      const filterBy = filterParts.join(" && ");

      const searchParams: TypesenseSearchParams = {
        per_page: 100,
        filter_by: filterBy,
      };

      // Add group_by and group_limit for full-menu page
      if (isFullMenuPage) {
        searchParams.group_by = "productCategoryName.en";
        searchParams.group_limit = 50;
      }

      return searchParams;
    },
    [category, menuSlug, isFullMenuPage],
  );

  // Facet-only query for category counts when on a category page (same multiSearch, no extra API call)
  const getSearchParamsForFacetCounts = useCallback(
    (filters: SortBarFilters): TypesenseSearchParams => {
      const filterParts: string[] = [];
      buildCommonFilterParts(filters).forEach((p) => filterParts.push(p));
      if (menuSlug) filterParts.push(`linkedMenus.menuSlug:=${menuSlug}`);
      filterParts.push("status:=ACTIVE");
      return {
        per_page: 0,
        filter_by: filterParts.join(" && "),
        facet_by: "productCategorySlug",
        max_facet_values: 50,
      };
    },
    [menuSlug],
  );

  const {
    products,
    loading: productsLoading,
    loadingMore: productsLoadingMore,
    error: productsError,
    multiSearch,
    totalFound,
  } = useTypesenseProducts({
    storeId: resolvedStoreId || storeId,
  });

  const [categoryCountsFromFacets, setCategoryCountsFromFacets] = useState<
    Record<string, number>
  >({});
  const [retailPage, setRetailPage] = useState(1);
  const productsList = products ?? [];
  const isWaitingForBootstrappedStoreProducts =
    !storeId && !!paramsStoreSlug && productsList.length === 0;
  const productContentLoading =
    productsLoading || isWaitingForBootstrappedStoreProducts;
  const hasMoreRetailProducts =
    isRetailCatalogSearch &&
    !isFullMenuPage &&
    !isWishlistPage &&
    totalFound > 0 &&
    productsList.length < totalFound;
  const displayedProductsCount =
    isRetailCatalogSearch && totalFound > 0 ? totalFound : products?.length;
  const categoriesData = (categories as unknown as { data: Category[] }) ?? {
    data: [],
  };
  const productsForPopupCounts = isFullMenuPage ? productsList : [];
  const { groupedProducts } = useFullMenuCategories({
    products: productsForPopupCounts,
    categories: categoriesData,
    includeDescriptions: false,
  });

  // Category counts for sidebar/popup (from facet API). Pass undefined when empty so counts are not shown.
  const categoryProductCountsProp = useMemo(() => {
    const hasCounts = Object.keys(categoryCountsFromFacets).length > 0;
    return hasCounts ? categoryCountsFromFacets : undefined;
  }, [categoryCountsFromFacets]);

  // Favourites (wishlist) count for sidebar/popup. Full menu: use filtered list length; category page: use current-store count, fallback to full list if filter gives 0.
  const favouriteProductsCountProp = useMemo(() => {
    if (isFullMenuPage) {
      return (
        favouriteProductsFiltered?.length ??
        favouriteProductsForCurrentStore?.length ??
        0
      );
    }
    const currentStoreCount = favouriteProductsForCurrentStore?.length ?? 0;
    const fullListCount = favouriteProducts?.length ?? 0;
    return currentStoreCount > 0 ? currentStoreCount : fullListCount;
  }, [
    isFullMenuPage,
    favouriteProductsFiltered?.length,
    favouriteProductsForCurrentStore?.length,
    favouriteProducts?.length,
  ]);

  // Total "Full Menu" count for sidebar/popup. Full menu page: total products; category page: sum of all category facet counts.
  const fullMenuProductCountProp = useMemo(() => {
    if (isFullMenuPage) {
      return productsList.length > 0 ? productsList.length : undefined;
    }
    const facetCounts = Object.values(categoryCountsFromFacets);
    const total =
      facetCounts.length > 0
        ? facetCounts.reduce((sum, count) => sum + count, 0)
        : 0;
    return total > 0 ? total : undefined;
  }, [isFullMenuPage, productsList.length, categoryCountsFromFacets]);

  const getOffers = async (
    storeSlug: string,
    menuSlug: string,
    category: string,
  ) => {
    if (storeSlug) {
      try {
        const offerResponse = await fetchOffers(storeSlug, menuSlug, category);
        setOffers(offerResponse.data);
      } catch {
        // Error handled silently
      }
    }
  };

  // Fetch offers when component mounts or any dependency changes
  useEffect(() => {
    // Only execute if any of the values have actually changed
    const hasStoreSlugChanged = prevStoreSlugRef.current !== storeSlug;
    const hasMenuSlugChanged = prevMenuSlugRef.current !== menuSlug;
    const hasCategoryChanged = prevCategoryRef.current !== category;

    if (hasStoreSlugChanged || hasMenuSlugChanged || hasCategoryChanged) {
      getOffers(storeSlug, menuSlug, category);

      // Update all refs to current values
      prevStoreSlugRef.current = storeSlug;
      prevMenuSlugRef.current = menuSlug;
      prevCategoryRef.current = category;
    }
  }, [storeSlug, menuSlug, category]);

  // Sync filter state with URL changes and fetch products
  React.useEffect(() => {
    const urlFilters = parseFiltersFromUrl();
    setCurrentFilters(urlFilters);

    if (!resolvedStoreId && !paramsStoreSlug) return;

    // Wait for store API so we know Retail/Grocery vs Restaurant/Laundry
    if (
      !catalogStoreMeta.accountType &&
      !Array.isArray(homePageStoreData)
    ) {
      return;
    }

    // Build request key for deduplication (include catalog mode so Retail/Grocery re-fetches correctly)
    const catalogKey = isRetailCatalogSearch
      ? `retail-${catalogStoreMeta.accountType}`
      : "menu";
    const requestKey = `${paramsStoreSlug}-${searchParams?.toString() || ""}-${isFullMenuPage ? "full-menu" : category}-${catalogKey}-${resolvedStoreId || "pending"}`;

    // Retail/Grocery need a concrete store id for ecom-products-{storeId}
    // Do not lock lastRequestRef until we can actually fire multiSearch
    if (isRetailCatalogSearch && !isWishlistPage && !resolvedStoreId) {
      // Store list may be ready but currentStore not set — bootstrap from slug
      if (paramsStoreSlug && Array.isArray(homePageStoreData)) {
        void bootstrapStore(paramsStoreSlug);
      }
      return;
    }

    // Prevent duplicate calls
    if (fetchingRef.current || lastRequestRef.current === requestKey) return;

    fetchingRef.current = true;
    lastRequestRef.current = requestKey;
    setRetailPage(1);

    let searchRequests: TypesenseSearchParams[];
    let facetIndex: number;

    if (isRetailCatalogSearch && !isWishlistPage) {
      // Retail / Grocery: store collection + productKind filters (no containsMeat)
      searchRequests = buildRetailCatalogSearchRequests({
        storeId: resolvedStoreId,
        categorySlug: category,
        accountType: catalogStoreMeta.accountType,
        isFullMenuPage,
        page: 1,
      });
      // Second search is price facets, not category slug counts
      facetIndex = -1;
    } else {
      // Restaurant / Laundry: existing menu-based Typesense flow
      // multiSearch bootstraps currentStore via storeSlug when storeId is empty
      searchRequests = [getSearchParams(urlFilters)];
      if (!isFullMenuPage) {
        searchRequests.push(getSearchParamsForFacetCounts(urlFilters));
      }
      facetIndex = !isFullMenuPage ? 1 : -1;
    }

    if (searchRequests.length === 0) {
      fetchingRef.current = false;
      lastRequestRef.current = "";
      return;
    }

    multiSearch(searchRequests)
      .then((results) => {
        if (facetIndex >= 0 && results[facetIndex]?.facets) {
          const counts: Record<string, number> = {};
          const slugFacet = results[facetIndex].facets?.find(
            (f: { field_name: string }) =>
              f.field_name === "productCategorySlug",
          );
          slugFacet?.counts?.forEach((c: { value: string; count: number }) => {
            counts[c.value] = c.count;
          });
          setCategoryCountsFromFacets(counts);
        } else if (isFullMenuPage || isRetailCatalogSearch) {
          setCategoryCountsFromFacets({});
        }
        if (!isFullMenuPage) setFavouriteProductsFiltered([]);
      })
      .catch((error) => {
        console.error("Error in multiSearch:", error);
        if (!isFullMenuPage) setFavouriteProductsFiltered([]);
        // Allow retry after failure (e.g. hard refresh race)
        lastRequestRef.current = "";
      })
      .finally(() => {
        setTimeout(() => {
          fetchingRef.current = false;
        }, 100);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    paramsStoreSlug,
    resolvedStoreId,
    homePageStoreData,
    searchParams?.toString(),
    isFullMenuPage,
    category,
    isRetailCatalogSearch,
    catalogStoreMeta.accountType,
  ]);

  // Full menu: Favourites section from converted wishlist (no favourites query in multiSearch)
  React.useEffect(() => {
    if (isFullMenuPage) setFavouriteProductsFiltered(favouriteProducts ?? []);
  }, [isFullMenuPage, favouriteProducts]);

  const handleLoadMoreRetailProducts = useCallback(async () => {
    if (
      !hasMoreRetailProducts ||
      productsLoading ||
      productsLoadingMore ||
      !resolvedStoreId
    ) {
      return;
    }

    const nextPage = retailPage + 1;
    const searchRequests = buildRetailCatalogSearchRequests({
      storeId: resolvedStoreId,
      categorySlug: category,
      accountType: catalogStoreMeta.accountType,
      isFullMenuPage: false,
      page: nextPage,
    });

    // Load next product page only — skip price facet re-fetch
    const productSearch = searchRequests[0];
    if (!productSearch) return;

    const results = await multiSearch([productSearch], { append: true });
    if (results.length > 0) {
      setRetailPage(nextPage);
    }
  }, [
    hasMoreRetailProducts,
    productsLoading,
    productsLoadingMore,
    resolvedStoreId,
    retailPage,
    category,
    catalogStoreMeta.accountType,
    multiSearch,
  ]);

  // Prefetch next retail page when user is near the end of the current batch
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);
  const hasMoreRetailRef = useRef(hasMoreRetailProducts);
  const productsLoadingRef = useRef(productsLoading);
  const productsLoadingMoreRef = useRef(productsLoadingMore);

  hasMoreRetailRef.current = hasMoreRetailProducts;
  productsLoadingRef.current = productsLoading;
  productsLoadingMoreRef.current = productsLoadingMore;

  useEffect(() => {
    if (!hasMoreRetailProducts) return;

    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        if (
          !hasMoreRetailRef.current ||
          productsLoadingRef.current ||
          productsLoadingMoreRef.current
        ) {
          return;
        }
        void handleLoadMoreRetailProducts();
      },
      {
        root: null,
        // Start loading while a few products from the current batch are still on screen
        rootMargin: "0px 0px 480px 0px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    hasMoreRetailProducts,
    handleLoadMoreRetailProducts,
    productsList.length,
    productsLoadingMore,
  ]);

  // Handle filter changes from SortBar and update URL
  const handleFilterChange = (filters: SortBarFilters) => {
    setCurrentFilters(filters);
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (filters.dietaryRestrictions.length > 0) {
      params.set("dietaryRestrictions", filters.dietaryRestrictions.join(","));
    } else {
      params.delete("dietaryRestrictions");
    }
    if (filters.offer && filters.offer.length > 0) {
      params.set("offer", filters.offer.join(","));
    } else {
      params.delete("offer");
    }
    if (filters.calorieRange[0] !== 10) {
      params.set("calorieMin", filters.calorieRange[0].toString());
    } else {
      params.delete("calorieMin");
    }
    if (filters.calorieRange[1] !== 900) {
      params.set("calorieMax", filters.calorieRange[1].toString());
    } else {
      params.delete("calorieMax");
    }
    if (filters.vegetarianFilter === "") {
      params.set("vegetarianFilter", "veg");
    } else {
      params.delete("vegetarianFilter");
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    setPLPUrlFromParams(params);
  }, [params]);

  // Track category page viewed when products are loaded
  useEffect(() => {
    if (!products || products.length === 0 || !storeId) return;

    trackMenuCategoryViewed({
      category_name: catTitle,
      store_id: storeId,
      item_count: products.length,
      ...(isQrFlowActive
        ? {
            funnel: DINE_IN_ANALYTICS_CONTEXT.funnel,
            table_number: String(qrFlowTableNumber || ""),
            session_id: String(qrSessionId || ""),
          }
        : {}),
    });
  }, [
    products,
    storeId,
    catTitle,
    trackMenuCategoryViewed,
    isQrFlowActive,
    qrFlowTableNumber,
    qrSessionId,
  ]);

  // If we're on the wishlist page, render the WishlistListing component
  if (isWishlistPage) {
    return <WishlistListing />;
  }

  return (
    <main className="min-h-[100vh] bg-[var(--primary-background)] md:bg-[var(--primary-background)] relative text-[var(--primary-text)] w-full">
      {/* Only render schema when there are actual products */}
      {products && products.length > 0 && (
        <ProductListingSchema
          products={products}
          categoryName={catTitle}
          categoryDescription={catDesc}
          categoryId={
            categories?.data?.filter(
              (data) => data?.categorySlug === category,
            )?.[0]?.categoryId
          }
          storeSlug={paramsStoreSlug}
          storeName={storeName}
          totalFound={totalFound}
        />
      )}

      {/* QR flow: store name + rating (reuse AddressBar) above mobile filter navbar */}
      {/* {isQrFlowActive && (
                <div className='md:hidden w-full fixed left-0 right-0 top-[58px] z-[5] min-h-[56px] px-4 flex items-center justify-between bg-[var(--primary-background)] border-b border-[var(--borders-dividers)] max-width-container'>
                    <div className='min-w-0 flex-1'>
                        <AddressBar
                            displayStore={qrBarStore ?? currentStore ?? undefined}
                            showRating={true}
                            showChangeButton={false}
                            horizontalLayout={false}
                            buttonContainerClassName='!bg-transparent !border-0 p-0 min-w-0'
                        />
                    </div>
                    {qrFlowTableNumber && (
                        <div className='shrink-0 ml-2 px-2 py-2.5 rounded-md bg-[var(--error)] text-[var(--white)] extra-small-font font-700 uppercase tracking-wide'>
                            {lang.tableNo}: {qrFlowTableNumber}
                        </div>
                    )}
                </div>
            )} */}

      {/* QR flow: current menu name and timing (e.g. Breakfast - 7:00am-11:00am) */}
      {isQrFlowActive && menuNameAndTiming && (
        <div className="md:hidden w-full fixed left-0 right-0 top-[73px] z-[4] bg-[var(--primary-background)] border-b border-[var(--borders-dividers)]">
          <div className="py-3 px-4 flex items-center gap-2 bg-[var(--border-secondary)] max-width-container text-[var(--primary-text)] justify-between">
            <div className="flex items-center gap-2">
              <AccessTimeIcon
                className="flex-shrink-0"
                sx={{ width: 18, height: 18, fontSize: 18 }}
              />
              <span className="heading-6">
                <span className="text-[var(--primary-text)] font-500">
                  {menuDisplayName}
                </span>
                <span className="text-[var(--secondary-text)]">
                  {" "}
                  - {menuTimingDisplay}
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={handleOpenStoreMenuModal}
              className="p-2 -m-2"
              aria-label="Open menu"
            >
              <Icon
                icon={`${ARROW_DOWN_HEADER_ICON}#arrow-down`}
                className="h-4 w-4 shrink-0 opacity-80 cursor-pointer"
                width={7}
                height={4}
                color={"var(--primary-text)"}
                viewBox="0 0 16 8"
              />
            </button>
          </div>
        </div>
      )}

      {/* Mobile flex container for reordering */}
      <div className="mobile-flex-container">
        {/* Mobile filter navbar - second on mobile; when QR flow active, sit below store bar + menu timing row */}
        <div
          className={`md:hidden w-full overflow-x-auto max-width-container mobile-order-2 fixed z-[5] mobile-filter-navbar !p-0 ${isQrFlowActive ? "top-[118px] bg-[var(--cards-containers)] pt-1" : "top-[69px] bg-[var(--primary-background)]"}`}
        >
          <div className="flex px-4">
            <SortBar
              onFilterChange={handleFilterChange}
              currentFilters={currentFilters}
              facets={offers}
              productsCount={
                productContentLoading ? undefined : displayedProductsCount
              }
            />
          </div>
          {/* Category Scroll Bar - Only for full menu mobile view */}
          {isFullMenuPage &&
            !isQrFlowActive &&
            categories?.data &&
            products && (
              <CategoryScrollBar
                categories={categories as unknown as { data: Category[] }}
                products={products}
                isAuthenticated={!!isAuthenticated}
                reorderProductsCount={reorderProducts?.length || 0}
                favouriteProductsCount={favouriteProducts?.length || 0}
                categoryContainerClassName={`px-4 ${isQrFlowActive ? "bg-[var(--cards-containers)]" : "bg-[var(--primary-background)]"}`}
              />
            )}
          {!!desktopBannerText && (
            <div className="w-full" style={{ backgroundColor: bannerTheme.bg }}>
              <div className="w-full flex justify-center py-2 px-3">
                <div className="flex items-center justify-center gap-x-2 gap-y-1.5 min-w-0 max-w-full">
                  <Icon
                    icon={`${OFFER_TYPE_ICON}#offers`}
                    width={18}
                    height={18}
                    color={bannerTheme.text}
                    className="flex-shrink-0 w-4 h-4"
                    viewBox="0 0 15 15"
                  />
                  <p
                    className="extra-small-font md-heading-6 font-600 m-0 text-center break-words max-w-full truncate"
                    style={{ color: bannerTheme.text }}
                  >
                    {desktopBannerLabel
                      ? `${desktopBannerLabel} ${desktopBannerText}`
                      : desktopBannerText}
                  </p>
                  {showOfferDetailsCta && desktopBannerOffer && (
                    <button
                      type="button"
                      aria-label={lang.viewOfferDetails}
                      className="shrink-0 cursor-pointer border-0 bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOfferDetailsModalOpen(true);
                      }}
                    >
                      <img
                        src={OFFER_DETAIL_ICON}
                        alt={lang.viewOfferDetails}
                        width={14}
                        height={14}
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop sort bar and toggle section - third on mobile */}
        <div className="relative md:fixed top-[60px] md:top-[76px] md:left-0 md:right-0 md:z-[4] w-full flex md:flex md:flex-col bg-[var(--cards-containers)] mobile-order-3">
          <div className="w-full md:h-[108px] bg-[var(--quaternary-background)] md:bg-[--cards-containers] hidden md:flex flex-col md:flex-row md:justify-between items-start md:items-center pt-2 max-width-container">
            <LocationBar category={catTitle} />

            {/* Desktop Layout */}
            <div className="hidden md:flex md:flex-wrap items-center pb-4 lg:pt-11 justify-end">
              <SortBar
                onFilterChange={handleFilterChange}
                currentFilters={currentFilters}
                facets={offers}
                productsCount={
                  productContentLoading ? undefined : displayedProductsCount
                }
              />
              {!!products?.length && <ToggleView />}
            </div>
          </div>
          {!!desktopBannerText && (
            <div
              className="hidden md:flex w-full"
              style={{ backgroundColor: bannerTheme.bg }}
            >
              <div className="max-width-container w-full flex justify-center py-2 px-3">
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 min-w-0 max-w-full">
                  <Icon
                    icon={`${OFFER_TYPE_ICON}#offers`}
                    width={18}
                    height={18}
                    color={bannerTheme.text}
                    className="flex-shrink-0"
                    viewBox="0 0 15 15"
                  />
                  <p
                    className="md-heading-6 font-600 m-0 text-center break-words max-w-full"
                    style={{ color: bannerTheme.text }}
                  >
                    {desktopBannerLabel
                      ? `${desktopBannerLabel} ${desktopBannerText}`
                      : desktopBannerText}
                  </p>
                  {showOfferDetailsCta && desktopBannerOffer && (
                    <button
                      type="button"
                      className="shrink-0 rounded-full px-2 py-1 extra-small-font font-600 uppercase tracking-wide cursor-pointer border-0"
                      style={{
                        color: "#2B6EFF",
                        backgroundColor: "#2B6EFF1A",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOfferDetailsModalOpen(true);
                      }}
                    >
                      {lang.viewOfferDetails}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className={`w-full ${desktopTopPaddingClass} md:pb-7 flex flex-col md:flex-row-reverse bg-[var(--quaternary-background)] md:bg-[transparent] max-width-container ${showQrFlowCartSummary ? "pb-[62px]" : "pb-4"} ${isQrFlowActive ? (desktopBannerText ? "" : "!pt-[115px]") : isFullMenuPage ? "!pt-24" : "pt-[60px]"}`}
      >
        {/* Right side container with Products */}
        <div className="w-full md:w-[80%]">
          {/* Dine-in / scan-order: info that each round is a separate ticket, one final bill */}
          {isQrFlowActive && (
            <div className={`${!isFullMenuPage ? "mb-4" : ""}`}>
              <div className="flex gap-3 p-3 md:p-4 rounded-lg bg-[#FFF7EA] border border-dashed border-[#EEDEB9]">
                <p className="extra-small-font text-[#745E23] font-normal leading-relaxed m-0">
                  {lang.dineInOrderInfoBefore}
                  <strong>{lang.separateTicket}</strong>
                  {lang.dineInOrderInfoAfter}
                </p>
              </div>
            </div>
          )}
          {/* Mobile Layout - Horizontal */}
          {!isFullMenuPage ? (
            <div className="md:hidden w-full flex items-center justify-between">
              <h1 className="product-title-mob">{catTitle}</h1>
            </div>
          ) : null}
          {/* Conditional rendering based on page type */}
          {isFullMenuPage ? (
            <FullMenuContainer
              products={products}
              favouriteProducts={favouriteProductsFiltered}
              categories={categories as unknown as { data: Category[] }}
              loading={productContentLoading}
              error={productsError}
              storeSlug={paramsStoreSlug}
              menuSlug={menuSlug}
              reorderProducts={reorderProducts}
              reorderLoading={reorderLoading}
              excludedFromOfferProductIds={excludedFromOfferProductIds}
            />
          ) : (
            <>
              <ProductContainer
                products={products}
                loading={productContentLoading}
                error={productsError}
                catDesc={catDesc}
                catTitle={catTitle}
                storeSlug={paramsStoreSlug}
                containerClassName="w-full md:pl-4 pl-0"
                excludedFromOfferProductIds={excludedFromOfferProductIds}
              />
              {hasMoreRetailProducts && (
                <div
                  ref={loadMoreSentinelRef}
                  className="flex items-center justify-center min-h-12 py-6 md:pl-4"
                  aria-hidden={!productsLoadingMore}
                >
                  {productsLoadingMore ? <Loader size={32} /> : null}
                </div>
              )}
            </>
          )}
        </div>

        {/* Desktop filter sidebar - hidden on small screens */}
        <div
          className={`hidden md:flex md:flex-col md:w-[20%] sticky ${desktopSidebarStickyClass}`}
        >
          <h2 className="pt-6 heading-h3 pl-4 font-600 pb-8 shrink-0"> {lang.menu}</h2>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="pr-4 pb-4">
              <FilterContainer
                storeId={paramsStoreSlug}
                menuId={menuId}
                selectedCat={selectedCat}
                loading={categoriesLoading}
                error={categoriesError}
                categories={categories as unknown as { data: Category[] }}
              />
            </div>
          </div>
        </div>
      </div>
      {desktopBannerOffer?.offerDescription?.en && (
        <OfferDetailsModal
          isOpen={isOfferDetailsModalOpen}
          onClose={() => setIsOfferDetailsModalOpen(false)}
          offerData={desktopBannerOffer}
        />
      )}

      {!isQrFlowActive && (
        <>
          <div
            className="md:hidden fixed right-[20px]"
            onClick={() => setMenu(true)}
            style={{ zIndex: "4", bottom: hasCartItems ? "20px" : "36px" }}
          >
            <Icon
              icon={`${MENU_CARD_ICON}#menu-card`}
              width={60}
              height={67}
              color="var(--accent-color)"
              viewBox="0 0 61 68"
              strokeWidth={0}
             />
          </div>
          {!!menu && (
            <div className="menu-wrapper" onClick={() => setMenu(false)}>
              <div className="menu-slider">
                <div className="h-[100%] overflow-auto">
                  <FilterContainer
                    storeId={paramsStoreSlug}
                    menuId={menuId}
                    selectedCat={selectedCat}
                    loading={categoriesLoading}
                    error={categoriesError}
                    categories={categories as unknown as { data: Category[] }}
                    groupedProducts={groupedProducts}
                    categoryProductCounts={categoryProductCountsProp}
                    favouriteProductsCount={favouriteProductsCountProp}
                    reorderProductsCount={reorderProducts?.length ?? 0}
                    fullMenuProductCount={fullMenuProductCountProp}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <style>{`
                .product-title-mob {
                    font-size: var(--heading-h2);
                    font-weight: var(--font-semi-bold);
                }
                .text_extraSmall {
                  font-size: var(--extraSmall-font);
                }
                .menu-heading {
                    font-size: var(--heading-h3);
                    font-weight: var(--font-medium);
                }
                .menu-wrapper{
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
                    bottom: ${hasCartItems ? "98px" : "5vw"};
                    left: 5vw; 
                    width: 90vw;
                    background-color: var(--cards-containers);
                    box-sizing: border-box;
                    border-radius: 10px;
                    padding: 15px;
                }
                .mobile-order-again {
                    display: none;
                }
                .mobile-flex-container {
                    display: flex;
                    flex-direction: column;
                }
                .mobile-order-1 {
                    order: 2;
                }
                .mobile-order-2 {
                    order: 3;
                }
                .mobile-order-3 {
                    order: 1;
                }
                /* Hide mobile filter navbar when mobile search or mobile menu is open */
                body.mobile-search-open .mobile-filter-navbar,
                body.mobile-menu-open .mobile-filter-navbar {
                    opacity: 0 !important;
                    pointer-events: none !important;
                    z-index: -1 !important;
                    visibility: hidden !important;
                    display: none !important;
                }
                @media (max-width: 768px) {
                    .mobile-order-again {
                        display: block;
                    }
                    .mobile-order-1 {
                        order: 1;
                    }
                    .mobile-order-2 {
                        order: 2;
                    }
                    .mobile-order-3 {
                        order: 3;
                    }
                }
            `}</style>
    </main>
  );
}

export default ProductListing;
