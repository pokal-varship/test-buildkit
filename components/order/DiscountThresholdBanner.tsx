"use client";
import React, { useMemo } from "react";
import formatCurrency from "@lib/helper/price";
import { LanguageCode, TranslationKeys } from "types";
import useLang from "@hooks/useLang";
import {
  DISCOUNT_ICON,
  DISCOUNT_ICON_WHITE,
} from "@config/Header/image.config";

export interface MinimumSpendOffer {
  offerId: string;
  offerName: {
    [lang: string]: string;
  };
  offerType: number;
  offerTypeString: string;
  discountConfig: {
    maximumDiscount: number;
    minimumSpendValue: number;
    type: number;
    /** SELECTED_ITEMS (offerType 2) */
    value?: number;
    /** ENTIRE_MENU (offerType 3) */
    discountType?: number;
    discountValue?: number;
  };
  status: number;
  isActive: boolean;
}

const THRESHOLD_OFFER_TYPES = [2, 3, 4] as const;

export function getDiscountThresholdBannerData(
  cartTotal: number,
  minimumSpendOffers: MinimumSpendOffer[] | undefined,
  lang: TranslationKeys
): { amountNeeded: number; discountBadgeText: string } | null {
  if (!minimumSpendOffers || minimumSpendOffers.length === 0) {
    return null;
  }

  const eligibleOffers = minimumSpendOffers.filter(
    (offer) =>
      offer.isActive &&
      offer.status === 1 &&
      THRESHOLD_OFFER_TYPES.includes(
        offer.offerType as (typeof THRESHOLD_OFFER_TYPES)[number]
      ) &&
      offer.discountConfig.minimumSpendValue > 0 &&
      cartTotal < offer.discountConfig.minimumSpendValue
  );

  if (eligibleOffers.length === 0) {
    return null;
  }

  const eligibleOffer = eligibleOffers.reduce((closest, offer) => {
    const closestGap = closest.discountConfig.minimumSpendValue - cartTotal;
    const offerGap = offer.discountConfig.minimumSpendValue - cartTotal;
    return offerGap < closestGap ? offer : closest;
  });

  const amountNeeded =
    eligibleOffer.discountConfig.minimumSpendValue - cartTotal;

  if (amountNeeded <= 0) {
    return null;
  }

  const discountBadgeText = getThresholdDiscountBadge(eligibleOffer, lang);
  if (!discountBadgeText) {
    return null;
  }

  return {
    amountNeeded,
    discountBadgeText,
  };
}

export function getDiscountThresholdMetBannerData(
  cartTotal: number,
  minimumSpendOffers: MinimumSpendOffer[] | undefined,
  appliedOffers: { discountAmount: number }[] | undefined,
  lang: TranslationKeys
): { savingAmount: number; discountBadgeText: string } | null {
  if (!minimumSpendOffers || minimumSpendOffers.length === 0) {
    return null;
  }

  const metOffers = minimumSpendOffers.filter(
    (offer) =>
      offer.isActive &&
      offer.status === 1 &&
      THRESHOLD_OFFER_TYPES.includes(
        offer.offerType as (typeof THRESHOLD_OFFER_TYPES)[number]
      ) &&
      offer.discountConfig.minimumSpendValue > 0 &&
      cartTotal >= offer.discountConfig.minimumSpendValue
  );

  if (metOffers.length === 0) {
    return null;
  }

  const metOffer = metOffers.reduce((closest, offer) => {
    const closestGap = closest.discountConfig.minimumSpendValue - cartTotal;
    const offerGap = offer.discountConfig.minimumSpendValue - cartTotal;
    return offerGap > closestGap ? offer : closest;
  });

  const savingAmount =
    appliedOffers?.reduce((sum, o) => sum + (o.discountAmount || 0), 0) ?? 0;

  const discountBadgeText = getThresholdDiscountBadge(metOffer, lang);
  if (!discountBadgeText) {
    return null;
  }

  return {
    savingAmount,
    discountBadgeText,
  };
}

function getThresholdDiscountBadge(
  offer: MinimumSpendOffer,
  lang: TranslationKeys
): string | null {
  const dc = offer.discountConfig;
  if (offer.offerType === 4) {
    const max = dc.maximumDiscount;
    if (typeof max !== "number" || max <= 0) return null;
    if (dc.type === 1) return `${max}% ${lang.off}`;
    if (dc.type === 2) {
      return `${formatCurrency({ amount: max }).trim()} ${lang.off}`;
    }
    return null;
  }
  if (offer.offerType === 2) {
    const value = dc.value;
    if (typeof value !== "number" || value <= 0) return null;
    if (dc.type === 1) return `${value}% ${lang.off}`;
    if (dc.type === 2) {
      return `${formatCurrency({ amount: value }).trim()} ${lang.off}`;
    }
    return null;
  }
  if (offer.offerType === 3) {
    const value = dc.discountValue;
    if (typeof value !== "number" || value <= 0) return null;
    if (dc.discountType === 1) return `${value}% ${lang.off}`;
    if (dc.discountType === 2) {
      return `${formatCurrency({ amount: value }).trim()} ${lang.off}`;
    }
    return null;
  }
  return null;
}

interface DiscountThresholdBannerProps {
  cartTotal: number;
  minimumSpendOffers: MinimumSpendOffer[] | undefined;
  appliedOffers?: { discountAmount: number }[];
}

const DiscountThresholdBanner: React.FC<DiscountThresholdBannerProps> = ({
  cartTotal,
  minimumSpendOffers,
  appliedOffers,
}) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();

  const bannerData = useMemo(
    () => getDiscountThresholdBannerData(cartTotal, minimumSpendOffers, lang),
    [cartTotal, minimumSpendOffers, lang]
  );

  const metBannerData = useMemo(
    () =>
      getDiscountThresholdMetBannerData(
        cartTotal,
        minimumSpendOffers,
        appliedOffers,
        lang
      ),
    [cartTotal, minimumSpendOffers, appliedOffers, lang]
  );

  if (!bannerData && !metBannerData) return null;

  const isMet = !!metBannerData;

  return (
    <div className="discount-threshold-banner">
      <div className="discount-banner-content">
        <div className="discount-banner-left">
          <div className="discount-check-icon">
            <img
              src={DISCOUNT_ICON}
              width={25}
              height={25}
              alt="discount-icon"
              className="discount-icon"
            />
          </div>
          <div className="discount-banner-text">
            {isMet ? (
              <>
                <span className="discount-text-saving">
                  You&apos;re saving{" "}
                  {formatCurrency({ amount: metBannerData.savingAmount })}
                </span>
              </>
            ) : (
              <>
                <span className="discount-text-add">{lang.add}</span>
                <span className="discount-text-amount">
                  {formatCurrency({ amount: bannerData!.amountNeeded })}
                </span>
                <span className="discount-text-to">{lang.toUnlock}</span>
              </>
            )}
          </div>
        </div>
        <div className="discount-banner-badge">
          <img
            src={DISCOUNT_ICON_WHITE}
            width={14}
            height={14}
            alt="discount-icon"
            className="discount-icon"
          />
          <span className="discount-badge-text">
            {isMet
              ? metBannerData.discountBadgeText
              : bannerData!.discountBadgeText}
          </span>
        </div>
      </div>
      <div className="discount-banner-wave"></div>
      <style>{`
        .discount-threshold-banner {
          background: transparent;
          padding: 0 20px 10px;
          width: 100%;
          z-index: 1;
        }
        .discount-banner-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          max-width: 100%;
          margin: 0 auto;
          flex-wrap: nowrap;
        }
        .discount-banner-left {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 0 1 auto;
        }
        .discount-check-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 16px;
          height: 16px;
        }
        .discount-banner-text {
          display: flex;
          align-items: center;
          gap: 0;
          flex-wrap: nowrap;
          font-size: var(--small-font);
        }
        .discount-text-add,
        .discount-text-to {
          font-size: var(--small-font);
          font-weight: var(--font-bold);
          color: var(--primary-text);
          padding: 0 5px;
        }
        .discount-text-amount {
          font-size: var(--small-font);
          font-weight: var(--font-bold);
          color: var(--accent-color);
        }
        .discount-text-saving {
          font-size: var(--small-font);
          font-weight: var(--font-bold);
          color: var(--primary-text);
        }
        .discount-banner-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background-color: var(--success);
          color: var(--white);
          padding: 2px 8px;
          border-radius: 15px;
          flex-shrink: 0;
        }
        .discount-badge-text {
          font-size: var(--small-font);
          font-weight: var(--font-bold);
          color: var(--white);
          white-space: nowrap;
          line-height: 1.4;
        }
        .discount-banner-wave {
          display: none;
        }
        @media (max-width: 768px) {
          .discount-threshold-banner {
            padding: 0px 16px 10px;
          }
          .discount-banner-badge {
            padding: 2px 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default DiscountThresholdBanner;
