"use client";

import React from "react";
import formatCurrency from "@lib/helper/price";

export const TAX_FEE_TOOLTIP_CONTENT_CLASS = "tax-fee-tooltip-content";
export const TAX_FEE_TOOLTIP_ARROW_CLASS = "tax-fee-tooltip-arrow";

interface TaxFeeBreakdownTooltipProps {
  taxAmount: number;
  platformFeeAmount: number;
  platformFeeLabel: string;
  gstDescription: string;
  platformFeeDescription: string;
}

const TaxFeeBreakdownTooltip: React.FC<TaxFeeBreakdownTooltipProps> = ({
  taxAmount,
  platformFeeAmount,
  // platformFeeLabel,
  gstDescription,
  // platformFeeDescription,
}) => {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Plateaway";
  const resolvedGstDescription = gstDescription.replace("{{appName}}", appName);
  // const resolvedPlatformFeeDescription = platformFeeDescription.replace(
  //   "{{appName}}",
  //   appName
  // );
  const resolvedPlatformFeeAmount =
    platformFeeAmount > 0 ? platformFeeAmount : taxAmount;
  // const resolvedGstAmount = platformFeeAmount > 0 ? taxAmount : 0;

  return (
    <>
      <div className="tax-fee-tooltip">
        <div className="tax-fee-tooltip-row">
          <div className="tax-fee-tooltip-content-block">
            <p className="tax-fee-tooltip-title">GST</p>
            <p className="tax-fee-tooltip-description">
              {resolvedGstDescription}
            </p>
          </div>
          <p className="tax-fee-tooltip-value">
            {formatCurrency({ amount: resolvedPlatformFeeAmount })}
          </p>
        </div>
        {/* <div className="tax-fee-tooltip-row">
          <div className="tax-fee-tooltip-content-block">
            <p className="tax-fee-tooltip-title">{platformFeeLabel}</p>
            <p className="tax-fee-tooltip-description">
              {resolvedPlatformFeeDescription}
            </p>
          </div>
          <p className="tax-fee-tooltip-value">
            {formatCurrency({ amount: resolvedPlatformFeeAmount })}
          </p>
        </div> */}
      </div>

      <style>{`
        .${TAX_FEE_TOOLTIP_CONTENT_CLASS} {
          background: var(--cards-containers) !important;
          color: var(--primary-text) !important;
          border-radius: 8px !important;
          max-width: 280px !important;
          width: 280px;
          padding: 12px !important;
        }
        .${TAX_FEE_TOOLTIP_ARROW_CLASS} {
          fill: var(--cards-containers) !important;
        }
        .tax-fee-tooltip {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .tax-fee-tooltip-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }
        .tax-fee-tooltip-content-block {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .tax-fee-tooltip-title {
          font-size: var(--heading-h6);
          color: var(--primary-text);
          line-height: 1.3;
          margin: 0;
        }
        .tax-fee-tooltip-description {
          font-size: var(--extraSmall-font);
          color: var(--secondary-text);
          line-height: 1.3;
          margin: 0;
        }
        .tax-fee-tooltip-value {
          font-size: var(--heading-h6);
          color: var(--primary-text);
          line-height: 1.3;
          margin: 0;
          white-space: nowrap;
        }
      `}</style>
    </>
  );
};

export default TaxFeeBreakdownTooltip;
