'use client';

import { useState } from 'react';
import CustomDialog from '@components/dialogDrawer/dialog';
import Shimmer from '@components/ui/Shimmer';
import {
    ADD_ICON,
    CASH_WALLET_ICON,
    COIN_ICON,
    TRANSACTION_INFO_ICON,
} from '@config/Header/image.config';
import useLang from '@hooks/useLang';
import useWallet from '@hooks/useWallet';
import formatCurrency from '@lib/helper/price';
import { open_dialog } from '@lib/modalHandler';

type WalletInfoDialogType = 'cash' | 'loyalty' | null;

const formatTemplate = (template: string, vars: Record<string, string>) =>
    Object.entries(vars).reduce(
        (result, [key, value]) => result.replace(`{${key}}`, value),
        template
    );

const WALLET_VALUE_SHIMMER = {
    baseColor: 'rgba(255,255,255,0.25)',
    shimmerColor: 'rgba(255,255,255,0.45)',
} as const;

const ADD_MONEY_DIALOG_SX = {
    '& .MuiPaper-root': {
        width: '100%',
        margin: '0 auto',
        '@media (max-width: 768px)': {
            maxWidth: '100%',
            height: '100%',
            borderRadius: 0,
            margin: 0,
            backgroundColor: 'var(--tertiary-background)',
        },
        '@media (min-width: 769px)': {
            maxWidth: '480px',
            borderRadius: '12px',
            backgroundColor: 'var(--cards-containers)',
        },
    },
    '& .mobile-drawer-content': {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
    },
    '& .MuiDialogContent-root': {
        padding: 0,
    },
} as const;

const WalletSummaryCard: React.FC = () => {
    const [lang] = useLang();
    const { summary } = useWallet();
    const [infoDialog, setInfoDialog] = useState<WalletInfoDialogType>(null);
    const isValueLoading = !summary;

    const walletBalance = summary?.cashBalance ?? 0;
    const loyaltyPointsBalance = summary?.loyaltyPoints ?? 0;
    const loyaltyCashEquivalent = summary?.loyaltyCashEquivalent ?? 0;
    const lifetimeEarnedPoints = summary?.lifetimeEarnedPoints ?? 0;
    const expiringPoints = summary?.expiringPoints;
    const expiringDate = summary?.expiringDate;

    const formattedBalance = formatCurrency({ amount: walletBalance }).trim();
    const formattedEquivalent = formatCurrency({ amount: loyaltyCashEquivalent }).trim();

    const walletInfoDialogContent =
        infoDialog === 'cash'
            ? {
                  title: lang.walletPage.cashWalletInfoTitle,
                  description: lang.walletPage.cashWalletInfoDescription,
              }
            : infoDialog === 'loyalty'
              ? {
                    title: lang.walletPage.loyaltyPointsInfoTitle,
                    description: lang.walletPage.loyaltyPointsInfoDescription,
                }
              : null;

    return (
        <>
        <div className="overflow-hidden rounded-3xl text-[var(--white)]">
            <section className="p-4 md:p-5 bg-[linear-gradient(97.53deg,#FE8109_0%,#EB56DC_100%)]">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="extra-small-font md-heading-6 uppercase text-[var(--white)] opacity-95">
                        {lang.walletPage.cashWallet}
                    </span>
                    <button
                        type="button"
                        onClick={() => setInfoDialog('cash')}
                        className="extra-small-font md-heading-6 cursor-pointer whitespace-nowrap border-0 bg-transparent p-0 text-[var(--white)] underline"
                    >
                        {lang.walletPage.howToEarn}
                    </button>
                </div>
                <div className="flex flex-col items-start justify-between gap-3 md:flex-row flex-wrap">
                    <div className="flex flex-col min-w-0 items-start gap-3">
                    <div className="flex items-center gap-1">
                        <img
                            src={CASH_WALLET_ICON}
                            alt=""
                            width={40}
                            height={40}
                            className="shrink-0 w-[30px] h-[30px] md:w-10 md:h-10"
                        />
                          {isValueLoading ? (
                                <Shimmer
                                    height={36}
                                    width={120}
                                    borderRadius={6}
                                    className="mb-2"
                                    {...WALLET_VALUE_SHIMMER}
                                />
                            ) : (
                                <p className="heading-3 md-heading-1 text-[var(--tertiary-background)] font-700 m-0 mb-2 leading-tight">
                                    {formattedBalance}
                                </p>
                            )}
                            
                        </div>
                        <span className="extra-small-font inline-block rounded-[20px] md:rounded bg-[#87470633] md:bg-white/30  px-1.5 py-1">
                                {lang.walletPage.useUnrestricted}
                            </span>
                    </div>
                    <button
                        type="button"
                        onClick={() =>
                            open_dialog('addMoney', {
                                open: true,
                                type: 'addMoney',
                                handlerDialog: () => {},
                                handleClose: () => {},
                                anchor: 'bottom',
                                propsData: {},
                                dialogPosition: 'center',
                                drawerBorderRadius: '0',
                                sxStyle: ADD_MONEY_DIALOG_SX,
                            })
                        }
                        className="inline-flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-[10px] border-0 bg-[var(--tertiary-background)] py-2 px-3 md:py-2.5 extra-small-font md-heading-6 font-500 text-[var(--primary-text)]"
                    >
                        <img src={ADD_ICON} alt="" width={19} height={19} className="shrink-0" />
                        <span>{lang.walletPage.addMoney}</span>
                    </button>
                </div>
            </section>

            <section className="p-4 md:p-5 bg-[linear-gradient(107.63deg,#B350FF_9.77%,#8D29F7_94.72%)]">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="extra-small-font md-heading-6 uppercase text-[var(--tertiary-background)] opacity-95">
                        {lang.walletPage.loyaltyPointsLabel}
                    </span>
                    <button
                        type="button"
                        onClick={() => setInfoDialog('loyalty')}
                        className="extra-small-font md-heading-6 cursor-pointer whitespace-nowrap border-0 bg-transparent p-0 text-[var(--white)] underline"
                    >
                        {lang.walletPage.howToEarn}
                    </button>
                </div>
                <div className="flex flex-col items-start justify-between gap-3 md:flex-row flex-wrap">
                    <div className="flex min-w-0 items-start gap-1">
                        <img src={COIN_ICON} alt="" width={40} height={40} className="shrink-0 w-[30px] h-[30px] md:w-10 md:h-10" />
                        <div>
                            {isValueLoading ? (
                                <Shimmer
                                    height={36}
                                    width={140}
                                    borderRadius={6}
                                    className="mb-1"
                                    {...WALLET_VALUE_SHIMMER}
                                />
                            ) : (
                                <p className="heading-3 md-heading-1 font-700 m-0 mb-1 leading-tight text-[var(--tertiary-background)]">
                                    {loyaltyPointsBalance.toLocaleString()}
                                    <span className="extra-small-font inline-block">{lang.walletPage.pointsUnit}</span>
                                </p>
                            )}
                            {loyaltyCashEquivalent > 0 && (
                                <p className="heading-6 font-400 m-0 opacity-90">
                                    {formatTemplate(lang.walletPage.equalsApprox, {
                                        amount: formattedEquivalent,
                                    })}
                                </p>
                            )}
                        </div>
                    </div>
                    {isValueLoading ? (
                        <Shimmer
                            height={24}
                            width={144}
                            borderRadius={4}
                            className="shrink-0 self-start md:self-end"
                            {...WALLET_VALUE_SHIMMER}
                        />
                    ) : (
                        lifetimeEarnedPoints > 0 && (
                            <span className="extra-small-font inline-flex max-w-full shrink-0 items-end gap-1 self-start rounded bg-white/30 px-1.5 py-1 md:self-end">
                                {lang.walletPage.lifetimeEarned}
                                <img
                                    src={COIN_ICON}
                                    alt=""
                                    width={14}
                                    height={14}
                                    className="shrink-0 self-center"
                                />
                                {lifetimeEarnedPoints.toLocaleString()}
                            </span>
                        )
                    )}
                </div>
                {isValueLoading ? (
                    <Shimmer
                        height={16}
                        width="100%"
                        borderRadius={4}
                        className="mt-3.5 max-w-xs"
                        {...WALLET_VALUE_SHIMMER}
                    />
                ) : (
                    expiringPoints &&
                    expiringPoints > 0 &&
                    expiringDate && (
                        <p className="extra-small-font md-heading-6 font-500 mt-3.5 mb-0 flex items-center gap-1 text-[var(--warning-light)]">
                            <img src={TRANSACTION_INFO_ICON} alt="" width={14} height={14} className="shrink-0" />
                            {formatTemplate(lang.walletPage.pointsExpiring, {
                                points: expiringPoints.toLocaleString(),
                                date: expiringDate,
                            })}
                        </p>
                    )
                )}
            </section>
        </div>

        {walletInfoDialogContent && (
            <CustomDialog
                open={infoDialog !== null}
                anchor="bottom"
                type="walletInfo"
                propsData={{
                    title: walletInfoDialogContent.title,
                    description: walletInfoDialogContent.description,
                }}
                handlerDialog={() => {}}
                handleClose={() => setInfoDialog(null)}
                drawerBorderRadius="12px"
                sxStyle={{
                    '& .MuiPaper-root': {
                        maxWidth: '420px',
                        width: 'calc(100% - 24px)',
                        borderRadius: '12px',
                        margin: '0 auto',
                        bottom: '30px'
                    },
                    '& .MuiDialogContent-root': {
                        padding: 0,
                    },
                }}
            />
        )}
        </>

    );
};

export default WalletSummaryCard;
