import React, { useState, useEffect } from 'react';

interface PaymentOption {
  nameAtCheckout?: string;
  value?: string;
  label?: string;
  method?: string;
  isActive?: boolean;
}

interface PaymentMethodSelectorProps {
  paymentOptions: PaymentOption[];
  setPaymentMethods: (paymentMethods: string) => void;
  setIsActive: (isActive: boolean) => void;
}

const PaymentMethodSelector = ({ paymentOptions, setPaymentMethods, setIsActive }: PaymentMethodSelectorProps) => {
  const [selected, setSelected] = useState<string>('');

  // Helper function to get the display name and value from payment option
  const getPaymentInfo = (option: PaymentOption) => {
    const displayName = option.nameAtCheckout || '';
    const value = option.method || '';
    return { displayName, value };
  };

  useEffect(() => {
    // Filter active payment methods
    const activePayments = paymentOptions.filter(option => option.isActive);
    
    if (activePayments.length > 0) {
      // Set the first active payment method as default
      const { value } = getPaymentInfo(activePayments[0]);
      setSelected(value);
      setPaymentMethods(activePayments[0].method || '');
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [paymentOptions]);

  const handlePaymentMethodChange = (paymentMethod: string, isActive: boolean) => {
    if (isActive) {
      setSelected(paymentMethod);
      setPaymentMethods(paymentMethod);
      setIsActive(true);
    }
  };

  // Filter active payment methods
  const activePaymentOptions = paymentOptions.filter(option => option.isActive);

  // If no active payment methods, don't render anything
  if (activePaymentOptions.length === 0) {
    return null;
  }

  return (
    <div className="payment-method-selector border rounded-lg p-4 bg-white">
      <h3 className="payment-method-label font-semibold mb-4">Choose payment method</h3>
      <div className="space-y-3">
        {activePaymentOptions.map((option: PaymentOption, index: number) => {
          const { displayName, value } = getPaymentInfo(option);
          return (
            <label
              key={value || index}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="radio"
                name="payment"
                value={value}
                checked={selected === value}
                onChange={() => handlePaymentMethodChange(value, option?.isActive || false)}
                className="peer hidden"
              />
              <span className={`h-5 w-5 rounded-full border-2 flex items-center justify-center 
                ${selected === value ? 'border-yellow-500' : 'border-gray-400'}`}>
                {selected === value && (
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                )}
              </span>
              <span className="payment-description-label">{displayName}</span>
            </label>
          );
        })}
      </div>
      <style>{`
        .payment-method-selector {
            width: 100%;
            background-color: var(--cards-containers);
            border-radius: 8px;
            border: 1px solid var(--borders-dividers);
            margin-bottom: 20px;
        }
        .payment-method-label {
            color: var(--primary-text);
            font-size: var(--heading-h4);
            font-weight: var(--font-bold);
        }
        .payment-description-label {
            color: var(--primary-text);
            font-size: var(--description-font);
            font-weight: var(--font-regular);
        }
      `}</style>
    </div>
  );
};

export default PaymentMethodSelector;