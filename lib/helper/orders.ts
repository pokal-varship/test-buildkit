import { orderStatusConfig, orderTypeConfig } from "@app/orders/orders.config";
import { Step } from "@app/orders/OrderTracker";
import {
  Address,
  CustomerDetails,
  Modifier,
  ModifierGroup,
  Order,
  PaymentTender,
  RefundMethod,
} from "@components/type/order.type";
import DeliveryManIcon from "@components/icons/DeliveryManIcon";
import DineInIcon from "@components/icons/DineInIcon";
import TakeAwayIcon from "@components/icons/TakeAwayIcon";
import { APPROVE_ACTIVE_ICON, APPROVE_ICON, CASH_WALLET_ICON, COIN_ICON, COMPLETED_STEP_ICON, DELIVERY_ACTIVE_ICON, DELIVERY_ICON, DELIVERY_SUCCESS_ICON_LIGHT, MASTER_CARD_ICON, MONEY_ICON, ORDER_CANCEL_ICON, ORDERED_ICON, PICKED_UP_ICON, PREPARING_ICON, PREPARING_STEP_ACTIVE_ICON, READY_FOR_PICKUP_ACTIVE_ICON, READY_FOR_PICKUP_ICON, RECEIVE_ACTIVE_ICON, RECEIVE_ICON, UPI_LOGO_ICON } from "@config/Header/image.config";
import { toTimestampMs } from "@lib/helper/date";
import React from "react";
import { TranslationKeys } from "types";

export type OrderTypeIconProps = {
  width?: number;
  height?: number;
  fill?: string;
  className?: string;
  style?: React.CSSProperties;
};

export type OrderTypeIconComponent = React.FC<OrderTypeIconProps>;

export const getOrderStatusIcon = (orderType: string): OrderTypeIconComponent => {
  if (orderType === orderTypeConfig.delivery) {
    return DeliveryManIcon;
  }
  if (orderType === orderTypeConfig.dineIn) {
    return DineInIcon;
  }
  return TakeAwayIcon;
};

export const getOrderTypeLabel = (orderType: string, lang: TranslationKeys): string => {
  if (orderType === orderTypeConfig.delivery) {
    return lang.delivery;
  }
  if (orderType === orderTypeConfig.dineIn) {
    return lang.dineIn;
  }
  return lang.takeaway;
};

export const getAllModifiers = (modifierGroups: ModifierGroup[] | undefined | null): Modifier[] => {
  return modifierGroups?.flatMap(group => group.modifiers) || [];
}

export const getPayloadStatus = (status: string) => {

  if (status === "ONGOING") {
    return `${orderStatusConfig.createdAndPaymentPending},${orderStatusConfig.created},${orderStatusConfig.accepted},${orderStatusConfig.preparing},${orderStatusConfig.readyForPickup},${orderStatusConfig.assigned},${orderStatusConfig.onWayPickup},${orderStatusConfig.atPickup},${orderStatusConfig.pickedUp},${orderStatusConfig.onWayDrop},${orderStatusConfig.atDrop},${orderStatusConfig.outForDelivery},${orderStatusConfig.rejected},${orderStatusConfig.paymentFailed}`;
  }
  if(status === "COMPLETED"){
    return orderStatusConfig.delivered;
  }
  if(status === "REFUNDED"){
    return orderStatusConfig.cancelled;
  }
  return '';
};

export const getFullAddress = (address?: Partial<Address> | null) => {
  const {
    addressLine1,
    addressLine2,
    landmark,
    city,
    state,
    country,
    postalCode,
  } = address ?? {};

  const parts = [
    addressLine1?.trim(),
    addressLine2?.trim(),
    landmark?.trim(),
    city?.trim(),
    state?.trim(),
    country?.trim(),
    postalCode?.trim()
  ].filter((part) => part && part !== "");

  if (parts.length === 0) return "Unknown Address";

  return parts.join(", ");
};

export const getStatusIcon = (
  status: string,
  isActive: boolean,
  orderType?: string,
): string => {
  if(status === orderStatusConfig.createdAndPaymentPending || status === orderStatusConfig.created || status === orderStatusConfig.paymentFailed){
    return ORDERED_ICON;
  }
  if(status === orderStatusConfig.accepted){
    return isActive ? APPROVE_ACTIVE_ICON : APPROVE_ICON;
  }
  if(status === orderStatusConfig.preparing){
    return isActive ? PREPARING_STEP_ACTIVE_ICON : PREPARING_ICON;
  }
  if (status === orderStatusConfig.readyForPickup) {
    return isActive ? READY_FOR_PICKUP_ACTIVE_ICON : READY_FOR_PICKUP_ICON;
  }
  if (
    status === orderStatusConfig.assigned ||
    status === orderStatusConfig.onWayPickup ||
    status === orderStatusConfig.atPickup ||
    status === orderStatusConfig.pickedUp ||
    status === orderStatusConfig.onWayDrop ||
    status === orderStatusConfig.atDrop ||
    status === orderStatusConfig.outForDelivery
  ) {
    return isActive ? DELIVERY_ACTIVE_ICON : DELIVERY_ICON;
  }
  if (status === orderStatusConfig.delivered) {
    if (orderType === orderTypeConfig.pickup) {
      return PICKED_UP_ICON;
    }
    return isActive ? RECEIVE_ACTIVE_ICON : RECEIVE_ICON;
  }
  if (status === orderStatusConfig.cancelled) {
    return isActive ? DELIVERY_SUCCESS_ICON_LIGHT : DELIVERY_ICON;
  }
  return DELIVERY_SUCCESS_ICON_LIGHT;
  
}

export const getOrderStepCompletedLabel = (label: string, lang: TranslationKeys) => {
  if(label === lang.order.orderLabels.delivery){
    return lang.order.orderLabels.delivered;
  }
  if(label === lang.order.orderLabels.preparing){
    return lang.order.orderLabels.prepared;
  }
  if(label === lang.order.orderLabels.readyToPickup){
    return lang.order.orderLabels.readyToPickup;
  }
  return label; 
}
export const getOrderCurrentStepLabel = (label: string, lang: TranslationKeys) => {
  if (label === lang.order.orderLabels.delivery) {
    return lang.order.orderLabels.delivering;
  }
  if (label === lang.order.orderLabels.preparing) {
    return lang.order.orderLabels.preparing;
  }
  if (label === lang.order.orderLabels.readyToPickup) {
    return lang.order.orderLabels.readyToPickup;
  }
  return label;
};


const getDeliveryTrackerStepValue = (status: string): string => {
  if (
    status === orderStatusConfig.createdAndPaymentPending ||
    status === orderStatusConfig.created ||
    status === orderStatusConfig.paymentFailed
  ) {
    return orderStatusConfig.createdAndPaymentPending;
  }
  if (
    status === orderStatusConfig.accepted ||
    status === orderStatusConfig.preparing
  ) {
    return orderStatusConfig.preparing;
  }
  if (
    status === orderStatusConfig.readyForPickup ||
    status === orderStatusConfig.assigned ||
    status === orderStatusConfig.onWayPickup ||
    status === orderStatusConfig.atPickup ||
    status === orderStatusConfig.pickedUp ||
    status === orderStatusConfig.onWayDrop ||
    status === orderStatusConfig.atDrop ||
    status === orderStatusConfig.outForDelivery
  ) {
    return orderStatusConfig.outForDelivery;
  }
  if (status === orderStatusConfig.delivered) {
    return orderStatusConfig.delivered;
  }
  return status;
};

const getPickupTrackerStepValue = (status: string): string => {
  if (
    status === orderStatusConfig.createdAndPaymentPending ||
    status === orderStatusConfig.created ||
    status === orderStatusConfig.paymentFailed
  ) {
    return orderStatusConfig.createdAndPaymentPending;
  }
  if (
    status === orderStatusConfig.accepted ||
    status === orderStatusConfig.preparing
  ) {
    return orderStatusConfig.preparing;
  }
  if (status === orderStatusConfig.readyForPickup) {
    return orderStatusConfig.readyForPickup;
  }
  if (status === orderStatusConfig.delivered) {
    return orderStatusConfig.delivered;
  }
  return status;
};

const getTrackerStatus = (status: string, orderType?: string): string => {
  if (orderType === orderTypeConfig.delivery) {
    return getDeliveryTrackerStepValue(status);
  }
  if (orderType === orderTypeConfig.pickup) {
    return getPickupTrackerStepValue(status);
  }

  if (
    status === orderStatusConfig.accepted ||
    status === orderStatusConfig.readyForPickup
  ) {
    return orderStatusConfig.preparing;
  }
  if (
    status === orderStatusConfig.assigned ||
    status === orderStatusConfig.onWayPickup ||
    status === orderStatusConfig.atPickup ||
    status === orderStatusConfig.pickedUp ||
    status === orderStatusConfig.onWayDrop ||
    status === orderStatusConfig.atDrop
  ) {
    return orderStatusConfig.outForDelivery;
  }
  return status;
};

export const getOrderSteps = (status: string, lang: TranslationKeys, orderType?: string): Step[] => {
  if (status == orderStatusConfig.cancelled || status == orderStatusConfig.refunded){
    return [
      {
        id: 1,
        label: lang.order.orderLabels.ordered,
        icon: ORDERED_ICON,
        value: orderStatusConfig.cancelled,
        isCompleted: true,
      },
      {
        id: 2,
        label: lang.order.orderLabels.cancelled,
        icon: ORDER_CANCEL_ICON,
        value: orderStatusConfig.cancelled,
        isCompleted: true,
      },
    ];
  }
    const baseSteps: Step[] = [
      {
        id: 1,
        label: lang.order.orderLabels.ordered,
        icon: ORDERED_ICON,
        value: orderStatusConfig.createdAndPaymentPending,
        isCompleted: true,
      },
      {
        id: 2,
        label: lang.order.orderLabels.preparing,
        icon: PREPARING_ICON,
        value: orderStatusConfig.preparing,
        isCompleted: true,
      },
    ];

    const deliverySteps: Step[] = orderType === orderTypeConfig.delivery ? [
      {
        id: 4,
        label: lang.order.orderLabels.delivery,
        desktopLabel: lang.order.orderLabels.outForDelivery,
        icon: DELIVERY_ICON,
        value: orderStatusConfig.outForDelivery,
        isCompleted: false,
      },
      {
        id: 5,
        label: lang.order.orderLabels.delivered,
        icon: RECEIVE_ICON,
        value: orderStatusConfig.delivered,
        isCompleted: false,
      },
    ] : orderType === orderTypeConfig.pickup ? [
      {
        id: 4,
        label: lang.order.orderLabels.readyToPickup,
        icon: READY_FOR_PICKUP_ICON,
        value: orderStatusConfig.readyForPickup,
        isCompleted: false,
      },
      {
        id: 5,
        label: lang.order.orderLabels.pickedUp,
        icon: PICKED_UP_ICON,
        value: orderStatusConfig.delivered,
        isCompleted: false,
      },
    ] : [
      {
        id: 4,
        label: lang.order.orderLabels.received,
        icon: RECEIVE_ICON,
        value: orderStatusConfig.delivered,
        isCompleted: false,
      },
    ];

    const orderSteps: Step[] = [...baseSteps, ...deliverySteps];

  if (
    status === orderStatusConfig.delivered &&
    (orderType === orderTypeConfig.delivery ||
      orderType === orderTypeConfig.pickup)
  ) {
    return orderSteps.map((step, idx) => ({
      ...step,
      icon: COMPLETED_STEP_ICON,
      iconSize: 40,
      isCompleted: true,
      label:
        idx < orderSteps.length - 1
          ? getOrderStepCompletedLabel(step.label, lang)
          : step.label,
    }));
  }

  const isEarlyCreatedStatus =
    status === orderStatusConfig.createdAndPaymentPending ||
    status === orderStatusConfig.created ||
    status === orderStatusConfig.paymentFailed;

  if (
    isEarlyCreatedStatus &&
    orderType !== orderTypeConfig.delivery &&
    orderType !== orderTypeConfig.pickup
  ) {
    const doneSteps = orderSteps.slice(0, 1).map((step) => ({
      ...step,
      icon: ORDERED_ICON,
      iconSize: 60,
      isCompleted: true,
      isActive: true,
    }));
    const pendingSteps = orderSteps.slice(1).map((step) => ({
      ...step,
      isCompleted: false,
    }));
    return [...doneSteps, ...pendingSteps];
  } else {
    const index = orderSteps.findIndex(
      (step) => step.value === getTrackerStatus(status, orderType),
    );
    if(index === -1){
      return orderSteps;
    }else{
      const doneSteps = orderSteps.slice(0, index + 1).map((step, idx) => ({
        ...step,
        icon:
          idx < index
            ? COMPLETED_STEP_ICON
            : getStatusIcon(step.value, true, orderType),
        iconSize: idx < index ? 40 : 60,
        label:
          idx < index
            ? getOrderStepCompletedLabel(step.label, lang)
            : idx === index
            ? step.label == lang.order.orderLabels.receive
              ? lang.order.orderLabels.received
              : getOrderCurrentStepLabel(step.label, lang)
            : step.label,
        isCompleted: idx < index,
        isActive: idx === index,
      }));
    const pendingSteps = orderSteps.slice(index + 1).map((step) => ({
      ...step,
      isCompleted: false,
      }));
      return [...doneSteps, ...pendingSteps];
    }
  }
};

export const getOrderType = (orderType: string) => {
  if(orderType === orderTypeConfig.dineIn){
    return "DINE IN";
  }
  return orderType;
}

export const isShowCancelButton = (status: string, paymentMethod?: string): boolean => {
  const relevantStatuses = [
    orderStatusConfig.created,
  ];
  
  // For cash payments, allow cancellation in both CREATED and CREATED_AND_PAYMENT_PENDING statuses
  if (paymentMethod === "CASH") {
    const cashRelevantStatuses = [
      orderStatusConfig.created,
      orderStatusConfig.createdAndPaymentPending,
    ];
    return cashRelevantStatuses.includes(status);
  }
  
  return relevantStatuses.includes(status);
};

export const getOrderStatusLabel = (status: string, lang: TranslationKeys) => {
 if(status === orderStatusConfig.delivered){
  return lang.order.completed;
 }
 if(status === orderStatusConfig.cancelled){
  return lang.order.cancelled;
 }
 if(status === orderStatusConfig.refunded){
  return lang.order.refunded;
 }
 if(status === orderStatusConfig.rejected){
  return lang.order.orderLabels.rejected;
 }
 if(status === orderStatusConfig.paymentFailed){
  return lang.order.orderLabels.paymentFailed;
 }
  return lang.order.ongoing;
}

export const getOrderDetailsStatusHeading = (
  status: string,
  lang: TranslationKeys,
  orderType?: string,
): string => {
  const { statusHeadings, orderLabels } = lang.order;
  const isDelivery = orderType === orderTypeConfig.delivery;
  const isPickup = orderType === orderTypeConfig.pickup;

  if (
    status === orderStatusConfig.created ||
    status === orderStatusConfig.createdAndPaymentPending
  ) {
    return isPickup
      ? statusHeadings.pickupOrderConfirmed
      : statusHeadings.orderPending;
  }
  if (status === orderStatusConfig.paymentFailed) {
    return statusHeadings.paymentFailed;
  }
  if (status === orderStatusConfig.readyForPickup) {
    if (isDelivery) {
      return statusHeadings.findingYourPartner;
    }
    if (isPickup) {
      return statusHeadings.pickupOrderReady;
    }
    return statusHeadings.readyForPickup;
  }
  if (
    status === orderStatusConfig.accepted ||
    status === orderStatusConfig.preparing
  ) {
    return statusHeadings.preparingYourOrder;
  }
  if (status === orderStatusConfig.assigned) {
    return statusHeadings.partnerAssigned;
  }
  if (status === orderStatusConfig.onWayPickup) {
    return isDelivery
      ? statusHeadings.partnerOnTheWayToPickup
      : statusHeadings.onTheWayToPickup;
  }
  if (status === orderStatusConfig.atPickup) {
    return isDelivery
      ? statusHeadings.partnerAtRestaurant
      : statusHeadings.atPickup;
  }
  if (status === orderStatusConfig.pickedUp) {
    return isDelivery
      ? statusHeadings.orderPickedUp
      : statusHeadings.pickedUp;
  }
  if (status === orderStatusConfig.onWayDrop) {
    return statusHeadings.onTheWay;
  }
  if (status === orderStatusConfig.atDrop) {
    return statusHeadings.arrivingSoon;
  }
  if (status === orderStatusConfig.outForDelivery) {
    return orderLabels.outForDelivery;
  }
  if (status === orderStatusConfig.delivered) {
    return isPickup
      ? statusHeadings.pickupOrderPickedUp
      : statusHeadings.orderDelivered;
  }
  if (status === orderStatusConfig.rejected) {
    return statusHeadings.orderRejected;
  }
  if (status === orderStatusConfig.cancelled) {
    return statusHeadings.orderCancelled;
  }
  return "";
};

export const getOrderDetailsStatusSubtitle = (
  status: string,
  lang: TranslationKeys,
  partnerName?: string,
  orderType?: string,
): string => {
  const { statusSubtitles } = lang.order;
  const isPickup = orderType === orderTypeConfig.pickup;
  const withPartnerName = (template: string) =>
    template.replace("{{partnerName}}", partnerName?.trim() || "");

  if (
    status === orderStatusConfig.created ||
    status === orderStatusConfig.createdAndPaymentPending
  ) {
    return isPickup
      ? statusSubtitles.pickupOrderConfirmed
      : statusSubtitles.orderPending;
  }
  if (status === orderStatusConfig.preparing) {
    return isPickup
      ? statusSubtitles.pickupPreparing
      : statusSubtitles.preparingYourOrder;
  }
  if (status === orderStatusConfig.accepted) {
    return statusSubtitles.preparingYourOrder;
  }
  if (status === orderStatusConfig.readyForPickup) {
    return isPickup
      ? statusSubtitles.pickupReadyForPickup
      : statusSubtitles.readyForPickup;
  }
  if (status === orderStatusConfig.assigned) {
    return withPartnerName(statusSubtitles.partnerAssigned);
  }
  if (status === orderStatusConfig.onWayPickup) {
    return withPartnerName(statusSubtitles.onTheWayToPickup);
  }
  if (status === orderStatusConfig.atPickup) {
    return withPartnerName(statusSubtitles.atPickup);
  }
  if (status === orderStatusConfig.pickedUp) {
    return withPartnerName(statusSubtitles.pickedUp);
  }
  if (status === orderStatusConfig.onWayDrop) {
    return withPartnerName(statusSubtitles.onTheWay);
  }
  if (status === orderStatusConfig.atDrop) {
    return withPartnerName(statusSubtitles.arrivingSoon);
  }
  if (status === orderStatusConfig.delivered) {
    return isPickup
      ? statusSubtitles.pickupOrderPickedUp
      : statusSubtitles.orderDelivered;
  }
  return "";
};

type OrderWithReasonData = Order & {
  data?: Array<{ reason?: string }>;
};

export const getOrderStatusReason = (
  order: Order | null | undefined,
): string => {
  if (!order) return "";

  const nestedReason = (order as OrderWithReasonData).data?.[1]?.reason;
  return (nestedReason || order.reason || "").trim();
};

export const isOngoingOrderStatus = (status: string): boolean =>
  status !== orderStatusConfig.delivered &&
  status !== orderStatusConfig.cancelled &&
  status !== orderStatusConfig.refunded &&
  status !== orderStatusConfig.rejected &&
  status !== orderStatusConfig.paymentFailed;

export const getOrderStatusColor = (status: string) => {
  if (status === orderStatusConfig.delivered) {
    return "var(--success)";
  }
  if (status === orderStatusConfig.cancelled || status === orderStatusConfig.rejected || status === orderStatusConfig.paymentFailed) {
    return "var(--error)";
  }
  return "var(--accent-color)";
};

export const getOrderStatusOuterDotColor = (): string =>
  "color-mix(in srgb, var(--accent-color) 20%, transparent)";
// note: REJECTED | READY_FOR_PICKUP | CANCELLED need to discuss

export const getOrderPaymentTenders = (order: Order): PaymentTender[] =>
  order.payment?.parties?.[0]?.tenders?.filter(Boolean) ?? [];

export const getTenderAmount = (tender: PaymentTender): number =>
  tender.paidAmount ?? 0;

export const getTenderType = (tender: PaymentTender): string =>
  normalizeTenderType(tender.tenderType ?? tender.type);

export const getTenderLoyaltyPoints = (tender: PaymentTender): number =>
  tender.loyaltyPoints ??
  tender.points ??
  tender.redemptionPoints ??
  0;

export const getTenderCardLast4 = (
  tender: PaymentTender,
): string | undefined => {
  const gatewayData =
    typeof tender.gatewayData === "object" ? tender.gatewayData : undefined;
  return gatewayData?.last4 ?? tender.last4;
};

export const hasAssignedDriver = (
  driverInfo?: { name?: string; driverId?: string; id?: string } | null,
): boolean => {
  if (!driverInfo) return false;
  return Boolean(
    driverInfo.name?.trim() ||
      driverInfo.driverId?.trim() ||
      driverInfo.id?.trim(),
  );
};

export const maskPhoneNumber = (phone?: string): string => {
  if (!phone?.trim()) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  return `${digits.slice(0, 3)} xxx xxxx`;
};

export const getCustomerFirstName = (
  customer?: CustomerDetails | null,
): string => customer?.firstName?.trim() || "";

export const getCustomerFullName = (
  customer?: CustomerDetails | null,
): string => {
  if (!customer) return "";
  return `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim();
};

export const getDeliveryAddressTitle = (
  type: string | undefined,
  lang: TranslationKeys,
): string => {
  const normalizedType = type?.trim();
  if (!normalizedType) return lang.order.deliverTo;
  if (/^delivery\s+at\s+/i.test(normalizedType)) return normalizedType;
  return lang.order.deliveryAt.replace("{{type}}", normalizedType);
};

export const formatCustomerContactLine = (
  customer?: CustomerDetails | null,
): string => {
  const name = getCustomerFullName(customer);
  const maskedPhone = maskPhoneNumber(customer?.phone);
  const countryCode = customer?.countryCode?.trim();
  const phoneDisplay = maskedPhone
    ? [countryCode, maskedPhone].filter(Boolean).join(" ")
    : "";

  if (name && phoneDisplay) return `${name}, ${phoneDisplay}`;
  return name || phoneDisplay;
};

export const normalizeTenderType = (tenderType?: string | null): string => {
  const normalized = (tenderType ?? "").toUpperCase();
  return normalized === "WALLET" ? "CASH_WALLET" : normalized;
};

export const getRefundTenderType = (
  refund: RefundMethod | null | undefined,
): string => normalizeTenderType(refund?.tenderType);

const isRefundStatusRefunded = (
  refund: RefundMethod | null | undefined,
): boolean => (refund?.status ?? "").toUpperCase() === "REFUNDED";

export const getValidRefundMethods = (
  refundMethods?: Array<RefundMethod | null | undefined> | null,
): RefundMethod[] =>
  (refundMethods ?? []).filter(
    (refund): refund is RefundMethod => refund != null,
  );

export const getRefundMethodIcon = (
  refund: RefundMethod | null | undefined,
): string => {
  switch (getRefundTenderType(refund)) {
    case "LOYALTY_POINTS":
      return COIN_ICON;
    case "CASH_WALLET":
      return CASH_WALLET_ICON;
    case "UPI":
      return UPI_LOGO_ICON;
    case "CARD":
    case "ONLINE":
      return MASTER_CARD_ICON;
    case "CASH":
      return MONEY_ICON;
    default:
      return MONEY_ICON;
  }
};

export const getRefundMethodLabel = (
  refund: RefundMethod | null | undefined,
  lang: TranslationKeys,
  order?: Order | null,
): string => {
  if (!refund) return lang.refundMethod;
  const tenderType = getRefundTenderType(refund);

  switch (tenderType) {
    case "LOYALTY_POINTS": {
      const points = getRefundLoyaltyPoints(refund, order);
      return points > 0
        ? lang.order.loyaltyPointsWithCount.replace(
            "{{points}}",
            String(points),
          )
        : lang.loyaltyPoints;
    }
    case "CASH_WALLET":
      return lang.wallet;
    case "UPI":
      return lang.upiPayment;
    case "CARD":
    case "ONLINE":
      return lang.cardEnding;
    case "CASH":
      return lang.cash;
    default:
      return tenderType || lang.refundMethod;
  }
};

export const isOnlineRefundMethod = (
  refund: RefundMethod | null | undefined,
): boolean => {
  if (!refund) return false;
  const tenderType = getRefundTenderType(refund);
  return ["UPI", "CARD", "ONLINE"].includes(tenderType);
};

export const getRefundMethodStatusMessage = (
  refund: RefundMethod | null | undefined,
  lang: TranslationKeys,
  formatAmount: (amount: number) => string,
  formatDate: (timestamp: number) => string,
): string => {
  if (!refund) return lang.order.refundStatusPending;
  const tenderType = getRefundTenderType(refund);

  switch (tenderType) {
    case "CASH_WALLET":
      return isRefundStatusRefunded(refund)
        ? lang.order.walletRefundInstant
        : lang.order.refundStatusPending;
    case "LOYALTY_POINTS":
      return isRefundStatusRefunded(refund)
        ? lang.order.loyaltyPointsRefundRestored
        : lang.order.refundStatusPending;
    case "CASH":
      return lang.order.cashRefundNotCollected;
    default: {
      const refundAt = toTimestampMs(refund.expectedRefundAt) ?? 0;
      if (!refundAt) return lang.order.refundStatusPending;

      const amount = formatAmount(refund.amount);
      const date = formatDate(refundAt);
      const messageTemplate =
        refundAt > Date.now()
          ? lang.order.refundExpectedOn
          : lang.order.refundedAmountOn;

      return messageTemplate
        .replace("{{amount}}", amount)
        .replace("{{date}}", date);
    }
  }
};

export const getRefundStatusLabel = (
  refund: RefundMethod | null | undefined,
  lang: TranslationKeys,
): string => {
  if (!refund) return lang.order.refundStatusPending;
  if (refund.status) {
    const normalized = refund.status.toUpperCase();
    if (
      normalized === "PROCESSED" ||
      normalized === "COMPLETED" ||
      normalized === "REFUNDED"
    ) {
      return lang.order.refundStatusProcessed;
    }
    if (normalized === "PENDING") {
      return lang.order.refundStatusPending;
    }
    return refund.status;
  }

  const refundAt = toTimestampMs(refund.expectedRefundAt) ?? 0;
  if (!refundAt) return lang.order.refundStatusPending;

  return refundAt <= Date.now()
    ? lang.order.refundStatusProcessed
    : lang.order.refundStatusPending;
};

export const getRefundPaymentMethodLabel = (
  refund: RefundMethod | null | undefined,
  lang: TranslationKeys,
  order?: Order | null,
): string => {
  if (!refund) return lang.refundMethod;
  const methodLabel = getRefundMethodLabel(refund, lang, order);
  return lang.order.originalPaymentMethod.replace("{{method}}", methodLabel);
};

export const getRefundLoyaltyPoints = (
  refund: RefundMethod | null | undefined,
  order?: Order | null,
): number => {
  if (!refund) return 0;
  if (refund.loyaltyPoints && refund.loyaltyPoints > 0) {
    return refund.loyaltyPoints;
  }

  if (getRefundTenderType(refund) !== "LOYALTY_POINTS" || !order) return 0;

  const tender = getOrderPaymentTenders(order).find(
    (item) => getTenderType(item) === "LOYALTY_POINTS",
  );

  return tender ? getTenderLoyaltyPoints(tender) : 0;
};

