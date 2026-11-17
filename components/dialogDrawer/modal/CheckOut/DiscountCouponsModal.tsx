"use client";
import SecondaryButton from "@components/buttons/secondaryButton";
import CloseCircleIcon from "@components/icons/CloseCircleIcon";
import Icon from "@components/image/Icons";
import NoDataPlaceholder from "@components/no-data-placeholder/no-data-placeholder";
import { Coupon } from "@components/order/order.type";
import {
  CLOSE_CIRCLE_ICON,
  DISCOUNT_COUPON_PLACEHOLDER,
} from "@config/Header/image.config";
import useLang from "@hooks/useLang";
import { formatUnixTimestamp } from "@lib/helper";
import { open_dialog } from "@lib/modalHandler";
import { useLanguage } from "context/LanguageContext";
import React, { useState, useRef, useEffect } from "react";
import { LanguageCode, TranslationKeys } from "types";
import parse from "html-react-parser";

interface Props {
  onClose: () => void;
  handleApplyDiscountCode: (code: string, _id: string) => void;
  coupons: Coupon[];
  isApplied: boolean;
}

const DiscountCouponsModal: React.FC<Props> = ({
  onClose,
  handleApplyDiscountCode,
  coupons,
  isApplied,
}) => {
  const [discountCode, setDiscountCode] = useState("");
  const [expandedDescriptions, setExpandedDescriptions] = useState<{
    [key: string]: boolean;
  }>({});
  const descriptionRefs = useRef<{
    [key: string]: HTMLParagraphElement | null;
  }>({});
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const { selectedLang } = useLanguage();
  const language = selectedLang.code.toLowerCase();

  const handleApply = (code: string, _id: string) => {
    if (!code) return;
    handleApplyDiscountCode(code, _id);
    onClose();
  };

  const handleViewMore = (coupon: Coupon) => {
    open_dialog("promoDetails", {
      open: true,
      propsData: {
        promo: coupon,
        handleApplyDiscountCode,
        isApplied,
      },
      type: "promoDetails",
      handlerDialog: () => {},
      handleClose: () => {},
      anchor: "bottom",
      onlyDialog: true,
      sxStyle: {
        '& .MuiPaper-root': {
          borderRadius: '10px',
          maxWidth: '500px',
          width: '100%',
        },
        '& .MuiDialogContent-root': {
          padding: '0',
        },
      },
    });
  };

  useEffect(() => {
    // Check if descriptions need view more button
    coupons?.forEach((coupon) => {
      const element = descriptionRefs.current[coupon._id];
      if (element) {
        const lineHeight = parseInt(
          window.getComputedStyle(element).lineHeight
        );
        const height = element.scrollHeight;
        if (height > lineHeight * 2) {
          setExpandedDescriptions((prev) => ({
            ...prev,
            [coupon._id]: false,
          }));
        }
      }
    });
  }, [coupons]);

  const filteredCoupons =
    coupons?.filter((coupon) =>
      coupon?.code?.toLowerCase()?.includes(discountCode?.toLowerCase())
    ) ?? [];
  const isEmpty = filteredCoupons.length === 0;

  return (
    <div className="coupons-modal">
      <div className="coupons-modal-content">
        {/* Header */}
        <div className="coupons-modal-header">
          <h2 className="coupons-modal-header-title">{lang.coupons}</h2>
          <CloseCircleIcon
            width={30}
            height={30}
            className="cursor-pointer cross-icon"
            onClick={onClose}
          />
        </div>

        {/* Scrollable content */}
        <div className="coupons-scrollable">
          <div className="relative mb-4 shrink-0">
            <input
              type="text"
              placeholder={lang.enterDiscountCodePlaceholder}
              className="coupons-input pr-10"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              maxLength={15}
            />

            {discountCode.length > 0 && (
              <Icon
                icon={`${CLOSE_CIRCLE_ICON}#close-circle`}
                width={20}
                height={20}
                color={"var(--primary-text)"}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                viewBox="0 0 25 25"
                onClick={() => setDiscountCode("")}
              />
            )}
          </div>

          {isEmpty ? (
            <div className="coupons-empty-state">
              <NoDataPlaceholder
                imageSrc={DISCOUNT_COUPON_PLACEHOLDER}
                imageIconId="discount-coupon"
                imageViewBox="0 0 140 140"
                imageColor="var(--primary-color)"
                imageAlt=""
                imageWidth={140}
                imageHeight={140}
                title={lang.noCouponsFound}
                subtitle={lang.noCouponsAvailableSubtitle}
                className="coupons-empty-placeholder !p-0"
                regionLabel="No coupons placeholder"
                titleClassName="md-heading-4"
                subtitleClassName="md-heading-5"
              />
            </div>
          ) : (
            <div className="coupons-list">
              {filteredCoupons.map((coupon, index) => {
                  const descriptionElement =
                    descriptionRefs.current[coupon._id];
                  const hasTermsAndConditions = 
                    coupon?.termsAndConditions?.[language] && 
                    coupon.termsAndConditions[language].trim().length > 0;
                  const shouldShowViewMore =
                    (descriptionElement &&
                    descriptionElement.scrollHeight >
                      parseInt(
                        window.getComputedStyle(descriptionElement).lineHeight
                      ) *
                        2) || hasTermsAndConditions;

                  return (
                    <div key={index} className="coupons-list-item">
                      <span className="coupons-code">{coupon.code}</span>
                      <p className="coupons-description-title font-bold-var(--font-bold)">
                        {coupon?.title?.[language]}
                      </p>
                      <div className="coupons-description-container">
                        <p
                          ref={(el) => {
                            descriptionRefs.current[coupon._id] = el;
                          }}
                          className={`coupons-description ${
                            !expandedDescriptions[coupon._id]
                              ? "description-truncate"
                              : ""
                          }`}
                        >
                          {parse(coupon?.description?.[language])}
                        </p>
                        {shouldShowViewMore && (
                          <button
                            className="view-more-button"
                            onClick={() => {
                              handleViewMore(coupon);
                            }}
                          >
                            {lang.viewMore}
                          </button>
                        )}
                      </div>
                      <p className="coupons-valid-till">
                        {lang.validTill}{" "}
                        {formatUnixTimestamp(
                          coupon.validity.endDateTimestamp,
                          "DD MMMM YYYY"
                        )}
                      </p>
                      {isApplied ? (
                        <SecondaryButton
                          className="coupons-valid-button applied"
                          disabled
                        >
                          {lang.applied}
                        </SecondaryButton>
                      ) : (
                        <SecondaryButton
                          className="coupons-valid-button"
                          onClick={() => handleApply(coupon.code, coupon._id)}
                        >
                          {lang.apply}
                        </SecondaryButton>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Optionally add a footer here */}
      </div>

      <style>{`
        .coupons-modal {
          background-color: var(--cards-containers);
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
          z-index: 1;
        }

        .coupons-modal-content {
          background-color: var(--primary-background);
          display: flex;
          flex-direction: column;
          flex: 1;
          width: 100%;
          height: 100%;
          min-height: 0;
          padding: 20px;
          overflow: hidden;
          position: relative;
        }

        .coupons-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          flex-shrink: 0;
        }

        .coupons-scrollable {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          overflow-x: hidden;
          min-height: 0;
          -webkit-overflow-scrolling: touch;
        }

        .coupons-scrollable:has(.coupons-empty-state) {
          overflow: hidden;
        }

        .coupons-empty-state {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 0;
        }

        .coupons-valid-button.applied {
          opacity: 0.6;
          cursor: not-allowed;
        }
          
        .coupons-input {
            width: 100%;
            border: 1px solid var(--borders-dividers);
            padding: 12px;
            padding-right: 40px;
            border-radius: 8px;
            background-color: var(--cards-containers);
            color: var(--primary-text);
            font-size: var(--description-font);
        }

        .coupons-input:focus {
          outline: none;
          border-color: var(--borders-dividers);
        }

        .coupons-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .coupons-empty-placeholder {
          width: 100%;
          background: transparent !important;
          border-radius: 0 !important;
        }

        .coupons-empty-placeholder .mb-6 {
          margin-bottom: 16px;
        }

        .coupons-empty-placeholder .noDataPlaceholder__title {
          font-size: var(--heading-h5);
          font-weight: var(--font-bold);
          margin-bottom: 8px;
        }

        .coupons-empty-placeholder .noDataPlaceholder__subtitle {
          margin-bottom: 0 !important;
        }

        .coupons-code {
          display: inline-block;
          font-size: var(--description-font);
          font-weight: var(--font-bold);
          color: var(--success);
          background-color: #66BB6A33;
          padding: 10px 20px;
          border: 2px dashed var(--success);
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .coupons-description-title {
          font-size: var(--description-font);
          font-weight: var(--font-bold);
          color: var(--primary-text);
          margin-top: 15px;
        }

        .coupons-description{
          font-size: var(--description-font);
          margin-top: 5px;
          color: var(--primary-text);
        }

        .coupons-valid-till {
          margin-top: 10px;
          color: var(--secondary-text);
          font-size: var(--small-font);
        }

        .coupons-valid-button {
          width: 100%;
          color: var(--black);
          margin-top: 10px;
          font-weight: var(--font-bold);
        }

        .coupons-list-item {
          padding: 24px 15px 24px 15px;
          border: 1px solid var(--borders-dividers);
          border-radius: 8px;
          margin-bottom: 10px;
          background-color: var(--cards-containers);
        }

        .coupons-modal-header-title {
            font-size: var(--heading-h3);
            font-weight: var(--font-bold);
            color: var(--primary-text);
        }

        .coupons-description-container {
          position: relative;
          margin-top: 0px;
        }

        .description-truncate {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .view-more-button {
          background: none;
          border: none;
          color: var(--accent-color);
          cursor: pointer;
          padding: 5px 0;
          font-size: var(--small-font);
          font-weight: var(--font-medium);
        }

        .view-more-button:hover {
          text-decoration: underline;
        }

        @media (min-width: 769px) {
          .coupons-modal {
            min-width: 400px;
          }
          .coupons-modal-content {
            max-width: 450px;
          }
        }

        @media (max-width: 768px) {
          .coupons-modal {
            width: 100vw;
            height: 100vh;
            height: 100dvh;
            min-width: 100%;
          }

          .coupons-modal-content {
            padding: 16px;
            width: 100%;
            height: 100%;
          }

          .coupons-modal-header {
            margin-bottom: 16px;
          }

          .coupons-modal-header-title {
            font-size: var(--heading-h4);
          }

          .coupons-scrollable {
            padding-right: 0;
            -webkit-overflow-scrolling: touch;
          }

          .coupons-input {
            padding: 10px;
            padding-right: 36px;
            font-size: var(--small-font);
          }

          .coupons-scrollable .relative .absolute {
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
          }

          .coupons-list-item {
            padding: 16px 12px;
            margin-bottom: 8px;
          }

          .coupons-code {
            padding: 8px 16px;
            font-size: var(--small-font);
            margin-bottom: 8px;
          }

          .coupons-description-title {
            font-size: var(--small-font);
            margin-top: 12px;
          }

          .coupons-description {
            font-size: var(--small-font);
            margin-top: 4px;
          }

          .coupons-valid-till {
            font-size: var(--small-font);
            margin-top: 8px;
          }

          .coupons-valid-button {
            margin-top: 8px;
            padding: 10px;
            font-size: var(--small-font);
          }

          .view-more-button {
            font-size: var(--small-font);
            padding: 4px 0;
          }
        }
      `}</style>
    </div>
  );
};

export default DiscountCouponsModal;
