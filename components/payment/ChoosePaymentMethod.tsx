'use client';

import useLang from '@hooks/useLang';
import useWallet from '@hooks/useWallet';
import {
    getPaymentIntegrationConfig,
    mapIntegrationPaymentToOrderFields,
} from '@services/integrationService';
import { useToast } from '@components/toast/Toast';
import { SelectedIntegrationPayment } from '@components/payment/integration.types';
import { ExtendedSession } from '@components/header/types';
import InfoIcon from '@components/icons/InfoIcon';
import CustomDialog from '@components/dialogDrawer/dialog';
import Shimmer from '@components/ui/Shimmer';
import {
    CASH_WALLET_ICON,
    COIN_ICON,
    RAZORPAY_ICON,
    STRIPE_ICON,
    TICK_CIRCLE_ICON,
    TRANSACTION_INFO_ICON,
} from '@config/Header/image.config';
import formatCurrency from '@lib/helper/price';
import { open_dialog } from '@lib/modalHandler';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CartItem, CartTotalSummary } from '@components/order/order.type';
import { LanguageCode, TranslationKeys } from 'types';
import parse from 'html-react-parser';
import Loader from '@components/loader/Loader';
import { PaymentGatewayOptionCard } from '@components/payment/PaymentGatewayOptionCard';
import { getTenantConfig } from '@config/tenant.config';
import { previewWalletRedemption, convertPointsToCash } from '@services/walletRedemptionService';

const formatTemplate = (template: string, vars: Record<string, string>) =>
    Object.entries(vars).reduce(
        (result, [key, value]) => result.replace(`{${key}}`, value),
        template
    );

/** UI-only id for Pay Online radio */
const PAY_ONLINE_METHOD_ID = 'pay-online';

type OnlineGatewayOption = { code: string; name: string };
type OnlineGatewayKind = 'stripe' | 'razorpay';

const getGatewayKindFromCode = (code: string): OnlineGatewayKind | null => {
    const c = code.trim().toLowerCase();
    if (!c) return null;
    if (c.startsWith('stripe')) return 'stripe';
    if (c.startsWith('razorpay')) return 'razorpay';
    return null;
};

interface ServiceOptions {
    pickup: boolean;
    delivery: boolean;
    dineIn: boolean;
    preOrderEnabled: boolean;
}

interface PaymentOption {
    enableAtCheckout: boolean;
    serviceOptions: ServiceOptions;
    autoAcceptOrder: boolean;
    nameAtCheckout: string;
    method: string;
    instructions: string;
    stripeConnected?: boolean;
}

export interface WalletPreviewData {
    orderAmountAfterRedemption: number;
    cashWalletAmount: number;
    loyaltyRedemptionValue?: number;
    loyaltyPoints?: number;
}

interface ChoosePaymentMethodProps {
    paymentOptions: PaymentOption[];
    orderType: string;
    setPaymentMethods: (method: string) => void;
    setSelectedIntegrationPayment?: (payment: SelectedIntegrationPayment | null) => void;
    cartTotal?: CartTotalSummary;
    cartTotalLoading?: boolean;
    cartItems?: CartItem[];
    onWalletPreviewData?: (data: WalletPreviewData | null) => void;
    /** When false, hide/disable Pay Online (Stripe/Razorpay). */
    enablePayOnline?: boolean;
}

const ChoosePaymentMethod = ({
    paymentOptions,
    orderType,
    setPaymentMethods,
    setSelectedIntegrationPayment,
    cartTotal,
    cartTotalLoading = false,
    cartItems,
    onWalletPreviewData,
    enablePayOnline = true,
}: ChoosePaymentMethodProps) => {
    const [bonusPointsChecked, setBonusPointsChecked] = useState(false);
    const [walletChecked, setWalletChecked] = useState(false);
    const [redemptionPreviewLoading, setRedemptionPreviewLoading] = useState<
        'bonus' | 'wallet' | null
    >(null);
    const [previewLoyaltyPoints, setPreviewLoyaltyPoints] = useState<number | null>(null);
    const [updatedWalletAmount, setUpdatedWalletAmount] = useState<number | null>(null);
    const [updatedLoyaltyPoints, setUpdatedLoyaltyPoints] = useState<number | null>(null);
    const cashPreviewRef = useRef<{ orderAmountAfterRedemption: number; cashWalletAmount: number } | null>(null);
    const loyaltyPreviewRef = useRef<{ orderAmountAfterRedemption: number; loyaltyRedemptionValue: number; loyaltyPoints: number } | null>(null);
    const [cashOrderAmountAfterRedemption, setCashOrderAmountAfterRedemption] = useState<number | null>(null);
    const [loyaltyOrderAmountAfterRedemption, setLoyaltyOrderAmountAfterRedemption] = useState<number | null>(null);
    const [pointsToCashAmount, setPointsToCashAmount] = useState<number | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [payOnlineTitle, setPayOnlineTitle] = useState('Pay Online');
    const [payOnlineConfigLoading, setPayOnlineConfigLoading] = useState(false);
    const [onlineGatewayOptions, setOnlineGatewayOptions] = useState<OnlineGatewayOption[]>([]);
    const [integrationPaymentsByCode, setIntegrationPaymentsByCode] = useState<Record<string, unknown>>({});
    const [selectedOnlineGatewayCode, setSelectedOnlineGatewayCode] = useState('');
    const [loyaltyInfoOpen, setLoyaltyInfoOpen] = useState(false);
    const [walletInfoOpen, setWalletInfoOpen] = useState(false);
    const [lang]: [TranslationKeys, LanguageCode] = useLang();
    const toast = useToast();
    const { data: session } = useSession() as { data: ExtendedSession | null };
    const userId = session?.user?.userId || session?.user?.id || '';
    const isLoggedIn = Boolean(userId);
    const { summary, loading: walletLoading, handleGetWallet } = useWallet();
    const cartItemsKey = useMemo(
        () =>
            cartItems
                ?.map((item) => `${item.id}:${item.quantity}:${item.finalPrice}`)
                .join('|') ?? '',
        [cartItems]
    );
    const prevCartItemsKeyRef = useRef<string | null>(null);

    useEffect(() => {
        if (!userId) return;
        handleGetWallet(userId, { page: 1, limit: 1 }).catch(() => undefined);
    }, [userId, handleGetWallet]);

    const cashBalance = summary?.cashBalance ?? 0;
    const loyaltyPointsBalance = summary?.loyaltyPoints ?? 0;
    const expiringPoints = summary?.expiringPoints;
    const expiringDate = summary?.expiringDate;
    const loyaltyCashEquivalent = pointsToCashAmount ?? summary?.loyaltyCashEquivalent ?? 0;
    const maxCashbackUsable = cartTotal?.maxCashbackUsable ?? 0;
    const maximumLoyaltyPointsUsable = cartTotal?.maximumLoyaltyPointsUsable ?? 0;
    const orderAmount = cartTotal?.finalAmount ?? 0;
    const cashWalletId = summary?.cashWalletId;
    const loyaltyWalletId = summary?.loyaltyWalletId;
    const currency =
        getTenantConfig().currencyCode?.trim().toUpperCase() || 'INR';
    const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || '';

    const displayableLoyaltyPoints = Math.min(loyaltyPointsBalance, maximumLoyaltyPointsUsable);

    const walletPayable =
        walletChecked ? cashOrderAmountAfterRedemption : null;
    const loyaltyPayable =
        bonusPointsChecked ? loyaltyOrderAmountAfterRedemption : null;

    // Effective payable is the lowest known total after applying redemptions.
    const payableAfterRedemption = Math.min(
        orderAmount,
        walletPayable ?? Number.POSITIVE_INFINITY,
        loyaltyPayable ?? Number.POSITIVE_INFINITY
    );

    const isZeroPayableAfterWallet = payableAfterRedemption <= 0;

    useEffect(() => {
        if (!isZeroPayableAfterWallet) return;

        // When payable becomes zero, lock order placement to CASH
        // and prevent online gateway selection from being used in payload.
        // Do NOT auto-select any payment option in the UI.
        setSelectedPaymentMethod('');
        setPaymentMethods('CASH');
        setSelectedIntegrationPayment?.(null);
        setSelectedOnlineGatewayCode('');
    }, [
        isZeroPayableAfterWallet,
        setPaymentMethods,
        setSelectedIntegrationPayment,
        setSelectedOnlineGatewayCode,
    ]);

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            try {
                setPayOnlineConfigLoading(true);
                const res = await getPaymentIntegrationConfig();
                const data = (res as unknown as { data?: Record<string, unknown> })?.data;
                const label = typeof data?.paymentLabel === 'string' ? data.paymentLabel : '';
                const payments = data?.payments;

                if (cancelled) return;

                if (label) setPayOnlineTitle(label);

                if (!Array.isArray(payments) || payments.length === 0) {
                    setOnlineGatewayOptions([]);
                    setIntegrationPaymentsByCode({});
                    return;
                }

                const byCode: Record<string, unknown> = {};
                const options: OnlineGatewayOption[] = [];

                for (const p of payments as Array<{ code?: unknown; name?: unknown }>) {
                    const rawCode = typeof p?.code === 'string' ? p.code.trim().toLowerCase() : '';
                    const name = typeof p?.name === 'string' ? p.name.trim() : '';
                    if (!rawCode || !name) continue;

                    const kind = getGatewayKindFromCode(rawCode);
                    if (!kind) continue;

                    // Keep API code dynamic (e.g. "stripe-app") as the key
                    byCode[rawCode] = p as unknown;
                    options.push({ code: rawCode, name });
                }

                setIntegrationPaymentsByCode(byCode);
                setOnlineGatewayOptions(options);
            } catch {
                // Keep default labels; user can still choose cash etc.
                if (!cancelled) {
                    setOnlineGatewayOptions([]);
                    setIntegrationPaymentsByCode({});
                }
            } finally {
                if (!cancelled) setPayOnlineConfigLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const points = displayableLoyaltyPoints;
        if (!points || !tenantId) return;
        convertPointsToCash({ tenantId, points })
            .then((res) => {
                if (res?.data?.cashAmount != null) {
                    setPointsToCashAmount(res.data.cashAmount);
                }
            })
            .catch(() => undefined);
    }, [displayableLoyaltyPoints, tenantId]);

    const isWalletSummaryLoading = walletLoading && !summary;
    const isCartTotalLoading = cartTotalLoading;
    // const formattedMaxCashbackUsable = formatCurrency({ amount: maxCashbackUsable }).trim();
    const formattedCashBalance = formatCurrency({ amount: cashBalance }).trim();
    const formattedLoyaltyEquivalent = formatCurrency({ amount: loyaltyCashEquivalent }).trim();

    const formatPointsDisplay = (points: number) =>
        Number.isInteger(points) ? points.toLocaleString() : points.toLocaleString(undefined, { maximumFractionDigits: 2 });

    const effectiveUsableLoyaltyPoints =
        previewLoyaltyPoints ?? maximumLoyaltyPointsUsable;

    const isCashStoreMethod = (m: string) => m === "CASH" || m === "PayByCash";
    const cashPayment = paymentOptions.find((opt) => isCashStoreMethod(opt.method));
    // const cardPayment = paymentOptions.find((opt) => opt.method === 'CreditOrDebitCard');
    const walletPayment = paymentOptions.find(opt => opt.method === 'CashWallet');
    const loyaltyPayment = paymentOptions.find(opt => opt.method === 'LoyaltyPoint');

    const isPaymentEnabledForOrderType = useCallback((payment: PaymentOption | undefined) => {
        if (!payment) return false;
        if (payment.method === 'CreditOrDebitCard') {
            if (!payment.stripeConnected) return false;
        } else {
            if (!payment.enableAtCheckout) return false;
        }
        switch (orderType) {
            case 'takeaway':
                return payment.serviceOptions.pickup;
            case 'delivery':
                return payment.serviceOptions.delivery;
            case 'dine-in':
                return payment.serviceOptions.dineIn;
            default:
                return false;
        }
    }, [orderType]);

    const walletDisabled =
        !walletChecked &&
        (isCartTotalLoading ||
            isWalletSummaryLoading ||
            cashBalance <= 0 ||
            maxCashbackUsable <= 0 ||
            redemptionPreviewLoading !== null ||
            isZeroPayableAfterWallet);

    const loyaltyDisabled =
        !bonusPointsChecked &&
        (isCartTotalLoading ||
            isWalletSummaryLoading ||
            loyaltyPointsBalance <= 0 ||
            effectiveUsableLoyaltyPoints <= 0 ||
            redemptionPreviewLoading !== null ||
            isZeroPayableAfterWallet);


    const renderPaymentMethodIcon = (iconSrc: string) => (
        <div
            className="flex md:h-11 md:w-11 h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F9F7F0]"
            aria-hidden
        >
            <img src={iconSrc} alt="" width={22} height={2} className="shrink-0 md:w-[22px] md:h-[22px] w-4 h-4" />
        </div>
    );

    const renderExpiringPointsNotice = () => {
        if (isWalletSummaryLoading) {
            return (
                <div className="mt-2">
                    <Shimmer width="72%" height={24} borderRadius={12} />
                </div>
            );
        }

        if (!expiringPoints || expiringPoints <= 0 || !expiringDate) return null;

        return (
            <p className="choose-payment-method-expiring extra-small-font md-heading-6 m-0 mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-[#F9F7F0] px-2.5 py-1">
                <img src={TRANSACTION_INFO_ICON} alt="" width={14} height={14} className="shrink-0" />
                <span>
                    {formatTemplate(lang.walletPage.pointsExpiring, {
                        points: expiringPoints.toLocaleString(),
                        date: expiringDate,
                    })}
                </span>
            </p>
        );
    };

    const renderPaymentCheckbox = (checked: boolean, disabled: boolean) => (
        <div
            className={`choose-payment-method-checkbox-box flex-shrink-0 mt-2.5 ${disabled ? 'opacity-50' : ''}`}
            aria-hidden
        >
            <div
                className={`w-5 h-5 rounded-md border-2 border-[var(--rating-border-primary)] flex items-center justify-center ${
                    checked
                        ? 'choose-payment-method-checkbox-checked'
                        : 'choose-payment-method-checkbox-unchecked'
                }`}
            >
                {checked && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                )}
            </div>
        </div>
    );

    const renderSelectableCard = (
        cardKey: string,
        checked: boolean,
        disabled: boolean,
        method: string | undefined,
        optionId: 'bonus' | 'wallet',
        children: React.ReactNode
    ) => (
        <div
            key={cardKey}
            role="checkbox"
            aria-checked={checked}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            className={`choose-payment-method-wallet-card relative rounded-lg border p-4 ${
                checked
                    ? 'choose-payment-method-checkbox-checked-bg'
                    : 'choose-payment-method-checkbox-unchecked-bg'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={() =>
                !disabled && method && handleCheckboxChange(optionId, method, !checked)
            }
            onKeyDown={(e) => {
                if (disabled || !method) return;
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCheckboxChange(optionId, method, !checked);
                }
            }}
        >
            <div className="flex items-start gap-3">
                {renderPaymentCheckbox(checked, disabled)}
                {children}
            </div>
        </div>
    );

    const radioOptions = useMemo(() => [
        {
            id: 'cod',
            title: cashPayment?.nameAtCheckout || 'Cash on Delivery',
            instructions: lang.paymentPayByCashDescription,
            disabled: !isPaymentEnabledForOrderType(cashPayment) || isZeroPayableAfterWallet,
            method: cashPayment ? "CASH" : undefined,
        },
        {
            id: 'pay-online',
            title: payOnlineTitle,
            instructions: lang.paymentPayOnlineDescription,
            disabled:
                isZeroPayableAfterWallet ||
                !enablePayOnline ||
                (!payOnlineConfigLoading && onlineGatewayOptions.length === 0),
            method: PAY_ONLINE_METHOD_ID,
        },
    ], [
        cashPayment,
        payOnlineTitle,
        isPaymentEnabledForOrderType,
        isZeroPayableAfterWallet,
        lang.paymentPayByCashDescription,
        lang.paymentPayOnlineDescription,
        enablePayOnline,
        payOnlineConfigLoading,
        onlineGatewayOptions.length,
    ]);

    useEffect(() => {
        if (!enablePayOnline && selectedPaymentMethod === PAY_ONLINE_METHOD_ID) {
            clearPayOnlineSelection();
        }
    }, [enablePayOnline, selectedPaymentMethod]);

    const clearPayOnlineSelection = () => {
        setSelectedPaymentMethod('');
        setPaymentMethods('');
        setSelectedIntegrationPayment?.(null);
        setSelectedOnlineGatewayCode('');
    };

    const loadIntegrationPayment = async (gatewayCode: string) => {
        const paymentConfig = integrationPaymentsByCode[gatewayCode] as
            | { code?: unknown }
            | undefined;

        if (!paymentConfig || typeof paymentConfig !== 'object') {
            toast('error', 'Online payment is not available for this store.');
            setPaymentMethods('');
            setSelectedIntegrationPayment?.(null);
            return;
        }

        const mapped = mapIntegrationPaymentToOrderFields(paymentConfig as never);
        if (!mapped) {
            toast('error', 'Online payment is not available for this store.');
            setPaymentMethods('');
            setSelectedIntegrationPayment?.(null);
            return;
        }

        setPaymentMethods(mapped.paymentMethod);
        setSelectedIntegrationPayment?.(mapped);
    };

    const handleOnlineGatewaySelect = async (gatewayCode: string) => {
        setSelectedOnlineGatewayCode(gatewayCode);
        await loadIntegrationPayment(gatewayCode);
    };

    const handlePayOnlineClick = async () => {
        if (payOnlineConfigLoading) return;

        setSelectedPaymentMethod(PAY_ONLINE_METHOD_ID);
        setPaymentMethods('');
        setSelectedIntegrationPayment?.(null);
        setSelectedOnlineGatewayCode('');

        // If only one gateway is configured, select it silently (no 2-option UI)
        if (onlineGatewayOptions.length === 1) {
            const onlyGatewayCode = onlineGatewayOptions[0]?.code ?? '';
            if (onlyGatewayCode) {
                await handleOnlineGatewaySelect(onlyGatewayCode);
            }
        }
    };

    const applyWalletSelection = (
        optionId: 'bonus' | 'wallet',
        method: string,
        selected: boolean
    ) => {
        const nextBonusChecked = optionId === 'bonus' ? selected : bonusPointsChecked;
        const nextWalletChecked = optionId === 'wallet' ? selected : walletChecked;

        if (optionId === 'bonus') {
            setBonusPointsChecked(selected);
            if (!selected) {
                loyaltyPreviewRef.current = null;
                setLoyaltyOrderAmountAfterRedemption(null);
                setUpdatedLoyaltyPoints(null);
                if (!nextWalletChecked) setUpdatedWalletAmount(null);
                if (nextWalletChecked && cashPreviewRef.current) {
                    onWalletPreviewData?.({
                        orderAmountAfterRedemption: cashPreviewRef.current.orderAmountAfterRedemption,
                        cashWalletAmount: cashPreviewRef.current.cashWalletAmount,
                    });
                } else {
                    onWalletPreviewData?.(null);
                }
            }
        } else {
            setWalletChecked(selected);
            if (!selected) {
                cashPreviewRef.current = null;
                setCashOrderAmountAfterRedemption(null);
                setPreviewLoyaltyPoints(null);
                setUpdatedWalletAmount(null);
                if (!nextBonusChecked) setUpdatedLoyaltyPoints(null);
                if (nextBonusChecked && loyaltyPreviewRef.current) {
                    onWalletPreviewData?.({
                        orderAmountAfterRedemption: loyaltyPreviewRef.current.orderAmountAfterRedemption,
                        cashWalletAmount: 0,
                        loyaltyRedemptionValue: loyaltyPreviewRef.current.loyaltyRedemptionValue,
                        loyaltyPoints: loyaltyPreviewRef.current.loyaltyPoints,
                    });
                } else {
                    onWalletPreviewData?.(null);
                }
            }
        }

        if (!nextWalletChecked && !nextBonusChecked && !selectedPaymentMethod) {
            const firstEnabled = radioOptions.find(opt => !opt.disabled && opt.method);
            if (firstEnabled?.method) {
                setSelectedPaymentMethod(firstEnabled.method);
                setPaymentMethods(firstEnabled.method);
            }
        }
    };

    useEffect(() => {
        const prev = prevCartItemsKeyRef.current;
        if (prev === null) {
            prevCartItemsKeyRef.current = cartItemsKey;
            return;
        }
        if (prev === cartItemsKey) return;
        prevCartItemsKeyRef.current = cartItemsKey;

        if (walletChecked && walletPayment?.method) {
            applyWalletSelection('wallet', walletPayment.method, false);
        }
        if (bonusPointsChecked && loyaltyPayment?.method) {
            applyWalletSelection('bonus', loyaltyPayment.method, false);
        }
        // Only react to cart item changes; wallet/loyalty state read from this render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cartItemsKey]);

    const fetchRedemptionPreview = async (
        optionId: 'bonus' | 'wallet',
        options?: { pointsAmountOverride?: number; forceRecompute?: boolean }
    ) => {
        if (!options?.forceRecompute) {
            if (optionId === 'wallet' && walletChecked) return true;
            if (optionId === 'bonus' && bonusPointsChecked) return true;
        }

        const walletId = optionId === 'wallet' ? cashWalletId : loyaltyWalletId;

        if (!walletId) {
            toast('error', 'Wallet is not available. Please try again.');
            return false;
        }

        if (orderAmount <= 0) {
            toast('error', 'Order total is not available. Please try again.');
            return false;
        }

        setRedemptionPreviewLoading(optionId);

        try {
            if (optionId === 'wallet') {
                const walletOrderAmount =
                    bonusPointsChecked && loyaltyPreviewRef.current
                        ? loyaltyPreviewRef.current.orderAmountAfterRedemption
                        : orderAmount;
                const effectiveCashAmount = Math.min(maxCashbackUsable, cashBalance, walletOrderAmount);
                const res = await previewWalletRedemption({
                    userId,
                    tenantId,
                    redemptionType: [1],
                    currency,
                    orderAmount: walletOrderAmount,
                    amount: effectiveCashAmount,
                });
                if (!bonusPointsChecked && res?.data?.usableLoyaltyPointsAmount != null) {
                    setPreviewLoyaltyPoints(res.data.usableLoyaltyPointsAmount);
                }
                if (res?.data?.updatedWalletAmount != null) {
                    setUpdatedWalletAmount(res.data.updatedWalletAmount);
                }
                if (!bonusPointsChecked && res?.data?.updatedLoyaltyPoints != null) {
                    setUpdatedLoyaltyPoints(res.data.updatedLoyaltyPoints);
                }
                if (res?.data?.orderAmountAfterRedemption != null) {
                    cashPreviewRef.current = {
                        orderAmountAfterRedemption: res.data.orderAmountAfterRedemption,
                        cashWalletAmount: effectiveCashAmount,
                    };
                    setCashOrderAmountAfterRedemption(res.data.orderAmountAfterRedemption);
                    onWalletPreviewData?.({
                        orderAmountAfterRedemption: res.data.orderAmountAfterRedemption,
                        cashWalletAmount: effectiveCashAmount,
                        loyaltyRedemptionValue: bonusPointsChecked
                            ? loyaltyPreviewRef.current?.loyaltyRedemptionValue
                            : undefined,
                        loyaltyPoints: bonusPointsChecked
                            ? loyaltyPreviewRef.current?.loyaltyPoints
                            : undefined,
                    });
                }
            } else {
                const loyaltyOrderAmount =
                    walletChecked && cashPreviewRef.current
                        ? cashPreviewRef.current.orderAmountAfterRedemption
                        : orderAmount;
                const requestedPoints =
                    options?.pointsAmountOverride ?? previewLoyaltyPoints ?? maximumLoyaltyPointsUsable;
                const pointsToRedeem = Math.min(
                    requestedPoints,
                    loyaltyPointsBalance,
                    loyaltyOrderAmount
                );
                const res = await previewWalletRedemption({
                    userId,
                    tenantId,
                    redemptionType: [2],
                    currency,
                    orderAmount: loyaltyOrderAmount,
                    pointsAmount: pointsToRedeem,
                });
                if (res?.data) {
                    loyaltyPreviewRef.current = {
                        orderAmountAfterRedemption: res.data.orderAmountAfterRedemption,
                        loyaltyRedemptionValue: res.data.totalRedemptionValue,
                        loyaltyPoints: pointsToRedeem,
                    };
                    setLoyaltyOrderAmountAfterRedemption(res.data.orderAmountAfterRedemption);
                    if (!walletChecked && res.data.updatedWalletAmount != null) {
                        setUpdatedWalletAmount(res.data.updatedWalletAmount);
                    }
                    if (res.data.updatedLoyaltyPoints != null) {
                        setUpdatedLoyaltyPoints(res.data.updatedLoyaltyPoints);
                    }
                    onWalletPreviewData?.({
                        orderAmountAfterRedemption: res.data.orderAmountAfterRedemption,
                        cashWalletAmount: walletChecked ? (cashPreviewRef.current?.cashWalletAmount ?? 0) : 0,
                        loyaltyRedemptionValue: res.data.totalRedemptionValue,
                        loyaltyPoints: pointsToRedeem,
                    });
                }
            }
            return true;
        } catch {
            toast('error', 'Could not preview wallet redemption. Please try again.');
            return false;
        } finally {
            setRedemptionPreviewLoading(null);
        }
    };

    const handleCheckboxChange = async (
        optionId: 'bonus' | 'wallet',
        method: string,
        newValue: boolean
    ) => {
        if (!method || redemptionPreviewLoading) return;

        if (!newValue) {
            applyWalletSelection(optionId, method, false);

            if (optionId === 'wallet' && bonusPointsChecked) {
                await fetchRedemptionPreview('bonus', {
                    pointsAmountOverride: maximumLoyaltyPointsUsable,
                    forceRecompute: true,
                });
            } else if (optionId === 'bonus' && walletChecked) {
                await fetchRedemptionPreview('wallet', { forceRecompute: true });
            }
            return;
        }

        const previewOk = await fetchRedemptionPreview(optionId);
        if (!previewOk) return;

        applyWalletSelection(optionId, method, true);
    };

    const handleRadioChange = async (methodId: string) => {
        const option = radioOptions.find((opt) => opt.method === methodId);
        if (!option || option.disabled || !methodId) return;

        if (methodId === PAY_ONLINE_METHOD_ID) {
            await handlePayOnlineClick();
            return;
        }

        setSelectedPaymentMethod(methodId);
        setPaymentMethods(methodId);
        setSelectedIntegrationPayment?.(null);
        setSelectedOnlineGatewayCode('');
    };

    const handleAddMoneyClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        open_dialog('addMoney', {
            open: true,
            propsData: {},
            type: 'addMoney',
            handlerDialog: () => {},
            handleClose: () => {},
            anchor: 'bottom',
        });
    };

    const handleLoyaltyInfoClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLoyaltyInfoOpen(true);
    };

    const handleWalletInfoClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setWalletInfoOpen(true);
    };

    return (
        <div className="choose-payment-method-container p-4 mb-5">
            <h2 className="choose-payment-method-label mb-6">{lang.paymentMethod}</h2>

            <div className="choose-payment-method-options space-y-3">
                {isLoggedIn && walletPayment &&
                    renderSelectableCard(
                        'wallet',
                        walletChecked,
                        walletDisabled,
                        walletPayment.method,
                        'wallet',
                        <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                            {renderPaymentMethodIcon(CASH_WALLET_ICON)}
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <h3 className="choose-payment-method-card-title m-0">
                                        {walletPayment.nameAtCheckout || lang.walletPage.cashWallet}
                                    </h3>
                                    <button
                                        type="button"
                                        className="choose-payment-method-info-btn"
                                        onClick={handleWalletInfoClick}
                                        aria-label={lang.walletPage.cashWalletInfoTitle}
                                    >
                                        <InfoIcon width={16} height={16} className="shrink-0" />
                                    </button>
                                    {/* {isWalletSummaryLoading ? (
                                        <Shimmer width={64} height={18} borderRadius={4} />
                                    ) : (
                                        <span className="choose-payment-method-title-wallet-value m-0">
                                            {formattedMaxCashbackUsable}
                                        </span>
                                    )} */}
                                </div>
                                <button
                                    type="button"
                                    className="choose-payment-method-inline-link mt-1"
                                    onClick={handleAddMoneyClick}
                                >
                                    {lang.walletPage.addMoney}
                                </button>
                            </div>
                            <div className="shrink-0 text-right">
                                {isCartTotalLoading ? (
                                    <Shimmer width={80} height={22} borderRadius={4} />
                                ) : (
                                    <>
                                        <p className="choose-payment-method-balance-value m-0">
                                            {walletChecked && updatedWalletAmount != null
                                                ? formatCurrency({ amount: updatedWalletAmount }).trim()
                                                : formattedCashBalance}
                                        </p>
                                        <p className="choose-payment-method-balance-label m-0">
                                            {lang.paymentBalanceLabel}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                {isLoggedIn && loyaltyPayment &&
                    renderSelectableCard(
                        'loyalty',
                        bonusPointsChecked,
                        loyaltyDisabled,
                        loyaltyPayment.method,
                        'bonus',
                <div className="flex flex-col gap-2 w-full">
                        <div className="choose-payment-method-loyalty-card flex min-w-0 flex-1 items-start justify-between gap-3">
                            <div className="loyalty-card-icon shrink-0">
                                {renderPaymentMethodIcon(COIN_ICON)}
                            </div>
                            <div className="choose-payment-method-loyalty-main min-w-0 flex-1">
                                <div className="loyalty-card-title-wrap">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <h3 className="choose-payment-method-card-title m-0">
                                            {loyaltyPayment.nameAtCheckout || lang.walletPage.loyaltyPointsInfoTitle}
                                        </h3>
                                        <button
                                            type="button"
                                            className="choose-payment-method-info-btn"
                                            onClick={handleLoyaltyInfoClick}
                                            aria-label={lang.walletPage.loyaltyPointsInfoTitle}
                                        >
                                            <InfoIcon width={16} height={16} className="shrink-0" />
                                        </button>
                                    </div>
                                </div>
                                <div className="loyalty-card-details">
                                    {isCartTotalLoading ? (
                                        <p className="choose-payment-method-loyalty-apply m-0 mt-1">
                                            <Shimmer width="100%" height={14} borderRadius={4} />
                                        </p>
                                    ) : bonusPointsChecked ? (
                                        <p className="choose-payment-method-loyalty-apply m-0 mt-1 flex flex-wrap items-center gap-1">
                                            <img src={TICK_CIRCLE_ICON} alt="" width={18} height={18} className="shrink-0" />
                                            <span className="flex items-center gap-1 font-700" style={{ color: 'var(--success)' }}>
                                                <img src={COIN_ICON} alt="" width={14} height={14} className="shrink-0" />
                                                {formatTemplate(lang.paymentLoyaltyAppliedText, {
                                                    points: formatPointsDisplay(
                                                        loyaltyPreviewRef.current?.loyaltyPoints ??
                                                            previewLoyaltyPoints ??
                                                            maximumLoyaltyPointsUsable
                                                    ),
                                                })}
                                            </span>
                                            <span>
                                                {formatTemplate(lang.paymentLoyaltySavedText, {
                                                    amount: formatCurrency({ amount: loyaltyPreviewRef.current?.loyaltyRedemptionValue ?? loyaltyCashEquivalent }).trim(),
                                                })}
                                            </span>
                                        </p>
                                    ) : (
                                        <p className="choose-payment-method-loyalty-apply m-0 mt-1">
                                            {formatTemplate(lang.paymentApplyLoyaltyDescription, {
                                                points: formatPointsDisplay(displayableLoyaltyPoints),
                                                amount: formattedLoyaltyEquivalent,
                                            })}
                                        </p>
                                    )}
                                    
                                </div>
                            </div>
                            <div className="loyalty-card-points shrink-0 text-right">
                                {isCartTotalLoading ? (
                                    <Shimmer width={72} height={22} borderRadius={4} />
                                ) : (
                                    <>
                                        <div className="flex items-center justify-end gap-1">
                                            <img
                                                src={COIN_ICON}
                                                alt=""
                                                width={20}
                                                height={20}
                                                className="shrink-0"
                                            />
                                            <p className="choose-payment-method-points-value m-0">
                                                {bonusPointsChecked && updatedLoyaltyPoints != null
                                                    ? formatPointsDisplay(updatedLoyaltyPoints)
                                                    : formatPointsDisplay(loyaltyPointsBalance)}
                                            </p>
                                        </div>
                                        {loyaltyCashEquivalent > 0 && (
                                            <p className="choose-payment-method-points-equiv m-0">
                                                {formatTemplate(lang.walletPage.equalsApprox, {
                                                    amount: formattedLoyaltyEquivalent,
                                                })}
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        {renderExpiringPointsNotice()}
                        </div>
                    )}

                {/* Radio Options */}
                {radioOptions.map((option) => {
                    const isPayOnlineOption = option.id === 'pay-online';
                    const isPayOnlineLoading = isPayOnlineOption && payOnlineConfigLoading;
                    const isRowDisabled = option.disabled && !isPayOnlineLoading;
                    const isSelected = selectedPaymentMethod === option.method;

                    return (
                    <div key={option.id}>
                        <div
                            onClick={() =>
                                !isPayOnlineLoading &&
                                !option.disabled &&
                                handleRadioChange(option.method || '')
                            }
                            className={`${
                                isPayOnlineLoading
                                    ? 'pointer-events-none'
                                    : isRowDisabled
                                      ? 'opacity-50 cursor-not-allowed'
                                      : 'cursor-pointer'
                            }`}
                            aria-busy={isPayOnlineLoading || undefined}
                        >
                            <div className="flex items-start space-x-3">
                                {/* Radio Button */}
                                <div className="flex-shrink-0 mt-1">
                                    <div
                                        className={`w-5 h-5 rounded-full border-2 border-[var(--rating-border-primary)] flex items-center justify-center ${
                                            isSelected
                                                ? 'choose-payment-method-radio-checked'
                                                : 'choose-payment-method-radio-unchecked'
                                        } ${isRowDisabled ? 'opacity-50' : ''}`}
                                    >
                                        {isSelected && !isPayOnlineLoading && (
                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                        <h3 className="choose-payment-method-radio-title">
                                            {isPayOnlineLoading ? (
                                                <span
                                                    className="choose-payment-method-pay-online-loading-slot"
                                                    role="status"
                                                    aria-label="Loading payment options"
                                                >
                                                    <Loader size={20} />
                                                </span>
                                            ) : (
                                                option.title
                                            )}
                                        </h3>
                                    </div>
                                    {option.instructions && (
                                        <div className="choose-payment-method-radio-description">
                                            {parse(option.instructions)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isPayOnlineOption && isSelected && onlineGatewayOptions.length > 1 && (
                            <div className="mt-3 grid grid-cols-2 gap-3 max-[420px]:grid-cols-1">
                                {onlineGatewayOptions.map((g) => {
                                    const kind = getGatewayKindFromCode(g.code);
                                    const isSelectedGateway = selectedOnlineGatewayCode === g.code;
                                    const iconSrc =
                                        kind === 'stripe'
                                            ? STRIPE_ICON
                                            : kind === 'razorpay'
                                              ? RAZORPAY_ICON
                                              : '';
                                    const alt =
                                        kind === 'stripe'
                                            ? 'Stripe'
                                            : kind === 'razorpay'
                                              ? 'Razorpay'
                                              : 'Online payment';
                                    const subtitle =
                                        kind === 'stripe'
                                            ? lang.paymentStripeSubtitle
                                            : kind === 'razorpay'
                                              ? lang.paymentRazorpaySubtitle
                                              : '';

                                    return (
                                        <PaymentGatewayOptionCard
                                            key={g.code}
                                            selected={isSelectedGateway}
                                            disabled={payOnlineConfigLoading}
                                            onSelect={() => handleOnlineGatewaySelect(g.code)}
                                            title={g.name}
                                            subtitle={subtitle || undefined}
                                            iconSrc={iconSrc || undefined}
                                            iconAlt={alt}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    );
                })}
            </div>

            <CustomDialog
                open={loyaltyInfoOpen}
                anchor="bottom"
                type="walletInfo"
                propsData={{
                    title: lang.walletPage.loyaltyPointsInfoTitle,
                    description: lang.walletPage.loyaltyPointsInfoDescription,
                }}
                handlerDialog={() => {}}
                handleClose={() => setLoyaltyInfoOpen(false)}
                drawerBorderRadius="12px"
                sxStyle={{
                    '& .MuiPaper-root': {
                        maxWidth: '420px',
                        width: 'calc(100% - 24px)',
                        borderRadius: '12px',
                        margin: '0 auto',
                        bottom: '30px',
                    },
                    '& .MuiDialogContent-root': {
                        padding: 0,
                    },
                }}
            />

            <CustomDialog
                open={walletInfoOpen}
                anchor="bottom"
                type="walletInfo"
                propsData={{
                    title: lang.walletPage.cashWalletInfoTitle,
                    description: lang.walletPage.cashWalletInfoDescription,
                }}
                handlerDialog={() => {}}
                handleClose={() => setWalletInfoOpen(false)}
                drawerBorderRadius="12px"
                sxStyle={{
                    '& .MuiPaper-root': {
                        maxWidth: '420px',
                        width: 'calc(100% - 24px)',
                        borderRadius: '12px',
                        margin: '0 auto',
                        bottom: '30px',
                    },
                    '& .MuiDialogContent-root': {
                        padding: 0,
                    },
                }}
            />

            <style>{`
        .choose-payment-method-container {
            width: 100%;
            background-color: var(--cards-containers);
            border-radius: 8px;
            border: 1px solid var(--borders-dividers);
            margin-bottom: 18px;
        }
        .choose-payment-method-label{
            color: var(--primary-text);
            font-size: var(--heading-h4);
            font-weight: var(--font-bold);
        }
        .choose-payment-method-pay-online-loading-slot {
            display: inline-flex;
            align-items: center;
            justify-content: flex-start;
            min-height: 22px;
        }
        .choose-payment-method-pay-online-loading-slot > div {
            justify-content: flex-start;
        }
        .choose-payment-method-checkbox-checked{
            background-color: var(--primary-color);
            border-color: var(--primary-color);
        }
        .choose-payment-method-checkbox-unchecked{
            background-color: var(--cards-containers);
        }
        .choose-payment-method-wallet-card{
            border-color: var(--borders-dividers);
        }
        .choose-payment-method-card-title{
            color: var(--primary-text);
            font-size: var(--description-font);
            font-weight: var(--font-medium);
            line-height: 1.3;
        }
        .choose-payment-method-title-wallet-value{
            color: var(--primary-text);
            font-size: var(--description-font);
            font-weight: var(--font-bold);
            line-height: 1.3;
        }
        .choose-payment-method-title-points .choose-payment-method-title-wallet-value{
            color: #8D29F7;
        }
        .choose-payment-method-info-btn{
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            border: 0;
            background: transparent;
            cursor: pointer;
            line-height: 0;
        }
        .choose-payment-method-inline-link{
            display: inline-block;
            padding: 0;
            border: 0;
            background: transparent;
            color: #007AFF;
            font-size: var(--small-font);
            font-weight: var(--font-regular);
            cursor: pointer;
            text-align: left;
        }
        .choose-payment-method-balance-value{
            color: var(--primary-text);
            font-size: var(--heading-h4);
            font-weight: var(--font-bold);
            line-height: 1.2;
        }
        .choose-payment-method-balance-label{
            color: var(--secondary-text);
            font-size: var(--small-font);
            font-weight: var(--font-regular);
            margin-top: 2px;
        }
        .choose-payment-method-loyalty-apply{
            color: var(--secondary-text);
            font-size: var(--small-font);
            font-weight: var(--font-regular);
            line-height: 1.4;
        }
        .choose-payment-method-expiring{
            color: var(--warning-light);
            font-weight: var(--font-medium);
            line-height: 1.3;
        }
        .choose-payment-method-points-value{
            color: #8D29F7;
            font-size: var(--heading-h4);
            font-weight: var(--font-bold);
            line-height: 1.2;
        }
        .choose-payment-method-points-equiv{
            color: var(--secondary-text);
            font-size: var(--small-font);
            font-weight: var(--font-regular);
            margin-top: 2px;
        }
        .choose-payment-method-radio-checked{
            background-color: var(--primary-color);
            border-color: var(--primary-color);
        }
        .choose-payment-method-radio-unchecked{
            background-color: var(--cards-containers);
        }
        .choose-payment-method-checkbox-checked-bg{
            background-color: var(--primary-active-background);
            border-color: var(--cta-hover);
            border-radius: 8px;
        }
        .choose-payment-method-checkbox-unchecked-bg{
            background-color: var(--cards-containers);
        }
        .choose-payment-method-radio-title{
            color: var(--primary-text);
            font-size: var(--description-font);
            font-weight: var(--font-medium);
            margin-top: 2px;
        }
        .choose-payment-method-radio-description{
            color: var(--secondary-text);
            font-size: var(--small-font);
            font-weight: var(--font-regular);
        }
        @media (max-width: 767px) {
            .choose-payment-method-loyalty-card{
                display: grid;
                grid-template-columns: auto minmax(0, 1fr) auto;
                column-gap: 12px;
                row-gap: 8px;
                align-items: start;
            }
            .choose-payment-method-loyalty-main{
                display: contents;
            }
            .loyalty-card-icon{
                grid-column: 1;
                grid-row: 1;
            }
            .loyalty-card-title-wrap{
                grid-column: 2;
                grid-row: 1;
                min-width: 0;
            }
            .loyalty-card-points{
                grid-column: 3;
                grid-row: 1;
            }
            .loyalty-card-details{
                grid-column: 1 / -1;
                grid-row: 2;
                width: 100%;
            }
            .loyalty-card-details .choose-payment-method-expiring{
                display: flex;
                width: 100%;
                align-items: flex-start;
                gap: 6px;
                padding: 6px 10px;
            }
            .loyalty-card-details .choose-payment-method-expiring img{
                margin-top: 2px;
            }
            .loyalty-card-details .choose-payment-method-expiring span{
                min-width: 0;
                flex: 1;
                line-height: 1.4;
            }
            .choose-payment-method-loyalty-apply{
                line-height: 1.5;
            }
        }
        @media (max-width: 768px) {
            .choose-payment-method-container{
                border-radius: 0px !important;
                margin-bottom: 0px;
            }
            .choose-payment-method-label{
                font-size: var(--heading-h5);
            }
            .choose-payment-method-card-title{
                font-size: var(--heading-6);
            }
        }
      `}</style>
        </div>
    );
};

export default ChoosePaymentMethod;