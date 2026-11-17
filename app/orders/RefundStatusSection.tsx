"use client";

import CustomDialog from "@components/dialogDrawer/dialog";
import { Order, RefundMethod } from "@components/type/order.type";
import { getFormattedDate } from "@lib/helper/date";
import {
  getRefundMethodIcon,
  getRefundMethodLabel,
  getRefundMethodStatusMessage,
  getValidRefundMethods,
  isOnlineRefundMethod,
} from "@lib/helper/orders";
import formatCurrency from "@lib/helper/price";
import { FC, useMemo, useState } from "react";
import { TranslationKeys } from "types";

type RefundStatusSectionProps = {
  refundMethods: RefundMethod[];
  order: Order;
  lang: TranslationKeys;
  supportEmail: string;
};

const REFUND_DETAILS_DIALOG_SX = {
  "& .MuiPaper-root": {
    maxWidth: "500px",
    width: "100%",
    borderRadius: "12px",
  },
  "& .MuiDialogContent-root": {
    padding: 0,
  },
} as const;

const RefundStatusSection: FC<RefundStatusSectionProps> = ({
  refundMethods,
  order,
  lang,
  supportEmail,
}) => {
  const [selectedRefund, setSelectedRefund] = useState<RefundMethod | null>(
    null,
  );

  const validRefundMethods = useMemo(
    () => getValidRefundMethods(refundMethods),
    [refundMethods],
  );

  const formatRefundDate = (timestamp: number) =>
    getFormattedDate(timestamp, "DD MMM YYYY");

  const handleViewRefundDetails = (refund: RefundMethod) => {
    setSelectedRefund(refund);
  };

  const handleCloseDetailsModal = () => {
    setSelectedRefund(null);
  };

  if (!validRefundMethods.length) return null;

  return (
    <>
      <div className="order-details-container w-full md:px-6 px-4 py-5 border border-[var(--rating-border-primary)]">
        <p className="font-700 md-heading-4 text-[var(--primary-text)] mb-4">
          {lang.order.refundStatusTitle}
        </p>

        <div className="flex flex-col">
          {validRefundMethods.map((refund, index) => {
            const statusMessage = getRefundMethodStatusMessage(
              refund,
              lang,
              (amount) => formatCurrency({ amount }),
              formatRefundDate,
            );
            const showViewDetails = isOnlineRefundMethod(refund);

            return (
              <div
                key={`${refund.tenderId ?? refund.tenderType}-${index}`}
                className={`py-4 ${
                  index < validRefundMethods.length - 1
                    ? "border-b border-[var(--borders-dividers)]"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-2">
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F9F7F0]"
                      aria-hidden
                    >
                      <img
                        src={getRefundMethodIcon(refund)}
                        alt=""
                        className="h-4 w-4 shrink-0"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="description-font md-heading-4 font-500 text-[var(--primary-text)]">
                        {getRefundMethodLabel(refund, lang, order)}
                      </p>
                      <p className="small-font text-[var(--success)] mt-1">
                        {statusMessage}
                        {showViewDetails ? (
                          <>
                            {" "}
                            <button
                              type="button"
                              onClick={() => handleViewRefundDetails(refund)}
                              className="text-[var(--accent-color)] underline cursor-pointer"
                            >
                              {lang.order.viewRefundDetails}
                            </button>
                          </>
                        ) : null}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 description-font text-[var(--primary-text)]">
                    {formatCurrency({ amount: refund.amount })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedRefund ? (
        <CustomDialog
          open={selectedRefund !== null}
          anchor="bottom"
          type="refundDetails"
          propsData={{
            refund: selectedRefund,
            order,
            supportEmail,
          }}
          handlerDialog={() => {}}
          handleClose={handleCloseDetailsModal}
          onlyDialog
          drawerBorderRadius="12px"
          sxStyle={REFUND_DETAILS_DIALOG_SX}
        />
      ) : null}
    </>
  );
};

export default RefundStatusSection;
