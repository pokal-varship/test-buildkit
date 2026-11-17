'use client'
import OrderToggle from '@components/buttons/orderToggle';
import DeliveryAddressSelector from '@components/checkOut/DeliveryAddressSelector';
import Icon from '@components/image/Icons';
import { NAVIGATION_IMAGE } from '@config/Header/image.config';
import { useEffect, useState } from 'react';
import { LanguageCode, TranslationKeys } from 'types';
import useLang from '@hooks/useLang';
import { Store } from '@components/type/store.types';
import { useTheme } from 'context/ThemeProvider';
import DateTimeSelector from './DateTimeSelector';
import { useDispatch, useSelector } from 'react-redux';
import { setCartOrderType } from '@redux/slices/cartSlice';
import { selectIsQrFlowActive } from '@redux/slices/qrFlowSlice';
import { getCookie, setCookie } from '@lib/cookie';

interface SelectOrderTypeProps {
    handleDeliveryAddressId: (type: string | null) => void;
    store: { currentStore: Store | null };
    handleOrderType: (type: string) => void;
    handleScheduleOrder: (time: string) => void;
}

const SelectOrderType = ({ 
    handleDeliveryAddressId, 
    store, 
    handleOrderType, 
    handleScheduleOrder
}: SelectOrderTypeProps) => {
    const isQrFlow = useSelector(selectIsQrFlowActive);
    const selfPickupEnabled = store?.currentStore?.pickupSettings?.selfPickup !== false;
    const getOrderType = getCookie('orderType');
    const [orderType, setOrderType] = useState(() => {
        if (isQrFlow) return 'dine-in';
        if (getOrderType === 'delivery') return 'delivery';
        if (getOrderType === 'takeaway' && selfPickupEnabled) return 'takeaway';
        return selfPickupEnabled ? 'takeaway' : 'delivery';
    });
    const [lang]: [TranslationKeys,LanguageCode] = useLang();
    const { theme } = useTheme();
    const dispatch = useDispatch();

    const options = isQrFlow
        ? [{ label: lang.dineIn, value: "dine-in" }]
        : [
            ...(selfPickupEnabled
                ? [{ label: lang.takeaway, value: "takeaway" }]
                : []),
            { label: lang.delivery, value: "delivery" },
        ];

    const handleOrderTypeChange = (type: string) => {
        setOrderType(type);
        handleOrderType(type);
        dispatch(setCartOrderType(type));
        setCookie('orderType', type);
    };

    // Keep MyOrder / checkout payload in sync with the option shown in the UI.
    // When selfPickup is false we init as "delivery" locally but must still push that
    // to the parent — otherwise cookie "takeaway" stays and order API gets PICKUP.
    useEffect(() => {
        if (isQrFlow) return;

        const resolvedType = !selfPickupEnabled ? 'delivery' : orderType;
        if (resolvedType !== orderType) {
            setOrderType(resolvedType);
        }
        handleOrderType(resolvedType);
        dispatch(setCartOrderType(resolvedType));
        setCookie('orderType', resolvedType);
        // Only re-sync when pickup availability changes (or on mount for that store).
        // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: avoid looping on parent handleOrderType identity
    }, [isQrFlow, selfPickupEnabled]);

    return (
        <div className="select-order-type">
            <div className="mb-4">
                <h4 className="order-type-title mb-3">{lang.selectOrderType}</h4>
                <OrderToggle
                    options={options}
                    initialSelected={orderType}
                    handleOrderTypeChange={handleOrderTypeChange}
                />
            </div>

            {/* Takeaway Order Type */}
            {(orderType === "takeaway") && <div>
                <div className="mb-6">
                    <div className="flex items-start">
                        <Icon
                            icon={`${NAVIGATION_IMAGE}#nav-icon`}
                            width={16}
                            height={20}
                            color={"var(--primary-text)"}
                            viewBox="0 0 15 17"
                            className='nav-icon'
                        />
                        <div className="font-semibold ml-1">{store?.currentStore?.name}</div>
                    </div>
                    <div className="small-font text-[var(--secondary-text)] ml-5">{store?.currentStore?.address?.address}</div>
                </div>
                <DateTimeSelector handleScheduleOrder={handleScheduleOrder} />
            </div>}


            {/* Delivery Order Type */}
            {orderType === "delivery" && (
                <DeliveryAddressSelector handleDeliveryAddressId={handleDeliveryAddressId} />
            )}
            


            <style>{`
                .select-order-type {
                    width: 100%;
                    background-color: var(--cards-containers);
                    border-radius: 8px;
                    margin:18px 0px;
                    padding:20px;
                    border: 1px solid var(--borders-dividers);
                }
                .nav-icon {
                    margin-top: 4px;
                }
                .time-selector-label {
                    color:var(--secondary-text);
                    font-size:var(--small-font);
                }
                .time-selector-date {
                    padding: 12px 15px;
                    background-color: ${theme === "light" ? "var(--secondary-background)" : "var(--primary-background)"};
                    border-radius: 8px;
                    color:var(--primary-text);
                    width: 100%;
                }
                .time-selector-container {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }
                .order-type-title {
                    color: var(--primary-text);
                    font-size: var(--heading-h4);
                    font-weight: var(--font-bold);
                }
                @media (max-width: 768px) {
                    .time-selector-container {
                        grid-template-columns: 1fr;
                    }
                    .select-order-type{
                        margin-top: 2px;
                        margin-bottom: 0px;
                        border-radius: 0;
                        border: 0;
                        border-top: 1px solid var(--borders-dividers);
                    }
                    .order-type-title {
                        font-size: var(--heading-h5);
                    }
                }
                .small-font {
                    font-size: var(--small-font);
                }
            `}</style>
        </div>
    );
}

export default SelectOrderType;