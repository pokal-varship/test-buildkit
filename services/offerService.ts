import { OFFERS_ENDPOINT } from '@config/api.config';
import axiosClient from './axios';
import { DiscountOffer } from './typesense';

export interface OfferResponse {
  status: string;
  message: string;
  data: DiscountOffer[];
  totalCount: number;
}

/**
 * Fetches offers from the API
 * @param storeSlug - The store slug
 * @returns Promise with offer data
 */
export const fetchOffers = async (
  storeSlug: string,
  menuId?: string,
  categorySlug?: string,
): Promise<OfferResponse> => {
  try {
    const response = await axiosClient.get(`${OFFERS_ENDPOINT}?${storeSlug ? `storeSlug=${storeSlug}&` : "" }${categorySlug ? `categorySlug=${categorySlug}&` : "" }${menuId ? `menuSlug=${menuId}&` : "" }`);
    
    return response.data;
  } catch (error) {

    // Return a default response structure on error
    return {
      data: [],
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      totalCount: 0
    };
  }
};