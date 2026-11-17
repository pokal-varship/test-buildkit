"use client";
import SecondaryButton from "@components/buttons/secondaryButton";
import Icon from "@components/image/Icons";
import { Coupon } from "@components/order/order.type";
import { CROSS_ICON } from "@config/Header/image.config";
import useLang from "@hooks/useLang";
import { formatUnixTimestamp } from "@lib/helper";
import { useLanguage } from "context/LanguageContext";
import React from "react";
import { LanguageCode, TranslationKeys } from "types";
import parse from "html-react-parser";

interface Props {
  onClose: () => void;
  promo: Coupon | null;
  handleApplyDiscountCode?: (code: string, _id: string) => void;
  isApplied?: boolean;
}

const PromoDetailsDialog: React.FC<Props> = ({
  onClose,
  promo,
  handleApplyDiscountCode,
  isApplied = false,
}) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const { selectedLang } = useLanguage();
  const language = selectedLang.code.toLowerCase();

  if (!promo) {
    return null;
  }

  const handleApply = () => {
    if (handleApplyDiscountCode && promo.code && promo._id) {
      handleApplyDiscountCode(promo.code, promo._id);
      onClose();
    }
  };

  return (
    <div className="promo-details-dialog">  
      <div className="promo-details-content">
        {/* Header with code pill and close button */}
        <div className="promo-details-header">
          <span className="promo-details-code">{promo.code}</span>
          <Icon
            icon={`${CROSS_ICON}#cross`}
            width={24}
            height={24}
            color={"var(--primary-text)"}
            className="cursor-pointer promo-details-close"
            viewBox="0 0 16 16"
            onClick={onClose}
          />
        </div>

        {/* Scrollable content */}
        <div className="promo-details-scrollable">
          {/* Title */}
          <h3 className="promo-details-title">
            {promo?.title?.[language] || "Title"}
          </h3>

          {/* Valid till */}
          <p className="promo-details-valid-till">
            {lang.validTill}{" "}
            {formatUnixTimestamp(
              promo.validity.endDateTimestamp,
              "DD MMM YYYY"
            )}
          </p>

          {/* Description */}
          <div className="promo-details-description">
            {parse(promo?.description?.[language] || "")}
          </div>

          {/* Terms & Conditions */}
          {promo?.termsAndConditions && promo?.termsAndConditions?.[language] && (
            <div className="promo-details-terms">
              <h4 className="promo-details-terms-title">{lang.tAndCsApply}</h4>
              <div className="promo-details-terms-content">
                {parse(promo?.termsAndConditions?.[language] || '')}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Apply button */}
        <div className="promo-details-footer">
          {isApplied ? (
            <SecondaryButton className="promo-details-apply-btn applied" disabled>
              {lang.applied}
            </SecondaryButton>
          ) : (
            <SecondaryButton
              className="promo-details-apply-btn"
              onClick={handleApply}
            >
              {lang.apply}
            </SecondaryButton>
          )}
        </div>
      </div>

      <style>{`
        .promo-details-dialog {
          background-color: var(--cards-containers);
          width: 100%;
          max-width: 500px;
          height: auto;
          max-height: 600px;
          min-height:300px;
          display: flex;
          flex-direction: column;
          position: relative;
          border-radius: 10px;
          overflow: hidden;
        }

        .promo-details-content {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          padding: 24px;
          overflow: hidden;
        }

        .promo-details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-shrink: 0;
        }

        .promo-details-code {
          display: inline-flex;
          align-items: center;
          font-size: var(--description-font);
          font-weight: var(--font-bold);
          color: var(--success);
          background-color: #66BB6A33;
          padding: 8px 16px;
          border: 2px dashed var(--success);
          border-radius: 8px;
          gap: 8px;
        }

        .promo-details-close {
          cursor: pointer;
          flex-shrink: 0;
          padding: 4px;
        }

        .promo-details-close:hover {
          opacity: 0.7;
        }

        .promo-details-scrollable {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          min-height: 0;
          -webkit-overflow-scrolling: touch;
          padding-right: 8px;
          max-height: 300px;
        }

        .promo-details-scrollable::-webkit-scrollbar {
          width: 6px;
        }

        .promo-details-scrollable::-webkit-scrollbar-track {
          background: var(--primary-background);
          border-radius: 3px;
        }

        .promo-details-scrollable::-webkit-scrollbar-thumb {
          background: var(--borders-dividers);
          border-radius: 3px;
        }

        .promo-details-title {
          font-size: var(--heading-h5);
          font-weight: var(--font-bold);
          color: var(--primary-text);
          margin: 0 0 8px 0;
        }

        .promo-details-valid-till {
          color: var(--secondary-text);
          font-size: var(--small-font);
          margin: 0 0 20px 0;
        }

        .promo-details-description {
          font-size: var(--description-font);
          color: var(--primary-text);
          line-height: 1.6;
        }

        .promo-details-description p {
          margin: 0 0 12px 0;
        }

        .promo-details-description p:last-child {
          margin-bottom: 0;
        }

        .promo-details-terms {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--borders-dividers);
        }

        .promo-details-terms-title {
          font-size: var(--description-font);
          font-weight: var(--font-bold);
          color: var(--primary-text);
          margin: 0 0 12px 0;
        }

        .promo-details-terms-content {
          font-size: var(--description-font);
          color: var(--primary-text);
          line-height: 1.6;
        }

        .promo-details-terms-content p {
          margin: 0 0 8px 0;
        }

        .promo-details-terms-content p:last-child {
          margin-bottom: 0;
        }

        .promo-details-terms-content ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .promo-details-terms-content li {
          font-size: var(--description-font);
          color: var(--primary-text);
          line-height: 1.6;
          margin-bottom: 8px;
          padding-left: 20px;
          position: relative;
        }

        .promo-details-terms-content li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: var(--primary-text);
          font-weight: var(--font-bold);
        }

        .promo-details-terms-content li:last-child {
          margin-bottom: 0;
        }

        .promo-details-footer {
          padding-top: 20px;
          flex-shrink: 0;
          margin-top: auto;
        }

        .promo-details-apply-btn {
          width: 100%;
          color: var(--black);
        }

        .promo-details-apply-btn.applied {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .promo-details-dialog {
            max-width: 100%;
            height: auto;
            min-height:300px;
            max-height: 85vh;
            border-radius: 10px 10px 0 0;
          }

          .promo-details-content {
            padding: 20px 16px;
          }

          .promo-details-header {
            margin-bottom: 16px;
          }

          .promo-details-code {
            padding: 6px 14px;
            font-size: var(--small-font);
          }

          .promo-details-close {
            width: 28px;
            height: 28px;
          }

          .promo-details-title {
            font-size: var(--heading-h6);
            margin-bottom: 6px;
          }

          .promo-details-valid-till {
            font-size: var(--small-font);
            margin-bottom: 16px;
          }

          .promo-details-description {
            font-size: var(--small-font);
            margin-bottom: 20px;
          }

          .promo-details-terms {
            margin-top: 20px;
            padding-top: 20px;
          }

          .promo-details-terms-title {
            font-size: var(--small-font);
            margin-bottom: 10px;
          }

          .promo-details-terms-content {
            font-size: var(--small-font);
          }

          .promo-details-terms-content li {
            font-size: var(--small-font);
            margin-bottom: 6px;
          }

          .promo-details-footer {
            padding-top: 16px;
          }

          .promo-details-apply-btn {
            padding: 12px;
            font-size: var(--small-font);
          }
        }
      `}</style>
    </div>
  );
};

export default PromoDetailsDialog;

