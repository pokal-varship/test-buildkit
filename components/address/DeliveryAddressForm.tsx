import React from "react";
import CustomButton from "@components/buttons/Button";
import { LanguageCode, TranslationKeys } from "types";
import useLang from "@hooks/useLang";
import LocationMap from "./LocationMap";
import { AddressType } from "@components/order/order.type";
interface DeliveryAddressFormProps {
    deliveryArea: string;
    setDeliveryArea: (value: string) => void;
    country: string;
    setCountry: (value: string) => void;
    city: string;
    setCity: (value: string) => void;
    zipcode: string;
    setZipcode: (value: string) => void;
    state: string;
    setState: (value: string) => void;
    hotelName: string;
    setHotelName: (value: string) => void;
    roomNo: string;
    setRoomNo: (value: string) => void;
    address1: string;
    setAddress1: (value: string) => void;
    landmark: string;
    setLandmark: (value: string) => void;
    addressType: AddressType;
    setAddressType: (value: AddressType) => void;
    handleManualAddressUpdate: () => void;
    handleAddAddress: () => void;
    loading: boolean;
    lat: number;
    lng: number;
    setStep: (value: number) => void;
    isFromApi: {
        country: boolean;
        city: boolean;
        zipcode: boolean;
        state: boolean;
    };
}

const DeliveryAddressForm: React.FC<DeliveryAddressFormProps> = ({
    deliveryArea,
    country,
    setCountry,
    city,
    setCity,
    zipcode,
    setZipcode,
    state,
    setState,
    hotelName,
    setHotelName,
    roomNo,
    setRoomNo,
    address1,
    setAddress1,
    landmark,
    setLandmark,
    addressType,
    setAddressType,
    handleManualAddressUpdate,
    handleAddAddress,
    loading,
    lat,
    lng,
    setStep,
    isFromApi={
        country: false,
        city: false,
        zipcode: false,
        state: false,
    }
}) => {
    const [lang]: [TranslationKeys, LanguageCode] = useLang();
    return (
        <div className="dialog-header-container mt-5">
            <form className="address-form">

                {/* Map Section */}
            <div className="flex flex-row gap-2 justify-center items-center w-full mb-5">
                <div className="w-1/3">
                    <LocationMap lat={lat} lng={lng} />
                </div>
                <div className="w-2/3">
                    <div className="map-section-text w-full">
                        <p className="delivery-area-text">{deliveryArea}</p>
                        <p className="change-location-text cursor-pointer" onClick={() => setStep(1)}>{lang.change}</p>
                    </div>
                    </div>
                </div>

                {/* Country and City */}
                <div className="form-group">
                    <div className="input-wrapper">
                        <div className="input-column">
                            <label className="label-text">{lang.Country}*</label>
                            <input
                                type="text"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                placeholder={lang.enterCountry}
                                disabled={isFromApi.country}
                                className={`${isFromApi.country ? "disabled-input-field" : ""}`}
                            />
                        </div>
                        <div className="input-column">
                            <label className="label-text">{lang.City}*</label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder={lang.enterCity}
                                disabled={isFromApi.city}
                                className={`${isFromApi.city ? "disabled-input-field" : ""}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Zipcode and State */}
                <div className="form-group">
                    <div className="input-wrapper">
                        <div className="input-column">
                            <label className="label-text">{lang.zipcode}*</label>
                            <input
                                type="text"
                                value={zipcode}
                                onChange={(e) => setZipcode(e.target.value)}
                                placeholder={lang.enterZipcode}
                                onBlur={handleManualAddressUpdate}
                                disabled={isFromApi.zipcode}
                                className={`${isFromApi.zipcode ? "disabled-input-field" : ""}`}
                            />
                        </div>
                        <div className="input-column">
                            <label className="label-text">{lang.State}*</label>
                            <input
                                type="text"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                placeholder={lang.enterState}
                                disabled={isFromApi.state}
                                className={`${isFromApi.state ? "disabled-input-field" : ""}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Hotel Fields */}
                {addressType === "Hotel" && (
                    <>
                        <div className="form-group">
                            <label className="label-text">{lang.hotelName}</label>
                            <input
                                type="text"
                                value={hotelName}
                                onChange={(e) => setHotelName(e.target.value)}
                                placeholder={lang.enterHotelName}
                            />
                        </div>
                        <div className="form-group">
                            <label className="label-text">{lang.roomNo}</label>
                            <input
                                type="text"
                                value={roomNo}
                                onChange={(e) => setRoomNo(e.target.value)}
                                placeholder={lang.enterRoomNo}
                            />
                        </div>
                    </>
                )}

                {/* Address Line and Landmark */}
                <div className="form-group">
                    <label className="label-text">{lang.houseNoFlatNoBuildingNo}</label>
                    <input
                        type="text"
                        value={address1}
                        onChange={(e) => setAddress1(e.target.value)}
                        placeholder={lang.enterAddressLine1}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="label-text">{lang.landmark}</label>
                    <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder={lang.enterLandmark}
                    />
                </div>

                {/* Address Type */}
                <div className="form-group address-type-group">
                    <label className="label-text">{lang.addressType}</label>
                    <div className="radio-group">
                        {["Home", "Hotel", "Office"].map((type) => (
                            <label key={type} className="radio-label">
                                <input
                                    type="radio"
                                    checked={addressType === type}
                                    onChange={() => setAddressType(type as "Home" | "Hotel" | "Office")}
                                />
                                <span className="custom-radio" />
                                {type}
                            </label>
                        ))}
                    </div>
                </div>

                <CustomButton
                    onClick={handleAddAddress}
                    className="save-btn"
                    disabled={!deliveryArea || !zipcode || !country || !city || !state || loading}
                >
                    {loading ? lang.saving : lang.saveAndProceed}
                </CustomButton>
            </form>
            <style>{`
                .change-location-text {
                    color: var(--accent-color);
                    font-size: var(--description-font);
                    font-weight: var(--font-regular);
                    width: fit-content;
                }
                .delivery-area-text {
                    font-size: var(--description-font);
                    font-weight: var(--font-regular);
                    color: var(--primary-text);
                }
                .form-group input[type="text"].disabled-input-field {
                    background-color: var(--primary-background);
                }
            `}</style>
        </div>
    );
};

export default DeliveryAddressForm;
