/**
 * Typesense product service
 * This file contains functions to query products from Typesense
 *
 * Default path (Restaurant / Laundry): unchanged menu-based search + identity product map.
 * Retail / Grocery: only when search params include __retailCatalog (set by retail catalog builder).
 */

import { getTypesenseClient } from './client';
import { getProductCollectionName } from './config';
import { 
  TypesenseSearchParams, 
  TypesenseSearchResponse, 
  TypesenseProduct, 
  mapTypesenseProductToProduct,
  TypesenseMultiSearchRequest, 
  TypesenseMultiSearchResponse
} from './types';
import { mapRetailCatalogProduct } from '../../utils/typesenseRetailCatalog';

/** Strip client-only flags before sending params to Typesense */
const toTypesenseApiParams = (
  params: TypesenseSearchParams,
  collectionName: string,
): TypesenseSearchParams & { collection: string } => {
  const { __retailCatalog: _retailCatalog, ...apiParams } = params;
  return {
    collection: apiParams.collection || collectionName,
    q: apiParams.q || '*',
    query_by: apiParams.query_by || 'name,description,productCategoryName.en',
    filter_by: apiParams.filter_by || '',
    sort_by: apiParams.sort_by || '',
    page: apiParams.page || 1,
    per_page: apiParams.per_page ?? 20,
    facet_by: apiParams.facet_by || '',
    max_facet_values: apiParams.max_facet_values || 10,
    facet_query: apiParams.facet_query || '',
    exclude_fields: apiParams.exclude_fields || 'embedding',
    ...(apiParams.query_by_weights && { query_by_weights: apiParams.query_by_weights }),
    ...(apiParams.group_by && { group_by: apiParams.group_by }),
    ...(apiParams.group_limit !== undefined && { group_limit: apiParams.group_limit }),
    ...(apiParams.prioritize_exact_match !== undefined && {
      prioritize_exact_match: apiParams.prioritize_exact_match,
    }),
    ...(apiParams.text_match_type && { text_match_type: apiParams.text_match_type }),
    ...(apiParams.num_typos !== undefined && { num_typos: apiParams.num_typos }),
    ...(apiParams.drop_tokens_threshold !== undefined && {
      drop_tokens_threshold: apiParams.drop_tokens_threshold,
    }),
    ...(apiParams.prefix !== undefined && { prefix: apiParams.prefix }),
  };
};

const mapHitDocument = (
  document: TypesenseProduct | undefined,
  isRetailCatalog: boolean,
): TypesenseProduct => {
  if (isRetailCatalog) {
    return mapRetailCatalogProduct(document as TypesenseProduct);
  }
  return mapTypesenseProductToProduct(document as TypesenseProduct);
};

const flattenGroupedHits = (
  groupedHits: TypesenseSearchResponse<TypesenseProduct>['grouped_hits'],
  isRetailCatalog: boolean,
): TypesenseProduct[] => {
  if (!groupedHits?.length) return [];

  return groupedHits.flatMap((group) => {
    // Retail/Grocery: only first hit per name group (group.found may be > 1)
    const hits = isRetailCatalog ? group.hits.slice(0, 1) : group.hits;
    return hits.map((hit) => mapHitDocument(hit?.document, isRetailCatalog));
  });
};

/**
 * Retail catalog uses group_by (name) so per_page counts groups.
 * Prefer `found` (groups) over `found_docs` (variants) for pagination.
 */
const resolveTotalFound = (
  result: { found?: number; found_docs?: number },
  isRetailCatalog: boolean,
): number => {
  if (isRetailCatalog && result.found !== undefined) {
    return result.found;
  }
  if (result.found_docs !== undefined) {
    return result.found_docs;
  }
  return result.found ?? 0;
};

/**
 * Search for products in Typesense
 * @param params Search parameters
 * @param storeId Store ID (optional, defaults to DEFAULT_STORE_ID)
 * @returns Promise with search results
 */
export const searchProducts = async (
  params: TypesenseSearchParams = {},
  storeId: string | undefined
): Promise<{ products: TypesenseProduct[], totalFound: number, facets?: Array<{field_name: string, counts: Array<{count: number, value: string, highlighted: string}>}> }> => {
  try {
    const client = getTypesenseClient();
    const collectionName = getProductCollectionName(storeId);
    const isRetailCatalog = params.__retailCatalog === true;
    const searchParams = toTypesenseApiParams(params, collectionName);
    const effectiveCollection = searchParams.collection;

    // Execute search
    const searchResults = await client
      .collections(effectiveCollection)
      .documents()
      .search(searchParams) as TypesenseSearchResponse<TypesenseProduct>;

    let products: TypesenseProduct[] = [];
    
    if (searchResults?.grouped_hits && searchResults.grouped_hits.length > 0) {
      products = flattenGroupedHits(searchResults.grouped_hits, isRetailCatalog);
    } else if (searchResults?.hits) {
      products = searchResults.hits.map((hit) =>
        mapHitDocument(hit?.document, isRetailCatalog),
      );
    }

    const totalFound = resolveTotalFound(searchResults, isRetailCatalog);

    return {
      products,
      totalFound,
      facets: searchResults?.facet_counts || undefined,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get all products from Typesense
 * @param storeId Store ID (optional, defaults to DEFAULT_STORE_ID)
 * @param limit Number of products to return (optional, defaults to 100)
 * @returns Promise with products
 */
export const getAllProducts = async (
  storeId: string | undefined,
  limit: number = 100
): Promise<TypesenseProduct[]> => {
  try {
    const searchResults = await multiSearchProducts(
      [{
        q: '*',
        per_page: limit,
      }],
      storeId
    );
      
    return searchResults[0]?.products || [];
  } catch {

    return [];
  }
};

/**
 * Get product by ID from Typesense
 * @param productId Product ID
 * @param storeId Store ID (optional, defaults to DEFAULT_STORE_ID)
 * @returns Promise with product or null if not found
 */
export const getProductById = async (
  productId: string,
  storeId: string | undefined
): Promise<TypesenseProduct | null> => {
  try {
    const { products } = await searchProducts(
      {
        filter_by: `productId:=${productId}`,
        per_page: 1,
      },
      storeId
    );
    
    return products.length > 0 ? products[0] : null;
  } catch {

    return null;
  }
};

/**
 * Perform multiple searches in a single request using Typesense's multi_search endpoint
 * @param searchRequests Array of search parameter objects
 * @param storeId Store ID (optional, defaults to DEFAULT_STORE_ID)
 * @returns Promise with array of search results
 */
export const multiSearchProducts = async (
  searchRequests: TypesenseSearchParams[] = [],
  storeId: string | undefined
): Promise<Array<{ products: TypesenseProduct[], totalFound: number, facets?: Array<{field_name: string, counts: Array<{count: number, value: string, highlighted: string}>}> }>> => {
  try {
    if (searchRequests?.length === 0) {
      return [];
    }

    const client = getTypesenseClient();
    const collectionName = getProductCollectionName(storeId);

    const searches = searchRequests.map((params) =>
      toTypesenseApiParams(params, collectionName),
    );

    const multiSearchRequest: TypesenseMultiSearchRequest = { searches };
    const searchResults = await client.multiSearch.perform(multiSearchRequest) as TypesenseMultiSearchResponse<TypesenseProduct>;

    return searchResults?.results?.map((result, index) => {
      let products: TypesenseProduct[] = [];
      const isRetailCatalog = searchRequests[index]?.__retailCatalog === true;

      if (result?.grouped_hits && result.grouped_hits.length > 0) {
        products = flattenGroupedHits(result.grouped_hits, isRetailCatalog);
      } else if (result?.hits) {
        products = result.hits.map((hit) =>
          mapHitDocument(hit?.document, isRetailCatalog),
        );
      }

      const totalFound = resolveTotalFound(result, isRetailCatalog);

      return {
        products,
        totalFound,
        facets: result.facet_counts || undefined,
      };
    });
  } catch (error) {

    throw error;
  }
};
