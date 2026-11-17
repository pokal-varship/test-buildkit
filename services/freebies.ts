import { FREEBIE_OFFER_ENDPOINT } from "@config/api.config";
import axiosClient from "./axios";

export const getFreebiesOffer = async (
    storefrontId: string,
    identifier: string,
    offerId?: string,
    identifierKey: "cartId" | "sessionId" = "cartId"
) => {
    try {
        const response = await axiosClient.get(FREEBIE_OFFER_ENDPOINT, {
            params: {
                [identifierKey]: identifier,
                offerId
            },
            headers: {
                "Store-Id": storefrontId
            }
        });
        return response.data;
    } catch (error) {

        throw error;
    }
};