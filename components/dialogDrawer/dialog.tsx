import React, { useEffect, useState, useMemo } from "react";
import dynamic from 'next/dynamic';
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Drawer from "@mui/material/Drawer";
import { ExtendedSession } from "@components/header/types";
import { Store } from "@components/type/store.types";
import { Address } from "@components/type/address.types";
import { Coupon } from "@components/order/order.type";
import { CartItem } from "@services/storePage";
import useIsMobile from "@hooks/useIsMobile";
import useDisableBodyScroll from "@hooks/useDisableBodyScroll";
import { SxProps, Theme } from '@mui/material/styles';
import type { ReorderProductWithPrepTime, OrderAgainAddon } from "./modal/OrderAgain/OrderAgainItemDetails";
import type { SessionTicketItem } from "@services/sessionService";
import type { TransactionHistoryItem } from '@components/type/transaction.types';
import type { Order, RefundMethod } from '@components/type/order.type';

// Dynamic modal imports
const LoginModal = dynamic(() => import("./modal/loginModal"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const VerifyOtpModal = dynamic(() => import("./modal/verifyOtpModal"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const SignupModal = dynamic(() => import("./modal/signupModal"), { ssr: false });
const UpdateProfileModal = dynamic(() => import("./modal/EditProfile/UpdateProfileModal"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const AllergyInfoModal = dynamic(() => import("./modal/AllergyInfoModal"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const LogoutModal = dynamic(() => import("./modal/LogoutModal"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const ProfileDrawer = dynamic(() => import("./modal/EditProfile/ProfileDrawer"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const CustomizationRepeat = dynamic(() => import("./modal/Cart/CustomizationRepeat"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const DeleteModal = dynamic(() => import("./modal/DeleteModal"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const MultipleCustomizations = dynamic(() => import("./modal/Cart/MultipleCustomizations"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const UpdateEmail = dynamic(() => import("@components/editprofile/UpdateEmail"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const UpdatePhone = dynamic(() => import("@components/editprofile/UpdatePhone"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const SuccessModal = dynamic(() => import("./modal/EditProfile/SuccessModal"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const DiscountCouponsModal = dynamic(() => import("./modal/CheckOut/DiscountCouponsModal"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const PromoDetailsDialog = dynamic(() => import("./modal/CheckOut/PromoDetailsDialog"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const CancelOrder = dynamic(() => import("./modal/Cart/CancelOrder"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const OrderCancelPopup = dynamic(() => import("../../app/orders/CancelPopup"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const DeleteAccountPopup = dynamic(
  () => import("./modal/EditProfile/DeleteAccountPopup"),
  {
    ssr: false,
    loading: () => (
      <p style={{ textAlign: "center", margin: "10px 20px" }}>Loading...</p>
    ),
  }
);
const RefundDetailsModal = dynamic(() => import("../../app/orders/RefundDetailsModal"), { ssr: false,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const AddAddressModal = dynamic(() => import("./modal/Address/AddAddressModal"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const InstructionsModal = dynamic(() => import("./modal/Cart/InstructionsModal"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const PaymentClient = dynamic(() => import("@components/payment/PaymentClient"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const StripeOrderPaymentClient = dynamic(() => import("@components/payment/StripeOrderPaymentClient"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const MobileAddressSelector = dynamic(() => import("./modal/Address/MobileAddressSelector"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const ReviewCard = dynamic(() => import("./modal/Review/ReviewCard"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const OrderSuccessModal = dynamic(() => import("./modal/Order/OrderSuccessModal"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const OrderSentModal = dynamic(() => import("./modal/Order/OrderSentModal"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const FreebiesModal = dynamic(() => import("./modal/Order/FreebiesModal"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const OrderAgainItemDetails = dynamic(() => import("./modal/OrderAgain/OrderAgainItemDetails"), { ssr: false ,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const MenuModal = dynamic(() => import("./modal/MenuModal"), { ssr: false,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px', height:'70vh', alignContent: 'center' }}>Loading...</p>
});
const FeatureModal = dynamic(() => import("./modal/feature-modal"), { ssr: false,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px', width: '500px' }}>Loading...</p>
});
const ComboCancelModal = dynamic(() => import("./modal/ComboCancelModal"), { ssr: false,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const PrepTimelineModal = dynamic(() => import("./modal/PrepTimelineModal"), { ssr: false,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const OrderFilters = dynamic(() => import("@app/orders/OrdeFilters"), { ssr: false,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const QrPaymentMethodDialog = dynamic(() => import("./modal/Order/QrPaymentMethodDialog"), { ssr: false,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const QrPaymentSuccessModal = dynamic(() => import("./modal/Order/QrPaymentSuccessModal"), { ssr: false,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const EnterTablePinModal = dynamic(() => import("./modal/Order/EnterTablePinModal"), { ssr: false,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const ReorderConfirmModal = dynamic(() => import("./modal/ReorderConfirmModal"), { ssr: false,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const ScanQrCodeModal = dynamic(() => import("./modal/Order/ScanQrCodeModal"), { ssr: false,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const WalletInfoModal = dynamic(() => import("./modal/WalletInfoModal"), { ssr: false,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const WalletTransactionDetailModal = dynamic(() => import("./modal/WalletTransactionDetailModal"), { ssr: false,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const AddMoneyModal = dynamic(() => import("./modal/AddMoneyModal"), { ssr: false,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});
const ReportReviewModal = dynamic(() => import("../reviews/ReportReviewModal"), { ssr: false,
    loading: () => <p style={{ textAlign: 'center', margin: '10px 20px' }}>Loading...</p>
});

// Define props type
interface ModalDialogProps {
    open: boolean;
    anchor: 'top' | 'left' | 'bottom' | 'right';
    propsData: {
        email?: string; // Make email optional
        [key: string]: unknown; // Allow other properties
    };
    type: string;
    handlerDialog: () => void;
    handleClose: () => void;
    className?: string;
    onlyDialog?: boolean;
    forceDrawer?: boolean;
    drawerBorderRadius?: string;
    /** Dialog position on desktop (Drawer uses anchor; Dialog uses this) */
    dialogPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
    sxStyle?: SxProps<Theme>; // Dynamic sx styles prop
}

// Dialog position → MuiDialog-container alignment (alignItems, justifyContent)
const getDialogContainerAlignment = (dialogPosition: 'center' | 'top' | 'bottom' | 'left' | 'right') => {
    switch (dialogPosition) {
        case 'top':
            return { alignItems: 'flex-start', justifyContent: 'center' };
        case 'bottom':
            return { alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '30px', width: '100%' };
        case 'left':
            return { alignItems: 'center', justifyContent: 'flex-start' };
        case 'right':
            return { alignItems: 'center', justifyContent: 'flex-end' };
        case 'center':
        default:
            return { alignItems: 'center', justifyContent: 'center' };
    }
};

// Helper function to get default dialog styles (base styles only, no type-specific styles)
const getDefaultDialogStyles = (
    onlyDialog?: boolean,
    dialogPosition: 'center' | 'top' | 'bottom' | 'left' | 'right' = 'center'
): SxProps<Theme> => {
    const basePaperStyles = {
        backgroundColor: 'var(--cards-containers)',
        borderRadius: '10px',
        margin: onlyDialog ? '10px' : '32px',
    };

    const baseContentStyles: Record<string, unknown> = {};
    const containerAlignment = getDialogContainerAlignment(dialogPosition);

    return {
        '& .MuiDialog-container': {
            ...containerAlignment,
        },
        '& .MuiPaper-root': {
            ...basePaperStyles,
        },
        '& .MuiDialogContent-root': {
            ...baseContentStyles,
        },
    } as SxProps<Theme>;
};

// Helper function to get default drawer styles (base styles only, no type-specific styles)
const getDefaultDrawerStyles = (drawerBorderRadius?: string): SxProps<Theme> => {
    const basePaperStyles = {
        borderRadius: drawerBorderRadius || '10px 10px 0 0',
        backgroundColor: 'var(--cards-containers)',
    };

    return {
        '& .MuiPaper-root': {
            ...basePaperStyles,
        },
    } as SxProps<Theme>;
};

// Helper function to deep merge sx styles
const mergeSxStyles = (
    defaultStyles: SxProps<Theme>,
    customStyles?: SxProps<Theme>
): SxProps<Theme> => {
    if (!customStyles) return defaultStyles;

    // If customStyles is a function, return it (it takes precedence)
    if (typeof customStyles === 'function') {
        return customStyles;
    }

    // If customStyles is an array, combine with defaults
    if (Array.isArray(customStyles)) {
        return [defaultStyles, ...customStyles];
    }

    // If both are objects, deep merge
    if (
        typeof defaultStyles === 'object' &&
        defaultStyles !== null &&
        !Array.isArray(defaultStyles) &&
        typeof customStyles === 'object' &&
        customStyles !== null &&
        !Array.isArray(customStyles)
    ) {
        const merged: Record<string, unknown> = { ...defaultStyles };
        
        Object.keys(customStyles).forEach((key) => {
            const customValue = (customStyles as Record<string, unknown>)[key];
            const defaultValue = (defaultStyles as Record<string, unknown>)[key];
            
            if (
                typeof customValue === 'object' &&
                customValue !== null &&
                !Array.isArray(customValue) &&
                typeof defaultValue === 'object' &&
                defaultValue !== null &&
                !Array.isArray(defaultValue)
            ) {
                merged[key] = {
                    ...defaultValue,
                    ...customValue,
                };
            } else {
                merged[key] = customValue;
            }
        });

        return merged as SxProps<Theme>;
    }

    // Fallback: return custom styles if they exist
    return customStyles;
};

const CustomDialog: React.FC<ModalDialogProps> = (props) => {
    const [open, setOpen] = useState(false);
    const { anchor, type, onlyDialog, forceDrawer = false, drawerBorderRadius, dialogPosition = 'center', sxStyle } = props;
    const isMobile = useIsMobile();

    // Lock/unlock body scroll when dialog opens/closes
    useDisableBodyScroll(open);

    useEffect(() => {
        setTimeout(() => {
            setOpen(props.open);
        }, 20);
    }, [props.open]);

    // Memoize dialog styles
    const dialogSxStyles = useMemo(() => {
        const defaultStyles = getDefaultDialogStyles(onlyDialog, dialogPosition);
        return mergeSxStyles(defaultStyles, sxStyle);
    }, [onlyDialog, dialogPosition, sxStyle]);

    // Memoize drawer styles
    const drawerSxStyles = useMemo(() => {
        const defaultStyles = getDefaultDrawerStyles(drawerBorderRadius);
        return mergeSxStyles(defaultStyles, sxStyle);
    }, [drawerBorderRadius, sxStyle]);

    const dialogContent = () => {
        // Switch case for different dialog types
        switch (type) {
            case "login":
                return (
                    <LoginModal
                        key={props.open ? "login-open" : "login-closed"}
                        {...props.propsData}
                        handlerDialog={props.handlerDialog}
                        onClose={props.handleClose}
                    />
                );
            case 'verifyOtp':
                return (
                    <VerifyOtpModal
                        {...props.propsData}
                        email={props.propsData.email as string}
                        handlerDialog={props.handlerDialog}
                        onClose={props.handleClose}
                        handleEmailUpdateOtp={props.propsData.handleEmailUpdateOtp as (userEmail: string, otp: string) => void}
                        verifyOtpStatus={props.propsData.verifyOtpStatus as boolean}
                    />
                );
            case 'signup':
                return (
                    <SignupModal
                        {...props.propsData}
                        email={props.propsData.email || ''}
                        handlerDialog={props.handlerDialog}
                        onClose={props.handleClose}
                    />
                );
            case 'updateProfile':
                return (
                    <UpdateProfileModal
                        {...props.propsData}
                        onClose={props.handleClose}
                    />
                );
            case 'allergyInfo':
                return (
                    <AllergyInfoModal
                        {...props.propsData}
                        onClose={props.handleClose}
                        store={props.propsData.store as Store}
                    />
                );
            case 'logout':
                return (
                    <LogoutModal
                        {...props.propsData}
                        logout={props.propsData.logout as () => void}
                        onClose={props.handleClose}
                    />
                );
            case 'profileMenu':
                return (
                    <ProfileDrawer
                        {...props.propsData}
                        onClose={props.handleClose}
                        session={props.propsData.session as ExtendedSession}
                    />
                );
            case 'customizationRepeat':
                return (
                    <CustomizationRepeat
                        {...props.propsData}
                        onClose={props.handleClose}
                    />
                );
            case 'multipleCustomizations':
                return (
                    <MultipleCustomizations
                        items={(props.propsData.items as CartItem[]) || []}
                        title={props.propsData.title as string | undefined}
                        onQuantityChange={props.propsData.onQuantityChange as (itemId: string, customType: string) => void}
                        getModifierDescription={props.propsData.getModifierDescription as (item: CartItem) => string}
                        productId={props.propsData.productId as string | undefined}
                        showChooseButton={typeof props.propsData.showChooseButton === 'boolean' ? props.propsData.showChooseButton : true}
                        onConfirm={props.propsData.onConfirm as (() => void) | undefined}
                        onAddItem={props.propsData.onAddItem as ((item: CartItem) => void) | undefined}
                        // Use onClose from propsData if provided (for "I'll choose" button)
                        onClose={props.propsData.onClose as (() => void) | undefined}
                        // Use handleClose for close icon (X) - just closes dialog without any side effects
                        handleClose={props.handleClose}
                        isRemoveDialog={typeof props.propsData.isRemoveDialog === 'boolean' ? props.propsData.isRemoveDialog : false}
                        allowRemoveLastItem={typeof props.propsData.allowRemoveLastItem === 'boolean' ? props.propsData.allowRemoveLastItem : false}
                        syncFromCart={typeof props.propsData.syncFromCart === 'boolean' ? props.propsData.syncFromCart : true}
                    />
                );
            case 'deleteModal':
                return (
                    <DeleteModal
                        {...props.propsData}
                        onClose={props.handleClose}
                    />
                );
            case 'updateEmail':
                return (
                    <UpdateEmail
                        {...props.propsData}
                        onClose={props.handleClose}
                    />
                );
            case 'updatePhone':
                return (
                    <UpdatePhone
                        {...props.propsData}
                        onClose={props.handleClose}
                    />
                );
            case 'emailSuccess':
                return (
                    <SuccessModal
                        {...props.propsData}
                        onClose={props.handleClose}
                        title={props.propsData.title as string}
                    />
                );
            case 'discountCoupons':
                return (
                    <DiscountCouponsModal
                        {...props.propsData}
                        onClose={props.handleClose}
                        handleApplyDiscountCode={props.propsData.handleApplyDiscountCode as (code: string) => void}
                        coupons={props.propsData.coupons as Coupon[]}
                        isApplied={props.propsData.isApplied as boolean}
                    />
                );
            case 'promoDetails':
                return (
                    <PromoDetailsDialog
                        {...props.propsData}
                        onClose={props.handleClose}
                        promo={props.propsData.promo as Coupon | null}
                        handleApplyDiscountCode={props.propsData.handleApplyDiscountCode as ((code: string, _id: string) => void) | undefined}
                        isApplied={props.propsData.isApplied as boolean | undefined}
                    />
                );
            case 'cancelOrder':
                return (
                    <CancelOrder
                        {...props.propsData}
                        onClose={props.handleClose}
                    />
                );
            case 'orderCancelPopup':
                return (
                    <OrderCancelPopup
                        {...props.propsData}
                        onClose={props.handleClose}
                    />
                );
            case 'deleteAccountPopup':
                return (
                    <DeleteAccountPopup
                        {...props.propsData}
                        onClose={props.handleClose}
                    />
                );
            case 'refundDetails':
                return (
                    <RefundDetailsModal
                        refund={props.propsData.refund as RefundMethod}
                        order={props.propsData.order as Order | null | undefined}
                        supportEmail={props.propsData.supportEmail as string | undefined}
                        onClose={props.handleClose}
                    />
                );
            case 'addAddress':
                return (
                    <AddAddressModal
                        {...props.propsData}
                        onClose={props.handleClose}
                    />
                );
            case 'instructions':
                return (
                    <InstructionsModal
                        {...props.propsData}
                        onClose={props.handleClose}
                        handleInstructionSubmit={props.propsData.handleInstructionSubmit as (instructions: string) => void}
                        item={props.propsData.item as string}
                    />
                );

            case 'payment':
                return (
                    <PaymentClient
                        {...props.propsData}
                        onClose={props.handleClose}
                        orderId={props.propsData.orderId as string}
                    />
                );
            case 'stripeOrderPayment':
                return (
                    <StripeOrderPaymentClient
                        {...props.propsData}
                        orderId={props.propsData.orderId as string}
                        orderData={props.propsData.orderData as Record<string, unknown>}
                        storeId={props.propsData.storeId as string}
                    />
                );
            case 'mobileAddressSelector':
                return (
                    <MobileAddressSelector
                        {...props.propsData}
                        onClose={props.handleClose}
                        addresses={props.propsData.addresses as Address[]}
                        storeId={props.propsData.storeId as string}
                        handleDeliveryAddressId={props.propsData.handleDeliveryAddressId as (id: string | null) => void}
                    />
                );
            case 'reviewCard':
                return (
                    <ReviewCard />
                );
            
            case 'orderSuccess':
                return (
                    <OrderSuccessModal
                        {...props.propsData}
                        onClose={props.handleClose}
                        handleRedirectNow={props.propsData.handleRedirectNow as () => void}
                    />
                );
            case 'orderSent':
                return (
                    <OrderSentModal
                        onClose={props.handleClose}
                        tableNumber={props.propsData.tableNumber as string | null}
                        onGoToActiveOrder={props.propsData.onGoToActiveOrder as () => void}
                        onAddMoreItems={props.propsData.onAddMoreItems as () => void}
                    />
                ); 
            case 'freebiesModal':
                return (
                    <FreebiesModal
                        storeId={props.propsData.storeId as string}
                        cartId={props.propsData.cartId as string}
                        offerId={props.propsData.offerId as string}
                        cartItemsId={props.propsData.cartItemsId as string}
                        UpdateSelectedFreebie={props.propsData.UpdateSelectedFreebie as string}
                        handleCloseFreebiesModal={props.handleClose}
                        {...props.propsData}
                    />
                );
            case 'orderAgainItemDetails':
                return (
                    <OrderAgainItemDetails
                        product={props.propsData.product as ReorderProductWithPrepTime}
                        addons={(props.propsData.addons as OrderAgainAddon[]) || []}
                        lastOrderedDate={props.propsData.lastOrderedDate as string}
                        onClose={props.handleClose}
                        onAddToCart={props.propsData.onAddToCart as () => void}
                        isAddingToCart={props.propsData.isAddingToCart as boolean | undefined}
                    />
                );
            case 'menuModal':
                return (
                    <MenuModal
                        {...props.propsData}
                        onClose={props.handleClose}
                    />
                );
            case 'featureModal':
                return (
                    <FeatureModal
                        isOpen={props.open}
                        propsData={props.propsData as Record<string, unknown>}
                        onClose={props.handleClose}
                    />
                );
            case 'comboCancelModal':
                return (
                    <ComboCancelModal
                        onClose={props.handleClose}
                        onYes={props.propsData.onYes as () => void}
                        onNo={props.propsData.onNo as () => void}
                        title={props.propsData.title as string}
                        yesButtonText={props.propsData.yesButtonText as string}
                        noButtonText={props.propsData.noButtonText as string}
                    />
                );
            case 'prepTimeline':
                return (
                    <PrepTimelineModal
                        onClose={props.handleClose}
                        preparationTime={props.propsData.preparationTime as number | undefined}
                        cookingTime={props.propsData.cookingTime as number | undefined}
                        totalTime={props.propsData.totalTime as number | undefined}
                    />
                );

            case 'orderFilters':
                return (
                    <OrderFilters
                        onClose={props.handleClose}
                    />
                );
            case 'qrPaymentMethod':
                return (
                    <QrPaymentMethodDialog
                        onClose={props.handleClose}
                        onSubmit={
                            props.propsData.onSubmit as (
                                paymentMethod: string
                            ) => void | Promise<void>
                        }
                        isSubmitting={props.propsData.isSubmitting as boolean | undefined}
                    />
                );
            case 'qrPaymentSuccess':
                return (
                    <QrPaymentSuccessModal
                        storeName={props.propsData.storeName as string}
                        onClose={props.handleClose}
                        onGoToOrderDetails={props.propsData.onGoToOrderDetails as () => void}
                        onShareExperience={props.propsData.onShareExperience as () => void}
                    />
                );
            case 'enterTablePin':
                return (
                    <EnterTablePinModal
                        tableNumber={props.propsData.tableNumber as string}
                        onClose={props.handleClose}
                        onProceed={props.propsData.onProceed as (pin: string) => void}
                    />
                );
            case 'reorderConfirm':
                return (
                    <ReorderConfirmModal
                        item={props.propsData.item as SessionTicketItem}
                        language={props.propsData.language as string || "en"}
                        onClose={props.handleClose}
                        onConfirm={props.propsData.onConfirm as (() => void) | undefined}
                    />
                );
            case 'scanQrCode':
                return (
                    <ScanQrCodeModal
                        onClose={props.handleClose}
                    />
                );
            case 'walletInfo':
                return (
                    <WalletInfoModal
                        title={props.propsData.title as string}
                        description={props.propsData.description as string}
                        onClose={props.handleClose}
                    />
                );
            case 'walletTransactionDetail':
                return (
                    <WalletTransactionDetailModal
                        transaction={props.propsData.transaction as TransactionHistoryItem}
                        onClose={props.handleClose}
                    />
                );
            case 'addMoney':
                return (
                    <AddMoneyModal
                        onClose={props.handleClose}
                        onSubmit={
                            props.propsData.onSubmit as
                                | ((amount: number, paymentMethod: string) => void | Promise<void>)
                                | undefined
                        }
                    />
                );
            case 'reportReview':
                return (
                    <ReportReviewModal
                        {...props.propsData}
                        reviewId={props.propsData.reviewId as string}
                        storeId={props.propsData.storeId as string}
                        onClose={props.handleClose}
                    />
                );
            default:
                return <div>empty</div>;
        }
    };
    
    return (
        <>
            {/* Show Dialog for desktop OR when onlyDialog is true (unless forceDrawer is true) */}
            {!forceDrawer && (!isMobile || props.onlyDialog) ? <div className="dialog-container" style={{ display: 'block' }}>
                <Dialog
                    open={open}
                    onClose={props.handleClose}
                    disablePortal
                    sx={dialogSxStyles}
                >
                    <DialogContent>
                        <div className={`btmModal w-100 h-100 popup ${props.className}`}>
                            {dialogContent()}
                        </div>
                    </DialogContent>
                </Dialog>
            </div> : ''}
            

            {/* Show Drawer for mobile when onlyDialog is false, OR when forceDrawer is true */}
            {(forceDrawer || (!props.onlyDialog && isMobile)) && (
                <div className="drawer-container" style={{ display: 'block' }}>
                    <Drawer
                        anchor={anchor}
                        open={open}
                        onClose={props.handleClose}
                        disablePortal
                        sx={drawerSxStyles}
                    >
                        <div className={`mobile-drawer-content ${props.className}`}>
                            {dialogContent()}
                        </div>
                    </Drawer>
                </div>
            )}

            <style>{`
                .loading-message {
                    text-align: center;
                    margin: 10px 20px;
                }
            `}</style>
        </>
    );
};

export default CustomDialog;