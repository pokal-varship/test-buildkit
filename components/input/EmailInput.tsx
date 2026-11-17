"use client";

import React, { useState } from "react";
import { validateEmail } from "@components/validation";
import useLang from "@hooks/useLang";
import { LanguageCode, TranslationKeys } from "types";

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  showErrorOnMount?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

const EmailInput: React.FC<EmailInputProps> = ({
  value,
  onChange,
  placeholder,
  label,
  required = false,
  onKeyDown,
  className = "",
  showErrorOnMount = false,
  onValidationChange,
}) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const [emailTouched, setEmailTouched] = useState(showErrorOnMount);
  const isEmailValid = validateEmail(value);

  // Notify parent component of validation state changes
  React.useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isEmailValid);
    }
  }, [isEmailValid, onValidationChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/^\s+/, "");
    onChange(newValue);
    setEmailTouched(true);
  };

  const handleBlur = () => {
    setEmailTouched(true);
  };

  const showError = emailTouched && !isEmailValid && value;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="label-text">
          {label}
          {required && "*"}
        </label>
      )}
      <input
        type="email"
        placeholder={placeholder || lang.emailAddressPlaceholderText}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
        className={showError ? "input-error" : ""}
      />
      {showError && (
        <span className="error-message">{lang.pleaseEnterValidEmail}</span>
      )}
      <style>{`
        .form-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 12px;
          color: var(--primary-text);
        }

        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--borders-dividers);
          border-radius: 6px;
          background-color: var(--cards-containers);
          color: var(--primary-text);
          transition: border-color 0.2s ease;
        }

        .form-group input:focus-visible {
          border: 1px solid var(--borders-dividers);
          outline: none;
        }

        .form-group input.input-error {
          border: 1px solid #ef4444;
        }

        .form-group input.input-error:focus-visible {
          border: 1px solid #ef4444;
          outline: none;
        }

        .error-message {
          display: block;
          color: #ef4444;
          font-size: var(--small-font);
          margin-top: 4px;
          font-weight: var(--font-regular);
        }

        .label-text {
          font-size: var(--small-font);
          font-weight: var(--font-regular);
          color: var(--secondary-text);
          margin-bottom: 5px;
        }
      `}</style>
    </div>
  );
};

export default EmailInput;

