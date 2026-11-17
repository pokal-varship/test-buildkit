import { WISHLIST_ENDPOINT } from "@config/api.config";
import axiosClient from "./axios";
import { getLocationHeader } from "@lib/utils/location";

export const addToWishlist = async (storefrontId: string, productId: string) => {
    const locationHeader = await getLocationHeader ('add-to-wishlist');
    try {
        const response = await axiosClient.post(WISHLIST_ENDPOINT, {
            productId
        }, {
            headers: {
                "Store-Id": storefrontId,
                "X-User-Location": locationHeader,
            }
        });
        return response.data;
    } catch (error) {

        throw error;
    }
};

export const removeFromWishlist = async (storefrontId: string, productId: string) => {
    try {
        const response = await axiosClient.delete(`${WISHLIST_ENDPOINT}?productId=${productId}`, {
            headers: {
                "Store-Id": storefrontId
            }
        });
        return response.data;
    } catch (error) {

        throw error;
    }
};

export const getWishlist = async (storefrontId: string, productID?: string, limit?: number, offset?: number) => {
    try {
        const params: Record<string, string | number> = {};
        if (productID) params.productID = productID;
        if (limit) params.limit = limit;
        if (offset) params.offset = offset;
        
        const response = await axiosClient.get(WISHLIST_ENDPOINT, {
            headers: {
                "Store-Id": storefrontId
            },
            params
        });
        return response.data;
    } catch (error) {

        throw error;
    }
};
