import CustomButton from '@components/buttons/Button';
import SecondaryButton from '@components/buttons/secondaryButton';
import CloseCircleIcon from '@components/icons/CloseCircleIcon';
import formatCurrency from '@lib/helper/price';
import React from 'react';
import { getTenantConfig } from '@config/tenant.config';

interface CustomizationRepeatProps {
    onClose?: () => void;
    onYes?: () => void;
    onNo?: () => void;
    title?: string;
    description?: string;
    yesButtonText?: string;
    noButtonText?: string;
    mobileTitle?: string;
    price?: number;
    discountedPrice?: number;
    productName?: string;
}

const CustomizationRepeat: React.FC<CustomizationRepeatProps> = ({ onClose, onYes, onNo, title, description, yesButtonText, noButtonText, mobileTitle, price, discountedPrice, productName }) => {
    const { showStrikethroughPrice } = getTenantConfig();
    return (
        <div className="dialog-container">
            <div className='modalContent'>
                <div className="dialog-header-customization-repeat">
                    <h2 className='dialog-title'>
                        <span className="desktop-only">{title}</span>
                        <span className="mobile-only">
                            {mobileTitle}
                        </span>
                    </h2>
                    <CloseCircleIcon
                        width={30}
                        height={30}
                        className="cursor-pointer flex-shrink-0"
                        onClick={onClose}
                    />
                </div>
                {productName && (
                    <h4 className='dialog-product-name'>{productName}</h4>
                )}
                {description && (
                    <div className='dialog-description'>
                        {description.includes('\n') ? (
                            // Render combo products with proper formatting
                            description.split('\n').map((part, index) => (
                                <h4 key={index} className={index % 2 === 0 ? 'dialog-product-name' : 'dialog-modifiers'}>
                                    {part}
                                </h4>
                            ))
                        ) : (
                            // Render regular products
                            <h4 className='dialog-description'>{description}</h4>
                        )}
                    </div>
                )}
                {(() => {
                    const hasDiscount =
                        typeof discountedPrice === 'number' &&
                        typeof price === 'number' &&
                        discountedPrice > 0 &&
                        discountedPrice !== price;
                    const displayPrice = hasDiscount ? discountedPrice : price;
                    return (
                        <div className='dialog-price-container'>
                            {hasDiscount && showStrikethroughPrice && (
                                <h4 className="dialog-print-price dialog-base-price-strike">
                                    {formatCurrency({ amount: price })}
                                </h4>
                            )}
                            {typeof displayPrice === 'number' && (
                                <h4 className={hasDiscount ? 'dialog-discount-price' : 'dialog-print-price'}>
                                    {formatCurrency({ amount: displayPrice })}
                                </h4>
                            )}
                        </div>
                    );
                })()}
                <div className={"buttonContainer"}>
                    <SecondaryButton className="cancelButton" onClick={onNo}>{noButtonText}</SecondaryButton>
                    <CustomButton className="logoutButton" onClick={onYes}>{yesButtonText}</CustomButton>
                </div>
            </div>
            <style>{`
                .dialog-container  {
                    width: 100%;
                    padding: 0px 10px;
                    min-width: 400px;
                    background-color: var(--cards-containers);
                }

                .modalContent {
                    border-radius: 8px;
                    text-align: center;
                }
   
                .dialog-header-customization-repeat {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                    text-align: left;
                }

                .buttonContainer {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 20px;
                    gap: 10px;
                }

                .dialog-title{
                    font-size: var(--heading-h2);
                    font-weight: var(--font-bold);
                    color:var(--primary-text);
                }
                .dialog-description{
                    color:var(--primary-text);
                    font-size: var(--heading-h4);
                    font-weight: var(--font-regular);
                    text-align: start;
                }
                .cancelButton{
                    width: 100%;
                    font-size: var(--description-font);
                    font-weight: var(--font-bold);
                    color: var(--black);
                }
                .cancelButton:hover {
                    color: var(--black);
                }
                .logoutButton{
                    width: 100%;
                    font-size: var(--description-font);
                    font-weight: var(--font-bold);
                }
                .cross-icon{
                    display: none;
                }
                .desktop-only {
                    display: block;
                }
                .mobile-only {
                    display: none;
                }
                .dialog-print-price{
                    color: var(--secondary-text);
                    font-size: var(--description-font);
                    font-weight: var(--font-regular);
                    text-align: start;
                }
                .dialog-product-name{
                    font-size: var(--heading-h4) !important;
                    font-weight: var(--font-regular) !important;
                    text-align: start;
                    margin-top: 8px;
                    color: var(--primary-text);
                }
                .dialog-price-container{
                    display: flex;
                    gap: 8px;
                    align-items: center;
                    text-align: start !important;
                    margin-top: 4px !important;
                }
                .dialog-base-price-strike{
                    text-decoration: line-through !important;
                }
                .dialog-discount-price{
                    color: var(--primary-text);
                    font-size: var(--heading-h5) !important;
                    font-weight: var(--font-regular) !important;
                    text-align: start !important;
                }
                .dialog-modifiers{
                    font-size: var(--heading-h5) !important;
                    color: var(--secondary-text);
                }    
                @media (max-width: 768px) {
                    .dialog-product-name{
                        font-size: var(--description-font) !important;
                    }
                    .dialog-container {
                        width: 100%;
                        min-width: 300px;
                        padding: 0px;
                    }
                    .modalContent {
                        padding: 0px;
                    }
                    .cross-icon{
                        display: block;
                    }
                    .dialog-title{
                        font-size: var(--heading-h4);
                        font-weight: var(--font-extra-bold);
                    }
                    .dialog-description{
                        font-size: var(--heading-h5);
                    }
                    .dialog-header-customization-repeat{
                        padding: 0px;
                    }
                    .desktop-only {
                        display: none;
                    }
                    .mobile-only {
                        display: block;
                        font-weight: var(--font-medium) !important;
                        font-size: var(--heading-h3) !important;
                    }
                    .dialog-print-price{
                        font-size: var(--heading-h5) !important;
                    }                                     
                    .dialog-discount-price{
                        color: var(--primary-text);
                        font-size: var(--heading-h5) !important;
                        font-weight: var(--font-regular) !important;
                        text-align: start !important;
                    }
                    .dialog-modifiers{
                        font-size: var(--heading-h6) !important;
                    } 
                }
            `}</style>
        </div>
    );
};

export default CustomizationRepeat;
