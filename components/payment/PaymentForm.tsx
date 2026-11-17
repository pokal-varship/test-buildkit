"use client";
import CustomButton from "@components/buttons/Button";
import { ExtendedSession } from "@components/header/types";
import { useToast } from "@components/toast/Toast";
import useLang from "@hooks/useLang";
import formatCurrency from "@lib/helper/price";
import { open_dialog } from "@lib/modalHandler";
import { clearQrFlow } from "@redux/slices/qrFlowSlice";
import { setCurrentOrderDetails, setOrderData } from "@redux/slices/ordersSlice";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { LanguageCode, TranslationKeys } from "types";
import StripeElementsCheckoutForm from "@components/payment/StripeElementsCheckoutForm";

interface PaymentFormProps {
  amount: number;
  clientSecret: string;
  orderId: string;
  handleSuccess: (status: boolean) => void;
  success: boolean;
}

const PaymentForm = ({
  amount,
  clientSecret,
  orderId,
  success = false,
  handleSuccess = () => {},
}: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleRedirectNow = () => {
    router.push(`/orders/${orderId}`);
  };

  return (
    <div className="payment-container-form">
      <div className="w-full">
        <div className="payment-form rounded-lg">
          <div className="mb-6 flex items-center justify-between">
            <h4 className="payment-title">{lang.netPayableAmount}</h4>
            <p className="payment-amount">
              {formatCurrency({ amount: amount })}
            </p>
          </div>

          <StripeElementsCheckoutForm
            clientSecret={clientSecret}
            submitLabel={loading ? lang.processing : lang.payNow}
            onFailed={(message) => {
              setError(message);
            }}
            onConfirmed={async () => {
              // After successful payment backend ends the session; clear Redux so no stale data shows.
              dispatch(setCurrentOrderDetails(null));
              dispatch(setOrderData(null));
              dispatch(clearQrFlow());
              handleSuccess(true);
              open_dialog("orderSuccess", {
                open: true,
                propsData: {
                  orderId,
                  handleRedirectNow,
                },
                type: "orderSuccess",
                handlerDialog: () => {},
                handleClose: () => {},
                anchor: "bottom",
                sxStyle: {
                  "& .MuiDialogContent-root": {
                    backgroundColor: "var(--primary-background)",
                  },
                },
              });

              setTimeout(() => {
                router.push(`/orders/${orderId}`);
              }, 15000);
              toast("success", lang.paymentSuccess);
            }}
          />

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-500 rounded-md">
              {lang.paymentSuccess}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .payment-element {
          width: 100%;
          height: 40px;
        }
        .payment-title {
          font-size: var(--heading-h4);
          font-weight: var(--font-bold);
          color: var(--primary-text);
        }
        .payment-amount {
          font-size: var(--heading-h5);
          font-weight: var(--font-medium);
          color: var(--primary-text);
        }
        .payment-container-form {
          height: 100%;
          display: ${success ? "none" : "flex"};
          justify-content: center;
          align-items: center;
          background-color: var(--cards-containers);
        }
        .payment-form {
          background-color: var(--cards-containers);
        }
      `}</style>
    </div>
  );
};

export default PaymentForm;
