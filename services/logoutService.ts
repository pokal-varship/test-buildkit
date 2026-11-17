'use client';

import { useEffect } from "react";
import { ExtendedSession } from "@components/header/types";
import { signOut, useSession } from "next-auth/react";
import { logout } from "./authService";
import { logoutSubject } from "@lib/rxSubject";
import { removeCookie } from "@lib/cookie";

export const useHandleLogout = (): void => {
  const { data: session } = useSession() as { data: ExtendedSession | null };

  useEffect(() => {
    const performLogout = async () => {
      if (!session?.user) return;

      try {
        if (session.user.clientName) {
          await logout(
            String(session.user.clientName),
            String(session.user.userId),
            String(session.user?.refreshToken),
          );
        }
        await signOut({ redirect: false });
        removeCookie("token");
        window.location.reload();
      } catch {
        // Swallow — logout should not block navigation
      }
    };

    const subscription = logoutSubject.subscribe(() => {
      void performLogout();
    });

    return () => subscription.unsubscribe();
  }, [session]);
};
