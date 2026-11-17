import React, { useState, useEffect } from 'react';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import { isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import tenantConfig from '@config/tenant.config';

interface CountryData {
  name: string;
  dialCode: string;
  iso2: string;
  countryCode: string;
}

interface PhoneNumberInputProps {
  setPhoneNumber?: (phoneNumber: string) => void;
  setDialCode?: (dialCode: string) => void;
  phoneNumber?: string;
  defaultCountry?: string;
  preferredCountries?: string[];
  setPhoneIsoCode?: (phoneIsoCode: string) => void;
  setIsPhoneNumberValid?: (isValid: boolean) => void;
  isPhoneNumberValid?: boolean;
  dialCode?: string;
  phoneIsoCode?: string;
  onBlur?: () => void;
  onCountryChange?: (countryCode: string) => void;
  onPhoneChange?: (phoneNumber: string, dialCode: string, phoneIsoCode: string, isValid: boolean) => void;
  /** Called when a key is pressed (e.g. Enter to submit / trigger Get OTP) */
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const PhoneNumberInput = ({
  setPhoneNumber,
  setDialCode,
  phoneNumber = '',
  defaultCountry = tenantConfig.supportPhoneIso?.toLowerCase() || 'us',
  preferredCountries,
  setPhoneIsoCode,
  setIsPhoneNumberValid,
  dialCode,
  onCountryChange,
  onPhoneChange,
  onKeyDown: onKeyDownProp,
}: PhoneNumberInputProps) => {
  const [localNumber, setLocalNumber] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [previousCountry, setPreviousCountry] = useState(defaultCountry);

  // Initialize from props only once
  useEffect(() => {
    if (!initialized && phoneNumber && dialCode) {
      const cleanDial = dialCode.startsWith('+') ? dialCode.slice(1) : dialCode;
      const cleanPhone = phoneNumber.replace(/\D/g, '');

      let localPart = '';
      if (cleanPhone.startsWith(cleanDial)) {
        localPart = cleanPhone.slice(cleanDial.length);
      } else if (phoneNumber.startsWith('+')) {
        const withoutPlus = phoneNumber.slice(1);
        const cleanWithoutPlus = withoutPlus.replace(/\D/g, '');
        if (cleanWithoutPlus.startsWith(cleanDial)) {
          localPart = cleanWithoutPlus.slice(cleanDial.length);
        }
      } else {
        localPart = cleanPhone;
      }

      setLocalNumber(localPart);
      setInitialized(true);
    }
  }, [phoneNumber, dialCode, initialized]);

  // Validate using libphonenumber-js
  const validatePhoneNumber = (fullPhone: string, countryCode: string): boolean => {
    if (!fullPhone || fullPhone.length === 0) {
      return false;
    }

    try {
      return isValidPhoneNumber(fullPhone, countryCode.toUpperCase() as CountryCode);
    } catch {
      return false;
    }
  };

  const handlePhoneChange = (value: string, countryData: CountryData) => {
    const cleanValue = value.replace(/\D/g, '');
    const cleanDialCode = countryData.dialCode.replace(/\D/g, '');

    let localPart = '';
    if (cleanValue.startsWith(cleanDialCode)) {
      localPart = cleanValue.slice(cleanDialCode.length);
    } else {
      localPart = cleanValue;
    }

    const fullPhone = `+${countryData.dialCode}${localPart}`;

    // Validate using library
    const validationResult = validatePhoneNumber(fullPhone, countryData.countryCode);

    setLocalNumber(localPart);
    setSelectedCountry(countryData.countryCode);
    setIsValid(validationResult);
    
    // Update parent component state
    setPhoneNumber?.(fullPhone);
    setDialCode?.(countryData.dialCode);
    setPhoneIsoCode?.(countryData.countryCode);
    setIsPhoneNumberValid?.(validationResult);

    // Check if country changed
    if (previousCountry !== countryData.countryCode) {
      setPreviousCountry(countryData.countryCode);
      setTouched(false);
      setIsPhoneNumberValid?.(false);
      onCountryChange?.(countryData.countryCode);
    }

    // Mark as touched when user types
    if (!touched) {
      setTouched(true);
    }

    // Call parent's onPhoneChange if provided
    if (onPhoneChange) {
      onPhoneChange(fullPhone, countryData.dialCode, countryData.countryCode, validationResult);
    }
  };

  // const handleBlur = () => {
  //   setTouched(true);

  //   if (!localNumber || localNumber.length === 0) {
  //     setIsPhoneNumberValid?.(false);
  //     onBlur?.();
  //     return;
  //   }

  //   // Validate using libphonenumber-js
  //   const fullPhone = `+${dialCode}${localNumber}`;
  //   const validationResult = validatePhoneNumber(fullPhone, selectedCountry);
  //   setIsPhoneNumberValid?.(validationResult);
    
  //   onBlur?.();
  // };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab', 'Enter'];
    if (!/^[0-9]$/.test(e.key) && !allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
    if (e.key === 'Enter') {
      onKeyDownProp?.(e);
    }
  };

  const getDisplayValue = () => {
    if (!initialized) {
      return '';
    }

    if (dialCode) {
      const cleanDial = dialCode.startsWith('+') ? dialCode.slice(1) : dialCode;
      return cleanDial + localNumber;
    }

    return localNumber;
  };

  const shouldShowError = touched && localNumber.length > 0 && !isValid;

  return (
    <div className="phone-input-wrapper">
      <PhoneInput
        country={selectedCountry}
        preferredCountries={preferredCountries}
        value={getDisplayValue()}
        onChange={handlePhoneChange}
        // onBlur={handleBlur}
        inputProps={{
          onKeyDown: handleKeyDown,
          name: 'phone',
          id: 'phone',
          placeholder: '123 456 7890',
        }}
        inputClass={`phone-input-field ${shouldShowError ? 'input-error' : ''}`}
        enableSearch={true}
        searchPlaceholder="Search country..."
        countryCodeEditable={false}
      />
      {shouldShowError && (
        <span className="error-text">Invalid phone number format</span>
      )}
      <style>{`
        .phone-input-wrapper {
          margin-top: 4px;
          position: relative;
        }

        .custom-phone-container {
          width: 100%;
        }

        .phone-input-field {
          width: 100%;
          height: 44px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: var(--small-font);
          padding-left: 48px;
        }

        .input-error {
          border-color: red !important;
        }

        .react-tel-input .country-list .country.highlight {
          background-color: var(--cards-containers) !important;
        }

        .error-text {
          color: red;
          font-size: var(--extraSmall-font);
          margin-top: 4px;
          display: block;
        }

        .react-tel-input .country-list .divider {
          border-bottom: 1px solid var(--rating-border-primary) !important;
        }

        .intl-tel-input .selected-flag {
          height: 44px;
          border-radius: 6px 0 0 6px;
          background: var(--cards-containers) !important;
        }

        .intl-tel-input .flag-container .arrow {
          top: 12px !important;
          font-size: 8px !important;
        }

        .intl-tel-input .flag-container {
          padding-left: 8px;
        }

        .intl-tel-input .selected-flag .iti-flag {
          top: 12px !important;
          background-color: var(--cards-containers) !important;
        }

        .react-tel-input .flag-dropdown.open .selected-flag {
          border: 1px solid var(--borders-dividers) !important;
          background: var(--tertiary-background) !important;
        }

        .react-tel-input .selected-flag:hover, .react-tel-input .selected-flag:focus{
          background: var(--tertiary-background) !important;
        }
        

        .react-tel-input .country-list .country:hover {
          color: var(--black) !important;
        }

        .react-tel-input .flag-dropdown {
          border: 1px solid var(--borders-dividers) !important;
          background-color: var(--cards-containers) !important;
        }

        .iti-mobile .intl-tel-input.iti-container {
          z-index: 2000 !important;
        }

        .react-tel-input .form-control {
          width: 100% !important;
          padding: 20px 20px 20px 45px !important;
          border-radius: 8px !important;
          border: 1px solid var(--borders-dividers) !important;
          background-color: var(--cards-containers) !important;
        }

        .react-tel-input .country-list {
          position: fixed !important;
          width: 450px !important;
          overflow-x: hidden;
          padding: 0px 10px !important;
          background-color: var(--cards-containers) !important;
        }

        .react-tel-input .search-box {
          margin: 0;
          padding: 10px;
          border: none;
          border-bottom: 1px solid #ccc;
          font-size: var(--small-font);
          width: 100%;
          outline: none;
        }

        .react-tel-input .search-box:focus {
          border-color: #007bff;
        }

        .react-tel-input .country-list .search-emoji {
          display: none;
        }

        .react-tel-input .country-list .search-box {
          margin-left: 0px !important;
          border: 1px solid var(--borders-dividers) !important;
        }

        .react-tel-input .country-list .search {
          padding: 10px 0px !important;
          background-color: var(--cards-containers) !important;
        }

        @media (max-width: 768px) {
          .react-tel-input .country-list {
            width: 300px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PhoneNumberInput;
