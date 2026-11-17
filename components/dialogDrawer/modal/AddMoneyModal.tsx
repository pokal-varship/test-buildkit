"use client";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import CustomButton from "@components/buttons/Button";
import SecondaryButton from "@components/buttons/secondaryButton";
import { ExtendedSession } from "@components/header/types";
import BackArrow from "@components/icons/BackArrow";
import Icon from "@components/image/Icons";
import { useToast } from "@components/toast/Toast";
import { CROSS_ICON, RAZORPAY_ICON, STRIPE_ICON } from "@config/Header/image.config";
import { getTenantConfig } from "@config/tenant.config";
import useAuth from "@hooks/useAuth";
import useIsMobile from "@hooks/useIsMobile";
import useLang from "@hooks/useLang";
import useWallet from "@hooks/useWallet";
import formatCurrency from "@lib/helper/price";
import {
  openRazorpayCheckout,
  parseRazorpayCheckoutFromRechargeData,
} from "@lib/payment/razorpayCheckout";
import {
  isPresetBelowStripeWalletMin,
  isStripeWalletAmountValid,
  STRIPE_WALLET_MIN_AMOUNT,
} from "@lib/payment/walletLimits";
import { cn } from "@lib/utils";
import { walletRechargeSuccessSubject } from "@lib/rxSubject";
import Loader from "@components/loader/Loader";
import { PaymentGatewayOptionCard } from "@components/payment/PaymentGatewayOptionCard";
import { open_dialog } from "@lib/modalHandler";
import {
  getPaymentIntegrationConfig,
  toPaymentGatewayType,
} from "@services/integrationService";
import { verifyRazorpayPayment } from "@services/razorpayPaymentService";
import { initiateWalletRecharge } from "@services/walletRechargeService";
import { LanguageCode, TranslationKeys } from "types";

const PRESET_AMOUNTS = [10, 20, 50, 100] as const;

type GatewayOption = { code: string; name: string };

const isStripeCode = (code: string) => code.trim().toLowerCase().startsWith("stripe");

const formatTemplate = (template: string, vars: Record<string, string>) =>
  Object.entries(vars).reduce(
    (result, [key, value]) => result.replace(`{${key}}`, value),
    template
  );

interface AddMoneyModalProps {
  onClose: () => void;
  onSubmit?: (amount: number, paymentMethod: string) => void | Promise<void>;
}

const getPresetAmountButtonStyles = (isSelected: boolean, isMobile: boolean) =>
  isSelected
    ? {
        backgroundColor: "var(--button-primary-active-background)",
        border: "1px solid var(--primary-color)",
        borderRadius: "8px",
        padding: "10px 16px",
        width: isMobile ? "auto" : "93px",
        color: "var(--primary-text)",
      }
    : {
        backgroundColor: "var(--cards-containers)",
        border: "1px solid var(--borders-dividers)",
        borderRadius: "8px",
        padding: "10px 16px",
        width: isMobile ? "auto" : "93px",
        color: "var(--primary-text)",
      };

const parseCustomAmount = (value: string): number | null => {
  const trimmed = value.trim().replace(/,/g, "");
  if (!trimmed) return null;
  const parsed = Number.parseFloat(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed * 100) / 100;
};

const AddMoneyModal: React.FC<AddMoneyModalProps> = ({ onClose, onSubmit }) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const isMobile = useIsMobile();
  const toast = useToast();
  const { userId } = useAuth();
  const { data: authSession } = useSession() as { data: ExtendedSession | null };
  const { handleGetWallet } = useWallet();
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || "";
  const storeId = tenantId;

  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedGatewayCode, setSelectedGatewayCode] = useState("");
  const [gateways, setGateways] = useState<GatewayOption[]>([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshingAfterPayment, setIsRefreshingAfterPayment] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getPaymentIntegrationConfig()
      .then((res) => {
        if (cancelled) return;

        const payments = res?.data?.payments ?? [];
        const options: GatewayOption[] = [];

        for (const payment of payments) {
          const code = payment.code?.trim().toLowerCase() ?? "";
          const name = payment.name?.trim() ?? "";
          if (!code || !name) continue;
          if (!code.startsWith("stripe") && !code.startsWith("razorpay")) continue;
          options.push({ code, name });
        }

        setGateways(options);
        setSelectedGatewayCode(options[0]?.code ?? "");
      })
      .catch(() => {
        if (!cancelled) setGateways([]);
      })
      .finally(() => {
        if (!cancelled) setGatewaysLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const currencyPrefix = getTenantConfig().currencySymbolPrefix ?? "$";
  const effectiveAmount = useMemo(() => {
    if (selectedPreset !== null) return selectedPreset;
    return parseCustomAmount(customAmount);
  }, [selectedPreset, customAmount]);

  const stripeMinFormatted = useMemo(
    () => formatCurrency({ amount: STRIPE_WALLET_MIN_AMOUNT }).trim(),
    []
  );

  const stripeMinTemplateVars = useMemo(
    () => ({ amount: stripeMinFormatted }),
    [stripeMinFormatted]
  );

  const isStripeGateway = isStripeCode(selectedGatewayCode);
  const stripeAmountValid =
    !isStripeGateway || isStripeWalletAmountValid(effectiveAmount);

  const showStripeMinHint =
    isStripeGateway &&
    effectiveAmount !== null &&
    effectiveAmount > 0 &&
    !stripeAmountValid;

  const isSubmitDisabled =
    effectiveAmount === null ||
    effectiveAmount <= 0 ||
    !stripeAmountValid ||
    !selectedGatewayCode ||
    gatewaysLoading ||
    gateways.length === 0 ||
    isSubmitting ||
    isRefreshingAfterPayment;

  const selectGateway = (code: string) => {
    setSelectedGatewayCode(code);
    if (
      isStripeCode(code) &&
      effectiveAmount !== null &&
      effectiveAmount < STRIPE_WALLET_MIN_AMOUNT
    ) {
      setSelectedPreset(null);
      setCustomAmount("");
    }
  };

  const finishRecharge = async (paymentMethod: string) => {
    if (!userId || effectiveAmount === null) return;
    setIsRefreshingAfterPayment(true);
    try {
      await handleGetWallet(userId, { force: true });
      walletRechargeSuccessSubject.next();
      await onSubmit?.(effectiveAmount, paymentMethod);
      toast("success", lang.paymentSuccess);
      onClose();
    } finally {
      setIsRefreshingAfterPayment(false);
    }
  };

  const handleSubmit = async () => {
    if (
      isStripeGateway &&
      effectiveAmount !== null &&
      !isStripeWalletAmountValid(effectiveAmount)
    ) {
      toast(
        "error",
        formatTemplate(
          lang.walletPage.addMoneyStripeMinSubmitError,
          stripeMinTemplateVars
        )
      );
      return;
    }

    if (isSubmitDisabled || effectiveAmount === null || !userId || !tenantId) {
      if (!userId) toast("error", "Please sign in to add money.");
      return;
    }

    setIsSubmitting(true);
    try {
      const currency =
        getTenantConfig().currencyCode?.trim().toUpperCase() || "INR";
      const storeName = getTenantConfig().appName || "Wallet";

      const res = await initiateWalletRecharge({
        userId,
        tenantId,
        storeId,
        currency,
        amount: effectiveAmount,
        paymentGatewayType: toPaymentGatewayType(selectedGatewayCode),
      });

      const data = res?.data;
      if (!data) {
        toast("error", res?.message || "Could not start wallet recharge.");
        return;
      }

      if (isStripeCode(selectedGatewayCode)) {
        if (!data.keyId?.trim() || !data.clientSecret?.trim()) {
          toast("error", "Payment session details are missing.");
          return;
        }

        open_dialog("stripeOrderPayment", {
          open: true,
          type: "stripeOrderPayment",
          anchor: "bottom",
          className: "payment-dialog",
          drawerBorderRadius: "0px",
          handlerDialog: () => {},
          handleClose: () => {},
          propsData: {
            orderId: String(data.orderId ?? data.gatewayOrderId ?? ""),
            storeId,
            storeName,
            stripeKey: data.keyId,
            orderData: {
              clientSecret: data.clientSecret,
              paymentGetwayOrderId: data.gatewayOrderId ?? data.orderId,
              gatewayData: { data },
            },
            onPaymentSuccess: async () => {
              await finishRecharge("stripe");
            },
            onPaymentDismissed: () =>
              toast("warning", "Payment was not completed."),
          },
        });
        return;
      }

      const razorpaySession = parseRazorpayCheckoutFromRechargeData(
        data as unknown as Record<string, unknown>
      );
      if (!razorpaySession?.session_token) {
        toast("error", "Payment session details are missing.");
        return;
      }

      await openRazorpayCheckout({
        ...razorpaySession,
        name: storeName,
        description: lang.walletPage.addMoney,
        prefill: {
          name: authSession?.user?.name,
          email: authSession?.user?.email,
          contact: authSession?.user?.phoneNumber,
        },
        onSuccess: async (razorpayResponse) => {
          await verifyRazorpayPayment(
            razorpaySession.session_token!,
            razorpayResponse,
            storeId
          );
          await finishRecharge("razorpay");
        },
        onDismiss: () => toast("warning", "Payment was not completed."),
        onPaymentFailed: (reason) => toast("error", reason),
      });
    } catch (error) {
      toast(
        "error",
        error instanceof Error ? error.message : "Could not open payment checkout."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const amountSection = (
    <div className="mb-5 rounded-xl bg-[var(--primary-background)] p-4">
      <p className="extra-small-font md-heading-6 m-0 mb-3 font-700 text-[var(--primary-text)]">
        {lang.walletPage.addMoneyChooseAmount}
      </p>
      <div className={cn("mb-4 flex gap-3", isMobile ? "flex-nowrap" : "flex-wrap")}>
        {PRESET_AMOUNTS.map((amount) => {
          const presetDisabled =
            isStripeGateway && isPresetBelowStripeWalletMin(amount);
          return (
            <CustomButton
              key={amount}
              type="button"
              disabled={presetDisabled}
              onClick={() => {
                if (presetDisabled) {
                  toast(
                    "warning",
                    formatTemplate(
                      lang.walletPage.addMoneyStripeMinAmountHint,
                      stripeMinTemplateVars
                    )
                  );
                  return;
                }
                setSelectedPreset(amount);
                setCustomAmount("");
              }}
              className={cn(
                "extra-small-font md-heading-6",
                isMobile && "min-w-0 flex-1",
                presetDisabled && "opacity-50"
              )}
              styles={getPresetAmountButtonStyles(selectedPreset === amount, isMobile)}
            >
              {formatCurrency({ amount }).trim()}
            </CustomButton>
          );
        })}
      </div>
      <label className="block">
        <span className="extra-small-font md-heading-6 mb-1.5 block text-[var(--secondary-text)]">
          {lang.walletPage.addMoneyCustomAmount}
        </span>
        <div className="relative">
          <span className="extra-small-font md-heading-6 pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--secondary-text)]">
            {currencyPrefix}
          </span>
          <input
            type="number"
            inputMode="decimal"
            min={isStripeGateway ? STRIPE_WALLET_MIN_AMOUNT : undefined}
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value.replace(/[^\d.]/g, ""));
              setSelectedPreset(null);
            }}
            placeholder={lang.walletPage.addMoneyEnterAmountPlaceholder}
            className={cn(
              "heading-6 w-full rounded-lg border bg-[var(--cards-containers)] py-2.5 pl-7 pr-3 text-[var(--primary-text)] outline-none",
              selectedPreset === null && customAmount
                ? showStripeMinHint
                  ? "border-[var(--error)]"
                  : "border-[var(--primary-color)]"
                : "border-[var(--borders-dividers)]"
            )}
          />
        </div>
      </label>
      {isStripeGateway ? (
        <p
          className={cn(
            "extra-small-font md-heading-6 m-0 mt-2",
            showStripeMinHint
              ? "text-[var(--error)]"
              : "text-[var(--secondary-text)]"
          )}
        >
          {formatTemplate(
            showStripeMinHint
              ? lang.walletPage.addMoneyStripeMinSubmitError
              : lang.walletPage.addMoneyStripeMinAmountHint,
            stripeMinTemplateVars
          )}
        </p>
      ) : null}
    </div>
  );

  const gatewaySection = (
    <div className="mb-5">
      <p className="extra-small-font md-heading-6 m-0 mb-3 text-[var(--secondary-text)]">
        {lang.walletPage.addMoneyChoosePaymentGateway}
      </p>
      <div className="flex flex-col gap-3">
        {gatewaysLoading ? (
          <div className="flex justify-center py-6">
            <Loader />
          </div>
        ) : gateways.length === 0 ? (
          <p className="extra-small-font md-heading-6 m-0 text-[var(--secondary-text)]">
            Online payment is not available for this store.
          </p>
        ) : (
          gateways.map((gateway) => {
            const stripe = isStripeCode(gateway.code);
            return (
              <PaymentGatewayOptionCard
                key={gateway.code}
                selected={selectedGatewayCode === gateway.code}
                onSelect={() => selectGateway(gateway.code)}
                title={gateway.name}
                subtitle={
                  stripe
                    ? `${lang.paymentStripeSubtitle} · ${formatTemplate(
                        lang.walletPage.addMoneyStripeMinLabel,
                        stripeMinTemplateVars
                      )}`
                    : lang.paymentRazorpaySubtitle
                }
                iconSrc={stripe ? STRIPE_ICON : RAZORPAY_ICON}
                iconAlt={stripe ? "Stripe" : "Razorpay"}
              />
            );
          })
        )}
      </div>
    </div>
  );

  const refreshOverlay = isRefreshingAfterPayment ? (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--tertiary-background)]/80">
      <Loader />
    </div>
  ) : null;

  const submitButton = (
    <CustomButton
      className="heading-4 min-h-12 rounded-[10px] font-700 text-[var(--button-primary-text)]"
      onClick={handleSubmit}
      disabled={isSubmitDisabled}
      styles={{ width: isMobile ? "auto" : "100%" }}
    >
      {isSubmitting || isRefreshingAfterPayment
        ? lang.processing
        : lang.walletPage.addMoneySubmit}
    </CustomButton>
  );

  if (isMobile) {
    return (
      <div className="relative flex h-full flex-col bg-[var(--tertiary-background)]">
        {refreshOverlay}
        <div className="flex items-center gap-3 border-b border-[var(--borders-dividers)] px-4 py-4">
          <BackArrow pathFillColor="var(--primary-text)" onClick={onClose} />
          <h2 className="heading-3 m-0 font-700">{lang.walletPage.addMoney}</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {amountSection}
          {gatewaySection}
        </div>
        <div className="flex gap-3 border-t border-[var(--borders-dividers)] px-4 py-4">
          <SecondaryButton className="heading-4 min-h-12 flex-1 font-700" onClick={onClose}>
            {lang.cancel}
          </SecondaryButton>
          <div className="flex-1">{submitButton}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-[var(--cards-containers)] p-5 md:min-w-[360px] md:max-w-[480px]">
      {refreshOverlay}
      <div className="mb-4 flex justify-between">
        <h2 className="heading-3 m-0 font-700">{lang.walletPage.addMoney}</h2>
        <button type="button" className="border-0 bg-transparent p-1" onClick={onClose}>
          <Icon icon={`${CROSS_ICON}#cross`} width={16} height={16} color="var(--primary-text)" viewBox="0 0 16 16" />
        </button>
      </div>
      {amountSection}
      {gatewaySection}
      {submitButton}
    </div>
  );
};

export default AddMoneyModal;
