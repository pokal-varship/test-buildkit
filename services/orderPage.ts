import {
  CANCEL_ORDER_ENDPOINT,
  CUSTOMER_ORDER_CANCEL_REASON_CATEGORY,
  CUSTOMER_ORDER_CANCEL_REASON_TYPE_ID,
  GET_ALL_ORDERS_ENDPOINT,
  GET_ORDER_CANCEL_REASONS_ENDPOINT,
  GET_ORDER_CANCEL_REASON_TYPES_ENDPOINT,
} from "@config/api.config";
import axiosClient from "./axios";
import {
  CancelOrderResponse,
  CancelReasonResponse,
  OrderByIdResponse,
  OrderCancelReasonsPayload,
  OrderResponse,
  ReasonTypeResponse,
} from "@components/type/order.type";

export const getAllOrders = async (
  tenantId: string,
  orderType?: string,
  searchTerm?: string,
  timeFilter?: string,
  startDate?: string,
  endDate?: string
): Promise<OrderResponse> => {
  const toUnixMilliseconds = (date: string | undefined) =>
    date ? new Date(date).getTime() : undefined;

  try {
    const response = await axiosClient.get(GET_ALL_ORDERS_ENDPOINT, {
      params: {
        ...(orderType && { status: orderType }),
        ...(searchTerm && { q: searchTerm }),
        ...(timeFilter && { timeFilter }),
        ...(timeFilter === 'CUSTOM_DATE' && {
          startDate: toUnixMilliseconds(startDate),
          endDate: toUnixMilliseconds(endDate),
        }),
      },
      headers: {
        "Tenant-Id": tenantId,
      },
    });
    return response.data;
  } catch (error) {

    throw error;
  }
};

export const getOrderById = async (
  orderId: string,
): Promise<OrderByIdResponse> => {
  try {
    const response = await axiosClient.get(GET_ALL_ORDERS_ENDPOINT, {
      params: {
        orderId,
      },
    });
    return response.data;
  } catch (error) {

    throw error;
  }
};

/**
 * Reads Settings → Reasons `isReasonRequired` for Customer cancels order (type 2).
 * Missing / failed lookup → false (reason not mandatory).
 */
export const fetchCustomerCancelReasonRequired = async (): Promise<boolean> => {
  try {
    const response = await axiosClient.get<ReasonTypeResponse>(
      GET_ORDER_CANCEL_REASON_TYPES_ENDPOINT,
      {
        params: {
          category: CUSTOMER_ORDER_CANCEL_REASON_CATEGORY,
          reasonId: CUSTOMER_ORDER_CANCEL_REASON_TYPE_ID,
          skip: 0,
          limit: 10,
        },
      }
    );
    const types = Array.isArray(response.data?.data) ? response.data.data : [];
    const match =
      types.find((row) => row.reasonId === CUSTOMER_ORDER_CANCEL_REASON_TYPE_ID) ??
      types[0];
    return match?.reasonId === CUSTOMER_ORDER_CANCEL_REASON_TYPE_ID
      ? match.isReasonRequired === true
      : false;
  } catch {
    return false;
  }
};

/**
 * Lists ACTIVE customer order-cancel reasons (catalog type 2 / ORDER)
 * plus Settings → Reasons isReasonRequired for that type.
 */
export const getOrderCancelReasons = async (): Promise<OrderCancelReasonsPayload> => {
  const isReasonRequiredPromise = fetchCustomerCancelReasonRequired();

  let reasons: CancelReasonResponse["data"] = [];
  try {
    const reasonsRes = await axiosClient.get<CancelReasonResponse>(
      GET_ORDER_CANCEL_REASONS_ENDPOINT,
      {
        params: {
          reasonId: CUSTOMER_ORDER_CANCEL_REASON_TYPE_ID,
          category: CUSTOMER_ORDER_CANCEL_REASON_CATEGORY,
          status: "ACTIVE",
        },
      }
    );
    reasons = Array.isArray(reasonsRes.data?.data) ? reasonsRes.data.data : [];
  } catch (error) {
    // 204 No Content = no reasons configured yet (still allow cancel when optional).
    const status =
      error &&
      typeof error === "object" &&
      "response" in error
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

export const cancelOrder = async (
  orderId: string,
  reasonId: string,
  storeId: string
): Promise<CancelOrderResponse> => {
  try {
    const trimmedReasonId = reasonId?.trim() ?? "";
    const response = await axiosClient.patch(
      CANCEL_ORDER_ENDPOINT,
      {
        orderId,
        reasonNo: CUSTOMER_ORDER_CANCEL_REASON_TYPE_ID,
        ...(trimmedReasonId ? { reasonId: trimmedReasonId } : {}),
      },
      {
        headers: {
          "Store-Id": storeId,
        },
      }
    );
    return response.data;
  } catch (error) {

    throw error;
  }
};
