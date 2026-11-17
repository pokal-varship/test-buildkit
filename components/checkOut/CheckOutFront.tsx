"use client";
import React, { useEffect, useState } from "react";
import { LanguageCode, TranslationKeys } from "types";
import useLang from "@hooks/useLang";
import CheckOutHeader from "@components/checkOut/CheckOutHeader";
import { useParams, useRouter } from "next/navigation";
import CheckOutFooter from "@components/checkOut/CheckOutFooter";
import DeliveryAddressSelector from "@components/checkOut/DeliveryAddressSelector";
import CheckOutOrderSummary from "@components/checkOut/CheckOutOrderSummary";
import DiscountCodeInput from "@components/order/DiscountCodeInput";
import { useCheckout } from "@hooks/useCheckout";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import { isTimeZone } from "@lib/helper";
import { useStoreCart } from "@hooks/storepage/useStore";
import PaymentMethodSelector from "@components/payment/PaymentMethodSelector";
import { useStoreDataBootstrap } from "@app/StoreDataProvider";

const CheckoutFront = () => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const router = useRouter();
  const params = useParams();
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const store = useSelector((state: RootState) => state.store);
  const { placeOrder, isLoading } = useCheckout();
  const { cartData, handleGetCart } = useStoreCart();
  const { bootstrapStore } = useStoreDataBootstrap();
  const storeSlug = Array.isArray(params?.storeSlug)
    ? params.storeSlug[0]
    : params?.storeSlug;

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    if (!store?.currentStore?.id && storeSlug) {
      void bootstrapStore(storeSlug as string);
      return;
    }

    if (store?.currentStore?.id) {
      handleGetCart(store?.currentStore?.id as string);
    }
  }, [bootstrapStore, store?.currentStore?.id, storeSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCheckout = async () => {
    if (!selectedAddressId || !cartData?.data?.id) return;

    const payload = {
      cartId: cartData?.data?.id,
      deliveryAddressId: selectedAddressId,
      orderType: "DELIVERY",
      timezone: isTimeZone(),
      deliveryInstructionsInput: {
        avoidCalling: false,
        dontRingBell: false,
        recordedVoiceMessageUrl: undefined,
      },
    };
    try {
      await placeOrder(payload);
    } catch {
      // Error is already handled in the hook
    }
  };

  const handleDeliveryAddressId = (id: string | null) => {
    setSelectedAddressId(id || "");
  };

  return (
    <div className="flex flex-col checkout-container">
      {/* Order Header */}
      <CheckOutHeader handleBack={handleBack} lang={lang} />

      <div className="flex flex-col checkout-content">
        {/* Delivery Address Selector */}
        <DeliveryAddressSelector
          handleDeliveryAddressId={handleDeliveryAddressId}
        />

        {/* Discount Code Input */}
        <DiscountCodeInput lang={lang} />

        {/* Payment Method Selector */}
        <PaymentMethodSelector />

        {/* Order Summary */}
        <CheckOutOrderSummary />
      </div>

      {/* Order Footer */}
      <CheckOutFooter
        lang={lang}
        handleCheckout={handleCheckout}
        isLoading={isLoading}
      />
      <style>{`
                .checkout-container{
                    background-color: var(--primary-background);
                    height: 100%;
                }
                .checkout-content{
                    height: 100%;
                    width: 60%;
                    margin: 0 auto;
                    padding: 0px;
                }
                @media (max-width: 768px) {
                    .checkout-content{
                        width: 100%;
                    }
                }
            `}</style>
    </div>
  );
};

export default CheckoutFront;
