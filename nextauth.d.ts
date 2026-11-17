import NextAuth from 'next-auth';

declare module 'next-auth' {
    interface User {
        fingerprintId?: string | null;
    }
    interface Session {
        fingerprintId?: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
    }
} 