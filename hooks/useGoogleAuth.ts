import { useGoogleLogin, CodeResponse } from "@react-oauth/google";
import { googleAuth } from "@services/authService";
import { useToast } from "@components/toast/Toast";
import { signIn } from "next-auth/react";
import { setCookie } from "@lib/cookie";
import { close_dialog } from "@lib/modalHandler";
import { LanguageCode, TranslationKeys } from "types";
import useLang from "./useLang";

interface CustomError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface GoogleAuthResponse {
  status?: string;
  message?: string;
  data?: {
    token: {
      access_token: string;
      refresh_token: string;
      expires_in?: number;
      refresh_expires_in?: number;
      token_type?: string;
    };
    email: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    userId?: string;
    phoneNumber?: string;
    countryCode?: string;
    phoneIsoCode?: string;
    clientName?: string;
    clientId?: string;
    keycloakUserId?: string;
    userType?: string;
  };
}

/**
 * Custom hook for Google authentication
 * @returns Object containing the googleLogin function to trigger Google OAuth flow
 */
export const useGoogleAuth = () => {
  const toast = useToast();
  const [lang]: [TranslationKeys, LanguageCode] = useLang();

  const handleGoogleLogin = async (codeResponse: CodeResponse) => {
    try {
      const res = await googleAuth(codeResponse.code);
      
      // The API response structure: { status, message, data: { token, email, firstName, ... } }
      const authResponse = res as unknown as GoogleAuthResponse;
      const responseData = authResponse?.data;
      
      if (responseData) {
        const { token, email, firstName, lastName, name, userId, phoneNumber, countryCode, phoneIsoCode, clientName, clientId, keycloakUserId, userType } = responseData;
        
        // Extract access token (remove "Bearer " prefix if present)
        const accessToken = token?.access_token?.replace(/^Bearer\s+/i, '') || '';
        const refreshToken = token?.refresh_token || '';
        
        // Set cookies
        setCookie('token', accessToken);
        setCookie('refresh_token', refreshToken);
        
        // Call signIn with googleAuth action to create session
        const result = await signIn("credentials", {
          redirect: false,
          email: email,
          action: "login",
          accessToken: accessToken,
          refreshToken: refreshToken,
          userId: userId || "",
          name: name || (firstName && lastName ? `${firstName} ${lastName}` : email),
          firstName: firstName || "",
          lastName: lastName || "",
          phoneNumber: phoneNumber || "",
          countryCode: countryCode || "",
          phoneIsoCode: phoneIsoCode || "",
          clientName: clientName || "",
          clientId: clientId || "",
          keycloakUserId: keycloakUserId || "",
          userType: userType || "",
          otpType: "EMAIL",
        });
        
        if (result?.error) {
          toast("error", "Failed to create session");
          return;
        }
        
        toast("success", lang.SuccessfullySignedInWithGoogle);
        close_dialog(['login']);
      }
    } catch (err: unknown) {
      const error = err as CustomError;
      toast(
        "error",
        error?.response?.data?.message || "Google authentication failed"
      );
    }
  };

  let googleLogin;
  
  try {
    googleLogin = useGoogleLogin({
      onSuccess: async (codeResponse: CodeResponse) => {
        handleGoogleLogin(codeResponse);
      },
      scope: "email",
      flow: "auth-code",
    });
  } catch (error) {
    // Google OAuth is not available, return a no-op function
    console.warn('Google OAuth not available:', error);
    googleLogin = () => {
      toast("error", "Google authentication is not configured");
    };
  }

  return {
    googleLogin,
  };
};

export default useGoogleAuth;

