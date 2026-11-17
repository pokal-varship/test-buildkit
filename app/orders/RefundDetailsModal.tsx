"use client";

import Icon from "@components/image/Icons";
import { Order, RefundMethod } from "@components/type/order.type";
import { CROSS_ICON } from "@config/Header/image.config";
import useLang from "@hooks/useLang";
import { getFormattedDate } from "@lib/helper/date";
import {
  getRefundMethodStatusMessage,
  getRefundPaymentMethodLabel,
  getRefundStatusLabel,
} from "@lib/helper/orders";
import formatCurrency from "@lib/helper/price";
import { FC } from "react";
import { LanguageCode, TranslationKeys } from "types";

type RefundDetailsModalProps = {
  refund?: RefundMethod | null;
  order?: Order | null;
  supportEmail?: string;
  onClose: () => void;
};

const RefundDetailsModal: FC<RefundDetailsModalProps> = ({
  refund,
  order = null,
  supportEmail = "support@plataway.com",
  onClose,
}) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();

  if (!refund) return null;

  const formatRefundDate = (timestamp: number) =>
    getFormattedDate(timestamp, "DD MMM YYYY");

  const statusMessage = getRefundMethodStatusMessage(
    refund,
    lang,
    (amount) => formatCurrency({ amount }),
    formatRefundDate,
  );

  return (
    <div className="w-full min-w-0 bg-[var(--cards-containers)] px-4 py-5 md:p-6 md:max-w-[500px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="heading-2 font-700 text-[var(--primary-text)] m-0">
          {lang.order.refundDetailsTitle}
        </h2>
        <button
          type="button"
          className="flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-1"
          onClick={onClose}
          aria-label="Close"
        >
          <Icon
            icon={`${CROSS_ICON}#cross`}
            width={18}
            height={18}
            color="var(--primary-text)"
            viewBox="0 0 16 16"
            className="cursor-pointer"
          />
        </button>
      </div>

      <div className="rounded-xl border border-[var(--rating-border-primary)] p-4 md:p-5">
        <p className="font-600 text-[var(--success)] mb-4">{statusMessage}</p>

        <div className="flex flex-col gap-4">
          <div>
            <p className="extra-small-font text-[var(--secondary-text)] mb-1">
              {lang.refundMethod}
            </p>
            <p className="description-font text-[var(--primary-text)]">
              {getRefundPaymentMethodLabel(refund, lang, order)}
            </p>
          </div>

          <div>
            <p className="extra-small-font text-[var(--secondary-text)] mb-1">
              {lang.order.refundStatusTitle}
            </p>
            <p className="description-font text-[var(--primary-text)]">
              {getRefundStatusLabel(refund, lang)}
            </p>
          </div>

          {refund.referenceNumber ? (
            <div>
              <p className="extra-small-font text-[var(--secondary-text)] mb-1">
                {lang.order.referenceNumber}
              </p>
              <p className="description-font text-[var(--primary-text)] break-all">
                {refund.referenceNumber}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <p className="small-font text-[var(--secondary-text)] mt-4">
        {lang.pleaseAllow35BusinessDaysForTheRefundToAppearInYourAccount}{" "}
        <a
          className="text-[var(--accent-color)] underline"
          href={`mailto:${supportEmail}`}
        >
          {supportEmail}
        </a>
      </p>
    </div>
  );
};

export default RefundDetailsModal;
