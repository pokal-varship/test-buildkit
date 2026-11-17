'use client'

import CustomButton from "@components/buttons/Button";
import { ExtendedSession } from "@components/header/types";
import { useToast } from "@components/toast/Toast";
import { validateEmail } from "@components/validation";
import useLang from "@hooks/useLang";
import { close_dialog, open_dialog } from "@lib/modalHandler";
import { updateEmail, updateEmailOtp } from "@services/profileService";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageCode, TranslationKeys } from "types";
import UpdateProfileFormLayout, { CustomError } from "./UpdateProfileFormLayout";

interface UpdateEmailProps {
    onClose?: () => void;
}

interface UpdateEmailPayload {
    email: string;
}

interface UpdateEmailOtpPayload {
    email: string;
    otp: string;
}

const UpdateEmail: React.FC<UpdateEmailProps> = ({ onClose }) => {
    const [lang]: [TranslationKeys, LanguageCode] = useLang();
    const { data: session, update } = useSession() as {
        data: ExtendedSession | null;
        update: (session: ExtendedSession) => void;
    };
    const [userEmail, setUserEmail] = useState(session?.user?.email || "");
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const isEmailValid = validateEmail(userEmail);

    const handleValidation = (): boolean => isEmailValid;

    const handleEmailUpdateOtp = async (userEmail: string, otp: string) => {
        try {
            setLoading(true);
            const payload: UpdateEmailOtpPayload = { email: userEmail, otp };
            const response = await updateEmailOtp(payload);

            if (response.message === "Success") {
                if (session?.user) {
                    await update({
                        ...session,
                        user: { ...session.user, email: userEmail },
                    });
                }
                router.refresh();
                open_dialog("emailSuccess", {
                    open: true,
                    propsData: { title: lang.emailUpdatedSuccessfully },
                    type: "emailSuccess",
                    handlerDialog: () => {},
                    handleClose: () => {},
                    anchor: "bottom",
                    onlyDialog: true,
                });
            }
            close_dialog(["verifyOtp"]);
            close_dialog(["updateEmail"]);
            close_dialog(["updateProfile"]);
            setLoading(false);
        } catch {
            setLoading(false);
            toast("error", lang.incorrectOtp);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setLoading(true);
            const payload: UpdateEmailPayload = { email: userEmail };
            const res = await updateEmail(payload);
            if (res.message === "Success") {
                open_dialog("verifyOtp", {
                    open: true,
                    propsData: {
                        setEmail: setUserEmail,
                        email: userEmail,
                        expiresIn: res?.data?.expires_in,
                        handleEmailUpdateOtp: (userEmail: string, otp: string) =>
                            handleEmailUpdateOtp(userEmail, otp),
                        verifyOtpStatus: true,
                        isEmailUpdate: true,
                    },
                    type: "verifyOtp",
                    handlerDialog: () => {},
                    handleClose: () => {},
                    anchor: "bottom",
                    onlyDialog: false,
                });
                close_dialog(["updateEmail"]);
            }
            setLoading(false);
        } catch (error: unknown) {
            const err = error as CustomError;
            if (err.status === 400) {
                setLoading(true);
                open_dialog("verifyOtp", {
                    open: true,
                    propsData: {
                        setEmail: setUserEmail,
                        email: userEmail,
                        expiresIn: err.response?.data?.data?.expiresIn,
                        handleEmailUpdateOtp: (userEmail: string, otp: string) =>
                            handleEmailUpdateOtp(userEmail, otp),
                        verifyOtpStatus: true,
                    },
                    type: "verifyOtp",
                    handlerDialog: () => {},
                    handleClose: () => {},
                    anchor: "bottom",
                    onlyDialog: false,
                });
                setLoading(false);
            } else {
                toast("error", err.response?.data?.message || lang.somethingWentWrong);
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (session?.user) {
            setUserEmail(session.user.email || "");
        }
    }, [session]);

    return (
        <UpdateProfileFormLayout
            title={lang.updateEmail}
            onClose={onClose}
            loading={loading}
            button={
                <CustomButton
                    className="get-otp"
                    disabled={!handleValidation()}
                    onClick={handleUpdateProfile}
                >
                    {lang.getOTP}
                </CustomButton>
            }
        >
            <div className="form-group-edit-profile">
                <label className="label-text capitalize">{lang.emailAddress}</label>
                <div className="flex items-center justify-between">
                    <div className="relative flex-1">
                        <input
                            type="email"
                            placeholder={lang.emailAddressPlaceholderText}
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </UpdateProfileFormLayout>
    );
};

export default UpdateEmail;
