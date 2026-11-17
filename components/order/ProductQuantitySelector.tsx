'use client';

import React, { useRef } from 'react';
import { cn } from '@lib/utils';
import { close_dialog, open_dialog } from '@lib/modalHandler';
import { LanguageCode, TranslationKeys } from 'types';
import useLang from '@hooks/useLang';
import { CartItem } from './order.type';
import { useRouter } from 'next/navigation';
import useProductUrl from '@hooks/useProductUrl';
import Loader from '@components/loader/Loader';
import { MINUS_ICON, PLUS_ICON } from '@config/Header/image.config';
import Icon from '@components/image/Icons';

type ProductQuantitySelectorProps = {
  quantity: number;
  disabled?: boolean;
  loading?: boolean; // Show loader in place of quantity when true (e.g. during API update)
  showBorder?: boolean;
  min?: number;
  max?: number;
  mainContainerClassName?: string;
  buttonClassName?: string;
  increaseButtonClassName?: string; // Custom class for increase button only
  buttonTextClassName?: string; // Custom class for increase button text only
  decreaseButtonClassName?: string; // Custom class for decrease button only
  displayClassName?: string;
  textSizeClassName?: string;
  buttonSizeClassName?: string;
  handleAddQuantity?: (customType: string, itemId: string, specialInstructions?: string) => void;
  handleDecreaseQuantity?: (customType: string, itemId: string) => void;
  itemId?: string;
  error?: string;
  description?: string;
  item?: CartItem;
  isPDP?: boolean;
  getModifierItems?: () => string[];
  offerType?: string;
  allowRemoveWhenOne?: boolean; // Allow decrease button when quantity is 1 (for remove dialogs)
  noButtonBackground?: boolean; // Remove background color from buttons
  borderColor?: string; // Custom border color (e.g., 'var(--blackz0)')
  decreaseButtonTextClassName?: string; // Custom class for decrease button text only
  padQuantity?: boolean; // Show quantity as 01, 02, 03 (default: true). Set false for 1, 2, 3
};

const ProductQuantitySelector = ({
  item,
  quantity,
  disabled = false,
  loading = false,
  showBorder = true,
  min = 1,
  max,
  mainContainerClassName,
  buttonClassName,
  increaseButtonClassName,
  buttonTextClassName,
  decreaseButtonClassName,
  displayClassName,
  textSizeClassName = 'text-sm md:text-base',
  buttonSizeClassName = 'w-7 h-7 md:w-[25px] md:h-[25px]',
  handleAddQuantity,
  handleDecreaseQuantity,
  itemId,
  error,
  description,
  isPDP = false,
  getModifierItems,
  offerType,
  allowRemoveWhenOne = false,
  noButtonBackground = false,
  borderColor,
  decreaseButtonTextClassName,
  padQuantity = true
}: ProductQuantitySelectorProps) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const router = useRouter();
  const { getOrderProductUrl, storeSlug, menuSlug } = useProductUrl();
  // Debounce implementation: batches rapid clicks to reduce API calls
  // Note: Optimistic updates happen immediately in useQuantityControls,
  // and sequence tracking ensures stale responses don't cause UI flicker
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleAddRepeat = () => {
    const hasModifiers = getModifierItems && getModifierItems().length > 0;
    const hasVariants = item?.variantId && Object.keys(item.variantAttributes || {}).length > 0;

    // If isPDP is true and we have a custom handleAddQuantity, always use it
    // The custom handler will decide whether to show dialog or increase directly
    if (isPDP && handleAddQuantity) {
      // Let the custom handler decide whether to show dialog or increase directly
      handleAddQuantity("ADD_QUANTITY", itemId as string, item?.specialInstructions);
      return; // Important: return early to prevent handleIncrease from being called
    } else if (!isPDP && (hasModifiers || hasVariants)) {
      open_dialog("customizationRepeat", {
        open: true,
        propsData: {
          title: lang.repeatTitle,
          description: description,
          mobileTitle: (
            <>
              {lang.repeatLast}
              <br />
              {lang.usedCustomization}
            </>
          ),
          yesButtonText: lang.repeatYes,
          noButtonText: lang.repeatNo,
          price: item?.totalBasePrice,
          discountedPrice: item?.totalBasePriceAfterBaseDiscount,
          onYes: () => {
            handleIncrease();
          },
          onNo: () => {
            if(item?.productId) {
              router.push(getOrderProductUrl(
                item.productSlug,
                item?.productCategorySlug,
                menuSlug || "all-day",
                storeSlug,
                { rfcEdit: "true", fromQuantityIncrease: "true" }
              ));
              close_dialog(["customizationRepeat"]);
            }
          }
        },
        type: "customizationRepeat",
        handlerDialog: () => { },
        handleClose: () => {
          close_dialog(["customizationRepeat"]);
        },
        anchor: 'bottom',
        onlyDialog: false,
        sxStyle: {
          '& .MuiPaper-root': {
            '@media (max-width: 768px)': {
              padding: '20px 16px',
            },
            // Desktop only: small card at bottom center; mobile: full-width drawer from bottom
            '@media (min-width: 768px)': {
              position: 'fixed',
              bottom: '50px',
              left: '50%',
              transform: 'translateX(-50%)',
              top: 'auto',
              margin: 0,
              maxWidth: '600px',
              width: '100%',
            },
          },
          '& .MuiDialogContent-root': { padding: '20px 16px' },
        },
      });
    } else {
      handleIncrease();
    }
  }

  const handleDecrease = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (!disabled && !error) {
        // Check if we should allow decrease when quantity is 1
        const canDecrease = allowRemoveWhenOne ? true : quantity > min;
        
        if (canDecrease) {
          // Determine customType based on context:
          // If allowRemoveWhenOne is true (remove dialog) and quantity is 1, use DELETE_ITEM
          // Otherwise use SUBTRACT_QUANTITY
          const customType = (allowRemoveWhenOne && quantity === 1) ? "DELETE_ITEM" : "SUBTRACT_QUANTITY";
          
          // Use custom decrease handler if provided, otherwise use default
          if (handleDecreaseQuantity) {
            handleDecreaseQuantity(customType, itemId as string);
            // Don't close dialog here - let the custom handler manage it
            return;
          } else if (handleAddQuantity) {
            handleAddQuantity(customType, itemId as string);
            close_dialog(["customizationRepeat"]);
          }
        }
      }
    }, 150); // 150ms debounce: balances responsiveness with API call reduction
  }

  const handleIncrease = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (!disabled && (max === undefined || quantity < max) && !error) {
        handleAddQuantity?.("ADD_QUANTITY", itemId as string, item?.specialInstructions);
      }
      close_dialog(["customizationRepeat"]);
    }, 150); // 150ms debounce: balances responsiveness with API call reduction
  }
  // Allow decrease when quantity is 1 if allowRemoveWhenOne is true (for remove dialogs)
  const isDecreaseDisabled = disabled || loading || (!allowRemoveWhenOne && quantity <= min);
  const isIncreaseDisabled = disabled || loading || (max !== undefined && quantity >= max);
  const isFreebieDisabled = offerType === "FREEBIE" && quantity >= 1;

  const baseButtonStyle = cn(
    buttonSizeClassName,
    'rounded-full text-xl font-normal flex items-center justify-center transition-all'
  );
  const borderStyle = showBorder 
    ? (borderColor ? `border border-[var(--black)] !important` : 'border border-[var(--borders-dividers)]')
    : '';
  const defaultBg = noButtonBackground ? '' : 'bg-[var(--button-secondary-background)]';
  const defaultText = 'text-[var(--button-secondary-text)]';
  const hoverStyle = 'hover:bg-[var(--tertiary-button-hover-bg)]';
  const increaseHoverStyle = noButtonBackground ? 'hover:bg-[var(--button-primary-hover-background)]' : 'hover:bg-[var(--tertiary-button-hover-bg)]';
  const disabledStyle = 'cursor-not-allowed opacity-30';

  return (
    <div className={cn('flex items-center gap-4 md:gap-3', mainContainerClassName)}>
      <button
        onClick={handleDecrease}
        disabled={isDecreaseDisabled}
        className={cn(
          baseButtonStyle,
          borderStyle,
          defaultBg,
          defaultText,
          hoverStyle,
          isDecreaseDisabled ? disabledStyle : 'cursor-pointer',
          buttonClassName,
          decreaseButtonTextClassName
        )}
      >
        <Icon
          icon={`${MINUS_ICON}#minus-icon`}
          className={cn(decreaseButtonClassName)}
          // width={25}
          // height={25}
          viewBox="0 0 20 20"
        />
      </button>
      <span
        className={cn(
          'font-medium text-[var(--primary-text)] min-w-[1.5rem] flex items-center justify-center',
          textSizeClassName,
          displayClassName
        )}
      >
        {loading ? <Loader size={20} /> : padQuantity ? String(quantity).padStart(2, '0') : quantity}
      </span>
      <button
        onClick={isFreebieDisabled ? () => { } : handleAddRepeat}
        disabled={isIncreaseDisabled}
        className={cn(
          baseButtonStyle,
          borderStyle,
          defaultBg,
          defaultText,
          increaseHoverStyle,
          isIncreaseDisabled || isFreebieDisabled ? disabledStyle : 'cursor-pointer',
          buttonClassName,
          increaseButtonClassName
        )}
      > 
        <Icon
          icon={`${PLUS_ICON}#plus-icon`}
          className={cn(buttonTextClassName)}
          // width={25}
          // height={25}
          viewBox="0 0 20 20"
        />
      </button>
    </div>
  );
};

export default ProductQuantitySelector;
