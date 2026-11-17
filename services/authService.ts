import axiosClient from './axios';
import { LOGIN_EMAIL_OTP_ENDPOINT, LOGOUT_ENDPOINT, SIGNUP_ENDPOINT, TOKEN_EXCHANGE_ENDPOINT, VALIDATE_PHONE_ENDPOINT, GOOGLE_AUTH_ENDPOINT } from '@config/api.config';
import { getLocationHeader } from '@lib/utils/location';
import axios from 'axios';

// Define the GuestAuthResponse type (ensure this is defined)
type GuestAuthResponse = {
    status: number;
    data: {
        token: {
            access_token: string;
            refresh_token: string;
        };
        expires_in: number;
        id: string;
    };
    fingerprintId: string;
};

/**
 * Authenticates a guest user.
 * 
 * @param {string} fingerPrintId - The fingerprint ID of the guest user.
 * @returns {Promise<GuestAuthResponse>} The response data from the guest authentication API.
 * @throws Will throw an error if the request fails.
 */

type LoginWithOtpEmailParams = { type: 'EMAIL'; email: string };
type LoginWithOtpPhoneParams = {
    type: 'PHONE';
    fullPhone: string;
    dialCode: string;
    phoneIsoCode: string;
};
type LoginWithOtpParams = LoginWithOtpEmailParams | LoginWithOtpPhoneParams;

/** Phone payload shape: countryCode with "+", phoneIsoCode uppercase, phone = national number only */
function buildPhonePayload(fullPhone: string, dialCode: string, phoneIsoCode: string) {
    const digits = fullPhone.replace(/^\+\s*/, '');
    const phone = digits.startsWith(dialCode) ? digits.slice(dialCode.length) : digits;
    const countryCode = dialCode.startsWith('+') ? dialCode : `+${dialCode}`;
    return { countryCode, phoneIsoCode: phoneIsoCode.toUpperCase(), phone };
}

const patchOtpHeaders = (token: string, location: string) => ({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        Authorization: token,
        'Tenant-Id': process.env.NEXT_PUBLIC_TENANT_ID || '',
        'X-User-Location': location,
    },
});

export const loginWithOtp = async (params: LoginWithOtpParams): Promise<GuestAuthResponse> => {
    const locationHeader = await getLocationHeader(params.type === 'EMAIL' ? 'login-email' : 'login-phone');
    const payload =
        params.type === 'EMAIL'
            ? { email: params.email, otpType: 'EMAIL' as const }
            : { ...buildPhonePayload(params.fullPhone, params.dialCode, params.phoneIsoCode), otpType: 'PHONE' as const };
    const response = await axiosClient.post(LOGIN_EMAIL_OTP_ENDPOINT, payload, {
        headers: { 'X-User-Location': locationHeader },
    });
    return response.data;
};

/** @deprecated Use loginWithOtp({ type: 'EMAIL', email }) */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for backward compatibility
export const loginEmail = (email: string, _otpType?: string): Promise<GuestAuthResponse> =>
    loginWithOtp({ type: 'EMAIL', email });

/** @deprecated Use loginWithOtp({ type: 'PHONE', fullPhone, dialCode, phoneIsoCode }) */
export const loginPhone = (fullPhone: string, dialCode: string, phoneIsoCode: string): Promise<GuestAuthResponse> =>
    loginWithOtp({ type: 'PHONE', fullPhone, dialCode, phoneIsoCode });

export const loginEmailOtp = async (
    email: string,
    otp: string,
    token: string,
    otpType: string,
    locationHeader?: string,
    sessionId?: string
): Promise<GuestAuthResponse> => {
    const location = locationHeader ?? (await getLocationHeader('login-email-otp'));
    const body = { email, otp, otpType, ...(sessionId ? { sessionId } : {}) };
    const response = await axios.patch(
        LOGIN_EMAIL_OTP_ENDPOINT,
        body,
        patchOtpHeaders(token, location)
    );
    return response.data;
};

export const loginPhoneOtp = async (
    fullPhone: string,
    dialCode: string,
    phoneIsoCode: string,
    otp: string,
    token: string,
    locationHeader?: string,
    sessionId?: string
): Promise<GuestAuthResponse> => {
    const location = locationHeader ?? (await getLocationHeader('login-phone-otp'));
    const body = { ...buildPhonePayload(fullPhone, dialCode, phoneIsoCode), otp, otpType: 'PHONE' as const, ...(sessionId ? { sessionId } : {}) };
    const response = await axios.patch(LOGIN_EMAIL_OTP_ENDPOINT, body, patchOtpHeaders(token, location));
    return response.data;
};

export const signup = async (payload: {firstName: string, lastName: string, email: string, countryCode: string, phoneNumber: string, phoneIsoCode: string, otpType: 'EMAIL' | 'PHONE'}): Promise<GuestAuthResponse> => {
    const locationHeader = await getLocationHeader('signup');
    try {
        const response = await axiosClient.post(SIGNUP_ENDPOINT, {
            firstName: payload.firstName,
            lastName: payload.lastName,
            email: payload.email,
            countryCode: payload.countryCode,
            phone: payload.phoneNumber,
            phoneIsoCode: payload.phoneIsoCode,
            otpType: payload.otpType
        }, {
            headers: {
                'X-User-Location': locationHeader,
            }
        });
        return response.data;
    } catch (error) {

        throw error;
    }
};

export const logout = async (clientName: string, userId: string, refreshToken: string): Promise<GuestAuthResponse> => {
    try {
        const response = await axios.post(LOGOUT_ENDPOINT, {
            userId
        }, {
            baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
            headers: {
                'ClientName': clientName,
                'Authorization': refreshToken
            }
        });
        return response.data;
    } catch (error) {

        throw error;
    }
};

export const tokenExchange = async (storefrontId: string, token: string): Promise<GuestAuthResponse> => {
    try {
        const response = await axios.get(`${TOKEN_EXCHANGE_ENDPOINT}?storefrontId=${storefrontId}`, {
            baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
            headers: {
                'Authorization': token,
                'Tenant-Id': process.env.NEXT_PUBLIC_TENANT_ID || "",
            }
        });
        return response.data;
    } catch (error) {

        throw error;
    }
};

export const validatePhone = async (payload: {phone: string, countryCode: string, phoneIsoCode: string, email: string}): Promise<GuestAuthResponse> => {
    try {
        const response = await axiosClient.post(VALIDATE_PHONE_ENDPOINT, {
            phone: payload.phone,
            countryCode: payload.countryCode,
            phoneIsoCode: payload.phoneIsoCode,
            email: payload.email
        });
        return response.data;
    } catch (error) {

        throw error;
    }
};

export const googleAuth = async (code: string): Promise<GuestAuthResponse> => {
    const locationHeader = await getLocationHeader('google-auth');
    try {
        const response = await axiosClient.post(GOOGLE_AUTH_ENDPOINT, {
            code: code,
            redirectUri: process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000",
        }, {
            headers: {
                'X-User-Location': locationHeader,
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
