"use client";

import InfoIcon from "@components/icons/InfoIcon";
import Icon from "@components/image/Icons";
import { CartItem, CartTotalSummary } from "@components/order/order.type";
import Tooltip from "@components/ui/Tooltip";
import TaxFeeBreakdownTooltip, {
  TAX_FEE_TOOLTIP_ARROW_CLASS,
  TAX_FEE_TOOLTIP_CONTENT_CLASS,
} from "@components/ui/TaxFeeBreakdownTooltip";
import {
  OFFER_DETAILS_ICON,
  ARROW_DOWN_HEADER_ICON,
  ARROW_UP_HEADER_ICON,
} from "@config/Header/image.config";
import useLang from "@hooks/useLang";
import formatCurrency from "@lib/helper/price";
import React, { useState } from "react";
import { LanguageCode, TranslationKeys } from "types";
import { useSelector } from "react-redux";
import {
  selectIsQrFlowActive,
  selectSessionTotal,
} from "@redux/slices/qrFlowSlice";
import type { SessionTotal } from "@services/sessionService";
import { useDraftTicketsItemCountSum } from "@hooks/useQrSessionDerivedState";
import type { WalletPreviewData } from "@components/payment/ChoosePaymentMethod";

/** Normalized checkout summary for display (QR = session API, Cart = cart API). */
export interface CheckoutSummaryView {
  toPayAmount: number;
  itemSubTotalAmount: number;
  itemCount: number;
  taxAmount: number;
  totalDiscountAmount: number;
  platformFeeAmount: number;
  deliveryFeeAmount: number;
  tipAmountDisplay: number;
  finalTotal: number;
  showTaxRow: boolean;
  showItemDiscountRow: boolean;
  showPlatformFeeRow: boolean;
  showDeliveryFeeRow: boolean;
  showTipRow: boolean;
  showExtraRows: boolean;
}

export interface GetCheckoutSummaryParams {
  isQrFlow: boolean;
  /** From qrFlowSlice: DRAFT ticket total (amounts). */
  sessionTotal: SessionTotal | null;
  /** From qrFlowSlice: DRAFT ticket item count. */
  draftTicketItemCount: number | undefined;
  OrderSummary?: CartTotalSummary;
  cartItems?: CartItem[];
  deliveryFee?: number;
  orderType?: string;
  promoCodeDiscount?: number;
  discountCode?: string;
}

/**
 * Single normalizer: maps QR flow (session API) or normal flow (cart API) into one display object.
 */
export function getCheckoutSummaryValues(
  params: GetCheckoutSummaryParams,
): CheckoutSummaryView {
  const {
    isQrFlow,
    sessionTotal,
    draftTicketItemCount,
    OrderSummary,
    cartItems,
    deliveryFee,
    orderType,
    promoCodeDiscount = 0,
    discountCode,
  } = params;

  const hasSessionData = sessionTotal != null;
  const useSession = isQrFlow && hasSessionData;

  const cartCount =
    cartItems?.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) ?? 0;
  const amounts = useSession
    ? (() => {
        const total = sessionTotal ?? undefined;
        return {
          toPayAmount: total?.finalAmount ?? 0,
          itemSubTotalAmount: total?.itemSubTotal ?? 0,
          itemCount: draftTicketItemCount ?? cartCount,
          taxAmount: total?.itemLevelTax ?? total?.totalTax ?? 0,
          totalDiscountAmount:
            total?.itemLevelDiscount ?? total?.totalDiscount ?? 0,
          platformFeeAmount: total?.platformFee ?? 0,
          deliveryFeeAmount: total?.deliveryFee ?? 0,
          tipAmountDisplay: total?.tipAmount ?? 0,
          finalTotal: total?.finalAmount ?? 0,
        };
      })()
    : (() => {
        const os = OrderSummary ?? undefined;
        const delivery = deliveryFee ?? 0;
        return {
          toPayAmount: os?.finalAmount ?? 0,
          itemSubTotalAmount: os?.itemSubTotal ?? 0,
          itemCount: cartCount,
          taxAmount: os?.totalTax ?? 0,
          totalDiscountAmount: os?.totalDiscount ?? 0,
          platformFeeAmount: os?.platformFee ?? 0,
          deliveryFeeAmount: delivery,
          tipAmountDisplay: os?.tipAmount ?? 0,
          finalTotal: (os?.finalAmount ?? 0) + delivery,
        };
      })();

  const showTaxRow = amounts.taxAmount > 0;
  const showItemDiscountRow =
    (amounts.totalDiscountAmount || 0) - promoCodeDiscount > 0;
  const showPlatformFeeRow = amounts.platformFeeAmount > 0;
  const showDeliveryFeeRow = useSession
    ? amounts.deliveryFeeAmount > 0
    : orderType === "delivery";
  const showTipRow = amounts.tipAmountDisplay > 0;
  const showExtraRows =
    showTaxRow ||
    showPlatformFeeRow ||
    showDeliveryFeeRow ||
    showItemDiscountRow ||
    !!discountCode ||
    showTipRow;

  return {
    ...amounts,
    showTaxRow,
    showItemDiscountRow,
    showPlatformFeeRow,
    showDeliveryFeeRow,
    showTipRow,
    showExtraRows,
  };
}

interface OrderItem {
  OrderSummary?: CartTotalSummary;
  cartItems?: CartItem[];
  discountCode?: string;
  deliveryFee?: number;
  orderType?: string;
  promoCodeDiscount?: number;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When true, use session summary from Redux (QR flow) for toPay, item total, tax */
  isQrFlow?: boolean;
  walletPreviewData?: WalletPreviewData | null;
}

/** One summary line: label + value (or "Free" when valueIsFree and value is 0). */
function SummaryRow({
  label,
  value,
  showFreeWhenZero,
}: {
  label: React.ReactNode;
  value: number;
  showFreeWhenZero?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="order-summary-item-title">{label}</span>
      <span className="order-summary-item-total-price">
        {showFreeWhenZero && value === 0
          ? "Free"
          : formatCurrency({ amount: value })}
      </span>
    </div>
  );
}

/** Tax row with tooltip. */
function TaxRow({
  amount,
  platformFeeAmount,
  lang,
}: {
  amount: number;
  platformFeeAmount: number;
  lang: TranslationKeys;
}) {
  return (
    <div className="flex justify-between">
      <span className="order-summary-item-title">
        <div className="flex items-center gap-2">
          {lang.taxAndOtherCharges}
          <Tooltip
            text={
              <TaxFeeBreakdownTooltip
                taxAmount={amount}
                platformFeeAmount={platformFeeAmount}
                platformFeeLabel={lang.platformFee}
                gstDescription={lang.taxBreakdownGstDescription}
                platformFeeDescription={lang.taxBreakdownPlatformFeeDescription}
              />
            }
            contentClassName={TAX_FEE_TOOLTIP_CONTENT_CLASS}
            arrowClassName={TAX_FEE_TOOLTIP_ARROW_CLASS}
          >
             <span
              className="inline-flex shrink-0 cursor-pointer"
              tabIndex={0}
              aria-label={lang.taxAndOtherCharges}
            >
              <InfoIcon width={16} height={16} className="shrink-0" />
            </span>
          </Tooltip>
        </div>
      </span>
      <span className="order-summary-item-total-price">
        {formatCurrency({ amount })}
      </span>
    </div>
  );
}

/** Item-level discount and coupon rows shown with item total. */
function SummaryDiscountRows({
  summary,
  promoCodeDiscount,
  discountCode,
  lang,
  couponPrefixMinus,
}: {
  summary: CheckoutSummaryView;
  promoCodeDiscount?: number;
  discountCode?: string;
  lang: TranslationKeys;
  couponPrefixMinus?: boolean;
}) {
  const itemDiscountAmount =
    (summary.totalDiscountAmount || 0) - (promoCodeDiscount || 0);
  return (
    <>
      {summary.showItemDiscountRow && (
        <div className="flex justify-between">
          <span className="order-summary-item-title">{lang.itemDiscounts}</span>
          <span className="order-summary-item-total-price">
            - {formatCurrency({ amount: itemDiscountAmount })}
          </span>
        </div>
      )}
      {discountCode && (
        <div className="flex justify-between">
          <span className="order-summary-item-title">
            {lang.couponApplied} [{discountCode}]
          </span>
          <span className="order-summary-item-total-price">
            {couponPrefixMinus ? "- " : ""}
            {formatCurrency({ amount: promoCodeDiscount ?? 0 })}
          </span>
        </div>
      )}
    </>
  );
}

function hasWalletRedemption(
  walletPreviewData?: WalletPreviewData | null,
): walletPreviewData is WalletPreviewData {
  if (!walletPreviewData) return false;
  return (
    walletPreviewData.cashWalletAmount > 0 ||
    (walletPreviewData.loyaltyRedemptionValue != null &&
      walletPreviewData.loyaltyRedemptionValue > 0)
  );
}

/** Wallet and loyalty section with Order Total header and Amount Due footer. */
function SummaryWalletSection({
  walletPreviewData,
  orderTotalAmount,
  amountDue,
  lang,
  isMobile,
}: {
  walletPreviewData: WalletPreviewData;
  orderTotalAmount: number;
  amountDue: number;
  lang: TranslationKeys;
  isMobile?: boolean;
}) {
  const boldTitleClass = isMobile
    ? "order-summary-item-title text-[var(--primary-text)] font-700"
    : "order-summary-item-title font-700";
  const boldPriceClass = isMobile
    ? "order-summary-item-total-price text-[var(--primary-text)] font-700"
    : "order-summary-item-total-price font-700";
  const pointsLabel =
    walletPreviewData.loyaltyPoints != null &&
    walletPreviewData.loyaltyPoints > 0
      ? `${lang.pointsDiscount} (${walletPreviewData.loyaltyPoints} ${lang.walletPage.pointsUnit})`
      : lang.pointsDiscount;

  return (
    <>
      <div
        className={`order-summary-total-price flex flex-col gap-4 ${isMobile ? "py-3" : "py-4 mt-4"}`}
      >
        <div className="flex justify-between">
          <span className={boldTitleClass}>{lang.orderTotal}</span>
          <span className={boldPriceClass}>
            {formatCurrency({ amount: orderTotalAmount })}
          </span>
        </div>
        {walletPreviewData.cashWalletAmount > 0 && (
          <div className="flex justify-between">
            <span className="order-summary-item-title">
              {lang.walletApplied}
            </span>
            <span className="order-summary-item-total-price">
              - {formatCurrency({ amount: walletPreviewData.cashWalletAmount })}
            </span>
          </div>
        )}
        {walletPreviewData.loyaltyRedemptionValue != null &&
          walletPreviewData.loyaltyRedemptionValue > 0 && (
            <div className="flex justify-between">
              <span className="order-summary-item-title">{pointsLabel}</span>
              <span className="order-summary-item-total-price">
                -{" "}
                {formatCurrency({
                  amount: walletPreviewData.loyaltyRedemptionValue,
                })}
              </span>
            </div>
          )}
      </div>
      <div
        className={`order-summary-total-price flex gap-4 justify-between ${isMobile ? "pt-3" : "pt-4"}`}
      >
        <span className={boldTitleClass}>{lang.amountDue}</span>
        <span className={boldPriceClass}>
          {formatCurrency({ amount: amountDue })}
        </span>
      </div>
    </>
  );
}

/** Extra rows block: tax, platform fee, tip. */
function SummaryExtraRows({
  summary,
  lang,
}: {
  summary: CheckoutSummaryView;
  lang: TranslationKeys;
}) {
  return (
    <div className="order-summary-total-price pt-4 flex flex-col gap-4">
      {summary.showTaxRow && (
        <TaxRow
          amount={summary.taxAmount}
          platformFeeAmount={summary.platformFeeAmount}
          lang={lang}
        />
      )}
      {summary.showPlatformFeeRow && (
        <SummaryRow
          label={lang.platformFee}
          value={summary.platformFeeAmount}
        />
      )}
      {summary.showTipRow && (
        <SummaryRow label={lang.tip} value={summary.tipAmountDisplay} />
      )}
    </div>
  );
}

const CheckOutOrderSummary: React.FC<OrderItem> = ({
  OrderSummary,
  cartItems,
  discountCode,
  deliveryFee,
  orderType,
  promoCodeDiscount,
  isOpen: controlledIsOpen,
  onOpenChange,
  isQrFlow: isQrFlowProp,
  walletPreviewData,
}) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const sessionTotal = useSelector(selectSessionTotal);
  const draftTicketItemCount = useDraftTicketsItemCountSum();
  const isQrFlow = isQrFlowProp ?? isQrFlowActive;
  const [internalIsOpen, setInternalIsOpen] = useState(isQrFlow);
  const isOpen =
    onOpenChange && controlledIsOpen !== undefined
      ? controlledIsOpen
      : isQrFlow
        ? true
        : internalIsOpen;
  const setIsOpen = onOpenChange
    ? (open: boolean) => onOpenChange(open)
    : setInternalIsOpen;

  const summary = getCheckoutSummaryValues({
    isQrFlow,
    sessionTotal,
    draftTicketItemCount,
    OrderSummary,
    cartItems,
    deliveryFee,
    orderType,
    promoCodeDiscount,
    discountCode,
  });

  const showWalletSection = hasWalletRedemption(walletPreviewData);
  const displayTotal = showWalletSection
    ? walletPreviewData.orderAmountAfterRedemption
    : summary.finalTotal;

  return (
    <>
      {/* Desktop */}
      <div className="order-summary-container-desktop">
        <h4 className="order-summary-title mb-3">{lang.orderSummary}</h4>
        <div className="flex flex-col gap-4 pb-4">
          <div className="flex justify-between">
            <span className="order-summary-item-title">
              {lang.itemTotal} ({summary.itemCount} {lang.items})
            </span>
            <span className="order-summary-item-total-price">
              {formatCurrency({ amount: summary.itemSubTotalAmount })}
            </span>
          </div>
          <SummaryDiscountRows
            summary={summary}
            promoCodeDiscount={promoCodeDiscount}
            discountCode={discountCode}
            lang={lang}
          />
          {summary.showDeliveryFeeRow && (
            <SummaryRow
              label={lang.deliveryFee}
              value={summary.deliveryFeeAmount}
              showFreeWhenZero
            />
          )}
        </div>

        <div className="text-sm text-gray-800">
          {summary.showTaxRow ||
          summary.showPlatformFeeRow ||
          summary.showTipRow ? (
            <SummaryExtraRows summary={summary} lang={lang} />
          ) : (
            ""
          )}

          {showWalletSection ? (
            <SummaryWalletSection
              walletPreviewData={walletPreviewData}
              orderTotalAmount={summary.finalTotal}
              amountDue={displayTotal}
              lang={lang}
            />
          ) : (
            <div className="order-summary-total-price pt-4 mt-4 flex gap-4 justify-between">
              <span className="order-summary-item-title font-700">
                {lang.total}
              </span>
              <span className="order-summary-item-total-price font-700">
                {formatCurrency({ amount: displayTotal })}
              </span>
            </div>
          )}
          {summary.totalDiscountAmount ? (
            <p className="discount-text-desktop mt-4">
              <span className="flex items-center gap-1">
                <img
                  fetchPriority="high"
                  src={OFFER_DETAILS_ICON}
                  alt="discount"
                  title="discount"
                  width={16}
                  height={16}
                />
                {formatCurrency({ amount: summary.totalDiscountAmount })} saved
                on the total!
              </span>
            </p>
          ) : null}
        </div>
      </div>

      {/* Mobile */}
      <div className="order-summary-container-mobile">
        {!isQrFlow ? (
          <div onClick={() => setIsOpen(!isOpen)}>
            <div className="flex justify-between items-center">
              <h4 className="order-pay-title">
                {lang.toPay} {formatCurrency({ amount: summary.toPayAmount })}
              </h4>
              <Icon
                icon={
                  isOpen
                    ? `${ARROW_UP_HEADER_ICON}#arrow-up`
                    : `${ARROW_DOWN_HEADER_ICON}#arrow-down`
                }
                width={13}
                height={9}
                color={"var(--primary-text)"}
                viewBox="0 0 12 7"
              />
            </div>
            {summary.totalDiscountAmount ? (
              <p className="discount-text">
                <span className="flex items-center gap-1">
                  <img
                    fetchPriority="high"
                    src={OFFER_DETAILS_ICON}
                    alt="discount"
                    title="discount"
                    width={16}
                    height={16}
                  />
                  {formatCurrency({ amount: summary.totalDiscountAmount })}{" "}
                  saved on the total!
                </span>
              </p>
            ) : null}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center pb-3">
              <h4 className="order-pay-title">Bill details</h4>
            </div>
          </div>
        )}
        {(isOpen || isQrFlow) && (
          <div className="space-y-4 text-sm text-gray-800">
            <div
              className={`${
                summary.totalDiscountAmount
                  ? "flex justify-between"
                  : "flex justify-between mt-2"
              }`}
            >
              <span className="order-summary-item-title">
                {lang.itemTotal} ({summary.itemCount} {lang.items})
              </span>
              <span className="order-summary-item-total-price">
                {formatCurrency({ amount: summary.itemSubTotalAmount })}
              </span>
            </div>
            <SummaryDiscountRows
              summary={summary}
              promoCodeDiscount={promoCodeDiscount}
              discountCode={discountCode}
              lang={lang}
              couponPrefixMinus
            />
            {summary.showTaxRow ||
            summary.showPlatformFeeRow ||
            summary.showTipRow ? (
              <SummaryExtraRows summary={summary} lang={lang} />
            ) : null}
            {showWalletSection ? (
              <div className="text-sm text-gray-800">
                <SummaryWalletSection
                  walletPreviewData={walletPreviewData}
                  orderTotalAmount={summary.finalTotal}
                  amountDue={displayTotal}
                  lang={lang}
                  isMobile
                />
              </div>
            ) : (
              <div className="order-summary-total-price pt-3 flex flex-row gap-4 justify-between text-sm text-gray-800">
                <span className="order-summary-item-title text-[var(--primary-text)] font-700">
                  {lang.grandTotal}
                </span>
                <span className="order-summary-item-total-price text-[var(--primary-text)] font-700">
                  {formatCurrency({ amount: displayTotal })}
                </span>
              </div>
            )}
            {summary.totalDiscountAmount ? (
              <p className="text-[var(--success)] bg-[var(--success-opacity)] p-2 rounded-lg">
                <span className="flex items-center gap-1">
                  <img
                    fetchPriority="high"
                    src={OFFER_DETAILS_ICON}
                    alt="discount"
                    title="discount"
                    width={16}
                    height={16}
                  />
                  {formatCurrency({ amount: summary.totalDiscountAmount })}{" "}
                  saved on the total!
                </span>
              </p>
            ) : null}
          </div>
        )}
      </div>

      <style>{`
            .order-summary-container-desktop {
                background-color: var(--cards-containers);
                width: 100%;
                padding: 20px;
                border: 1px solid var(--borders-dividers);
                border-radius: 10px;
                margin-bottom: 100px;
                display: block;
            }
            .order-summary-title {
                font-size: var(--heading-h4);
                color: var(--primary-text);
                font-weight: var(--font-bold);
            }
            .order-summary-item-title {
                font-size: var(--heading-h5);
                color: var(--primary-text);
            }
            .order-summary-item-total-price {
                font-size: var(--heading-h5);
                color: var(--primary-text);
            }
            .order-summary-container-mobile {
                display: none;
            }

            .discount-text-desktop {
                background-color: #66BB6A26;
                padding: 10px;
                border-radius: 8px;
                color: var(--success);
                font-size: var(--description-font);
                border:1px dashed var(--success);
            }
            .order-summary-total-price{
                border-top: 1px dashed var(--rating-border-primary);
            }

            @media (max-width: 768px) {
                .order-summary-item-title {
                    font-size: var(--description-font);
                }
                .order-summary-item-total-price {
                    font-size: var(--description-font);
                }
                .order-summary-container-desktop {
                    display: none;
                }
                .order-summary-container-mobile {
                    display: block;
                    background-color: ${isQrFlow ? "var(--cards-containers)" : "var(--primary-background)"};
                    padding: 20px;
                    border-radius: 0px;
                }
                .discount-text {
                    font-size: var(--small-font);
                    color: var(--success);
                    margin-bottom: ${isOpen ? "10px" : "0"};
                }
                .order-pay-title {
                    font-size: var(--description-font);
                    color: var(--primary-text);
                    font-weight: var(--font-bold);
                }
            }
            .font-700 {
                font-weight: var(--font-bold);
            }
      `}</style>
    </>
  );
};

export default CheckOutOrderSummary;
