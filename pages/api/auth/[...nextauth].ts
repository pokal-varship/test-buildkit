import NextAuth from "next-auth";
import { User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { setCookie } from "@lib/cookie";
import {
    AuthResponseData,
    createUserProfile,
    handleOtpVerification,
    processAuthTokens,
    type NormalizedAuthUser,
} from "@lib/auth/otpAuth";

interface CustomUser {
    id: string;
    name: string;
    email: string;
    accessToken: string;
    refreshToken: string;
    clientName: string;
    clientId: string;
    userId: string;
    keycloakUserId: string;
    userType: string;
    timeZone: string;
    phoneNumber: string;
    countryCode: string;
    phoneIsoCode: string;
    emailVerified: boolean;
    isAuthenticated: boolean;
    permission: {
        dashboard: string[];
    };
    token: {
        access_token: string;
        id_token: string;
        expires_in: number;
        refresh_expires_in: number;
        refresh_token: string;
        token_type: string;
        "not-before-policy": number;
        session_state: string;
        scope: string;
    };
    userProfileUrl: string;
    accountType: string;
    firstName: string;
    lastName: string;
}

declare module "next-auth" {
    interface Session {
        user: { id: string; name: string; email: string };
        iat: number;
        exp: number;
        jti: string;
        accessToken?: string;
        refreshToken?: string;
        clientName?: string;
        clientId?: string;
        userId?: string;
        keycloakUserId?: string;
        userType?: string;
        timeZone?: string;
        phoneNumber?: string;
        emailVerified?: boolean;
        isAuthenticated?: boolean;
        permission?: {
            dashboard: string[];
        };
        token?: {
            access_token: string;
            id_token: string;
            expires_in: number;
            refresh_expires_in: number;
            refresh_token: string;
            token_type: string;
            "not-before-policy": number;
            session_state: string;
            scope: string;
        };
        userProfileUrl?: string;
        accountType?: string;
        firstName?: string;
        lastName?: string;
    }

    interface User extends CustomUser {
        expires: string;
        iat: number;
        exp: number;
        jti: string;
    }
}

function toNextAuthUser(user: NormalizedAuthUser, isAuthenticated: boolean): User {
    return {
        ...user,
        isAuthenticated,
    } as User;
}

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "default_client_id",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "default_client_secret",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                otp: { label: "OTP", type: "text" },
                action: { label: "Action", type: "text" },
                token: { label: "Token", type: "text" },
                accessToken: { label: "Access Token", type: "text" },
                refreshToken: { label: "Refresh Token", type: "text" },
                phoneNumber: { label: "Phone Number", type: "text" },
                phone: { label: "Phone", type: "text" },
                countryCode: { label: "Country Code", type: "text" },
                phoneIsoCode: { label: "Phone ISO Code", type: "text" },
                otpType: { label: "OTP Type", type: "text" },
                locationHeader: { label: "Location Header", type: "text" },
                sessionId: { label: "Session ID (QR flow)", type: "text" },
                isAuthenticated: { label: "Is Authenticated", type: "text" },
                firstName: { label: "First Name", type: "text" },
                lastName: { label: "Last Name", type: "text" },
                userId: { label: "User ID", type: "text" },
                name: { label: "Name", type: "text" },
                clientName: { label: "Client Name", type: "text" },
                clientId: { label: "Client ID", type: "text" },
                keycloakUserId: { label: "Keycloak User ID", type: "text" },
                userType: { label: "User Type", type: "text" },
            },
            async authorize(credentials): Promise<User | null> {
                if (!credentials?.action) {
                    return null;
                }

                // For updateAuth action, only merge session data; skip email/phone validation
                // (user was already validated in the first login credentials call)
                if (credentials.action === "updateAuth") {
                    // Handle authentication state update
                    return {
                        ...credentials,
                        id: "update-auth",
                        name: "Update Auth",
                        email: credentials?.email,
                        firstName: credentials?.firstName,
                        lastName: credentials?.lastName,
                        phoneNumber: credentials?.phoneNumber,
                        countryCode: credentials?.countryCode,
                        phoneIsoCode: credentials?.phoneIsoCode,
                        userId: credentials?.userId || "",
                        isAuthenticated: credentials?.isAuthenticated === "true"
                    } as unknown as User;
                }

                // For login action, validate email/phone presence based on otpType
                if (credentials.action === "login") {
                    const isEmailLogin = credentials.otpType !== "PHONE";
                    const isPhoneLogin = credentials.otpType === "PHONE";

                    // Token-based login (Google / client-verified OTP)
                    if (credentials?.accessToken) {
                        const tokens = {
                            accessToken: credentials.accessToken,
                            refreshToken: credentials.refreshToken || "",
                        };
                        const authData: AuthResponseData = {
                            email: credentials.email || "",
                            phoneNumber: credentials.phoneNumber || "",
                            countryCode: credentials.countryCode || "",
                            phoneIsoCode: credentials.phoneIsoCode || "",
                            name: credentials.name || "",
                            firstName: credentials.firstName || "",
                            lastName: credentials.lastName || "",
                            userId: credentials.userId || "",
                            clientName: credentials.clientName || "",
                            clientId: credentials.clientId || "",
                            keycloakUserId: credentials.keycloakUserId || "",
                            userType: credentials.userType || "",
                            emailVerified: false,
                            permission: { dashboard: [] },
                            userProfileUrl: "",
                            accountType: "",
                        };
                        const user = createUserProfile(authData, tokens, {
                            email: credentials.email || "",
                            phone: credentials.phoneNumber || "",
                            countryCode: credentials.countryCode || "",
                            phoneIsoCode: credentials.phoneIsoCode || "",
                        });

                        if (credentials.clientName) {
                            setCookie("clientName", credentials.clientName);
                        }

                        return toNextAuthUser(user, true);
                    }

                    if (isPhoneLogin && !credentials?.phone) {
                        return null;
                    }
                    if (isEmailLogin && !credentials?.email) {
                        return null;
                    }

                    // Legacy OTP-based login (kept for backward compatibility)
                    if (!credentials?.otp) {
                        return null;
                    }

                    const otp = credentials.otp;
                    if (typeof otp !== 'string') {
                        return null;
                    }

                    try {
                        const authData = await handleOtpVerification({
                            otpType: isPhoneLogin ? "PHONE" : "EMAIL",
                            otp,
                            guestToken: credentials.token || "",
                            email: credentials.email,
                            phone: credentials.phone,
                            countryCode: credentials.countryCode,
                            phoneIsoCode: credentials.phoneIsoCode,
                            locationHeader: credentials.locationHeader,
                            sessionId: credentials.sessionId ?? undefined,
                        });

                        const tokens = processAuthTokens(authData);
                        if (!authData || !tokens) {
                            return null;
                        }

                        setCookie("clientName", authData.clientName || "");
                        const user = createUserProfile(authData, tokens, {
                            email: credentials.email || "",
                            phone: credentials.phone || "",
                            countryCode: credentials.countryCode || "",
                            phoneIsoCode: credentials.phoneIsoCode || "",
                        });

                        // Legacy path: session starts unauthenticated until profile is completed
                        return toNextAuthUser(user, false);
                    } catch (error: unknown) {
                        if (error instanceof Error) {
                            console.error("Login error:", error.message);
                        }
                        return null;
                    }
                }

                // Unknown action
                return null;
            }
        })
    ],

    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                // Initial sign in or update auth
                if (user.id === "update-auth") {
                    // Update authentication state while preserving existing token data (including email for phone-only login)
                    return {
                        ...token,
                        isAuthenticated: user?.isAuthenticated,
                        firstName: user?.firstName,
                        lastName: user?.lastName,
                        phoneNumber: user?.phoneNumber,
                        countryCode: user?.countryCode,
                        phoneIsoCode: user?.phoneIsoCode,
                        email: user?.email ?? token.email,
                        userId: user?.userId || token.userId,
                    };
                }
                // Regular login
                return {
                    ...token,
                    ...user,
                };
            }
            
            if (trigger === "update" && session?.user) {
                // Update token with new session data
                return {
                    ...token,
                    ...session.user,
                };
            }
            
            return token;
        },
        async session({ session, token }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    ...token,
                },
                userId: token.userId as string | undefined,
                isAuthenticated: token.isAuthenticated || false,
            };
        }
    },
    pages: {
        signIn: "/auth",
        error: "/auth/error",
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development'
});
