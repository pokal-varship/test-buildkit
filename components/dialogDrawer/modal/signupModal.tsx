import CustomButton from '@components/buttons/Button';
import SecondaryButton from '@components/buttons/secondaryButton';
import { validateEmail } from '@components/validation';
// import { GOOGLE_LOGO } from '@config/Header/image.config';
import React, { useState, FC, useEffect } from 'react';
import useLang from '@hooks/useLang';
import { signup } from '@services/authService';
import { close_dialog, open_dialog } from '@lib/modalHandler';
import { LanguageCode, TranslationKeys } from 'types';
import { CROSS_ICON, MAIL_ICON } from '@config/Header/image.config';
import Icon from '@components/image/Icons';
import PhoneCallIcon from '@components/icons/PhoneCallIcon';
import Loader from '@components/loader/Loader';
import PhoneNumberInput from '@components/phonenumber/PhoneNumberInput';
import { CustomError } from '@components/header/types';
import { useToast } from '@components/toast/Toast';
import { usePhoneValidation } from '@hooks/usePhoneValidation';
import EmailInput from '@components/input/EmailInput';
import { getAuthConfig } from '@config/auth.config';
// import { signIn } from 'next-auth/react';

interface SignupModalProps {
    handlerDialog: () => void;
    onClose: () => void;
    email: string;
    onSuccess?: () => void;
    phoneNumber?: string;
    countryCode?: string;
    phoneIsoCode?: string;
}

interface GuestAuthResponse {
    status: number;
    message?: string;
    data?: {
        expires_in: number;
    };
}

const SignupModal: FC<SignupModalProps> = ({ email, onClose, onSuccess, phoneNumber: initialPhoneNumber, countryCode: initialCountryCode, phoneIsoCode: initialPhoneIsoCode }) => {
    const authConfig = getAuthConfig();
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [userEmail, setUserEmail] = useState<string>(email);
    const [lang]: [TranslationKeys, LanguageCode] = useLang();
    const [loading, setLoading] = useState<boolean>(false);
    const [phoneNumber, setPhoneNumber] = useState<string>(initialPhoneNumber ?? '');
    const [dialCode, setDialCode] = useState(initialCountryCode ?? '');
    const [phoneIsoCode, setPhoneIsoCode] = useState(initialPhoneIsoCode ?? '');
    const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);
    const [isPhoneApiValidated, setIsPhoneApiValidated] = useState(false);
    const toast = useToast();

    // When opened from phone flow (unregistered phone), treat pre-filled phone as already validated
    useEffect(() => {
        if (initialPhoneNumber && initialCountryCode) {
            setIsPhoneNumberValid(true);
            setIsPhoneApiValidated(true);
        }
    }, [initialPhoneNumber, initialCountryCode]);

    // Phone validation hook
    const { validatePhoneNumber } = usePhoneValidation({
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

    const handleGetOTP = async () => {
        // Don't proceed if email is invalid
        if (!isEmailValid) {
            return;
        }

        const cameFromPhoneFlow = Boolean(initialPhoneNumber || initialCountryCode);
        const localPhone = phoneNumber.replace(dialCode, '').replace(/\+/g, '');
        const hasPhone = Boolean(localPhone && dialCode);
        // OTP type: PHONE only when user came from phone flow and provided phone; else EMAIL (signup OTP sent to email)
        const otpType = cameFromPhoneFlow && hasPhone ? 'PHONE' as const : 'EMAIL' as const;

        const payload = {
            firstName: firstName,
            lastName: lastName,
            email: userEmail,
            countryCode: `+${dialCode}`,
            phoneNumber: localPhone,
            phoneIsoCode: phoneIsoCode.toUpperCase(),
            otpType,
        }
        try {
            setLoading(true);
            const res: GuestAuthResponse = await signup(payload);
            if (res.message === "Success") {
                open_dialog("verifyOtp", {
                    open: true,
                    propsData: {
                        setEmail: setUserEmail,
                        email: userEmail,
                        expiresIn: res?.data?.expires_in,
                        onSuccess: onSuccess,
                        phoneNumber: localPhone,
                        phoneIsoCode: phoneIsoCode.toUpperCase(),
                        countryCode: `+${dialCode}`,
                        otpType,
                    },
                    type: "verifyOtp",
                    handlerDialog: () => { },
                    handleClose: () => { },
                    anchor: 'bottom',
                    onlyDialog: false,
                    sxStyle: {
                        '& .MuiDialogContent-root': {
                            backgroundColor: 'var(--tertiary-background)',
                        },
                    },
                });
            }
            close_dialog(['signup']);
            setLoading(false);
        } catch (err: unknown) {

            const customErr = err as CustomError;
            toast('error', customErr?.response?.data?.message || lang.somethingWentWrong);
            setLoading(false);
        }
    };

    const isEmailValid = validateEmail(userEmail);

    const handleValidation = (): boolean => {
        const basicValidation = isEmailValid && firstName !== '' && lastName !== '';
        const cameFromPhoneFlow = Boolean(initialPhoneNumber || initialCountryCode);

        // If phone number is provided, it must be valid
        if (phoneNumber && phoneNumber !== `+${dialCode}`) {
            // Came from phone flow (pre-filled): no API validation needed
            if (cameFromPhoneFlow) {
                return basicValidation && isPhoneNumberValid;
            }
            // Came from email flow: require both format and API validation
            return basicValidation && isPhoneNumberValid && isPhoneApiValidated;
        }

        return basicValidation;
    }

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
        // Only trigger API validation if library validation passes
        if (isValid && phoneNumber && phoneNumber !== `+${dialCode}`) {
            validatePhoneNumber(phoneNumber, dialCode, phoneIsoCode, userEmail, isValid);
        }
    }

    const cameWithPhone = Boolean(initialPhoneNumber || initialCountryCode);

    return (
        <>
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
                    <Loader />
                </div>
            )}
            <div className="dialog-container-signup">
                <div className="dialog-header-signup">
                    <h2 className="dialog-title">{lang.createAccount}</h2>
                    <Icon
                        icon={`${CROSS_ICON}#cross`}
                        width={16}
                        height={16}
                        color={"var(--primary-text)"}
                        className="cursor-pointer"
                        viewBox='0 0 16 16'
                        onClick={onClose}
                    />
                </div>

                <EmailInput
                    value={userEmail}
                    onChange={setUserEmail}
                    label={lang.emailAddress}
                    required={true}
                />

                <div className="name-container">
                    <div className="form-group">
                        <label className='label-text'>{`${lang.firstName}*`}</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value.replace(/^\s+/, ''))}
                            placeholder={lang.firstNamePlaceholderText}
                        />
                    </div>

                    <div className="form-group">
                        <label className='label-text'>{`${lang.lastName}*`}</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value.replace(/^\s+/, ''))}
                            placeholder={lang.lastNamePlaceholderText}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && handleValidation()) {
                                    handleGetOTP();
                                }
                            }}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label className='label-text'>{lang.phoneNumber}</label>
                    <PhoneNumberInput
                        setPhoneNumber={setPhoneNumber}
                        setDialCode={setDialCode}
                        phoneNumber={phoneNumber}
                        dialCode={dialCode}
                        defaultCountry={(initialPhoneIsoCode || 'us').toLowerCase()}
                        preferredCountries={['us']}
                        setPhoneIsoCode={setPhoneIsoCode}
                        setIsPhoneNumberValid={setIsPhoneNumberValid}
                        isPhoneNumberValid={isPhoneNumberValid}
                        onPhoneChange={(phone, dial, iso, isValid) => {
                            handlePhoneChange(phone, dial, iso);
                            // Trigger validation after phone change with current validation state
                            handlePhoneValidation(phone, dial, iso, isValid);
                        }}
                        onCountryChange={handleCountryChange}
                        onBlur={() => {
                            // Validate on blur if valid
                            if (isPhoneNumberValid && phoneNumber && phoneNumber !== `+${dialCode}`) {
                                handlePhoneValidation(phoneNumber, dialCode, phoneIsoCode, isPhoneNumberValid);
                            }
                        }}
                     />
                </div>

                <CustomButton className="get-otp" onClick={handleGetOTP} disabled={!handleValidation()}>{lang.getOTP}</CustomButton>

                {/* <SecondaryButton className="google-login"
                    onClick={() => signIn("google", { callbackUrl: "/" })}
                >
                    <img fetchPriority="high"  title="Google Icon" src={GOOGLE_LOGO} alt="Google" className="google-icon" />
                    {lang.loginWithGoogle}
                </SecondaryButton> */}
                {!authConfig.phoneOnlyLogin && (
                    <>
                        <div className="or-separator">
                            <div className="or-separator-line" />
                            <span className="or-separator-text">{lang.or}</span>
                            <div className="or-separator-line" />
                        </div>

                        <div className="login-options">
                            <SecondaryButton
                                className="phone-email-login"
                                onClick={() => {
                                    close_dialog(['signup']);
                                    open_dialog('login', {
                                        open: true,
                                        propsData: {
                                            onSuccess,
                                            initialLoginType: cameWithPhone ? 'EMAIL' : 'PHONE',
                                        },
                                        type: 'login',
                                        handlerDialog: () => {},
                                        handleClose: () => {},
                                        anchor: 'bottom',
                                        onlyDialog: false,
                                        sxStyle: {
                                            '& .MuiDialogContent-root': {
                                                backgroundColor: 'var(--tertiary-background)',
                                            },
                                        },
                                    });
                                }}
                            >
                                {cameWithPhone ? (
                                    <Icon
                                        icon={`${MAIL_ICON}#mail`}
                                        width={24}
                                        height={24}
                                        color="var(--primary-text)"
                                        className="phone-email-icon"
                                        viewBox="0 -2 26 28"
                                    />
                                ) : (
                                    <PhoneCallIcon
                                        width={24}
                                        height={24}
                                        className="phone-email-icon"
                                        style={{ color: 'var(--primary-text)' }}
                                    />
                                )}
                                {cameWithPhone ? lang.loginWithEmail : lang.loginWithPhone}
                            </SecondaryButton>
                        </div>
                    </>
                )}
            </div>
            <style>{`
                .dialog-container-signup {
                    width: 100%;
                    padding: 10px 10px;
                    background-color: var(--tertiary-background);
                } 

                .dialog-header-signup {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
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

                .form-group {
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 12px;
                    color: var(--primary-text);
                }

                .name-container {
                    display: flex;
                    gap: 10px;
                }


                .get-otp {
                    width: 100%;
                    font-weight: var(--font-bold);
                    padding: 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-top: 5px;
                }

                .or-separator {
                    display: flex;
                    align-items: center;
                    margin: 10px 0;
                    width: 100%;
                }

                .or-separator-line {
                    flex: 1;
                    height: 1px;
                    background-color: var(--secondary-text);
                    opacity: 0.3;
                }

                .or-separator-text {
                    padding: 0 12px;
                    font-size: var(--small-font);
                    font-weight: var(--font-regular);
                    color: var(--secondary-text);
                }

                .login-options {
                    margin-top: 10px;
                }

                .phone-email-login {
                    width: 100%;
                    padding: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    font-weight: var(--font-bold);
                }

                .phone-email-icon {
                    width: 24px;
                    height: 24px;
                    flex-shrink: 0;
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
                    display:none;
                }
                .label-text{
                    font-size:var(--small-font);
                    color: var(--secondary-text);
                }
                
                .intl-tel-input .country-list{
                    height: 30vh !important;
                    position: fixed !important;
                    bottom: 10px !important;
                    left: 33.5% !important;
                    width:auto !important;
                }

                @media (max-width: 768px) {
                    .signup-modal-container{
                        margin:0px;
                        border-radius: 10px 10px 0 0;
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        width: 100%;
                        max-height: 80%;
                        overflow-y: auto;
                    }
                    .name-container {
                        display: block;
                    }
                    .dialog-container-signup {
                        padding: 30px 16px;
                        min-width: 300px;
                        border-radius: 10px 10px 0 0 !important;
                        overflow: hidden;
                    }
                    .cross-icon{
                        display:block;
                    }
                    .form-group {
                        overflow: visible !important;
                    }
                    .phone-input-wrapper {
                        overflow: visible !important;
                    }
                    /* Ensure MUI containers don't clip dropdown */
                    .MuiDialog-root,
                    .MuiDialog-container,
                    .MuiDialog-paper,
                    .MuiDrawer-root,
                    .MuiDrawer-paper {
                        overflow: visible !important;
                    }
                    .MuiDialogContent-root {
                        overflow: visible !important;
                    }
                    .iti-mobile .intl-tel-input.iti-container,
                    .iti-mobile .intl-tel-input.iti-container .country-list,
                    .intl-tel-input .country-list,
                    .react-tel-input .country-list {
                        max-width: 300px !important;
                        left: 10px !important;
                        right: 10px !important;
                        margin: 0 auto !important;
                        position: fixed !important;
                        bottom: 20px !important;
                        top: auto !important;
                        z-index: 99999 !important;
                        height: 22vh !important;
                    }
                }
            `}</style>
        </>
    );
};

export default SignupModal;
