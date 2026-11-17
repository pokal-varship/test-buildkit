import { COMBO_PRODUCT_ENDPOINT } from "@config/api.config";
import axiosClient from "./axios";

export interface ComboProductResponse {
  status: string;
  message: string;
  data: object;
  totalCount?: number;
}

/**
 * Fetches combo product data from the API
 * @param categoryId - The category ID
 * @param productSlug - The product slug (customSlug from seo.urlManagement)
 * @param storeSlug - The store slug
 * @returns Promise with combo product data
 */
export const getComboProductData = async (
  categoryId: string, 
  productSlug: string, 
  storeSlug: string
): Promise<ComboProductResponse> => {
      try {
      const response = await axiosClient.get(
        `${COMBO_PRODUCT_ENDPOINT}`,
        {
          params: {
            categoryId,
            productSlug,
            storeSlug
          }
        }
      );
    return response.data;
  } catch(error) {

    // Return a default response structure on error
    return {
      data: {},
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      totalCount: 0
    };
  }
};
