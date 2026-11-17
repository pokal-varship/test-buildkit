'use client';

import Icon from '@components/image/Icons';
import Loader from '@components/loader/Loader';
import {
  ADD_LOCATION_PLACEHOLDER,
  ARROW_DOWN_IMAGE,
  ARROW_UP_IMAGE,
  HOME_ADDRESS_ICON,
  HOTEL_ADDRESS_ICON,
  OFFICE_ADDRESS_ICON
} from '@config/Header/image.config';
import useLang from '@hooks/useLang';
import { useCustomerAddresses } from '@hooks/useCustomerAddresses';
import { RootState } from '@redux/store';
import { deleteCustomerAddress } from '@services/checkOutService';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LanguageCode, TranslationKeys } from 'types';
import { setLoading, setError, deleteAddress, setSelectedAddress, setCoordinates } from '@redux/slices/userAddressSlice';

const DeliveryAddressSelector: React.FC<{ handleDeliveryAddressId: (id: string | null) => void }> = ({ handleDeliveryAddressId }) => {
  const dispatch = useDispatch();
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const store = useSelector((state: RootState) => state.store);
  const storeId = store?.currentStore?.id;
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const {
    addresses,
    selectedAddressId,
    loading,
    fetchAddresses,
    handleAddAddress,
    openAddAddressDialog,
  } = useCustomerAddresses({
    storeId,
    handleDeliveryAddressId,
    fetchOnMount: true,
  });

  const handleEdit = (id: string) => {
    const editData = addresses.find((addr) => addr.id === id);
    openAddAddressDialog(editData);
  };

  const handleDelete = async (id: string) => {
    try {
      dispatch(setLoading(true));
      if (!storeId) return;
      const res = await deleteCustomerAddress(storeId, id);
      if (res.message === 'Success') {
        dispatch(deleteAddress(id));
        
        // If the deleted address was selected, set the first address as default
        if (selectedAddressId === id) {
          const remainingAddresses = addresses.filter((addr) => addr.id !== id);
          if (remainingAddresses.length > 0) {
            const newDefaultId = remainingAddresses[0].id || '';
            dispatch(setSelectedAddress(newDefaultId));
            handleDeliveryAddressId(newDefaultId);
            dispatch(setCoordinates({
              latitude: remainingAddresses[0].coordinates?.latitude || 0,
              longitude: remainingAddresses[0].coordinates?.longitude || 0
            }));
          } else {
            dispatch(setSelectedAddress(null));
            handleDeliveryAddressId('');
          }
        }
        await fetchAddresses(); // Refresh addresses after delete
      }
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Failed to delete address'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleShowMore = () => setShowAllAddresses(true);
  const handleShowLess = () => setShowAllAddresses(false);
  const handleSelectAddress = (id: string) => {
    dispatch(setSelectedAddress(id));
    handleDeliveryAddressId(id);
  }

  const displayedAddresses = showAllAddresses ? addresses : addresses.slice(0, 3);

  return (
    <div className="delivery-address-selector">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
          <Loader />
        </div>
      )}
      <h4 className="delivery-address-label">{lang.selectDeliveryAddress}</h4>
      {addresses.length === 0 ? (
        <div className="no-address-container">
          <Icon
            icon={`${ADD_LOCATION_PLACEHOLDER}#add-address`}
            width={30}
            height={35}
            color={'var(--primary-text)'}
            className="cursor-pointer mb-2"
            viewBox="0 0 30 35"
          />
          <p className="no-address-text">{lang.noAddressFound}</p>
          <button onClick={handleAddAddress} className="add-new-address-button">
            {lang.addNewDeliveryAddress}
          </button>
        </div>
      ) : (
        <>
          <div className="address-list">
            {displayedAddresses.map((addr) => (
              <div
                className={`address-item ${selectedAddressId === addr.id ? 'selected' : 'not-selected'}`}
                key={addr.id}
                onClick={() => {
                  if (addr.id) {
                    handleSelectAddress(addr.id);
                  }
                  if (addr.coordinates) {
                    dispatch(setCoordinates(addr.coordinates));
                  }
                }}
              >
                <div className="address-type-icon">
                  <Icon
                    icon={
                      addr.type === 'Office'
                        ? `${OFFICE_ADDRESS_ICON}#office`
                        : addr.type === 'Hotel'
                          ? `${HOTEL_ADDRESS_ICON}#hotel`
                          : `${HOME_ADDRESS_ICON}#home`
                    }
                    width={20}
                    height={20}
                    color={'var(--primary-text)'}
                    viewBox="0 0 24 24"
                  />
                </div>
                <div className="address-details">
                  <span className="address-type">{addr.type || 'Address'}</span>
                  <span className="address-text">
                    {addr.address && addr.addressLine2 ? `${addr.address}, ${addr.addressLine2}` : addr.address || addr.addressLine2 || ''}
                    {addr.city || addr.state || addr.country || addr.zipCode ? ', ' : ''}
                    {[addr.city, addr.state, addr.country, addr.zipCode].filter(Boolean).join(', ')}
                  </span>
                </div>
                <div className="address-actions">
                  <button
                    className="edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (addr.id) handleEdit(addr.id);
                    }}
                  >
                    {lang.edit}
                  </button>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (addr.id) handleDelete(addr.id);
                    }}
                  >
                    {lang.delete}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="address-buttons-container">
            {addresses.length > 3 && !showAllAddresses && (
              <div onClick={handleShowMore} className="flex items-center gap-2 cursor-pointer">
                <p className="show-more-addresses">{lang.showMoreAddresses}</p>
                <Icon
                  icon={`${ARROW_DOWN_IMAGE}#arrow-down`}
                  width={10}
                  height={10}
                  color={'var(--primary-text)'}
                  viewBox="0 0 9 6"
                />
              </div>
            )}

            {showAllAddresses && addresses.length > 3 && (
              <div onClick={handleShowLess} className="flex items-center gap-2 cursor-pointer">
                <p className="show-more-addresses">{lang.showLessAddresses}</p>
                <Icon
                  icon={`${ARROW_UP_IMAGE}#arrow-up`}
                  width={10}
                  height={10}
                  color={'var(--primary-text)'}
                  viewBox="0 0 9 6"
                />
              </div>
            )}

            <button onClick={handleAddAddress} className="add-new-address">
              {lang.addNewDeliveryAddress}
            </button>
          </div>
        </>
      )}
      <style>{`
        .address-buttons-container {
          display: flex;
          flex-direction: column;
          justify-content: start;
          margin-top: 10px;
          align-items: flex-start;
        }
        .delivery-address-selector {
          background-color: var(--cards-containers);
          width: 100%;
          // padding: 20px;
          // border: 1px solid var(--borders-dividers);
          border-radius: 10px;
          margin: 20px auto;
          display:block;
        }
        .delivery-address-label {
          font-size: var(--heading-h4);
          font-weight: var(--font-bold);
          color: var(--primary-text);
          margin-bottom: 10px;
        }
        .no-address-container {
          border: 2px dashed var(--borders-dividers);
          border-radius: 10px;
          padding: 40px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .address-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .address-item {
          display: flex;
          align-items: center;
          background: #fff;
          border: 1px solid var(--borders-dividers);
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
        }
        .address-item.selected {
          border: 2px solid var(--primary-color);
          background-color: var(--secondary-active-background);
        }

        .address-item.not-selected {
          background-color: var(--cards-containers);
        }
        
        .address-type-icon {
          margin-right: 12px;
        }
        .address-details {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .address-type {
          font-weight: var(--font-bold);
          color: var(--primary-text);
          font-size: var(--heading-h4);
        }
        .address-text {
          font-size: var(--small-font);
          color: var(--primary-text);
        }
        .address-actions {
          display: flex;
          gap: 12px;
        }
        .edit-btn, .delete-btn {
          font-weight: var(--font-regular);
          cursor: pointer;
          font-size: var(--description-font);
          background: none;
          border: none;
        }
        .edit-btn {
          color: var(--accent-color);
        }
        .delete-btn {
          color: var(--primary-text);
        }
        .edit-btn:hover, .delete-btn:hover {
          text-decoration: underline;
        }
        .show-more-addresses {
          font-size: var(--description-font);
          font-weight: var(--font-regular);
          color: var(--primary-text);
        }
        .add-new-address {
          font-size: var(--description-font);
          font-weight: var(--font-regular);
          color: var(--accent-color);
          margin-top: 10px;
        }
        .add-new-address-button {
          font-size: var(--description-font);
          font-weight: var(--font-regular);
          color: var(--accent-color);
        }
        .no-address-text {
          font-size: var(--small-font);
          font-weight: var(--font-regular);
          color: var(--primary-text);
        }
      `}</style>
    </div>
  );
};

export default DeliveryAddressSelector;
