"use client";

import React, { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useAppSearchParam } from "@context/SearchParamsContext";
import { useDispatch, useSelector } from "react-redux";
import useLang from "@hooks/useLang";
import { useToast } from "@components/toast/Toast";
import { LanguageCode, TranslationKeys } from "types";
import {
  selectQrToken,
  selectQrResolveData,
  setQrFlowActive,
  setQrResolveData,
  setDineInSessionData,
  clearQrFlow,
} from "@redux/slices/qrFlowSlice";
import { fetchQrResolve } from "@services/qrResolveService";
import { getSession } from "@services/sessionService";
import useIsMobile from "@hooks/useIsMobile";
import QRMobilePlaceholder from "@components/scanOrder/QRMobilePlaceholder";
import QrTicketWsRunner from "./QrTicketWsRunner";
import useAnalytics from "@hooks/useAnalytics";
import {
  buildDineInQrResolvedParams,
  classifyQrResolveError,
} from "@lib/analytics/dineInAnalytics";

/** Token from URL only: path /t/[token] or query ?qrToken= */
function useQrTokenFromUrl(): {
  tokenFromPath: string | null;
  tokenFromQuery: string | null;
  qrTokenFromUrl: string | null;
} {
  const params = useParams();
  const tokenFromPath = (params?.token as string)?.trim() || null;
  const tokenFromQuery = useAppSearchParam("qrToken")?.trim() || null;
  const qrTokenFromUrl = tokenFromPath ?? tokenFromQuery ?? null;
  return { tokenFromPath, tokenFromQuery, qrTokenFromUrl };
}

/**
 * Handles QR flow on page load/refresh.
 * When URL has qrToken (query only; /t/[token] is handled by useQRCode) and Redux lacks data,
 * fetches resolve API and populates Redux so dine-in UI survives refresh.
 */
function QrFlowRefreshHandler() {
  const dispatch = useDispatch();
  const { tokenFromPath, qrTokenFromUrl } = useQrTokenFromUrl();
  const qrTokenInRedux = useSelector(selectQrToken);
  const qrResolveDataInRedux = useSelector(selectQrResolveData);
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const showToast = useToast();
  const { trackDineInQrResolved, trackDineInQrResolveFailed } = useAnalytics();
  const hasRehydratedForToken = useRef<string | null>(null);
  /** Token for which QR Resolve is currently fetching (stops duplicate calls when effect re-runs) */
  const pendingToken = useRef<string | null>(null);
  const trackedResolveTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!qrTokenFromUrl) {
      // Search-params store can lag behind the real URL (Suspense). Don't end
      // the session while the browser still has a QR token.
      const urlHasQrToken =
        !!new URLSearchParams(window.location.search).get("qrToken")?.trim() ||
        window.location.pathname.startsWith("/t/");
      if (urlHasQrToken) return;

      hasRehydratedForToken.current = null;
      pendingToken.current = null;
      if (qrTokenInRedux || qrResolveDataInRedux) {
        showToast("info", lang.dineInSessionEnded);
        dispatch(clearQrFlow());
      }
      return;
    }
    if (tokenFromPath) {
      return; // /t/[token]: useQRCode fetches
    }
    if (qrTokenInRedux === qrTokenFromUrl && qrResolveDataInRedux) {
      hasRehydratedForToken.current = qrTokenFromUrl;
      return;
    }
    if (pendingToken.current === qrTokenFromUrl) {
      return;
    }

    let cancelled = false;
    pendingToken.current = qrTokenFromUrl;
    dispatch(setQrFlowActive({ token: qrTokenFromUrl }));
    fetchQrResolve(qrTokenFromUrl)
      .then((data) => {
        // Always apply result: cleanup ran only because effect re-ran (e.g. setQrFlowActive), not unmount
        dispatch(setQrResolveData(data));
        hasRehydratedForToken.current = qrTokenFromUrl;
        pendingToken.current = null;
        if (trackedResolveTokenRef.current !== qrTokenFromUrl) {
          trackedResolveTokenRef.current = qrTokenFromUrl;
          void trackDineInQrResolved(buildDineInQrResolvedParams(data));
        }
        // After QR Resolve on non-landing pages (qrToken in query): restore GET Sessions
        if (data?.tableId && data?.sessionId && data?.storefrontId) {
          getSession(data.storefrontId, {
            tableId: data.tableId,
            sessionId: data.sessionId,
          })
            .then((sessionData) => {
              dispatch(setDineInSessionData(sessionData));
            })
            .catch(() => {
              /* keep QR resolve data; session can be created on interaction */
            });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          dispatch(clearQrFlow());
          hasRehydratedForToken.current = null;
          if (trackedResolveTokenRef.current !== qrTokenFromUrl) {
            trackedResolveTokenRef.current = qrTokenFromUrl;
            void trackDineInQrResolveFailed(classifyQrResolveError(err));
          }
        }
        pendingToken.current = null;
      });
    return () => {
      cancelled = true;
      // Don't clear pendingToken – let the in-flight fetch finish and apply result
    };
  }, [
    qrTokenFromUrl,
    tokenFromPath,
    dispatch,
    qrTokenInRedux,
    qrResolveDataInRedux,
    showToast,
    lang.dineInSessionEnded,
    trackDineInQrResolved,
    trackDineInQrResolveFailed,
  ]);

  return null;
}

interface QRProviderProps {
  children: React.ReactNode;
}

/**
 * Detects if we are in QR flow and on desktop; shows "Continue on your phone" placeholder.
 */
function QRFlowMobileGuard({ children }: { children: React.ReactNode }) {
  const qrToken = useQRToken();
  const isMobile = useIsMobile();

  // Only show placeholder if we have a QR token (identifies QR flow) AND we are NOT on mobile.
  if (qrToken && !isMobile) {
    return <QRMobilePlaceholder />;
  }

  return <>{children}</>;
}

/**
 * QR flow provider (same pattern as AddressProvider).
 * No context; token and resolve data live in Redux (qrFlowSlice).
 * Rehydrates from URL on load/refresh. useQRToken() exposes token to consumers.
 */
export const QRProvider: React.FC<QRProviderProps> = ({ children }) => (
  <>
    <QrFlowRefreshHandler />
    <QrTicketWsRunner />
    <QRFlowMobileGuard>{children}</QRFlowMobileGuard>
  </>
);

export default QRProvider;

/**
 * Token for QR/dine-in flow.
 * Prefers URL (path /t/[token] or query ?qrToken=), then Redux.
 */
export function useQRToken(): string | null {
  const { qrTokenFromUrl } = useQrTokenFromUrl();
  const qrTokenFromRedux = useSelector(selectQrToken);
  return qrTokenFromUrl ?? qrTokenFromRedux ?? null;
}
