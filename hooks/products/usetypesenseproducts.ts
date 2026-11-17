/**
 * Hook for fetching products from Typesense
 */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  searchProducts,
  multiSearchProducts,
  getProductById,
} from "@services/typesense/productService";
import {
  type TypesenseProduct,
  type TypesenseSearchParams,
} from "@services/typesense/types";
import { useStoreDataBootstrap } from "@app/StoreDataProvider";

interface UseTypesenseProductsProps {
  storeId?: string;
}

interface MultiSearchOptions {
  /** When true, append page results instead of replacing the list */
  append?: boolean;
}

interface UseTypesenseProductsResult {
  products: TypesenseProduct[];
  loading: boolean;
  loadingMore: boolean;
  error: Error | null;
  totalFound: number;
  facets?: Array<{
    field_name: string;
    counts: Array<{ count: number; value: string }>;
  }>;
  search: (params: TypesenseSearchParams) => Promise<void>;
  multiSearch: (
    params: TypesenseSearchParams[],
    options?: MultiSearchOptions,
  ) => Promise<
    Array<{
      products: TypesenseProduct[];
      totalFound: number;
      facets?: Array<{
        field_name: string;
        counts: Array<{ count: number; value: string }>;
      }>;
    }>
  >;
  // fetchAllProducts: () => Promise<void>;
  fetchProductById: (
    id: string,
    storeId: string,
  ) => Promise<TypesenseProduct | null>;
}

export const useTypesenseProducts = ({
  storeId,
}: UseTypesenseProductsProps = {}): UseTypesenseProductsResult => {
  const params = useParams<{ storeSlug?: string | string[] }>();
  const { bootstrapStore } = useStoreDataBootstrap();
  const storeSlug = Array.isArray(params?.storeSlug)
    ? params.storeSlug[0]
    : params?.storeSlug;
  const [products, setProducts] = useState<TypesenseProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalFound, setTotalFound] = useState<number>(0);
  const [resolvedStoreId, setResolvedStoreId] = useState<string>(storeId || "");
  // const [facets, setFacets] = useState<Array<{field_name: string, counts: Array<{count: number, value: string, highlighted: string}>}> | undefined>(undefined);

  useEffect(() => {
    setResolvedStoreId(storeId || "");
  }, [storeId, storeSlug]);

  const resolveStoreId = async (): Promise<string> => {
    if (storeId) {
      if (resolvedStoreId !== storeId) setResolvedStoreId(storeId);
      return storeId;
    }

    if (resolvedStoreId) {
      return resolvedStoreId;
    }

    const bootstrappedStore = await bootstrapStore(storeSlug);
    const bootstrappedStoreId = bootstrappedStore?.id || "";
    if (bootstrappedStoreId) {
      setResolvedStoreId(bootstrappedStoreId);
    }

    return bootstrappedStoreId;
  };

  // Function to search products with given parameters
  const search = async (params: TypesenseSearchParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const effectiveStoreId = await resolveStoreId();
      if (!effectiveStoreId) {
        throw new Error("Store ID is required to search products");
      }

      const result = await searchProducts(params, effectiveStoreId);

      setProducts(result.products);
      setTotalFound(result.totalFound);
      // setFacets(result.facets);
    } catch (error) {
      setError(
        error instanceof Error ? error : new Error("An unknown error occurred"),
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to perform multiple searches in a single request
  const multiSearch = async (
    params: TypesenseSearchParams[] = [],
    options: MultiSearchOptions = {},
  ) => {
    const { append = false } = options;

    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const effectiveStoreId = await resolveStoreId();
      if (!effectiveStoreId) {
        throw new Error("Store ID is required to search products");
      }

      const results = await multiSearchProducts(params, effectiveStoreId);

      // If there's at least one result, update the products state with the first result
      if (results.length > 0) {
        const nextProducts = results[0].products;
        if (append) {
          setProducts((prev) => {
            const seen = new Set(
              prev.map((p) => p.id || p.productId).filter(Boolean),
            );
            const unique = nextProducts.filter((p) => {
              const key = p.id || p.productId;
              if (!key || seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            return [...prev, ...unique];
          });
        } else {
          setProducts(nextProducts);
        }
        setTotalFound(results[0].totalFound);
        // setFacets(results[0].facets);
      }

      return results;
    } catch (error) {
      setError(
        error instanceof Error ? error : new Error("An unknown error occurred"),
      );

      return [];
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Function to fetch all products
  // const fetchAllProducts = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);

  //     const products = await getAllProducts(storeId);
  //     setProducts(products);
  //     setTotalFound(products.length);
  //   } catch (error) {
  //     setError(error instanceof Error ? error : new Error('An unknown error occurred'));
  //     console.error('Error fetching all products:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // New function to fetch a single product by ID
  const fetchProductById = async (id: string, storeId: string) => {
    try {
      setLoading(true);
      setError(null);

      const product = await getProductById(id, storeId);
      return product;
    } catch (error) {
      setError(
        error instanceof Error ? error : new Error("An unknown error occurred"),
      );

      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    loadingMore,
    error,
    totalFound,
    search,
    multiSearch,
    // fetchAllProducts,
    fetchProductById,
  };
};
