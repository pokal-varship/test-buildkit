export const orderStatusConfig = {
  createdAndPaymentPending: "CREATED_AND_PAYMENT_PENDING",
  created: "CREATED",
  accepted: "ACCEPTED",
  preparing: "PREPARING",
  readyForPickup: "READY_FOR_PICKUP",
  assigned: "ASSIGNED",
  onWayPickup: "ON_WAY_PICKUP",
  atPickup: "AT_PICKUP",
  pickedUp: "PICKED_UP",
  onWayDrop: "ON_WAY_DROP",
  atDrop: "AT_DROP",
  outForDelivery: "OUT_FOR_DELIVERY",
  delivered: "DELIVERED",
  cancelled: "CANCELLED",
  rejected: "REJECTED",
  paymentFailed: "PAYMENT_FAILED",
  refunded: "REFUNDED",
};

export const orderTypeConfig = {
  delivery: "DELIVERY",
  dineIn: "DINE_IN",
  pickup: "PICKUP",
};
