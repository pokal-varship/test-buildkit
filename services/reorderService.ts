import { REORDER_ENDPOINT } from "@config/api.config";
import axiosClient from "./axios";
import { ReorderProduct } from "@components/orderagain/orderAgainType";

export const getReorderProducts = async (storeSlug: string, menuSlug?: string): Promise<ReorderProduct[]> => {
    try {
        const params: Record<string, string> = {
            storeSlug: storeSlug,
        };
        
        if (menuSlug) {
            params.menuSlug = menuSlug;
        }
        
        const response = await axiosClient.get(REORDER_ENDPOINT, {
            params,
        });
        
        // Ensure we return an array
        const data = response.data;
        if (Array.isArray(data)) {
            return data;
        } else if (data && Array.isArray(data.data)) {
            return data.data;
        } else {

            return [];
        }
    } catch (error) {

        throw error;
    }
};
