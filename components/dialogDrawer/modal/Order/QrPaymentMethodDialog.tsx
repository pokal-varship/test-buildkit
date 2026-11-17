"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useStoreDataBootstrap } from "@app/StoreDataProvider";
import CustomButton from "@components/buttons/Button";
import Icon from "@components/image/Icons";
import { CROSS_ICON } from "@config/Header/image.config";
import useLang from "@hooks/useLang";
import { LanguageCode, TranslationKeys } from "types";
import ChoosePaymentMethod from "@components/payment/ChoosePaymentMethod";
import useAnalytics from "@hooks/useAnalytics";
import {
  selectQrResolveData,
  selectSessionId,
  selectSessionSummary,
} from "@redux/slices/qrFlowSlice";
import { selectCurrentStore } from "@redux/slices/storeSlice";
import { mapQrSessionToCartTotal } from "@lib/qr/mapSessionToCartTotal";

export const QR_PAYMENT_METHOD_CASH = "CASH";
export const QR_PAYMENT_METHOD_ONLINE = "CreditOrDebitCard";

interface QrPaymentMethodDialogProps {
  onClose: () => void;
  /** May return a Promise; dialog shows submitting state until it settles. */
  onSubmit: (paymentMethod: string) => void | Promise<void>;
  isSubmitting?: boolean;
}

const QrPaymentMethodDialog: React.FC<QrPaymentMethodDialogProps> = ({
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [isPendingSubmit, setIsPendingSubmit] = useState(false);
  const { trackDineInPaymentMethodSelected } = useAnalytics();
  const { bootstrapStore } = useStoreDataBootstrap();
  const sessionId = useSelector(selectSessionId);
  const sessionSummary = useSelector(selectSessionSummary);
  const qrResolveData = useSelector(selectQrResolveData);
  const currentStore = useSelector(selectCurrentStore);
  const storeSlug = qrResolveData?.storefrontSlug?.trim() ?? "";

  useEffect(() => {
    if (!storeSlug) return;
    void bootstrapStore(storeSlug);
  }, [bootstrapStore, storeSlug]);

  const cartTotal = React.useMemo(
    () => mapQrSessionToCartTotal(sessionSummary),
    [sessionSummary]
  );

  const paymentOptions = (currentStore?.payment ?? []).map((opt) => {
    if (opt.method === "CASH" || opt.method === "PayByCash") {
      return {
        ...opt,
        instructions:
          lang.order?.paidViaCashDescription ??
          "Conveniently pay cash directly to the Restaurant upon receipt.",
      };
    }
    if (opt.method === QR_PAYMENT_METHOD_ONLINE) {
      return {
        ...opt,
        instructions:
          lang.order?.onlineCardsPaymentDescription ??
          "Pay securely online using your credit/debit card, net banking, or other digital payment options.",
      };
    }
    return opt;
  });

  const isSubmitInProgress = isSubmitting || isPendingSubmit;

  const handleSubmit = async () => {
    if (!selectedMethod || isSubmitInProgress) return;
    setIsPendingSubmit(true);
    try {
      void trackDineInPaymentMethodSelected({
        payment_method: selectedMethod,
        session_id: String(sessionId || ""),
        cart_value: sessionSummary?.finalAmount ?? 0,
      });
      await Promise.resolve(onSubmit(selectedMethod));
    } finally {
      setIsPendingSubmit(false);
    }
  };

  return (
    <div className="qr-payment-method-dialog">
      <div className="qr-payment-method-header">
        <h2 className="qr-payment-method-title">
          {lang.order?.choosePaymentMethod ?? "Choose payment method"}
        </h2>
        <button
          type="button"
          className="qr-payment-method-close"
          onClick={onClose}
          disabled={isSubmitInProgress}
          aria-label="Close"
        >
          <Icon
            icon={`${CROSS_ICON}#cross`}
            width={30}
            height={30}
            color="var(--primary-text)"
            viewBox="0 0 24 24"
          />
        </button>
      </div>

      <div className="qr-payment-method-body">
        <ChoosePaymentMethod
          paymentOptions={paymentOptions}
          orderType="dine-in"
          setPaymentMethods={setSelectedMethod}
          enablePayOnline={false}
          cartTotal={cartTotal}
        />
      </div>

      <CustomButton
        className="font-700 !w-full heading-4"
        onClick={handleSubmit}
        disabled={!selectedMethod || isSubmitInProgress}
      >
        {isSubmitInProgress ? (lang.Submitting ?? "Submitting...") : (lang.Submit ?? "Submit")}
      </CustomButton>

      <style>{`
        .qr-payment-method-dialog {
          width: 100%;
          padding: 20px 16px 24px;
          background-color: var(--cards-containers);
          border-radius: 10px 10px 0 0;
        }
        .qr-payment-method-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          gap: 10px;
        }
        .qr-payment-method-title {
          font-size: var(--heading-h2);
          font-weight: var(--font-medium);
          color: var(--primary-text);
          margin: 0;
        }
        .qr-payment-method-close {
          padding: 4px;
          margin-top: 5px;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .qr-payment-method-close:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .qr-payment-method-body {
          margin-bottom: 20px;
        }
        .qr-payment-method-body .choose-payment-method-label {
          display: none;
        }
        .qr-payment-method-body .choose-payment-method-container {
          margin-bottom: 0;
          border: none;
          padding: 0 0 10px 0;
        }
      `}</style>
    </div>
  );
};

export default QrPaymentMethodDialog;
