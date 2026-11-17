import Icon from '@components/image/Icons';
import ArrowLeftIcon from '@components/icons/ArrowLeft';
import { ARROW_LEFT_ICON, COIN_ICON, CROSS_ICON } from '@config/Header/image.config';
import { MyOrderHeaderProps } from './order.type';
import { useSelector } from 'react-redux';
import { selectIsQrFlowActive } from '@redux/slices/qrFlowSlice';
import TablePinBadge from '@components/TablePinBadge';
import { useRouter } from 'next/navigation';
import formatCurrency from '@lib/helper/price';

const MyOrderHeader: React.FC<MyOrderHeaderProps> = ({ lang, handleBack, store, cartItems, cartTotal, onCancelOrder }) => {
    const isQrFlow = useSelector(selectIsQrFlowActive);
    const router = useRouter();

    const handleCrossClick = () => {
        if (isQrFlow) {
            router.back();
            return;
        }
        handleBack?.();
    };

    const estimatedLoyaltyPoints = cartTotal?.estimatedLoyaltyPoints ?? 0;
    const maximumCashbackPerOrder = cartTotal?.maximumCashbackPerOrder ?? 0;
    const estimatedCashbackAmount = cartTotal?.estimatedCashbackAmount ?? 0;
    const cashbackToShow = Math.min(estimatedCashbackAmount, maximumCashbackPerOrder);
    const hasLoyaltyPoints = estimatedLoyaltyPoints > 0;
    const hasCashback = cashbackToShow > 0;
    const showEarnRewards = hasLoyaltyPoints || hasCashback;
    const formattedCashback = formatCurrency({ amount: cashbackToShow }).trim();

    const earnRewardsSubline = showEarnRewards ? (
        <p className="order-earn-subline m-0">
            <span className="order-earn-subline-text">{lang.order.youllEarn} </span>
            {hasLoyaltyPoints && (
                <span className="order-earn-points">
                    <img src={COIN_ICON} alt="" width={14} height={14} className="order-earn-coin-icon" />
                    <span className="order-earn-value">{estimatedLoyaltyPoints.toLocaleString()}</span>
                </span>
            )}
            {hasLoyaltyPoints && hasCashback && (
                <span className="order-earn-subline-text"> & </span>
            )}
            {hasCashback && (
                <span className="cashback-value">{formattedCashback}</span>
            )}
            <span className="order-earn-subline-text"> {lang.order.onThisOrder}</span>
        </p>
    ) : null;

    return (
        <header className={`order-header${isQrFlow ? ' order-header--qr-flow' : ''}`}>
            <div className="header-desktop p-4">
                <div className="flex items-center text-lg font-semibold">
                    <ArrowLeftIcon
                        className="my-order-header-icon cursor-pointer"
                        width="30"
                        height="30"
                        onClick={handleBack}
                    />
                    <div className="order-header-text flex flex-col min-w-0">
                    <h2 className="order-title">{lang.myOrder}</h2>
                    {earnRewardsSubline}
                    </div>
                </div>
            </div>
            <div className={`header-mobile p-4 gap-1`}>
                {isQrFlow ? (
                    <div className="header-mobile-qr flex items-center justify-between w-full">
                        <div className="flex items-center">
                        <Icon 
                            icon={`${CROSS_ICON}#cross`}
                            color={"var(--primary-text)"} className="my-order-header-icon-mobile cursor-pointer" 
                            viewBox="0 0 22 17" 
                            onClick={handleCrossClick} 
                        />
                        <span className="active-cart-title">{lang.activeCart}</span>
                        </div>
                        {/* {(sessionSummary?.totalItems ?? 0) > 0 ? (
                            <span className="text-[var(--accent-color)] heading-6 cursor-pointer" onClick={() => onCancelOrder?.()}>{lang.order.cancelOrder}</span>
                        ) : null} */}
                        <TablePinBadge lang={lang} useBadgeStyle forceSinglePart={true} />
                    </div>
                 ) : (
                    <>
                        <div className="flex items-center text-lg font-semibold">
                            <Icon
                                icon={`${ARROW_LEFT_ICON}#arrow`}
                                unit="px"
                                color={"var(--primary-text)"}
                                className="my-order-header-icon-mobile cursor-pointer"
                                viewBox="0 0 22 17"
                                onClick={handleBack}
                            />
                            <div className="flex flex-col min-w-0 gap-1">
                                <span className="store-name font-semibold">
                                    {cartItems?.length > 0 ? store?.currentStore?.name : "My Cart"}
                                </span>
                                {showEarnRewards ? (
                                    earnRewardsSubline
                                ) : (
                                    cartItems?.length > 0 && (
                                        <span className="item-count">{cartItems?.length} {lang.items}</span>
                                    )
                                )}
                            </div>
                        </div>
                        {cartItems?.length ? (
                            <div className="md:hidden">
                                <span className="text-[var(--accent-color)] heading-6 cursor-pointer text-nowrap" onClick={() => onCancelOrder?.()}>{lang.order.cancelOrder}</span>
                            </div>
                        ) : null}
                    </>
                )}
            </div>
            <style>{`
                .order-title {
                    font-size: var(--heading-h2);
                    font-weight: var(--font-bold);
                    color: var(--primary-text);
                }
                .order-header {
                    background: transparent;
                }
                /* Below mobile menu drawer (z-30/z-40) so profile sheet covers cart header in QR flow */
                .order-header--qr-flow {
                    z-index: 20;
                }
                .my-order-header-icon {
                    width: 30px;
                    height: 30px;
                    margin-right: 10px;
                    align-self: start;
                }
                .header-mobile {
                    display: none;
                }
                .header-desktop {
                    display: block;
                }
                .order-header-text {
                    gap: 2px;
                }
                .order-earn-subline {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 3px;
                    font-size: var(--heading-h5);
                    font-weight: var(--font-regular);
                    line-height: 1.3;
                }
                .order-earn-subline-text {
                    color: var(--primary-text);
                }
                .order-earn-points {
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                }
                .order-earn-coin-icon {
                    flex-shrink: 0;
                }
                .order-earn-value {
                    color: #8D29F7;
                    font-weight: var(--font-semi-bold);
                }
                .cashback-value {
                    color: var(--success);
                    font-weight: var(--font-semi-bold);
                }
                .store-name {
                    font-size: var(--description-font);
                    color: var(--primary-text);
                    line-height: 1;
                }
                .item-count {
                    font-weight: var(--font-regular);
                    font-size: var(--small-font);
                    color: var(--primary-text);
                }
                @media (max-width: 768px) {
                    .order-title {
                        font-size: var(--heading-h4);
                    }
                    .my-order-header-icon {
                        width: 20px;
                        height: 20px;
                        margin-right: 5px;
                    }
                    .order-header{
                        background: transparent;
                    }
                    .header-mobile {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .header-desktop {
                        display: none;
                    }
                    .my-order-header-icon-mobile {
                        width: 20px;
                        height: 20px;
                        margin-right: 10px;
                        margin-bottom: ${cartItems?.length > 0 || showEarnRewards ? "5px" : "0px"};
                    }
                    .header-mobile-qr {
                    width: 100%;
                }
                .active-cart-title {
                    font-size: var(--description-font);
                    font-weight: var(--font-semi-bold);
                    color: var(--primary-text);
                }
                .table-no-badge {
                    display: inline-block;
                    padding: 8px;
                    background-color: var(--error);
                    color: var(--white);
                    font-size: var(--extraSmall-font);
                    font-weight: var(--font-bold);
                    border-radius: 7px;
                    text-transform: uppercase;
                }
                .order-earn-subline{
                    font-size: var(--small-font);                
                }
                }
            `}</style>
        </header>
    );
};

export default MyOrderHeader;