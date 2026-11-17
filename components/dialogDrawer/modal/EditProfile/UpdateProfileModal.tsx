'use client'
import CustomButton from "@components/buttons/Button";
import { ExtendedSession } from "@components/header/types";
import Icon from "@components/image/Icons";
import Loader from "@components/loader/Loader";
import PhoneNumberInput from "@components/phonenumber/PhoneNumberInput";
import { useToast } from "@components/toast/Toast";
import { validateEmail } from "@components/validation";
import { ARROW_RIGHT_ICON, CROSS_ICON, CROSS_ICON_DARK, SUCCESS_CIRCLE_ICON } from "@config/Header/image.config";
import useLang from "@hooks/useLang";
import { useProductUrl } from "@hooks/useProductUrl";
import { close_dialog, open_dialog } from "@lib/modalHandler";
import { updateProfile } from "@services/profileService";
import { useTheme } from "context/ThemeProvider";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectIsQrFlowActive } from "@redux/slices/qrFlowSlice";
import { LanguageCode, TranslationKeys } from "types";
import { usePhoneValidation } from "@hooks/usePhoneValidation";

interface UpdateProfileModalProps {
    onClose: () => void;
}

interface UpdateProfilePayload {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    countryCode?: string;
    phoneIsoCode?: string;
}

interface CustomError extends Error {
    status?: number; // Optional status property
    response?: {
        data?: {
            message?: string;
            data?: { // Add this line to include data property
                expiresIn?: number; // Adjust the type as necessary
            };
        };
    };
}

const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({ onClose }) => {
    const [lang]: [TranslationKeys, LanguageCode] = useLang();
    const isQrFlow = useSelector(selectIsQrFlowActive);
    const { data: session, update } = useSession() as { data: ExtendedSession | null, update: (session: ExtendedSession) => void };
    const [userEmail, setUserEmail] = useState(session?.user?.email || '');
    const [firstName, setFirstName] = useState(session?.user?.firstName || '');
    const [lastName, setLastName] = useState(session?.user?.lastName || '');
    const [phoneNumber, setPhoneNumber] = useState(session?.user?.phoneNumber || '');
    const [dialCode, setDialCode] = useState(session?.user?.countryCode || '');
    const [phoneIsoCode, setPhoneIsoCode] = useState(session?.user?.phoneIsoCode || '');
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const router = useRouter();
    const pathname = usePathname();
    const isEditProfilePage =
        pathname === "/editProfile" || (pathname?.startsWith("/editProfile/") ?? false);
    const { getEditProfileUpdateEmailUrl, getEditProfileUpdatePhoneUrl } = useProductUrl();

    const handleCloseEditProfile = () => {
        if (isEditProfilePage) {
            router.back();
        } else {
            onClose();
        }
    };
    const { theme } = useTheme();
    const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);
    const [isPhoneApiValidated, setIsPhoneApiValidated] = useState(false);

    // Phone validation hook
    const { validatePhoneNumber: validatePhoneAPI } = usePhoneValidation({
        onSuccess: (message) => {
            toast('success', message);
            setIsPhoneApiValidated(true);
        },
        onError: (message) => {
            toast('error', message);
            setIsPhoneApiValidated(false);
        },
        debounceDelay: 300, // Faster response
    });

    const isEmailValid = validateEmail(userEmail);

    const hasProfileChanges = (): boolean => {
        const currentPhoneNumber = session?.user?.phoneNumber || '';
        const currentCountryCode = session?.user?.countryCode || '';
        
        // Check if phone number has changed
        const currentFullPhone = `${currentCountryCode}${currentPhoneNumber}`;
        const newFullPhone = `${dialCode}${phoneNumber}`;
        const phoneChanged = newFullPhone !== currentFullPhone;
        
        // Check if first name or last name has changed
        const firstNameChanged = firstName !== (session?.user?.firstName || '');
        const lastNameChanged = lastName !== (session?.user?.lastName || '');
        return firstNameChanged || lastNameChanged || phoneChanged;
    };

    const handleValidation = (): boolean => {
        const currentPhoneNumber = session?.user?.phoneNumber || '';
        const currentCountryCode = session?.user?.countryCode || '';
        const currentFullPhone = `${currentCountryCode}${currentPhoneNumber}`;
        const newFullPhone = `${dialCode}${phoneNumber}`;
        const phoneChanged = newFullPhone !== currentFullPhone;

        const basicValidation = (isEmailValid || (!userEmail && !!session?.user?.phoneNumber)) && firstName !== '' && lastName !== '';
        
        // Phone validation only required if phone number has changed
        const phoneValidation = phoneChanged ? (isPhoneNumberValid && isPhoneApiValidated) : true;

        return basicValidation && phoneValidation && hasProfileChanges();
    }

    const handleUpdateProfile = async () => {
        if (!handleValidation()) {
            return;
        }
        try {
            setLoading(true);
            const payload: Partial<UpdateProfilePayload> = {};

            // Normalize dial code to always be in "+<digits>" format
            const normalizedDialCode = dialCode.replace(/\D/g, '');
            const countryCodeWithPlus = normalizedDialCode ? `+${normalizedDialCode}` : '';

            // Ensure we always work with phone number without country code prefix
            const strippedPhoneNumber = phoneNumber
                .replace(countryCodeWithPlus, '')
                .replace(/^\+/, '');

            if(firstName.length > 0 && firstName !== session?.user?.firstName){
                payload.firstName = firstName;
            }
            if(lastName.length > 0 && lastName !== session?.user?.lastName){
                payload.lastName = lastName;
            }

            // if phone number is not empty then update the phone number
            if(strippedPhoneNumber.length > 0 && strippedPhoneNumber !== (session?.user?.phoneNumber || '')){
                payload.phone = strippedPhoneNumber;
                payload.countryCode = countryCodeWithPlus;
                payload.phoneIsoCode = phoneIsoCode.toUpperCase();
            }
            const res = await updateProfile(payload);

            if (res.message === "Success") {
                if (session?.user) {
                    await update({
                        ...session,
                        user: {
                            ...session.user,
                            name: `${firstName} ${lastName}`,
                            firstName: firstName,
                            lastName: lastName,
                            phoneNumber: strippedPhoneNumber || session.user.phoneNumber,
                            countryCode: countryCodeWithPlus || session.user.countryCode,
                            phoneIsoCode: phoneIsoCode.toUpperCase(),
                        },
                    });
                }
                router.refresh();
                setLoading(false);
                close_dialog(["updateProfile"]);
                open_dialog("emailSuccess", {
                    open: true,
                    propsData: {
                        title: lang.nameUpdatedSuccessfully,
                    },
                    type: "emailSuccess",
                    handlerDialog: () => { },
                    handleClose: () => { },
                    anchor: 'bottom',
                    onlyDialog: true
                });
            }
        } catch (error: unknown) {
            const err = error as CustomError;

            toast('error', err.response?.data?.message || lang.somethingWentWrong);
            setLoading(false);
        }
    };

    const handleEmailEditMobile = () => {
        router.push(getEditProfileUpdateEmailUrl());
    };

    const handleEmailEditDesktop = () => {
        open_dialog("updateEmail", {
            open: true,
            propsData: {
                email: lang.updateEmail,
            },
            type: "updateEmail",
            handlerDialog: () => { },
            handleClose: () => {
                close_dialog(["updateEmail"]);
            },
            anchor: 'bottom',
            onlyDialog: true,
            className: "update-email-dialog",
            sxStyle: {
                '& .MuiDialogContent-root': {
                    backgroundColor: 'var(--tertiary-background)',
                },
            },
        });
        close_dialog(["updateProfile"]);
    };

    const handlePhoneEditMobile = () => {
        router.push(getEditProfileUpdatePhoneUrl());
    };

    const handlePhoneEditDesktop = () => {
        open_dialog("updatePhone", {
            open: true,
            propsData: {},
            type: "updatePhone",
            handlerDialog: () => { },
            handleClose: () => {
                close_dialog(["updatePhone"]);
            },
            anchor: 'bottom',
            onlyDialog: true,
            className: "update-phone-dialog",
            sxStyle: {
                '& .MuiDialogContent-root': {
                    backgroundColor: 'var(--tertiary-background)',
                },
            },
        });
        close_dialog(["updateProfile"]);
    }

    useEffect(() => {
        if (session?.user) {
            setUserEmail(session?.user?.email || '');
            setFirstName(session?.user?.firstName || '');
            setLastName(session?.user?.lastName || '');
            setPhoneNumber(session?.user?.phoneNumber || '');
            setDialCode(session?.user?.countryCode || '');
            setPhoneIsoCode(session?.user?.phoneIsoCode || '');
        }
    }, [session]);

    // Reset phone validation states when phone number is reset to original
    useEffect(() => {
        const currentPhoneNumber = session?.user?.phoneNumber || '';
        const currentCountryCode = session?.user?.countryCode || '';
        const currentFullPhone = `${currentCountryCode}${currentPhoneNumber}`;
        const newFullPhone = `${dialCode}${phoneNumber}`;
        
        // If phone number is back to original, reset validation states
        if (currentFullPhone === newFullPhone) {
            setIsPhoneNumberValid(false);
            setIsPhoneApiValidated(false);
        }
    }, [phoneNumber, dialCode, session?.user?.phoneNumber, session?.user?.countryCode]);

    const handlePhoneChange = (phoneNumber: string, dialCode: string, phoneIsoCode: string) => {
        setPhoneNumber(phoneNumber);
        setDialCode(dialCode);
        setPhoneIsoCode(phoneIsoCode);
        
        // Reset API validation when phone changes
        setIsPhoneApiValidated(false);
    }

    const handleCountryChange = () => {
        // Clear validation state when country changes
        setIsPhoneNumberValid(false);
        setIsPhoneApiValidated(false);
    }

    const handlePhoneValidation = (phoneNumber: string, dialCode: string, phoneIsoCode: string, isValid: boolean) => {
        // Check if phone has changed from original
        const currentPhoneNumber = session?.user?.phoneNumber || '';
        const currentCountryCode = session?.user?.countryCode || '';
        const currentFullPhone = `${currentCountryCode}${currentPhoneNumber}`;
        const newFullPhone = `${dialCode}${phoneNumber}`;
        const phoneChanged = newFullPhone !== currentFullPhone;

        // Only trigger API validation if library validation passes and phone has changed
        if (isValid && phoneChanged && phoneNumber && phoneNumber !== `+${dialCode}`) {
            validatePhoneAPI(phoneNumber, dialCode, phoneIsoCode, userEmail, isValid);
        }
    }

    
    
    return (
      <>
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
            <Loader />
          </div>
        )}
        {isQrFlow && 
        <div className="dialog-header-edit-profile dialog-header-edit-profile-qr-sticky">
        <div className="flex items-center justify-between w-full">
          <div className="profile-details">
            <p className="edit-profile-details-text">
              {lang.editProfile}
            </p>
          </div>
          {/* Close Icon */}
          <Icon
            icon={`${
              theme === "light"
                ? `${CROSS_ICON}#cross`
                : `${CROSS_ICON_DARK}#cross-dark`
            }`}
            width={24}
            height={24}
            color={"var(--primary-text)"}
            className="cursor-pointer cross-icon"
            viewBox="0 0 24 24"
            onClick={onClose}
          />
        </div>
  </div>}
        <div className="dialog-container-edit-profile">
          <div className={`dialog-container-edit-profile-content ${isQrFlow ? 'qr-flow-edit-profile-pad' : ''}`}>
            <div className="dialog-container-edit-profile-content-inner">

            {/* Header Container For Mobile - hidden in QR flow */}
            {!isQrFlow && (
            <div className="header-container-edit-profile">
              <div className="profile-header-edit-profile">
                <div className="flex items-center justify-between w-full">
                  <div className="profile-details">
                    <p className="edit-profile-details-text">
                      {lang.editProfile}
                    </p>
                  </div>
                  <Icon
                    icon={`${
                      theme === "light"
                        ? `${CROSS_ICON}#cross`
                        : `${CROSS_ICON_DARK}#cross-dark`
                    }`}
                    width={24}
                    height={24}
                    className="cursor-pointer cross-icon-edit-profile md:block"
                    viewBox="0 0 24 24"
                    onClick={handleCloseEditProfile}
                  />
                </div>
              </div>
            </div>
            )}

            {/* Mobile Email Input */}
            <div className="form-mobile" onClick={handleEmailEditMobile}>
              <div className="form-group-edit-profile">
                <label className="label-text">{lang.emailAddress}</label>
                <div className="flex items-center justify-between">
                  <div className="relative flex-1">
                    {/* Email Input */}
                    <input
                      type="email"
                      placeholder={lang.emailAddressPlaceholderText}
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full cursor-pointer input-with-icons"
                      readOnly={true}
                    />

                    {isEmailValid && (
                      <div className="input-icon success-icon-email pointer-events-none">
                        <Icon
                          icon={`${SUCCESS_CIRCLE_ICON}#success-circle`}
                          width={20}
                          height={20}
                          viewBox="0 0 22 22"
                          color="var(--success)"
                        />
                      </div>
                    )}

                    {/* Arrow Icon */}
                    <div className="input-icon arrow-icon pointer-events-none">
                      <Icon
                        icon={`${ARROW_RIGHT_ICON}#arrow-right`}
                        width={25}
                        height={25}
                        unit="px"
                        color={"var(--primary-text)"}
                        viewBox="0 0 22 23"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Name Container */}
            <div className="name-container-edit-profile">
              {/* First Name */}
              <div className="form-group-edit-profile">
                <label className="label-text">{lang.firstName}</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) =>
                    setFirstName(e.target.value.replace(/^\s+/, ""))
                  }
                  placeholder="Willie"
                />
              </div>

              {/* Last Name */}
              <div className="form-group-edit-profile">
                <label className="label-text">{lang.lastName}</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) =>
                    setLastName(e.target.value.replace(/^\s+/, ""))
                  }
                  placeholder="Jennings"
                />
              </div>
            </div>

            {/* Desktop Email Input */}
            <div className="form-desktop" onClick={handleEmailEditDesktop}>
              <div className="form-group-edit-profile">
                <label className="label-text">{lang.emailAddress}</label>
                <div className="flex items-center justify-between">
                  <div className="relative flex-1">
                    {/* Email Input */}
                    <input
                      type="email"
                      placeholder={lang.emailAddressPlaceholderText}
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full cursor-pointer input-with-icons"
                      readOnly={true}
                    />

                    {isEmailValid && (
                      <div className="input-icon success-icon-email pointer-events-none">
                        <Icon
                          icon={`${SUCCESS_CIRCLE_ICON}#success-circle`}
                          width={20}
                          height={20}
                          viewBox="0 0 22 22"
                          color="var(--success)"
                        />
                      </div>
                    )}

                    {/* Arrow Icon */}
                    <div className="input-icon arrow-icon pointer-events-none">
                      <Icon
                        icon={`${ARROW_RIGHT_ICON}#arrow-right`}
                        width={25}
                        height={25}
                        unit="px"
                        color={"var(--primary-text)"}
                        viewBox="0 0 22 23"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone Number Container - Mobile (click redirects to update phone page) */}
            <div className="form-mobile cursor-pointer" onClick={handlePhoneEditMobile}>
              <div className="form-group-edit-profile">
                <label className="label-text">{lang.phoneNumber}</label>
                <div className="flex items-center justify-between">
                  <div className="relative flex-1 edit-profile-phone-number-input pointer-events-none">
                    <PhoneNumberInput
                      phoneNumber={`${dialCode}${phoneNumber}`}
                      dialCode={dialCode}
                      phoneIsoCode={phoneIsoCode.toLowerCase()}
                      setPhoneNumber={setPhoneNumber}
                      setDialCode={setDialCode}
                      setPhoneIsoCode={setPhoneIsoCode}
                      setIsPhoneNumberValid={setIsPhoneNumberValid}
                      onPhoneChange={(phone, dial, iso, isValid) => {
                        handlePhoneChange(phone, dial, iso);
                        // Trigger validation after phone change with current validation state
                        handlePhoneValidation(phone, dial, iso, isValid);
                      }}
                      onCountryChange={handleCountryChange}
                      onBlur={() => {
                        // Validate on blur if valid
                        if (
                          isPhoneNumberValid &&
                          phoneNumber &&
                          phoneNumber !== `+${dialCode}`
                        ) {
                          handlePhoneValidation(
                            phoneNumber,
                            dialCode,
                            phoneIsoCode,
                            isPhoneNumberValid
                          );
                        }
                      }}
                    />
                     {phoneNumber.length > 0 && (
                      <div className="input-icon success-icon-phone pointer-events-none">
                        <Icon
                          icon={`${SUCCESS_CIRCLE_ICON}#success-circle`}
                          width={20}
                          height={20}
                          viewBox="0 0 22 22"
                          color="var(--success)"
                        />
                      </div>
                    )}
                    <div className="input-icon arrow-icon pointer-events-none">
                      <Icon
                        icon={`${ARROW_RIGHT_ICON}#arrow-right`}
                        width={25}
                        height={25}
                        unit="px"
                        color={"var(--primary-text)"}
                        viewBox="0 0 22 23"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone Number Container - Desktop (click opens update phone popup) */}
            <div className="form-desktop cursor-pointer" onClick={handlePhoneEditDesktop}>
              <div className="form-group-edit-profile">
                <label className="label-text">{lang.phoneNumber}</label>
                <div className="flex items-center justify-between">
                  <div className="relative flex-1 edit-profile-phone-number-input pointer-events-none">
                    <PhoneNumberInput
                      phoneNumber={`${dialCode}${phoneNumber}`}
                      dialCode={dialCode}
                      phoneIsoCode={phoneIsoCode.toLowerCase()}
                      setPhoneNumber={setPhoneNumber}
                      setDialCode={setDialCode}
                      setPhoneIsoCode={setPhoneIsoCode}
                      setIsPhoneNumberValid={setIsPhoneNumberValid}
                      onPhoneChange={(phone, dial, iso, isValid) => {
                        handlePhoneChange(phone, dial, iso);
                        handlePhoneValidation(phone, dial, iso, isValid);
                      }}
                      onCountryChange={handleCountryChange}
                      onBlur={() => {}}
                    />
                    {phoneNumber.length > 0 && (
                      <div className="input-icon success-icon-phone pointer-events-none">
                        <Icon
                          icon={`${SUCCESS_CIRCLE_ICON}#success-circle`}
                          width={20}
                          height={20}
                          viewBox="0 0 22 22"
                          color="var(--success)"
                        />
                      </div>
                    )}
                    <div className="input-icon arrow-icon pointer-events-none">
                      <Icon
                        icon={`${ARROW_RIGHT_ICON}#arrow-right`}
                        width={25}
                        height={25}
                        unit="px"
                        color={"var(--primary-text)"}
                        viewBox="0 0 22 23"
                      />
                    </div>
                  </div>
                </div>
            </div>
          </div>
          </div>
          {hasProfileChanges() && (
          <div className="button-container">
            {/* Commented out logout functionality for now */}
            {/* {isQrFlow && !handleValidation() ? (
              <div className="edit-profile-logout-row" onClick={confirmLogoutDialog} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); confirmLogoutDialog(); } }}>
                <Icon
                  icon={`${QR_LOGOUT_ICON}#qr-logout`}
                  width={20}
                  height={20}
                  color="var(--error)"
                  viewBox="0 0 20 20"
                  className="edit-profile-logout-icon"
                />
                <span className="edit-profile-logout-text">{lang.logout}</span>
              </div>
            ) : ( */}
              <CustomButton
                className="get-otp"
                disabled={!handleValidation()}
                onClick={handleUpdateProfile}
              >
                {lang.updateProfile}
              </CustomButton>
          </div>
          )}
          <button
            type="button"
            className="edit-profile-logout-row"
            onClick={() => {
              open_dialog("deleteAccountPopup", {
                open: true,
                propsData: {},
                type: "deleteAccountPopup",
                handlerDialog: () => {},
                handleClose: () => {
                  close_dialog(["deleteAccountPopup"]);
                },
                anchor: "bottom",
                onlyDialog: true,
                sxStyle: {
                  "& .MuiPaper-root": {
                    maxWidth: "500px",
                    width: "100%",
                  },
                },
              });
            }}
          >
            <span className="edit-profile-logout-text">{lang.deleteAccount}</span>
          </button>
        </div>
        </div>
        <style>{`
            .dialog-container-edit-profile-content {
                width: 100%;
                background-color: var(--tertiary-background);
            }
            .dialog-container-edit-profile{
                height: 100%;
                padding: 0px 10px;
            }

            .dialog-header-edit-profile {
                display: flex;
                justify-content: flex-end;
                align-items: center;
            }
            .dialog-header-edit-profile-qr-sticky {
                position: sticky;
                top: 0;
                z-index: 10;
                background-color: var(--primary-background);
                padding: 20px 16px;
            }

            .dialog-title {
                font-size: var(--heading-h2);
                font-weight: var(--font-bold);
                font-family: var(--font-family);
                color: var(--primary-text);
            }

            .close-icon {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
            }

            .form-group-edit-profile {
                display: flex;
                flex-direction: column;
                margin-bottom: 12px;
                color: var(--primary-text);
            }

            .name-container-edit-profile {
                display: flex;
                gap: 10px;
            }

            .form-group-edit-profile input {
                width: 100%;
                padding: 10px;
                border-radius: 8px;
                background-color: var(--cards-containers);
                border: 1px solid var(--borders-dividers);
            }

            .form-group-edit-profile input:focus-visible {
                outline: none;
            }
            
            .label-text{
                font-size: var(--small-font);
                font-weight: var(--font-regular);
                color: var(--secondary-text);
            }

            .get-otp {
                width: 100%;
                font-weight: var(--font-bold);
                padding: 12px;
                border-radius: 8px;
                cursor: pointer;
                margin-top: 5px;
            }

            .google-login {
                width: 100%;
                padding: 12px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                cursor: pointer;
                margin-top: 10px;
                font-weight: var(--font-bold);
                font-size: var(--description-font);
            }

            .google-icon {
                width: 20px;
                height: 20px;
            }

            .signup-modal-container{
                border-radius: 10px;
            }

            .signup-modal-container .react-responsive-modal-closeButton {
                top: 22px;
            }
            .cross-icon{
                display: block;
            }
            .header-container-edit-profile{
                display:block;
            }

            .profile-header-edit-profile{
                background-color: var(--tertiary-background);
                padding:0 0 20px 0;
                display: flex;
                align-items: center;
            }

            .edit-profile-details-text{
                font-size: var(--heading-h2);
                font-weight: var(--font-bold);
                color: var(--primary-text);
            }

            .input-with-icons {
                padding-right: 72px;
            }

            .input-icon {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                display: flex;
                align-items: center;
            }

            .success-icon-phone {
                right: 7%;
            }

            .success-icon-email {
                right: 7%;
            }

            .arrow-icon {
                right: 12px;
            }

            .edit-profile-phone-number-input .react-tel-input {
                width: 100%;
            }

            .edit-profile-phone-number-input .react-tel-input .form-control {
                padding-right: 72px !important;
            }

            .disabled-input {
                background-color: var(--borders-dividers);
                cursor: not-allowed;
            }

            .dialog-container-edit-profile-content-inner{
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }

            .edit-profile-logout-row {
                // padding-top: 50px;
                display: flex;
                align-items: center;
                gap: 10px;
                // padding: 16px 0;
                margin-top: 8px;
                cursor: pointer;
                background: none;
                border: none;
                width: 100%;
            }
            .edit-profile-logout-icon {
                flex-shrink: 0;
            }
            .edit-profile-logout-text {
                font-size: var(--description-font);
                font-weight: var(--font-regular);
                color: var(--error);
            }


            .change-button {
                color: var(--primary-color);
                font-size: var(--small-font);
                font-weight: var(--font-bold);
                background: none;
                border: none;
                cursor: pointer;
                padding: 5px 10px;
                border-radius: 4px;
            }

            .form-desktop{
                display: block;
            }
            .form-mobile{
                display: none;
            }
            .update-email-dialog,
            .update-phone-dialog{
                height: 100%;
                min-width: 450px;
            }  
            .intl-tel-input .country-list{
                height: 23vh !important;
                position: fixed !important;
                bottom: 10% !important;
                width:auto !important;
            }

            @media (max-width: 768px) {
                .signup-modal-container{
                    margin:0px;
                    border-radius: 0px;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    width: 100%;
                    max-height: 80%;
                    overflow-y: auto;
                }
                .name-container-edit-profile {
                    display: block;
                }
                .dialog-container-edit-profile-content {
                    padding: 0px 0px 50px 0px;
                    height: 100%;
                    background-color: var(--tertiary-background);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                .cross-icon{
                    display: none;
                }
                .button-container{
                    position: fixed;
                    bottom: ${isQrFlow ? '80px' : '0'};
                    left: 0;
                    right: 0;
                    width: 100%;
                    padding: 25px 20px;
                    background-color: var(--tertiary-background);
                }
                .header-container-edit-profile{
                    display:block;
                    margin-bottom: 15px;
                    margin-top: 42px;
                }

                .dialog-header-edit-profile{
                    justify-content: space-between;
                    padding: 20px 16px;
                }
                .dialog-container-edit-profile{
                    height: calc(100vh - 100px);
                  background-color: var(--tertiary-background);
                  padding: 25px 16px;
                }
                // .form-group-edit-profile{
                //     padding: 0px 20px;
                // }
                .edit-profile-details-text{
                    font-size: var(--heading-h4);
                    font-weight: var(--font-bold);
                    color: var(--primary-text);
                }
                .form-desktop{
                    display: none;
                }
                .form-mobile{
                    display: block;
                }
                .profile-header-edit-profile{
                    padding: 15px 0px;
                }
                .cross-icon-edit-profile{
                    margin-top: 5px;
                    margin-left: 5px;
                }
                .iti-mobile .intl-tel-input.iti-container .country-list{
                    width: 90% !important;
                    bottom: 0px !important;
                    left: 5% !important;
                }
                .intl-tel-input .country-list{
                    height: 35vh !important;
                    position: fixed !important;
                    bottom: 0px !important;
                }
                .success-icon-phone{
                  right: 13%;
                }              
                .success-icon-email{
                  right: 13%;
                }         
            }
        `}</style>
      </>
    );
}

export default UpdateProfileModal;
