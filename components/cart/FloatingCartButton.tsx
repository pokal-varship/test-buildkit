"use client";

import Icon from "@components/image/Icons";
import { ARROW_RIGHT_ICON } from "@config/Header/image.config";
import { useProductUrl } from "@hooks/useProductUrl";
import useLang from "@hooks/useLang";
import { selectCart } from "@redux/slices/cartSlice";
import {
  selectIsQrFlowActive,
  selectSessionTablePin,
} from "@redux/slices/qrFlowSlice";
import {
  useDraftTicketItemCount,
  useDraftTicketsItemCountSum,
  useKitchenTicketSummary,
  useQrCheckoutHasSubmittedOrderContent,
  useSessionTicketItems,
} from "@hooks/useQrSessionDerivedState";
import { getTenantConfig } from "@config/tenant.config";
import { generateImageBase64FromUrl } from "@lib/helper/ImageGen/imageGen";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { LanguageCode, TranslationKeys } from "types";

interface FloatingCartButtonProps {
  className?: string;
  isPdpPage?: boolean;
  isQrFlowPlpPage?: boolean;
  isQrCheckoutPage?: boolean;
  isComboGroupPlpPage?: boolean;
}

const MAX_THUMB_IMAGES = 2;
/** Display ~44px; 2× for sharpness (same pipeline as ProductCardGrid / mobilesearch). */
const THUMB_WIDTH = 88;
const THUMB_HEIGHT = 88;

/**
 * Returns up to `slots` mediaURLs (repeats by quantity).
 * If a line item's `mediaURL` is missing, we skip it and use the next available image.
 * If we still don't have enough, we fill the remaining slots with empty strings (placeholder will render).
 */
function getCartThumbnailMediaUrls(
  items: Array<{ quantity?: number; mediaURL?: string | null }>,
  slots: number,
): string[] {
  const out: string[] = [];
  for (const it of items) {
    const url = typeof it?.mediaURL === "string" ? it.mediaURL.trim() : "";
    if (!url) continue;
    const qty = Math.max(1, Number(it?.quantity) || 1);
    for (let i = 0; i < qty && out.length < slots; i++) out.push(url);
    if (out.length >= slots) break;
  }
  while (out.length < slots) out.push("");
  return out;
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({
  className = "",
  isPdpPage = false,
  isQrFlowPlpPage = false,
  isQrCheckoutPage = false,
  isComboGroupPlpPage = false,
}) => {
  const { cartData } = useSelector(selectCart);
  const { getCartUrl } = useProductUrl();
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const draftTicketsItemCountSum = useDraftTicketsItemCountSum();
  const draftTicketItemCount = useDraftTicketItemCount();
  /** Same as MobileCartSummary QR branch: bar shows when this is ≥ 1 */
  const kitchenTicketSummary = useKitchenTicketSummary();
  const sessionTablePin = useSelector(selectSessionTablePin);
  const qrCheckoutHasSubmittedOrder = useQrCheckoutHasSubmittedOrderContent();
  const sessionTicketItems = useSessionTicketItems();

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const tenantConfig = getTenantConfig();
  const placeholderThumbSrc =
    generateImageBase64FromUrl({
      url: tenantConfig.productPlaceholderImageUrl || "",
      width: THUMB_WIDTH,
      height: THUMB_HEIGHT,
    })?.fullEncodedUrl || "";

  const getThumbSrc = (rawUrl: string) =>
    generateImageBase64FromUrl({
      url: rawUrl?.trim?.()
        ? rawUrl.trim()
        : tenantConfig.productPlaceholderImageUrl || "",
      width: THUMB_WIDTH,
      height: THUMB_HEIGHT,
    })?.fullEncodedUrl || placeholderThumbSrc;

  // Avoid SSR vs client Redux mismatch (cart / QR session) which can trigger DOM errors on hydrate.
  if (!hasMounted) {
    return null;
  }

  // Same split as MobileCartSummary / getCheckoutSummaryValues: QR uses session DRAFT ticket counts; normal uses cart API.
  let cartUrl: string;
  let itemCount: number;
  let productImages: string[];

  if (isQrFlowActive) {
    const qrItemCount =
      draftTicketsItemCountSum > 0
        ? draftTicketsItemCountSum
        : draftTicketItemCount;
    if (qrItemCount === 0) {
      return null;
    }
    cartUrl = getCartUrl();
    itemCount = qrItemCount;
    // QR flow: session ticket items mediaURL
    const slots = Math.min(itemCount, MAX_THUMB_IMAGES);
    productImages = getCartThumbnailMediaUrls(sessionTicketItems, slots);
  } else {
    const items = cartData?.data?.items;
    if (!items?.length) {
      return null;
    }
    itemCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    cartUrl = getCartUrl();
    // Normal flow: cart items mediaURL
    const slots = Math.min(itemCount, MAX_THUMB_IMAGES);
    productImages = getCartThumbnailMediaUrls(items, slots);
  }

  // QR PLP: extra offset when MobileCartSummary shows (dineInSessionProductCount ≥ 1).
  // qr-checkout: match QrCheckoutOrderView `hasTickets` — 156px when kitchen/tip/pay UI is shown, else 86px.
  let bottomOffset = "20px";
  if (isComboGroupPlpPage) {
    bottomOffset = "20px";
  } else if (isPdpPage) {
    bottomOffset = "86px";
  } else if (isQrCheckoutPage) {
    bottomOffset = qrCheckoutHasSubmittedOrder ? "156px" : "86px";
  } else if (isQrFlowPlpPage) {
    if (kitchenTicketSummary.totalItems >= 1) {
      bottomOffset = sessionTablePin ? "177px" : "150px";
    } else {
      bottomOffset = "86px";
    }
  }

  return (
    <div className={`floating-cart-button-container ${className} px-4`}>
      <Link href={cartUrl} className="floating-cart-button" prefetch={true}>
        <div className="cart-images">
          {productImages.map((image, index) => (
            <img
              key={`cart-thumb-${index}`}
              src={getThumbSrc(image)}
              alt={`Product ${index + 1}`}
              className="cart-product-image"
              style={{
                zIndex: index + 1,
                marginLeft: index > 0 ? "-20px" : "0",
              }}
            />
          ))}
        </div>
        <div className="cart-info">
          <div className="cart-text">{lang.viewCart}</div>
          <div className="cart-count">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </div>
        </div>
        <div className="cart-arrow">
          <Icon
            icon={`${ARROW_RIGHT_ICON}#arrow-right`}
            width={20}
            height={20}
            unit="px"
            color="var(--white)"
            viewBox="0 3 18 18"
          />
        </div>
      </Link>
      <style>{`
          .floating-cart-button-container {
            display: flex;
            justify-content: center;
            position: fixed;
            bottom: ${bottomOffset};
            left: 16px;
            right: 16px;
            z-index: 30;
            /* Full-width flex row would otherwise steal taps from fixed UI (e.g. menu) on the sides */
            pointer-events: none;
          }

          body.filter-drawer-open .floating-cart-button-container {
            opacity: 0 !important;
            pointer-events: none !important;
            z-index: -1 !important;
          }

          body.filter-drawer-open .floating-cart-button-container .floating-cart-button {
            pointer-events: none !important;
          }

          .floating-cart-button {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: var(--accent-color);
            padding: 5px;
            border-radius: 200px;
            text-decoration: none;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            transition: all 0.2s ease-in-out;
            min-height: 50px;
            width: fit-content;
            pointer-events: auto;
          }

          .floating-cart-button:hover,
          .floating-cart-button:focus {
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
          }

          .floating-cart-button:active {
            transform: translateY(0);
          }

          .cart-images {
            display: flex;
            align-items: center;
            flex-shrink: 0;
          }

          .cart-product-image {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid var(--accent-color);
            position: relative;
          }

          .cart-info {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            flex: 1;
            text-align: center;
            margin: 0 6px;
          }

          .cart-text {
            font-size: var(--extraSmall-font);
            font-weight: 400;
            color: var(--white);
            line-height: 1.2;
          }

          .cart-count {
            font-size: var(--extraSmall-font);
            color: var(--white);
            margin-top: 2px;
          }

          .cart-arrow {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            background-color: var(--warning-light);
            border-radius: 50%;
            flex-shrink: 0;
          }

          @media (min-width: 768px) {
            .floating-cart-button-container {
              display: none;
            }
          }
      `}</style>
    </div>
  );
};

export default FloatingCartButton;
