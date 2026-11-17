import {
  CUSTOMER_DELETE_ACCOUNT_REASON_CATEGORY,
  CUSTOMER_DELETE_ACCOUNT_REASON_TYPE_ID,
  DELETE_CUSTOMER_ACCOUNT_ENDPOINT,
  GET_ORDER_CANCEL_REASONS_ENDPOINT,
  GET_ORDER_CANCEL_REASON_TYPES_ENDPOINT,
  UPDATE_EMAIL_ENDPOINT,
  UPDATE_PHONE_ENDPOINT,
  UPDATE_PROFILE_ENDPOINT,
} from "@config/api.config";
import axiosClient from "./axios";
import { GuestAuthResponse } from "types";
import {
  CancelReasonResponse,
  OrderCancelReasonsPayload,
  ReasonTypeResponse,
} from "@components/type/order.type";

export const updateProfile = async (payload: {firstName?: string, lastName?: string, email?: string, phoneNumber?: string, countryCode?: string, phoneIsoCode?: string}): Promise<GuestAuthResponse> => {
    try {
        const response = await axiosClient.patch(UPDATE_PROFILE_ENDPOINT, payload);
        return response.data;
    } catch (error) {

        throw error;
    }
};

export const updateEmail = async (payload: { email: string }): Promise<GuestAuthResponse> => {
    try {
      const response = await axiosClient.get(`${UPDATE_EMAIL_ENDPOINT}?email=${payload.email}`);
      return response.data;
    } catch (error) {

      throw error;
    }
};

export const updateEmailOtp = async (payload: {email: string, otp: string}): Promise<GuestAuthResponse> => {
  try {
      const response = await axiosClient.patch(UPDATE_PROFILE_ENDPOINT, payload);
      return response.data;
  } catch (error) {

      throw error;
  }
};

export const updatePhone = async (payload: { phone: string; phoneIsoCode: string; countryCode: string }): Promise<GuestAuthResponse> => {
    try {
        const params = new URLSearchParams({
            phone: payload.phone,
            phoneIsoCode: payload.phoneIsoCode,
            countryCode: payload.countryCode,
        });
        const response = await axiosClient.get(`${UPDATE_PHONE_ENDPOINT}?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updatePhoneOtp = async (payload: { phone: string; countryCode: string; phoneIsoCode: string; otp: string }): Promise<GuestAuthResponse> => {
    try {
        const response = await axiosClient.patch(UPDATE_PROFILE_ENDPOINT, payload);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Reads Settings → Reasons `isReasonRequired` for Customer deletes account (type 9).
 * Missing / failed lookup → false (reason not mandatory).
 */
export const fetchDeleteAccountReasonRequired = async (): Promise<boolean> => {
  try {
    const response = await axiosClient.get<ReasonTypeResponse>(
      GET_ORDER_CANCEL_REASON_TYPES_ENDPOINT,
      {
        params: {
          category: CUSTOMER_DELETE_ACCOUNT_REASON_CATEGORY,
          reasonId: CUSTOMER_DELETE_ACCOUNT_REASON_TYPE_ID,
          skip: 0,
          limit: 10,
        },
      }
    );
    const types = Array.isArray(response.data?.data) ? response.data.data : [];
    const match =
      types.find(
        (row) => row.reasonId === CUSTOMER_DELETE_ACCOUNT_REASON_TYPE_ID
      ) ?? types[0];
    return match?.reasonId === CUSTOMER_DELETE_ACCOUNT_REASON_TYPE_ID
      ? match.isReasonRequired === true
      : false;
  } catch {
    return false;
  }
};

/**
 * Lists ACTIVE reasons for Customer deletes account (catalog type 9 / ACCOUNTS)
 * plus Settings → Reasons isReasonRequired for that type.
 */
export const getDeleteAccountReasons =
  async (): Promise<OrderCancelReasonsPayload> => {
    const isReasonRequiredPromise = fetchDeleteAccountReasonRequired();

    let reasons: CancelReasonResponse["data"] = [];
    try {
      const reasonsRes = await axiosClient.get<CancelReasonResponse>(
        GET_ORDER_CANCEL_REASONS_ENDPOINT,
        {
          params: {
            reasonId: CUSTOMER_DELETE_ACCOUNT_REASON_TYPE_ID,
            category: CUSTOMER_DELETE_ACCOUNT_REASON_CATEGORY,
            status: "ACTIVE",
          },
        }
      );
      reasons = Array.isArray(reasonsRes.data?.data) ? reasonsRes.data.data : [];
    } catch (error) {
      // 204 No Content = no reasons configured yet (still allow delete when optional).
      const status =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { status?: number } }).response?.status
          : undefined;
      if (status !== 204) {
        await isReasonRequiredPromise.catch(() => false);
        throw error;
      }
    }

    const isReasonRequired = await isReasonRequiredPromise;
    return { reasons, isReasonRequired };
  };

/**
 * Customer self-delete. Omits body `id` so backend uses catalog type 9
 * (Customer deletes account), not type 6 (Store removes customer).
 */
export const deleteCustomerAccount = async (
  reasonId?: string
): Promise<{ status?: string; message?: string }> => {
  const trimmedReasonId = reasonId?.trim() ?? "";
  const response = await axiosClient.patch(DELETE_CUSTOMER_ACCOUNT_ENDPOINT, {
    status: "DELETED",
    ...(trimmedReasonId ? { reason: trimmedReasonId } : {}),
  });
  return response.data;
};
