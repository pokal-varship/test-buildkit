import { open_dialog } from "@lib/modalHandler";

export const ORDER_SUCCESS_AUTO_REDIRECT_MS = 15_000;

const ORDER_SUCCESS_DIALOG_SX = {
  "& .MuiDialogContent-root": {
    backgroundColor: "var(--primary-background)",
  },
};

/** Same-origin order detail URL (avoids http/https mismatch). */
export const getOrderDetailUrl = (orderId: string): string => {
  if (typeof window === "undefined") {
    return `/orders/${orderId}`;
  }
  return `${window.location.origin}/orders/${orderId}`;
};

export const redirectToOrderDetail = (orderId: string): void => {
  if (typeof window === "undefined") return;
  window.location.href = getOrderDetailUrl(orderId);
};

export const openOrderSuccessDialog = (orderId: string): void => {
  open_dialog("orderSuccess", {
    open: true,
    propsData: {
      orderId,
      handleRedirectNow: () => redirectToOrderDetail(orderId),
    },
    type: "orderSuccess",
    handlerDialog: () => {},
    handleClose: () => {},
    anchor: "bottom",
    onlyDialog: true,
    sxStyle: ORDER_SUCCESS_DIALOG_SX,
  });
};

export const scheduleOrderSuccessRedirect = (
  orderId: string,
  delayMs = ORDER_SUCCESS_AUTO_REDIRECT_MS
): ReturnType<typeof setTimeout> =>
  setTimeout(() => redirectToOrderDetail(orderId), delayMs);
