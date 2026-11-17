/** Stripe minimum charge for wallet recharge (INR; gateway constraint). */
export const STRIPE_WALLET_MIN_AMOUNT = 50;

export const isStripeWalletAmountValid = (amount: number | null): boolean =>
  amount !== null && amount >= STRIPE_WALLET_MIN_AMOUNT;

export const isPresetBelowStripeWalletMin = (presetAmount: number): boolean =>
  presetAmount < STRIPE_WALLET_MIN_AMOUNT;
