import {
  getSearchParam,
  hasSearchParam,
  type SearchParamsRecord,
} from "@lib/search-params";

export interface ProductUrlParams {
  menuId: string;
  cartItemId: string;
  categoryId: string;
  storeId: string;
  rfcEdit: string;
  redirectFromCartToChose: boolean;
  redirectFromCartToEdit: boolean;
  redirectFromQuantityIncrease: boolean;
  /** PLP "I'll choose" flow: fresh customization UI without post-add cart redirect */
  redirectFromPlpChoose: boolean;
  isPDP: boolean;
  isReviewTab: boolean;
}

type PathParams = {
  menuSlug?: string;
  storeSlug?: string;
};

/** Build PDP URL state from server `searchParams` + optional path segments. */
export function productUrlParamsFromRecord(
  searchParams: SearchParamsRecord,
  path?: PathParams,
): ProductUrlParams {
  const menuFromPath = path?.menuSlug ?? "";
  const storeFromPath = path?.storeSlug ?? "";

  return {
    menuId: getSearchParam(searchParams, "menu") || menuFromPath,
    cartItemId: getSearchParam(searchParams, "cid") ?? "",
    categoryId: getSearchParam(searchParams, "category") ?? "",
    storeId: getSearchParam(searchParams, "store") || storeFromPath,
    rfcEdit: getSearchParam(searchParams, "rfcEdit") ?? "",
    redirectFromCartToChose: hasSearchParam(searchParams, "rfc"),
    redirectFromCartToEdit: hasSearchParam(searchParams, "rfcEdit"),
    redirectFromQuantityIncrease: hasSearchParam(
      searchParams,
      "fromQuantityIncrease",
    ),
    redirectFromPlpChoose: hasSearchParam(searchParams, "fromPlpChoose"),
    isPDP: hasSearchParam(searchParams, "isPDP"),
    isReviewTab: getSearchParam(searchParams, "reviewTab") === "true",
  };
}
