"use client";
import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Appearance } from "@stripe/stripe-js";
import { usePayment } from "@hooks/usePayment";
import PaymentForm from "@components/payment/PaymentForm";
import Loader from "@components/loader/Loader";
import { useToast } from "@components/toast/Toast";
import { CROSS_ICON } from "@config/Header/image.config";
import Icon from "@components/image/Icons";
import { PaymentResponse } from "./payment.type";
import { close_dialog } from "@lib/modalHandler";
import { useSearchParams } from "next/navigation";
import { LanguageCode, TranslationKeys } from "types";
import useLang from "@hooks/useLang";
import { useRouter } from "next/navigation";
import { useStoreCart } from "@hooks/storepage/useStore";

interface PaymentClientProps {
  orderId: string;
  onClose?: () => void;
  fromPage?: boolean;
}

export default function PaymentClient({
  orderId,
  fromPage,
}: PaymentClientProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [customerClientSecret, setCustomerClientSecret] = useState<string | undefined>()
  const { createPaymentIntent, cancelPaymentIntent } = usePayment();
  const [amount, setAmount] = useState<number>(10);
  const [success, setSuccess] = useState(false);
  const toast = useToast();
  const searchParams = useSearchParams();
  const storeId = searchParams?.get("storeId");
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const router = useRouter();
  const { handleGetCart } = useStoreCart();

  const handleSuccess = (status: boolean) => {
    setSuccess(status);
    if (status) {
      const url = new URL(window.location.href);
      url.searchParams.set("success", "true");
      router.replace(url.toString());
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const successParam = searchParams.get("success");
    if (successParam === "true") {
      setSuccess(true);
    }
  }, []);

  // Get CSS variables at runtime for Stripe appearance
  const getCssVariable = (
    variableName: string,
    fallback: string = ""
  ): string => {
    if (typeof window !== "undefined" && document.documentElement) {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(variableName)
        .trim();
      return value || fallback;
    }
    return fallback;
  };

  // Initialize Stripe only on the client side
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
  );

  // Dynamic appearance configuration using CSS variables with fallbacks
  const appearance: Appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: getCssVariable("--primary-color", "#0074D9"),
      colorBackground: getCssVariable("--cards-containers", "#FFFFFF"),
      colorText: getCssVariable("--primary-text", "#333333"),
      colorDanger: getCssVariable("--secondary-text", "#FF4136"),
      fontFamily: getCssVariable(
        "--font-family",
        "system-ui, -apple-system, sans-serif"
      ),
      spacingUnit: "4px",
      borderRadius: "4px",
    },
    rules: {
      ".Input": {
        border: `1px solid ${getCssVariable("--border-color", "#E6E6E6")}`,
        boxShadow: "none",
        padding: "10px 14px",
      },
      ".Input:focus": {
        border: `1px solid ${getCssVariable("--primary-color", "#0074D9")}`,
        boxShadow: `0 0 0 1px ${getCssVariable("--primary-color", "#0074D9")}`,
      },
      ".Label": {
        fontWeight: "500",
        marginBottom: "8px",
        color: getCssVariable("--primary-text", "#333333"),
      },
      ".Error": {
        color: getCssVariable("--error", "#FF4136"),
      },
    },
  };

  async function initializePayment() {
    const searchParams = new URLSearchParams(window.location.search);
    const successParam = searchParams.get("success");
    if (successParam === "true") {
      close_dialog(["payment"])
      router.back()
      return;
    }
    try {
      const res = await createPaymentIntent(
        orderId.toString(),
        storeId as string
      );
      setClientSecret(res.client_secret);
      setCustomerClientSecret(res?.customerSessionClientSecret || undefined)
      setAmount(res.amount);
    } catch (err: unknown) {

      const reason = "Payment failed due to error in intent api";
      handleCancelPayment(reason);
      const errorMessage =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data: { message: string } } }).response.data
              .message
          : "Payment initialization failed";
      toast("error", errorMessage);
    }
  }

  const handleCancelPayment = async (reason?: string) => {
    if (success) {
      return;
    }
    try {
      const payload: PaymentResponse = {
        orderId: orderId.toString(),
        paymentStatus: "FAILED",
        transactionId: "NA",
        reason: reason || "Payment inturrupted by user",
      };
      await cancelPaymentIntent(payload);
      close_dialog(["payment"]);
    } catch {

      toast("error", "Payment failed");
    }
  };

  const handleCancelPaymentOnRefresh = async (reason?: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    const successParam = searchParams.get("success");
    if (successParam === "true" || success) {
      return;
    }
    try {
      const payload: PaymentResponse = {
        orderId: orderId.toString(),
        paymentStatus: "FAILED",
        transactionId: "NA",
        reason: reason || "Payment inturrupted by user",
      };
      await cancelPaymentIntent(payload);
      initializePayment();
      handleGetCart(storeId as string);
    } catch {

    }
  };

  useEffect(() => {
    if (fromPage) {
      handleCancelPaymentOnRefresh();
    }
  }, [fromPage]);

  useEffect(() => {
    initializePayment();
  }, []);

  useEffect(() => {
    // Add event listeners for back button and dialog close
    const handleBackButton = (e: PopStateEvent) => {
      e.preventDefault();
      handleCancelPayment();
    };

    window.addEventListener("popstate", handleBackButton);

    // Cleanup function that will run when component unmounts
    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [success]);

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-header flex justify-between items-center mb-5">
        <h2 className="payment-client-title">{lang.payment}</h2>
        <Icon
          icon={`${CROSS_ICON}#cross`}
          width={16}
          height={16}
          color={"var(--primary-text)"}
          className="cursor-pointer cross-icon"
          viewBox="0 0 16 16"
          onClick={() => router.back()}
        />
      </div>
      <Elements stripe={stripePromise} options={{ clientSecret, appearance, customerSessionClientSecret: customerClientSecret }}>
        <PaymentForm
          amount={amount}
          clientSecret={clientSecret}
          orderId={orderId}
          success={success}
          handleSuccess={handleSuccess}
        />
      </Elements>
      <style>{`
        .payment-container {
          background-color: var(--cards-containers);
          width: 100%;
          max-width: 650px;
          margin: 0 auto;
          padding: 1.5rem;
          border-radius: 0.375rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .payment-client-title {
          font-size: var(--heading-h2);
          font-weight: var(--font-bold);
          color: var(--primary-text);
        }

        @media (max-width: 768px) {
          .payment-container {
            max-width: 100%;
            padding: 1rem;
            margin: 0;
            border-radius: 0;
          }
          .payment-header {
            padding: 10px 0px;
          }
          .payment-client-title {
            font-size: var(--heading-h3);
          }
        }
      `}</style>
    </div>
  );
}
