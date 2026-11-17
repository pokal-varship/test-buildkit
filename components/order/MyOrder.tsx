"use client";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { PLUS_ICON } from "@config/Header/image.config";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@redux/store";
import { LanguageCode, TranslationKeys } from "types";
import useLang from "@hooks/useLang";
import { useStoreCart } from "@hooks/storepage/useStore";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useLanguage } from "context/LanguageContext";
import Loader from "@components/loader/Loader";
import { open_dialog, close_dialog } from "@lib/modalHandler";
import { loginSuccessSubject } from "@lib/rxSubject";
import {
  CartData,
  CartTotalSummary,
  CartItem,
  Offer,
  AppliedOffer,
  MyOrderFooterProps,
} from "./order.type";
import moment from "moment";

import dynamic from "next/dynamic";
import { isTimeZone } from "@lib/helper";
import { useCheckout } from "@hooks/useCheckout";
import { useRazorpayCheckout } from "@hooks/useRazorpayCheckout";
import { CheckoutPayload } from "@components/checkOut/checkout.type";
import { useToast } from "@components/toast/Toast";
import { ApiErrorResponse } from "@components/payment/payment.type";
import { SelectedIntegrationPayment } from "@components/payment/integration.types";
import {
  getPlacedOrderId,
  isCashPaymentMethod,
  isCheckoutOrderSuccess,
} from "@lib/payment/orderCheckout";
import {
  openOrderSuccessDialog,
  scheduleOrderSuccessRedirect,
} from "@lib/payment/razorpayOrderSuccess";
import { calculateDeliveryFee } from "@services/checkOutService";
import { setOrderId } from "@redux/slices/ordersSlice";
import { updateCartTip } from "@redux/slices/cartSlice";
import { setOrderData } from "@redux/slices/ordersSlice";
import { clearOrderId } from "@redux/slices/ordersSlice";
import { Order, UpsellProduct } from "@components/type/order.type";
import { getUpsellProducts, cancelOrder } from "@services/cartService";
import { getCookie, removeCookie, setCookie } from "@lib/cookie";
import { useQuantityControls } from "@hooks/useQuantityControls";
import { useSession } from "next-auth/react";
import { ExtendedSession } from "@components/header/types";
import { useFreebiesOffer } from "@hooks/useFreebiesOffer";
import { getPLPUrlFromStorage } from "@hooks/usePLPUrl";
import { useProductUrl } from "@hooks/useProductUrl";
import { fetchOffers } from "@services/offerService";
import { DiscountOffer } from "@services/typesense";
import { selectCartThresholdOffersByFlow } from "@lib/offers/selectOffers";
import {
  MinimumSpendOffer,
  getDiscountThresholdBannerData,
  getDiscountThresholdMetBannerData,
} from "./DiscountThresholdBanner";
import useAnalytics from "@hooks/useAnalytics";
import { useCustomerAddresses } from "@hooks/useCustomerAddresses";
import useIsMobile from "@hooks/useIsMobile";
import { getTenantConfig } from "@config/tenant.config";
import {
  selectIsQrFlowActive,
  selectSessionId,
  selectSessionTableId,
  selectDineInSessionData,
  selectQrResolveData,
  selectQrFlowTableNumber,
  selectTicketId,
  setDineInSessionData,
  selectSessionSummary,
  selectSessionTotal,
  selectTicketOrderInstruction,
} from "@redux/slices/qrFlowSlice";
import {
  cancelTicketSession,
  submitTicketToKitchen,
} from "@services/ticketService";
import { getSession } from "@services/sessionService";
import { validateTablePin } from "@services/qrResolveService";
import { useStoreDataBootstrap } from "@app/StoreDataProvider";
import { useSessionTicketItems } from "@hooks/useQrSessionDerivedState";
import { sanitizeAnalyticsErrorMessage } from "@lib/analytics/dineInAnalytics";

// Extended type for API response that includes additional fields
interface MinimumSpendDiscountConfig {
  maximumDiscount?: number;
  minimumSpendValue: number;
  type: number;
  discountType?: number;
  discountValue?: number;
  excludeData?: string[];
  excludeType?: number;
  isExcludeData?: boolean;
  value?: number;
}

interface MinimumSpendOfferResponse extends Omit<
  DiscountOffer,
  "discountConfig"
> {
  discountConfig: MinimumSpendDiscountConfig;
  isActive?: boolean;
}

const MyOrderHeader = dynamic(() => import("./MyOrderHeader"));
const MyOrderFooter = dynamic(() => import("./MyOrderFooter"));
const OrderItemList = dynamic(() => import("./OrderItemList"));
const EmptyCart = dynamic(() => import("./EmptyCart"));
const DiscountCodeInput = dynamic(() => import("./DiscountCodeInput"));
const CheckOutOrderSummary = dynamic(
  () => import("@components/checkOut/CheckOutOrderSummary"),
);
const CookingInstructionsBox = dynamic(
  () => import("./CookingInstructionsBox"),
);
const SelectOrderType = dynamic(() => import("./SelectOrderType"));
const ChoosePaymentMethod = dynamic(
  () => import("@components/payment/ChoosePaymentMethod"),
);
import type { WalletPreviewData } from "@components/payment/ChoosePaymentMethod";
const Freebies = dynamic(() => import("./Freebies"));
const DeliveryTipInput = dynamic(() => import("./DeliveryTipInput"));
import DeliveryInstructionsSection, {
  type DeliveryInstructionOption,
  type DeliveryVoiceNote,
} from "./DeliveryInstructionsSection";
import { uploadDeliveryVoiceNote } from "@lib/upload/deliveryVoiceNote";
import MobileCartSummary from "@components/cart/MobileCartSummary";
const DiscountThresholdBanner = dynamic(
  () => import("./DiscountThresholdBanner"),
);

const MyOrder = ({ rerenderKey }: { rerenderKey?: number }) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const router = useRouter();
  const dispatch = useDispatch();
  const { selectedLang } = useLanguage();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const params = useParams();
  const store = useSelector((state: RootState) => state.store);
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const sessionId = useSelector(selectSessionId);
  const sessionTableId = useSelector(selectSessionTableId);
  const dineInSessionData = useSelector(selectDineInSessionData);
  const qrResolveData = useSelector(selectQrResolveData);
  const qrFlowTableNumber = useSelector(selectQrFlowTableNumber);
  const ticketId = useSelector(selectTicketId);
  const sessionTicketItems = useSessionTicketItems();
  const sessionSummary = useSelector(selectSessionSummary);
  const sessionTotal = useSelector(selectSessionTotal);
  const ticketOrderInstruction = useSelector(selectTicketOrderInstruction);

  const { appendQrTokenIfActive, getQrCheckoutUrl } = useProductUrl();
  const loginCartSyncedRef = useRef(0);
  const orderTypeSectionRef = useRef<HTMLDivElement>(null);
  const paymentMethodSectionRef = useRef<HTMLDivElement>(null);
  const orderSummaryRef = useRef<HTMLDivElement>(null);
  const hasTrackedCartView = useRef(false);
  const hasTrackedQrCartView = useRef(false);
  const validatingPinRef = useRef(false);
  const onProceedRef = useRef<(pin: string) => void | Promise<void>>(() => {});

  // UPDATED: Get storeId from multiple sources with priority
  const storeIdFromUrl = searchParams?.get("storeId");
  const storeIdFromRedux = store?.currentStore?.id;
  const storeId = storeIdFromUrl || storeIdFromRedux;
  const paramsStoreSlug = Array.isArray(params?.storeSlug)
    ? params.storeSlug[0]
    : (params?.storeSlug as string | undefined);
  const { bootstrapStore } = useStoreDataBootstrap();

  const storeAddress = useSelector((state: RootState) => state.address.address);
  const orderId =
    useSelector((state: RootState) => state.orders.orderId) ||
    params?.["orderId"] ||
    "";
  const language = selectedLang.code.toLowerCase();
  const { cartData, loading, handleGetCart } = useStoreCart();
  const cartItems = cartData?.data?.items;
  const cartId = cartData?.data?.id;
  const { placeOrder, isLoading } = useCheckout();
  const {
    openRazorpayFromOrder,
    isPaymentCancelRefreshing,
    isVerifyingPayment,
  } = useRazorpayCheckout();
  const [isStripePaymentVerifying, setIsStripePaymentVerifying] =
    useState(false);
  const toast = useToast();
  const { getFreebiesOffer, freebiesData } =
    useFreebiesOffer<MyOrderFooterProps["freebiesData"]>();
  const { handleQuantity } = useQuantityControls(cartId as string);

  const [deliveryAddressId, setDeliveryAddressId] = useState<
    string | null | undefined
  >(undefined);
  const selfPickupEnabled =
    store?.currentStore?.pickupSettings?.selfPickup !== false;
  const [orderType, setOrderType] = useState<string | null>(() => {
    const cookieType = getCookie("orderType");
    if (cookieType === "delivery") return "delivery";
    if (cookieType === "dine-in") return "dine-in";
    if (cookieType === "takeaway" && selfPickupEnabled) return "takeaway";
    return selfPickupEnabled ? "takeaway" : "delivery";
  });
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const coordinates = useSelector(
    (state: RootState) => state.userAddress.coordinates,
  );
  const [upsellProducts, setUpsellProducts] = useState<UpsellProduct[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string>("");
  const [selectedIntegrationPayment, setSelectedIntegrationPayment] =
    useState<SelectedIntegrationPayment | null>(null);
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const [selectedFreebie, setSelectedFreebie] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [showFreebiesModal, setShowFreebiesModal] = useState(true);
  const [currentFreebies, setCurrentFreebies] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false);
  const [walletPreviewData, setWalletPreviewData] =
    useState<WalletPreviewData | null>(null);
  const [deliveryInstructionOptions, setDeliveryInstructionOptions] = useState<
    DeliveryInstructionOption[]
  >([]);
  const [deliveryVoiceNote, setDeliveryVoiceNote] =
    useState<DeliveryVoiceNote | null>(null);

  useEffect(() => {
    if (orderType !== "delivery") {
      setDeliveryInstructionOptions([]);
      setDeliveryVoiceNote((prev) => {
        if (prev?.previewUrl) {
          URL.revokeObjectURL(prev.previewUrl);
        }
        return null;
      });
    }
  }, [orderType]);

  // If store disables self pickup, never keep takeaway/PICKUP for checkout
  useEffect(() => {
    if (!selfPickupEnabled && orderType === "takeaway") {
      setOrderType("delivery");
      setCookie("orderType", "delivery");
    }
  }, [selfPickupEnabled, orderType]);
  const [minimumSpendOffers, setMinimumSpendOffers] = useState<
    MinimumSpendOffer[]
  >([]);
  const [isQrCheckoutSubmitting, setIsQrCheckoutSubmitting] = useState(false);
  const [isQrPostSubmitTransition, setIsQrPostSubmitTransition] =
    useState(false);
  /** Keeps cart loader from covering the order-success dialog after checkout. */
  const [suppressCartLoader, setSuppressCartLoader] = useState(false);
  const {
    trackSignIn,
    trackCartPageViewed,
    trackOrderTypeSelected,
    trackCheckoutStarted,
    trackCreateOrderClicked,
    trackDineInCartPageViewed,
    trackDineInCheckoutStarted,
    trackDineInSubmitToKitchen,
    trackDineInTablePinPrompted,
    trackDineInTablePinSubmitted,
    trackDineInCancelTicketClicked,
  } = useAnalytics();

  // Scroll to order summary after it opens (so DOM is updated and scroll position is correct)
  useEffect(() => {
    if (!orderSummaryOpen) return;
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        orderSummaryRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
    return () => cancelAnimationFrame(rafId);
  }, [orderSummaryOpen]);
  const isMobile = useIsMobile();
  const hasAppliedFreebie = useMemo(
    () =>
      cartData?.data?.appliedOffers?.some(
        (offer: AppliedOffer) => offer.offerType === "FREEBIE",
      ) || false,
    [cartData?.data?.appliedOffers],
  );

  useEffect(() => {
    if (!storeId && paramsStoreSlug) {
      void bootstrapStore(paramsStoreSlug);
    }
  }, [bootstrapStore, paramsStoreSlug, storeId]);

  // UPDATED: Initial cart fetch - ensures cart is loaded on page load/refresh
  useEffect(() => {
    if (
      storeId &&
      !initialLoadComplete &&
      rerenderKey === 0 &&
      !isQrFlowActive
    ) {
      handleGetCart(storeId as string);
    }
  }, [storeId, initialLoadComplete, rerenderKey, isQrFlowActive]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mark initial load complete when cart (normal flow) or session (QR flow) data is available
  useEffect(() => {
    if (initialLoadComplete) return;

    const isNormalFlowWithCart = !isQrFlowActive && cartData !== null;
    const isQrFlowWithSession = isQrFlowActive && dineInSessionData !== null;
    const isInitialDataReady = isNormalFlowWithCart || isQrFlowWithSession;

    if (isInitialDataReady) {
      setInitialLoadComplete(true);
    }
  }, [cartData, initialLoadComplete, isQrFlowActive, dineInSessionData]);

  // QR flow: when Redux session is cleared (e.g. after payment), show EmptyCart immediately.

  // UPDATED: Redirect to home if no storeId found after loading completes
  useEffect(() => {
    if (!loading && !storeId && initialLoadComplete) {
      const plpUrl = getPLPUrlFromStorage();
      if (plpUrl) {
        router.push(plpUrl);
      } else {
        router.push("/");
      }
    }
  }, [loading, storeId, initialLoadComplete]); // eslint-disable-line react-hooks/exhaustive-deps
  const tenantConfig = getTenantConfig();

  // Track cart page view when cart data is loaded
  useEffect(() => {
    if (
      hasTrackedCartView.current ||
      loading ||
      !cartData ||
      !store?.currentStore?.id ||
      isQrFlowActive
    ) {
      return;
    }

    hasTrackedCartView.current = true;

    const currentStore = store.currentStore;
    const city = currentStore.address?.city || "";
    const platform = isMobile ? "mobile_web" : "web";

    trackCartPageViewed({
      page_type: "cart",
      store_id: currentStore.id,
      store_name: currentStore.name,
      city,
      currency: tenantConfig.currencyCode || "",
      funnel: "order_online",
      platform,
    });
  }, [
    loading,
    cartData,
    store?.currentStore?.id,
    trackCartPageViewed,
    isMobile,
    isQrFlowActive,
  ]);

  // Track dine-in ticket/cart page view when session data is loaded
  useEffect(() => {
    if (
      hasTrackedQrCartView.current ||
      !isQrFlowActive ||
      !dineInSessionData ||
      sessionTicketItems.length === 0
    ) {
      return;
    }

    hasTrackedQrCartView.current = true;

    const currentStore = store.currentStore;
    const city = currentStore?.address?.city || "";
    const platform = isMobile ? "mobile_web" : "web";
    const cartValue =
      (sessionSummary?.finalAmount as number | undefined) ??
      (sessionTotal?.finalAmount as number | undefined) ??
      0;

    void trackDineInCartPageViewed({
      page_type: "cart",
      store_id: String(
        currentStore?.id || qrResolveData?.storefrontId || "",
      ),
      store_name: String(
        currentStore?.name || qrResolveData?.storefrontName || "",
      ),
      city,
      currency: tenantConfig.currencyCode || "",
      platform,
      item_count: sessionTicketItems.length,
      cart_value: cartValue,
      table_number: String(qrFlowTableNumber || ""),
      session_id: String(sessionId || ""),
    });
  }, [
    isQrFlowActive,
    dineInSessionData,
    sessionTicketItems.length,
    store.currentStore,
    qrResolveData,
    sessionSummary,
    sessionTotal,
    isMobile,
    qrFlowTableNumber,
    sessionId,
    trackDineInCartPageViewed,
    tenantConfig.currencyCode,
  ]);

  // Back
  const handleBack = () => {
    removeCookie("cartRedirect");
    const plpUrl = getPLPUrlFromStorage();
    const targetUrl = plpUrl || "/";
    router.push(appendQrTokenIfActive(targetUrl));
  };

  const handleYesCancelOrder = async () => {
    if (isQrFlowActive) {
      const storeIdForSession = store?.currentStore?.id;
      if (!sessionId || !storeIdForSession) return;
      const cartValue =
        (sessionSummary?.finalAmount as number | undefined) ??
        (sessionTotal?.finalAmount as number | undefined) ??
        0;
      await cancelTicketSession(storeIdForSession, {
        sessionId,
        customType: "CANCEL_CART",
      });
      const sessionData = await getSession(storeIdForSession, {
        tableId: sessionTableId ?? undefined,
        sessionId,
      });
      dispatch(setDineInSessionData(sessionData));
      void trackDineInCancelTicketClicked({
        session_id: String(sessionId),
        ticket_id: String(ticketId || ""),
        item_count: sessionTicketItems.length,
        cart_value: cartValue,
      });
      close_dialog(["cancelOrder"]);
      return;
    }
    const res = await cancelOrder(
      store?.currentStore?.id as string,
      cartId as string,
      "CANCEL_CART",
    );
    if (res.message === "Success") {
      handleGetCart(store?.currentStore?.id as string);
      close_dialog(["cancelOrder"]);
    }
  };

  const handleCancelOrder = () => {
    open_dialog("cancelOrder", {
      open: true,
      propsData: {
        title: lang.cancelOrderTitle,
        description: lang.cancelOrderDescription,
        yesButtonText: lang.yes,
        noButtonText: lang.no,
        onYes: () => {
          handleYesCancelOrder();
        },
        onNo: () => {
          close_dialog(["cancelOrder"]);
        },
      },
      anchor: "bottom",
      type: "cancelOrder",
      handlerDialog: () => {},
      handleClose: () => close_dialog(["cancelOrder"]),
    });
  };

  // Delivery Address ID
  const handleDeliveryAddressId = (addressId: string | null) => {
    setDeliveryAddressId(addressId);
  };

  const { addresses, handleAddAddress } = useCustomerAddresses({
    storeId: storeId as string | undefined,
    handleDeliveryAddressId,
    drawerBorderRadius: "0px",
  });

  // Order Type
  const handleOrderType = async (newOrderType: string) => {
    // Track order type selection
    if (newOrderType === "takeaway" || newOrderType === "delivery") {
      trackOrderTypeSelected(newOrderType as "takeaway" | "delivery");
    }

    // Clear tip when switching from delivery to takeaway
    if (orderType === "delivery" && newOrderType !== "delivery") {
      const currentTip =
        (cartData?.data?.total as CartTotalSummary)?.tipAmount || 0;
      if (currentTip > 0 && cartId) {
        // Clear tip on server
        await handleQuantity(
          "UPDATE_TIP",
          "",
          "",
          "",
          undefined,
          cartId,
          undefined,
          0,
        );
        // Update Redux state
        dispatch(updateCartTip(0));
        // Refresh cart to ensure consistency
        await handleGetCart(storeId as string);
      }
    }
    setOrderType(newOrderType);
  };

  // Schedule Order
  const handleScheduleOrder = (time: string) => {
    setScheduledTime(time);
  };

  /** QR flow: submit ticket to kitchen, refetch session, show Order Sent dialog. Used from handleCheckout and after login success. */
  const submitQrTicketToKitchen = async () => {
    const effectiveStoreId =
      storeId || (qrResolveData as { storefrontId?: string })?.storefrontId;
    if (!sessionId || !ticketId || !effectiveStoreId) {
      toast("error", lang.somethingWentWrong ?? "Session or store not found.");
      return;
    }
    try {
      await submitTicketToKitchen(effectiveStoreId, { sessionId, ticketId });
      const sessionData = await getSession(effectiveStoreId, {
        tableId: sessionTableId ?? undefined,
        sessionId,
      });
      dispatch(setDineInSessionData(sessionData));
      const cartValue =
        (sessionSummary?.finalAmount as number | undefined) ??
        (sessionTotal?.finalAmount as number | undefined) ??
        0;
      const hasInstructions =
        Boolean(ticketOrderInstruction?.trim()) ||
        sessionTicketItems.some(
          (item) =>
            item.specialInstructions &&
            item.specialInstructions.trim() !== "",
        );
      void trackDineInSubmitToKitchen({
        store_id: String(effectiveStoreId),
        store_name: String(
          store?.currentStore?.name || qrResolveData?.storefrontName || "",
        ),
        item_count: sessionTicketItems.length,
        cart_value: cartValue,
        has_instructions: hasInstructions,
        currency: tenantConfig.currencyCode || "INR",
        session_id: String(sessionId),
        ticket_id: String(ticketId),
        table_number: String(qrFlowTableNumber || ""),
      });
      // Prevent "Empty cart" flicker between submit success and modal mount.
      setIsQrPostSubmitTransition(true);
      open_dialog("orderSent", {
        open: true,
        propsData: {
          tableNumber: qrFlowTableNumber,
          onGoToActiveOrder: () => {
            // Keep overlay up while we navigate, so cart doesn't flash.
            setIsQrPostSubmitTransition(true);
            close_dialog(["orderSent"]);
            router.push(getQrCheckoutUrl());
          },
          onAddMoreItems: () => {
            // Keep overlay up while we navigate to full menu, so cart doesn't flash.
            setIsQrPostSubmitTransition(true);
            close_dialog(["orderSent"]);
          },
        },
        type: "orderSent",
        handlerDialog: () => {},
        handleClose: () => {
          setIsQrPostSubmitTransition(false);
          close_dialog(["orderSent"]);
        },
        anchor: "bottom",
        drawerBorderRadius: "0px",
        sxStyle: {
          "& .MuiDialogContent-root": {
            backgroundColor: "var(--primary-background)",
            padding: "20px 16px",
          },
        },
      });
    } catch (err: unknown) {
      // Re-throw the error so handleCheckout can decide:
      // - status 418 => show table PIN popup
      // - otherwise => toast the error
      throw err;
    }
  };

  // When user logs in from QR checkout, just clear the pending flag - don't auto-submit
  const pendingQrSubmitAfterLogin = useRef(false);
  useEffect(() => {
    if (
      !isQrFlowActive ||
      !session?.user?.email ||
      !pendingQrSubmitAfterLogin.current
    )
      return;
    pendingQrSubmitAfterLogin.current = false;
    // Removed automatic submitQrTicketToKitchen() call - user must click submit manually
  }, [isQrFlowActive, session?.user?.email]);

  // UPDATED: Checkout with proper login handling and scroll validation
  const handleCheckout = async () => {
    // Auth check: if not logged in, show login dialog (same for QR and non-QR flow)
    if (!session?.user?.email) {
      if (isQrFlowActive) pendingQrSubmitAfterLogin.current = true;
      const search = searchParams?.toString()
        ? `?${searchParams.toString()}`
        : "";
      const currentUrl = `${pathname ?? ""}${search}`;
      const source = pathname === "/" ? "homepage" : pathname || "homepage";
      trackSignIn(
        source,
        isQrFlowActive ? "dine_in_cart" : "cart_checkout",
        isQrFlowActive ? { funnel: "dine_in" } : undefined,
      );
      open_dialog("login", {
        open: true,
        propsData: {
          redirectUrl: currentUrl,
          storeId: storeId,
          onSuccess: () => {
            close_dialog(["login"]);
            if (!isQrFlowActive) loginSuccessSubject.next("cart_login");
          },
        },
        type: "login",
        handlerDialog: () => {},
        handleClose: () => {
          if (isQrFlowActive) pendingQrSubmitAfterLogin.current = false;
        },
        anchor: "bottom",
        onlyDialog: false,
        sxStyle: {
          "& .MuiDialogContent-root": {
            padding: "20px 16px",
            backgroundColor: "var(--tertiary-background)",
          },
        },
      });
      return;
    }

    // QR Flow: user is logged in; try submit first, if fails then show table pin popup
    if (isQrFlowActive) {
      if (isQrCheckoutSubmitting) return;
      const qrCartValue =
        (sessionSummary?.finalAmount as number | undefined) ??
        (sessionTotal?.finalAmount as number | undefined) ??
        0;
      void trackDineInCheckoutStarted({
        cart_value: qrCartValue,
        item_count: sessionTicketItems.length,
        session_id: String(sessionId || ""),
        table_number: String(qrFlowTableNumber || ""),
      });
      const sessionIdForPin = qrResolveData?.sessionId;
      // const isParticipant = qrResolveData?.isParticipant === true; // Commented out since logic is disabled

      try {
        setIsQrCheckoutSubmitting(true);
        // First try to submit directly
        await submitQrTicketToKitchen();
        return;
      } catch (submitError: unknown) {
        const status = (submitError as { response?: { status?: number } })
          ?.response?.status;

        // Only show table pin popup when API explicitly asks for it (418)
        if (status === 418) {
          const storeId = qrResolveData?.storefrontId ?? "";
          void trackDineInTablePinPrompted({
            session_id: String(sessionIdForPin || sessionId || ""),
            table_number: String(qrFlowTableNumber || ""),
          });
          // Store handler in ref so dialog callback doesn't close over imports (avoids Turbopack "is not a function")
          onProceedRef.current = async (pin: string) => {
            if (validatingPinRef.current || !sessionIdForPin || !storeId) return;
            validatingPinRef.current = true;
            setIsQrCheckoutSubmitting(true);
            try {
              await validateTablePin(storeId, sessionIdForPin, pin);
              close_dialog(["enterTablePin"]);
              void trackDineInTablePinSubmitted({
                session_id: String(sessionIdForPin),
                table_number: String(qrFlowTableNumber || ""),
                success: true,
              });
              await submitQrTicketToKitchen();
            } catch (err) {
              void trackDineInTablePinSubmitted({
                session_id: String(sessionIdForPin),
                table_number: String(qrFlowTableNumber || ""),
                success: false,
                error_message: sanitizeAnalyticsErrorMessage(err),
              });
              const message =
                (err as { response?: { data?: { message?: string } } })
                  ?.response?.data?.message ??
                (err instanceof Error ? err.message : null);
              toast("error", message ?? "Invalid table PIN. Please try again.");
            } finally {
              validatingPinRef.current = false;
              setIsQrCheckoutSubmitting(false);
            }
          };
          open_dialog("enterTablePin", {
            open: true,
            propsData: {
              tableNumber: qrFlowTableNumber,
              onProceed: (pin: string) => onProceedRef.current(pin),
            },
            type: "enterTablePin",
            handlerDialog: () => {},
            handleClose: () => {},
            anchor: "bottom",
            onlyDialog: false,
          });
          return;
        }

        const message =
          (submitError as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ??
          (submitError instanceof Error ? submitError.message : null) ??
          lang.somethingWentWrong ??
          "Failed to submit order";
        toast("error", message);
        return;
      } finally {
        setIsQrCheckoutSubmitting(false);
      }
    }

    // Validation: Check if order type is delivery and no address selected
    if (orderType === "delivery" && !deliveryAddressId) {
      // Scroll to order type section
      orderTypeSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      handleAddAddress();
      return;
    }

    // Validation: Check if payment method is not selected
    if (!paymentMethods) {
      // Scroll to payment method section
      paymentMethodSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      toast("warning", lang.pleaseSelectPaymentMethod);
      return;
    }

    // Track checkout started (Pay Now clicked)
    const cartValue =
      (cartData?.data?.total as CartTotalSummary)?.finalAmount || 0;
    const itemCount = cartItems?.length || 0;
    const normalizedOrderType =
      orderType === "delivery"
        ? "delivery"
        : orderType === "dine-in"
          ? "dine-in"
          : "takeaway";
    trackCheckoutStarted({
      cart_value: cartValue,
      item_count: itemCount,
      order_type: normalizedOrderType,
    });

    // Case 1: delivery + has address → place order
    if (orderType === "delivery" && deliveryAddressId) {
      handlePlaceOrder();
      return;
    }

    // Case 2: non-delivery (pickup etc.) → always place order
    if (orderType !== "delivery") {
      handlePlaceOrder();
      return;
    }

    // Case 3: delivery + no address → show address dialog
    if (orderType === "delivery" && !deliveryAddressId) {
      handleAddAddress();
    }
  };

  const handleApplyPromoCode = (code: string) => {
    setPromoCode(code);
  };

  const completeOrderSuccess = (
    placedOrderId: string,
    { showToast = true }: { showToast?: boolean } = {}
  ) => {
    setSuppressCartLoader(true);
    openOrderSuccessDialog(placedOrderId);
    scheduleOrderSuccessRedirect(placedOrderId);
    if (showToast) {
      toast("success", lang.paymentSuccess);
    }
    if (storeId) {
      handleGetCart(storeId as string).catch(() => undefined);
    }
  };

  // Place Order
  const handlePlaceOrder = async () => {
    if (!cartData?.data?.id) return;

    const timeString = scheduledTime?.startsWith("ASAP")
      ? scheduledTime.match(/\((?:about\s)?(.+?)\)/)?.[1]
      : scheduledTime;

    let scheduledAt: number | undefined = undefined;

    if (timeString) {
      const parsedTime = moment(timeString, "h:mm A");

      if (parsedTime.isBefore(moment())) {
        parsedTime.add(1, "day");
      }

      scheduledAt = parsedTime.valueOf();
    }

    // Track Create Order Clicked
    const normalizedOrderType =
      orderType === "delivery"
        ? "delivery"
        : orderType === "dine-in"
          ? "dine-in"
          : "takeaway";
    const pickupDate = scheduledAt
      ? moment(scheduledAt).format("YYYY-MM-DD")
      : moment().format("YYYY-MM-DD");
    const pickupTimeType = scheduledTime?.startsWith("ASAP")
      ? "asap"
      : "scheduled";
    const hasCoupon = !!cartData?.data?.appliedPromoCode?.promoCode;
    const hasInstructions =
      cartItems?.some(
        (item: CartItem) =>
          item.specialInstructions && item.specialInstructions.trim() !== "",
      ) || false;
    const cartValue =
      (cartData?.data?.total as CartTotalSummary)?.finalAmount || 0;
    const itemCount = cartItems?.length || 0;

    trackCreateOrderClicked({
      order_type: normalizedOrderType,
      store_id: store?.currentStore?.id || "",
      store_name: store?.currentStore?.name || "",
      item_count: itemCount,
      cart_value: cartValue,
      pickup_date: pickupDate,
      pickup_time_type: pickupTimeType,
      has_coupon: hasCoupon,
      has_instructions: hasInstructions,
      currency: tenantConfig.currencyCode || "INR",
    });

    const payload: CheckoutPayload = {
      cartId: cartData?.data?.id,
      orderType:
        orderType === "delivery"
          ? "DELIVERY"
          : orderType === "dine-in"
            ? "DINE_IN"
            : "PICKUP",
      scheduledAt,
      timezone: isTimeZone(),
    };

    if (selectedIntegrationPayment) {
      if (
        !selectedIntegrationPayment.paymentMethod ||
        !selectedIntegrationPayment.paymentGatewayType
      ) {
        toast("error", "Please select an online payment option from the list.");
        paymentMethodSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        return;
      }
      payload.paymentMethod = selectedIntegrationPayment.paymentMethod;
      payload.paymentGatewayType =
        selectedIntegrationPayment.paymentGatewayType;
    } else if (paymentMethods) {
      payload.paymentMethod = paymentMethods;
    }

    if (walletPreviewData) {
      if (walletPreviewData.cashWalletAmount > 0) {
        payload.cashAmount = walletPreviewData.cashWalletAmount;
      }
      if (
        walletPreviewData.loyaltyPoints != null &&
        walletPreviewData.loyaltyPoints > 0
      ) {
        payload.loyaltyPoints = walletPreviewData.loyaltyPoints;
      }
    }

    if (scheduledTime?.startsWith("ASAP")) {
      payload.scheduleType = "ASAP";
    } else {
      payload.scheduleType = "SCHEDULED";
    }

    if (orderType === "delivery") {
      payload.deliveryAddressId = deliveryAddressId || "";
      let voiceNoteUrl: string | null = null;
      if (deliveryVoiceNote?.blob) {
        voiceNoteUrl = await uploadDeliveryVoiceNote(deliveryVoiceNote.blob);
      }
      const hasDeliveryInstructions =
        deliveryInstructionOptions.length > 0 || Boolean(deliveryVoiceNote?.blob) || Boolean(voiceNoteUrl);

      if (hasDeliveryInstructions) {
        payload.deliveryInstructionsInput = {
          recordedVoiceMessageUrl: voiceNoteUrl ?? undefined,
          avoidCalling: deliveryInstructionOptions.includes("avoidCalling"),
          dontRingBell: deliveryInstructionOptions.includes("dontRingBell"),
        };
      }
      delete payload.scheduledAt;
    }
    try {
      if (isCashPaymentMethod(paymentMethods)) {
        dispatch(clearOrderId());
      }

      if (selectedIntegrationPayment) {
        dispatch(clearOrderId());
        const res = await placeOrder(payload);
        const orderData = (res?.data ?? {}) as Record<string, unknown>;
        const placedOrderId = getPlacedOrderId(orderData);

        if (!placedOrderId || !isCheckoutOrderSuccess(res?.message)) {
          toast("error", res?.message || "Order could not be placed.");
          return;
        }

        dispatch(
          setOrderData({
            ...(res?.data as unknown as Order),
            orderType: orderType || "",
          }),
        );
        dispatch(setOrderId(placedOrderId));

        try {
          if (selectedIntegrationPayment.paymentGatewayType === "STRIPE") {
            open_dialog("stripeOrderPayment", {
              open: true,
              propsData: {
                orderId: placedOrderId,
                orderData,
                storeId: storeId as string,
                storeName: store?.currentStore?.name,
                stripeKey: selectedIntegrationPayment.razorpayKeyId,
                onPaymentSuccess: (paidOrderId: string) =>
                  completeOrderSuccess(paidOrderId, { showToast: false }),
                onPaymentVerifying: setIsStripePaymentVerifying,
                onCartRefresh: async () => {
                  dispatch(clearOrderId());
                  if (storeId) {
                    await handleGetCart(storeId as string);
                  }
                },
                onPaymentDismissed: () => {
                  toast("warning", "Payment was not completed.");
                },
              },
              type: "stripeOrderPayment",
              handlerDialog: () => {},
              handleClose: () => {},
              anchor: "bottom",
              className: "payment-dialog",
              drawerBorderRadius: "0px",
              sxStyle: {
                "& .MuiDialogContent-root": {
                  overflowX: "hidden",
                },
              },
            });
          } else {
            await openRazorpayFromOrder({
              orderId: placedOrderId,
              orderData,
              storeId: storeId as string,
              storeName: store?.currentStore?.name,
              razorpayKey: selectedIntegrationPayment.razorpayKeyId,
              customer: {
                name: session?.user?.name,
                email: session?.user?.email,
                contact: session?.user?.phoneNumber,
              },
              onPaymentSuccess: (paidOrderId: string) =>
                completeOrderSuccess(paidOrderId, { showToast: false }),
              onCartRefresh: async () => {
                dispatch(clearOrderId());
                if (storeId) {
                  await handleGetCart(storeId as string);
                }
              },
              onPaymentDismissed: () => {
                toast("warning", "Payment was not completed.");
              },
            });
          }
        } catch (razorpayError) {
          const message =
            razorpayError instanceof Error
              ? razorpayError.message
              : "Could not open payment checkout.";
          toast("error", message);
        }

        removeCookie("orderType");
        return;
      }

      if (orderId && !isCashPaymentMethod(paymentMethods)) {
        router.push(`/payment/${orderId}?storeId=${storeId}`);
      } else if (isCashPaymentMethod(paymentMethods)) {
        const res = await placeOrder(payload);
        const orderData = (res?.data ?? {}) as Record<string, unknown>;
        const placedOrderId = getPlacedOrderId(orderData);

        if (!placedOrderId || !isCheckoutOrderSuccess(res?.message)) {
          toast("error", res?.message || "Order could not be placed.");
          return;
        }

        dispatch(
          setOrderData({
            ...(res?.data as unknown as Order),
            orderType: orderType || "",
          }),
        );
        completeOrderSuccess(placedOrderId);
      } else {
        const res = await placeOrder(payload);
        dispatch(
          setOrderData({
            ...(res?.data as unknown as Order),
            orderType: orderType || "",
          }),
        );
        router.push(`/payment/${res?.data?.orderId}?storeId=${storeId}`);
      }
      removeCookie("orderType");
    } catch (error) {
      const errorResponse = error as ApiErrorResponse;
      if (error instanceof Error && errorResponse.response?.data?.message) {
        const errorMessage = errorResponse.response.data.message;
        toast("error", errorMessage);
        if (promoCode) {
          handleQuantity("REMOVE_PROMO_CODE", "", "", "", undefined, promoCode);
          handleGetCart(storeId as string);
        }
      } else {
        toast("error", "Check Your Internet Connection");
      }
    }
  };

  // Delivery Fee Calculation
  const handleDeliveryFeeCalculation = async () => {
    if (
      !storeId ||
      !cartId ||
      !coordinates?.latitude ||
      !coordinates?.longitude
    )
      return;

    try {
      const deliveryFee = await calculateDeliveryFee(
        storeId,
        cartId,
        coordinates.latitude.toString(),
        coordinates.longitude.toString(),
      );
      setDeliveryFee(deliveryFee?.data?.deliveryFees);
    } catch (error) {
      const errorResponse = error as ApiErrorResponse;
      if (error instanceof Error && errorResponse.response?.data?.message) {
        const errorMessage = errorResponse.response.data.message;
        toast("error", errorMessage);
      }
    }
  };

  useEffect(() => {
    if (
      orderType === "delivery" &&
      coordinates?.latitude &&
      coordinates?.longitude &&
      storeId &&
      cartId
    ) {
      handleDeliveryFeeCalculation();
    } else {
      setDeliveryFee(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    orderType,
    coordinates?.latitude,
    coordinates?.longitude,
    storeId,
    cartId,
  ]);

  useEffect(() => {
    return () => {
      dispatch(setOrderId(null));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Upsell Products – API may return the array at top level, in .data, or in .data.data / .data.items
  type UpsellEntry = { cartItemId: string; upsellProducts: UpsellProduct[] };
  const normalizeUpsellResponse = (response: unknown): UpsellEntry[] => {
    if (Array.isArray(response)) return response as UpsellEntry[];

    const data = (response as { data?: unknown })?.data;
    if (Array.isArray(data)) return data as UpsellEntry[];

    const dataPayload = data as { data?: unknown; items?: unknown } | undefined;
    const entries = dataPayload?.data ?? dataPayload?.items;
    return Array.isArray(entries) ? (entries as UpsellEntry[]) : [];
  };

  const handleUpsellProducts = async () => {
    if (isQrFlowActive) {
      if (!storeId || !ticketId) return;
      try {
        const response = await getUpsellProducts(storeId, ticketId, {
          useTicketId: true,
        });
        const list = normalizeUpsellResponse(response);
        setUpsellProducts(list as unknown as UpsellProduct[]);
      } catch {}
      return;
    }
    if (!storeId || !cartId || !cartItems?.length) return;
    try {
      const response = await getUpsellProducts(storeId, cartId);
      const list = normalizeUpsellResponse(response);
      setUpsellProducts(list as unknown as UpsellProduct[]);
    } catch {}
  };

  // Fetch threshold offers (selected items, entire menu, minimum spend)
  const handleFetchMinimumSpendOffers = async () => {
    if (!store?.currentStore?.slug) return;
    try {
      const offerResponse = await fetchOffers(store.currentStore.slug);
      const thresholdOffers = selectCartThresholdOffersByFlow(
        offerResponse.data || [],
        isQrFlowActive,
      );

      const minimumSpendOffersData = thresholdOffers.map(
        (offer: MinimumSpendOfferResponse) => ({
          offerId: offer.offerId,
          offerName: offer.offerName,
          offerType: offer.offerType,
          offerTypeString: offer.offerTypeString,
          discountConfig: {
            maximumDiscount: offer.discountConfig.maximumDiscount || 0,
            minimumSpendValue: offer.discountConfig.minimumSpendValue || 0,
            type:
              offer.discountConfig.type ||
              offer.discountConfig.discountType ||
              1,
            value: offer.discountConfig.value,
            discountType: offer.discountConfig.discountType,
            discountValue: offer.discountConfig.discountValue,
          },
          status: offer.status,
          isActive: offer.isActive ?? true,
        }),
      ) as MinimumSpendOffer[];

      setMinimumSpendOffers(minimumSpendOffersData);
    } catch (error) {
      console.error("Error fetching threshold offers:", error);
    }
  };

  useEffect(() => {
    if (
      (cartItems?.length && !isQrFlowActive) ||
      (isQrFlowActive && ticketId)
    ) {
      handleUpsellProducts();
    }
    if (cartItems?.length || (isQrFlowActive && sessionTicketItems?.length)) {
      handleFreebiesOffer();
    }
  }, [
    cartItems,
    isQrFlowActive,
    ticketId,
    sessionTicketItems,
    dineInSessionData,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (store?.currentStore?.slug) {
      handleFetchMinimumSpendOffers();
    }
  }, [store?.currentStore?.slug, isQrFlowActive]);

  const handleFreebiesOffer = async () => {
    if (!storeId) return;

    // Normal flow uses cartId. QR flow must send sessionId (not ticketId) to freebies-offer API.
    // Note: On first load QR state may not be hydrated yet; treat presence of `qrToken` in URL as QR flow too.
    const isQrFlowForFreebies =
      isQrFlowActive || Boolean(searchParams?.get("qrToken"));
    const qrIdentifier =
      sessionId ??
      // Fallbacks to avoid breaking if redux sessionId isn't populated yet
      (dineInSessionData as unknown as { sessionId?: string } | null)
        ?.sessionId ??
      (qrResolveData as unknown as { sessionId?: string } | null)?.sessionId;

    const identifier = isQrFlowForFreebies ? qrIdentifier : cartId;
    if (!identifier) return;

    try {
      const res = await getFreebiesOffer(
        storeId as string,
        identifier,
        undefined,
        isQrFlowForFreebies ? "sessionId" : "cartId",
      );
      return res;
    } catch {}
  };

  const handleCurrentFreebies = (currentFreebies: Offer | null) => {
    setSelectedFreebie(currentFreebies ? currentFreebies._id : null);
  };

  useEffect(() => {
    if (hasAppliedFreebie) {
      setShowFreebiesModal(false);
    }
  }, [hasAppliedFreebie]);

  // After login: refresh cart so guest cart merges with logged-in user cart
  useEffect(() => {
    if (!rerenderKey || isQrFlowActive || !storeId || !session?.user?.email) {
      return;
    }
    if (loginCartSyncedRef.current >= rerenderKey) {
      return;
    }

    loginCartSyncedRef.current = rerenderKey;

    handleGetCart(storeId as string)
      .then((res) => {
        if (
          orderType === "delivery" &&
          deliveryAddressId === null &&
          res.data?.items?.length > 0
        ) {
          handleAddAddress();
        }
      })
      .catch(() => undefined);
  }, [
    rerenderKey,
    isQrFlowActive,
    storeId,
    session?.user?.email,
    orderType,
    deliveryAddressId,
    handleGetCart,
  ]);

  const isPaymentVerifyInProgress =
    isVerifyingPayment || isStripePaymentVerifying;

  const showNormalFlowLoader =
    !suppressCartLoader &&
    (loading ||
      isLoading ||
      isPaymentCancelRefreshing ||
      !initialLoadComplete) &&
    !isQrFlowActive;
  const showQrFlowSubmittingOverlay =
    isQrFlowActive && (isQrCheckoutSubmitting || isQrPostSubmitTransition);

  const cartLoaderOverlay = (
    <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-40">
      <Loader />
    </div>
  );

  const paymentVerifyLoaderOverlay = (
    <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-[1500]">
      <Loader />
    </div>
  );

  const cartContainerClassName = `flex flex-col h-[100%] cart-container ${orderType === "delivery" ? "delivery-order" : ""}`;
  const cartItemSubTotal =
    (cartData?.data?.total as CartTotalSummary)?.itemSubTotal || 0;
  const hasThresholdBanner = useMemo(
    () =>
      getDiscountThresholdBannerData(
        cartItemSubTotal,
        minimumSpendOffers,
        lang
      ) !== null ||
      getDiscountThresholdMetBannerData(
        cartItemSubTotal,
        minimumSpendOffers,
        cartData?.data?.appliedOffers,
        lang
      ) !== null,
    [cartItemSubTotal, minimumSpendOffers, cartData?.data?.appliedOffers, lang]
  );
  const hasMetThreshold = useMemo(
    () =>
      getDiscountThresholdMetBannerData(
        cartItemSubTotal,
        minimumSpendOffers,
        cartData?.data?.appliedOffers,
        lang
      ) !== null,
    [cartItemSubTotal, minimumSpendOffers, cartData?.data?.appliedOffers, lang]
  );
  const cartTopSectionClassName = `cart-top-section${
    hasThresholdBanner ? "" : " cart-top-section--no-threshold-banner"
  }${hasMetThreshold ? " cart-top-section--met" : ""}`;

  // QR flow: session snapshot missing (e.g. after payment reset) → show placeholder.
  if (isQrFlowActive && !dineInSessionData) {
    return (
      <div className={cartContainerClassName}>
        <div className={cartTopSectionClassName}>
          <MyOrderHeader
            handleBack={handleBack}
            lang={lang}
            store={store}
            cartItems={[] as unknown as CartItem[]}
            cartTotal={cartData?.data?.total as CartTotalSummary}
            onCancelOrder={handleCancelOrder}
          />
        </div>
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className={cartContainerClassName}>
      {isPaymentVerifyInProgress ? paymentVerifyLoaderOverlay : null}
      {showNormalFlowLoader || showQrFlowSubmittingOverlay
        ? cartLoaderOverlay
        : null}
      {/* Order Header + Discount Banner share one gradient */}
      <div className={cartTopSectionClassName}>
        <MyOrderHeader
          handleBack={handleBack}
          lang={lang}
          store={store}
          cartItems={cartItems as unknown as CartItem[]}
          cartTotal={cartData?.data?.total as CartTotalSummary}
          onCancelOrder={handleCancelOrder}
        />
        <DiscountThresholdBanner
          cartTotal={cartItemSubTotal}
          minimumSpendOffers={minimumSpendOffers}
          appliedOffers={cartData?.data?.appliedOffers}
        />
      </div>
      {initialLoadComplete &&
      !loading &&
      (cartData !== null || isQrFlowActive) &&
      ((!cartItems?.length && !isQrFlowActive) ||
        (isQrFlowActive &&
          sessionTicketItems?.length === 0 &&
          !isQrPostSubmitTransition)) ? (
        <EmptyCart />
      ) : isQrFlowActive || cartItems?.length ? (
        <>
          <>
            <div className="freebies-container-desktop-1">
              <Freebies
                amountSpent={
                  (isQrFlowActive
                    ? (
                        freebiesData as unknown as {
                          sessionTotal?: number;
                        } | null
                      )?.sessionTotal
                    : freebiesData?.cartTotal) || 0
                }
                offers={freebiesData?.freebieEligible?.offers as Offer[]}
                handleCurrentFreebies={handleCurrentFreebies}
              />
            </div>
          </>
          <main className="order-item-container">
            <OrderItemList
              cartItems={cartItems as unknown as CartItem[]}
              language={language}
              lang={lang}
              PLUS_ICON={PLUS_ICON}
              cartId={(isQrFlowActive ? sessionId : cartId) as string}
              upsellProducts={upsellProducts}
              cartData={cartData as CartData}
              selectedFreebie={selectedFreebie}
              store={store}
              handleOpenFreebiesModal={(offerId: string) => {
                if (!offerId && hasAppliedFreebie) {
                  return;
                }
                setShowFreebiesModal(true);
                setCurrentFreebies(offerId);
              }}
              key={selectedFreebie as string}
              storeId={storeId as string}
              offerId={selectedFreebie as string}
              cartItemsId={
                (isQrFlowActive
                  ? sessionTicketItems?.[0]?.id
                  : cartItems?.[0]?.id) as string
              }
              UpdateSelectedFreebie={currentFreebies as string}
              handleCloseFreebiesModal={() => {
                setShowFreebiesModal(false);
              }}
              showFreebiesModal={showFreebiesModal}
              isQrFlow={isQrFlowActive}
            />

            <div className="flex flex-col checkout-content">
              {/* {showFreebiesModal && (
                <FreebiesModal
                  key={selectedFreebie}
                  storeId={storeId as string}
                  cartId={cartId as string}
                  offerId={selectedFreebie as string}
                  cartItemsId={cartItems?.[0]?.id as string}
                  UpdateSelectedFreebie={currentFreebies as string}
                  handleCloseFreebiesModal={() => {
                    setShowFreebiesModal(false);
                  }}
                />
              )} */}

              {!isQrFlowActive && (
                <div ref={orderTypeSectionRef}>
                  <SelectOrderType
                    handleDeliveryAddressId={handleDeliveryAddressId}
                    store={store}
                    handleOrderType={handleOrderType}
                    handleScheduleOrder={handleScheduleOrder}
                  />
                </div>
              )}

              {!isQrFlowActive && (
                <CookingInstructionsBox
                  cartId={cartId as string}
                  cartData={cartData as CartData}
                />
              )}

              {!isQrFlowActive && (
                <DiscountCodeInput
                  lang={lang}
                  cartId={cartId as string}
                  cartData={cartData as CartData}
                  handleApplyPromoCode={handleApplyPromoCode}
                />
              )}

              {orderType === "delivery" && (
                <DeliveryTipInput
                  tips={[5, 10, 15]}
                  initialTip={
                    (cartData?.data?.total as CartTotalSummary)?.tipAmount || 0
                  }
                  onTipChange={(amount) => dispatch(updateCartTip(amount))}
                  cartId={cartId}
                />
              )}

              {!isQrFlowActive && (
                <div ref={paymentMethodSectionRef}>
                  <ChoosePaymentMethod
                    paymentOptions={store.currentStore?.payment || []}
                    orderType={orderType || ""}
                    setPaymentMethods={setPaymentMethods}
                    setSelectedIntegrationPayment={
                      setSelectedIntegrationPayment
                    }
                    cartTotal={cartData?.data?.total as CartTotalSummary}
                    cartTotalLoading={loading}
                    cartItems={cartItems as CartItem[]}
                    onWalletPreviewData={setWalletPreviewData}
                  />
                </div>
              )}

              <div ref={orderSummaryRef} className="checkout-summary-block">
                <CheckOutOrderSummary
                  OrderSummary={cartData?.data?.total as CartTotalSummary}
                  cartItems={cartItems as unknown as CartItem[]}
                  discountCode={
                    cartData?.data?.appliedPromoCode?.promoCode || ""
                  }
                  deliveryFee={deliveryFee || 0}
                  orderType={orderType || ""}
                  promoCodeDiscount={
                    cartData?.data?.appliedPromoCode?.promoCodeDiscountAmount ||
                    0
                  }
                  isOpen={orderSummaryOpen}
                  onOpenChange={setOrderSummaryOpen}
                  isQrFlow={isQrFlowActive}
                  walletPreviewData={walletPreviewData}
                />
                {/* Temporarily hidden — delivery instructions (QR and normal flow) */}
                {false && (
                  <DeliveryInstructionsSection
                    selected={deliveryInstructionOptions}
                    onChange={setDeliveryInstructionOptions}
                    voiceNote={deliveryVoiceNote}
                    onVoiceNoteChange={setDeliveryVoiceNote}
                  />
                )}

                <div className="cancellation-policy">
                  <h3 className="heading-5 md-heading-3 font-600 m-0">
                    {lang.cancellationPolicy}
                  </h3>
                  <p className="extra-small-font md-heading-5 font-400 m-0 mt-1 leading-normal">
                    {lang.cancellationPolicyDescription}
                  </p>
                </div>
              </div>
            </div>
          </main>

          {isQrFlowActive && (
            <div className="mobile-cart-summary-qr-flow-wrapper md:hidden">
              <MobileCartSummary
                inline
                onViewBillDetails={() => setOrderSummaryOpen(true)}
                fixedBottomOffset={164}
                qrSummaryBottomOffset="157px"
              />
            </div>
          )}

          <MyOrderFooter
            lang={lang}
            store={store}
            storeAddress={storeAddress || ""}
            cartData={
              cartData || { data: { id: "", total: { finalAmount: 0 } } }
            }
            handleCheckout={handleCheckout}
            cancelOrderId={cartId || ""}
            buttonText={
              !isQrFlowActive
                ? orderType === "delivery" && !deliveryAddressId
                  ? lang.addAddress
                  : paymentMethods === "CASH"
                    ? lang.orderNow
                    : lang.payNow
                : lang.submitOrder
            }
            addresses={addresses}
            handleDeliveryAddressId={handleDeliveryAddressId}
            orderType={orderType || ""}
            deliveryFee={deliveryFee || 0}
            freebiesData={freebiesData}
            handleCurrentFreebies={handleCurrentFreebies}
            selectedFreebie={selectedFreebie}
            cartItems={cartItems as unknown as CartItem[]}
            showPrice={!(orderType === "delivery" && !deliveryAddressId)}
            isCheckoutSubmitting={
              isQrFlowActive ? isQrCheckoutSubmitting : false
            }
            onViewBillDetails={() => {
              if (!isQrFlowActive) {
                setOrderSummaryOpen(true);
                return;
              }
              requestAnimationFrame(() => {
                orderSummaryRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              });
            }}
            onCancelOrder={handleCancelOrder}
            isQrFlow={isQrFlowActive}
            walletPreviewData={walletPreviewData}
          />
        </>
      ) : null}
      <style>{`
                .cart-top-section {
                    background: linear-gradient(180deg, #F9F7F0 0%, #FAEBD9 100%);
                    position: sticky;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 100;
                }
                .cart-top-section--met {
                    background: linear-gradient(180deg, #F9F7F0 0%, #E8FFEE 100%);
                }
                .cart-top-section--no-threshold-banner {
                    border-bottom: 1px solid var(--borders-dividers);
                }
                .cart-top-section:not(.cart-top-section--no-threshold-banner)::after {
                    content: '';
                    display: block;
                    position: absolute;
                    bottom: -10px;
                    left: 0;
                    width: 100%;
                    height: 11px;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='11' viewBox='0 0 20 11'%3E%3Cpath d='M0,0 A10,10 0 0,0 20,0' fill='%23FAEBD9' stroke='%23F4B789' stroke-width='1'/%3E%3C/svg%3E");
                    background-size: 20px 11px;
                    background-repeat: repeat-x;
                }
                .cart-top-section--met:not(.cart-top-section--no-threshold-banner)::after {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='11' viewBox='0 0 20 11'%3E%3Cpath d='M0,0 A10,10 0 0,0 20,0' fill='%23E8FFEE' stroke='%23A8DDB5' stroke-width='1'/%3E%3C/svg%3E");
                }
                .cart-container{
                    background-color: var(--primary-background);
                    min-height: 100vh;
                    padding-bottom: max(16px, env(safe-area-inset-bottom));
                }
                .address-title {
                    font-size: var(--heading-h4);
                    font-weight: var(--font-bold);
                    color: var(--primary-text);
                }
                .address-text {
                    font-size: var(--description-font);
                    font-weight: var(--font-regular);
                    color: var(--secondary-text);
                }
                .footer-container{
                    background-color: var(--primary-background);
                    position: fixed;
                    bottom: 0;
                    width: 100%;
                    padding-bottom: max(12px, env(safe-area-inset-bottom));
                }
                .cancel-button{
                    width: 150px;
                    border: 1px solid var(--button-secondary-border-color);
                    border-radius: 10px;
                    padding: 10px;
                }
                .checkout-button{
                    width: 300px;
                    border-radius: 10px;
                }
                .cancel-title{
                    font-size: var(--heading-h4);
                    font-weight: var(--font-regular);
                }
                .checkout-title{
                    font-size: var(--heading-h4);
                    font-weight: var(--font-bold);
                }
                .checkout-price{
                    font-size: var(--heading-h4);
                    font-weight: var(--font-bold);
                    color: var(--button-primary-text);
                }
                .order-item-container{
                    background-color: var(--primary-background);
                    overflow-y: auto;
                    -webkit-overflow-scrolling: touch;
                    display: block;
                    height: auto;
                    min-height: 0;
                    padding: 30px 20px 20px;
                }
                .order-item-wrapper{
                    background-color: var(--cards-containers);
                    width: 60%;
                    // max-width: 1280px;
                    padding-left: 30px;
                    padding-right: 30px;
                    margin: auto;
                    border: 1px solid var(--borders-dividers);
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .divider {
                    width: 100%;
                    height: 1px;
                    background-color: var(--borders-dividers);
                }
                .product-name{
                    font-size: var(--heading-h4);
                    font-weight: var(--font-bold);
                    color: var(--primary-text);
                }
                .product-price{
                    font-size: var(--heading-h4);
                    font-weight: var(--font-regular);
                    color: var(--primary-text);
                }
                .modifier-price{
                    font-size: var(--description-font);
                    font-weight: var(--font-regular);
                    color: var(--secondary-text);
                }
                .modifier-name{
                    font-size: var(--description-font);
                    font-weight: var(--font-regular);
                    color: var(--secondary-text);
                }
                .modifier-item{
                    line-height: 1.5;
                }
                .input-field-modifier{
                    border: 1px solid var(--primary-color);
                    padding: 10px;
                    margin-top: 10px;
                    background-color: var(--cards-containers);
                }
                .input-field-modifier:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 2px var(--primary-color);
                }
                .checkout-summary-block:has(.delivery-instructions-container) .order-summary-container-desktop {
                    margin-bottom: 18px;
                }
                .checkout-summary-block:not(:has(.delivery-instructions-container)) .order-summary-container-desktop {
                    margin-bottom: 18px;
                }
                .cancellation-policy {
                    margin-bottom: 100px;
                    color: #968B64;
                }
                .checkout-content{
                    height: auto;
                    width: 60%;
                    margin: 0 auto;
                    padding: 0px;
                }
                .freebies-container-mobile {
                    display: none;
                }
                .freebies-container-desktop {
                    display: block;
                }
                @media (max-width: 768px) {
                    .checkout-button{
                        max-width: 165px;
                        width: 100%;
                    }
                    .order-item-wrapper{
                        background-color: var(--cards-containers);
                        width: calc(100% - 32px);
                        margin: 16px;
                        padding-left: 10px;
                        padding-right: 10px;
                        border: 1px solid var(--borders-dividers);
                    }
                    .qr-flow-order-item-wrapper{
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                    }
                    .qr-flow-item-detail{
                        border: 1px solid var(--borders-dividers);
                        border-radius: 8px;
                        padding: 10px;
                        background-color: var(--cards-containers);
                    }
                    .checkout-content{
                        width: 100%;
                    }
                    .product-name{
                        font-size: var(--description-font);
                    }
                    .product-price{
                        font-size: var(--description-font);
                    }
                    .checkout-title{
                        font-size: var(--heading-h5);
                    }
                    .cancel-title{
                        font-size: var(--heading-h5);
                    }
                    .modifier-price{
                        font-size: var(--small-font);
                    }
                    .modifier-name{
                        font-size: var(--small-font);
                    }
                    .order-item-container{
                        padding: ${hasThresholdBanner ? "10px 0px 0px" : "0"};
                        /* QR flow shows MobileCartSummary at bottom; reserve space so Bill details isn't hidden */
                        padding-bottom: ${isQrFlowActive ? "135px" : "80px"};
                        max-height: none;
                    }
                    .cart-container.delivery-order .order-item-container {
                        padding-bottom: 180px;
                    }
                    .footer-container{
                        position: fixed;
                        bottom: 0;
                        width: 100%;
                        background-color: var(--primary-background);
                        padding-bottom: max(12px, env(safe-area-inset-bottom));
                        z-index: 100;
                    }
                    .footer-container.footer-container-qr-flow {
                        bottom: 70px !important;
                        border-top: 1px solid var(--borders-dividers);
                    }
                    .freebies-container-mobile {
                        display: block;
                    }
                    .freebies-container-desktop {
                        display: none;
                    }
                    .cancellation-policy {
                        margin-bottom: 0;
                        padding: ${isQrFlowActive ? "16px 16px 0px" : "0 16px"};
                    }
                    .checkout-price{
                        color: ${isQrFlowActive ? "var(--button-primary-text)" : "var(--primary-text)"};
                    }
                }
            `}</style>
      {deliveryAddressId !== null && (
        <style>{`
          @media (max-width: 768px) {
            .delivery-address-selector {
              display: none;
            }
          }
        `}</style>
      )}
    </div>
  );
};

export default MyOrder;
