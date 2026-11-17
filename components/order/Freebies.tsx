"use client";
import {
  FREEBIES_CELEBRATION_ICON,
  OFFER_DISCOUNT_ICON,
  OFFER_LOCK_ICON,
} from "@config/Header/image.config";
import useLang from "@hooks/useLang";
import React, { useEffect } from "react";
import { LanguageCode, TranslationKeys } from "types";
import { Offer } from "./order.type";
import formatCurrency from "@lib/helper/price";
import Icon from "@components/image/Icons";
import Tooltip from "@components/ui/Tooltip";

interface FreebiesProps {
  amountSpent: number;
  offers: Offer[];
  handleCurrentFreebies: (currentFreebies: Offer | null) => void;
}

const getNextTier = (amountSpent: number, offers: Offer[]) => {
  return offers.find(
    (offer) => amountSpent < offer.discountConfig.minimumSpendValue
  );
};

const getCurrentTierIndex = (amountSpent: number, offers: Offer[]) => {
  let idx = -1;
  for (let i = 0; i < offers.length; i++) {
    if (amountSpent >= offers[i].discountConfig.minimumSpendValue) idx = i;
  }
  return idx;
};

const getProgressPercentage = (amountSpent: number, offers: Offer[]) => {
  if (offers.length === 0) return 0;
  const maxTier = Math.max(
    ...offers.map((offer) => offer.discountConfig.minimumSpendValue)
  );
  return Math.min((amountSpent / maxTier) * 100, 100);
};

const getDynamicMessage = (
  amountSpent: number,
  offers: Offer[],
  languageCode: LanguageCode,
  hasUnlockedTier: boolean
) => {
  const currentTier = getCurrentFreebies(amountSpent, offers);
  const nextTier = getNextTier(amountSpent, offers);

  if (hasUnlockedTier && currentTier) {
    const tierName =
      currentTier.offerName[languageCode] ||
      currentTier.offerName.en ||
      "Freebie";

    if (nextTier) {
      const diff = (
        nextTier.discountConfig.minimumSpendValue - amountSpent
      ).toFixed(2);
      const nextTierName =
        nextTier.offerName[languageCode] || nextTier.offerName.en || "freebie";
      return {
        header: "Congratulations! Freebie Unlocked",
        message: `Spend ${formatCurrency({
          amount: Number(diff),
        })} more for getting ${nextTierName.toLowerCase()}!`,
        showCelebration: true,
      };
    }

    return {
      header: "Congratulations! Freebie Unlocked",
      message: `Your ${tierName} is waiting`,
      showCelebration: true,
    };
  } else if (nextTier) {
    const diff = (
      nextTier.discountConfig.minimumSpendValue - amountSpent
    ).toFixed(2);
    const tierName =
      nextTier.offerName[languageCode] || nextTier.offerName.en || "freebie";
    return {
      header: "Freebie Available",
      message: `Spend ${formatCurrency({
        amount: Number(diff),
      })} more for getting ${tierName.toLowerCase()}!`,
      showCelebration: false,
    };
  }

  return {
    header: "Freebie Available",
    message: "Your Freebie is waiting!",
    showCelebration: false,
  };
};

const getCurrentFreebies = (amountSpent: number, offers: Offer[]) => {
  const currentTierIdx = getCurrentTierIndex(amountSpent, offers);
  return currentTierIdx >= 0 ? offers[currentTierIdx] : null;
};

const Freebies: React.FC<FreebiesProps> = ({
  amountSpent,
  offers,
  handleCurrentFreebies,
}) => {
  const [lang, languageCode]: [TranslationKeys, LanguageCode] = useLang();

  useEffect(() => {
    if (offers && offers.length > 0) {
      const currentFreebies = getCurrentFreebies(amountSpent, offers);
      handleCurrentFreebies(currentFreebies);
    } else {
      handleCurrentFreebies(null);
    }
  }, [amountSpent, offers, handleCurrentFreebies]);

  if (!offers || offers.length === 0) return null;

  const maxTier = Math.max(
    ...offers.map((offer) => offer.discountConfig.minimumSpendValue)
  );
  const progressPercentage = getProgressPercentage(amountSpent, offers);
  const currentTierIdx = getCurrentTierIndex(amountSpent, offers);
  const hasUnlockedTier = currentTierIdx >= 0;
  const messageData = getDynamicMessage(
    amountSpent,
    offers,
    languageCode,
    hasUnlockedTier
  );

  const getOfferName = (offer: Offer) => {
    return offer.offerName[languageCode] || offer.offerName.en || lang.freebie;
  };


  // Mobile progress uses same calculation as desktop for consistency
  const getMobileProgressPercentage = () => {
    return getProgressPercentage(amountSpent, offers);
  };

  return (
    <div className="freebies-container">
      <div
        className={`freebies-wrapper p-4 ${hasUnlockedTier ? "freebies-unlocked" : "freebies-locked"
          }`}
      >
        {/* Mobile View */}
        <div className="freebies-mobile-view">
          <div className={`freebies-mobile-header ${hasUnlockedTier ? "freebies-mobile-header-unlocked" : ""
            }`}>{messageData.header}</div>
          <div className={`freebies-mobile-message ${hasUnlockedTier ? "freebies-mobile-message-unlocked" : ""
            }`}>{messageData.message}</div>
          <div className="freebies-mobile-progress-container">
            <div className="freebies-mobile-progress-bar" />
            <div
              className="freebies-mobile-progress-fill"
              style={{ width: `${getMobileProgressPercentage()}%` }}
            />
            {offers.map((offer, index) => {
              const reached = amountSpent >= offer.discountConfig.minimumSpendValue;

              // Use same positioning logic as desktop
              const isLast = index === offers.length - 1;
              const leftPos = (offer.discountConfig.minimumSpendValue / maxTier) * 100;

              return (
                <div
                  key={offer._id}
                  className="freebies-mobile-milestone"
                  style={
                    isLast
                      ? {
                        right: 0,
                        left: 'auto',
                        transform: 'none'
                      }
                      : {
                        left: `${leftPos}%`,
                        transform: 'translateX(-50%)'
                      }
                  }
                >
                  <div className="freebies-mobile-milestone-price">
                    {formatCurrency({
                      amount: offer.discountConfig.minimumSpendValue,
                    })}
                  </div>
                  <div className="freebies-mobile-milestone-icon">
                    <Icon
                      icon={reached ? `${OFFER_DISCOUNT_ICON}#offer-discount-icon` : `${OFFER_LOCK_ICON}#offer-lock-icon`}
                      width={24}
                      height={24}
                      viewBox={reached ? "0 0 18 18" : "0 0 16 16"}
                      color={"var(--freebies-icon-color)"}
                    />
                  </div>
                  <Tooltip text={getOfferName(offer)}>
                    <div className="freebies-mobile-milestone-label">
                      {getOfferName(offer)}
                    </div>
                  </Tooltip>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop View - UNCHANGED */}
        <div className="freebies-desktop-flex gap-4">
          <div className="freebies-left">
            {messageData.showCelebration && (
              <img
                src={FREEBIES_CELEBRATION_ICON}
                width={48}
                height={48}
                alt="freebies-celebration"
              />
            )}

            <div>
              <div
                className={`freebies-header ${hasUnlockedTier ? "freebies-header-unlocked" : ""
                  }`}
              >
                {messageData.header}
              </div>
              <span
                className={`freebies-message ${hasUnlockedTier ? "freebies-message-unlocked" : ""
                  }`}
              >
                {messageData.message}
              </span>
            </div>
          </div>

          <div className="freebies-right">
            <div className="progress-container">
              <div className="milestones-wrapper">
                {offers.map((offer, index) => {
                  const left = `${(offer.discountConfig.minimumSpendValue / maxTier) * 100
                    }%`;
                  const reached =
                    amountSpent >= offer.discountConfig.minimumSpendValue;
                  const isLast = index === offers.length - 1;

                  return (
                    <div
                      key={offer._id}
                      className={`milestone-box ${isLast ? "milestone-last" : ""
                        }`}
                      style={
                        isLast
                          ? {
                            right: 0,
                            left: "auto",
                          }
                          : {
                            left: left,
                          }
                      }
                    >
                      <div
                        className={`milestone-content ${reached ? "milestone-unlocked" : "milestone-locked"
                          }`}
                      >
                        <div className="milestone-top-row">
                          <Icon
                            icon={reached ? OFFER_DISCOUNT_ICON : OFFER_LOCK_ICON}
                            width={14}
                            height={16}
                            viewBox={reached ? "0 0 18 18" : "0 0 16 16"}
                            color={reached ? "var(--success)" : "var(--accent-color)"}
                          />
                          <span className="milestone-price">
                            {formatCurrency({
                              amount: offer.discountConfig.minimumSpendValue,
                            })}
                          </span>
                        </div>
                        <Tooltip text={getOfferName(offer)}>
                          <div className="milestone-label">
                            {getOfferName(offer)}
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="progress-bar-wrapper">
                <div className="progress-background" />
                <div
                  className={`progress-active ${currentTierIdx >= 0 ? "progress-success" : "progress-pending"
                    }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Styles */}
        <style>{`
          .freebies-container {
            width: 100%;
            padding: 0px;
            overflow-x: visible;
          }
          .freebies-wrapper {
            border-radius: 0px;
            width: 100%;
            overflow-x: visible;
            transition: background-color 0.3s ease;
          }
          .freebies-wrapper.freebies-unlocked {
            background-color: var(--freebies-background);
            border: 1px solid var(--borders-dividers);
          }
          .freebies-wrapper.freebies-locked {
            background: linear-gradient(90deg, var(--freebies-background) 0%, var(--freebies-background) 100%);
            border: 1px solid var(--borders-dividers);
          }
          .freebies-desktop-flex {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            justify-content: space-between;
            gap: 24px;
          }
          .freebies-left {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .freebies-header {
            font-weight: var(--font-bold);
            font-size: var(--heading-h5);
            transition: color 0.3s ease;
          }
          .freebies-header.freebies-header-unlocked {
            color: var(--success);
          }
          .freebies-message {
            font-size: var(--small-font);
            padding-left: 0px;
            margin-top: 4px;
            transition: color 0.3s ease;
          }
          .freebies-message.freebies-message-unlocked {
            color: var(--success);
            font-weight: var(--font-medium);
          }
          .freebies-message:not(.freebies-message-unlocked) {
            color: var(--accent-color);
          }
          .freebies-right {
            flex: 1;
            min-width: 0;
            display: flex;
            align-items: flex-start;
            overflow: visible;
          }
          .progress-container {
            position: relative;
            width: 100%;
            padding-top: 0px;
            padding-bottom: 12px;
            overflow: visible;
          }
          .milestones-wrapper {
            position: relative;
            width: 100%;
            height: 0;
            overflow: visible;
          }
          .milestone-box {
            position: absolute;
            top: 2px;
            transform: translateX(-50%);
            z-index: 2;
          }
          .milestone-box.milestone-last {
            transform: none;
            left: auto;
            right: 0;
          }
          .milestone-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 2px 10px;
            border: 2px dashed;
            border-radius: 8px;
            min-width: 80px;
            max-width: 150px;
            text-align: center;
            background-color: var(--white);
          }
          .milestone-unlocked {
            background-color: var(--primary-background);
            border-color: var(--success);
          }
          .milestone-unlocked .milestone-top-row,
          .milestone-unlocked .milestone-label {
            color: var(--success);
          }
          .milestone-locked {
            background-color: var(--tertiary-background);
            border-color: var(--accent-color);
          }
          .milestone-locked .milestone-top-row,
          .milestone-locked .milestone-label {
            color: var(--accent-color);
          }
          .milestone-top-row {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 6px;
            font-weight: var(--font-medium);
            font-size: var(--small-font);
            line-height: 1.2;
          }
          .milestone-price {
            white-space: nowrap;
            font-weight: var(--font-bold);
          }
          .milestone-label {
            font-size: var(--small-font);
            margin-top: 4px;
            font-weight: var(--font-regular);
            line-height: 1.2;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 100%;
            display: block;
            min-width: 0;
            cursor: pointer;
          }
          .progress-bar-wrapper {
            position: relative;
            width: 100%;
            height: 6px;
            margin-top: 24px;
            margin-right: 0;
          }
          .progress-background {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: var(--accent-color);
            border-radius: 3px;
            transition: background-color 0.3s ease;
          }
          .freebies-unlocked .progress-background {
            background: var(--primary-background);
          }
          .freebies-locked .progress-background {
            background: var(--borders-dividers);
          }
          .progress-active {
            position: absolute;
            top: 0;
            left: 0;
            height: 6px;
            border-radius: 3px;
            transition: width 0.3s ease-in-out;
          }
          .progress-success {
            background: var(--success);
          }
          .progress-pending {
            background: var(--accent-color);
          }

          /* Mobile View Styles */
          .freebies-mobile-view {
            display: none;
          }

          .freebies-mobile-header {
            font-size: var(--heading-h4);
            font-weight: var(--font-bold);
            color: var(--primary-text);
            margin-bottom: 6px;
            line-height: 1.3;
          }

          .freebies-mobile-header-unlocked {
            color: var(--success) !important;
          }

          .freebies-mobile-message {
            font-size: var(--extraSmall-font);
            font-weight: var(--font-bold);
            color: var(--primary-text);
            margin-bottom: 20px;
          }

          .freebies-mobile-message-unlocked {
            color: var(--success) !important;
            font-weight: var(--font-bold);
          }

          .freebies-mobile-progress-container {
            position: relative;
            width: 100%;
            padding-top: 32px;
            padding-bottom: 40px;
            overflow: visible;
          }

          .freebies-mobile-progress-bar {
            position: absolute;
            top: 32px;
            left: 0;
            width: 100%;
            height: 8px;
            background-color: var(--borders-dividers);
            border-radius: 4px;
            z-index: 1;
          }

          .freebies-mobile-progress-fill {
            position: absolute;
            top: 32px;
            left: 0;
            height: 8px;
            background-color: var(--success);
            border-radius: 4px;
            z-index: 2;
            transition: width 0.3s ease-in-out;
          }

          .freebies-mobile-milestone {
            position: absolute;
            top: 0;
            z-index: 3;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: auto;
            min-width: 65px;
            max-width: 85px;
          }

          .freebies-mobile-milestone-price {
            font-size: var(--small-font);
            font-weight: var(--font-bold);
            color: var(--success);
            margin-bottom: 6px;
            white-space: nowrap;
            line-height: 1.2;
            text-align: center;
          }

          .freebies-mobile-milestone-icon {
            width: 24px;
            height: 24px;
            position: absolute;
            top: 35px;
            left: 50%;
            transform: translateX(-50%) translateY(-50%);
            z-index: 5;
          }

          .freebies-mobile-milestone-label {
            font-size: var(--extraSmall-font);
            font-weight: var(--font-regular);
            color: var(--success);
            margin-top: 32px;
            line-height: 1.3;
            text-align: center;
            max-width: 80px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: block;
            min-width: 0;
            cursor: pointer;
          }

          /* Mobile Responsive */
          @media (max-width: 768px) {
            .freebies-container {
              width: 100%;
              background-color:var(--borders-dividers);
              padding: 0px;
              border-radius: 12px;
              overflow: visible;
            }

            .freebies-wrapper {
              background-color: transparent;
              border: none;
              padding: 0;
              overflow: visible;
            }

            .freebies-desktop-flex {
              display: none !important;
            }

            .freebies-mobile-view {
              display: block;
              width: 100%;
              overflow: visible;
              padding:10px;
            }

            .freebies-mobile-progress-container {
              overflow: visible !important;
              padding-right: 24px;
              padding-left: 8px;
            }

            .freebies-header {
              font-size: var(--description-font);
              font-weight: var(--font-semi-bold);
            }
            .freebies-mobile-milestone {
              max-width: 100px;
            }

            .freebies-mobile-milestone-label {
              font-size: var(--extraSmall-font);
              max-width: 90px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              cursor: pointer;
            }
          }

          @media (min-width: 769px) {
            .freebies-mobile-view {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Freebies;
