import { Order } from "@components/type/order.type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type OrderMqttPatchPayload = {
  orderId: string;
  status?: string;
  statusUpdatedAt?: number;
  orderData?: Partial<Order>;
};

interface OrdersState {
  orders: Order[] | [];
  isLoading: boolean;
  error: Error | null;
  currentOrderDetails: Order | null;
  isOrderDetailsLoading: boolean;
  orderDetailsError: Error | null;
  orderId: string | null;
  showOrderDetails: boolean;
  orderData: Order | null;
}

const initialState: OrdersState = {
  orders: [],
  isLoading: false,
  error: null,
  currentOrderDetails: null,
  isOrderDetailsLoading: false,
  orderDetailsError: null,
  orderId: null,
  showOrderDetails: true,
  orderData: null,
};

function matchesMqttOrder(
  order: Order,
  orderId: string,
  orderData?: Partial<Order>,
): boolean {
  const candidates = new Set(
    [orderId, orderData?.id, orderData?.orderNumber].filter(
      (value): value is string => Boolean(value?.trim()),
    ),
  );

  return candidates.has(order.id) || candidates.has(order.orderNumber);
}

function mergeOrderFromMqtt(
  order: Order,
  payload: OrderMqttPatchPayload,
): Order {
  const { orderData, status, statusUpdatedAt } = payload;
  const nextStatus = status ?? orderData?.status ?? order.status;
  const nextStatusUpdatedAt =
    orderData?.statusUpdatedAt ?? statusUpdatedAt ?? order.statusUpdatedAt;
  const statusChanged = nextStatus !== order.status;

  if (
    !statusChanged &&
    nextStatusUpdatedAt != null &&
    order.statusUpdatedAt != null &&
    nextStatusUpdatedAt <= order.statusUpdatedAt
  ) {
    return order;
  }

  return {
    ...order,
    status: nextStatus,
    statusUpdatedAt: nextStatusUpdatedAt ?? order.statusUpdatedAt,
    ...(orderData?.statusLogs ? { statusLogs: orderData.statusLogs } : {}),
    ...(orderData?.driverInfo
      ? {
          driverInfo: {
            ...order.driverInfo,
            ...orderData.driverInfo,
          },
        }
      : {}),
    ...(orderData?.reason != null ? { reason: orderData.reason } : {}),
    ...(orderData?.reasonType != null
      ? { reasonType: orderData.reasonType }
      : {}),
    ...(orderData?.reasonId != null ? { reasonId: orderData.reasonId } : {}),
    ...(orderData?.storefrontSlug
      ? { storefrontSlug: orderData.storefrontSlug }
      : {}),
    ...(orderData?.citySlug ? { citySlug: orderData.citySlug } : {}),
    ...(orderData?.areaSlug ? { areaSlug: orderData.areaSlug } : {}),
  };
}

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<Error | null>) => {
      state.error = action.payload;
    },
    setCurrentOrderDetails: (state, action: PayloadAction<Order | null>) => {
      state.currentOrderDetails = action.payload;
    },
    setIsOrderDetailsLoading: (state, action: PayloadAction<boolean>) => {
      state.isOrderDetailsLoading = action.payload;
    },
    setOrderDetailsError: (state, action: PayloadAction<Error | null>) => {
      state.orderDetailsError = action.payload;
    },
    setShowOrderDetails: (state, action: PayloadAction<boolean>) => {
      state.showOrderDetails = action.payload;
    },
    setOrderId: (state, action: PayloadAction<string | null>) => {
      state.orderId = action.payload;
    },
    clearOrderId: (state) => {
      state.orderId = null;
    },
    setOrderData: (state, action: PayloadAction<Order | null>) => {
      state.orderData = action.payload;
    },
    patchOrderFromMqtt: (state, action: PayloadAction<OrderMqttPatchPayload>) => {
      const payload = action.payload;
      if (!payload.orderId) return;

      let matched = false;

      state.orders = state.orders.map((order) => {
        if (!matchesMqttOrder(order, payload.orderId, payload.orderData)) {
          return order;
        }

        matched = true;
        return mergeOrderFromMqtt(order, payload);
      });

      if (
        state.currentOrderDetails &&
        matchesMqttOrder(
          state.currentOrderDetails,
          payload.orderId,
          payload.orderData,
        )
      ) {
        matched = true;
        state.currentOrderDetails = mergeOrderFromMqtt(
          state.currentOrderDetails,
          payload,
        );
      }

      if (!matched && process.env.NODE_ENV === "development") {
        console.warn(
          "[OrderMQTT] no matching order in Redux for",
          payload.orderId,
        );
      }
    },
  },
});

export const {
  setOrders,
  setIsLoading,
  setError,
  setCurrentOrderDetails,
  setIsOrderDetailsLoading,
  setOrderDetailsError,
  setOrderId,
  clearOrderId,
  setShowOrderDetails,
  setOrderData,
  patchOrderFromMqtt,
} = ordersSlice.actions;

export default ordersSlice.reducer;
