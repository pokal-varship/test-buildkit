import Icon from '@components/image/Icons';
import { CROSS_ICON } from '@config/Header/image.config';
import { close_dialog, open_dialog } from '@lib/modalHandler';
import { deleteAddress, setError, setLoading, setSelectedAddress, setAddresses, setCoordinates } from '@redux/slices/userAddressSlice';
import { deleteCustomerAddress, getCustomerAddress } from '@services/checkOutService';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import AddressCard from './AddressCard';
import { LanguageCode, TranslationKeys } from 'types';
import useLang from '@hooks/useLang';
import { Address } from '@components/type/address.types';
import { useSession } from 'next-auth/react';
import { ExtendedSession } from '@components/header/types';

interface MobileAddressSelectorProps {
    onClose: () => void;
    addresses: Address[];
    storeId: string;
    handleDeliveryAddressId: (id: string | null) => void;
}

const MobileAddressSelector = ({ onClose, addresses, storeId, handleDeliveryAddressId }: MobileAddressSelectorProps) => {
    const dispatch = useDispatch();
    const { selectedAddressId } = useSelector((state: RootState) => state.userAddress);
    const [selectedId, setSelectedId] = useState<string>(selectedAddressId || '');
    const [lang]: [TranslationKeys, LanguageCode] = useLang();
    const [isLoading, setIsLoading] = useState(false);
    const { data: session, status } = useSession() as { 
        data: ExtendedSession | null;
        status: "loading" | "authenticated" | "unauthenticated";
    };

    const fetchAddresses = async () => {
        // Only fetch addresses if user is fully authenticated
        if (!storeId || status !== "authenticated" || !session?.user?.email || !session?.user?.isAuthenticated) return;
        try {
            dispatch(setLoading(true));
            const res = await getCustomerAddress(storeId);
            const addressList = Array.isArray(res.data) ? res.data : [];
            dispatch(setAddresses(addressList));
            if(!addressList?.length) {
                handleDeliveryAddressId(null);
                return;
            }
            // Update selected address if needed
            if (addressList.length > 0 && !selectedId) {
                const defaultId = addressList[0]?.id || '';
                setSelectedId(defaultId);
                dispatch(setSelectedAddress(defaultId));
                handleDeliveryAddressId(defaultId);
                dispatch(setCoordinates({
                    latitude: addressList[0]?.coordinates?.latitude || 0,
                    longitude: addressList[0]?.coordinates?.longitude || 0
                }));
            } else if(selectedId) {
                const addressExists = addressList.some(addr => addr.id === selectedId);
                if (!addressExists) {
                    const defaultId = addressList[0]?.id || '';
                    setSelectedId(defaultId);
                    dispatch(setSelectedAddress(defaultId));
                    handleDeliveryAddressId(defaultId);
                    dispatch(setCoordinates({
                        latitude: addressList[0]?.coordinates?.latitude || 0,
                        longitude: addressList[0]?.coordinates?.longitude || 0
                    }));
                } else {
                    handleDeliveryAddressId(selectedId);
                    dispatch(setSelectedAddress(selectedId));
                    dispatch(setCoordinates({
                        latitude: addressList.find(addr => addr.id === selectedId)?.coordinates?.latitude || 0,
                        longitude: addressList.find(addr => addr.id === selectedId)?.coordinates?.longitude || 0
                    }));
                }
            }
        } catch (error) {
            handleDeliveryAddressId(null);
            // Handle 403 errors gracefully (user not authenticated)
            const errorResponse = error as { response?: { status?: number; data?: { message?: string } } };
            if (errorResponse?.response?.status === 403) {
                // User is not authenticated, don't show error
                dispatch(setError(null));
                return;
            }
            dispatch(setError(error instanceof Error ? error.message : 'Failed to fetch addresses'));

        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleAddAddress = () => {
        open_dialog('addAddress', {
            open: true,
            propsData: {
                fetchAddresses
            },
            type: 'addAddress',
            handlerDialog: fetchAddresses,
            handleClose: () => { },
            anchor: 'bottom',
            drawerBorderRadius: '0px'
        });
    }

    const handleEditAddress = (id: string) => {
        const editData = addresses.find((addr: Address) => addr.id === id);
        open_dialog('addAddress', {
            open: true,
            propsData: {
                editData,
                fetchAddresses
            },
            type: 'addAddress',
            handlerDialog: fetchAddresses,
            handleClose: () => { },
            anchor: 'bottom',
            drawerBorderRadius: '0px'
        });
    }

    const handleDeleteAddress = async (id: string) => {
        setIsLoading(true);
        try {
            dispatch(setLoading(true));
            const res = await deleteCustomerAddress(storeId, id);
            if (res.message === 'Success') {
                dispatch(deleteAddress(id));
                if (selectedId === id) {
                    // If the deleted address was selected, set the first address as default
                    const remainingAddresses = addresses.filter((addr: Address) => addr.id !== id);
                    if (remainingAddresses.length > 0) {
                        const newDefaultId = remainingAddresses[0].id || '';
                        setSelectedId(newDefaultId);
                        dispatch(setSelectedAddress(newDefaultId));
                        handleDeliveryAddressId(newDefaultId);
                    } else {
                        dispatch(setSelectedAddress(null));
                        setSelectedId('');
                        handleDeliveryAddressId('');
                    }
                }
                await fetchAddresses(); // Refresh addresses after delete
                close_dialog(['mobileAddressSelector']);
            } else {

            }
            setIsLoading(false);
        } catch (error) {
            dispatch(setError(error instanceof Error ? error.message : 'Failed to delete address'));

        } finally {
            setIsLoading(false);
            dispatch(setLoading(false));
        }
    }

    const handleSelectAddress = (id: string) => {
        setSelectedId(id);
        dispatch(setSelectedAddress(id));
        handleDeliveryAddressId(id);
        onClose();
    }

    useEffect(() => {
        if (addresses?.length > 0 && !selectedId) {
            const defaultId = addresses[0].id || '';
            setSelectedId(defaultId);
            dispatch(setSelectedAddress(defaultId));
        }
    }, [addresses, selectedId]);

    return (
        <div className="h-[100vh] overflow-y-auto">
            <div className="address-header-container-mobile">
                <div className="flex items-center gap-2 justify-between">
                    <h2 className="address-title-mobile">{lang.chooseDeliveryAddress}</h2>
                    <Icon
                        icon={`${CROSS_ICON}#cross`}
                        width={14}
                        height={14}
                        color={"var(--primary-text)"}
                        className="cursor-pointer cross-icon"
                        viewBox="0 0 16 16"
                        onClick={onClose}
                    />
                </div>
            </div>

            <div className="p-4">
                <div className="address-card-container">{lang.savedAddresses}</div>
                {addresses.map((addr: Address) => (
                    <AddressCard
                        key={addr.id}
                        id={addr.id || ''}
                        label={addr.type || ''}
                        address={addr.address && addr.addressLine2 ? `${addr.address}, ${addr.addressLine2}` : addr.address || addr.addressLine2 || ''}
                        city={addr.city || ''}
                        state={addr.state || ''}
                        country={addr.country || ''}
                        zipCode={addr.zipCode || ''}
                        selected={selectedId === addr.id}
                        onSelect={
                            () => {
                                handleSelectAddress(addr.id || '');
                                dispatch(setCoordinates(addr.coordinates || { latitude: 0, longitude: 0 }));
                            }
                        }
                        onEdit={() => handleEditAddress(addr.id || '')}
                        onDelete={() => handleDeleteAddress(addr.id || '')}
                        type={addr.type || ''}
                        isLoading={isLoading}
                    />
                ))}
                <p className="add-new-address-mobile" onClick={handleAddAddress}>{lang.addNewAddress}</p>
            </div>

            <style>{`
                .address-card-container {
                    font-size: var(--heading-h5);
                    color: var(--primary-text);
                    font-weight: var(--font-bold);
                }
                .add-new-address-mobile{
                    margin-top: 12px;
                    font-size: var(--heading-h5);
                    color: var(--accent-color);
                    cursor: pointer;
                }
                .address-header-container-mobile{
                    background-color: var(--primary-background);
                    padding: 20px 10px;
                }
                .address-title-mobile{
                    color: var(--primary-text);
                    font-weight: var(--font-bold);
                }
            `}</style>
        </div>
    );
}

export default MobileAddressSelector;