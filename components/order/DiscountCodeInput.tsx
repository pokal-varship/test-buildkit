"use client";
import CustomButton from "@components/buttons/Button";
import React, { useEffect, useState } from "react";
import { open_dialog } from "@lib/modalHandler";
import {
  CLOSE_CIRCLE_ICON,
  SUCCESS_CIRCLE_ICON,
} from "@config/Header/image.config";
import Icon from "@components/image/Icons";
import { getPromotionsList } from "@services/checkOutService";
import { useQuantityControls } from "@hooks/useQuantityControls";
import { CartData } from "./order.type";
import useAnalytics from "@hooks/useAnalytics";

interface Promotion {
  id: string;
  code: string;
  discount: number;
  type: string;
  description?: string;
  validFrom?: string;
  validUntil?: string;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
}

const DiscountCodeInput: React.FC<{
  lang: {
    discountCode: string;
    enterDiscountCodePlaceholder: string;
    apply: string;
    viewCoupons: string;
    offerAppliedOnTheBill: string;
  };
  cartId?: string;
  cartData?: CartData;
  handleApplyPromoCode?: (code: string) => void;
}> = ({ lang, cartId, cartData, handleApplyPromoCode }) => {
  const [discountCode, setDiscountCode] = useState<string>("");
  const [isApplied, setIsApplied] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [pendingCouponCode, setPendingCouponCode] = useState<string | null>(null);
  const { handleQuantity } = useQuantityControls(cartId as string);
  const { trackCouponViewed, trackCouponApplied } = useAnalytics();

  // Track coupon applied when cart data updates with the applied promo code
  useEffect(() => {
    if (
      pendingCouponCode &&
      cartData?.data?.appliedPromoCode?.promoCode === pendingCouponCode &&
      !isApplying
    ) {
      const promoDiscount = cartData.data.appliedPromoCode.promoCodeDiscountAmount || 0;
      const finalAmount = cartData.data.total?.finalAmount || 0;
      
      trackCouponApplied({
        coupon_code: pendingCouponCode,
        discount_value: promoDiscount,
        cart_value_after_discount: Math.max(0, finalAmount),
      });
      
      setPendingCouponCode(null); // Clear pending code after tracking
    }
  }, [cartData?.data?.appliedPromoCode, pendingCouponCode, isApplying, trackCouponApplied]);

  const handleApplyDiscountCode = async (code: string, id: string) => {
    setDiscountCode(code);
    setIsApplying(true);
    try {
      const response = await handleQuantity(
        "APPLY_PROMO_CODE",
        "",
        "",
        undefined,
        undefined,
        id,
        undefined,
        undefined,
        code
      );

      if (response?.message === "Success") {
        setIsApplied(true);
        handleApplyPromoCode?.(code);
        // Set pending code to track when cart refreshes
        setPendingCouponCode(code);
      } else {
        // If response is not successful, reset state
        setIsApplied(false);
        setDiscountCode("");
        setPendingCouponCode(null);
      }
    } catch {
      // errors are already handled in useQuantityControls (toast + getCart)
      // Reset state on error
      setIsApplied(false);
      setDiscountCode("");
      setPendingCouponCode(null);
    } finally {
      await getDiscountCode();
      setIsApplying(false);
    }
  };

  const handleRemoveDiscountCode = async (id: string) => {
    setIsApplying(true);
    try {
      const response = await handleQuantity(
        "REMOVE_PROMO_CODE",
        "",
        "",
        undefined,
        undefined,
        id
      );

      if (response?.message === "Success") {
        setDiscountCode("");
        handleApplyPromoCode?.("");
      }
    } catch {
      // errors are already handled in useQuantityControls (toast + getCart)
    } finally {
      await getDiscountCode();
      setIsApplying(false);
    }
  };

  const handleViewCoupons = async () => {
    // Track coupon viewed
    trackCouponViewed("cart");
    
    const latestCoupons = await getDiscountCode(); // wait for fresh data
    open_dialog("discountCoupons", {
      open: true,
      propsData: {
        handleApplyDiscountCode,
        coupons: latestCoupons, // use fresh data directly
        isApplied:isApplied
      },
      type: "discountCoupons",
      handlerDialog: () => {},
      handleClose: () => {},
      anchor: "right",
      forceDrawer: true,
      drawerBorderRadius: "0px",
      sxStyle: {
        '& .MuiPaper-root': {
          borderRadius: '0px',
          height: '100%',
          maxHeight: '100dvh',
        },
        '& .mobile-drawer-content': {
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          minHeight: 0,
          height: '100%',
        },
      },
    });
  };

  const getDiscountCode = async (): Promise<Promotion[]> => {
    const response = await getPromotionsList(cartId as string);
    const data = response?.data;
    const latestCoupons = data?.promoApplicable || [];
    return latestCoupons; // return fresh data
  };
  

  useEffect(() => {
    getDiscountCode();
  }, []);

  useEffect(() => {
    // Only sync with cartData when not actively applying a promo code
    // This prevents stale cart data from overriding error states
    if (!isApplying) {
      if (cartData?.data?.appliedPromoCode?.promoCode) {
        setIsApplied(true);
        setDiscountCode(cartData?.data?.appliedPromoCode?.promoCode || "");
      } else {
        setIsApplied(false);
        setDiscountCode("");
      }
    }
  }, [cartData, isApplying]);

  return (
    <div className="discount-container">
      <div className="flex items-center justify-between mb-3">
        <h4 className="discount-label">{lang.discountCode}</h4>
        <h4 className="view-coupons-label" onClick={handleViewCoupons}>
          {lang.viewCoupons}
        </h4>
      </div>

      {/* Apply Discount Code */}
      {!isApplied ? (
        <div className="flex items-center gap-3 justify-between">
          <input
            type="text"
            placeholder={lang.enterDiscountCodePlaceholder}
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            className="discount-input"
            maxLength={15}
          />
          <CustomButton
            className="apply-button"
            disabled={!(discountCode.length > 0) || isApplying}
            onClick={() => handleApplyDiscountCode(discountCode, "")}
          >
            {lang.apply}
          </CustomButton>
        </div>
      ) : (
        <div className="apply-discount-code-container">
          {/* Coupon Box */}
          <div className="coupon-box">
            <input
              type="text"
              value={discountCode}
              disabled
              className="coupon-input"
            />
            <Icon
              icon={`${CLOSE_CIRCLE_ICON}#close-circle`}
              width={24}
              height={24}
              className="cursor-pointer"
              color={"var(--primary-text)"}
              viewBox="0 0 25 25"
              onClick={() => {
                handleRemoveDiscountCode(
                  cartData?.data?.appliedPromoCode?.id || ""
                );
              }}
            />
          </div>
          <div className="success-msg">
            <Icon
              icon={`${SUCCESS_CIRCLE_ICON}#success-circle`}
              width={24}
              height={24}
              className="cursor-pointer"
              viewBox="0 0 22 22"
              color="var(--success)"
            />
            <span>{lang.offerAppliedOnTheBill}</span>
          </div>
        </div>
      )}
      <style>{`
                .view-coupons-label {
                    color: var(--accent-color);
                    cursor: pointer;
                    font-size: var(--heading-h4);
                    font-weight: var(--font-bold);
                }

                .discount-container {
                    display: flex;
                    flex-direction: column;
                    background-color: var(--cards-containers);
                    margin-bottom: 18px;
                    padding: 20px;
                    border-radius: 10px;
                    width: 100%;
                    border: 1px solid var(--borders-dividers);
                }
                .discount-label {
                    font-size: var(--heading-h4);
                    font-weight: var(--font-bold);
                    color: var(--primary-text);
                }
                .discount-input {
                    flex: 1;
                    border: 1px solid var(--borders-dividers);
                    padding: 10px;
                    border-radius: 8px;
                    background-color: var(--tertiary-background);
                }
                .discount-input:focus {
                    outline: none;
                    border-color: var(--borders-dividers);
                }
                .apply-button {
                    cursor: pointer;
                    width: 150px;
                }

                .applied-coupon-container {
                    border: 1px solid #eee;
                    padding: 16px;
                    border-radius: 8px;
                    background: #fdfcf7;
                    width: 100%;
                }

                .coupon-box {
                    display: flex;
                    align-items: center;
                    border: 1px dashed var(--success);
                    background-color: var(--success-opacity);
                    padding: 10px 12px;
                    border-radius: 8px;
                    justify-content: space-between;
                    width: 100%;
                }
                .coupon-input {
                    // background-color: var(--success-opacity);
                    color: var(--primary-text);
                }

                .success-msg {
                    display: flex;
                    align-items: center;
                    color: var(--success);
                    font-size: var(--small-font);
                    font-weight: var(--font-semi-bold);
                    justify-content: end;
                    width: 300px;
                    gap: 6px;
                    margin-top: 0px;
                }

                .apply-discount-code-container {
                    display: flex;
                    align-items: center;
                    gap: 3px;
                    justify-content: space-between;
                    flex-direction: row;
                }
                @media (max-width: 768px) {
                    .apply-discount-code-container {
                        flex-direction: column;
                    }
                    .success-msg {
                        width: 100%;
                        justify-content: start;
                        margin-top: 10px;
                    }
                    .discount-input {
                        width: 100%;
                    }
                    .apply-button {
                        width: 80px !important;
                    }
                    .discount-label {
                        font-size: var(--heading-h5);
                        margin-bottom: 0px !important;
                    }
                    .view-coupons-label {
                        font-size: var(--small-font);
                        font-weight: var(--font-regular);
                    }
                    .discount-container {
                        border-radius: 0px;
                        margin-bottom: 0px;
                    }
                    .coupon-box {
                        padding-bottom: 14px;
                    }
                }
                }
            `}</style>
    </div>
  );
};

export default DiscountCodeInput;
