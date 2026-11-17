'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectDineInSessionData,
  selectIsQrFlowActive,
  selectQrResolveData,
  selectSessionId,
} from '@redux/slices/qrFlowSlice';
import {
  recordTicketWsIgnoredMessage,
  recordTicketWsMessage,
  recordTicketWsParseError,
  recordTicketWsRefetchTriggered,
  setTicketWsContext,
  setTicketWsError,
  setTicketWsRetryCount,
  setTicketWsStatus,
  type TicketWsEventEnvelope,
} from '@redux/slices/qrEvents';
import { getSession } from '@services/sessionService';
import { ticketWebSocketManager, type TicketWsLifecycleStatus, type TicketWsEvent } from '@services/ticketWebSocketManager';
import { setDineInSessionData } from '@redux/slices/qrFlowSlice';
import { getCookie } from '@lib/cookie';

const REFETCH_MIN_INTERVAL_MS = 1000;
const REFETCH_MAX_WAIT_MS = 3000;

function normalizeStatus(s: TicketWsLifecycleStatus): 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error' {
  if (s === 'idle') return 'idle';
  if (s === 'connecting') return 'connecting';
  if (s === 'connected') return 'connected';
  if (s === 'reconnecting') return 'reconnecting';
  if (s === 'disconnected') return 'disconnected';
  return 'error';
}

function isTicketEventType(type?: string): boolean {
  if (!type) return false;
  return (
    type === 'TICKET_CREATED' ||
    type === 'TICKET_SUBMITTED' ||
    type === 'TICKET_STATUS_UPDATED' ||
    type === 'TICKET_CANCELLED' ||
    type === 'TICKET_COMPLETED'
  );
}

/**
 * QRFlow WebSocket runner:
 * - Starts only after first successful GET session(ticket) (i.e. dineInSessionData exists)
 * - Keeps one WS connection for the QR session and survives page navigation
 * - Coalesces bursts of events into throttled getSession() refetches
 */
export default function QrTicketWsRunner() {
  const dispatch = useDispatch();
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const qrResolveData = useSelector(selectQrResolveData);
  const dineInSessionData = useSelector(selectDineInSessionData);
  const sessionId = useSelector(selectSessionId);
  const storefrontId = (qrResolveData?.storefrontId ? String(qrResolveData.storefrontId) : '').trim() || null;
  const hasSessionLoaded = Boolean(dineInSessionData);
  const hasEverConnectedRef = React.useRef(false);

  // For safety: avoid dispatching updates after unmount.
  const mountedRef = React.useRef(true);
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Burst-coalesced refetch mechanism (no matter how many events arrive).
  const lastRefetchAtRef = React.useRef<number>(0);
  const refetchTimerRef = React.useRef<number | null>(null);
  const inFlightRefetchRef = React.useRef<Promise<unknown> | null>(null);
  const dirtySinceRef = React.useRef<number | null>(null);
  const pendingContextRef = React.useRef<{ storefrontId: string | null; sessionId: string | null }>({ storefrontId: null, sessionId: null });

  const clearRefetchTimer = React.useCallback(() => {
    if (refetchTimerRef.current != null) {
      window.clearTimeout(refetchTimerRef.current);
      refetchTimerRef.current = null;
    }
  }, []);

  const scheduleRefetch = React.useCallback(() => {
    if (!storefrontId || !sessionId) return;

    const now = Date.now();
    if (dirtySinceRef.current == null) dirtySinceRef.current = now;

    // If a refetch is already scheduled, don't schedule another.
    if (refetchTimerRef.current != null) return;

    const elapsedSinceLast = now - (lastRefetchAtRef.current || 0);
    const minDelay = Math.max(0, REFETCH_MIN_INTERVAL_MS - elapsedSinceLast);

    // Ensure we don't wait too long when events keep streaming.
    const maxWait = Math.max(0, REFETCH_MAX_WAIT_MS - (now - (dirtySinceRef.current || now)));
    const delay = Math.min(minDelay, maxWait);

    refetchTimerRef.current = window.setTimeout(async () => {
      refetchTimerRef.current = null;
      if (!mountedRef.current) return;
      if (!storefrontId || !sessionId) return;

      // If context changed since scheduling, abort this attempt.
      if (
        pendingContextRef.current.storefrontId !== storefrontId ||
        pendingContextRef.current.sessionId !== sessionId
      ) {
        return;
      }

      // If there is an in-flight refetch, wait for it; then reschedule.
      if (inFlightRefetchRef.current) {
        try {
          await inFlightRefetchRef.current;
        } catch {
          // ignore
        }
        scheduleRefetch();
        return;
      }

      lastRefetchAtRef.current = Date.now();
      dirtySinceRef.current = null;
      dispatch(recordTicketWsRefetchTriggered());

      const p = (async () => {
        try {
          const sessionData = await getSession(storefrontId, { sessionId });
          if (!mountedRef.current) return;
          dispatch(setDineInSessionData(sessionData));
        } catch (err) {
          if (!mountedRef.current) return;
          // Keep UI stable; WS continues to run and may recover.
          dispatch(setTicketWsError((err as Error)?.message || 'Failed to refresh session'));
        }
      })();

      inFlightRefetchRef.current = p;
      try {
        await p;
      } finally {
        inFlightRefetchRef.current = null;
      }
    }, delay);
  }, [dispatch, sessionId, storefrontId]);

  // Maintain and connect/disconnect WS based on QR flow lifecycle.
  const activeConnectKeyRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    // Update slice context for debugging/visibility.
    dispatch(setTicketWsContext({ storefrontId, sessionId: sessionId || null }));
    pendingContextRef.current = { storefrontId, sessionId: sessionId || null };

    /**
     * Desired lifecycle:
     * - Start WS only after first successful GET session (hasSessionLoaded).
     * - Once started, keep it alive as long as QR flow is active and session context exists,
     *   even if dineInSessionData momentarily becomes null during UI transitions.
     * - Disconnect only when QR flow truly ends (e.g. after payment clears QR flow / token removed),
     *   or session context is gone.
     */
    const canStart = Boolean(isQrFlowActive && storefrontId && sessionId && hasSessionLoaded);
    const shouldKeepAlive = Boolean(isQrFlowActive && storefrontId && sessionId && (hasEverConnectedRef.current || hasSessionLoaded));
    const connectKey: string | null = shouldKeepAlive ? `${storefrontId}::${sessionId}` : null;

    if (!shouldKeepAlive) {
      activeConnectKeyRef.current = null;
      clearRefetchTimer();
      inFlightRefetchRef.current = null;
      dirtySinceRef.current = null;
      // Now we *do* disconnect here, but only when QR flow/session context is truly gone.
      ticketWebSocketManager.disconnect('qrflow-ended-or-context-missing');
      dispatch(setTicketWsStatus({ status: 'disconnected' }));
      dispatch(setTicketWsRetryCount(0));
      dispatch(setTicketWsError(null));
      return;
    }

    // Don’t start until first session GET is loaded.
    if (!hasEverConnectedRef.current && !canStart) {
      return;
    }

    // Same context already active: do NOT disconnect/reconnect on every session state update.
    if (connectKey && activeConnectKeyRef.current === connectKey) {
      return;
    }
    activeConnectKeyRef.current = connectKey;
    hasEverConnectedRef.current = true;
    const sf = storefrontId as string;
    const sid = sessionId as string;
    const authPayload = getCookie('token');

    const callbacks = {
      onStatus: (status: TicketWsLifecycleStatus, meta?: { retryCount?: number; reason?: string }) => {
        if (!mountedRef.current) return;
        // Quick visibility in DevTools for connectivity debugging.
        console.log('[TicketWS]', status, meta ?? {});
        dispatch(setTicketWsStatus({ status: normalizeStatus(status) }));
        if (typeof meta?.retryCount === 'number') dispatch(setTicketWsRetryCount(meta.retryCount));
        if ((status === 'error' || status === 'disconnected') && meta?.reason) dispatch(setTicketWsError(meta.reason));
      },
      onRawMessage: () => {
        // no-op: we don't store raw payloads to avoid memory growth
      },
      onParseError: () => {
        if (!mountedRef.current) return;
        dispatch(recordTicketWsParseError());
      },
      onEvent: (evt: TicketWsEvent) => {
        if (!mountedRef.current) return;

        const event = (evt ?? {}) as TicketWsEventEnvelope;
        const eventType = typeof event?.type === 'string' ? event.type : null;

        // Visibility: confirm events are arriving.
        console.log('[TicketWS] event', eventType ?? 'UNKNOWN', event);

        dispatch(recordTicketWsMessage({ eventType, event }));

        // Ignore unknown event types safely (future-proof).
        if (!isTicketEventType(eventType || undefined)) {
          dispatch(recordTicketWsIgnoredMessage());
          return;
        }

        // Hard filter: must match current sessionId if provided by backend.
        if (event?.sessionId && sessionId && String(event.sessionId) !== String(sessionId)) {
          dispatch(recordTicketWsIgnoredMessage());
          return;
        }

        // Filter by storefrontId if present.
        if (event?.storefrontId && storefrontId && String(event.storefrontId) !== String(storefrontId)) {
          dispatch(recordTicketWsIgnoredMessage());
          return;
        }

        // Coalesce bursts: schedule session refetch (throttled).
        scheduleRefetch();
      },
    };

    ticketWebSocketManager.connect({
      storefrontId: sf,
      sessionId: sid,
      authPayload,
      callbacks,
    });

    return () => {
      clearRefetchTimer();
    };
  }, [dispatch, isQrFlowActive, storefrontId, sessionId, hasSessionLoaded, clearRefetchTimer, scheduleRefetch]);

  return null;
}

