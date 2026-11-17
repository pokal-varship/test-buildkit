"use client";

import { useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

export interface StripeElementsCheckoutFormProps {
  /** Stripe PaymentIntent client secret */
  clientSecret: string;
  /** Called when Stripe confirms payment successfully */
  onConfirmed: (paymentIntentId?: string) => void | Promise<void>;
  /** Called when Stripe returns an error */
  onFailed: (message: string) => void | Promise<void>;
  /** Optional: show top summary / amount externally */
  submitLabel?: string;
}

export default function StripeElementsCheckoutForm({
  clientSecret,
  onConfirmed,
  onFailed,
  submitLabel = "Pay now",
}: StripeElementsCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setLoading(true);
    try {
      await elements.submit();
      const result = await stripe.confirmPayment({
        elements,
        clientSecret,
        redirect: "if_required",
      });

      if (result.error) {
        await onFailed(result.error.message ?? "Payment failed");
        return;
      }

      await onConfirmed(result.paymentIntent?.id);
    } catch {
      await onFailed("An error occurred during payment processing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-elements-checkout-form rounded-lg">
      <div className="mb-6">
        <PaymentElement
          options={{
            layout: { type: "tabs" },
          }}
        />
      </div>

      <button type="submit" disabled={loading} className="stripe-elements-checkout-submit">
        {loading ? "Processing..." : submitLabel}
      </button>

      <style>{`
        .stripe-elements-checkout-submit{
          background-color: var(--primary-color);
          color: var(--black);
          width: 100%;
          border-radius: 10px;
          padding: 12px 14px;
          font-weight: var(--font-bold);
        }
        .stripe-elements-checkout-submit:disabled{
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
}

