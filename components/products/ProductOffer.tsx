'use client';
import React from 'react';
import formatCurrency from '@lib/helper/price';
import { DiscountOffer } from '@services/typesense/types';
import { useLanguage } from 'context/LanguageContext';
import useLang from '@hooks/useLang';
import { getTenantConfig } from '@config/tenant.config';

interface OfferHelpers {
  offerText: () => string | undefined;
  offerTextVariant: () => string | undefined;
  offerTextVariantElem: () => React.ReactNode;
  offerTextElem: () => React.ReactNode;
}

interface UseProductOfferOptions {
  productPriceClassName?: string;
  scratchPriceClassName?: string;
}

export const useProductOffer = (
  bestOffer: DiscountOffer | null,
  variantsBestOffer: DiscountOffer | null,
  basePrice: number,
  discountedPrice: number,
  basePriceFormat: string,
  options?: UseProductOfferOptions
): OfferHelpers => {
  const { selectedLang } = useLanguage();
  const language = selectedLang.code.toLowerCase();
  const [lang] = useLang();
  const productPriceClassName = options?.productPriceClassName || 'product-price';
  const scratchPriceClassName = options?.scratchPriceClassName || 'scratch-price';
  const { showStrikethroughPrice } = getTenantConfig();

  const renderScratchPrice = (price: string) =>
    showStrikethroughPrice ? (
      <span className={`${scratchPriceClassName} text-[var(--secondary-text)] line-through mr-1`}>{price}</span>
    ) : null;
  const offerText = (): string | undefined => {
    if (bestOffer?.offerType === 1 && discountedPrice >= bestOffer?.discountConfig?.minimumSpendValue) {
      return `+ ${lang.bogo}`;
    } else if (bestOffer?.offerType === 2) {
      const discountType = bestOffer?.discountConfig?.type || undefined;
      const discountValue = bestOffer?.discountConfig?.value;
      const offerName = bestOffer?.offerName?.[language] || bestOffer?.offerName?.en;
      if (discountType && discountValue && discountType === 1) {
        return `+ ${discountValue}% ${lang.off}`;
      } else if (discountType && discountValue && discountType === 2) {
        return `+ ${formatCurrency({ amount: Number(discountValue) })} ${lang.off} ` || offerName;
      }
    }
    else if (bestOffer?.offerType === 3) {
      const discountType = bestOffer?.discountConfig?.discountType || undefined;
      const discountValue = bestOffer?.discountConfig?.discountValue;
      if (discountType && discountValue && discountType === 1) {
        return `+ ${discountValue}% ${lang.off}`;
      } else if (discountType && discountValue && discountType === 2) {
        return `+ ${formatCurrency({ amount: Number(discountValue) })} ${lang.off}`;
      }
    } else if (bestOffer?.offerType === 5 && discountedPrice >= bestOffer?.discountConfig?.minimumSpendValue) {
      return `+ ${lang.freeItem}`;
    }
  };

  const offerTextVariant = (): string | undefined => {
    if (variantsBestOffer?.offerType === 1 && discountedPrice >= variantsBestOffer?.discountConfig?.minimumSpendValue) {
      return `+ ${lang.bogo}`;
    } else if (variantsBestOffer?.offerType === 2) {
      const discountType = variantsBestOffer?.discountConfig?.type || undefined;
      const discountValue = variantsBestOffer?.discountConfig?.value;
      if (discountType && discountValue && discountType === 1) {
        return `+ ${discountValue}% ${lang.off}`;
      } else if (discountType && discountValue && discountType === 2) {
        return `+ ${formatCurrency({ amount: Number(discountValue) })} ${lang.off}`;
      }
    } else if (variantsBestOffer?.offerType === 3) {
      const discountType = variantsBestOffer?.discountConfig?.discountType || undefined;
      const discountValue = variantsBestOffer?.discountConfig?.discountValue;
      if (discountType && discountValue && discountType === 1) {
        return `+ ${discountValue}% ${lang.off}`;
      } else if (discountType && discountValue && discountType === 2) {
        return `+ ${formatCurrency({ amount: Number(discountValue) })} ${lang.off}`;
      }
    } else if (variantsBestOffer?.offerType === 5 && discountedPrice >= variantsBestOffer?.discountConfig?.minimumSpendValue) {
      return `+ ${lang.freeItem}`;
    }
  };

  const offerTextVariantElem = (): React.ReactNode => {
    if (variantsBestOffer?.offerType === 1) {
      return <>
        <span className={productPriceClassName}>{basePriceFormat}</span>
        {!!(+basePriceFormat >= variantsBestOffer?.discountConfig?.minimumSpendValue) && <span className='ml-1 bg-[var(--success-opacity)] text-[10px] extra-small-font md-heading-6 text-[var(--success)] rounded-[3px] md:rounded-[5px] p-[3px] md:px-2 md:py-1 whitespace-nowrap font-600'>
          + {lang.bogo}
        </span>}
      </>
    } else if (variantsBestOffer?.offerType === 2) {
      const discountType = variantsBestOffer?.discountConfig?.type || undefined;
      const discountValue = variantsBestOffer?.discountConfig?.value;
      if (discountType && discountValue && discountType === 1) {
        return <>
          {renderScratchPrice(basePriceFormat)}
          <span className={productPriceClassName}>
            {formatCurrency({ amount: basePrice - ((basePrice * Number(discountValue) / 100)) })}
          </span>
        </>;
      } else if (discountType && discountValue && discountType === 2) {
        return <>
          {renderScratchPrice(basePriceFormat)}
          <span className={productPriceClassName}>
            {formatCurrency({ amount: basePrice - discountValue })}
          </span>
        </>;
      }
    }
    else if (variantsBestOffer?.offerType === 3) {
      const discountType = variantsBestOffer?.discountConfig?.discountType || undefined;
      const discountValue = variantsBestOffer?.discountConfig?.discountValue;
      if (discountType && discountValue && discountType === 1) {
        return <>
          {renderScratchPrice(basePriceFormat)}
          <span className={productPriceClassName}>
            {formatCurrency({ amount: basePrice - ((basePrice * Number(discountValue) / 100)) })}
          </span>
        </>;
      } else if (discountType && discountValue && discountType === 2) {
        return <>
          {renderScratchPrice(basePriceFormat)}
          <span className={productPriceClassName}>
            {formatCurrency({ amount: basePrice - discountValue })}
          </span>
        </>;
      }
    } else if (variantsBestOffer?.offerType === 5) {
      return <>
        <span className={productPriceClassName}>{basePriceFormat}</span>
        {!!(+basePriceFormat >= variantsBestOffer?.discountConfig?.minimumSpendValue) && <span className='ml-1 bg-[var(--success-opacity)] text-[10px] extra-small-font md-heading-6 text-[var(--success)] rounded-[3px] md:rounded-[5px] p-[3px] md:px-2 md:py-1 whitespace-nowrap font-600'>
          + {lang.freeItem}
        </span>}
      </>
    }
  };

  const offerTextElem = (): React.ReactNode => {
    if (bestOffer?.offerType === 1) {
      return <>
        <span className={productPriceClassName}>{basePriceFormat}</span>
        {!!(+basePriceFormat >= bestOffer?.discountConfig?.minimumSpendValue) && <span className='ml-1 bg-[var(--success-opacity)] text-[10px] extra-small-font md-heading-6 text-[var(--success)] rounded-[3px] md:rounded-[5px] p-[3px] md:px-2 md:py-1 whitespace-nowrap font-600'>
          + {lang.bogo}
        </span>}
      </>
    } else if (bestOffer?.offerType === 2) {
      const discountType = bestOffer?.discountConfig?.type || undefined;
      const discountValue = bestOffer?.discountConfig?.value;
      const offerName = bestOffer?.offerName?.[language] || bestOffer?.offerName?.en;
      if (discountType && discountValue && discountType === 1) {
        return <>
          {renderScratchPrice(basePriceFormat)}
          <span className={productPriceClassName}>
            {formatCurrency({ amount: basePrice - ((basePrice * Number(discountValue) / 100)) })}
          </span>
        </>;
      } else if (discountType && discountValue && discountType === 2) {
        return <>
          {renderScratchPrice(basePriceFormat)}
          <span className={productPriceClassName}>
            {formatCurrency({ amount: basePrice - discountValue })}
          </span>
          <span className='ml-1 bg-[var(--success-opacity)] text-[10px] extra-small-font md-heading-6 text-[var(--success)] rounded-[3px] md:rounded-[5px] p-[3px] md:px-2 md:py-1 whitespace-nowrap font-600'>
            {offerName}
          </span>
        </>;
      }
    } else if (bestOffer?.offerType === 3) {
      const discountType = bestOffer?.discountConfig?.discountType || undefined;
      const discountValue = bestOffer?.discountConfig?.discountValue;
      if (discountType && discountValue && discountType === 1) {
        return <>
          {renderScratchPrice(basePriceFormat)}
          <span className={productPriceClassName}>
            {formatCurrency({ amount: basePrice - ((basePrice * Number(discountValue) / 100)) })}
          </span>
        </>;
      } else if (discountType && discountValue && discountType === 2) {
        return <>
          {renderScratchPrice(basePriceFormat)}
          <span className={productPriceClassName}>
            {formatCurrency({ amount: basePrice - discountValue })}
          </span>
        </>;
      }
    } else if (bestOffer?.offerType === 5) {
      return <>
        <span className={productPriceClassName}>{basePriceFormat}</span>
        {!!(+basePriceFormat >= bestOffer?.discountConfig?.minimumSpendValue) && <span className='ml-1 bg-[var(--success-opacity)] text-[10px] extra-small-font md-heading-6 text-[var(--success)] rounded-[3px] md:rounded-[5px] p-[3px] md:px-2 md:py-1 whitespace-nowrap font-600'>
          + {lang.freeItem}
        </span>}
      </>
    }
  };

  return {
    offerText,
    offerTextVariant,
    offerTextVariantElem,
    offerTextElem,
  };
};

