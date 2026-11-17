import { useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import { validatePhone } from '@services/authService';

interface ValidatePhonePayload {
  phone: string;
  countryCode: string;
  phoneIsoCode: string;
  email: string;
}

interface UsePhoneValidationProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  debounceDelay?: number;
}

export const usePhoneValidation = ({
  onSuccess,
  onError,
  debounceDelay = 300, // Reduced delay for faster response
}: UsePhoneValidationProps) => {
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced API call for phone validation
  const debouncedValidatePhone = useCallback(
    debounce(async (payload: ValidatePhonePayload) => {
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        const res = await validatePhone(payload);
        if (res.data) {
          onSuccess('Phone number validated successfully');
        }
      } catch (error: any) {
        // Don't show error if request was aborted
        if (error.name === 'AbortError') {
          return;
        }
        onError(error?.response?.data?.message || 'Failed to validate phone number');
      }
    }, debounceDelay),
    [onSuccess, onError, debounceDelay]
  );

  const validatePhoneNumber = useCallback(
    (phoneNumber: string, dialCode: string, phoneIsoCode: string, email: string, isValid: boolean) => {
      // If phone number is invalid, show error and don't call API
      if (!isValid) {
        onError('Invalid phone number format');
        return;
      }

      // Extract phone without dial code
      const phoneWithoutDialCode = phoneNumber.replace(`+${dialCode}`, '').replace(dialCode, '');

      // If phone number is empty or only dial code, don't call API
      if (!phoneWithoutDialCode || phoneWithoutDialCode.length === 0) {
        return;
      }

      const payload: ValidatePhonePayload = {
        phone: phoneWithoutDialCode,
        countryCode: `+${dialCode}`,
        phoneIsoCode: phoneIsoCode.toUpperCase(),
        email,
      };

      // Call API directly since validation passed
      debouncedValidatePhone(payload);
    },
    [debouncedValidatePhone, onError]
  );

  // Cleanup function
  const cancelValidation = useCallback(() => {
    debouncedValidatePhone.cancel();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, [debouncedValidatePhone]);

  return {
    validatePhoneNumber,
    cancelValidation,
  };
};

