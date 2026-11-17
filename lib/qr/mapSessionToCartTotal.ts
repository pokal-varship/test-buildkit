import { CartTotalSummary } from '@components/order/order.type';
import type { SessionSummary } from '@services/sessionService';

/** Map dine-in sessionSummary → cartTotal for payment UI. */
export const mapQrSessionToCartTotal = (
    sessionSummary: SessionSummary | null
): CartTotalSummary | undefined => {
    if (!sessionSummary) return undefined;

    const finalAmount = sessionSummary.finalAmount ?? sessionSummary.estimatedTotal;
    if (finalAmount == null) return undefined;

    return {
        cartId: '',
        cartLevelDiscount: 0,
        cartLevelTax: 0,
        deliveryFee: 0,
        finalAmount,
        itemSubTotal:
            sessionSummary.itemSubtotal ??
            sessionSummary.itemSubTotal ??
            sessionSummary.currentSubtotal ??
            0,
        itemLevelDiscount:
            sessionSummary.itemLevelDiscount ?? sessionSummary.totalDiscount ?? 0,
        itemLevelTax: sessionSummary.itemLevelTax ?? sessionSummary.totalTax ?? 0,
        totalDiscount: sessionSummary.totalDiscount ?? sessionSummary.itemLevelDiscount ?? 0,
        totalTax: sessionSummary.totalTax ?? sessionSummary.itemLevelTax ?? 0,
        platformFee: 0,
        totalBaseDiscountAmount: 0,
        totalOfferDiscountAmount: 0,
        tipAmount: 0,
        maxCashbackUsable: sessionSummary.maxCashbackUsable,
        maximumLoyaltyPointsUsable: sessionSummary.maximumLoyaltyPointsUsable,
    };
};
