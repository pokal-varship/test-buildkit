import React, { useState, useEffect } from "react";
import CustomButton from "@components/buttons/Button";
import SecondaryButton from "@components/buttons/secondaryButton";
// import { GOOGLE_LOGO } from "@config/Header/image.config";
import { CROSS_ICON, MAIL_ICON } from "@config/Header/image.config";
import { validateEmail } from "@components/validation";
import useLang from "@hooks/useLang";
import { loginWithOtp } from "@services/authService";
import { close_dialog, open_dialog } from "@lib/modalHandler";
import { LanguageCode, TranslationKeys } from "types";
import { useToast } from "@components/toast/Toast";
import Icon from "@components/image/Icons";
import PhoneCallIcon from "@components/icons/PhoneCallIcon";
import Loader from "@components/loader/Loader";
import EmailInput from "@components/input/EmailInput";
import PhoneNumberInput from "@components/phonenumber/PhoneNumberInput";
import { getAuthConfig, getDefaultLoginType } from "@config/auth.config";
// import useGoogleAuth from "@hooks/useGoogleAuth";

interface LoginModalProps {
  handlerDialog: () => void;
  onClose: () => void;
  onSuccess?: () => void;
  initialLoginType?: 'EMAIL' | 'PHONE';
}

interface GuestAuthResponse {
  status: number;
  message?: string;
  data?: {
    expires_in: number;
  };
}

interface CustomError extends Error {
  status?: number; // Optional status property
  response?: {
    data?: {
      message?: string;
      data?: { expires_in?: number };
    };
  };
}

const getErrorMessage = (err: unknown): string =>
  err && typeof err === "object" && "response" in err
    ? (err as CustomError).response?.data?.message ?? "Something went wrong"
    : "Something went wrong";

const VERIFY_OTP_BASE = {
  type: "verifyOtp" as const,
  handlerDialog: () => {},
  handleClose: () => {},
  anchor: "bottom" as const,
  onlyDialog: false,
};

const DIALOG_SX = { "& .MuiDialogContent-root": { backgroundColor: "var(--tertiary-background)" } };

type LoginType = "EMAIL" | "PHONE";

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess, initialLoginType }) => {
  const authConfig = getAuthConfig();
  const [emailState, setEmailState] = useState<string>("");
  const [loginType, setLoginType] = useState<LoginType>(
    authConfig.phoneOnlyLogin ? "PHONE" : (initialLoginType ?? getDefaultLoginType()),
  );
  useEffect(() => {
    if (authConfig.phoneOnlyLogin) {
      setLoginType("PHONE");
      return;
    }
    if (initialLoginType) setLoginType(initialLoginType);
  }, [authConfig.phoneOnlyLogin, initialLoginType]);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [dialCode, setDialCode] = useState<string>("");
  const [phoneIsoCode, setPhoneIsoCode] = useState<string>("");
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  // const { googleLogin } = useGoogleAuth();

  const handleGetOTP = async () => {
    if (!isEmailValid) return;
    setLoading(true);
    try {
      const res: GuestAuthResponse = await loginWithOtp({ type: "EMAIL", email: emailState });
      if (res.message === "Success") {
        open_dialog("verifyOtp", {
          ...VERIFY_OTP_BASE,
          open: true,
          propsData: {
            setEmail: setEmailState,
            email: emailState,
            expiresIn: res?.data?.expires_in,
            onSuccess,
            otpType: "EMAIL",
          },
        });
      }
    } catch (err: unknown) {
      const error = err as CustomError;
      if (error.status === 404) {
        open_dialog("signup", {
          open: true,
          propsData: { email: emailState, onSuccess },
          type: "signup",
          handlerDialog: () => {},
          handleClose: () => {},
          anchor: "bottom",
          onlyDialog: false,
          sxStyle: DIALOG_SX,
        });
      } else if (error.status === 400) {
        open_dialog("verifyOtp", {
          ...VERIFY_OTP_BASE,
          open: true,
          propsData: {
            setEmail: setEmailState,
            email: emailState,
            expiresIn: error.response?.data?.data?.expires_in,
            onSuccess,
            otpType: "EMAIL",
          },
          sxStyle: DIALOG_SX,
        });
      } else {
        toast("error", getErrorMessage(error));
      }
    } finally {
      close_dialog(["login"]);
      setLoading(false);
    }
  };

  const handleGetOTPPhone = async () => {
    if (!isPhoneNumberValid) return;
    setLoading(true);
    try {
      const res: GuestAuthResponse = await loginWithOtp({
        type: "PHONE",
        fullPhone: phoneNumber,
        dialCode,
        phoneIsoCode,
      });
      if (res.message === "Success") {
        open_dialog("verifyOtp", {
          ...VERIFY_OTP_BASE,
          open: true,
          propsData: {
            email: "",
            phoneNumber,
            countryCode: dialCode,
            phoneIsoCode,
            expiresIn: res?.data?.expires_in,
            onSuccess,
            otpType: "PHONE",
          },
        });
      }
    } catch (err: unknown) {
      const error = err as CustomError;
      if (error.status === 404) {
        open_dialog("signup", {
          open: true,
          propsData: { email: "", phoneNumber, countryCode: dialCode, phoneIsoCode, onSuccess },
          type: "signup",
          handlerDialog: () => {},
          handleClose: () => {},
          anchor: "bottom",
          onlyDialog: false,
          sxStyle: DIALOG_SX,
        });
      } else if (error.status === 400) {
        open_dialog("verifyOtp", {
          ...VERIFY_OTP_BASE,
          open: true,
          propsData: {
            email: "",
            phoneNumber,
            countryCode: dialCode,
            phoneIsoCode,
            expiresIn: error.response?.data?.data?.expires_in,
            onSuccess,
            otpType: "PHONE",
          },
          sxStyle: DIALOG_SX,
        });
      } else {
        toast("error", getErrorMessage(error));
      }
    } finally {
      close_dialog(["login"]);
      setLoading(false);
    }
  };

  const isEmailValid = validateEmail(emailState);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
          <Loader />
        </div>
      )}
      <div className="dialog-container-login">
        <div className="dialog-header-login">
          <h2 className="dialog-title">{lang.login}</h2>
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

        {loginType === "EMAIL" ? (
          <>
            <EmailInput
              value={emailState}
              onChange={setEmailState}
              label={lang.emailAddress}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isEmailValid && !loading) {
                  handleGetOTP();
                }
              }}
            />
            <CustomButton
              className="get-otp"
              disabled={!isEmailValid}
              onClick={handleGetOTP}
            >
              {lang.getOTP}
            </CustomButton>
          </>
        ) : (
          <>
            <div className="form-group">
              <label className="label-text">{lang.phoneNumber}</label>
              <PhoneNumberInput
                setPhoneNumber={setPhoneNumber}
                setDialCode={setDialCode}
                setPhoneIsoCode={setPhoneIsoCode}
                setIsPhoneNumberValid={setIsPhoneNumberValid}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isPhoneNumberValid && !loading) {
                    handleGetOTPPhone();
                  }
                }}
              />
            </div>
            <CustomButton
              className="get-otp"
              disabled={!isPhoneNumberValid}
              onClick={handleGetOTPPhone}
            >
              {lang.getOTP}
            </CustomButton>
          </>
        )}

        {!authConfig.phoneOnlyLogin && (
          <>
            <div className="or-separator">
              <div className="or-separator-line" />
              <span className="or-separator-text">{lang.or}</span>
              <div className="or-separator-line" />
            </div>

            <div className="login-options">
              {/* <SecondaryButton
                className="google-login"
                onClick={() => googleLogin()}
              >
                <img
                  fetchPriority="high"
                  title="Google Icon"
                  src={GOOGLE_LOGO}
                  alt="Google"
                  className="google-icon"
                />
                {lang.loginWithGoogle}
              </SecondaryButton> */}

              <SecondaryButton
                className="phone-email-login"
                onClick={() => {
                  setLoginType(loginType === "EMAIL" ? "PHONE" : "EMAIL");
                }}
              >
                {loginType === "EMAIL" ? (
                  <PhoneCallIcon
                    width={24}
                    height={24}
                    className="phone-email-icon"
                    style={{ color: "var(--primary-text)" }}
                  />
                ) : (
                  <Icon
                    icon={`${MAIL_ICON}#mail`}
                    width={24}
                    height={24}
                    color="var(--primary-text)"
                    className="phone-email-icon"
                    viewBox="0 -2 26 28"
                  />
                )}
                {loginType === "EMAIL" ? lang.loginWithPhone : lang.loginWithEmail}
              </SecondaryButton>
            </div>
          </>
        )}
      </div>
      <style>{`
                .dialog-container-login {
                    width: 100%;
                    padding:14px 19px;
                    min-width: 400px;
                    background-color: var(--tertiary-background);
                }

                .dialog-header-login {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
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

                .login-modal-container{
                    border-radius: 10px;
                }
                
                .login-modal-container .react-responsive-modal-closeButton{
                    top:22px;
                }
                .label-text{
                    font-size: var(--small-font);
                    font-weight: var(--font-regular);
                    color: var(--secondary-text);
                    margin-bottom:5px;
                }

                @media (max-width: 768px) {
                    .login-modal-container{
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
                    .name-container {
                        display: block;
                    }
                    .form-group input{
                        width: 100%;
                    }
                    .dialog-container-login{
                        min-width: 300px;
                        padding: 30px 16px !important;
                        border-radius:10px;
                    }
                    .dialog-header-login{
                        margin-bottom:10px;
                    }
                }
            `}</style>
    </>
  );
};

export default LoginModal;
