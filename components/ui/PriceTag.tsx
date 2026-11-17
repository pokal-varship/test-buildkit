import formatCurrency from '@lib/helper/price';
import { cn } from '@lib/utils';
import React from 'react';
import { DiscountOffer } from '@services/typesense';
import { getTenantConfig } from '@config/tenant.config';

interface PriceTagProps {
    price?: number | string;
    discountedPrice?: number | string;
    discountedPriceClassName?: string;
    priceClassName?: string;
    containerClassName?: string;
    bestOffer?: DiscountOffer;
    /** When true (combo flow variant selection), show "Combo Default" instead of numeric price. */
    showComboDefaultPrice?: boolean;
}

const PriceTag: React.FC<PriceTagProps> = ({ price, discountedPrice, discountedPriceClassName, priceClassName, containerClassName, bestOffer, showComboDefaultPrice }) => {
    const { showStrikethroughPrice } = getTenantConfig();
    const showScratchPrice = showStrikethroughPrice && discountedPrice && discountedPrice !== price;

    /*
    // Temporarily hidden offer/discount badges (keep for later)
    const offerTextVariant = () => {
        if (bestOffer?.offerType === 1 && discountedPrice && +discountedPrice >= bestOffer?.discountConfig?.minimumSpendValue) {
            return "+ BOGO";
        } else if (bestOffer?.offerType === 2) {
            const discountType = bestOffer?.discountConfig?.type || undefined;
            const discountValue = bestOffer?.discountConfig?.value;
            if (discountType && discountValue && discountType === 1) {
                return `+ ${discountValue}% OFF`;
            } else if (discountType && discountValue && discountType === 2) {
                return `+ ${formatCurrency({ amount: Number(discountValue) })} OFF`;
            }
        } else if (bestOffer?.offerType === 3) {
            const discountType = bestOffer?.discountConfig?.discountType || undefined;
            const discountValue = bestOffer?.discountConfig?.discountValue;
            if (discountType && discountValue && discountType === 1) {
                return `+ ${discountValue}% OFF`;
            } else if (discountType && discountValue && discountType === 2) {
                return `+ ${formatCurrency({ amount: Number(discountValue) })} OFF`;
            }
        } else if (bestOffer?.offerType === 5 && discountedPrice && +discountedPrice >= bestOffer?.discountConfig?.minimumSpendValue) {
            return "+ FREE ITEM";
        }
    };

    const offerTextVariantElem = () => {
        if (bestOffer?.offerType === 1 && price) {
            return (
                <>
                    <span className={cn(`text-[var(--primary-text)] md-description-font`, priceClassName)}>{price}</span>
                    {!!(+price >= bestOffer?.discountConfig?.minimumSpendValue) && (
                        <span className='ml-1 bg-[var(--success)] text-[10px] md:text-xs text-[var(--white)] rounded-[3px] md:rounded-[5px] px-1 py-[3px]'>
                            + BOGO
                        </span>
                    )}
                </>
            );
        } else if (bestOffer?.offerType === 2 && price) {
            const discountType = bestOffer?.discountConfig?.type || undefined;
            const discountValue = bestOffer?.discountConfig?.value;
            if (discountType && discountValue && discountType === 1) {
                return (
                    <>
                        <span className={cn(`text-[var(--primary-text)] md-description-font`, priceClassName)}>
                            {formatCurrency({ amount: +price - ((+price * Number(discountValue) / 100)) })}
                        </span>
                        <span className="line-through text-[var(--secondary-text)] small-font">{formatCurrency({ amount: Number(price) })}</span>
                        {!!discountValue && (
                            <span className="ml-2 bg-[var(--success)] text-[11px] text-[var(--white)] rounded-[5px] px-1 py-[2px]">
                                {`${discountValue}% OFF`}
                            </span>
                        )}
                    </>
                );
            } else if (discountType && discountValue && discountType === 2) {
                return (
                    <>
                        <span className={cn(`text-[var(--primary-text)] md-description-font`, priceClassName)}>
                            {formatCurrency({ amount: +price - discountValue })}
                        </span>
                        <span className="line-through text-[var(--secondary-text)] small-font">{formatCurrency({ amount: Number(price) })}</span>
                    </>
                );
            }
        } else if (bestOffer?.offerType === 3 && price) {
            const discountType = bestOffer?.discountConfig?.discountType || undefined;
            const discountValue = bestOffer?.discountConfig?.discountValue;
            if (discountType && discountValue && discountType === 1) {
                return (
                    <>
                        <span className={cn(`text-[var(--primary-text)] md-description-font`, priceClassName)}>
                            {formatCurrency({ amount: +price - ((+price * Number(discountValue) / 100)) })}
                        </span>
                        <span className="line-through text-[var(--secondary-text)] small-font">{formatCurrency({ amount: Number(price) })}</span>
                    </>
                );
            } else if (discountType && discountValue && discountType === 2) {
                return (
                    <>
                        <span className={cn(`text-[var(--primary-text)] md-description-font`, priceClassName)}>
                            {formatCurrency({ amount: +price - discountValue })}
                        </span>
                        <span className="line-through text-[var(--secondary-text)] small-font">{formatCurrency({ amount: Number(price) })}</span>
                    </>
                );
            }
        } else if (bestOffer?.offerType === 5 && price) {
            return (
                <>
                    <span className={cn(`text-[var(--primary-text)] md-description-font`, priceClassName)}>{formatCurrency({ amount: Number(price) })}</span>
                    {!!(+price >= bestOffer?.discountConfig?.minimumSpendValue) && (
                        <span className='ml-1 bg-[var(--success)] text-[10px] md:text-xs text-[var(--white)] rounded-[3px] md:rounded-[5px] px-1 py-[3px]'>
                            + FREE ITEM
                        </span>
                    )}
                </>
            );
        }
    };
    */
    
    return (
        <>

            <div className={cn("flex items-center gap-x-2 small-font", containerClassName)}>
            
                {showComboDefaultPrice ? (
                    <span className={cn(`text-[var(--primary-text)] md-description-font`, priceClassName)}>Combo Default</span>
                ) : (
                    <>
                        {!!discountedPrice && Number(discountedPrice) > 0 ?
                            <>
                                {!!showScratchPrice && <span className={cn(`text-[var(--primary-text)] ${(discountedPrice && discountedPrice !== price) ? 'description-font' : ''} `, discountedPriceClassName)}>{formatCurrency({ amount: Number(discountedPrice) })}</span>}
                                {price && <span className={cn(`${showScratchPrice ? "line-through text-[var(--secondary-text)] small-font" : "text-[var(--primary-text)] md-description-font"}`, priceClassName)}>{formatCurrency({ amount: Number(price) })}</span>}
                                {/* {!!bestOffer && offerTextVariant() && <span className='ml-2 bg-[var(--success)] text-[11px] text-[var(--white)] rounded-[5px] px-1 py-[2px]'>
                                    {offerTextVariant()}
                                </span>} */}
                            </>
                        :  
                            !!bestOffer ? (
                                <>
                                    {price && <span className={cn(`text-[var(--primary-text)] md-description-font`, priceClassName)}>{formatCurrency({ amount: Number(price) })}</span>}
                                    {/* {offerTextVariant() && <span className='ml-2 bg-[var(--success)] text-[11px] text-[var(--white)] rounded-[5px] px-1 py-[2px]'>
                                        {offerTextVariant()}
                                    </span>} */}
                                </>
                            ) : price && <span className={cn(`text-[var(--primary-text)] md-description-font`, priceClassName)}>{formatCurrency({ amount: Number(price) })}</span>
                        }
                    </>
                )}
            </div>
            <style>
                {`
                    .small-font{
                        font-size: var(--small-font);
                    }
                    .description-font {
                    font-size: var(--description-font);
                }
                    .font-600{
                        font-weight: var(--font-semi-bold);
                    }
                    // @media (min-width: 768px) {
                    .md-description-font {
                        font-size: var(--description-font);
                    // }
                }

                `}
            </style>
        </>
    );
};

export default PriceTag;
