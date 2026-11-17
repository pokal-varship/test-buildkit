import { CustomUser } from "@components/type/store.types";

declare module "next-auth" {
    interface Session {
        user: CustomUser;
        expires: string;
        iat: number;
        exp: number;
        jti: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT extends CustomUser {}
} 