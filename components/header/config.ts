// Define the ParamsType interface
interface ParamsType {
    storeSlug?: unknown; // Replace 'any' with the actual type of store if known
    categorySlug?: string; // Replace 'any' with the actual type of category if known
}

export const showSearchBar = (params: ParamsType) => {
    return !!params.storeSlug || !!params.categorySlug;
};

export const showMiniCart = (params: ParamsType) => {
    return !!params.storeSlug;
};

