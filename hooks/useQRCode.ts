'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setQrFlowActive,
  setQrResolveData,
  clearQrFlow,
  selectQrResolveData,
  selectQrToken,
} from '@redux/slices/qrFlowSlice';
import { RootState } from '@redux/store';
import { fetchQrResolve } from '@services/qrResolveService';
import type { QrResolveData } from '@redux/slices/qrFlowSlice';
import useAnalytics from '@hooks/useAnalytics';
import {
  buildDineInQrResolvedParams,
  classifyQrResolveError,
} from '@lib/analytics/dineInAnalytics';

export interface UseQRCodeResult {
  data: QrResolveData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch QR resolve details and store in Redux.
 * Call on the first page of QR flow (/t/[token]).
 */
export function useQRCode(token: string | undefined): UseQRCodeResult {
  const dispatch = useDispatch();
  const data = useSelector((state: RootState) => selectQrResolveData(state));
  const qrTokenInRedux = useSelector((state: RootState) => selectQrToken(state));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { trackDineInQrResolved, trackDineInQrResolveFailed } = useAnalytics();
  const trackedResolveTokenRef = useRef<string | null>(null);

  const trackResolveSuccess = useCallback(
    (resolveData: QrResolveData, activeToken: string) => {
      if (trackedResolveTokenRef.current === activeToken) return;
      trackedResolveTokenRef.current = activeToken;
      void trackDineInQrResolved(buildDineInQrResolvedParams(resolveData));
    },
    [trackDineInQrResolved],
  );

  const trackResolveFailure = useCallback(
    (err: unknown, activeToken: string) => {
      if (trackedResolveTokenRef.current === activeToken) return;
      trackedResolveTokenRef.current = activeToken;
      void trackDineInQrResolveFailed(classifyQrResolveError(err));
    },
    [trackDineInQrResolveFailed],
  );

  const executeFetch = useCallback(async () => {
    if (!token?.trim()) {
      dispatch(clearQrFlow());
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const resolveData = await fetchQrResolve(token);
      dispatch(setQrResolveData(resolveData));
      dispatch(setQrFlowActive({ token }));
      trackResolveSuccess(resolveData, token);
    } catch (err) {
      dispatch(clearQrFlow());
      dispatch(setQrResolveData(null));
      trackResolveFailure(err, token);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [token, dispatch, trackResolveSuccess, trackResolveFailure]);

  useEffect(() => {
    if (!token?.trim()) {
      dispatch(clearQrFlow());
      setLoading(false);
      setError(null);
      trackedResolveTokenRef.current = null;
      return;
    }

    // Already have resolve data for this token in Redux – skip API call
    if (qrTokenInRedux === token && data) {
      dispatch(setQrFlowActive({ token }));
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchQrResolve(token)
      .then((resolveData) => {
        if (cancelled) return;
        dispatch(setQrResolveData(resolveData));
        dispatch(setQrFlowActive({ token }));
        trackResolveSuccess(resolveData, token);
      })
      .catch((err) => {
        if (cancelled) return;
        dispatch(clearQrFlow());
        dispatch(setQrResolveData(null));
        trackResolveFailure(err, token);
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, dispatch, qrTokenInRedux, data, trackResolveSuccess, trackResolveFailure]);

  return {
    data,
    loading,
    error,
    refetch: executeFetch,
  };
}
