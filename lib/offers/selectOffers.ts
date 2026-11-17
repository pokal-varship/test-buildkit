import { DiscountOffer } from "@services/typesense/types";
import formatCurrency from "@lib/helper/price";
import { TranslationKeys } from "types";

/**
 * Shared offer selection helpers.
 * Keep these pure (no React) so they can be reused anywhere.
 */

type DiscountKind = 1 | 2; // 1 = %, 2 = flat (currency)

function expectedOrderContext(isQrFlowActive: boolean): "IN_STORE" | "REMOTE" {
  return isQrFlowActive ? "IN_STORE" : "REMOTE";
}

function hasPositiveMinSpend(o: DiscountOffer | null | undefined): boolean {
  const v = o?.discountConfig?.minimumSpendValue;
  return typeof v === "number" && v > 0;
}

function hasNonNegativeMinSpend(o: DiscountOffer | null | undefined): boolean {
  const v = o?.discountConfig?.minimumSpendValue;
  return typeof v === "number" && v >= 0;
}

/** Prefer discountType (menu offers); fall back to type (some MINIMUM_SPEND APIs). */
function discountKindFromConfig(dc: DiscountOffer["discountConfig"]): DiscountKind | null {
  if (dc.discountType === 1 || dc.discountType === 2) return dc.discountType;
  if (dc.type === 1 || dc.type === 2) return dc.type;
  return null;
}

function matchesFlow(o: DiscountOffer | null | undefined, ctx: string): boolean {
  return ((o?.orderContext ?? "") as string).toUpperCase() === ctx;
}

function isThresholdOffer(
  o: DiscountOffer | null | undefined,
  ctx: string,
  offerType: number,
  opts?: { allowZeroMinSpend?: boolean }
): o is DiscountOffer {
  const minSpendOk = opts?.allowZeroMinSpend ? hasNonNegativeMinSpend(o) : hasPositiveMinSpend(o);
  return !!o && o.offerType === offerType && matchesFlow(o, ctx) && minSpendOk;
}

function isEntireMenuExcludeOffer(o: DiscountOffer | null | undefined, ctx: string): o is DiscountOffer {
  if (!o || o.offerType !== 3) return false;
  if (!matchesFlow(o, ctx)) return false;

  const dc = o.discountConfig;

  // Accept excludeType 1 (with excludeData) or excludeType 2 (without excludeData).
  // Also support excludeType=2 where API includes isExcludeData=true + excludeData=[productIds].
  const isExcludeType1 = dc?.isExcludeData && dc.excludeType === 1 && !!dc.excludeData?.[0];
  const isExcludeType2 =
    (dc?.excludeType === 2 && !dc?.isExcludeData) ||
    (dc?.excludeType === 2 && !!dc?.isExcludeData && !!dc.excludeData?.length);

  if (!isExcludeType1 && !isExcludeType2) return false;
  if (!hasNonNegativeMinSpend(o)) return false;
  return typeof dc?.discountValue === "number";
}

export function findThresholdOfferByFlow(
  offers: DiscountOffer[] | null | undefined,
  isQrFlowActive: boolean,
  offerType: number
): DiscountOffer | null {
  const ctx = expectedOrderContext(isQrFlowActive);
  const allowZeroMinSpend = offerType === 5; // freebies only (both flows)

  return (
    offers?.find((o) =>
      isThresholdOffer(o, ctx, offerType, { allowZeroMinSpend })
    ) ?? null
  );
}

/**
 * ENTIRE_MENU (offerType 3) with excluded category list.
 */
export function findEntireMenuExcludeCategoryOfferByFlow(
  offers: DiscountOffer[] | null | undefined,
  isQrFlowActive: boolean
): DiscountOffer | null {
  const ctx = expectedOrderContext(isQrFlowActive);
  return offers?.find((o) => isEntireMenuExcludeOffer(o, ctx)) ?? null;
}

/** Banner line for ENTIRE_MENU exclude offer (matches ProductOffer type 3: discountType 1 = %, 2 = flat amount). */
export function formatEntireMenuExcludeBannerText(
  offer: DiscountOffer,
  lang: TranslationKeys
): string | null {
  if (offer.offerType !== 3) return null;
  const dc = offer.discountConfig;
  const b = lang.offerBanner;

  const min = dc?.minimumSpendValue;
  const discountValue = dc?.discountValue;
  const discountType = dc?.discountType; // 1 = %, 2 = flat (currency)
  if (typeof min !== "number" || min < 0) return null;
  if (typeof discountValue !== "number") return null;

  let discountPart: string | null = null;
  if (discountType === 1) {
    discountPart = b.discountPctPart.replace("{{value}}", String(discountValue)).replace("{{off}}", lang.off);
  }
  if (discountType === 2) {
    discountPart = b.discountFlatPart
      .replace("{{amount}}", formatCurrency({ amount: discountValue }).trim())
      .replace("{{off}}", lang.off);
  }
  if (!discountPart) return null;

  const fmtMin = formatCurrency({ amount: min }).trim();

  if (dc?.isExcludeData && dc.excludeType === 1) {
    if (!dc.excludeData?.[0]) return null;
    if (min === 0) return b.entireMenuEligibleNoMin.replace("{{discount}}", discountPart);
    return b.entireMenuEligibleWithMin.replace("{{discount}}", discountPart).replace("{{min}}", fmtMin);
  }

  if (
    dc?.excludeType === 2 &&
    ((!dc?.isExcludeData && dc.excludeType === 2) ||
      (!!dc?.isExcludeData && !!dc.excludeData?.length))
  ) {
    if (min === 0) return b.entireMenuAllNoMin.replace("{{discount}}", discountPart);
    return b.entireMenuAllWithMin.replace("{{discount}}", discountPart).replace("{{min}}", fmtMin);
  }

  return null;
}

/**
 * PDP/PLP shared: derive a short banner suffix for an offer.
 * Intended for "Offer name : <suffix>" usage.
 */
export function formatOfferBannerSuffixText(offer: DiscountOffer, lang: TranslationKeys): string | null {
  const dc = offer?.discountConfig;
  if (!dc) return null;
  const b = lang.offerBanner;

  if (offer.offerType === 5) {
    const min = dc.minimumSpendValue;
    if (typeof min !== "number") return b.getFreebies;
    if (min <= 0) return b.getFreebies;
    return b.getFreebiesAbove.replace("{{amount}}", formatCurrency({ amount: min }).trim());
  }

  if (offer.offerType === 4) {
    const min = dc.minimumSpendValue;
    const max = dc.maximumDiscount;
    if (typeof min !== "number" || min <= 0) return null;
    if (typeof max !== "number" || max <= 0) return null;
    const kind = discountKindFromConfig(dc);
    const minStr = formatCurrency({ amount: min }).trim();
    if (kind === 1) {
      return b.minSpendUptoPct.replace("{{min}}", minStr).replace("{{max}}", String(max));
    }
    const maxStr = formatCurrency({ amount: max }).trim();
    return b.minSpendUptoFlat.replace("{{min}}", minStr).replace("{{max}}", maxStr);
  }

  if (offer.offerType === 2) {
    const min = dc.minimumSpendValue;
    const value = dc.value;
    const type = dc.type; // 1 = %, 2 = flat
    if (typeof min !== "number" || min < 0) return null;
    if (typeof value !== "number" || value <= 0) return null;
    const minStr = formatCurrency({ amount: min }).trim();
    if (type === 1) {
      if (min === 0) return b.selectedPctOff.replace("{{value}}", String(value)).replace("{{off}}", lang.off);
      return b.selectedPctOffAbove
        .replace("{{value}}", String(value))
        .replace("{{off}}", lang.off)
        .replace("{{min}}", minStr);
    }
    if (type === 2) {
      const valueStr = formatCurrency({ amount: value }).trim();
      if (min === 0) return b.selectedFlatOff.replace("{{value}}", valueStr).replace("{{off}}", lang.off);
      return b.selectedFlatOffAbove
        .replace("{{value}}", valueStr)
        .replace("{{off}}", lang.off)
        .replace("{{min}}", minStr);
    }
    return null;
  }

  if (offer.offerType === 3) {
    return formatEntireMenuExcludeBannerText(offer, lang);
  }

  if (offer.offerType === 1) return lang.bogo;

  return null;
}

export function getOfferTheme(offer?: DiscountOffer | null): {
  bg: string;
  text: string;
} {
  const offerType = offer?.offerType;
  if (offerType === 2) return { bg: 'var(--offer-type-2-bg)', text: 'var(--offer-type-2-text)' };
  if (offerType === 3) return { bg: 'var(--offer-type-3-bg)', text: 'var(--offer-type-3-text)' };
  if (offerType === 4) return { bg: 'var(--offer-type-4-bg)', text: 'var(--offer-type-4-text)' };
  if (offerType === 5) return { bg: 'var(--offer-type-5-bg)', text: 'var(--offer-type-5-text)' };
  return { bg: 'var(--offer-default-bg)', text: 'var(--offer-default-text)' };
}

/**
 * Shared: pick offer by flow without falling back to `bestOffer`.
 * QR flow => `bestOfferInStore`
 * Normal flow => `bestOfferRemote`
 */
export function pickBestOfferByFlow<T extends {
  bestOfferRemote?: DiscountOffer;
  bestOfferInStore?: DiscountOffer;
}>(item: T | null | undefined, isQrFlowActive: boolean): DiscountOffer | undefined {
  if (!item) return undefined;
  return isQrFlowActive ? item.bestOfferInStore : item.bestOfferRemote;
}

/**
 * PLP/PDP banner helpers often need multiple offer picks at once.
 * This keeps selection consistent and avoids re-scanning the same list repeatedly.
 */
export function selectBannerOffersByFlow(
  offers: DiscountOffer[] | null | undefined,
  isQrFlowActive: boolean
): {
  freebiesOffer: DiscountOffer | null;
  minimumSpendOffer: DiscountOffer | null;
  entireMenuOffer: DiscountOffer | null;
} {
  const ctx = expectedOrderContext(isQrFlowActive);
  const allowZeroMinSpendForFreebies = true; // freebies can have minSpend=0 in both flows

  let freebiesOffer: DiscountOffer | null = null;
  let minimumSpendOffer: DiscountOffer | null = null;
  let entireMenuOffer: DiscountOffer | null = null;

  if (!offers?.length) {
    return { freebiesOffer, minimumSpendOffer, entireMenuOffer };
  }

  for (const o of offers) {
    if (!freebiesOffer && isThresholdOffer(o, ctx, 5, { allowZeroMinSpend: allowZeroMinSpendForFreebies })) freebiesOffer = o;
    if (!minimumSpendOffer && isThresholdOffer(o, ctx, 4)) minimumSpendOffer = o;
    if (!entireMenuOffer && isEntireMenuExcludeOffer(o, ctx)) entireMenuOffer = o;
    if (freebiesOffer && minimumSpendOffer && entireMenuOffer) break;
  }

  return { freebiesOffer, minimumSpendOffer, entireMenuOffer };
}

function isSelectedItemsThresholdOffer(
  o: DiscountOffer | null | undefined,
  ctx: string
): o is DiscountOffer {
  if (!o || o.offerType !== 2 || !matchesFlow(o, ctx)) return false;
  if (!hasPositiveMinSpend(o)) return false;
  const dc = o.discountConfig;
  const value = dc?.value;
  const type = dc?.type;
  return typeof value === "number" && value > 0 && (type === 1 || type === 2);
}

/**
 * Cart threshold banner: SELECTED_ITEMS (2), ENTIRE_MENU exclude (3), MINIMUM_SPEND (4)
 * with a positive minimum spend for the active order context.
 */
export function selectCartThresholdOffersByFlow(
  offers: DiscountOffer[] | null | undefined,
  isQrFlowActive: boolean
): DiscountOffer[] {
  const ctx = expectedOrderContext(isQrFlowActive);
  if (!offers?.length) return [];

  return offers.filter((o) => {
    if (o.status !== 1) return false;
    if (o.offerType === 4 && isThresholdOffer(o, ctx, 4)) return true;
    if (o.offerType === 3 && isEntireMenuExcludeOffer(o, ctx) && hasPositiveMinSpend(o))
      return true;
    if (isSelectedItemsThresholdOffer(o, ctx)) return true;
    return false;
  });
}
