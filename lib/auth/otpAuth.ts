import { setCookie } from '@lib/cookie';
import { UserProfile } from '@components/type/store.types';
import { loginEmailOtp, loginPhoneOtp } from '@services/authService';

/** Auth payload returned by BE after OTP verification */
export interface AuthResponseData {
    token?: {
        access_token: string;
        refresh_token?: string;
        id_token?: string;
        expires_in?: number;
        refresh_expires_in?: number;
        token_type?: string;
        'not-before-policy'?: number;
        session_state?: string;
        scope?: string;
    };
    clientName?: string;
    clientId?: string;
    userId?: string;
    keycloakUserId?: string;
    userType?: string;
    timeZone?: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
    countryCode?: string;
    phoneIsoCode?: string;
    emailVerified?: boolean;
    permission?: { dashboard: string[] };
    userProfileUrl?: string;
    accountType?: string;
    firstName?: string;
    lastName?: string;
}

export interface AuthFallbacks {
    email?: string;
    phone?: string;
    countryCode?: string;
    phoneIsoCode?: string;
}

export interface ProcessedAuthTokens {
    accessToken: string;
    refreshToken: string;
}

/** Normalized user fields shared by Redux profile, NextAuth User, and signIn credentials */
export interface NormalizedAuthUser {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    countryCode: string;
    phoneIsoCode: string;
    clientName: string;
    clientId: string;
    userId: string;
    keycloakUserId: string;
    userType: string;
    timeZone: string;
    emailVerified: boolean;
    accessToken: string;
    refreshToken: string;
    permission: { dashboard: string[] };
    token: AuthResponseData['token'];
    userProfileUrl: string;
    accountType: string;
}

export interface LoginPhonePayload {
    phone: string;
    countryCode: string;
    phoneIsoCode: string;
}

export interface HandleOtpVerificationParams {
    otpType: 'EMAIL' | 'PHONE';
    otp: string;
    guestToken: string;
    email?: string;
    phone?: string;
    countryCode?: string;
    phoneIsoCode?: string;
    locationHeader?: string;
    sessionId?: string;
}

/** Build phone payload: phone (national only), countryCode (+91), phoneIsoCode (IN) */
export function buildLoginPhonePayload(
    phoneNumber: string | undefined,
    countryCode: string | undefined,
    phoneIsoCode: string | undefined,
): LoginPhonePayload | null {
    if (!phoneNumber || countryCode == null) return null;
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    const dialDigits = (countryCode || '').replace(/\D/g, '');
    const phone = digitsOnly.startsWith(dialDigits) ? digitsOnly.slice(dialDigits.length) : digitsOnly;
    const countryCodeFormatted = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
    const phoneIsoCodeFormatted = (phoneIsoCode || '').toUpperCase();
    return { phone, countryCode: countryCodeFormatted, phoneIsoCode: phoneIsoCodeFormatted };
}

export function resolveDisplayName(
    authData: Pick<AuthResponseData, 'name' | 'firstName' | 'lastName'>,
    resolvedEmail: string,
    resolvedPhone: string,
): string {
    const firstName = authData.firstName || '';
    const lastName = authData.lastName || '';
    return (
        authData.name ||
        (firstName && lastName ? `${firstName} ${lastName}` : resolvedEmail || resolvedPhone)
    );
}

/**
 * Extract access/refresh tokens from BE auth data.
 * By default keeps the token as returned (does not strip "Bearer ").
 * Optionally persists token cookies (client-only; no-op on server).
 */
export function processAuthTokens(
    authData: AuthResponseData | undefined | null,
    options?: {
        persistCookies?: boolean;
        stripBearer?: boolean;
    },
): ProcessedAuthTokens | null {
    const rawAccess = authData?.token?.access_token;
    if (!rawAccess) return null;

    const accessToken = options?.stripBearer
        ? rawAccess.replace(/^Bearer\s+/i, '')
        : rawAccess;
    const refreshToken = authData?.token?.refresh_token || '';

    if (options?.persistCookies) {
        setCookie('token', accessToken);
        setCookie('refresh_token', refreshToken);
        if (authData?.clientName) setCookie('clientName', authData.clientName);
    }

    return { accessToken, refreshToken };
}

/**
 * Build a normalized user object from BE auth data (or credential-like fields).
 * Used by verifyOtpModal (Redux + signIn) and NextAuth authorize.
 */
export function createUserProfile(
    authData: AuthResponseData,
    tokens: ProcessedAuthTokens,
    fallbacks: AuthFallbacks = {},
): NormalizedAuthUser {
    const resolvedEmail = authData.email ?? fallbacks.email ?? '';
    const resolvedPhone = authData.phoneNumber || fallbacks.phone || '';
    const firstName = authData.firstName || '';
    const lastName = authData.lastName || '';
    const displayName = resolveDisplayName(authData, resolvedEmail, resolvedPhone);

    return {
        id: authData.userId || resolvedEmail || resolvedPhone || 'user',
        email: resolvedEmail,
        name: displayName,
        firstName,
        lastName,
        phoneNumber: resolvedPhone,
        countryCode: authData.countryCode || fallbacks.countryCode || '',
        phoneIsoCode: authData.phoneIsoCode || fallbacks.phoneIsoCode || '',
        clientName: authData.clientName || '',
        clientId: authData.clientId || '',
        userId: authData.userId || '',
        keycloakUserId: authData.keycloakUserId || '',
        userType: authData.userType || '',
        timeZone: authData.timeZone || '',
        emailVerified: authData.emailVerified ?? false,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        permission: authData.permission || { dashboard: [] },
        token: authData.token,
        userProfileUrl: authData.userProfileUrl || '',
        accountType: authData.accountType || '',
    };
}

/** Map normalized auth user to Redux UserProfile shape */
export function toReduxUserProfile(user: NormalizedAuthUser): UserProfile {
    return {
        id: user.id,
        email: user.email,
        clientName: user.clientName,
        clientId: user.clientId,
        userId: user.userId,
        keycloakUserId: user.keycloakUserId,
        userType: user.userType,
        timeZone: user.timeZone,
        name: user.name,
        phoneNumber: user.phoneNumber,
        emailVerified: user.emailVerified,
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
        permission: user.permission,
        token: user.token as UserProfile['token'],
        userProfileUrl: user.userProfileUrl,
        accountType: user.accountType,
    };
}

/** Build next-auth signIn credentials from a normalized user (token-based login path) */
export function toSignInCredentials(
    user: NormalizedAuthUser,
    otpType: 'EMAIL' | 'PHONE',
    phonePayload?: LoginPhonePayload | null,
): Record<string, string> {
    return {
        action: 'login',
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
        email: user.email,
        userId: user.userId,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        countryCode: user.countryCode,
        phoneIsoCode: user.phoneIsoCode,
        clientName: user.clientName,
        clientId: user.clientId,
        keycloakUserId: user.keycloakUserId,
        userType: user.userType,
        otpType,
        ...(otpType === 'PHONE' && phonePayload ? { phone: phonePayload.phone } : {}),
    };
}

/**
 * Verify OTP with the backend.
 * Returns auth data on success, or null when the response has no access token.
 */
export async function handleOtpVerification(
    params: HandleOtpVerificationParams,
): Promise<AuthResponseData | null> {
    const {
        otpType,
        otp,
        guestToken,
        email,
        phone,
        countryCode,
        phoneIsoCode,
        locationHeader,
        sessionId,
    } = params;

    const response =
        otpType === 'PHONE' && phone && countryCode != null
            ? await loginPhoneOtp(
                phone,
                countryCode.replace(/^\+/, ''),
                phoneIsoCode || '',
                otp,
                guestToken,
                locationHeader,
                sessionId,
            )
            : await loginEmailOtp(
                email || '',
                otp,
                guestToken,
                otpType,
                locationHeader,
                sessionId,
            );

    const authData = response?.data as AuthResponseData | undefined;
    if (!authData?.token?.access_token) return null;
    return authData;
}
