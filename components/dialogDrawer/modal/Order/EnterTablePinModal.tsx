"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import CustomButton from "@components/buttons/Button";
import Icon from "@components/image/Icons";
import { CROSS_ICON } from "@config/Header/image.config";
import useLang from "@hooks/useLang";
import { LanguageCode, TranslationKeys } from "types";

const PIN_LENGTH = 4;

interface EnterTablePinModalProps {
  onClose: () => void;
  tableNumber: string;
  onProceed: (pin: string) => void;
}

const EnterTablePinModal: React.FC<EnterTablePinModalProps> = ({
  onClose,
  tableNumber,
  onProceed,
}) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const prevCompleteRef = useRef(false);

  const focusInput = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
  }, []);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      const chars = value.replace(/\D/g, "").slice(0, PIN_LENGTH).split("");
      const newDigits = [...digits];
      chars.forEach((char, i) => {
        if (index + i < PIN_LENGTH) newDigits[index + i] = char;
      });
      setDigits(newDigits);
      const nextIndex = Math.min(index + chars.length, PIN_LENGTH - 1);
      focusInput(nextIndex);
      return;
    }
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    if (digit && index < PIN_LENGTH - 1) focusInput(index + 1);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      focusInput(index - 1);
      const newDigits = [...digits];
      newDigits[index - 1] = "";
      setDigits(newDigits);
    }
  };

  const pinValue = digits.join("");
  const canProceed = pinValue.length === PIN_LENGTH;

  useEffect(() => {
    const isComplete = canProceed;
    const wasComplete = prevCompleteRef.current;
    prevCompleteRef.current = isComplete;
    if (isComplete && !wasComplete) {
      onProceed(pinValue);
    }
  }, [digits, canProceed, pinValue, onProceed]);

  const handleSubmit = () => {
    if (!canProceed) return;
    onProceed(pinValue);
  };

  return (
    <div className="enter-table-pin-modal">
      <div className="enter-table-pin-header">
        <span className="enter-table-pin-badge">
          {lang.tableNo}: {tableNumber}
        </span>
        <button
          type="button"
          className="enter-table-pin-close"
          onClick={onClose}
          aria-label="Close"
        >
          <Icon
            icon={`${CROSS_ICON}#cross`}
            width={24}
            height={24}
            color="var(--primary-text)"
            viewBox="0 0 22 22"
          />
        </button>
      </div>
      <h2 className="enter-table-pin-title">
        {lang.order?.enterTablePinTitle ?? "Enter the table pin"}
      </h2>
      <p className="enter-table-pin-description">
        {lang.order?.enterTablePinDescription ?? "Please ask your group member for pin"}
      </p>
      <div className="enter-table-pin-inputs">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={PIN_LENGTH}
            autoComplete="one-time-code"
            className="enter-table-pin-input"
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>
      <CustomButton
        className="!w-full font-700 !py-4"
        onClick={handleSubmit}
        disabled={!canProceed}
      >
        {lang.order?.proceed ?? "Proceed"}
      </CustomButton>

      <style>{`
        .enter-table-pin-modal {
          width: 100%;
          padding: 30px 16px 24px;
          background-color: var(--cards-containers);
          border-radius: 10px;
        }
        .enter-table-pin-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
          gap: 10px;
        }
        .enter-table-pin-badge {
          display: inline-block;
          padding: 10px 12px;
          background-color: var(--error);
          color: var(--white);
          font-size: var(--small-font);
          font-weight: var(--font-bold);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-radius: 8px;
        }
        .enter-table-pin-close {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .enter-table-pin-title {
          font-size: var(--heading-h2);
          font-weight: var(--font-medium);
          color: var(--primary-text);
          margin: 0 0 4px 0;
        }
        .enter-table-pin-description {
          font-size: var(--description-font);
          font-weight: var(--font-regular);
          color: var(--primary-text);
          margin: 0 0 24px 0;
        }
        .enter-table-pin-inputs {
          display: flex;
          gap: 10px;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .enter-table-pin-input {
          width: 70px;
          height: 55px;
          text-align: center;
          font-size: 24px;
          font-weight: var(--font-regular);
          border: 1px solid var(--borders-dividers);
          border-radius: 8px;
          color: var(--primary-text);
        }
        .enter-table-pin-input:focus {
          outline: none;
          border-color: var(--accent-color);
          box-shadow: 0 0 0 2px rgba(var(--accent-color-rgb, 229, 57, 53), 0.2);
        }
        .enter-table-pin-proceed {
          width: 100% !important;
          font-size: var(--heading-h5);
          font-weight: var(--font-bold);
          padding: 14px 20px;
          background: var(--button-primary-background) !important;
          color: var(--primary-text-light) !important;
          border: none;
          border-radius: 12px;
        }
        .enter-table-pin-proceed:hover:not(:disabled) {
          opacity: 0.95;
        }
      `}</style>
    </div>
  );
};

export default EnterTablePinModal;
