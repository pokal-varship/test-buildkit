'use client';

import useAuth from '@hooks/useAuth';
import useLang from '@hooks/useLang';
import useWallet from '@hooks/useWallet';
import { useEffect } from 'react';
import WalletFAQ from './WalletFAQ';
import WalletSummaryCard from './WalletSummaryCard';
import WalletTransactionHistory from './WalletTransactionHistory';

const WalletPage: React.FC = () => {
    const [lang] = useLang();
    const { userId } = useAuth();
    const { handleGetWallet } = useWallet();

    useEffect(() => {
        if (!userId) return;
        handleGetWallet(userId, { page: 1, limit: 1 }).catch(() => undefined);
    }, [userId, handleGetWallet]);

    return (
        <div className="max-width-container w-full bg-[var(--tertiary-background)] md:bg-[var(--primary-background)] pb-8 text-[var(--primary-text)] md:pb-10 md:pt-6">
            <div className="flex items-center gap-3 pt-6 pb-5 md:hidden">
                <div className="min-w-0 flex-1">
                    <h1 className="heading-2 font-700 m-0 text-[var(--primary-text)]">
                        {lang.walletPage.myWalletTitle}
                    </h1>
                    <p className="font-400 m-0 mt-0 text-[length:var(--description-font)] text-[var(--secondary-text)]">
                        {lang.walletPage.subtitle}
                    </p>
                </div>
            </div>

            <header className="hidden md:block mb-6">
                <h1 className="heading-2 font-700 m-0 mb-1 text-[var(--primary-text)]">
                    {lang.walletPage.myWalletTitle}
                </h1>
                <p className="font-400 m-0 text-[length:var(--description-font)] text-[var(--secondary-text)]">
                    {lang.walletPage.subtitle}
                </p>
            </header>

            <div className="flex w-full flex-col gap-6 md:flex-row md:items-start md:gap-8 xl:gap-10">
                <div
                    className="contents z-[1] md:flex md:w-[35%] md:min-w-0 md:flex-col md:gap-6 xl:w-[32%]"
                    style={{ position: 'sticky', top: 80, height: 'fit-content', bottom: 'auto' }}
                >
                    <div className="order-1 w-full min-w-0 md:order-none md:mt-0">
                        <WalletSummaryCard />
                    </div>
                    <div className="order-3 w-full min-w-0 md:order-none">
                        <span className="block md:hidden bg-[var(--primary-background)] h-[10px] px-4 max-md:-mx-4"/>
                        <WalletFAQ />
                    </div>
                </div>

                <div className="order-2 flex w-full min-w-0 flex-col md:order-none md:min-h-0 md:flex-1">
                    <span className="block md:hidden bg-[var(--primary-background)] h-[10px] px-4 max-md:-mx-4"/>
                    <WalletTransactionHistory />
                </div>
            </div>
        </div>
    );
};

export default WalletPage;
