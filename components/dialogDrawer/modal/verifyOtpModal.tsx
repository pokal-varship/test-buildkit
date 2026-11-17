import CustomButton from '@components/buttons/Button';
import useLang from '@hooks/useLang';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { close_dialog, open_dialog } from '@lib/modalHandler';
import { getCookie } from '@lib/cookie';
import { useDispatch, useSelector } from 'react-redux';
import { signIn } from 'next-auth/react';
import { selectIsQrFlowActive, selectSessionId } from '@redux/slices/qrFlowSlice';
import { setUserProfile } from '@redux/slices/userProfileSlice';
import { LanguageCode, TranslationKeys } from 'types';
import Loader from '@components/loader/Loader';
import { useToast } from '@components/toast/Toast';
import Icon from '@components/image/Icons';
import { CROSS_ICON } from '@config/Header/image.config';
import { getLocationHeader } from '@lib/utils/location';
import { loginWithOtp } from '@services/authService';
import { getDefaultLoginType } from '@config/auth.config';
import {
    AuthResponseData,
    buildLoginPhonePayload,
    createUserProfile,
    handleOtpVerification,
    processAuthTokens,
    toReduxUserProfile,
    toSignInCredentials,
} from '@lib/auth/otpAuth';

const getErrorMessage = (error: unknown): string =>
    error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Something went wrong'
        : 'Something went wrong';

/** Format phone for display with space after dial code e.g. "+91 8989898988" */
const formatPhoneWithSpace = (fullPhone: string | undefined, dialCode: string | undefined): string => {
    if (!fullPhone) return '';
    if (!dialCode) return fullPhone;
    const dial = dialCode.startsWith('+') ? dialCode : `+${dialCode}`;
    const digitsOnly = fullPhone.replace(/\D/g, '');
    const dialDigits = dial.replace(/\D/g, '');
    const national = digitsOnly.startsWith(dialDigits) ? digitsOnly.slice(dialDigits.length) : digitsOnly;
    return national ? `${dial} ${national}` : fullPhone;
};

interface VerifyOtpModalProps {
    handlerDialog: () => void;
    onClose: () => void;
    email: string;
    numDigits?: number;
    expiresIn?: number;
    handleEmailUpdateOtp?: (userEmail: string, otp: string) => void;
    handlePhoneUpdateOtp?: (phone: string, countryCode: string, phoneIsoCode: string, otp: string) => void;
    verifyOtpStatus?: boolean;
    onSuccess?: () => void;
    isEmailUpdate?: boolean;
    isPhoneUpdate?: boolean;
    phoneNumber?: string;
    countryCode?: string;
    phoneIsoCode?: string;
    otpType?: "EMAIL" | "PHONE";
}

interface GuestAuthResponse {
    status: number;
    message?: string;
    data?: AuthResponseData & { expires_in?: number };
}

const VerifyOtpModal: React.FC<VerifyOtpModalProps> = ({ handlerDialog, onClose, email, numDigits = 6, expiresIn, handleEmailUpdateOtp, handlePhoneUpdateOtp, verifyOtpStatus, onSuccess, isEmailUpdate, isPhoneUpdate, phoneNumber, countryCode, phoneIsoCode, otpType = "EMAIL" }) => {
    const [otp, setOtp] = useState<string[]>(Array(numDigits).fill(''));
    const [lang]: [TranslationKeys, LanguageCode] = useLang();
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const submittedRef = useRef(false);
    const prevOtpCompleteRef = useRef(false);
    const [timeLeft, setTimeLeft] = useState<number>(expiresIn ?? 60);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState<boolean>(false);
    const [updateLoading, setUpdateLoading] = useState<boolean>(false);
    const toast = useToast();
    const isQrFlowActive = useSelector(selectIsQrFlowActive);
    const sessionId = useSelector(selectSessionId);
    const qrFlowSessionId = isQrFlowActive && sessionId ? sessionId : null;

    const handlerDialogRef = useRef(handlerDialog);
    const onCloseRef = useRef(onClose);
    const onSuccessRef = useRef(onSuccess);
    useEffect(() => {
        handlerDialogRef.current = handlerDialog;
        onCloseRef.current = onClose;
        onSuccessRef.current = onSuccess;
    }, [handlerDialog, onClose, onSuccess]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prevTime) => Math.max(0, prevTime - 1));
        }, 1000);

        // Cleanup interval when the component is unmounted or expiresIn changes
        return () => clearInterval(interval);
    }, [expiresIn]);

    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        if (/^\d$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Move to the next input if it's not the last one
            if (index < otp.length - 1) {
                inputsRef.current[index + 1]?.focus();
            }
        } else if (value.length > 1) {
            // Handle pasting a full OTP (e.g., "123456")
            const pastedOtp = value.slice(0, numDigits).split('');
            setOtp(pastedOtp);

            // Auto-focus last filled input
            const lastFilledIndex = pastedOtp.findIndex((val) => val === '');
            inputsRef.current[lastFilledIndex !== -1 ? lastFilledIndex : numDigits - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedValue = e.clipboardData.getData("text").replace(/\D/g, ""); // Remove non-digits
        const validOtp = pastedValue.slice(0, numDigits).split(''); // Take only up to `numDigits`

        if (validOtp.length > 0) {
            // Fill only the pasted numbers and leave remaining fields empty
            const newOtp = Array(numDigits).fill('');
            validOtp.forEach((digit, i) => {
                newOtp[i] = digit;
            });

            setOtp(newOtp);

            // Move focus to the last filled input
            const lastFilledIndex = validOtp.length - 1;
            inputsRef.current[Math.min(lastFilledIndex, numDigits - 1)]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Backspace') return;
        e.preventDefault();
        const newOtp = [...otp];
        if (otp[index]) {
            newOtp[index] = '';
        } else if (index > 0) {
            newOtp[index - 1] = '';
            inputsRef.current[index - 1]?.focus();
        }
        setOtp(newOtp);
    };

    const handleVerify = useCallback(async () => {
        // Sync lock: blocks button + auto-submit overlaps before any await
        if (submittedRef.current) return;
        submittedRef.current = true;

        const otpString = otp.join('');
        const isEmailUpdate = Boolean(verifyOtpStatus && handleEmailUpdateOtp);
        const isPhoneUpdate = Boolean(
            verifyOtpStatus && handlePhoneUpdateOtp && phoneNumber != null && countryCode != null && phoneIsoCode != null,
        );
        const isProfileUpdate = isEmailUpdate || isPhoneUpdate;

        // Disable UI immediately so concurrent clicks cannot start another verify
        if (isProfileUpdate) {
            setUpdateLoading(true);
        } else {
            setLoading(true);
        }

        try {
            if (isEmailUpdate && handleEmailUpdateOtp) {
                try {
                    await handleEmailUpdateOtp(email, otpString);
                } catch {
                    submittedRef.current = false;
                    toast('error', lang.incorrectOtp);
                }
                return;
            }

            if (isPhoneUpdate && handlePhoneUpdateOtp && phoneNumber != null && countryCode != null && phoneIsoCode != null) {
                try {
                    await handlePhoneUpdateOtp(phoneNumber, countryCode, phoneIsoCode, otpString);
                } catch {
                    submittedRef.current = false;
                    toast('error', lang.incorrectOtp);
                }
                return;
            }

            // Login: verify OTP on BE, then create session once (same as Google flow)
            const locationHeader = await getLocationHeader(otpType === 'PHONE' ? 'login-phone-otp' : 'login-email-otp');
            const guestToken = getCookie('token') || '';
            const phonePayload = buildLoginPhonePayload(phoneNumber, countryCode, phoneIsoCode);

            const authData = await handleOtpVerification({
                otpType,
                otp: otpString,
                guestToken,
                email,
                phone: phonePayload?.phone,
                countryCode: phonePayload?.countryCode ?? countryCode,
                phoneIsoCode: phonePayload?.phoneIsoCode ?? phoneIsoCode,
                locationHeader,
                sessionId: qrFlowSessionId ?? undefined,
            });

            const tokens = processAuthTokens(authData, { persistCookies: true });
            if (!authData || !tokens) {
                submittedRef.current = false;
                toast('error', lang.incorrectOtp);
                return;
            }

            const user = createUserProfile(authData, tokens, {
                email,
                phone: phonePayload?.phone,
                countryCode: phonePayload?.countryCode || countryCode,
                phoneIsoCode: phonePayload?.phoneIsoCode || phoneIsoCode,
            });

            dispatch(setUserProfile(toReduxUserProfile(user)));

            const result = await signIn('credentials', {
                redirect: false,
                ...toSignInCredentials(user, otpType, phonePayload),
            });

            if (result?.error) {
                submittedRef.current = false;
                toast('error', lang.incorrectOtp);
                return;
            }

            // Keep lock held on success so the modal cannot re-submit while closing
            handlerDialog();
            onClose();
            if (onSuccess) onSuccess();
        } catch {
            submittedRef.current = false;
            toast('error', lang.incorrectOtp);
        } finally {
            if (isProfileUpdate) {
                setTimeout(() => setUpdateLoading(false), 2000);
            } else {
                close_dialog(['login']);
                setLoading(false);
            }
        }
    }, [otp, email, phoneNumber, countryCode, phoneIsoCode, otpType, verifyOtpStatus, handleEmailUpdateOtp, handlePhoneUpdateOtp, handlerDialog, onClose, onSuccess, lang, dispatch, toast, qrFlowSessionId]);

    // Auto-submit only when OTP transitions from incomplete to complete (avoids re-firing after wrong OTP when loading flips to false)
    useEffect(() => {
        const isComplete = otp.length === numDigits && otp.every((digit) => digit !== '');
        const isNewlyComplete = isComplete && !prevOtpCompleteRef.current;
        prevOtpCompleteRef.current = isComplete;
        if (isNewlyComplete && !loading && !updateLoading && !submittedRef.current) {
            handleVerify();
        }
    }, [otp, numDigits, loading, updateLoading, handleVerify]);

    const handleValidateOtp = () => otp.every(digit => digit !== '');

    const handleResendOtp = async () => {
        if (timeLeft > 0) return;
        try {
            const res: GuestAuthResponse =
                otpType === 'PHONE' && phoneNumber && countryCode && phoneIsoCode
                    ? await loginWithOtp({ type: 'PHONE', fullPhone: phoneNumber, dialCode: countryCode, phoneIsoCode })
                    : await loginWithOtp({ type: 'EMAIL', email });
            if (res.message === 'Success') {
                setTimeLeft(res?.data?.expires_in ?? 60);
                toast('success', 'OTP resent successfully');
            }
        } catch (error) {
            toast('error', getErrorMessage(error));
        }
    };

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handlechangeLink = () => {
        close_dialog(['verifyOtp']);
        if (isPhoneUpdate) {
            open_dialog('updatePhone', {
                open: true,
                propsData: {},
                type: 'updatePhone',
                handlerDialog: () => {},
                handleClose: () => {},
                anchor: 'bottom',
                onlyDialog: true,
                className: 'update-phone-dialog',
            });
        } else if (isEmailUpdate) {
            open_dialog('updateProfile', {
                open: true,
                propsData: {},
                type: 'updateProfile',
                handlerDialog: () => {},
                handleClose: () => {},
                anchor: 'bottom',
            });
        } else {
            open_dialog('login', {
                open: true,
                propsData: {
                    initialLoginType: getDefaultLoginType(),
                },
                type: 'login',
                handlerDialog: () => {},
                handleClose: () => {},
                anchor: 'bottom',
                onlyDialog: false,
                sxStyle: {
                    '& .MuiDialogContent-root': {
                        padding: '20px 16px',
                        backgroundColor: 'var(--tertiary-background)',
                    },
                },
            });
        }
    };

    return (
        <>
            {updateLoading && (
                <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
                    <Loader />
                </div>
            )}
            <div className="modalContent">
                <div className='modal-content-container'>
                    <div className='modal-header-container'>
                        <h2 className='modal-title'>{lang.enterYourCode}</h2>
                        <Icon
                            icon={`${CROSS_ICON}#cross`}
                            width={16}
                            height={16}
                            color={"var(--primary-text)"}
                            className="cursor-pointer cross-icon"
                            viewBox='0 0 16 16'
                            onClick={onClose}
                        />
                    </div>
                    <p className='modal-description'>
                        {otpType === 'PHONE' || isPhoneUpdate ? lang.weveJustSentAnOtpToYourPhoneNumber : lang.weveJustSentAnOtpToYourEmailAddress}
                    </p>
                    <p>
                        <span className='modal-description'>
                            {otpType === "PHONE" ? formatPhoneWithSpace(phoneNumber, countryCode) : email}
                        </span>{' '}
                        <span className="changeLink" onClick={handlechangeLink}>{lang.change}</span>
                    </p>
                    <div className='modal-content-timer-container'>
                        <p className="timerText">{lang.codeExpiresIn} <strong className='pl-0'>{formatTime(timeLeft)}</strong></p>
                        <p 
                            className={`resend-text ${timeLeft > 0 ? 'resend-disabled' : 'cursor-pointer'}`} 
                            onClick={handleResendOtp}
                        >
                            {lang.resend}
                        </p>
                    </div>
                </div>
                <div className='otpContainer'>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            id={`otp-${index}`}
                            ref={(el) => { inputsRef.current[index] = el; }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            className="otpInput"
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            inputMode="numeric"
                            placeholder="0" 
                        />
                    ))}
                </div>

                {loading && (
                    <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
                        <Loader />
                    </div>
                )}

                <CustomButton onClick={handleVerify} className="verifyButton" disabled={!handleValidateOtp() || loading || updateLoading}>
                    {lang.verifyAndContinue}
                </CustomButton>
            </div>

            <style>{`
                .verify-otp-modal-container {
                    border-radius: 12px;
                    background: var(--cards-containers);
                    text-align: center;
                    position: relative;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    width: 100%;
                    max-width: 400px;
                }
                .modal-header-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-content-container {
                    text-align: left;
                }

                .modal-description {
                    font-size: var(--small-font);
                    font-weight: var(--font-regular);
                    font-family: var(--font-family);
                    color: var(--primary-text);
                }

                .modalContent {
                    width: 100% !important;
                    padding: 10px 15px;
                }

                .modal-title {
                    font-size: var(--heading-h2);
                    font-weight: var(--font-bold);
                    padding-bottom: 10px;
                    padding-top: 10px;
                    color: var(--primary-text);
                }

                .cross-icon {
                    display: none;
                }

                .otpContainer {
                    display: flex;
                    gap: 10px;
                    justify-content: space-between;
                    margin: 20px 0;
                }

                .otpInput {
                    width: 100%;
                    height: 50px;
                    border: 2px solid #d3d3d3;
                    border-radius: 8px;
                    text-align: center;
                    font-size: 20px;
                    font-weight: var(--font-regular);
                    background-color: var(--cards-containers);
                    color: var(--primary-text);
                }

                .otpInput:focus {
                    border-color: var(--primary-color);
                    outline: none;
                }

                .verifyButton {
                    width: 100%;
                    padding: 12px 0;
                    border: none;
                    cursor: pointer;
                    margin-top: 10px;
                    font-weight: var(--font-bold);
                }

                .timerText {
                    color: var(--primary-text);
                    font-size: var(--small-font);
                }

                .resend-text {
                    color: var(--primary-text);
                    font-size: var(--small-font);
                    transition: color 0.2s ease, text-decoration 0.2s ease;
                }

                .resend-text:not(.resend-disabled):hover {
                    color: var(--primary-color);
                    text-decoration: underline;
                    font-weight: var(--font-bold);
                }

                .resend-disabled {
                    color: var(--secondary-text, #999);
                    cursor: not-allowed !important;
                    opacity: 0.6;
                }

                .changeLink {
                    color: var(--primary-color);
                    cursor: pointer;
                    font-size: var(--small-font);
                    font-weight: var(--font-bold);
                }

                .verify-otp-modal-container .react-responsive-modal-closeButton {
                    top: 30px;
                }

                .modal-content-timer-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 10px;
                }

                @media (max-width: 768px) {
                    .verify-otp-modal-container {
                        margin: 0px;
                        border-radius: 10px 10px 0 0;
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        width: 100%;
                        max-height: 80%;
                        overflow-y: auto;
                    }

                    .modalContent {
                        padding: 30px 16px !important;
                        border-radius: 10px 10px 0 0 !important;
                        overflow: hidden;
                    }

                    .cross-icon {
                        display: block;
                    }

                    .otpInput {
                        height: 40px;
                    }
                }
            `}</style>
        </>
    );
};

export default VerifyOtpModal;
