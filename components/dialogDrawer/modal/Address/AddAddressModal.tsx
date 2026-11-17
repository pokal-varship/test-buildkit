'use client'
import React, { useEffect, useState } from 'react';
import CustomButton from '@components/buttons/Button';
import { addCustomerAddress, updateCustomerAddress } from '@services/checkOutService';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import ShowMapWithSearch from '@components/checkOut/ShowMapWithSearch';
import { AddressEditData, AddressPayload, LocationAddress } from '@components/checkOut/checkout.type';
import { CROSS_ICON } from '@config/Header/image.config';
import Icon from '@components/image/Icons';
import { LanguageCode, TranslationKeys } from 'types';
import useLang from '@hooks/useLang';
import { setLoading, setError } from '@redux/slices/userAddressSlice';
import { close_dialog } from '@lib/modalHandler';
import { AddressType } from '@components/order/order.type';
import { MapContainer } from 'react-leaflet';
import { handleManualAddressSearchbyZipcode } from '@services/location';
import DeliveryAddressForm from '@components/address/DeliveryAddressForm';

const AddAddressModal: React.FC<{ onClose: () => void, editData?: AddressEditData, fetchAddresses?: () => Promise<void> }> = ({ onClose, editData, fetchAddresses }) => {
  const dispatch = useDispatch();
  const location = useSelector((state: RootState) => state.location);
  const storeId = useSelector((state: RootState) => state.store?.currentStore?.id);
  const { loading } = useSelector((state: RootState) => state.userAddress);
  const [lang]: [TranslationKeys, LanguageCode] = useLang();

  const [addressType, setAddressType] = useState<AddressType>('Home');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [address1, setAddress1] = useState('');
  const [landmark, setLandmark] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [coordinates, setCoordinates] = useState({
    latitude: location.latitude || 0,
    longitude: location.longitude || 0,
  });

  const [isFromApi, setIsFromApi] = useState({
    country: false,
    city: false,
    zipcode: false,
    state: false,
  });

  const [step, setStep] = useState(1);

  // Initialize step to 2 if editing (to show form fields directly)
  useEffect(() => {
    if (editData) {
      setStep(2);
    }
  }, [editData]);

  const handleAddAddress = async () => {
    if (!storeId) return console.log('Store ID not available yet');
    dispatch(setLoading(true));
    const payload: AddressPayload = {
      address: deliveryArea,
      addressLine2: address1,
      landmark: landmark,
      zipCode: zipcode,
      type: addressType,
      coordinates: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      },
      country: country,
      city: city,
      state: state,
    };

    if (addressType === 'Hotel') {
      payload.locationName = hotelName;
      payload.unitNumber = roomNo;
    }

    if (editData?.id) {
      payload.id = editData.id;
    }

    try {
      const res = editData
        ? await updateCustomerAddress(storeId, payload)
        : await addCustomerAddress(storeId, payload);

      if (res?.data) {
        close_dialog(['addAddress']);
        onClose();
        await fetchAddresses?.();
      }
      close_dialog(['mobileAddressSelector']);
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Failed to save address'));

    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleManualAddressUpdate = async () => {
    if (!zipcode) return;
    try {
      const data = await handleManualAddressSearchbyZipcode(zipcode);
      if (data && data.length > 0) {
        setCoordinates({
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        });
      }
    } catch {

    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleManualAddressUpdate();
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [zipcode]);

  useEffect(() => {
    if (editData) {
      setAddressType(editData.type as AddressType);
      setDeliveryArea(editData.address || '');
      setAddress1(editData.addressLine2 || '');
      setLandmark(editData.landmark || '');
      setZipcode(editData.zipCode || '');
      setHotelName(editData.locationName || '');
      setRoomNo(editData.unitNumber || '');
      setCountry(editData?.country || '');
      setCity(editData?.city || '');
      setState(editData?.state || '');
      
      // Set coordinates from editData if available
      if (editData.coordinates) {
        setCoordinates({
          latitude: editData.coordinates.latitude || 0,
          longitude: editData.coordinates.longitude || 0,
        });
      }
    }
  }, [editData]);

  const handleCurrentLocation = (location: LocationAddress) => {
    const displayName = location?.display_name || '';
    const parts = displayName.split(',').map(p => p.trim());

    const toRemove = new Set([
      location?.address?.state,
      location?.address?.country,
      location?.address?.postcode,
      location?.address?.state_district || location?.address?.city,
    ].filter(Boolean));

    const filteredParts = parts.filter(p => !toRemove.has(p));
    const deliveryArea = filteredParts.join(', ');

    setDeliveryArea(deliveryArea);
    setZipcode(location?.address?.postcode || '');
    setCountry(location?.address?.country || '');
    setCity(location?.address?.state_district || location?.address?.city || '');
    setState(location?.address?.state || '');
    setCoordinates({
      latitude: parseFloat(location?.lat || '0'),
      longitude: parseFloat(location?.lon || '0'),
    });

    setIsFromApi({
      country: !!location?.address?.country,
      city: !!location?.address?.state_district || !!location?.address?.city,
      zipcode: !!location?.address?.postcode,
      state: !!location?.address?.state,
    });
  }

  return (
    <div className="dialog-container-address">
      <div className="dialog-header-address">
        <h2 className="dialog-title">{lang.setYourDeliveryLocation}</h2>
        <Icon
          icon={`${CROSS_ICON}#cross`}
          width={16}
          height={16}
          color={"var(--primary-text)"}
          className="cursor-pointer cross-icon"
          viewBox="0 0 16 16"
          onClick={onClose}
        />
      </div>
      {step === 1 &&
        <>
          <div className="map-section">
            <MapContainer
              center={[
                editData?.coordinates?.latitude ?? coordinates.latitude ?? location.latitude ?? 0,
                editData?.coordinates?.longitude ?? coordinates.longitude ?? location.longitude ?? 0
              ]}
              zoom={13}
              className="map-container"
            >
              <ShowMapWithSearch
                handleCurrentLocation={handleCurrentLocation}
                editData={editData as unknown as LocationAddress}
              />
            </MapContainer>
          </div>

          <div className="save-btn-container">
            <CustomButton
              onClick={() => setStep(2)}
              className="save-btn"
          >
              {lang.saveAndAddMoreDetails}
            </CustomButton>
          </div>
        </>
      }
      {step === 2 && <DeliveryAddressForm
        deliveryArea={deliveryArea}
        setDeliveryArea={setDeliveryArea}
        country={country}
        setCountry={setCountry}
        city={city}
        setCity={setCity}
        zipcode={zipcode}
        setZipcode={setZipcode}
        state={state}
        setState={setState}
        hotelName={hotelName}
        setHotelName={setHotelName}
        roomNo={roomNo}
        setRoomNo={setRoomNo}
        address1={address1}
        setAddress1={setAddress1}
        landmark={landmark}
        setLandmark={setLandmark}
        addressType={addressType}
        setAddressType={setAddressType}
        handleManualAddressUpdate={handleManualAddressUpdate}
        handleAddAddress={handleAddAddress}
        loading={loading}
        lat={coordinates.latitude ?? 0}
        lng={coordinates.longitude ?? 0}
        setStep={setStep}
        isFromApi={isFromApi}
      />}
      <style>{`
                .dialog-container-address {
                    width: 100%;
                    min-width: 450px;
                    background-color: var(--cards-containers);
                    border-radius: 12px;
                    padding: 0;
                    max-width: 450px;
                    display: flex;
                    flex-direction: column;
                    height: ${step === 2 ? '100vh' : 'auto'};
                    max-height: ${step === 2 ? '100vh' : 'calc(100vh - 64px)'};
                    overflow: hidden;
                }

                .dialog-header-address {
                    position: sticky;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 10;
                    background-color: var(--cards-containers);
                    padding: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--borders-dividers);
                }

                .dialog-header-container{
                    padding: 0;
                }
                .map-section {
                    padding: 0px;
                    background-color: var(--borders-dividers);
                    flex: 1 1 auto;
                    min-height: 200px;
                    max-height: 400px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                .map-placeholder {
                    width: 100%;
                    height: 120px;
                    background-color: var(--borders-dividers);
                    border-radius: 8px;
                    display: flex;
                    align-items: flex-end;
                    justify-content: flex-start;
                    position: relative;
                }

                .dialog-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 0px;
                    width: 90%;
                    margin: 0 auto;
                    border-bottom: 1px solid var(--borders-dividers);
                }
                .dialog-title {
                    font-size: var(--heading-h2);
                    font-weight: var(--font-bold);
                    color: var(--primary-text);
                }
                .close-icon {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                }
                .address-form {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                    height: ${step === 2 ? 'calc(100vh - 26vh)' : 'auto'};
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 12px;
                }
                .label-text {
                    font-size: var(--small-font);
                    color: var(--secondary-text);
                    margin-bottom: 2px;
                }
                .form-group input[type="text"] {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid var(--borders-dividers);
                    border-radius: 6px;
                    background-color: var(--cards-containers);
                    color: var(--primary-text);
                    border: 1px solid var(--borders-dividers);
                }
                .form-group input[type="text"]:focus-visible {
                    border: 1px solid var(--borders-dividers);
                    outline: none;
                }
                .address-type-group {
                    margin-bottom: 16px;
                }
                .radio-group {
                    display: flex;
                    margin-top: 4px;
                    justify-content: space-between;
                }
                .radio-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 1rem;
                    font-weight: var(--font-medium);
                    color: var(--primary-text);
                }
                .custom-radio {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 2px solid var(--primary-color);
                    background: #fff;
                    position: relative;
                    transition: background 0.2s ease;
                }

                .radio-label input[type="radio"] {
                    display: none;
                }
                .radio-label input[type="radio"]:checked + .custom-radio::after {
                    content: '';
                    width: 12px;
                    height: 12px;
                    background: var(--primary-color);
                    border-radius: 50%;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }
                .save-btn {
                    width: 100%;
                    font-weight: var(--font-bold);
                    padding: 12px;
                    border-radius: 8px;
                    border: none;
                }
                .save-btn:disabled {
                    opacity: 0.5;
                }
                .input-wrapper {
                    display: flex;
                    gap: 12px;
                    width: 100%;
                }
                .input-column {
                    flex: 1;
                }
                .input-column input[type="text"] {
                    width: 100%;
                }

                .save-btn-container {
                    flex-shrink: 0;
                    padding: 16px;
                    position: relative;
                }
                .map-container{
                    height: 400px;
                    width: 100%;
                }
                @media (max-width: 768px) {
                    .dialog-container-address {
                        min-width: 300px;
                        border-radius: 10px;
                        max-width: 100%;
                        height: calc(100vh - 50px);
                        max-height: calc(100vh - 50px);
                    }
                    .map-section, .address-form {
                        padding: 0px;
                        flex: 1 1 auto;
                        min-height: 0;
                        max-height: none;
                        overflow-y: auto;
                        padding-right: ${step === 2 ? '10px' : '0px'};
                    }
                    .dialog-title{
                        font-size: var(--heading-h3);
                    }
                    .dialog-header-container{
                        padding: 0 8px;
                    }
                    .save-btn{
                        margin-bottom: 10px;
                    }
                    .input-wrapper{
                        flex-direction: column;
                    }
                    .map-container{
                        height: calc(100vh - 220px);
                    }
                    .save-btn-container{
                      width: 100%;
                      position: sticky;
                      bottom: 0;
                      left: 0;
                      background-color: var(--cards-containers);
                      padding: 16px;
                      z-index: 10;
                    }
                }

            `}</style>
    </div>
  );
};

export default AddAddressModal;
