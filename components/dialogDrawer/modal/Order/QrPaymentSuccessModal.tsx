"use client";

import React from "react";
import BaseSuccessModal from "./BaseSuccessModal";
import { ORDER_SUCCESS_ICON } from "@config/Header/image.config";
import useLang from "@hooks/useLang";
import { LanguageCode, TranslationKeys } from "types";

interface QrPaymentSuccessModalProps {
  storeName: string;
  onClose: () => void;
  onGoToOrderDetails: () => void;
  onShareExperience: () => void;
}

const QrPaymentSuccessModal: React.FC<QrPaymentSuccessModalProps> = ({
  storeName,
  // onClose,
  onGoToOrderDetails,
  onShareExperience,
}) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const thankYouMessage = (lang.order?.thankYouForDiningAt ?? "Thank you for dining with us at {{storeName}}").replace(
    "{{storeName}}",
    storeName
  );

  return (
    <BaseSuccessModal
      icon={{
        src: ORDER_SUCCESS_ICON,
        alt: "",
        width: 100,
        height: 100,
      }}
      title={lang.order?.paymentSuccessful ?? "Payment Successful!"}
      message={thankYouMessage}
      primaryButton={{
        text: lang.order?.goToOrderDetails ?? "Go to order details",
        onClick: onGoToOrderDetails,
        className: "font-700 !w-full heading-4 mb-2",
      }}
      secondaryButton={{
        text: lang.order?.shareYourExperience ?? "Share your experience",
        onClick: onShareExperience,
        className: "hidden font-700 !w-full heading-4 !bg-[var(--primary-background)]",
      }}
      containerClassName="qr-payment-success-modal"
      contentClassName="qr-payment-success-content"
      titleClassName="qr-payment-success-title"
      messageClassName="qr-payment-success-message"
      buttonsClassName="qr-payment-success-actions"
      padding={{
        container: "24px 16px 32px",
        content: "0px"
      }}
      customStyles={{
        content: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }
      }}
    />
  );
};

export default QrPaymentSuccessModal;
