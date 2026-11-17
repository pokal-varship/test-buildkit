"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
// import BackArrow from "@components/icons/BackArrow";
import {
  selectQrResolveData,
  selectDineInSessionData,
  selectSessionSummary,
  selectIsQrFlowActive,
  selectSessionId,
  selectSessionTablePin,
  selectQrFlowTableNumber,
  setTableDetails,
} from "@redux/slices/qrFlowSlice";
import { RootState } from "@redux/store";
import { getFormattedTime } from "@lib/helper/date";
import { isTimeZone } from "@lib/helper";
import useLang from "@hooks/useLang";
import { TranslationKeys } from "types";
import useProductUrl from "@hooks/useProductUrl";
import OrderDetailsContainerSkeleton from "@app/orders/OrderDetailsContainerSkeleton";
import KitchenTicket from "@components/order/KitchenTicket";
import KitchenTicketItemDetail from "@components/order/KitchenTicketItemDetail";
import OrderSummarySection from "@components/order/OrderSummarySection";
import DeliveryTipInput from "@components/order/DeliveryTipInput";
import CustomButton from "@components/buttons/Button";
import SecondaryButton from "@components/buttons/secondaryButton";
import NoDataPlaceholder from "@components/no-data-placeholder/no-data-placeholder";
import { useQrFullMenuNavigation } from "@hooks/useQrFullMenuNavigation";
import { useToast } from "@components/toast/Toast";
import {
  setCurrentOrderDetails,
  setOrderData,
  setOrderId,
} from "@redux/slices/ordersSlice";
import { open_dialog, close_dialog } from "@lib/modalHandler";
import { QR_PAYMENT_METHOD_CASH } from "@components/dialogDrawer/modal/Order/QrPaymentMethodDialog";
import TablePinBadge from "@components/TablePinBadge";
import { ticketStatusConfig } from "@config/ticketStatus.config";
import { clearQrFlow } from "@redux/slices/qrFlowSlice";
import { fetchStorefrontTableById } from "@services/tableService";
import { checkout } from "@services/checkOutService";
import {
  createSessionCart,
  type CreateSessionCartPayload,
} from "@services/sessionService";
import type {
  CheckoutResponse,
  QrTenantOrderCheckoutPayload,
} from "@components/checkOut/checkout.type";
import {
  ORDER_TOGETHER_ICON,
  NO_ORDERS_PLACEHOLDER,
} from "@config/Header/image.config";
import Shimmer from "@components/ui/Shimmer";
import { useSessionTickets } from "@hooks/useQrSessionDerivedState";
import useAnalytics from "@hooks/useAnalytics";
import { getTenantConfig } from "@config/tenant.config";
import { sanitizeAnalyticsErrorMessage } from "@lib/analytics/dineInAnalytics";
import { useStoreDataBootstrap } from "@app/StoreDataProvider";

/**
 * QR Checkout order-details-style view.
 * Same layout as Order Details page: back + title, order/session id + date,
 * DINE IN pill, store card, track order timeline, items list, order summary.
 * Data comes from QR session (dineInSessionData, qrResolveData).
 */
export default function QrCheckoutOrderView() {
  const router = useRouter();
  const { bootstrapStore } = useStoreDataBootstrap();
  const dispatch = useDispatch();
  const [lang] = useLang() as [TranslationKeys, "en" | "ar"];
  const { getOrdersUrl, getPaymentUrl } = useProductUrl();
  const { navigateToQrFullMenu } = useQrFullMenuNavigation();
  const toast = useToast();
  const tenantConfig = getTenantConfig();
  const hasTrackedActiveOrderView = React.useRef(false);
  const {
    trackDineInActiveOrderViewed,
    trackDineInPayNowClicked,
    trackDineInPaymentCompleted,
    trackDineInPaymentFailed,
    trackDineInAddMoreItemsClicked,
    trackDineInPaymentSuccessModalViewed,
  } = useAnalytics();
  const [isSubmittingPayment, setIsSubmittingPayment] = React.useState(false);
  const [isTableDetailsLoading, setIsTableDetailsLoading] =
    React.useState(false);

  const qrResolveData = useSelector(selectQrResolveData);
  const dineInSessionData = useSelector(selectDineInSessionData);
  const sessionTablePin = useSelector(selectSessionTablePin);
  const sessionTickets = useSessionTickets();
  const sessionSummary = useSelector(selectSessionSummary);
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const sessionId = useSelector(selectSessionId);
  const qrFlowTableNumber = useSelector(selectQrFlowTableNumber);
  const servingStaffName = useSelector((state: RootState) => {
    const name = state.qrFlow?.tableDetails?.servingStaffDetails?.name;
    return typeof name === "string" && name.trim() ? name.trim() : null;
  });

  React.useEffect(() => {
    const slug = qrResolveData?.storefrontSlug?.trim();
    if (!slug) return;
    void bootstrapStore(slug);
  }, [bootstrapStore, qrResolveData?.storefrontSlug]);

  // Show PIN purely based on session response
  const showOrderTogetherSection = Boolean(sessionTablePin);
  const tablePinDisplay = sessionTablePin ?? "—";
  // const sessionUpdatedAt = useSelector(selectSessionUpdatedAt);
  const storeId =
    useSelector((state: RootState) => state.store?.currentStore?.id) ??
    qrResolveData?.storefrontId ??
    "";
  const storeNameFromRedux = useSelector(
    (state: RootState) => state.store?.currentStore?.name,
  );

  // const onBack = () => {
  //   router.push(getOrdersUrl());
  // };

  const handleMoreItems = () => {
    void trackDineInAddMoreItemsClicked({
      source: "qr_checkout",
      session_id: String(sessionId || ""),
    });
    navigateToQrFullMenu();
  };

  const storeName =
    qrResolveData?.storefrontName ??
    qrResolveData?.restaurant?.name ??
    (storeNameFromRedux as string | undefined) ??
    "";

  // Fetch table details so we can show server name in tip card.
  React.useEffect(() => {
    const tableId = String(qrResolveData?.tableId ?? "").trim();
    if (!tableId) {
      setIsTableDetailsLoading(false);
      dispatch(setTableDetails(null));
      return;
    }

    const abortController = new AbortController();
    setIsTableDetailsLoading(true);

    (async () => {
      try {
        const table = await fetchStorefrontTableById(
          tableId,
          abortController.signal,
          storeId || undefined,
        );
        if (abortController.signal.aborted) return;
        dispatch(setTableDetails(table));
      } catch (err) {
        if (abortController.signal.aborted) return;
        if ((err as { name?: string })?.name === "AbortError") return;
        dispatch(setTableDetails(null));
      } finally {
        if (abortController.signal.aborted) return;
        setIsTableDetailsLoading(false);
      }
    })();

    return () => abortController.abort();
  }, [dispatch, qrResolveData?.tableId, storeId]);

  // All required fields are already in sessionSummary from Redux selector
  const itemSubTotal: number =
    (sessionSummary?.itemSubTotal as number | undefined) ?? 0;
  const itemLevelTax: number =
    (sessionSummary?.itemLevelTax as number | undefined) ??
    (sessionSummary?.totalTax as number | undefined) ??
    0;
  const itemLevelDiscount: number =
    (sessionSummary?.itemLevelDiscount as number | undefined) ??
    (sessionSummary?.totalDiscount as number | undefined) ??
    0;
  const finalAmount: number =
    (sessionSummary?.finalAmount as number | undefined) ?? 0;

  const getQrCheckoutItemCount = () =>
    sessionTickets.reduce(
      (sum, ticket) => sum + (ticket.items?.length ?? 0),
      0,
    );

  React.useEffect(() => {
    if (
      hasTrackedActiveOrderView.current ||
      !isQrFlowActive ||
      !qrResolveData ||
      !dineInSessionData
    ) {
      return;
    }

    hasTrackedActiveOrderView.current = true;
    const draftTickets = sessionTickets.filter(
      (ticket) =>
        !ticket.status ||
        ticket.status.toUpperCase() === ticketStatusConfig.draft,
    );
    const submittedTickets = sessionTickets.filter((ticket) => {
      const status = ticket.status?.toUpperCase();
      return status && status !== ticketStatusConfig.draft;
    });

    void trackDineInActiveOrderViewed({
      session_id: String(sessionId || ""),
      table_number: String(qrFlowTableNumber || ""),
      store_id: String(storeId),
      store_name: storeName,
      item_count: getQrCheckoutItemCount(),
      cart_value: finalAmount,
      ticket_count: sessionTickets.length,
      has_draft_ticket: draftTickets.length > 0,
      has_submitted_tickets: submittedTickets.length > 0,
    });
  }, [
    isQrFlowActive,
    qrResolveData,
    dineInSessionData,
    sessionTickets,
    sessionId,
    qrFlowTableNumber,
    storeId,
    storeName,
    finalAmount,
    trackDineInActiveOrderViewed,
  ]);

  const handlePayNow = () => {
    if (!sessionId || !storeId) {
      toast(
        "error",
        lang.order?.noOrderDetailsFound ?? "Session or store not found.",
      );
      return;
    }
    void trackDineInPayNowClicked({
      session_id: String(sessionId),
      cart_value: finalAmount,
      item_count: getQrCheckoutItemCount(),
      table_number: String(qrFlowTableNumber || ""),
    });
    open_dialog("qrPaymentMethod", {
      open: true,
      propsData: {
        onClose: () => close_dialog(["qrPaymentMethod"]),
        onSubmit: async (paymentMethod: string) => {
          await handleQrPlaceOrder(paymentMethod);
        },
      },
      type: "qrPaymentMethod",
      handlerDialog: () => {},
      handleClose: () => close_dialog(["qrPaymentMethod"]),
      anchor: "bottom",
      drawerBorderRadius: "10px 10px 0px 0px",
      sxStyle: {
        "& .MuiPaper-root": {
          backgroundColor: "var(--cards-containers)",
          borderRadius: "10px 10px 0px 0px",
        },
      },
    });
  };

  const handleQrPlaceOrder = async (paymentMethod: string) => {
    if (!sessionId || !storeId) return;
    const isCashPayment = paymentMethod === QR_PAYMENT_METHOD_CASH;

    const openQrPaymentSuccessModal = (completedOrderId?: string) => {
      window.setTimeout(() => {
        void trackDineInPaymentSuccessModalViewed({
          order_id: completedOrderId,
          store_name: storeName || "our restaurant",
        });
        open_dialog("qrPaymentSuccess", {
          open: true,
          propsData: {
            storeName: storeName || "our restaurant",
            onGoToOrderDetails: () => {
              close_dialog(["qrPaymentSuccess"]);
              // After payment backend ends the session; clear Redux so no stale data shows.
              dispatch(setCurrentOrderDetails(null));
              dispatch(setOrderData(null));
              dispatch(clearQrFlow());
              router.push(getOrdersUrl());
            },
            onShareExperience: () => {
              close_dialog(["qrPaymentSuccess"]);
              // After payment backend ends the session; clear Redux so no stale data shows.
              dispatch(setCurrentOrderDetails(null));
              dispatch(setOrderData(null));
              dispatch(clearQrFlow());
              router.push(getOrdersUrl());
            },
          },
          type: "qrPaymentSuccess",
          handlerDialog: () => {},
          handleClose: () => close_dialog(["qrPaymentSuccess"]),
          anchor: "bottom",
          drawerBorderRadius: "0px",
          sxStyle: {
            "& .MuiPaper-root": {
              backgroundColor: "var(--cards-containers)",
              borderRadius: "0px",
            },
          },
        });
      }, 80);
    };

    try {
      setIsSubmittingPayment(true);

      if (isCashPayment) {
        const cashPayload: QrTenantOrderCheckoutPayload = {
          sessionId,
          orderType: "DINE_IN",
          timezone: isTimeZone(),
          paymentMethod: "CASH",
          paymentGatewayType: "NONE",
        };
        const res = (await checkout(
          storeId,
          cashPayload,
        )) as CheckoutResponse & {
          data?: { orderId?: string | number; order_id?: string | number };
        };
        const resData = res?.data;
        const orderId = String(
          resData?.orderId ?? resData?.order_id ?? "",
        ).trim();
        const hasSuccessMessage =
          typeof res?.message === "string" &&
          res.message.toLowerCase() === "success";
        // Cash: same tenant order API as normal flow; allow success with message only (no orderId).
        if (!orderId && !hasSuccessMessage) {
          toast(
            "error",
            lang.order?.noOrderDetailsFound ?? "Could not complete checkout.",
          );
          return;
        }
        if (orderId) {
          dispatch(setOrderId(orderId));
        }
        void trackDineInPaymentCompleted({
          session_id: String(sessionId),
          order_id: orderId || undefined,
          payment_method: paymentMethod,
          cart_value: finalAmount,
          currency: tenantConfig.currencyCode || "INR",
          table_number: String(qrFlowTableNumber || ""),
        });
        close_dialog(["qrPaymentMethod"]);
        openQrPaymentSuccessModal(orderId || undefined);
        return;
      }

      // CreditOrDebitCard: use same tenant order API
      const cardPayload: QrTenantOrderCheckoutPayload = {
        sessionId,
        orderType: "DINE_IN",
        timezone: isTimeZone(),
        paymentMethod: "ONLINE",
        paymentGatewayType: "RAZORPAY",
      };
      const res = (await checkout(
        storeId,
        cardPayload,
      )) as CheckoutResponse & {
        data?: { orderId?: string | number; order_id?: string | number };
      };
      const resData = res?.data;
      const orderId = String(
        resData?.orderId ?? resData?.order_id ?? "",
      ).trim();

      if (!orderId) {
        toast(
          "error",
          lang.order?.noOrderDetailsFound ?? "Could not complete checkout.",
        );
        return;
      }
      dispatch(setOrderId(orderId));
      void trackDineInPaymentCompleted({
        session_id: String(sessionId),
        order_id: orderId,
        payment_method: paymentMethod,
        cart_value: finalAmount,
        currency: tenantConfig.currencyCode || "INR",
        table_number: String(qrFlowTableNumber || ""),
      });
      close_dialog(["qrPaymentMethod"]);
      router.push(getPaymentUrl(orderId, storeId));
    } catch (error) {
      void trackDineInPaymentFailed({
        session_id: String(sessionId),
        payment_method: paymentMethod,
        error_message: sanitizeAnalyticsErrorMessage(error),
        cart_value: finalAmount,
      });
      const message =
        error instanceof Error
          ? error.message
          : "An error occurred during checkout.";
      toast("error", message);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Only show tickets in SUBMITTED or PENDING_PAYMENT status
  const visibleTickets = sessionTickets.filter((ticket) => {
    const status = (ticket.status as string | undefined)?.toUpperCase();
    return (
      status === ticketStatusConfig.submitted ||
      status === ticketStatusConfig.inProgress ||
      status === ticketStatusConfig.sentToKitchen ||
      status === ticketStatusConfig.pendingPayment ||
      status === ticketStatusConfig.ready ||
      status === ticketStatusConfig.completed
    );
  });

  const hasTickets =
    visibleTickets.length > 0 &&
    visibleTickets.some((t) => (t.items?.length ?? 0) > 0);

  // Same pattern as OrderDetailsContainer: loading → skeleton, no data → centered message, else content
  const isLoading = isQrFlowActive && (!qrResolveData || !dineInSessionData);
  if (isLoading) {
    return <OrderDetailsContainerSkeleton />;
  }

  return (
    <div className="h-full w-full flex-1 flex flex-col overflow-y-auto hide-scrollbar bg-[var(--quaternary-background)] rounded-[0px] focus:outline-none focus:ring-0">
      <div className="fixed top-0 left-0 justify-between right-0 z-10 flex items-center gap-2 p-4 md:hidden bg-[var(--primary-background)] border-b border-[var(--borders-dividers)]">
        {/* <div className="flex items-center gap-2">
        <BackArrow
          pathFillColor="var(--primary-text)"
          onClick={onBack}
        />
        </div> */}
        <h3 className="heading-4 font-600 truncate leading-tight">
          {lang.order?.activeOrder ?? "Active Order"}
        </h3>
        <TablePinBadge lang={lang} className="ml-2" forceSinglePart={true} />
      </div>

      <div className="flex flex-col gap-3 bg-[var(--primary-tab-background)] pt-16 md:pt-0 pb-24">
        <div className="flex flex-col gap-2.5">
          {hasTickets ? (
            <>
              {showOrderTogetherSection && (
                <div className="bg-[#FCF4DB] p-4 flex gap-7 justify-between mt-0.5">
                  <div className="flex flex-col gap-1.5">
                    <h2 className="heading-4 font-700 text-[var(--primary-text)]">
                      {lang.order?.orderTogether}
                    </h2>
                    <p className="extra-small-font text-[var(--secondary-text)] mb-1.5">
                      {lang.order?.orderTogetherDescription}
                    </p>
                    <button className="bg-[#4285F4] text-[var(--white)] font-700 heading-5 p-2 rounded-lg w-fit">
                      {lang.order.tablePin} :{" "}
                      <span className="tracking-widest">{tablePinDisplay}</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <img
                      src={ORDER_TOGETHER_ICON}
                      alt="Order together"
                      width={74}
                      height={76}
                    />
                  </div>
                </div>
              )}

              <div className="order-details-container w-full">
                <p className="font-700 heading-5 pt-6 px-4 bg-[var(--quaternary-background)]">
                  {lang.order?.kitchenStatus ?? "Kitchen Status"}
                </p>
                <div className="flex flex-col gap-2">
                  {[...visibleTickets].reverse().map((ticket, ticketIndex) => {
                    const items = ticket.items ?? [];
                    if (items.length === 0) return null;
                    const ticketNumber = visibleTickets.length - ticketIndex;
                    const originalIndex =
                      visibleTickets.length - 1 - ticketIndex;
                    const submittedAt = (
                      ticket as { submittedAt?: string | number | Date }
                    ).submittedAt;
                    let displayTime: string | undefined;
                    if (submittedAt) {
                      const timestamp =
                        typeof submittedAt === "number"
                          ? submittedAt
                          : new Date(submittedAt).getTime();
                      displayTime = getFormattedTime(timestamp);
                    }
                    return (
                      <div
                        key={ticket.id ?? `ticket-${originalIndex}`}
                        className="py-4 md:py-6 bg-[var(--quaternary-background)] px-4"
                      >
                        <KitchenTicket
                          ticketNumber={ticketNumber}
                          itemCount={items.length}
                          displayTime={displayTime}
                          status={ticket.status}
                        >
                          {items.map((item, index) => (
                            <KitchenTicketItemDetail
                              key={item.id ?? index}
                              item={item}
                              language="en"
                              totalLabel={lang.order?.total ?? "Total"}
                              isLast={index === items.length - 1}
                            />
                          ))}
                        </KitchenTicket>
                      </div>
                    );
                  })}
                </div>
              </div>

              {servingStaffName && servingStaffName.trim() !== "" && (
                <div className="px-4 bg-[var(--quaternary-background)]">
                  {isTableDetailsLoading ? (
                    <div className="rounded-xl bg-[var(--cards-containers)] py-6 md:p-5 ">
                      <Shimmer
                        height={18}
                        width="55%"
                        borderRadius={6}
                        className="mb-2"
                      />
                      <Shimmer
                        height={14}
                        width="70%"
                        borderRadius={6}
                        className="mb-5"
                      />
                      <div className="flex items-center justify-between rounded-lg bg-[var(--primary-background)] p-3 mb-4">
                        <div className="flex items-center gap-3 w-full">
                          <Shimmer height={32} width={32} borderRadius={16} />
                          <div className="flex-1">
                            <Shimmer
                              height={14}
                              width="40%"
                              borderRadius={6}
                              className="mb-2"
                            />
                            <Shimmer height={12} width="30%" borderRadius={6} />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Shimmer height={44} width="30%" borderRadius={12} />
                        <Shimmer height={44} width="30%" borderRadius={12} />
                        <Shimmer height={44} width="30%" borderRadius={12} />
                        <Shimmer height={44} width="30%" borderRadius={12} />
                      </div>
                    </div>
                  ) : (
                    <DeliveryTipInput
                      isQrFlow
                      baseAmount={
                        sessionSummary?.estimatedTotal ??
                        sessionSummary?.currentSubtotal ??
                        0
                      }
                      cartId={sessionId ?? undefined}
                      serverName={servingStaffName ?? undefined}
                    />
                  )}
                </div>
              )}

              <div className="bg-[var(--quaternary-background)]">
                <OrderSummarySection
                  title={lang.order?.orderSummary ?? "Order Summary"}
                  itemTotalLabel={`${lang.order?.itemTotal ?? "Item total"} (${
                    sessionSummary?.totalItems ??
                    sessionTickets.flatMap((t) => t.items ?? []).length
                  } ${
                    (sessionSummary?.totalItems ??
                      sessionTickets.flatMap((t) => t.items ?? []).length) === 1
                      ? "item"
                      : "items"
                  })`}
                  itemTotalAmount={itemSubTotal}
                  taxLabel={lang.taxAndOtherCharges ?? "Tax & other charges"}
                  taxAmount={itemLevelTax}
                  itemDiscount={itemLevelDiscount}
                  itemDiscountsLabel={lang.itemDiscounts ?? "Item discount"}
                  grandTotalLabel={lang.order?.grandTotal ?? "Grand total"}
                  grandTotalAmount={finalAmount}
                  hideBorderBottom
                />
              </div>

              {/* Payment Pending */}
              <div className="w-full px-4 py-6 bg-[var(--quaternary-background)]">
                <p className="heading-5 font-700 text-[var(--primary-text)]">
                  {lang.order?.paymentPending}
                </p>
                <p className="heading-6 text-[var(--error)] mt-3">
                  {lang.order?.settleWhenDonePayAtTable}
                </p>
              </div>
            </>
          ) : (
            <NoDataPlaceholder
              imageSrc={NO_ORDERS_PLACEHOLDER}
              imageAlt="No orders"
              imageWidth={100}
              imageHeight={100}
              title={lang.order.noOrdersYet ?? "No Active orders yet!"}
              subtitle={
                lang.order.startByBrowsingMenu ?? "Start by browsing the menu"
              }
              buttonText={lang.order.exploreMenu ?? "Explore Menu"}
              onButtonClick={handleMoreItems}
              buttonClassName="w-[270px] max-w-[270px]"
              className="!bg-transparent flex-1 w-full !px-0 !py-12 !mt-16"
              regionLabel="No orders placeholder"
            />
          )}
        </div>
      </div>

      {/* Fixed bottom bar: + More items | Pay now */}
      {hasTickets && (
        <div className="fixed bottom-0 left-0 right-0 z-10 flex items-center gap-3 px-4 py-3 pb-[88px] bg-[var(--primary-background)] border-t border-[var(--borders-dividers)] md:hidden">
          <SecondaryButton
            onClick={handleMoreItems}
            className="flex-1 font-600 heading-5 !py-3"
          >
            + More items
          </SecondaryButton>
          <CustomButton
            onClick={handlePayNow}
            disabled={isSubmittingPayment || !hasTickets}
            className="flex-1 font-600 heading-5 !py-3 bg-[var(--primary-color)]"
          >
            {isSubmittingPayment ? lang.loading : lang.payNow}
          </CustomButton>
        </div>
      )}
      <style jsx>{`
        .order-details-container {
          // background-color: var(--quaternary-background);
        }
        .order-number {
          display: none;
        }
        @media (min-width: 768px) {
          .order-number {
            display: block;
          }
          .order-details-container {
            border-radius: 10px;
          }
        }
      `}</style>
    </div>
  );
}
