export type TicketWsLifecycleStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error';

export type TicketWsEvent = {
  type?: string;
  ticketId?: string;
  sessionId?: string;
  storefrontId?: string;
  [key: string]: unknown;
};

export type TicketWsCallbacks = {
  onStatus?: (status: TicketWsLifecycleStatus, meta?: { retryCount?: number; reason?: string }) => void;
  onEvent?: (event: TicketWsEvent) => void;
  onRawMessage?: (raw: string) => void;
  onParseError?: (raw: string, error: unknown) => void;
};

export type TicketWsConnectArgs = {
  storefrontId: string;
  sessionId?: string | null;
  /**
   * Browser WebSocket handshakes cannot set custom headers. Per docs, pass the
   * same string your stack would otherwise send as Authorization, via query.
   *
   * The backend supports:
   * - token: URL-encoded JSON string
   * - auth: base64-encoded JSON string (for large payloads)
   *
   * In our app, this may be a guest token / access token string depending on platform.
   */
  authPayload?: string | null;
  /** Optional production display filter (docs: displayId) */
  displayId?: string | null;
  callbacks?: TicketWsCallbacks;
};

const TICKET_WS_PATH = '/v1/storefronts/tickets/ws';
/** Fallback host when NEXT_PUBLIC_TICKET_WS_ORIGIN is unset (no scheme). */
const DEFAULT_TICKET_WS_HOST = '178.156.170.231:8006';

/**
 * HTTPS pages must use wss:// or the browser blocks the connection (mixed content).
 * HTTP (e.g. localhost) may use ws://.
 */
function getWsScheme(): 'ws' | 'wss' {
  if (typeof window !== 'undefined') {
    return window.location.protocol === 'https:' ? 'wss' : 'ws';
  }
  return process.env.NODE_ENV === 'production' ? 'wss' : 'ws';
}

/** Strip ws/wss and trailing slashes; returns host[:port] only. */
function parseWsHost(originOrHost: string): string {
  return originOrHost.trim().replace(/^wss?:\/\//i, '').replace(/\/+$/, '');
}

/**
 * WebSocket origin (scheme + host + port, no path).
 * Set NEXT_PUBLIC_TICKET_WS_ORIGIN to `wss://your-host:port` or `your-host:port` in production.
 */
export function getTicketWsOrigin(): string {
  const scheme = getWsScheme();
  const configured = process.env.NEXT_PUBLIC_TICKET_WS_ORIGIN?.trim();
  const host = configured ? parseWsHost(configured) : DEFAULT_TICKET_WS_HOST;
  return `${scheme}://${host}`;
}

function buildTicketWsUrl(args: { storefrontId: string; authPayload?: string | null; displayId?: string | null }): string {
  const wsOrigin = getTicketWsOrigin();
  const basePath = TICKET_WS_PATH;

  const params = new URLSearchParams();
  params.set('storefrontId', String(args.storefrontId));

  const displayId = (args.displayId ? String(args.displayId) : '').trim();
  if (displayId) params.set('displayId', displayId);

  const authPayload = (args.authPayload ? String(args.authPayload) : '').trim();
  if (authPayload) {
    // Browser WebSocket cannot send Authorization headers, so send token via query param.
    // URLSearchParams will encode automatically.
    params.set('token', authPayload);
  }

  return `${wsOrigin}${basePath}?${params.toString()}`;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof WebSocket !== 'undefined';
}

function redactWsUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.searchParams.has('token')) u.searchParams.set('token', '[REDACTED]');
    if (u.searchParams.has('auth')) u.searchParams.set('auth', '[REDACTED]');
    return u.toString();
  } catch {
    return url;
  }
}

export class TicketWebSocketManager {
  private ws: WebSocket | null = null;
  private currentStorefrontId: string | null = null;
  private currentSessionId: string | null = null;
  private currentAuthPayload: string | null = null;
  private currentDisplayId: string | null = null;
  private callbacks: TicketWsCallbacks | null = null;
  private status: TicketWsLifecycleStatus = 'idle';

  private retryCount = 0;
  private reconnectTimer: number | null = null;
  private intentionalClose = false;

  private lastConnectKey: string | null = null;
  private lastUrl: string | null = null;
  /** Initial connect + this many reconnects before giving up (was 12). */
  private readonly maxReconnectAttempts = 3;
  private hasOpenedOnce = false;

  connect(args: TicketWsConnectArgs) {
    if (!isBrowser()) return;

    const storefrontId = String(args.storefrontId || '').trim();
    if (!storefrontId) return;

    const sessionId = args.sessionId ? String(args.sessionId).trim() : null;
    const authPayload = args.authPayload ? String(args.authPayload).trim() : null;
    const displayId = args.displayId ? String(args.displayId).trim() : null;
    const connectKey = `${storefrontId}::${sessionId ?? ''}::${displayId ?? ''}::${authPayload ? 'auth' : ''}`;

    // If already connected/connecting for same context, no-op.
    if (this.ws && (this.status === 'connected' || this.status === 'connecting' || this.status === 'reconnecting')) {
      if (this.lastConnectKey === connectKey) return;
      // Context changed: replace connection.
      this.disconnect('context-changed');
    }

    this.callbacks = args.callbacks ?? null;
    this.currentStorefrontId = storefrontId;
    this.currentSessionId = sessionId;
    this.currentAuthPayload = authPayload;
    this.currentDisplayId = displayId;
    this.lastConnectKey = connectKey;
    this.intentionalClose = false;
    this.lastUrl = null;
    this.hasOpenedOnce = false;

    this.clearReconnectTimer();
    this.openSocket('connect');
  }

  disconnect(reason: string = 'manual') {
    this.intentionalClose = true;
    this.clearReconnectTimer();
    this.setStatus('disconnected', { reason });
    try {
      if (this.ws) {
        const w = this.ws;
        this.ws = null;
        // Avoid triggering reconnect on close for intentional close.
        w.onopen = null;
        w.onmessage = null;
        w.onerror = null;
        w.onclose = null;
        try {
          w.close(1000, reason);
        } catch {
          // ignore
        }
      }
    } finally {
      this.ws = null;
      this.retryCount = 0;
      this.lastUrl = null;
    }
  }

  getContext() {
    return {
      storefrontId: this.currentStorefrontId,
      sessionId: this.currentSessionId,
      displayId: this.currentDisplayId,
      hasAuthPayload: Boolean(this.currentAuthPayload),
      status: this.status,
    };
  }

  private openSocket(trigger: 'connect' | 'reconnect') {
    const storefrontId = this.currentStorefrontId;
    if (!storefrontId || !isBrowser()) return;

    const url = buildTicketWsUrl({
      storefrontId,
      authPayload: this.currentAuthPayload,
      displayId: this.currentDisplayId,
    });
    this.lastUrl = url;

    console.log('[TicketWS]', trigger, redactWsUrl(url));
    this.setStatus(trigger === 'reconnect' ? 'reconnecting' : 'connecting', { retryCount: this.retryCount });

    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch {
      const mixedContent =
        typeof window !== 'undefined' &&
        window.location.protocol === 'https:' &&
        url.startsWith('ws://');
      const reason = mixedContent
        ? 'ws-constructor-failed:mixed-content-use-wss'
        : 'ws-constructor-failed';
      this.setStatus('error', { reason });
      if (!mixedContent) {
        this.scheduleReconnect('constructor-failed');
      }
      return;
    }

    this.ws = ws;

    ws.onopen = () => {
      this.retryCount = 0;
      this.hasOpenedOnce = true;
      console.log('[TicketWS]', 'open');
      this.setStatus('connected');
    };

    ws.onmessage = (event) => {
      const raw = typeof event?.data === 'string' ? event.data : '';
      if (raw && this.callbacks?.onRawMessage) this.callbacks.onRawMessage(raw);

      if (!raw) return;
      let parsed: TicketWsEvent | null = null;
      try {
        parsed = JSON.parse(raw) as TicketWsEvent;
      } catch (e) {
        if (this.callbacks?.onParseError) this.callbacks.onParseError(raw, e);
        return;
      }
      if (parsed && typeof parsed === 'object') {
        this.callbacks?.onEvent?.(parsed);
      }
    };

    ws.onerror = () => {
      // Browsers do not provide detailed errors. We'll rely on close to reconnect.
      console.log('[TicketWS]', 'error');
      this.setStatus('error', { reason: `ws-error:${this.lastUrl ?? ''}`.trim() });
    };

    ws.onclose = (evt) => {
      const code = typeof evt?.code === 'number' ? evt.code : 0;
      const reason = typeof evt?.reason === 'string' ? evt.reason : '';

      // If socket was replaced, ignore.
      if (this.ws !== ws) return;

      this.ws = null;
      if (this.intentionalClose) {
        console.log('[TicketWS]', 'close:intentional', { code, reason });
        this.setStatus('disconnected', { reason: reason || 'intentional' });
        return;
      }

      // Normal closures (1000) could still happen on server restarts; treat as reconnectable.
      console.log('[TicketWS]', 'close', { code, reason });
      this.setStatus('disconnected', { reason: `closed:${code}${reason ? `:${reason}` : ''}:${this.lastUrl ?? ''}`.trim() });

      // Never connected (e.g. TLS/wss unreachable): stop after a few tries, don't spin 12x.
      if (!this.hasOpenedOnce && this.retryCount >= this.maxReconnectAttempts) {
        this.setStatus('error', {
          retryCount: this.retryCount,
          reason: `max-retries-without-open:close:${code}`,
        });
        return;
      }

      this.scheduleReconnect(`close:${code}`);
    };
  }

  private scheduleReconnect(reason: string) {
    if (this.intentionalClose) return;
    if (!this.currentStorefrontId) return;
    if (!isBrowser()) return;
    if (this.reconnectTimer != null) return;

    this.retryCount += 1;
    if (this.retryCount > this.maxReconnectAttempts) {
      this.setStatus('error', { retryCount: this.retryCount, reason: `max-retries:${reason}:${this.lastUrl ?? ''}`.trim() });
      return;
    }
    const delay = this.computeBackoffMs(this.retryCount);
    this.setStatus('reconnecting', { retryCount: this.retryCount, reason });

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      if (this.intentionalClose) return;
      this.openSocket('reconnect');
    }, delay);
  }

  private computeBackoffMs(retry: number): number {
    // 1s, 2s, 5s (with small jitter) — matches maxReconnectAttempts = 3
    const steps = [1000, 2000, 5000];
    const base = steps[Math.min(steps.length - 1, Math.max(0, retry - 1))] ?? 10000;
    const jitter = Math.floor(Math.random() * 250); // 0-250ms
    return base + jitter;
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer != null && isBrowser()) {
      window.clearTimeout(this.reconnectTimer);
    }
    this.reconnectTimer = null;
  }

  private setStatus(status: TicketWsLifecycleStatus, meta?: { retryCount?: number; reason?: string }) {
    this.status = status;
    this.callbacks?.onStatus?.(status, meta);
  }
}

export const ticketWebSocketManager = new TicketWebSocketManager();

