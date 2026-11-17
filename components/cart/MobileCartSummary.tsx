"use client";

import Icon from "@components/image/Icons";
import { ARROW_RIGHT } from "@config/Header/image.config";
import useLang from "@hooks/useLang";
import { useProductUrl } from "@hooks/useProductUrl";
import formatCurrency from "@lib/helper/price";
import { open_dialog } from "@lib/modalHandler";
import { selectCart } from "@redux/slices/cartSlice";
import {
  selectIsQrFlowActive,
  selectSessionTablePin,
} from "@redux/slices/qrFlowSlice";
import { useKitchenTicketSummary } from "@hooks/useQrSessionDerivedState";
import { getQrKitchenSummaryCopy } from "@components/cart/qrKitchenSummaryCopy";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React from "react";
import { useSelector } from "react-redux";

/** Height of QR flow bottom nav - summary bar sits above it */
const QR_BOTTOM_NAV_HEIGHT = "70px";

interface MobileCartSummaryProps {
  className?: string;
  /** When true, render in document flow above order footer (e.g. QR Flow cart page) */
  inline?: boolean;
  /** When true with inline, show cart summary (item count, total, savings) like PLP */
  showCartSummaryContent?: boolean;
  /** When inline on cart page, optional handler for "View bill details" instead of "Go to Cart" */
  onViewBillDetails?: () => void;
  /** When set, inline summary uses position:fixed and sits above footer (e.g. QR flow: 76 + footer height) */
  fixedBottomOffset?: number;
  /** Override bottom offset for the fixed QR summary bar (e.g. '10rem' on order page). Defaults to 5rem. */
  qrSummaryBottomOffset?: string;
}

const MobileCartSummary: React.FC<MobileCartSummaryProps> = ({
  className = "",
  qrSummaryBottomOffset,
}) => {
  const { cartData } = useSelector(selectCart);
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const kitchenSummary = useKitchenTicketSummary();
  const totalItems = kitchenSummary.totalItems;
  // Table PIN section - commented out for now; uncomment when re-enabling
  const sessionTablePin = useSelector(selectSessionTablePin);
  const showTablePinSection = Boolean(sessionTablePin);
  const { getCartUrl, getQrCheckoutUrl } = useProductUrl();
  const [lang] = useLang();
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);

  // QR flow: show session-based summary (items being cooked, table PIN) above bottom nav only when more than 1 item
  if (isQrFlowActive) {
    if (totalItems < 1) return null;

    const ordersUrl = getQrCheckoutUrl();

    const handleViewActiveOrder = (e: React.MouseEvent) => {
      if (!isLoggedIn) {
        e.preventDefault();
        open_dialog("login", {
          open: true,
          propsData: {
            onSuccess: () => router.push(ordersUrl),
          },
          type: "login",
          handlerDialog: () => {},
          handleClose: () => {},
          anchor: "bottom",
          onlyDialog: false,
          sxStyle: {
            zIndex: 2400,
            "& .MuiDialogContent-root": {
              padding: "20px 16px",
              backgroundColor: "var(--tertiary-background)",
            },
          },
        });
      }
    };

    return (
      <div
        className={`mobile-cart-summary mobile-cart-summary-qr bottom-5 ${className} px-4`}
        data-qr-flow="true"
      >
        {showTablePinSection && sessionTablePin && (
          <div className="flex items-center justify-between pb-2">
            <div className="mobile-cart-summary-qr-pin">
              <span className="mobile-cart-summary-qr-pin-label">
                {`${lang.order?.tablePin}:`}&nbsp;
              </span>
              <span className="mobile-cart-summary-qr-pin-value">
                {sessionTablePin}
              </span>
            </div>

            <div className="mobile-cart-summary-qr-right">
              <Link
                href={ordersUrl}
                className="extra-small-font underline text-[var(--accent-color)]"
                prefetch={true}
                onClick={handleViewActiveOrder}
              >
                {lang.order?.viewActiveOrder ?? "View active order"}
              </Link>
            </div>
          </div>
        )}

        <div className="mobile-cart-summary-qr-content">
          <div className="mobile-cart-summary-qr-left">
            <span className="" aria-hidden>
              <img
                src="/images/icon/chef-icon.svg"
                alt=""
                width={25}
                height={40}
                className="object-contain"
              />
            </span>
            <div className="mobile-cart-summary-qr-text">
              {(() => {
                const copy = getQrKitchenSummaryCopy(lang, kitchenSummary);
                return (
                  <>
                    <span className="mobile-cart-summary-qr-count">
                      {copy.title}
                    </span>
                    {copy.subtitle && (
                      <span className="mobile-cart-summary-qr-subtext">
                        {copy.subtitle}
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
          <>
            {!sessionTablePin && (
              <Link
                href={ordersUrl}
                className="bg-[var(--black)] flex items-center justify-center rounded-full p-1"
                prefetch={true}
                aria-label={lang.order?.viewActiveOrder ?? "View active order"}
                onClick={handleViewActiveOrder}
              >
                <Icon
                  icon={`${ARROW_RIGHT}#arrow-right`}
                  width={25}
                  height={25}
                  unit="px"
                  color={"var(--primary-color)"}
                  viewBox="0 0 15 15"
                />
              </Link>
            )}
          </>
        </div>
        <style>{`
          .mobile-cart-summary-qr {
            display: block;
            position: fixed;
            left: 0;
            right: 0;
            bottom: ${qrSummaryBottomOffset ?? QR_BOTTOM_NAV_HEIGHT};
            z-index: 999;
            padding: 12px 16px;
            background: linear-gradient(180deg, #FFE8AB 0%, #FFF7EA 100%);
            box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.12);
            border-radius: 1rem 1rem 0 0;
          }
          .mobile-cart-summary-qr-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }
          .mobile-cart-summary-qr-left {
            display: flex;
            align-items: center;
            gap: 10px;
            flex: 1;
            min-width: 0;
          }
          .mobile-cart-summary-qr-text {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .mobile-cart-summary-qr-count {
            font-size: var(--heading-h6);
            font-weight: 700;
            color: var(--primary-text);
          }
          .mobile-cart-summary-qr-subtext {
            font-size: var(--extraSmall-font);
            font-weight: var(--font-regular);
            color: var(--secondary-text);
            line-height: 1.1;
          }
          .mobile-cart-summary-qr-link {
            font-size: var(--extraSmall-font);
            color: var(--primary-text);
            text-decoration: underline;
          }
          .mobile-cart-summary-qr-right {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
          }
          .mobile-cart-summary-qr-pin {
            display: flex;
            // flex-direction: column;
            align-items: center;
            justify-content: left;
            padding: 4px;
            background: #4285F4;
            border-radius: 4px;
            color: var(--white);
            width: fit-content;
          }
          .mobile-cart-summary-qr-pin-value {
            font-size: var(--extraSmall-font);
            font-weight: 800;
            line-height: 1.2;
            letter-spacing: 2px;
          }
          .mobile-cart-summary-qr-pin-label {
            font-size: var(--extraSmall-font);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.02em;
          }
          .mobile-cart-summary-qr-arrow {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            background: var(--primary-text);
            color: var(--black);
            border-radius: 8px;
            font-size: 20px;
            text-decoration: none;
          }
          :global(body.filter-drawer-open) :global(.mobile-cart-summary-qr) {
            opacity: 0 !important;
            pointer-events: none !important;
            z-index: -1 !important;
          }

          @media (min-width: 768px) {
            .mobile-cart-summary-qr {
              display: none;
            }
          }
        `}</style>
      </div>
    );
  }

  // Non-QR: require cart items and show standard summary at bottom: 0
  if (!cartData?.data?.items || cartData?.data?.items?.length === 0) {
    return null;
  }

  const items = cartData.data.items;
  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const finalAmount = cartData.data.total?.finalAmount || 0;

  const totalDiscount =
    items.reduce((sum, item) => {
      const itemDiscount =
        item.totalDiscountAmount ||
        (item.subTotalBeforeDiscountAndTaxes || 0) - (item.finalPrice || 0);
      return sum + (itemDiscount || 0);
    }, 0) + (cartData.data.appliedPromoCode?.promoCodeDiscountAmount || 0);

  const cartUrl = getCartUrl();

  return (
    <div className={`mobile-cart-summary ${className} px-4`}>
      <div className="mobile-cart-summary-content flex justify-between items-center">
        <div className="mobile-cart-summary-info">
          <div className="mobile-cart-summary-main font-bold text-base">
            {itemCount} {lang.items} | {formatCurrency({ amount: finalAmount })}
          </div>
          {totalDiscount > 0 && (
            <div className="mobile-cart-summary-main font-regular text-sm capitalize">
              {lang.youSaved} {formatCurrency({ amount: totalDiscount })}
            </div>
          )}
        </div>
        <Link
          href={cartUrl}
          className="mobile-cart-summary-button flex items-center justify-center font-bold text-base"
          prefetch={true}
        >
          {lang.goToCart}
        </Link>
      </div>
      <style>{`
          .mobile-cart-summary {
            display: block;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            background-color:var(--cards-containers);
            z-index: 1000;
            box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);
            padding-block: 10px;
          }
          
          body.filter-drawer-open .mobile-cart-summary {
            opacity: 0 !important;
            pointer-events: none !important;
            z-index: -1 !important;
          }

          .mobile-cart-summary-content {
            gap: 12px;
            max-width: 100%;
            background-color: var(--primary-color);
            padding: 10px 12px;
            border-radius: 10px;
          }

          .mobile-cart-summary-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex: 1;
            min-width: 0;
            color:var(--black);
          }

          .mobile-cart-summary-main {
            color:var(--black);
          }

          .mobile-cart-summary-button {
            padding: 8px 16px;
            border-radius: 7px;
            text-decoration: none;
            white-space: nowrap;
            transition: all 0.2s ease-in-out;
            min-width: fit-content;
            background-color:var(--black);
            color:var(--button-secondary-border-color);
          }

          .mobile-cart-summary-button:hover,
          .mobile-cart-summary-button:focus {
            transform: scale(1.02);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          }

          .mobile-cart-summary-button:active {
            transform: scale(0.98);
          }

          @media (min-width: 768px) {
            .mobile-cart-summary:not([data-qr-flow]) {
              display: none;
            }
          }
      `}</style>
    </div>
  );
};

export default MobileCartSummary;
