'use client';
import CustomButton from '@components/buttons/Button';
import Icon from '@components/image/Icons';
import Loader from '@components/loader/Loader';
import { Offer } from '@components/order/order.type';
import { CROSS_ICON, FREEBIES_CELEBRATION_ICON} from '@config/Header/image.config';
import tenantConfig from '@config/tenant.config';
import { useFreebiesOffer } from '@hooks/useFreebiesOffer';
import useLang from '@hooks/useLang';
import { useQuantityControls } from '@hooks/useQuantityControls';
import { useTicketQuantityControls } from '@hooks/useTicketQuantityControls';
import { generateImageBase64FromUrl } from '@lib/helper/ImageGen/imageGen';
import formatCurrency from '@lib/helper/price';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import { selectIsQrFlowActive, selectSessionId } from "@redux/slices/qrFlowSlice";
import { LanguageCode, TranslationKeys } from 'types';

interface NutritionInfo {
  servingSize: string;
  values: {
    calories: number;
    totalFat: number;
    saturatedFat: number;
    transFat: number;
    cholesterol: number;
    sodium: number;
    dietaryFiber: number;
    sugar: number;
    protein: number;
  };
  vitaminsAndMinerals: {
    vitaminA: number;
    calcium: number;
    iron: number;
    potassium: number;
  };
}

interface ApiMedia {
  url: string;
}

interface ApiSeo {
  socialMediaImages?: ApiMedia[];
}

interface ApiIngredient {
  name: string;
  isAllergenic: boolean;
}

interface ApiIngredients {
  items: ApiIngredient[];
}

interface ApiRatings {
  average: number;
  totalReview: number;
}

interface ApiProductData {
  productId: string;
  productName: {
    en: string;
  } | string;
  discountedPrice: number;
  basePrice: number;
  media?: ApiMedia[];
  seo?: ApiSeo;
  overallRatings?: ApiRatings;
  productType: string;
  ingredients?: ApiIngredients;
  nutritionInfo?: NutritionInfo;
  isVariant: boolean;
  variantId: string;
  variantAttributes?: Record<string, string>;
  servingSize?: string;
}

interface FreebieItem {
  id: string;
  name: string;
  price: string;
  originalPrice: string;
  image: string;
  rating: number;
  reviews: number;
  allergens: string;
  nutritionInfo?: NutritionInfo;
  isVariant: boolean;
  variantId: string;
  specifications?: string;
  productType?: string;
}

interface FreebiesModalProps {
  items?: FreebieItem[];
  onConfirm?: (selected: FreebieItem | null) => void;
  storeId: string;
  cartId: string;
  offerId: string;
  cartItemsId: string;
  UpdateSelectedFreebie: string;
  handleCloseFreebiesModal: () => void;
}

const FreebiesModal: React.FC<FreebiesModalProps> = ({
  onConfirm,
  storeId,
  cartId,
  offerId,
  cartItemsId,
  UpdateSelectedFreebie,
  handleCloseFreebiesModal,
}) => {
  const [selected, setSelected] = useState<string | null>(UpdateSelectedFreebie);
  type FreebiesOfferApiResponse = {
    availableProducts?: ApiProductData[];
    freebieEligible?: { offers?: Offer[] };
  } | ApiProductData[];
  const { getFreebiesOffer, isLoading } = useFreebiesOffer<FreebiesOfferApiResponse>();
  const [items, setItems] = useState<FreebieItem[]>([]);
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const { handleQuantity } = useQuantityControls(cartId);
  const { handleTicketQuantity } = useTicketQuantityControls();
  const [selectedOffer, setSelectedOffer] = useState<Offer[]>([]);
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const sessionId = useSelector(selectSessionId);

  // Calculate selected items count for each offer
  const getSelectedItemsCount = () => {
    if (!selected) return 0;
    // Check if the selected item belongs to this offer
    const selectedItem = items.find(item => 
      (item.id === selected || item.variantId === selected)
    );
    return selectedItem ? 1 : 0;
  };

  const mapApiDataToFreebieItem = (apiData: ApiProductData[]): FreebieItem[] => {
    return apiData.map((item) => {
      // Extract specifications from variantAttributes or nutritionInfo
      const specs: string[] = [];
      if (item.variantAttributes) {
        const size = item.variantAttributes['Size'] || item.variantAttributes['size'];
        const flavor = item.variantAttributes['Flavor'] || item.variantAttributes['flavor'] || item.variantAttributes['Color'] || item.variantAttributes['color'];
        if (size) specs.push(size);
        if (flavor) specs.push(flavor);
      }
      if (item.nutritionInfo?.servingSize && specs.length === 0) {
        specs.push(item.nutritionInfo.servingSize);
      }
      // Add calories if available
      if (tenantConfig.showCaloriesInfo && item.nutritionInfo?.values?.calories) {
        specs.push(`${item.nutritionInfo.values.calories}kcal`);
      }
      const specifications = specs.length > 0 ? specs.join(' • ') : undefined;

      const discountedPrice = item.discountedPrice > 0 ? item.discountedPrice : item.basePrice;
      const originalPrice = item.discountedPrice > 0 && item.discountedPrice < item.basePrice ? item.basePrice : null;
      
      return {
        id: item.productId,
        name:
          typeof item.productName === 'object' && item.productName?.en
            ? item.productName.en
            : (item.productName as string) || 'Unknown Product',
        price: discountedPrice.toFixed(2),
        originalPrice: originalPrice ? originalPrice.toFixed(2) : '',
        image: item.media?.[0]?.url || item.seo?.socialMediaImages?.[0]?.url || '',
        rating: item.overallRatings?.average || 0,
        reviews: item.overallRatings?.totalReview || 0,
        allergens:
          item.ingredients?.items
            ?.filter((ing: ApiIngredient) => ing.isAllergenic)
            ?.map((ing: ApiIngredient) => ing.name)
            ?.join(', ') || 'None',
        nutritionInfo: item.nutritionInfo || undefined,
        isVariant: item.isVariant,
        variantId: item.variantId,
        specifications,
        productType: item.productType,
      };
    });
  };

  const handleGetFreebiesOffer = useCallback(async () => {
    try {
      const identifier = isQrFlowActive ? (sessionId ?? cartId) : cartId;
      const response = await getFreebiesOffer(
        storeId,
        identifier,
        offerId,
        isQrFlowActive ? "sessionId" : "cartId"
      );
      if (!Array.isArray(response) && response?.availableProducts && Array.isArray(response.availableProducts)) {
        const mappedItems = mapApiDataToFreebieItem(response.availableProducts);
        setItems(mappedItems);
        setSelectedOffer(response.freebieEligible?.offers ?? []);
      } else if (Array.isArray(response)) {
        const mappedItems = mapApiDataToFreebieItem(response);
        setItems(mappedItems);
      } else {
        setItems([]);
      }
    } catch {

      setItems([]);
    }
  }, [cartId, getFreebiesOffer, isQrFlowActive, offerId, sessionId, storeId]);

  useEffect(() => {
    if (storeId && cartId && offerId) {
      handleGetFreebiesOffer();
    } else {
      setItems([]);
    }
  }, [storeId, cartId, offerId, handleGetFreebiesOffer]);

  const handleConfirm = (selectedId: string | null) => {
    const selectedItem = items?.find((item) => item.id === selectedId || item.variantId === selectedId) || null;
    onConfirm?.(selectedItem);
    if (selectedId) {
      const payload = {
        customType: 'ADD_FREEBIE',
        id: cartId,
        freebieProductId: selectedId,
        freebieOfferId: offerId,
        cartItemId: cartItemsId,
      };
      if (isQrFlowActive) {
        handleTicketQuantity('ADD_FREEBIE', selectedId, {
          freebieIdPayload: payload,
        });
      } else {
        handleQuantity('ADD_FREEBIE', selectedId, undefined, undefined, undefined, undefined, payload);
      }
    }
  };

  const handleSelect = (item: FreebieItem) => {
    const newSelected = item.isVariant ? item.variantId : item.id;
    setSelected(newSelected);
    // Call handleConfirm with the new selection directly
    handleConfirm(newSelected);
    handleCloseFreebiesModal();
  };


  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      {isLoading && (
        <div className="flex items-center justify-center h-screen">
          <Loader />
        </div>
      )}
      {items.length > 0 && <div className="modal-container">
        <div className="freebies-modal-header">
          <div className="freebies-header-content">
            <div className="freebies-celebration-section">
              <div className="freebies-header-top-line">
                <img src={FREEBIES_CELEBRATION_ICON} alt="freebies-celebration" width={22} height={22} className="freebies-celebration-emoji" />
                {selectedOffer && selectedOffer.length > 0 && (() => {
                  const offer = selectedOffer[0];
                  const offerName = offer.offerName?.en || 'Freebie';
                  return (
                    <div className="freebies-unlocked-title">
                      {lang.youUnlocked} {offerName}!
                    </div>
                  );
                })()}
              </div>
              {selectedOffer && selectedOffer.length > 0 && (() => {
                const offer = selectedOffer[0];
                const offerName = offer.offerName?.en || 'Freebie';
                const selectedCount = getSelectedItemsCount();
                const maxSelectable = 1; // Freebies typically allow selecting 1 item
                return (
                  <div className="freebies-choose-text">
                    {lang.chooseYour} {offerName} {lang.item} ({selectedCount}/{maxSelectable})
                  </div>
                );
              })()}
            </div>
          </div>
          <Icon icon={`${CROSS_ICON}#cross`} className='freebies-close-icon cursor-pointer' onClick={handleCloseFreebiesModal} color="var(--primary-text)" />
        </div>
        <div className="items-grid">
          {items.map((item) => {
            const isItemSelected = selected === item.id || selected === item.variantId;
            return (
              <div
                key={item.id}
                className={`item-card ${isItemSelected ? "selected" : ""}`}
                onClick={() => handleSelect(item)}
              >
                <div className="item-content-wrapper">
                  <div className="item-image-container">
                    <img
                      src={
                        generateImageBase64FromUrl({
                          url: item?.image,
                          width: 315,
                          height: 315,
                        })?.fullEncodedUrl ||
                        generateImageBase64FromUrl({
                          url: tenantConfig.productPlaceholderImageUrl || "",
                          width: 315,
                          height: 315,
                        })?.fullEncodedUrl ||
                        ""
                      }
                      alt={item?.name}
                      width={70}
                      height={70}
                      className="item-image"
                      fetchPriority="high"
                    />
                  </div>
                  <div className="item-details flex flex-col items-start justify-start">
                    <div className="item-name-wrapper">
                      <div className="item-name text-sm font-semibold">
                        {item.name}
                      </div>
                    </div>
                    <div className="item-specifications">
                      {item.productType}
                      {item.productType && item.specifications && " • "}
                      {item.specifications}
                    </div>
                    <div className="item-price-row w-full">
                      {item.originalPrice ? (
                        <>
                          <span className="item-price">{formatCurrency({amount: Number(item.price)})}</span>
                          {tenantConfig.showStrikethroughPrice && (
                            <span className="item-price-original">
                              {formatCurrency({amount: Number(item.originalPrice)})}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="item-price">{formatCurrency({amount: Number(item.price)})}</span>
                      )}
                    </div>
                  </div>
                </div>
                <CustomButton
                  className={isItemSelected ? "current-item" : "choose-btn"}
                >
                  {isItemSelected ? lang.currentItem : lang.chooseItem}
                </CustomButton>
              </div>
            );
          })}
        </div>

        {/* <CustomButton className="freebies-confirm-btn" onClick={handleConfirm} disabled={!selected}>
          Confirm
        </CustomButton> */}
      </div>}

      <style>{`
        .modal-container {
          background: linear-gradient(90deg, var(--product-offer-bg-start) 0%, var(--product-offer-bg-end) 100%);
          border-radius: 5px;
          width: 100%;
          padding: 20px;
          margin-top: 20px;
          max-width: 100%;
          box-sizing: border-box;
        }
        .freebies-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 12px;
        }
        .freebies-header-content {
          flex: 1;
          min-width: 0;
        }
        .freebies-celebration-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .freebies-header-top-line {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 8px;
        }
        .freebies-celebration-emoji {
          font-size: var(--heading-h3);
          line-height: 1;
          flex-shrink: 0;
        }
        .freebies-header-text {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }
        .freebies-unlocked-title {
          font-weight: 700;
          font-size: var(--heading-h4);
          color: var(--success);
          line-height: 1.3;
          word-wrap: break-word;
        }
        .freebies-choose-text {
          font-weight: 400;
          font-size: var(--small-font);
          color: var(--secondary-text);
          line-height: 1.4;
          word-wrap: break-word;
          margin-left: 0;
        }
        .freebies-close-icon {
          cursor: pointer;
          flex-shrink: 0;
          margin-left: 8px;
          padding: 4px;
          touch-action: manipulation;
          width: 24px;
          height: 24px;
        }
        .selected-section {
          margin-bottom: 20px;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .section-title {
          font-weight: var(--font-bold);
          font-size: var(--heading-h4);
          color: var(--success);
        }
        .change-btn {
          background: none;
          border: none;
          color: var(--accent-color);
          font-weight: var(--font-medium);
          cursor: pointer;
          font-size: var(--heading-h6);
        }
        .selected-item-container {
          background: var(--cards-containers);
          border-radius: 12px;
          padding: 16px;
          border: 1px solid var(--borders-dividers);
        }
        .selected-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
        }
        .selected-check-icon {
          position: absolute;
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          background: var(--success);
          color: var(--white);
          width: 20px;
          height: 20px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--extraSmall-font);
          font-weight: bold;
        }
        .selected-item .info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .selected-item .name {
          font-weight: var(--font-bold);
          font-size: var(--heading-h4);
          color: var(--primary-text);
        }
        .selected-item .rating {
          font-size: var(--small-font);
          color: var(--secondary-text);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .selected-item .price {
          font-weight: var(--font-bold);
          color: var(--primary-text);
          font-size: var(--heading-h4);
        }
        .selected-item .image {
          width: 100px;
          height: 100px;
          object-fit: contain;
        }
        .items-grid {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          margin-bottom: 0;
          padding-bottom: 8px;
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
        }
        .items-grid::-webkit-scrollbar {
          display: none;
        }
        .item-card {
          border: 1px solid var(--borders-dividers);
          border-radius: 12px;
          padding: 12px;
          min-width: 200px;
          max-width: 200px;
          flex-shrink: 0;
          background: var(--cards-containers);
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .item-card.selected {
          border-color: var(--warning-light);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .item-card:active {
          transform: scale(0.98);
        }
        .item-content-wrapper {
          display: flex;
          flex-direction: row;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 12px;
          flex: 1;
        }
        .item-image-container {
          position: relative;
          flex-shrink: 0;
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .item-image {
          width: 70px;
          height: 70px;
          object-fit: contain;
          border-radius: 6px;
          transition: transform 0.2s ease;
        }
        .item-card:hover .item-image {
          transform: scale(1.05);
        }
        .item-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          min-width: 0;
          width: 100%;
        }
        .item-name-wrapper {
          width: 100%;
          margin-bottom: 6px;
        }
        .item-name {
          font-weight: var(--font-bold);
          font-size: var(--small-font);
          color: var(--primary-text);
          text-align: left;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }
        .item-specifications {
          font-size: var(--extraSmall-font);
          color: var(--secondary-text);
          margin-bottom: 8px;
          line-height: 1.3;
          display: inline-flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        .item-price-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 0;
          flex-wrap: wrap;
        }
        .item-price {
          font-weight: var(--font-bold);
          color: var(--primary-text);
          font-size: var(--small-font);
        }
        .item-price-original {
          font-weight: 400;
          color: var(--secondary-text);
          font-size: var(--extraSmall-font);
          text-decoration: line-through;
        }
        .item-discount {
          background-color: var(--success);
          color: var(--white);
          font-size: var(--extraSmall-font);
          padding: 2px 4px;
          border-radius: 6px;
          font-weight: var(--font-medium);
        }
        .choose-btn {
          border: none;
          border-radius: 6px;
          padding: 10px 12px;
          font-weight: var(--font-bold);
          cursor: pointer;
          font-size: var(--small-font);
          transition: all 0.2s ease;
          width: 100%;
          margin-top: auto;
          touch-action: manipulation;
          min-height: 40px;
        }
        .current-item {
          background-color: var(--primary-color-opacity);
          border: 1px solid var(--warning-light);
          border-radius: 6px;
          padding: 10px 12px;
          font-weight: var(--font-bold);
          cursor: pointer;
          color: var(--accent-color);
          font-size: var(--small-font);
          width: 100%;
          margin-top: auto;
          touch-action: manipulation;
          min-height: 40px;
        }
        .choose-btn:hover {
          background-color: var(--primary-color-opacity);
        }
        .choose-btn:active {
          transform: scale(0.98);
        }
        .choose-btn:not(.selected) {
          background-color: var(--primary-color);
          border: none;
        }
        .freebies-confirm-btn {
          width: 100%;
          margin-top: 12px;
        }

        /* Tablet Styles */
        @media (min-width: 769px) and (max-width: 1024px) {
          .modal-container {
            padding: 18px;
          }
          .freebies-close-icon {
            width: 24px;
            height: 24px;
          }
          .items-grid {
            gap: 14px;
          }
          .item-card {
            min-width: 220px;
            max-width: 220px;
            padding: 14px;
          }
        }

        /* Desktop Styles */
        @media (min-width: 1025px) {
          .modal-container {
            padding: 24px;
            max-width: 1200px;
            margin-left: auto;
            margin-right: auto;
          }
          .freebies-close-icon {
            width: 24px;
            height: 24px;
          }
          .items-grid {
            gap: 16px;
            overflow-x: auto;
            flex-wrap: nowrap;
            justify-content: flex-start;
          }
          .item-card {
            min-width: 240px;
            max-width: 240px;
            padding: 16px;
          }
          .item-image-container {
            width: 80px;
            height: 80px;
          }
          .item-image {
            width: 80px;
            height: 80px;
          }
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .modal-container {
            padding: 12px;
            margin-top: 10px;
            border-radius: 8px;
          }
          .freebies-modal-header {
            margin-bottom: 16px;
            gap: 8px;
          }
          .freebies-celebration-section {
            gap: 6px;
          }
          .freebies-header-top-line {
            gap: 6px;
          }
          .freebies-celebration-emoji {
            width: 24px;
            height: 24px;
            font-size: var(--heading-h4);
          }
          .freebies-header-text {
            gap: 4px;
          }
          .freebies-unlocked-title {
            font-size: var(--heading-h5);
            line-height: 1.3;
          }
          .freebies-choose-text {
            font-size: var(--extraSmall-font);
            line-height: 1.3;
            margin-left: 0;
          }
          .freebies-close-icon {
            width: 24px;
            height: 24px;
          }
          .items-grid {
            gap: 10px;
            padding-bottom: 6px;
            margin-left: -12px;
            margin-right: -12px;
            padding-left: 12px;
            padding-right: 12px;
          }
          .item-card {
            min-width: 180px;
            max-width: 180px;
            padding: 10px;
            border-radius: 10px;
          }
          .item-content-wrapper {
            gap: 10px;
            margin-bottom: 10px;
          }
          .item-image-container {
            width: 60px;
            height: 60px;
          }
          .item-image {
            width: 60px;
            height: 60px;
          }
          .item-name {
            font-size: var(--extraSmall-font);
            line-height: 1.3;
            -webkit-line-clamp: 2;
          }
          .item-specifications {
            font-size: 10px;
            margin-bottom: 6px;
            line-height: 1.2;
          }
          .item-price {
            font-size: var(--extraSmall-font);
          }
          .item-price-original {
            font-size: 10px;
          }
          .choose-btn,
          .current-item {
            padding: 8px 10px;
            font-size: var(--extraSmall-font);
            min-height: 36px;
          }
          .section-title {
            font-size: var(--heading-h6);
          }
        }

        /* Small Mobile Styles */
        @media (max-width: 480px) {
          .modal-container {
            padding: 10px;
            margin-top: 8px;
          }
          .freebies-modal-header {
            margin-bottom: 12px;
          }
          .freebies-header-top-line {
            gap: 4px;
          }
          .freebies-celebration-emoji {
            width: 20px;
            height: 20px;
          }
          .freebies-close-icon {
            width: 24px;
            height: 24px;
          }
          .freebies-unlocked-title {
            font-size: var(--heading-h6);
          }
          .freebies-choose-text {
            font-size: 10px;
            margin-left: 0;
          }
          .items-grid {
            gap: 8px;
            margin-left: -10px;
            margin-right: -10px;
            padding-left: 10px;
            padding-right: 10px;
          }
          .item-card {
            min-width: 160px;
            max-width: 160px;
            padding: 8px;
          }
          .item-content-wrapper {
            gap: 8px;
            margin-bottom: 8px;
          }
          .item-image-container {
            width: 55px;
            height: 55px;
          }
          .item-image {
            width: 55px;
            height: 55px;
          }
          .item-name {
            font-size: 11px;
            -webkit-line-clamp: 2;
          }
          .item-specifications {
            font-size: 9px;
            margin-bottom: 4px;
          }
          .item-price {
            font-size: 11px;
          }
          .item-price-original {
            font-size: 9px;
          }
          .choose-btn,
          .current-item {
            padding: 6px 8px;
            font-size: 11px;
            min-height: 32px;
          }
        }
      `}</style>
    </div>
  );
};

export default FreebiesModal;
