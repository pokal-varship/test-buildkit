import { CART_ADD_ENDPOINT, UPSALE_PRODUCTS_ENDPOINT } from "@config/api.config";
import axiosClient from "./axios";
import { StoreData } from "./storePage";
import { getLocationHeader } from "@lib/utils/location";

// Interface for combo cart payload
export interface ComboCartPayload {
  quantity: number;
  productId: string;
  variantId?: string; // Made optional since combo products may not have variants
  comboPrimaryProductId: string;
  comboPrimaryProductVariantId: string;
  comboPrimaryProductModifierGroups: Array<{
    modifierGroupId: string;
    modifiers: Array<{
      modifierId: string;
      quantity: number;
    }>;
  }>;
  comboProducts: Array<{
    groupName: string;
    productId: string;
    variantId?: string;
    modifierGroups?: Array<{
      modifierGroupId: string;
      modifiers: Array<{
        modifierId: string;
        quantity: number;
      }>;
    }>;
  }>;
  specialInstructions?: string; // Optional special instructions for the combo
}

export const getStoreCart = async (storefrontId: string): Promise<StoreData> => {
    try {
        const response = await axiosClient.get(CART_ADD_ENDPOINT, {
            headers: {
                "Store-Id": storefrontId
            }
        });
        return response.data;
    } catch (error) {

        throw error;
    }
};

export const updateStoreCart = async (storefrontId: string, payload: unknown): Promise<StoreData> => {
    const locationHeader = await getLocationHeader('cart-update');
    try {
        const response = await axiosClient.patch(
            CART_ADD_ENDPOINT,
            payload,
            {
                headers: {
                    "Store-Id": storefrontId,
                    "X-User-Location": locationHeader
                }
            }
        );
        return response.data;
    } catch (error) {

        throw error;
    }
};

export const addComboToCart = async (storefrontId: string, payload: ComboCartPayload): Promise<StoreData> => {
    const locationHeader = await getLocationHeader('cart-add-combo');
    try {
        const response = await axiosClient.post(
            CART_ADD_ENDPOINT,
            payload,
            {
                headers: {
                    "Store-Id": storefrontId,
                    "X-User-Location": locationHeader
                }
            }
        );
        return response.data;
    } catch (error) {

        throw error;
    }
};

export const cancelOrder = async (storefrontId: string, cartId: string, customType: string): Promise<StoreData> => {
    const locationHeader = await getLocationHeader('cart-cancel-order');
    try {
        const response = await axiosClient.patch(
            CART_ADD_ENDPOINT,
            {
                id: cartId,
                customType: customType
            },
            {
                headers: {
                    "Store-Id": storefrontId,
                    "X-User-Location": locationHeader
                }
            }
        );
        return response.data;
    } catch (error) {

        throw error;
    }
};

export const getUpsellProducts = async (
    storefrontId: string,
    cartIdOrTicketId: string,
    options?: { useTicketId?: boolean }
): Promise<StoreData> => {
    try {
        const param = options?.useTicketId ? `ticketId=${cartIdOrTicketId}` : `cartId=${cartIdOrTicketId}`;
        const response = await axiosClient.get(UPSALE_PRODUCTS_ENDPOINT + `?${param}`, {
            headers: {
                "Store-Id": storefrontId
            }
        });
        return response.data;
    } catch (error) {

        throw error;
    }
};
