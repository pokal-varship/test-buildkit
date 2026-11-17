"use client";

import React, { useEffect, useRef } from "react";
import { useAuth } from "@hooks/useAuth";
import { identifyUser, resetAnalytics } from "@lib/analytics/rudderstack";

/**
 * AnalyticsProvider
 *
 * Keeps the analytics layer in sync with the authenticated user. Mount this
 * once, high in the tree, inside `AuthProvider` (so `useSession` is available).
 * It does not depend on Redux or any feature provider.
 *
 * Responsibilities:
 *   1. Call `identify` once when the user first authenticates and again only
 *      when the `userId` changes (e.g. after re-auth as a different user).
 *   2. Guard against duplicate identify calls triggered by quick session
 *      re-renders by tracking the last-identified id and an in-flight flag
 *      in refs (refs don't cause re-renders).
 *   3. Call `reset` on logout so subsequent events are tracked anonymously
 *      and a future login can re-identify cleanly.
 *
 * The provider intentionally renders only `children` and exposes no context;
 * the only useful surface area for consumers is the side effect itself.
 */
const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, userId, user } = useAuth();

  const lastIdentifiedUserIdRef = useRef<string | null>(null);
  const isIdentifyingRef = useRef(false);

  useEffect(() => {
    if (
      isAuthenticated &&
      userId &&
      userId !== lastIdentifiedUserIdRef.current &&
      !isIdentifyingRef.current
    ) {
      isIdentifyingRef.current = true;

      identifyUser(userId, {
        email: user?.email,
        name: user?.name,
        firstName: user?.firstName,
        lastName: user?.lastName,
      })
        .then(() => {
          lastIdentifiedUserIdRef.current = userId;
        })
        .catch(() => {
          // Analytics failures must never break the app
        })
        .finally(() => {
          isIdentifyingRef.current = false;
        });

      return;
    }

    if (!isAuthenticated || !userId) {
      // Logout transition: clear the analytics identity exactly once so that
      // subsequent events are sent anonymously and a future login is treated
      // as a fresh identify.
      if (lastIdentifiedUserIdRef.current !== null) {
        lastIdentifiedUserIdRef.current = null;
        resetAnalytics().catch(() => {
          // Swallow – nothing we can do, and analytics must not throw
        });
      }
    }
    // `user` traits (email/name) are read fresh inside the effect on purpose.
    // Re-running on every `user` object identity change would cause repeat
    // identify calls when next-auth refreshes the session without changing
    // who the user is.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, userId]);

  return <>{children}</>;
};

export default AnalyticsProvider;
