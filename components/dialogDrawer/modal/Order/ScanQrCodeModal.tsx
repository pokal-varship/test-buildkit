"use client";

import React from "react";
import Icon from "@components/image/Icons";
import { CROSS_ICON, ORDER_TOGETHER_ICON } from "@config/Header/image.config";
import useLang from "@hooks/useLang";
import { LanguageCode, TranslationKeys } from "types";

interface ScanQrCodeModalProps {
  onClose: () => void;
}

const ScanQrCodeModal: React.FC<ScanQrCodeModalProps> = ({ onClose }) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();

  const title = lang.order.scanQrCodeTitle;
  const description = lang.order.scanQrCodeDescription;

  return (
    <div className="relative w-full rounded-t-[10px] bg-[var(--cards-containers)] px-4 pb-7 pt-8 text-left">
      <button
        type="button"
        className="absolute right-3 top-3 flex cursor-pointer items-center justify-center border-0 bg-transparent p-1"
        onClick={onClose}
        aria-label="Close"
      >
        <Icon
          icon={`${CROSS_ICON}#cross`}
          width={24}
          height={24}
          color="var(--primary-text)"
          viewBox="0 0 24 24"
        />
      </button>

      <img
        src={ORDER_TOGETHER_ICON}
        alt=""
        width={78}
        height={82}
        className="mb-6 block"
      />

      <h2 className="m-0 mb-2 text-[length:var(--heading-h2)] font-[var(--font-medium)] leading-snug text-[var(--primary-text)]">
        {title}
      </h2>
      <p className="m-0 text-[length:var(--heading-h4)] font-[var(--font-regular)] leading-normal text-[var(--secondary-text)]">
        {description}
      </p>
    </div>
  );
};

export default ScanQrCodeModal;
