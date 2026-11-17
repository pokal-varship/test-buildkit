import cookie from "js-cookie";

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export const setCookie = (key: string, value: string, expires: number = 15): void => {
    if (!isBrowser) return; // Don't set cookies on server-side
    
    try {
        cookie.set(key, value, {
            expires,
            path: "/",
            secure: true,
        });
    } catch {
        // Error handled silently
    }
};

export const getCookie = (key: string): string | null => {
    if (!isBrowser) return null; // Return null on server-side
    
    try {
        const value = cookie.get(key) ?? null;
        return value;
    } catch {
        // Error handled silently
        return null;
    }
};

export const removeCookie = (key: string): void => {
    if (!isBrowser) return; // Don't remove cookies on server-side
    
    cookie.remove(key);
};

