'use client'

import CustomButton from "@components/buttons/Button";
import { ExtendedSession } from "@components/header/types";
import PhoneNumberInput from "@components/phonenumber/PhoneNumberInput";
import { useToast } from "@components/toast/Toast";
import useLang from "@hooks/useLang";
import { usePhoneValidation } from "@hooks/usePhoneValidation";
import { close_dialog, open_dialog } from "@lib/modalHandler";
import { updatePhone, updatePhoneOtp } from "@services/profileService";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageCode, TranslationKeys } from "types";
import UpdateProfileFormLayout, { CustomError } from "./UpdateProfileFormLayout";

interface UpdatePhoneProps {
    onClose?: () => void;
}

const UpdatePhone: React.FC<UpdatePhoneProps> = ({ onClose }) => {
    const [lang]: [TranslationKeys, LanguageCode] = useLang();
    const { data: session, update } = useSession() as {
        data: ExtendedSession | null;
        update: (session: ExtendedSession) => void;
    };
    const [phoneNumber, setPhoneNumber] = useState(session?.user?.phoneNumber || "");
    const [dialCode, setDialCode] = useState(session?.user?.countryCode || "");
    const [phoneIsoCode, setPhoneIsoCode] = useState(session?.user?.phoneIsoCode || "");
    const [userEmail, setUserEmail] = useState(session?.user?.email || "");
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);
    const [isPhoneApiValidated, setIsPhoneApiValidated] = useState(false);

    const { validatePhoneNumber: validatePhoneAPI } = usePhoneValidation({
        onSuccess: (message) => {
            toast("success", message);
            setIsPhoneApiValidated(true);
        },
        onError: (message) => {
            toast("error", message);
            setIsPhoneApiValidated(false);
        },
        debounceDelay: 300,
    });

    const handleValidation = (): boolean => {
        const currentPhoneNumber = session?.user?.phoneNumber || "";
        const currentCountryCode = session?.user?.countryCode || "";
        const currentFullPhone = `${currentCountryCode}${currentPhoneNumber}`;
        const newFullPhone = `${dialCode}${phoneNumber}`;
        const phoneChanged = newFullPhone !== currentFullPhone;
        return phoneChanged && isPhoneNumberValid && isPhoneApiValidated;
    };

    const handlePhoneChange = (phone: string, dial: string, iso: string) => {
        setPhoneNumber(phone);
        setDialCode(dial);
        setPhoneIsoCode(iso);
        setIsPhoneApiValidated(false);
    };

    const handleCountryChange = () => {
        setIsPhoneNumberValid(false);
        setIsPhoneApiValidated(false);
    };

    const handlePhoneValidation = (phone: string, dial: string, iso: string, isValid: boolean) => {
        const currentPhoneNumber = session?.user?.phoneNumber || "";
        const currentCountryCode = session?.user?.countryCode || "";
        const currentFullPhone = `${currentCountryCode}${currentPhoneNumber}`;
        const newFullPhone = `${dial}${phone}`;
        const phoneChanged = newFullPhone !== currentFullPhone;
        if (isValid && phoneChanged && phone && phone !== `+${dial}`) {
            validatePhoneAPI(phone, dial, iso, userEmail, isValid);
        }
    };

    const getStrippedPhonePayload = () => {
        const normalizedDialCode = dialCode.replace(/\D/g, "");
        const countryCodeWithPlus = normalizedDialCode ? `+${normalizedDialCode}` : "";
        const strippedPhoneNumber = phoneNumber
            .replace(countryCodeWithPlus, "")
            .replace(/^\+/, "")
            .replace(/\D/g, "");
        return { strippedPhoneNumber, countryCodeWithPlus };
    };

    const handlePhoneUpdateOtp = async (
        phone: string,
        countryCode: string,
        phoneIsoCode: string,
        otp: string
    ) => {
        try {
            setLoading(true);
            const payload = { phone, countryCode, phoneIsoCode: phoneIsoCode.toUpperCase(), otp };
            const response = await updatePhoneOtp(payload);
            if (response.message === "Success" && session?.user) {
                await update({
                    ...session,
                    user: {
                        ...session.user,
                        phoneNumber: phone,
                        countryCode,
                        phoneIsoCode: phoneIsoCode.toUpperCase(),
                    },
                });
                router.refresh();
                close_dialog(["verifyOtp"]);
                close_dialog(["updatePhone"]);
                close_dialog(["updateProfile"]);
                open_dialog("emailSuccess", {
                    open: true,
                    propsData: { title: lang.phoneNumberUpdatedSuccessfully },
                    type: "emailSuccess",
                    handlerDialog: () => {},
                    handleClose: () => {},
                    anchor: "bottom",
                    onlyDialog: true,
                });
            }
            setLoading(false);
        } catch {
            setLoading(false);
            toast("error", lang.incorrectOtp);
        }
    };

    const handleGetOtp = async () => {
        if (!handleValidation()) return;
        try {
            setLoading(true);
            const { strippedPhoneNumber, countryCodeWithPlus } = getStrippedPhonePayload();
            const payload = {
                phone: strippedPhoneNumber,
                phoneIsoCode: phoneIsoCode.toUpperCase(),
                countryCode: countryCodeWithPlus,
            };
            const res = await updatePhone(payload);
            if (res.message === "Success") {
                open_dialog("verifyOtp", {
                    open: true,
                    propsData: {
                        phoneNumber: strippedPhoneNumber,
                        countryCode: countryCodeWithPlus,
                        phoneIsoCode: phoneIsoCode.toUpperCase(),
                        expiresIn: (res as { data?: { expires_in?: number } })?.data?.expires_in,
                        handlePhoneUpdateOtp: (
                            phone: string,
                            countryCode: string,
                            phoneIsoCode: string,
                            otp: string
                        ) => handlePhoneUpdateOtp(phone, countryCode, phoneIsoCode, otp),
                        verifyOtpStatus: true,
                        isPhoneUpdate: true,
                        otpType: "PHONE" as const,
                    },
                    type: "verifyOtp",
                    handlerDialog: () => {},
                    handleClose: () => {},
                    anchor: "bottom",
                    onlyDialog: false,
                });
                close_dialog(["updatePhone"]);
            }
            setLoading(false);
        } catch (error: unknown) {
            const err = error as CustomError;
            if (err.status === 400) {
                const { strippedPhoneNumber, countryCodeWithPlus } = getStrippedPhonePayload();
                open_dialog("verifyOtp", {
                    open: true,
                    propsData: {
                        phoneNumber: strippedPhoneNumber,
                        countryCode: countryCodeWithPlus,
                        phoneIsoCode: phoneIsoCode.toUpperCase(),
                        expiresIn: err.response?.data?.data?.expiresIn,
                        handlePhoneUpdateOtp: (
                            phone: string,
                            countryCode: string,
                            phoneIsoCode: string,
                            otp: string
                        ) => handlePhoneUpdateOtp(phone, countryCode, phoneIsoCode, otp),
                        verifyOtpStatus: true,
                        isPhoneUpdate: true,
                        otpType: "PHONE" as const,
                    },
                    type: "verifyOtp",
                    handlerDialog: () => {},
                    handleClose: () => {},
                    anchor: "bottom",
                    onlyDialog: false,
                });
                close_dialog(["updatePhone"]);
            } else {
                toast("error", err.response?.data?.message || lang.somethingWentWrong);
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user) {
            setPhoneNumber(session.user.phoneNumber || "");
            setDialCode(session.user.countryCode || "");
            setPhoneIsoCode(session.user.phoneIsoCode || "");
            setUserEmail(session.user.email || "");
        }
    }, [session]);

    return (
        <UpdateProfileFormLayout
            title={lang.updatePhoneNumber}
            onClose={onClose}
            loading={loading}
            button={
                <CustomButton
                    className="get-otp"
                    disabled={!handleValidation()}
                    onClick={handleGetOtp}
                >
                    {lang.getOTP}
                </CustomButton>
            }
        >
            <div className="form-group-edit-profile">
                <label className="label-text capitalize">{lang.phoneNumber}</label>
                <div className="flex items-center justify-between">
                    <div className="relative flex-1 edit-profile-phone-number-input">
                        <PhoneNumberInput
                            phoneNumber={`${dialCode}${phoneNumber}`}
                            dialCode={dialCode}
                            phoneIsoCode={phoneIsoCode.toLowerCase()}
                            setPhoneNumber={setPhoneNumber}
                            setDialCode={setDialCode}
                            setPhoneIsoCode={setPhoneIsoCode}
                            setIsPhoneNumberValid={setIsPhoneNumberValid}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && handleValidation() && !loading) {
                                    handleGetOtp();
                                }
                            }}
                            onPhoneChange={(phone, dial, iso, isValid) => {
                                handlePhoneChange(phone, dial, iso);
                                handlePhoneValidation(phone, dial, iso, isValid);
                            }}
                            onCountryChange={handleCountryChange}
                            onBlur={() => {
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
                    </div>
                </div>
            </div>
        </UpdateProfileFormLayout>
    );
};

export default UpdatePhone;
