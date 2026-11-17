'use client';

import React from 'react';
import { cn } from '@lib/utils'; // utility for combining classNames

type QuantitySelectorProps = {
  quantity: number;
  setQuantity: (value: number) => void;
  disabled?: boolean;
  showBorder?: boolean;
  mainContainerClassName?: string;
  buttonClassName?: string;
  displayClassName?: string;
};

const QuantitySelector = ({
  quantity,
  setQuantity,
  disabled = false,
  showBorder = true,
  mainContainerClassName,
  buttonClassName,
  displayClassName,
}: QuantitySelectorProps) => {
  const handleDecrease = () => {
    if (quantity > 1 && !disabled) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (!disabled) {
      setQuantity(quantity + 1);
    }
  };

  const baseButtonStyle =
    'w-7 h-7 md:w-[34px] md:h-[34px] rounded-full text-xl font-normal flex items-center justify-center transition-all';
  const borderStyle = showBorder ? 'border border-[var(--border-primary)]' : '';
  const defaultBg = 'bg-transparent';
  const defaultText = 'text-[var(--primary-text)]';
  const hoverStyle = 'hover:bg-[var(--tertiary-button-hover-bg)] hover:text-[var(--button-secondary-text)]';

  const disabledStyle = 'cursor-not-allowed opacity-30';

  return (
    <div className={cn('flex items-center gap-4 md:gap-6', mainContainerClassName)}>
      <button
        onClick={handleDecrease}
        disabled={quantity === 1 || disabled}
        className={cn(
          baseButtonStyle,
          borderStyle,
          defaultBg,
          defaultText,
          hoverStyle,
          quantity === 1 || disabled ? disabledStyle : 'cursor-pointer',
          buttonClassName
        )}
      >
        −
      </button>
      <span
        className={cn(
          'text-base md:text-2xl font-medium text-[var(--primary-text)]',
          displayClassName
        )}
      >
        {quantity}
      </span>
      <button
        onClick={handleIncrease}
        disabled={disabled}
        className={cn(
          baseButtonStyle,
          borderStyle,
          defaultBg,
          defaultText,
          hoverStyle,
          disabled ? disabledStyle : 'cursor-pointer',
          buttonClassName
        )}
      >
        +
      </button>
    </div>
  );
};

export default QuantitySelector;
