'use client';
import React, { useMemo } from 'react';
import Icon from '@components/image/Icons';
import CustomButton from '@components/buttons/Button';
import { CROSS_ICON, KCAL_ICON } from '@config/Header/image.config';
import { generateImageBase64FromUrl } from '@lib/helper/ImageGen/imageGen';
import formatCurrency from '@lib/helper/price';
import { getTenantConfig } from '@config/tenant.config';
import { ReorderProduct } from '@components/orderagain/orderAgainType';
import { LanguageCode, TranslationKeys } from 'types';
import useLang from '@hooks/useLang';
import StarIcon from '@components/icons/Star';
import ClockIcon from '@components/icons/ClockIcon';
import { truncateToFixed } from '../../../../utils/string-operations';

// Extend ReorderProduct to include optional prep time fields
export interface ReorderProductWithPrepTime extends ReorderProduct {
  preparationTime?: number | string;
  prepTime?: number | string;
}

export interface OrderAgainAddon {
  id: string;
  modifierName: { en: string; ar?: string } | string;
  unitPrice: number;
  quantity: number;
}

interface OrderAgainItemDetailsProps {
  product: ReorderProductWithPrepTime;
  addons: OrderAgainAddon[];
  lastOrderedDate: string;
  onClose: () => void;
  onAddToCart: () => void;
  isAddingToCart?: boolean;
}

const OrderAgainItemDetails: React.FC<OrderAgainItemDetailsProps> = ({
  product,
  addons,
  lastOrderedDate,
  onClose,
  onAddToCart,
  isAddingToCart = false,
}) => {
  const [lang, languageCode]: [TranslationKeys, LanguageCode] = useLang();
  const tenantConfig = getTenantConfig();

  // Calculate base price (use discounted amount if available, otherwise original)
  const basePrice = product.discountedAmount || product.originalAmount || 0;

  // Calculate total addon price
  const totalAddonPrice = useMemo(() => {
    return addons.reduce((sum, addon) => sum + addon.unitPrice * addon.quantity, 0);
  }, [addons]);

  // Calculate total price
  const totalPrice = basePrice + totalAddonPrice;

  const productName = product.productName[languageCode] || product.productName.en || '';
  const productImageUrl = product.media?.[0]?.url || '';
  
  // Extract rating, calories, and prep time
  const rating = product.rating?.average || 0;
  const reviewCount = product.rating?.totalReview || 0;
  const calories = tenantConfig.showCaloriesInfo
    ? product.nutritionInfo?.values?.calories
    : undefined;
  // Prep time fields are optional and may come in different property names
  const prepTime = product.preparationTime || product.prepTime;

  return (
    <div className="order-again-item-details-modal">
      <div className="modal-header">
        <div className="last-ordered-text">
          Last ordered : {lastOrderedDate}
        </div>
        <Icon
          icon={`${CROSS_ICON}#cross`}
          width={16}
          height={16}
          color={"var(--primary-text)"}
          className="cursor-pointer close-icon"
          viewBox='0 0 16 16'
          onClick={onClose}
        />
      </div>

      <div className="modal-content-wrapper">
        <div className="product-header">
          <div className="item-image-container">
            <img
              src={
                generateImageBase64FromUrl({
                  url: productImageUrl,
                  width: 64,
                })?.fullEncodedUrl || ""
              }
              alt={productName}
              className="item-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  generateImageBase64FromUrl({
                    url: tenantConfig.productPlaceholderImageUrl || "",
                    width: 64,
                  })?.fullEncodedUrl || "";
              }}
            />
          </div>
          <div className="product-info">
            <h3 className="item-name">{productName}</h3>
            {(rating > 0 || prepTime || calories) && (
              <div className="product-meta">
                {rating > 0 && reviewCount > 0 && (
                  <>
                    <div className="meta-item">
                      <StarIcon width="14" height="14" className="meta-icon" />
                      <span className="meta-text">
                        {truncateToFixed(rating, 1)}({reviewCount})
                      </span>
                    </div>
                    {(prepTime || calories) && (
                      <span className="meta-divider">•</span>
                    )}
                  </>
                )}
                {prepTime && (
                  <>
                    <div className="meta-item">
                      <ClockIcon 
                        width={14} 
                        height={14} 
                        className="meta-icon clock-icon-mobile" 
                        bgColor="var(--button-primary-background)"
                        handColor="var(--white)"
                      />
                      <span className="meta-text">{prepTime} {lang.mins}</span>
                    </div>
                    {calories && <span className="meta-divider">•</span>}
                  </>
                )}
                {calories && (
                  <div className="meta-item">
                    <img
                      src={`${KCAL_ICON}#kcal`}
                      alt="kcal"
                      className="meta-icon kcal-icon"
                      width={14}
                      height={14}
                    />
                    <span className="meta-text">{calories} {lang.kcal}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="item-details-wrapper">
          <div className="item-breakdown">
            {/* Base product/variant */}
            <div className="breakdown-item">
              <span className="breakdown-name">Regular</span>
              <span className="breakdown-price">
                {formatCurrency({ amount: basePrice })}
              </span>
            </div>

            {/* Addons/Modifiers */}
            {addons.map((addon, index) => {
              const modifierName = typeof addon.modifierName === 'string' 
                ? addon.modifierName 
                : (addon.modifierName[languageCode] || addon.modifierName.en || '');
              
              return (
                <div key={addon.id || index} className="breakdown-item">
                  <span className="breakdown-name">
                    {modifierName}
                  </span>
                  <span className="breakdown-price">
                    {formatCurrency({ amount: addon.unitPrice * addon.quantity })}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="breakdown-divider"></div>

          {/* Total */}
          <div className="total-section">
            <span className="total-label">Total</span>
            <span className="total-price">
              {formatCurrency({ amount: totalPrice })}
            </span>
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <CustomButton
          className="add-to-cart-button-modal"
          onClick={onAddToCart}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? 'Adding...' : lang.addToCart}
        </CustomButton>
      </div>

      <style>{`
        .order-again-item-details-modal {
          width: 100%;
          background-color: var(--cards-containers);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          max-height: 100%;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .last-ordered-text {
          font-size: var(--small-font);
          color: var(--secondary-text);
          font-weight: var(--font-regular);
        }

        .close-icon {
          flex-shrink: 0;
          margin-left: 12px;
        }

        .modal-content-wrapper {
          display: flex;
          flex-direction: column;
          margin-bottom: 24px;
          flex: 1;
          min-height: 0;
          overflow-y: auto;
        }

        .product-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .item-image-container {
          flex-shrink: 0;
        }

        .item-image {
          width: 64px;
          height: 64px;
          border-radius: 8px;
          object-fit: cover;
        }

        .product-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .item-name {
          font-size: var(--heading-h4);
          font-weight: var(--font-semi-bold);
          color: var(--primary-text);
          margin: 0;
          line-height: 1.4;
        }

        .product-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .meta-icon {
          flex-shrink: 0;
          width: 14px;
          height: 14px;
        }

        .kcal-icon {
          width: 14px;
          height: 14px;
        }

        .clock-icon-mobile {
          /* Orange clock icon for mobile */
        }

        .meta-text {
          font-size: var(--small-font);
          color: var(--secondary-text);
          font-weight: var(--font-regular);
        }

        .meta-divider {
          font-size: var(--small-font);
          color: var(--secondary-text);
          margin: 0 2px;
        }

        .item-details-wrapper {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .item-breakdown {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 16px 0;
        }

        .breakdown-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .breakdown-name {
          font-size: var(--small-font);
          color: var(--primary-text);
          font-weight: var(--font-regular);
          flex: 1;
        }

        .breakdown-price {
          font-size: var(--small-font);
          color: var(--primary-text);
          font-weight: var(--font-medium);
          white-space: nowrap;
        }

        .breakdown-divider {
          border-top: 1px dashed var(--border-dividers-color);
          margin: 4px 0 12px 0;
        }

        .total-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .total-label {
          font-size: var(--description-font);
          font-weight: var(--font-semi-bold);
          color: var(--primary-text);
        }

        .total-price {
          font-size: var(--description-font);
          font-weight: var(--font-semi-bold);
          color: var(--primary-text);
        }

        .modal-footer {
          width: 100%;
        }

        .add-to-cart-button-modal {
          width: 100%;
          border: none;
          padding: 14px 24px;
          font-size: var(--button-primary-font-size);
          font-weight: var(--font-semi-bold);
        }
        .add-to-cart-button-modal:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .order-again-item-details-modal {
            max-width: 100%;
            border-radius: 16px 16px 0 0;
            padding: 16px;
            max-height: 90vh;
            overflow: hidden;
          }

          .modal-content-wrapper {
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            flex: 1;
            min-height: 0;
          }

          .modal-header {
            margin-bottom: 16px;
            padding-bottom: 12px;
          }

          .last-ordered-text {
            font-size: var(--extraSmall-font);
            flex: 1;
            line-height: 1.3;
          }

          .close-icon {
            width: 20px;
            height: 20px;
            margin-left: 8px;
          }

          .modal-content-wrapper {
            gap: 16px;
            margin-bottom: 20px;
          }

          .product-header {
            gap: 10px;
            margin-bottom: 12px;
          }

          .item-image {
            width: 56px;
            height: 56px;
            border-radius: 6px;
          }

          .item-name {
            font-size: var(--description-font);
            line-height: 1.3;
            margin-bottom: 6px;
          }

          .product-meta {
            gap: 6px;
            flex-wrap: wrap;
          }

          .meta-item {
            gap: 3px;
          }

          .meta-icon {
            width: 12px;
            height: 12px;
          }

          .kcal-icon {
            width: 12px;
            height: 12px;
          }

          .meta-text {
            font-size: 11px;
            line-height: 1.2;
          }

          .meta-divider {
            font-size: 11px;
            margin: 0 2px;
          }

          .item-details-wrapper {
            margin-top: 8px;
          }

          .item-breakdown {
            gap: 10px;
            padding: 12px 0;
          }

          .breakdown-item {
            gap: 12px;
            padding: 4px 0;
          }

          .breakdown-name {
            font-size: 12px;
            line-height: 1.4;
            word-break: break-word;
          }

          .breakdown-price {
            font-size: 12px;
            flex-shrink: 0;
          }

          .breakdown-divider {
            margin: 8px 0;
          }

          .total-section {
            gap: 12px;
            padding-top: 8px;
          }

          .total-label,
          .total-price {
            font-size: var(--description-font);
            font-weight: var(--font-semi-bold);
          }

          .modal-footer {
            padding-top: 12px;
            position: sticky;
            bottom: 0;
            background-color: var(--cards-containers);
            margin-top: auto;
          }

          .add-to-cart-button-modal {
            padding: 14px 20px;
            font-size: var(--description-font);
            font-weight: var(--font-semi-bold);
            width: 100%;
            border-radius: 8px;
          }
        }

        @media (max-width: 480px) {
          .order-again-item-details-modal {
            padding: 12px;
            border-radius: 12px 12px 0 0;
          }

          .modal-header {
            margin-bottom: 12px;
            padding-bottom: 10px;
          }

          .last-ordered-text {
            font-size: var(--small-font);
          }

          .item-image {
            width: 48px;
            height: 48px;
          }

          .item-name {
            font-size: var(--small-font);
          }

          .meta-text {
            font-size: var(--extraSmall-font);
          }

          .breakdown-name,
          .breakdown-price {
            font-size: var(--extraSmall-font);
          }

          .total-label,
          .total-price {
            font-size: var(--small-font);
          }

          .add-to-cart-button-modal {
            padding: 12px 16px;
            font-size: var(--small-font);
          }
        }
      `}</style>
    </div>
  );
};

export default OrderAgainItemDetails;