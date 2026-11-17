import CustomButton from '@components/buttons/Button';
import SecondaryButton from '@components/buttons/secondaryButton';
import React, { useEffect, useRef } from 'react';
import { MyOrderFooterProps } from './order.type';
import { close_dialog, open_dialog } from '@lib/modalHandler';
import { cancelOrder } from '@services/cartService';
import { useStoreCart } from '@hooks/storepage/useStore';
import formatCurrency from '@lib/helper/price';
import { ARROW_RIGHT, NAVIGATION_IMAGE } from '@config/Header/image.config';
import Icon from '@components/image/Icons';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { selectSessionSummary, selectSessionTotal } from '@redux/slices/qrFlowSlice';

const MyOrderFooter: React.FC<MyOrderFooterProps> = ({ lang, store, cartData, handleCheckout, cancelOrderId, buttonText, addresses, handleDeliveryAddressId, orderType, deliveryFee, onViewBillDetails, onFooterHeightChange, onCancelOrder, isQrFlow, walletPreviewData }) => {
    const { handleGetCart } = useStoreCart();
    const { selectedAddressId } = useSelector((state: RootState) => state.userAddress);
    const sessionSummary = useSelector(selectSessionSummary);
    const sessionTotal = useSelector(selectSessionTotal);
    const footerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!onFooterHeightChange || !footerRef.current) return;
        const el = footerRef.current;
        const observer = new ResizeObserver((entries) => {
            const height = entries[0]?.contentRect?.height;
            if (typeof height === "number") onFooterHeightChange(height);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [onFooterHeightChange]);

    const handleYes = async () => {
        if (isQrFlow) return;
        const res = await cancelOrder(store?.currentStore?.id as string, cancelOrderId as string, "CANCEL_CART")
        if (res.message === "Success") {
            handleGetCart(store?.currentStore?.id as string);
            close_dialog(["cancelOrder"]);
        }
    }

    const handleCancelOrder = () => {
        open_dialog("cancelOrder", {
            open: true,
            propsData: {
                title: lang.cancelOrderTitle,
                description: lang.cancelOrderDescription,
                yesButtonText: lang.yes,
                noButtonText: lang.no,
                onYes: () => {
                    handleYes()
                },
                onNo: () => {
                    close_dialog(["cancelOrder"]);
                },
            },
            anchor: "bottom",
            type: "cancelOrder",
            handlerDialog: () => { },
            handleClose: () => { close_dialog(["cancelOrder"]) },
        });
    };

    const handleChangeAddress = () => {
        open_dialog("mobileAddressSelector", {
            open: true,
            propsData: {
                addresses: addresses,
                storeId: store?.currentStore?.id,
                handleDeliveryAddressId: handleDeliveryAddressId,
            },
            anchor: "bottom",
            type: "mobileAddressSelector",
            handlerDialog: () => { },
            handleClose: () => { close_dialog(["mobileAddressSelector"]) },
            drawerBorderRadius: "0px",
        });
    }

    const selectedAddress = addresses.find(address => address.id === selectedAddressId);

    const getFinalTotal = () => {
        if (walletPreviewData) {
            return walletPreviewData.orderAmountAfterRedemption;
        }
        if (isQrFlow && (sessionTotal ?? sessionSummary) != null) {
            return sessionTotal?.finalAmount ?? sessionSummary?.estimatedTotal ?? 0;
        }
        let totalAmount = cartData?.data?.total?.finalAmount || 0;
        if (deliveryFee) totalAmount += deliveryFee;
        return totalAmount;
    };

    // Check if the selected freebie is already applied to the cart
    // const isFreebieAlreadyApplied = () => {
    //     if (!selectedFreebie || !cartData?.data?.appliedOffers) return false;
    //     return cartData.data.appliedOffers.some(offer =>
    //         offer.offerId === selectedFreebie && offer.offerType === "FREEBIE"
    //     );
    // };

    // const handleOpenFreebiesModal = () => {
    //     open_dialog('freebiesModal', {
    //         open: true,
    //         propsData: {
    //             offerId: selectedFreebie,
    //             storeId: store?.currentStore?.id,
    //             cartId: cartData?.data?.id,
    //             cartItemsId: cartItems[0]?.id,
    //         },
    //         type: 'freebiesModal',
    //         handlerDialog: () => { },
    //         handleClose: () => { },
    //         anchor: 'bottom',
    //         drawerBorderRadius: '0px'
    //     });
    // };

    return (
        <footer ref={footerRef} className={`footer-container border-t px-4 py-3 shadow-md ${isQrFlow ? 'footer-container-qr-flow' : ''}`}>
            {orderType === "delivery" && selectedAddress && <div className="address-footer-mobile">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Icon
                            icon={`${NAVIGATION_IMAGE}#nav-icon`}
                            width={11}
                            height={14}
                            color={"var(--primary-text)"}
                            viewBox="0 0 15 17"
                            className='navigation-icon'
                        />
                        <span className='delivery-to-text'>{lang.deliverTo}</span>
                    </div>
                    <p className='change-address'
                        onClick={handleChangeAddress}
                    >
                        {lang.change}
                    </p>
                </div>
                {selectedAddress && (
                    <div className="mb-4">
                        <p className='address-text-mobile'>{`${selectedAddress.address}, ${selectedAddress.addressLine2 ? selectedAddress.addressLine2 + ', ' : ''}${selectedAddress.city ? selectedAddress.city + ', ' : ''}${selectedAddress.state ? selectedAddress.state + ', ' : ''}${selectedAddress.country ? selectedAddress.country + ', ' : ''}${selectedAddress.zipCode ? selectedAddress.zipCode : ''}`}</p>
                    </div>
                )}
            </div>}

            <div className="flex items-center gap-3 justify-between">
                {!isQrFlow && (
                    <div className="md:hidden">
                        <h4 className="checkout-price md:hidden">
                            {formatCurrency({ amount: getFinalTotal() })}
                        </h4>
                        <span
                            role="button"
                            tabIndex={0}
                            className="text-[var(--accent-color)] heading-6 cursor-pointer"
                            onClick={onViewBillDetails}
                            onKeyDown={(e) => e.key === "Enter" && onViewBillDetails?.()}
                        >
                            {lang.viewBillDetails}
                        </span>
                    </div>
                )}

                <SecondaryButton className="cancel-button hidden md:block" onClick={onCancelOrder ?? handleCancelOrder}>
                    <h4 className="cancel-title">{lang.cancel}</h4>
                </SecondaryButton>

                {isQrFlow ? (
                    <div className="qrflow-combined-bar">
                        <div className="flex items-center justify-between w-full gap-3">
                            <div className="flex flex-col items-start leading-tight">
                                <h4 className="checkout-price">
                                    {formatCurrency({ amount: getFinalTotal() })}
                                </h4>
                                <span
                                    role="button"
                                    tabIndex={0}
                                    className="qrflow-view-bill heading-6 cursor-pointer"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onViewBillDetails?.();
                                    }}
                                >
                                    {lang.viewBillDetails}
                                </span>
                            </div>
                            <CustomButton className="qrflow-submit-button" onClick={handleCheckout}>
                                <span className="flex items-center gap-2">
                                    <h4 className="checkout-title">{buttonText}</h4>
                                    <span className="qrflow-submit-arrow" aria-hidden="true">
                                        <Icon
                                            icon={`${ARROW_RIGHT}#arrow-right`}
                                            width={18}
                                            height={18}
                                            unit="px"
                                            color={"var(--button-primary-text)"}
                                            viewBox="0 0 15 15"
                                        />
                                    </span>
                                </span>
                            </CustomButton>
                        </div>
                    </div>
                ) : (
                    <CustomButton className="checkout-button" onClick={handleCheckout}>
                        <div className="flex items-center md:justify-between justify-center">
                            <h4 className="checkout-title">{buttonText}</h4>
                            <h4 className="checkout-price hidden md:block">
                                {formatCurrency({ amount: getFinalTotal() })}
                            </h4>
                        </div>
                    </CustomButton>
                )}
            </div>
            <style>{`
                .address-footer-mobile {
                    display: none;
                }
                .change-address {
                    color: var(--accent-color);
                    font-size: var(--small-font);
                    font-weight: var(--font-medium);
                }
                .address-text-mobile {
                    font-size: var(--small-font);
                }
                .delivery-to-text {
                    font-size: var(--description-font);
                    font-weight: var(--font-medium);
                }
                .qrflow-view-bill {
                    color: var(--button-primary-text);
                    opacity: 0.85;
                }
                .qrflow-combined-bar {
                    width: 100%;
                    padding: 8px 12px;
                    border-radius: 10px;
                    background-color: var(--button-primary-background);
                    border: var(--button-primary-border-width) solid var(--button-primary-border-color);
                }
                .qrflow-submit-button {
                    padding: 0 !important;
                    width: auto !important;
                    border: 0 !important;
                    border-radius: 8px !important;
                }
                .qrflow-submit-arrow {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    transform: translateX(0);
                }
                .qrflow-submit-arrow svg {
                    display: block;
                }
                @media (max-width: 768px) {
                    .address-footer-mobile {
                        display: block;
                    }
                    .change-address{
                        font-size: var(--small-font);
                    }
                }
            `}</style>
        </footer>
    );
};

export default MyOrderFooter;