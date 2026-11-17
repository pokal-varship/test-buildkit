"use client";

import React from "react";
import formatCurrency from "@lib/helper/price";
import { COIN_ICON, LOYALTY_BADGE_ICON, OFFER_DETAILS_ICON, PRICE_ICON } from "@config/Header/image.config";
import Icon from "@components/image/Icons";
import "../../app/orders/orders.css";
export interface OrderSummarySectionProps {
  /** Section heading, e.g. "Order Summary" */
  title: string;
  /** Label for item total row, e.g. "Item total (2 items)" */
  itemTotalLabel: string;
  /** Amount for item total */
  itemTotalAmount: number;
  /** Delivery fee; row shown only if > 0 */
  deliveryFee?: number;
  /** Label for delivery charge row */
  deliveryChargeLabel?: string;
  /** Tip amount; row shown only if > 0 */
  tipAmount?: number;
  /** Label for tip row */
  tipLabel?: string;
  /** Label for tax row, e.g. "Tax & other charges" */
  taxLabel?: string;
  /** Tax amount; row only shown if > 0 */
  taxAmount?: number;
  /** Item-level discount amount (positive number, displayed as minus); row shown only if > 0 */
  itemDiscount?: number;
  /** Label for item discounts row */
  itemDiscountsLabel?: string;
  /** Coupon/promo code text, e.g. "Coupon applied - [CODE]"; row shown only if provided */
  couponText?: string;
  /** Coupon discount amount (displayed as minus) */
  couponDiscount?: number;
  /** Label for grand total, e.g. "Grand total" */
  grandTotalLabel: string;
  /** Grand total amount */
  grandTotalAmount: number;
  /** Total saved/discount amount; green banner shown only if > 0 */
  totalDiscount?: number;
  /** Label for saved-on-total banner */
  savedOnTheTotalLabel?: string;
  /** If true, omit bottom border on container (e.g. for CASH cancelled state) */
  hideBorderBottom?: boolean;
  /** Optional class for container */
  className?: string;
  /** Loyalty points earned on this order; badge shown only if > 0 */
  earnedLoyaltyPoints?: number;
  /** e.g. "pts" */
  pointsUnit?: string;
  /** e.g. "Earned with this order" */
  earnedWithThisOrderLabel?: string;
}

/**
 * Reusable order summary block: same fields as order details (item total, delivery, tip, tax,
 * discounts, coupon, grand total, saved banner). Used in OrderDetailsContainer (normal flow)
 * and QrCheckoutOrderView (QR flow); only the data source differs.
 */
const OrderSummarySection: React.FC<OrderSummarySectionProps> = ({
  title,
  itemTotalLabel,
  itemTotalAmount,
  deliveryFee = 0,
  deliveryChargeLabel,
  tipAmount = 0,
  tipLabel,
  taxLabel,
  taxAmount = 0,
  itemDiscount = 0,
  itemDiscountsLabel,
  couponText,
  couponDiscount = 0,
  grandTotalLabel,
  grandTotalAmount,
  totalDiscount = 0,
  savedOnTheTotalLabel,
  hideBorderBottom = false,
  className = "",
  earnedLoyaltyPoints = 0,
  pointsUnit,
  earnedWithThisOrderLabel,
}) => {
  const showTax = (taxAmount ?? 0) > 0;
  const showDelivery = (deliveryFee ?? 0) > 0 && deliveryChargeLabel;
  const showTip = (tipAmount ?? 0) > 0 && tipLabel;
  const showItemDiscount = (itemDiscount ?? 0) > 0 && itemDiscountsLabel;
  const showCoupon = Boolean(couponText);
  const showSaved = (totalDiscount ?? 0) > 0 && savedOnTheTotalLabel;
  const showEarnedLoyalty =
    (earnedLoyaltyPoints ?? 0) > 0 &&
    Boolean(pointsUnit && earnedWithThisOrderLabel);
  const hasFirstGroup =
    showDelivery || showItemDiscount || showCoupon;
  const hasTaxTipGroup = (showTax && Boolean(taxLabel)) || showTip;

  return (
    <div
      className={`order-summary-section w-full flex flex-col gap-y-2 px-4 py-6 md:py-6 ${hideBorderBottom ? "" : "border-b border-[var(--rating-border-primary)]"} ${className}`}
    >
      <p className="flex items-center gap-2.5 md-heading-4 font-700 text-[var(--primary-text)] mb-2">
        <span className="flex shrink-0 items-center justify-center rounded-full border border-[var(--rating-border-primary)] w-9 h-9">
          <Icon
            icon={`${PRICE_ICON}#price`}
            className="w-4 h-4"
            width={16}
            height={16}
            viewBox="0 0 15 18"
          />
        </span>
        {title}
      </p>
      <div
        className={`flex flex-col gap-y-2 ${hasFirstGroup ? "border-b-dashed-9 pb-2" : ""}`}
      >
        <div className="flex justify-between heading-6">
          <p>{itemTotalLabel}</p>
          <p>{formatCurrency({ amount: itemTotalAmount })}</p>
        </div>
        {showDelivery && (
          <div className="flex justify-between heading-6">
            <p>{deliveryChargeLabel}</p>
            <p>{formatCurrency({ amount: deliveryFee! })}</p>
          </div>
        )}
        {showItemDiscount && (
          <div className="flex justify-between heading-6">
            <p>{itemDiscountsLabel}</p>
            <p>- {formatCurrency({ amount: itemDiscount })}</p>
          </div>
        )}
        {showCoupon && (
          <div className="flex justify-between heading-6">
            <p>{couponText}</p>
            <p>- {formatCurrency({ amount: couponDiscount })}</p>
          </div>
        )}
      </div>

      {hasTaxTipGroup && (
        <div className="flex flex-col gap-y-2">
          {showTax && taxLabel && (
            <div className="flex justify-between heading-6">
              <p>{taxLabel}</p>
              <p>{formatCurrency({ amount: taxAmount })}</p>
            </div>
          )}
          {showTip && (
            <div className="flex justify-between heading-6">
              <p>{tipLabel}</p>
              <p>{formatCurrency({ amount: tipAmount! })}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between pt-4 pb-2 heading-5 border-t-dashed-9 font-600">
        <p>{grandTotalLabel}</p>
        <p>{formatCurrency({ amount: grandTotalAmount })}</p>
      </div>

      {showSaved && (
        <div className="text-[var(--success)] font-700 px-3 py-3 w-full  bg-[var(--success-opacity)] rounded-xl flex items-center gap-2">
          <img
            fetchPriority="high"
            src={OFFER_DETAILS_ICON}
            alt="discount"
            title="discount"
            width={16}
            height={16}
          />
          {formatCurrency({ amount: totalDiscount })} {savedOnTheTotalLabel}
        </div>
      )}

      {showEarnedLoyalty && (
        <div className="mt-1 inline-flex w-full flex-wrap items-center gap-1.5 rounded-xl bg-[#F6ECFF] py-3 px-3 ">
          <img
            src={LOYALTY_BADGE_ICON}
            alt=""
            width={16}
            height={16}
            className="shrink-0"
            aria-hidden
          />
          <span className="small-font md-heading-5 font-600 text-[var(--loyalty-badge-bg)]">
            {earnedLoyaltyPoints.toLocaleString()} {pointsUnit}
          </span>
          <span className="small-font md-heading-5 self-end font-normal text-[var(--loyalty-badge-bg)]">
            {earnedWithThisOrderLabel}
          </span>
        </div>
      )}
    </div>
  );
};

export default OrderSummarySection;
