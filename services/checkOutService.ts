import { CALCULATE_DELIVERY_FEE_ENDPOINT, CHECKOUT_ENDPOINT, CUSTOMER_ADDRESS_ENDPOINT, USER_PROMOTIONS_LIST_ENDPOINT } from "@config/api.config";
import axiosClient from "./axios";
import { StoreData } from "./storePage";
import { CheckoutResponse, DeliveryFeeResponse } from "@components/checkOut/checkout.type";
import { getLocationHeader } from "@lib/utils/location";

export const getPromotionsList = async (cartId: string): Promise<any> => {
  try {
    const response = await axiosClient.get(
      `${USER_PROMOTIONS_LIST_ENDPOINT}`,
      {
        params: { cart_id: cartId },
      }
    );
    return response.data;
  } catch (error) {

    throw error;
  }
};

export const getCustomerAddress = async (storefrontId: string): Promise<StoreData> => {
  try {
    const response = await axiosClient.get(CUSTOMER_ADDRESS_ENDPOINT, {
      headers: {
        "Store-Id": storefrontId
      }
    });
    return response.data;
  } catch (error) {

    throw error;
  }
};

export const addCustomerAddress = async (storefrontId: string, payload: any): Promise<StoreData> => {
  try {
    const response = await axiosClient.post(CUSTOMER_ADDRESS_ENDPOINT, payload, {
      headers: {
        "Store-Id": storefrontId
      }
    });
    return response.data;
  } catch (error) {

    throw error;
  }
};

export const deleteCustomerAddress = async (storefrontId: string, addressId: string): Promise<StoreData> => {
  try {
    const response = await axiosClient.delete(`${CUSTOMER_ADDRESS_ENDPOINT}?id=${addressId}`, {
      headers: {
        "Store-Id": storefrontId
      }
    });
    return response.data;
  } catch (error) {

    throw error;
  }
};

export const updateCustomerAddress = async (storefrontId: string, payload: any): Promise<StoreData> => {
  try {
    const response = await axiosClient.patch(CUSTOMER_ADDRESS_ENDPOINT, payload, {
      headers: {
        "Store-Id": storefrontId
      }
    });
    return response.data;
  } catch (error) {

    throw error;
  }
};

export const checkout = async (storefrontId: string, payload: any): Promise<CheckoutResponse> => {
  const locationHeader = await getLocationHeader('checkout');
  try {
    const response = await axiosClient.post(CHECKOUT_ENDPOINT, payload, {
      headers: {
        "Store-Id": storefrontId,
        "X-User-Location": locationHeader
      }
    });
    return response.data;
  } catch (error) {

    throw error;
  }
};

export const calculateDeliveryFee = async (storefrontId: string, cartId: string, deliveryAddressLat: string, deliveryAddressLng: string): Promise<DeliveryFeeResponse> => {
  try {
    const response = await axiosClient.get(`${CALCULATE_DELIVERY_FEE_ENDPOINT}?cartId=${cartId}&deliveryAddressLat=${deliveryAddressLat}&deliveryAddressLng=${deliveryAddressLng}`, {
      headers: {
        "Store-Id": storefrontId
      }
    });
    return response.data;
  } catch (error) {

    throw error;
  }
};

