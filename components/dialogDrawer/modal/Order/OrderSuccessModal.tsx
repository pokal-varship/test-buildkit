"use client";

import CustomButton from '@components/buttons/Button';
import { Order, OrderItem } from '@components/type/order.type';
import { ORDER_SUCCESS_ICON, COIN_ICON } from '@config/Header/image.config';
import useLang from '@hooks/useLang';
import { getFormattedDateTime } from '@lib/helper/date';
import formatCurrency from '@lib/helper/price';
import { RootState } from '@redux/store';
import { getOrderById } from '@services/orderPage';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { LanguageCode, TranslationKeys } from 'types';

interface OrderSuccessModalProps {
    onClose?: () => void;
    handleRedirectNow: () => void;
    orderId?: string;
}

const getItemDisplayPrice = (item: OrderItem): number =>
    item.subTotalAfterBaseAndOfferDiscount ??
    item.subTotalAfterDiscount ??
    item.finalPrice ??
    0;

const getItemProductName = (
    item: OrderItem,
    language: LanguageCode,
): string =>
    item.productName?.[language as keyof typeof item.productName] ||
    item.productName?.en ||
    '';

const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
    handleRedirectNow,
    orderId: orderIdProp,
}) => {
    const [lang, language]: [TranslationKeys, LanguageCode] = useLang();
    const orderData = useSelector((state: RootState) => state.orders.orderData);
    const orderIdFromStore = useSelector((state: RootState) => state.orders.orderId);
    const orderId = orderIdProp || orderIdFromStore || null;

    const [orderDetails, setOrderDetails] = useState<Order | null>(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);

    useEffect(() => {
        if (!orderId) return;

        let cancelled = false;

        const fetchOrderDetails = async () => {
            setIsSummaryLoading(true);
            try {
                const response = await getOrderById(orderId);
                if (cancelled) return;

                const data = response?.data;
                const order = Array.isArray(data) ? data[0] : data;
                if (order) {
                    setOrderDetails(order);
                }
            } catch {
                // Keep modal usable when detail fetch fails.
            } finally {
                if (!cancelled) {
                    setIsSummaryLoading(false);
                }
            }
        };

        void fetchOrderDetails();

        return () => {
            cancelled = true;
        };
    }, [orderId]);

    const items = orderDetails?.items ?? [];
    const totalDiscount = orderDetails?.orderTotal?.totalDiscount ?? 0;
    const earnedLoyaltyPoints =
        orderDetails?.orderTotal?.earnedLoyaltyPoints ?? 0;
    const showEarnedPoints = earnedLoyaltyPoints > 0;
    const showSummary = isSummaryLoading || items.length > 0 || totalDiscount > 0;

    return (
        <div className="order-modal-container">
            <div className="order-modal-content w-full text-center">
                <div className='flex justify-center'>
                    <img src={ORDER_SUCCESS_ICON} alt="food" width={200} height={200} />
                </div>

                {/* Success Message */}
                <h2 className="order-success-title">
                    {lang.orderPlace}
                </h2>

                {/* Delivery Info */}
                <p className="order-success-delivery-info">
                    {orderData?.orderType === 'delivery'
                        ? lang.orderDeliveredTo
                        : `${lang.orderReadyToPickupAt} ${getFormattedDateTime(orderData?.scheduledAt || 0)}`}
                </p>
                {orderData?.orderType === 'delivery' && (
                    <p className="order-success-delivery-address px-4">
                        {orderData?.deliveryAddress?.address}
                    </p>
                )}

                {showSummary && (
                    <div className="order-success-summary">
                        <div className="order-success-summary-header">
                            <span className="order-success-summary-title">
                                {lang.order.orderSummary}
                            </span>
                            {showEarnedPoints && (
                                <span className="order-success-earned">
                                    {lang.order.youEarned}{' '}
                                    <img
                                        src={COIN_ICON}
                                        alt=""
                                        width={14}
                                        height={14}
                                        className="order-success-coin"
                                        aria-hidden
                                    />
                                    <span className="order-success-earned-points">{earnedLoyaltyPoints.toLocaleString()}{' '}</span>
                                    {lang.order.onThisOrder}
                                </span>
                            )}
                        </div>

                        <div className="order-success-summary-card">
                            {isSummaryLoading && items.length === 0 ? (
                                <div className="order-success-summary-loading">
                                    {lang.loading}...
                                </div>
                            ) : (
                                items.map((item, index) => (
                                    <div
                                        key={item.id || index}
                                        className="order-success-item-row"
                                    >
                                        <span className="order-success-item-name">
                                            {getItemProductName(item, language)}
                                        </span>
                                        <span className="order-success-item-price">
                                            {formatCurrency({
                                                amount: getItemDisplayPrice(item),
                                            })}
                                        </span>
                                    </div>
                                ))
                            )}

                            {totalDiscount > 0 && (
                                <div className="order-success-savings">
                                    {lang.order.yourTotalSavings}{' '}
                                    {formatCurrency({ amount: totalDiscount })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <CustomButton
                    className="continue-button"
                    onClick={handleRedirectNow}
                >
                    {lang.continue}
                </CustomButton>
            </div>
            <style>{`
            .order-modal-container {
                width: 100%;
                padding: 0px 10px;
                min-width: 400px;
                background-color: var(--primary-background);
            }
            .order-modal-content{
                padding: 0px;
            }
            .continue-button{
                width:100%;
                font-size: var(--heading-h4);
                font-weight: var(--font-bold);
            }
            .order-success-title{
                font-size: var(--heading-h2);
                font-weight: var(--font-bold);
                color: var(--primary-text);
                margin-bottom: 10px;
            }
            .order-success-delivery-info{
                font-size: var(--heading-h4);
                color: var(--primary-text);
                margin-bottom: ${orderData?.orderType === 'delivery' ? "0px" : "20px"};
            }
            .order-success-delivery-address{
                font-size: var(--heading-h6);
                color: var(--primary-text);
                font-weight: var(--font-semi-bold);
                margin-bottom: 20px;
            }
            .order-success-summary {
                text-align: left;
                margin-bottom: 24px;
            }
            .order-success-summary-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                margin-bottom: 12px;
            }
            .order-success-summary-title {
                font-size: var(--heading-h5);
                font-weight: var(--font-semi-bold);
                color: var(--primary-text);
            }
            .order-success-earned {
                display: inline-flex;
                align-items: center;
                flex-wrap: wrap;
                justify-content: flex-end;
                gap: 4px;
                font-size: var(--small-font);
                color: var(--primary-text);
                text-align: right;
            }
            .order-success-earned-points {
                font-weight: var(--font-medium);
                color: var(--loyalty-badge-bg);
            }
            .order-success-coin {
                flex-shrink: 0;
            }
            .order-success-summary-card {
                background-color: var(--cards-containers);
                border-radius: 12px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                gap: 12px;
                padding: 16px;
            }
            .order-success-summary-loading {
                padding: 16px;
                font-size: var(--small-font);
                color: var(--primary-text);
                text-align: center;
            }
            .order-success-item-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
            }
            .order-success-item-name {
                font-size: var(--description-font);
                color: var(--primary-text);
                text-align: left;
            }
            .order-success-item-price {
                font-size: var(--description-font);
                font-weight: var(--font-semi-bold);
                color: var(--primary-text);
                flex-shrink: 0;
            }
            .order-success-savings {
                background-color: var(--success-opacity);
                color: var(--success);
                font-size: var(--small-font);
                font-weight: var(--font-semi-bold);
                text-align: center;
                padding: 12px 16px;
                border-radius: 8px;
            }
            @media (max-width: 768px) {
                .order-modal-container{
                    min-width: 300px;
                }
                .continue-button{
                    margin-bottom:15px;
                }
                .order-success-title{
                    font-size: var(--heading-h4);
                }
                .order-success-delivery-info{
                    font-size: var(--small-font);
                }
                .order-success-delivery-address{
                    font-size: var(--description-font);
                }
                .order-success-summary-header {
                    flex-direction: column;
                    align-items: flex-start;
                }
                .order-success-earned {
                    justify-content: flex-start;
                    text-align: left;
                }
            }
      `}</style>
        </div>
    );
};

export default OrderSuccessModal;