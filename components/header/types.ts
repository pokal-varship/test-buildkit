import { Session } from "next-auth";

export interface ExtendedSession extends Session {
    user: {
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
        isAuthenticated?: boolean;
        permission: {
            dashboard: string[];
        };
        userProfileUrl: string;
        accountType: string;
        firstName: string;
        lastName: string;
        image?: string;
    };
    isAuthenticated?: boolean;
}

export interface User {
    id: string;
    name: string;
    email: string;
    clientName?: string;
    userId?: string;
    token?: { refresh_token?: string };
}


export interface CustomError extends Error {
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
