import { getTenantConfig } from "./tenant.config";

export type AuthConfig = {
  /** When true, login is restricted to mobile number OTP only. */
  phoneOnlyLogin: boolean;
};

export function getAuthConfig(): AuthConfig {
  return {
    phoneOnlyLogin: getTenantConfig().authPhoneOnlyLogin,
  };
}

export function getDefaultLoginType(): "EMAIL" | "PHONE" {
  return getAuthConfig().phoneOnlyLogin ? "PHONE" : "EMAIL";
}
