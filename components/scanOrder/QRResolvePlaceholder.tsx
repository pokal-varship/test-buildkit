'use client';

import React from 'react';
import useLang from '@hooks/useLang';
import { LanguageCode, TranslationKeys } from 'types';
import CustomButton from '@components/buttons/Button';

export type QRResolvePlaceholderVariant = 'timeout' | 'wrong-qr';

const TIMEOUT_ICON = '/images/placeholder/sand-clock.svg';
const WRONG_QR_ICON = '/images/placeholder/wrong-QR.svg';

interface QRResolvePlaceholderProps {
  variant: QRResolvePlaceholderVariant;
  onRetry: () => void;
  isRetrying?: boolean;
}

/**
 * Reusable placeholder when QR resolve API fails.
 * - timeout: "Having trouble scanning?" + scanning tips (sand-clock icon).
 * - wrong-qr: "Wrong QR code" + what to look for (wrong-QR icon).
 */
export default function QRResolvePlaceholder({
  variant,
  onRetry,
  isRetrying = false,
}: QRResolvePlaceholderProps) {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();

  const isTimeout = variant === 'timeout';
  const iconSrc = isTimeout ? TIMEOUT_ICON : WRONG_QR_ICON;
  const title = isTimeout ? lang.qrResolveHavingTrouble : lang.qrResolveWrongQr;
  const description = isTimeout ? lang.qrResolveHavingTroubleDesc : lang.qrResolveWrongQrDesc;
  const tipsTitle = isTimeout ? lang.qrResolveScanningTips : lang.qrResolveLookingFor;
  const tips = isTimeout
    ? [
        lang.qrResolveTipHoldSteady,
        lang.qrResolveTipLighting,
        lang.qrResolveTipCleanLens,
        lang.qrResolveTipNotDamaged,
      ]
    : [
        lang.qrResolveTipTableTent,
        lang.qrResolveTipScanToOrder,
        lang.qrResolveTipOnTable,
      ];

  return (
    <div className="flex flex-col min-h-screen px-6 py-10 pb-8 bg-[var(--primary-background)]">
      <div className="flex flex-col justify-center items-center text-center max-w-md mx-auto flex-1">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <img
            src={iconSrc}
            alt=""
            className="w-[82px] h-auto object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="heading-5 font-700 text-[var(--primary-text)] mb-2">
          {title}
        </h1>

        {/* Description */}
        <p className="extra-small-font font-400 text-[var(--secondary-text)] mb-6">
          {description}
        </p>

        {/* Tips box - light orange/peach with border (match design) */}
        <div className="w-full rounded-xl px-4 py-4 mb-8 text-left border border-[var(--accent-color)] bg-[var(--order-type-badge-bg)]">
          <p className="heading-6 font-700 text-[var(--primary-text)] mb-3">
            {tipsTitle}
          </p>
          <ul className="list-none space-y-2 pl-0 m-0">
            {tips.map((tip, i) => (
              <li
                key={i}
                className="heading-6 font-400 text-[var(--primary-text)] flex items-start gap-2"
              >
                <span className="text-[var(--primary-text)] mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Try Scanning Again - sticky at bottom */}
      <div className="fixed bottom-6 left-4 right-4 pt-4">
        <CustomButton
          onClick={onRetry}
          disabled={isRetrying}
          className="font-700 !py-3.5 !w-full heading-4 hover:!opacity-90 border-0"
        >
          {isRetrying ? lang.loading : lang.qrResolveTryScanningAgain}
        </CustomButton>
      </div>
    </div>
  );
}
