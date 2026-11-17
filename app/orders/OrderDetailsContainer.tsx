"use client";
import React, { FC, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import OrderTracker from "./OrderTracker";
import DeliveryPartnerSection from "./DeliveryPartnerSection";
import OrderAddressDetailsSection from "./OrderAddressDetailsSection";
import {
  CASH_WALLET_ICON,
  COIN_ICON,
  COOKING_INSTRUCTIONS_ICON,
  MASTER_CARD_ICON,
  MENU_STORE_ICON,
  MONEY_ICON,
  UPI_LOGO_ICON,
  NON_VEG_ICON,
  OFFER_GIFT_BOX_ICON,
  ORDER_CANCEL_STATUS_ICON,
  ORDER_SUMMARY_ICON,
  ORDER_TYPE_DELIVERY_ICON,
  ORDER_TYPE_DINE_IN_ICON,
  ORDER_TYPE_PICKUP_ICON,
  VEG_ICON,
} from "@config/Header/image.config";
import OrderSummarySection from "@components/order/OrderSummarySection";

import { useParams, useRouter } from "next/navigation";
import { useAppSearchParams } from "@context/SearchParamsContext";
import { RootState } from "@redux/store";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentOrderDetails } from "@redux/slices/ordersSlice";
import {
  getAllModifiers,
  getFullAddress,
  getOrderDetailsStatusHeading,
  getOrderDetailsStatusSubtitle,
  getOrderPaymentTenders,
  getOrderStatusReason,
  getOrderSteps,
  getOrderType,
  getTenderAmount,
  getTenderCardLast4,
  getTenderLoyaltyPoints,
  getTenderType,
  getValidRefundMethods,
  isShowCancelButton,
} from "@lib/helper/orders";
import formatCurrency from "@lib/helper/price";
import { getFormattedDateTime } from "@lib/helper/date";
import OrderDetailsContainerSkeleton from "./OrderDetailsContainerSkeleton";
import BackArrow from "@components/icons/BackArrow";
import { useTheme } from "context/ThemeProvider";
import useLang from "@hooks/useLang";
import { LanguageCode, TranslationKeys } from "types";
import ReviewModal from "./ReviewModal";
import RefundStatusSection from "./RefundStatusSection";
import RatingDisplay from "./RatingDisplay";
import { orderStatusConfig, orderTypeConfig } from "./orders.config";
import { AppliedOffer, OrderItem } from "@components/type/order.type";
import { useOrderReviews } from "@hooks/useOrderReviews";
import useProductUrl from "@hooks/useProductUrl";
import { close_dialog, open_dialog } from "@lib/modalHandler";
import { getTenantConfig } from "@config/tenant.config";
import Icon from "@components/image/Icons";

const ORDER_TYPE_ICON_MAP: Record<string, string> = {
  [orderTypeConfig.delivery]: ORDER_TYPE_DELIVERY_ICON,
  [orderTypeConfig.pickup]: ORDER_TYPE_PICKUP_ICON,
  [orderTypeConfig.dineIn]: ORDER_TYPE_DINE_IN_ICON,
};

interface OrderDetailsProps {
  containerClassName?: string;
}

interface FreebieItem {
  offer: AppliedOffer;
  item: OrderItem;
  offerName: string;
}

const OrderDetailsContainer: FC<OrderDetailsProps> = ({
  containerClassName,
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useParams();
  const searchParams = useAppSearchParams();
  const [lang, language]: [TranslationKeys, LanguageCode] = useLang();
  const orderId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const { currentOrderDetails, orders, isLoading } = useSelector(
    (state: RootState) => state.orders,
  );
  const dispatch = useDispatch();
  const tenant = getTenantConfig();
  const supportEmail = tenant.supportEmail || "support@plataway.com";
  const cookingInstructionsLabel =
    tenant.cookingInstructions || lang.cookingInstructions;

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Use custom hook for review management (Best Practice)
  const {
    storeReview: existingStoreReview,
    isLoading: isLoadingReviews,
    getStoreAverageRating,
    getProductReview,
    refetchReviews,
  } = useOrderReviews(
    currentOrderDetails?.orderNumber,
    currentOrderDetails?.status,
  );

  const handleRateReviewClick = () => {
    setIsReviewModalOpen(true);
  };

  const onReviewModalClose = () => {
    setIsReviewModalOpen(false);
    // Auto-refresh reviews to show newly submitted review
    if (currentOrderDetails?.orderNumber) {
      refetchReviews();
    }
  };

  const onCancelButtonClick = () => {
    open_dialog("orderCancelPopup", {
      open: true,
      propsData: {
        orderId,
        storeId: currentOrderDetails?.storefrontId,
      },
      anchor: "bottom",
      type: "orderCancelPopup",
      handlerDialog: () => {},
      handleClose: () => {
        close_dialog(["orderCancelPopup"]);
      },
      onlyDialog: true,
      sxStyle: {
        "& .MuiPaper-root": {
          maxWidth: "500px",
          width: "100%",
        },
      },
    });
  };

  useEffect(() => {
    if (!orderId || !orders?.length) return;

    const order = orders.find((item) => item.id === orderId);
    if (order) {
      dispatch(setCurrentOrderDetails(order));
    }
  }, [orderId, orders, dispatch]);

  const { getOrderProductUrl } = useProductUrl();

  const freebieItems = useMemo(() => {
    const offers =
      currentOrderDetails?.appliedOffers?.filter(
        (offer: { offerType?: string }) => offer?.offerType === "FREEBIE",
      ) || [];

    return offers
      .map((offer: AppliedOffer) => {
        const item = currentOrderDetails?.items?.find(
          (orderItem) => orderItem.id === offer.orderItemId,
        );

        if (!item) return null;

        const offerName =
          offer?.offerName?.[language] || offer?.offerName?.en || "Freebie";

        return { offer, item, offerName };
      })
      .filter((item): item is FreebieItem => item !== null);
  }, [currentOrderDetails, language]);

  const regularItems = useMemo(() => {
    if (!currentOrderDetails?.items?.length) return [];

    const freebiesIds =
      currentOrderDetails?.appliedOffers
        ?.filter(
          (offer: { offerType?: string }) => offer?.offerType === "FREEBIE",
        )
        ?.map((offer: AppliedOffer) => offer.orderItemId)
        .filter((id): id is string => id !== undefined) || [];

    return currentOrderDetails.items.filter(
      (item) => !freebiesIds.includes(item.id),
    );
  }, [currentOrderDetails]);

  const paymentDetailRows = useMemo(() => {
    if (!currentOrderDetails) return [];

    const rows: Array<{
      key: string;
      icon: string;
      alt: string;
      label: string;
      amount: number;
    }> = [];

    const tenders = getOrderPaymentTenders(currentOrderDetails);

    tenders.forEach((tender, index) => {
      const amount = getTenderAmount(tender);
      if (amount <= 0) return;

      const tenderType = getTenderType(tender);

      switch (tenderType) {
        case "LOYALTY_POINTS": {
          const loyaltyPoints = getTenderLoyaltyPoints(tender);
          const pointsLabel =
            loyaltyPoints > 0
              ? `${lang.pointsDiscount} (${loyaltyPoints} ${lang.walletPage.pointsUnit})`
              : lang.pointsDiscount;

          rows.push({
            key: `tender-${index}-loyalty`,
            icon: COIN_ICON,
            alt: lang.pointsDiscount,
            label: pointsLabel,
            amount,
          });
          break;
        }
        case "CASH_WALLET":
          rows.push({
            key: `tender-${index}-wallet`,
            icon: CASH_WALLET_ICON,
            alt: lang.wallet,
            label: lang.wallet,
            amount,
          });
          break;
        case "CARD":
        case "ONLINE": {
          const last4 =
            getTenderCardLast4(tender) ??
            currentOrderDetails.paymentDetails?.card?.last4;
          rows.push({
            key: `tender-${index}-card`,
            icon: MASTER_CARD_ICON,
            alt: lang.cardEnding,
            label: last4
              ? `${lang.cardEnding} xx${last4}`
              : lang.cardEnding,
            amount,
          });
          break;
        }
        case "CASH":
          rows.push({
            key: `tender-${index}-cash`,
            icon: MONEY_ICON,
            alt: lang.cash,
            label: lang.cash,
            amount,
          });
          break;
        case "UPI":
          rows.push({
            key: `tender-${index}-upi`,
            icon: UPI_LOGO_ICON,
            alt: lang.upiPayment,
            label: lang.upiPayment,
            amount,
          });
          break;
        default:
          break;
      }
    });

    if (rows.length > 0) return rows;

    const orderTotal = currentOrderDetails.orderTotal;
    const walletAmount = orderTotal?.memberCreditUsed ?? 0;
    const loyaltyAmount = orderTotal?.loyaltyRedemptionValue ?? 0;
    const loyaltyPoints = orderTotal?.loyaltyRedemptionPoints ?? 0;
    const finalAmount = orderTotal?.finalAmount ?? 0;
    const cardLast4 = currentOrderDetails.paymentDetails?.card?.last4;
    const isCashPayment = currentOrderDetails.paymentMethod === "CASH";
    const isDelivered =
      currentOrderDetails.status === orderStatusConfig.delivered;
    const remainingAmount = Math.max(
      0,
      finalAmount - walletAmount - loyaltyAmount,
    );

    if (walletAmount > 0) {
      rows.push({
        key: "wallet-fallback",
        icon: CASH_WALLET_ICON,
        alt: lang.wallet,
        label: lang.wallet,
        amount: walletAmount,
      });
    }

    if (loyaltyAmount > 0) {
      const pointsLabel =
        loyaltyPoints > 0
          ? `${lang.pointsDiscount} (${loyaltyPoints} ${lang.walletPage.pointsUnit})`
          : lang.pointsDiscount;

      rows.push({
        key: "points-fallback",
        icon: COIN_ICON,
        alt: lang.pointsDiscount,
        label: pointsLabel,
        amount: loyaltyAmount,
      });
    }

    const paymentMethod = currentOrderDetails.paymentMethod?.toUpperCase();
    const hasPrimaryPayment = rows.some(
      (row) =>
        row.key.includes("card") ||
        row.key.includes("cash") ||
        row.key.includes("upi"),
    );

    if (!hasPrimaryPayment && remainingAmount > 0) {
      if (
        (paymentMethod === "CARD" || paymentMethod === "ONLINE") &&
        cardLast4
      ) {
        rows.push({
          key: "card-fallback",
          icon: MASTER_CARD_ICON,
          alt: lang.cardEnding,
          label: `${lang.cardEnding} xx${cardLast4}`,
          amount: remainingAmount,
        });
      } else if (paymentMethod === "UPI") {
        rows.push({
          key: "upi-fallback",
          icon: UPI_LOGO_ICON,
          alt: lang.upiPayment,
          label: lang.upiPayment,
          amount: remainingAmount,
        });
      } else if (isCashPayment && isDelivered) {
        rows.push({
          key: "cash-fallback",
          icon: MONEY_ICON,
          alt: lang.cash,
          label: lang.cash,
          amount: remainingAmount,
        });
      }
    }

    return rows;
  }, [currentOrderDetails, lang]);

  const loyaltyPointsLabel = useMemo(() => {
    const isDelivery =
      currentOrderDetails?.orderType === orderTypeConfig.delivery;
    const isDelivered =
      currentOrderDetails?.status === orderStatusConfig.delivered;

    if (isDelivery && !isDelivered) {
      return lang.order.earnsAfterDelivery;
    }
    return lang.order.earnedWithThisOrder;
  }, [
    currentOrderDetails?.orderType,
    currentOrderDetails?.status,
    lang.order.earnsAfterDelivery,
    lang.order.earnedWithThisOrder,
  ]);

  const itemLoyaltyPointsLabel = useMemo(() => {
    const isDelivery =
      currentOrderDetails?.orderType === orderTypeConfig.delivery;
    const isDelivered =
      currentOrderDetails?.status === orderStatusConfig.delivered;

    if (isDelivery && !isDelivered) {
      return lang.order.earnsAfterDelivery;
    }
    return lang.order.earnedWithThisItem;
  }, [
    currentOrderDetails?.orderType,
    currentOrderDetails?.status,
    lang.order.earnsAfterDelivery,
    lang.order.earnedWithThisItem,
  ]);

  const showCancelOrderButton = Boolean(
    currentOrderDetails &&
      isShowCancelButton(
        currentOrderDetails.status || "",
        currentOrderDetails.paymentMethod,
      ),
  );

  const orderDetailsStatusHeading = useMemo(
    () =>
      getOrderDetailsStatusHeading(
        currentOrderDetails?.status || "",
        lang,
        currentOrderDetails?.orderType,
      ),
    [currentOrderDetails?.status, currentOrderDetails?.orderType, lang],
  );

  const isRejectedOrCancelledOrder = useMemo(
    () =>
      currentOrderDetails?.status === orderStatusConfig.rejected ||
      currentOrderDetails?.status === orderStatusConfig.cancelled,
    [currentOrderDetails?.status],
  );

  const shouldShowOrderTracker = useMemo(
    () =>
      currentOrderDetails?.status !== orderStatusConfig.cancelled &&
      currentOrderDetails?.status !== orderStatusConfig.rejected &&
      currentOrderDetails?.status !== orderStatusConfig.paymentFailed,
    [currentOrderDetails?.status],
  );

  const orderStatusReason = useMemo(
    () => getOrderStatusReason(currentOrderDetails),
    [currentOrderDetails],
  );

  const orderDetailsStatusSubtitle = useMemo(
    () =>
      getOrderDetailsStatusSubtitle(
        currentOrderDetails?.status || "",
        lang,
        currentOrderDetails?.driverInfo?.name,
        currentOrderDetails?.orderType,
      ),
    [
      currentOrderDetails?.status,
      currentOrderDetails?.driverInfo?.name,
      currentOrderDetails?.orderType,
      lang,
    ],
  );

  const validRefundMethods = useMemo(
    () => getValidRefundMethods(currentOrderDetails?.refundMethods),
    [currentOrderDetails?.refundMethods],
  );

  const shouldShowRefundStatus = useMemo(() => {
    const status = currentOrderDetails?.status;
    const isCancelledOrRefunded =
      status === orderStatusConfig.cancelled ||
      status === orderStatusConfig.refunded;
    return isCancelledOrRefunded && validRefundMethods.length > 0;
  }, [currentOrderDetails?.status, validRefundMethods.length]);

  const onLeftArrowClick = () => {
    // dispatch(setShowOrderDetails(false));
    const params = searchParams.toString();
    const targetUrl = `/orders${params ? `?${params}` : ""}`;
    router.push(targetUrl);
  };

  // Generate product URL for order items - preserves original format:
  // /products/${productSlug}?store=${storeSlug}&category=${categorySlug}&menu=${menuSlug || "all-day"}
  const getOrderItemProductUrl = (item: OrderItem) => {
    const storeSlug = currentOrderDetails?.storefrontSlug || "";
    return getOrderProductUrl(
      item.productSlug || "",
      item.productCategorySlug || "",
      item.menuSlug || "all-day",
      storeSlug,
    );
  };

  return (
    <div
      className={` h-full w-full flex-1 flex flex-col overflow-y-auto hide-scrollbar bg-[var(--quaternary-background)] rounded-[0px] focus:outline-none focus:ring-0 ${
        containerClassName || ""
      }`}
    >
      {isLoading ? (
        <OrderDetailsContainerSkeleton />
      ) : !currentOrderDetails ? (
        <div className="flex justify-center items-center h-full flex-1">
          {lang.order.noOrderDetailsFound}
        </div>
      ) : (
        <>
          <div className="flex items-center  gap-x-4 p-4 md:hidden bg-[var(--primary-background)] border-b border-[var(--borders-dividers)]">
            <BackArrow
              pathFillColor="var(--primary-text)"
              onClick={onLeftArrowClick}
            />
            <h3
              title={`Order ID: ${currentOrderDetails?.id}`}
              className="heading-5 font-600 truncate leading-tight "
            >
              Order ID: #{currentOrderDetails?.orderNumber}
              <p className="heading-6 font-normal text-[var(--secondary-text)] text-nowrap">
                {getFormattedDateTime(currentOrderDetails?.createdAt || 0)}
              </p>
            </h3>
          </div>
          {/* Header */}
          <div className="flex flex-col gap-5 bg-[var(--primary-tab-background)]">
            <div className="order-details-container border border-[var(--rating-border-primary)]">
              {/* Web view: store name, address, order type box */}
              <div className="">
                <div className="flex flex-col justify-between items-start md:m-6 m-4">
                  
                    <div className="flex items-center justify-between w-full">
                    <p className="order-number small-font md:description-font text-[var(--secondary-text)]">
                      Order ID: #{currentOrderDetails?.orderNumber}
                    </p>
                    <p className="small-font md:description-font text-[var(--secondary-text)] hidden md:block text-nowrap">
                    {getFormattedDateTime(currentOrderDetails?.createdAt || 0)}
                    </p>
                    </div>
                    {orderDetailsStatusHeading && (
                      <div className="mt-2 md:mt-4 w-full">
                        <h2
                          className={`heading-2 md:text-[32px] font-700 flex items-center gap-2 md:gap-3 ${
                            currentOrderDetails?.status ===
                            orderStatusConfig.delivered
                              ? "text-[var(--success)]"
                              : currentOrderDetails?.status ===
                                  orderStatusConfig.paymentFailed
                                ? "text-[var(--error)]"
                                : isRejectedOrCancelledOrder
                                  ? "text-[var(--primary-text)]"
                                  : "text-[var(--accent-color)]"
                          }`}
                        >
                          {isRejectedOrCancelledOrder && (
                            <img
                              src={ORDER_CANCEL_STATUS_ICON}
                              alt=""
                              className="w-8 h-8 md:w-[47px] md:h-[47px] shrink-0"
                            />
                          )}
                          {orderDetailsStatusHeading}
                        </h2>
                        {!shouldShowOrderTracker ? (
                          orderStatusReason && (
                            <div className="mt-2 border-t border-[var(--borders-dividers)] pt-3">
                              <p className="small-font font-600 md:description-font text-[var(--error)]">
                                {lang.order.reason} : {orderStatusReason}
                              </p>
                            </div>
                          )
                        ) : (
                          orderDetailsStatusSubtitle && (
                            <p className="small-font md:description-font text-[var(--secondary-text)] mt-1">
                              {orderDetailsStatusSubtitle}
                            </p>
                          )
                        )}
                      </div>
                    )}

                    {/* <h3 className="heading-4 md:heading-3 font-600 md:mt-5">
                      {currentOrderDetails?.storefrontName}
                    </h3>
                    <p className="small-font md:description-font text-[var(--secondary-text)] mt-1">
                      {getFullAddress(currentOrderDetails?.storeAddress || {})}
                    </p> */}
                    {/* <p className="small-font text-[var(--secondary-text)] md:hidden mt-2">
                  {getFormattedDateTime(currentOrderDetails?.createdAt || 0)}
                </p> */}
                  
               
                </div>

               {/* Order Status */}

                {shouldShowOrderTracker && (
                <div className="order-details-container w-full flex flex-col gap-y-5 pb-0 md:px-6 px-4 mb-4">
                  {/* <span className="font-700 heading-5">
                    {lang.order.trackOrder}
                  </span> */}
                  <OrderTracker
                    steps={getOrderSteps(
                      currentOrderDetails?.status || "",
                      lang,
                      currentOrderDetails?.orderType,
                    )}
                  />
                </div>
                )}


                {(currentOrderDetails?.orderType === orderTypeConfig.delivery ||
                  currentOrderDetails?.orderType === orderTypeConfig.pickup) && (
                  <DeliveryPartnerSection
                    orderType={currentOrderDetails?.orderType}
                    orderStatus={currentOrderDetails?.status}
                    driverInfo={currentOrderDetails?.driverInfo}
                    storefrontName={currentOrderDetails?.storefrontName}
                    storePhone={currentOrderDetails?.storePhone}
                    storeAddress={currentOrderDetails?.storeAddress}
                    lang={lang}
                  />
                )}
                    
                {/* Order Type - Web */}
                {/* <div className="flex flex-col gap-y-1 small-font bg-[var(--primary-active-background)] border border-[var(--button-primary-active-background)] md:m-6 m-4 mt-0 md:mt-0 p-3 rounded-lg ">
                  <p className=" text-[var(--secondary-text)]">
                    {lang.order.orderType}
                  </p>
                  <p className="description-font">
                    {getOrderType(currentOrderDetails?.orderType || "")
                      .charAt(0)
                      .toUpperCase() +
                      getOrderType(currentOrderDetails?.orderType || "")
                        .slice(1)
                        .toLowerCase()}
                  </p>
                  {currentOrderDetails?.orderType === "DELIVERY" && (
                    <>
                      <p className=" text-[var(--secondary-text)] mt-1">
                        {lang.order.deliverTo}
                      </p>
                      <p className="description-font">
                        <span className="font-700">
                          {currentOrderDetails?.deliveryInfo?.type} :{" "}
                        </span>
                        {getFullAddress(
                          currentOrderDetails?.deliveryInfo || {},
                        )}
                      </p>
                    </>
                  )}
                </div> */}
              </div>

              <div>
                
                {/* Store Rating Section - positioned right after Track Order */}
                {currentOrderDetails?.status === "DELIVERED" &&
                  (isLoadingReviews ? (
                    <div className="order-details-container w-full my-4 md:my-6 flex justify-center items-center md:px-6 px-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary-color)]"></div>
                    </div>
                  ) : existingStoreReview ? (
                    <div className="order-details-container w-full my-4 md:my-6 flex flex-col gap-y-4 md:px-6 px-4">
                      <RatingDisplay
                        title="Store Rating"
                        rating={getStoreAverageRating()}
                        reviewText={existingStoreReview.content}
                        onEditClick={handleRateReviewClick}
                        showMedia={false}
                        gradientBackground
                      />
                    </div>
                  ) : (
                    <div className="w-full my-4 md:my-6 md:px-6 px-4">
                      <div
                        className="rounded-xl border border-[var(--rating-border-primary)] p-4 md:p-5 flex flex-col items-start gap-3"
                        style={{
                          background:
                            "linear-gradient(90deg, #FFFFFF 0%, #FFF2DA 100%)",
                        }}
                      >
                        <p className="font-700 text-[var(--primary-text)]">
                          {lang.order.shareExperienceHeading}
                        </p>
                        <p className="small-font text-[var(--secondary-text)]">
                          {lang.order.shareExperienceDescription}
                        </p>
                        <button
                          onClick={handleRateReviewClick}
                          className={`px-5 py-2.5 font-700 rounded-lg border border-[var(--button-primary-background)] transition-colors ${
                            theme === "dark"
                              ? "bg-[var(--button-primary-background)] text-[var(--button-primary-text)]"
                              : "bg-transparent text-[var(--button-primary-background)]"
                          }`}
                        >
                          {lang.order.rateReview}
                        </button>
                      </div>
                    </div>
                  ))}

              </div>
            </div>

            {/* Address Details */}
            <OrderAddressDetailsSection
              storefrontName={currentOrderDetails?.storefrontName}
              storeAddress={currentOrderDetails?.storeAddress}
              orderType={currentOrderDetails?.orderType}
              orderStatus={currentOrderDetails?.status}
              deliveryInfo={currentOrderDetails?.deliveryInfo}
              customerDetails={currentOrderDetails?.customerDetails}
              lang={lang}
            />

            {shouldShowRefundStatus ? (
              <RefundStatusSection
                refundMethods={validRefundMethods}
                order={currentOrderDetails}
                lang={lang}
                supportEmail={supportEmail}
              />
            ) : null}

            {/* Order Items */}
            <div className="order-details-container w-full md:px-6 px-4 pb-4 md:pb-6 border border-[var(--rating-border-primary)]">
              <p className="flex items-center gap-2.5 md-heading-4 font-700 text-[var(--primary-text)] pt-7 pb-1 md:pb-4 ">
                <span className="flex shrink-0 items-center justify-center rounded-full border border-[var(--rating-border-primary)] w-9 h-9">
                  <Icon
                    icon={`${ORDER_SUMMARY_ICON}#order-summary`}
                    className="w-4 h-4"
                    width={16}
                    height={16} 
                    viewBox="0 0 17 18"
                  />
                </span>
                {lang.order.orderSummary}
              </p>
              <div className="flex flex-col gap-y-2 md:bg-[var(--order-summary-bg)] rounded-xl">
              {regularItems?.map((item, index) => (
                <div
                  key={item.id || index}
                  className={`flex flex-col md:mx-4 border-b border-dashed py-4 md:py-6 ${
                    index === regularItems?.length - 1 &&
                    freebieItems.length === 0
                      ? "border-b-0"
                      : ""
                  } ${
                    theme === "light"
                      ? "border-[var(--borders-dividers)]"
                      : "border-[var(--border-dividers-color)]"
                  }`}
                >
                  <div className="flex justify-between items-center small-font md:description-font text-[var(--primary-text)]">
                    {/* <p className="">{`${item.productName.en} ( ${
                      item.quantity
                    } x ${formatCurrency({ amount: item.unitBasePrice })})`}
                    </p> */}
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          item?.metaData?.["productAttributes.containsMeat"]
                            ? NON_VEG_ICON
                            : VEG_ICON
                        }
                        alt="dietary-indicator"
                        className="w-4 h-4"
                      />
                      <Link
                        href={getOrderItemProductUrl(item)}
                        className="order-item-name cursor-pointer"
                        prefetch={true}
                      >
                        {`${item.productName.en}`}
                      </Link>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.totalBaseDiscountAmount &&
                      item.totalBaseDiscountAmount > 0 ? (
                        <>
                          {tenant.showStrikethroughPrice && (
                            <span className="line-through text-[var(--secondary-text)] small-font">
                              {formatCurrency({ amount: item.totalBasePrice })}
                            </span>
                          )}
                          <span className="small-font text-[var(--primary-text)]">
                            {formatCurrency({
                              amount: item.totalBasePriceAfterBaseDiscount,
                            })}
                          </span>
                        </>
                      ) : (
                        <span className="small-font text-[var(--primary-text)]">
                          {formatCurrency({ amount: item.totalBasePrice })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Combo Groups - Show individual combo items */}
                  {item.productType?.toUpperCase() === "COMBO" &&
                    item?.comboGroups &&
                    item?.comboGroups?.length > 0 && (
                      <div className="mt-2">
                        {item?.comboGroups?.map((group) => (
                          <div key={group.id}>
                            <div className="flex justify-between extra-small-font items-center md-heading-6 text-[var(--secondary-text)] mt-1">
                              <p>
                                {group.productName.en}
                                {group.variantAttributes?.size &&
                                  ` (${group.variantAttributes.size})`}
                              </p>
                            </div>
                            {/* Show modifiers for combo group items */}
                            {group.modifierGroup &&
                              group.modifierGroup.length > 0 && (
                                <div className="ml-4 mt-1">
                                  {group.modifierGroup.map(
                                    (modifierGroup, groupIndex) =>
                                      modifierGroup.modifiers &&
                                      modifierGroup.modifiers.length > 0
                                        ? modifierGroup.modifiers.map(
                                            (modifier, modifierIndex) => (
                                              <div
                                                key={`${group.id}-modifier-${groupIndex}-${modifierIndex}`}
                                                className="flex justify-between extra-small-font items-center md-heading-6 text-[var(--secondary-text)] mt-1"
                                              >
                                                <div className="modifier-name">
                                                  {modifier.modifierName.en}
                                                </div>
                                              </div>
                                            ),
                                          )
                                        : null,
                                  )}
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    )}
                  {getAllModifiers(item.modifierGroup) &&
                  getAllModifiers(item.modifierGroup).length > 0
                    ? getAllModifiers(item.modifierGroup).map((modifier) => (
                        <div
                          key={modifier.id}
                          className="flex justify-between extra-small-font  items-center md-heading-6 text-[var(--secondary-text)]"
                        >
                          {/* <p>{`${modifier.modifierName.en} ( ${
                            item.quantity
                          } x ${formatCurrency({
                            amount: modifier.unitPrice,
                          })})`}</p> */}
                          <p className="">{`${item.quantity} x ${modifier.modifierName.en}`}</p>
                          <p className="">
                            {formatCurrency({
                              amount: item.quantity * modifier.unitPrice,
                            })}{" "}
                          </p>
                        </div>
                      ))
                    : null}
                  {/* item tax */}
                  {/* {item.taxAmount ? (
                    <div className="tax flex justify-between items-center extra-small-font md:small-font text-[var(--secondary-text)]">
                      <p>{`Tax`}</p>
                      <p>{formatCurrency({ amount: item.taxAmount })}</p>
                    </div>
                  ) : null} */}
                  {/* item discount */}
                  {/* {item.totalDiscountAmount ? (
                    <div className="discount flex justify-between items-center extra-small-font md:small-font text-[var(--secondary-text)]">
                      <p>{`Total Discount`}</p>
                      <p>
                        -{formatCurrency({ amount: item.totalDiscountAmount })}
                      </p>
                    </div>
                  ) : null} */}
                  {/*item total */}
                  <div className="total flex justify-between items-center mt-3">
                    <p>
                      {lang.order.total}: ({item.quantity} x{" "}
                      {formatCurrency({
                        amount:
                          (item.unitBasePrice ?? 0) -
                          (item.baseDiscountAmount ?? 0) +
                          (item.baseModifiersPrice ?? 0),
                      })}
                      )
                      {/* <strong className="font-bold">{`  ${item.subTotalBeforeDiscountAndTaxes}`}</strong> */}
                    </p>
                    <p className="font-bold">
                      {formatCurrency({
                        amount: item.subTotalAfterBaseDiscount,
                      })}
                    </p>
                  </div>
                  {(item.earnedLoyaltyPoints ?? 0) > 0 && (
                    <div className="mt-2 inline-flex max-w-fit flex-wrap items-center gap-1.5 rounded-full bg-[linear-gradient(90deg,rgba(160,61,251,0.1)_0%,rgba(255,255,255,0.1)_100%)] px-3 py-1">
                      <img
                        src={COIN_ICON}
                        alt=""
                        width={16}
                        height={16}
                        className="shrink-0"
                        aria-hidden
                      />
                      <span className="small-font font-600 text-[var(--loyalty-badge-bg)]">
                        {(item.earnedLoyaltyPoints ?? 0).toLocaleString()}{" "}
                        {lang.walletPage.pointsUnit}
                      </span>
                      <span className="extra-small-font self-end font-normal text-[var(--loyalty-badge-bg)]">
                        {itemLoyaltyPointsLabel}
                      </span>
                    </div>
                  )}
                  {item.specialInstructions && (
                    <p className="small-font mt-3">
                      <span className="font-semibold">Instructions:</span>{" "}
                      <span className="italic">{`"${item.specialInstructions}"`}</span>
                    </p>
                  )}

                  {/* Food Rating for this specific item */}
                  {currentOrderDetails?.status === "DELIVERED" &&
                    !isLoadingReviews &&
                    (() => {
                      const productReview = getProductReview(item.productId);
                      return productReview ? (
                        <div className="mt-4">
                          <RatingDisplay
                            title="Food Rating"
                            rating={productReview.rating}
                            reviewText={productReview.content}
                            media={productReview.media}
                            onEditClick={handleRateReviewClick}
                            showMedia={true}
                          />
                        </div>
                      ) : null;
                    })()}
                </div>
              ))}
               {/* Freebie Items */}
               {freebieItems.length > 0 && (
                <div className="flex flex-col gap-3 pb-4 pt-3 mx-4">
                  {freebieItems.map(
                    ({ offer, item, offerName }: FreebieItem) => {
                      return (
                        <div key={offer.id}>
                          <div className="flex justify-between items-center gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <p className="font-700 text-[var(--primary-text)] leading-snug truncate">
                                {(item?.productName &&
                                typeof item.productName === "object" &&
                                "en" in item.productName
                                  ? (
                                      item.productName as Record<string, string>
                                    )[language] || item.productName.en
                                  : item?.productName?.en) || ""}
                                {item?.variantAttributes?.size
                                  ? `, ${item.variantAttributes.size}`
                                  : ""}
                              </p>
                            </div>
                            <div className="text-right flex flex-row items-center justify-end gap-[6px]">
                              {item.totalBaseDiscountAmount > 0 && tenant.showStrikethroughPrice ? (
                                <span className="line-through text-[var(--secondary-text)] text-sm">
                                  {formatCurrency({
                                    amount: item.totalBasePrice,
                                  })}
                                </span>
                              ) : null}
                              <span className="text-[var(--primary-text)]">
                                {formatCurrency({
                                  amount:
                                    item.totalBasePrice -
                                    (item.totalBaseDiscountAmount || 0),
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center gap-3">
                            <div className="inline-flex items-center gap-2 bg-[var(--freebie-tag-color)] px-3 rounded-full uppercase freebie-tag-text leading-none py-[6px]">
                              <img
                                src={OFFER_GIFT_BOX_ICON}
                                alt="freebie"
                                className="w-4 h-4"
                              />
                              <span className="truncate">{offerName}</span>
                            </div>
                            {offer?.discountAmount > 0 && (
                              <span className="freebie-discount-amount">
                                -
                                {formatCurrency({
                                  amount: offer?.discountAmount,
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
              </div>

             
            </div>

            {/* Cooking Instructions */}
            {currentOrderDetails?.orderInstruction && (
              <div className={`order-details-container p-4 border border-[var(--rating-border-primary)]`}>
                <p className="font-700 md-heading-4 flex items-center gap-2.5">
                <span className="flex shrink-0 items-center justify-center rounded-full border border-[var(--rating-border-primary)] w-9 h-9">
                  <Icon
                    icon={`${COOKING_INSTRUCTIONS_ICON}#instruction`}
                    className="w-5 h-5"
                    width={16}
                    height={16} 
                    viewBox="0 0 18 18"
                  />
                </span>
                  {cookingInstructionsLabel}</p>
                <p className="md-heading-5 mt-3">
                  {`"${currentOrderDetails.orderInstruction}"`}
                </p>
              </div>
            )}

            {/* Order Summary */}
            <div className="order-details-container border border-[var(--rating-border-primary)]">
              <OrderSummarySection
                title={lang.order.priceBreakdown}
                itemTotalLabel={`${lang.order.itemTotal} (${currentOrderDetails?.items?.length ?? 0} ${(currentOrderDetails?.items?.length ?? 0) > 1 ? "items" : "item"})`}
                itemTotalAmount={
                  currentOrderDetails?.orderTotal?.itemSubTotal ?? 0
                }
                deliveryFee={currentOrderDetails?.orderTotal?.deliveryFee}
                deliveryChargeLabel={lang.order.deliveryCharge}
                tipAmount={currentOrderDetails?.orderTotal?.tipAmount}
                tipLabel={lang.tip}
                taxLabel={lang.taxAndOtherCharges}
                taxAmount={currentOrderDetails?.orderTotal?.totalTax ?? 0}
                itemDiscount={
                  (currentOrderDetails?.orderTotal?.itemLevelDiscount ?? 0) -
                  (currentOrderDetails?.appliedPromoCode
                    ?.promoCodeDiscountAmount ?? 0)
                }
                itemDiscountsLabel={lang.itemDiscounts}
                couponText={
                  currentOrderDetails?.appliedPromoCode?.promoCode
                    ? `${lang.couponApplied} - [${currentOrderDetails.appliedPromoCode.promoCode}]`
                    : undefined
                }
                couponDiscount={
                  currentOrderDetails?.appliedPromoCode
                    ?.promoCodeDiscountAmount ?? 0
                }
                grandTotalLabel={lang.order.grandTotal}
                grandTotalAmount={
                  currentOrderDetails?.orderTotal?.grandTotal ??
                  currentOrderDetails?.orderTotal?.finalAmount ??
                  0
                }
                totalDiscount={currentOrderDetails?.orderTotal?.totalDiscount}
                savedOnTheTotalLabel={lang.order.savedOnTheTotal}
                hideBorderBottom={
                  paymentDetailRows.length === 0 && !showCancelOrderButton
                }
                earnedLoyaltyPoints={
                  currentOrderDetails?.orderTotal?.earnedLoyaltyPoints
                }
                pointsUnit={lang.walletPage.pointsUnit}
                earnedWithThisOrderLabel={loyaltyPointsLabel}
              />
              {/* Payment Details */}
              {paymentDetailRows.length > 0 && (
                <div
                  className={`md:mx-6 mx-4 md:py-6 py-5 ${
                    showCancelOrderButton
                      ? "border-b border-[var(--rating-border-primary)]"
                      : ""
                  }`}
                >
                  <p className="font-600 mb-4">{lang.order.paymentDetails}</p>
                  <div className="flex flex-col gap-y-4">
                    {paymentDetailRows.map((row) => (
                      <div
                        key={row.key}
                        className="flex items-center justify-between gap-4"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <div
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F9F7F0]"
                            aria-hidden
                          >
                            <img
                              src={row.icon}
                              alt={row.alt}
                              className="h-4 w-4 shrink-0"
                            />
                          </div>
                          <p className="truncate">{row.label}</p>
                        </div>
                        <p className="shrink-0">
                          {formatCurrency({ amount: row.amount })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Order cancellation */}
              {showCancelOrderButton ? (
                <p
                  onClick={onCancelButtonClick}
                  className="text-[var(--accent-color)] md:px-6 px-4 py-6 cursor-pointer"
                >
                  {lang.order.cancelOrder}
                </p>
              ) : null}
            </div>
          </div>
        </>
      )}
      {isReviewModalOpen && currentOrderDetails && (
        <ReviewModal
          isReviewModalOpen={isReviewModalOpen}
          onReviewModalClose={onReviewModalClose}
          currentOrderDetails={currentOrderDetails}
        />
      )}
      <style>{`
        .order-details-container {
          background-color: var(--quaternary-background);
        }
        .order-number {
          display: none;
        }
        .order-item-name{
          font-size: var(--heading-h5);
          font-weight: var(--font-semi-bold);
        }
        .freebie-tag-text {
          font-size: var(--extraSmall-font);
          font-weight: var(--font-semi-bold);
          color: var(--white);
        }
        .freebie-discount-amount {
          font-size: var(--small-font);
          font-weight: var(--font-regular);
          color: var(--success);
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
};

export default OrderDetailsContainer;
