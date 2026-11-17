import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isActiveProductCountStatus, ticketStatusConfig } from '@config/ticketStatus.config';
import { RootState } from '../store';
import type { DineInSessionData } from '@services/sessionService';

/** Session ticket item from GET sessions (re-export for convenience) */
export type { SessionTicketItem } from '@services/sessionService';

/** Full API response from /qr/resolve */
export interface QrResolveData {
  tableId?: string;
  tableNumber?: string;
  displayName?: string;
  spaceId?: string;
  spaceName?: string;
  storefrontSlug?: string;
  storefrontId?: string;
  storefrontName?: string;
  qrCodeIsActive?: boolean;
  sessionId?: string;
  serviceType?: string;
  requireLoginBeforeOrder?: boolean;
  /** When false and no sessionId, POST sessions is called to create a new dine-in session. */
  autoCreateSession?: boolean;
  /** When true, user is already a participant in the session; when false with sessionId, table PIN popup is shown. */
  isParticipant?: boolean;
  restaurant?: {
    name?: string;
    config?: { accountType?: string };
    ratings?: { average?: number; totalReview?: number };
  };
  [key: string]: unknown;
}

export interface QrFlowState {
  /** When true, user is in QR / dine-in flow. Control UI (e.g. Figma) based on this. */
  qrFlow: boolean;
  /** Token from QR URL (/t/{token}). Used with qrFlow to show dine-in UI. */
  qrToken: string | null;
  /** Table number for dine-in (e.g. "7"), set when entering QR flow. */
  tableNumber: string | null;
  /** Full response from /qr/resolve API. */
  qrResolveData: QrResolveData | null;
  /** Session data from GET /storefronts/sessions (set after Explore Menu). */
  dineInSessionData: DineInSessionData | null;
  /** Table details from GET /storefronts/tables?tableId= (used for server name in QR checkout). */
  tableDetails: import('@services/tableService').StorefrontTable | null;
  /** Ticket-level order instruction (first DRAFT ticket, else first ticket). */
  ticketOrderInstruction: string;
}

const initialState: QrFlowState = {
  qrFlow: false,
  qrToken: null,
  tableNumber: null,
  qrResolveData: null,
  dineInSessionData: null,
  tableDetails: null,
  ticketOrderInstruction: '',
};

const qrFlowSlice = createSlice({
  name: 'qrFlow',
  initialState,
  reducers: {
    setQrFlow: (state, action: PayloadAction<boolean>) => {
      state.qrFlow = action.payload;
    },
    setQrToken: (state, action: PayloadAction<string | null>) => {
      state.qrToken = action.payload;
    },
    /** Set when user enters QR flow. Payload: token (required), tableNumber (optional). */
    setQrFlowActive: (
      state,
      action: PayloadAction<{ token: string; tableNumber?: string }>
    ) => {
      const { token, tableNumber } = action.payload;
      state.qrFlow = true;
      state.qrToken = token;
      state.tableNumber = tableNumber ?? null;
    },
    /** Store full API response from /qr/resolve. Also sets tableNumber from data. */
    setQrResolveData: (state, action: PayloadAction<QrResolveData | null>) => {
      state.qrResolveData = action.payload;
      state.tableNumber = action.payload
        ? (action.payload.tableNumber ?? action.payload.displayName ?? null)
        : null;
    },
    /** Patch only the sessionId inside qrResolveData (keeps other fields intact). */
    setQrResolveSessionId: (state, action: PayloadAction<string | null>) => {
      if (!state.qrResolveData) state.qrResolveData = {};
      state.qrResolveData.sessionId = action.payload ?? undefined;
    },
    /** Clear QR flow (e.g. after checkout or when leaving dine-in). */
    clearQrFlow: (state) => {
      state.qrFlow = false;
      state.qrToken = null;
      state.tableNumber = null;
      state.qrResolveData = null;
      state.dineInSessionData = null;
      state.tableDetails = null;
      state.ticketOrderInstruction = '';
    },
    /** Store table details from GET /storefronts/tables?tableId= */
    setTableDetails: (
      state,
      action: PayloadAction<import('@services/tableService').StorefrontTable | null>
    ) => {
      state.tableDetails = action.payload;
    },
    /** Store session data from GET /storefronts/sessions. */
    setDineInSessionData: (state, action: PayloadAction<DineInSessionData | null>) => {
      state.dineInSessionData = action.payload;

      // Keep a dedicated copy of ticket orderInstruction for easy access (and persistence).
      const tickets = (
        action.payload?.data?.items?.[0]?.tickets ??
        action.payload?.items?.[0]?.tickets ??
        (action.payload as unknown as { tickets?: Array<{ status?: string; orderInstruction?: unknown }> })?.tickets ??
        []
      ) as Array<{ status?: unknown; orderInstruction?: unknown }>;

      const chosen =
        tickets.find((t) => !t?.status || String(t.status).toUpperCase() === ticketStatusConfig.draft) ??
        tickets[0];

      state.ticketOrderInstruction =
        typeof chosen?.orderInstruction === 'string' ? chosen.orderInstruction : '';
    },
  },
});

export const { setQrFlow, setQrToken, setQrFlowActive, setQrResolveData, setQrResolveSessionId, setDineInSessionData, setTableDetails, clearQrFlow } = qrFlowSlice.actions;

export const selectQrFlow = (state: RootState): boolean => state.qrFlow.qrFlow;
export const selectQrToken = (state: RootState): string | null => state.qrFlow.qrToken;
export const selectQrFlowTableNumber = (state: RootState): string | null =>
  state.qrFlow.tableNumber ??
  state.qrFlow.qrResolveData?.tableNumber ??
  state.qrFlow.qrResolveData?.displayName ??
  null;
/** True when we are in QR flow and have a token (use to control dine-in / Figma UI). */
export const selectIsQrFlowActive = (state: RootState): boolean =>
  Boolean(state.qrFlow.qrFlow && state.qrFlow.qrToken);
export const selectQrResolveData = (state: RootState): QrResolveData | null =>
  state.qrFlow.qrResolveData;
export const selectDineInSessionData = (state: RootState): DineInSessionData | null =>
  state.qrFlow.dineInSessionData;
export const selectTableDetails = (state: RootState): import('@services/tableService').StorefrontTable | null =>
  state.qrFlow.tableDetails;

/** Session ID for ticket API - from top-level or data.items[0] / items[0], then qrResolveData.sessionId */
export const selectSessionId = (state: RootState): string | null => {
  const d = state.qrFlow.dineInSessionData as { id?: string; sessionId?: string; data?: { items?: Array<{ id?: string; sessionId?: string }> }; items?: Array<{ id?: string; sessionId?: string }> } | null;
  const fromSession =
    d?.sessionId ?? d?.data?.items?.[0]?.sessionId ?? d?.items?.[0]?.sessionId
    ?? d?.id ?? d?.data?.items?.[0]?.id ?? d?.items?.[0]?.id ?? null;
  if (fromSession) return fromSession;
  return state.qrFlow.qrResolveData?.sessionId ?? null;
};

/** Table ID for getSession refetch - from top-level or data.items[0] / items[0] */
export const selectSessionTableId = (state: RootState): string | null => {
  const d = state.qrFlow.dineInSessionData as { tableId?: string; data?: { items?: Array<{ tableId?: string }> }; items?: Array<{ tableId?: string }> } | null;
  if (!d) return null;
  return d.tableId ?? d.data?.items?.[0]?.tableId ?? d.items?.[0]?.tableId ?? null;
};

/** Table PIN from GET sessions: top-level, data.items[0].tablePin, or items[0].tablePin */
export const selectSessionTablePin = (state: RootState): string | null => {
  const d = state.qrFlow.dineInSessionData as { tablePin?: string; data?: { items?: Array<{ tablePin?: string }> }; items?: Array<{ tablePin?: string }> } | null;
  if (!d) return null;
  const pin = d.tablePin ?? d.data?.items?.[0]?.tablePin ?? d.items?.[0]?.tablePin ?? null;
  return pin ?? null;
};

/** True when table PIN UI should be shown: sessionId present and isParticipant true (reuse in ActiveOrderTileQR, MobileCartSummary, etc.) */
export const selectShouldShowTablePin = (state: RootState): boolean => {
  const qr = state.qrFlow.qrResolveData;
  const sessionId = qr?.sessionId;
  const isParticipant = qr?.isParticipant === true;
  return Boolean(sessionId) && isParticipant;
};

/** True when table PIN popup is needed: sessionId present and isParticipant false. When true, header should NOT show PIN (vice versa). */
export const selectIsTablePinPopupNeeded = (state: RootState): boolean => {
  const qr = state.qrFlow.qrResolveData;
  return Boolean(qr?.sessionId) && qr?.isParticipant === false;
};


/** Ticket items from GET sessions: only items from tickets with status DRAFT (for QR flow cart display) */
export const selectSessionTicketItems = (state: RootState): import('@services/sessionService').SessionTicketItem[] => {
  const tickets = selectSessionTickets(state);
  if (tickets.length === 0) return [];
  const draftTickets = tickets.filter((t) => {
    const status = t.status?.toUpperCase?.();
    return !status || status === ticketStatusConfig.draft;
  });
  return draftTickets.flatMap((t) => t.items ?? []);
};

/** Item count for DRAFT ticket(s) from GET sessions (for QR checkout summary). */
export const selectDraftTicketItemCount = (state: RootState): number =>
  selectSessionTicketItems(state).length;

/** Sum of itemCount across all DRAFT tickets (preferred for QR badge). */
export const selectDraftTicketsItemCountSum = (state: RootState): number => {
  const tickets = selectSessionTickets(state);
  if (!tickets || tickets.length === 0) return 0;
  const sum = tickets.reduce((acc, t) => {
    const status = String(t?.status ?? "").toUpperCase();
    if (status && status !== ticketStatusConfig.draft) return acc;
    return acc + Number(t?.itemCount ?? 0);
  }, 0);
  return Number.isFinite(sum) ? sum : 0;
};

/** Ticket with optional status (DRAFT, SENT, etc.) from sessions API */
type SessionTicket = {
  id?: string;
  status?: string;
  /** Total item count for this ticket (from API: data.tickets[].itemCount) */
  itemCount?: number;
  /** When ticket was submitted (from data.items[0].tickets[].submittedAt) */
  submittedAt?: string | number | Date;
  items?: import('@services/sessionService').SessionTicketItem[];
  total?: import('@services/sessionService').SessionTotal;
};

/** All tickets from GET sessions: data.items[0].tickets (for Kitchen Status / multiple tickets) */
export const selectSessionTickets = (state: RootState): SessionTicket[] => {
  const d = state.qrFlow.dineInSessionData as {
    data?: { items?: Array<{ tickets?: Array<{ id?: string; status?: string; items?: unknown[]; total?: import('@services/sessionService').SessionTotal }> }> };
    items?: Array<{ tickets?: Array<{ id?: string; status?: string; items?: unknown[]; total?: import('@services/sessionService').SessionTotal }> }>;
    tickets?: Array<{ id?: string; status?: string; itemCount?: number; items?: unknown[]; total?: import('@services/sessionService').SessionTotal }>;
  } | null;
  if (!d) return [];
  const tickets =
    d.data?.items?.[0]?.tickets
    ?? d.items?.[0]?.tickets
    ?? (d.data as { tickets?: SessionTicket[] } | undefined)?.tickets
    ?? d.tickets;
  if (Array.isArray(tickets) && tickets.length > 0) {
    return tickets.map((t) => ({
      id: t?.id,
      status: (t as { status?: string }).status,
      itemCount: Number((t as { itemCount?: number }).itemCount ?? 0),
      submittedAt: (t as { submittedAt?: string | number | Date }).submittedAt,
      total: (t as { total?: import('@services/sessionService').SessionTotal }).total,
      items: Array.isArray(t?.items) ? (t.items as import('@services/sessionService').SessionTicketItem[]) : [],
    }));
  }
  // Fallback: single ticket shape (items under first ticket)
  const singleTicket =
    d.data?.items?.[0]?.tickets?.[0]
    ?? d.items?.[0]?.tickets?.[0]
    ?? (d.data as { tickets?: SessionTicket[] } | undefined)?.tickets?.[0]
    ?? (d as { tickets?: Array<{ items?: unknown[]; total?: import('@services/sessionService').SessionTotal }> }).tickets?.[0];
  const singleTicketItems = singleTicket?.items;
  if (Array.isArray(singleTicketItems) && singleTicketItems.length > 0) {
    return [{
      id: undefined,
      status: (singleTicket as { status?: string })?.status,
      submittedAt: (singleTicket as { submittedAt?: string | number | Date })?.submittedAt,
      total: (singleTicket as { total?: import('@services/sessionService').SessionTotal })?.total,
      items: singleTicketItems as import('@services/sessionService').SessionTicketItem[],
    }];
  }
  return [];
};

/**
 * Same condition as QrCheckoutOrderView `hasTickets`: SUBMITTED or PENDING_PAYMENT tickets with line items.
 * Empty qr-checkout placeholder uses false; kitchen / tip / pay bar uses true.
 */
export const selectQrCheckoutHasSubmittedOrderContent = (state: RootState): boolean => {
  const sessionTickets = selectSessionTickets(state);
  const visibleTickets = sessionTickets.filter((ticket) => {
    const status = ticket.status?.toUpperCase();
    return (
      status === ticketStatusConfig.submitted ||
      status === ticketStatusConfig.pendingPayment ||
      status === ticketStatusConfig.inProgress ||
      status === ticketStatusConfig.ready ||
      status === ticketStatusConfig.sentToKitchen ||
      status === ticketStatusConfig.preparing ||
      status === ticketStatusConfig.completed ||
      status === ticketStatusConfig.cancelled
    );
  });
  return (
    visibleTickets.length > 0 &&
    visibleTickets.some((t) => (t.items?.length ?? 0) > 0)
  );
};

/** First ticket id from GET sessions: first DRAFT ticket, else first ticket (for QR flow order instruction) */
export const selectTicketId = (state: RootState): string | null => {
  const tickets = selectSessionTickets(state);
  const draftFirst = tickets.find((t) => !t.status || t.status.toUpperCase() === ticketStatusConfig.draft);
  const ticket = draftFirst ?? tickets[0];
  return (ticket?.id && typeof ticket.id === 'string') ? ticket.id : null;
};

/** Ticket orderInstruction from GET sessions (stored alongside dineInSessionData). */
export const selectTicketOrderInstruction = (state: RootState): string =>
  state.qrFlow.ticketOrderInstruction ?? '';

/** Session summary from GET sessions (data.items[0].sessionSummary) for QR flow order summary */
export const selectSessionSummary = (state: RootState): import('@services/sessionService').SessionSummary | null => {
  const d = state.qrFlow.dineInSessionData as {
    sessionSummary?: import('@services/sessionService').SessionSummary;
    data?: { items?: Array<{ sessionSummary?: import('@services/sessionService').SessionSummary }> };
    items?: Array<{ sessionSummary?: import('@services/sessionService').SessionSummary }>;
  } | null;
  if (!d) return null;
  return d.sessionSummary ?? d.data?.items?.[0]?.sessionSummary ?? d.items?.[0]?.sessionSummary ?? null;
};

/** Session updatedAt from GET sessions (data.items[0].updatedAt) for QR checkout header time */
export const selectSessionUpdatedAt = (state: RootState): number | null => {
  const d = state.qrFlow.dineInSessionData as {
    updatedAt?: number;
    data?: { items?: Array<{ updatedAt?: number }> };
    items?: Array<{ updatedAt?: number }>;
  } | null;
  if (!d) return null;
  const updatedAt =
    d.updatedAt ??
    d.data?.items?.[0]?.updatedAt ??
    d.items?.[0]?.updatedAt ??
    null;
  return typeof updatedAt === 'number' ? updatedAt : null;
};

/** Product/cart item count from dine-in session: sum of itemCount for tickets with status SUBMITTED, PENDING_PAYMENT, IN_PROGRESS, READY (data.items[0].tickets[].itemCount). Reuse in OrdersContainer & ActiveOrderTileQR. */
export const selectDineInSessionProductCount = (state: RootState): number => {
  const d = state.qrFlow.dineInSessionData as {
    data?: { items?: Array<{ tickets?: Array<{ status?: string; itemCount?: number }> }> };
    items?: Array<{ tickets?: Array<{ status?: string; itemCount?: number }> }>;
    tickets?: Array<{ status?: string; itemCount?: number }>;
  } | null;
  if (!d) return 0;
  const tickets =
    d.data?.items?.[0]?.tickets
    ?? d.items?.[0]?.tickets
    ?? (d as { tickets?: Array<{ status?: string; itemCount?: number }> }).tickets
    ?? [];
  if (!Array.isArray(tickets)) return 0;
  return tickets.reduce((sum, t) => {
    if (isActiveProductCountStatus(t.status)) {
      return sum + (typeof t.itemCount === 'number' ? t.itemCount : 0);
    }
    return sum;
  }, 0);
};

export type KitchenTicketSummary = {
  totalItems: number;
  totalTickets: number;
  submittedItems: number;
  submittedTickets: number;
  sentToKitchenItems: number;
  sentToKitchenTickets: number;
  preparingItems: number;
  preparingTickets: number;
  readyItems: number;
  readyTickets: number;
};

/**
 * Kitchen summary for QR bottom bar.
 * Counts items/tickets for active kitchen statuses (and totals them).
 *
 * Note: backend commonly uses IN_PROGRESS (and sometimes PENDING_PAYMENT) while cooking;
 * we treat those as "cooking" for the QR summary bar.
 */
export const selectKitchenTicketSummary = (state: RootState): KitchenTicketSummary => {
  const tickets = selectSessionTickets(state);
  if (!tickets || tickets.length === 0) {
    return {
      totalItems: 0,
      totalTickets: 0,
      submittedItems: 0,
      submittedTickets: 0,
      sentToKitchenItems: 0,
      sentToKitchenTickets: 0,
      preparingItems: 0,
      preparingTickets: 0,
      readyItems: 0,
      readyTickets: 0,
    };
  }

  const summary = tickets.reduce<KitchenTicketSummary>(
    (acc, t) => {
      const status = String(t?.status ?? '').toUpperCase();
      const itemCountRaw = Number(
        // API provides itemCount; fallback to items length for safety
        (t as { itemCount?: number }).itemCount ?? (t.items?.length ?? 0)
      );
      const itemCount = Number.isFinite(itemCountRaw) ? itemCountRaw : 0;
      if (itemCount <= 0) return acc;

      // "Items being cooked" should reflect only SUBMITTED + IN_PROGRESS.
      if (status === ticketStatusConfig.submitted || status === ticketStatusConfig.inProgress) {
        acc.submittedItems += itemCount;
        acc.submittedTickets += 1;
      } else if (status === ticketStatusConfig.sentToKitchen) {
        acc.sentToKitchenItems += itemCount;
        acc.sentToKitchenTickets += 1;
      } else if (status === ticketStatusConfig.preparing) {
        acc.preparingItems += itemCount;
        acc.preparingTickets += 1;
      } else if (status === ticketStatusConfig.ready) {
        acc.readyItems += itemCount;
        acc.readyTickets += 1;
      }
      return acc;
    },
    {
      totalItems: 0,
      totalTickets: 0,
      submittedItems: 0,
      submittedTickets: 0,
      sentToKitchenItems: 0,
      sentToKitchenTickets: 0,
      preparingItems: 0,
      preparingTickets: 0,
      readyItems: 0,
      readyTickets: 0,
    }
  );

  summary.totalItems =
    summary.submittedItems +
    summary.sentToKitchenItems +
    summary.preparingItems +
    summary.readyItems;
  summary.totalTickets =
    summary.submittedTickets +
    summary.sentToKitchenTickets +
    summary.preparingTickets +
    summary.readyTickets;
  return summary;
};
/** Applied offers from GET sessions draft ticket: tickets[].data.appliedOffers (same shape as cart data.appliedOffers) */
export const selectDraftTicketAppliedOffers = (state: RootState): import('@components/order/order.type').AppliedOffer[] => {
  const d = state.qrFlow.dineInSessionData as {
    data?: {
      appliedOffers?: import('@components/order/order.type').AppliedOffer[];
      items?: Array<{
        tickets?: Array<{
          status?: string;
          data?: { appliedOffers?: import('@components/order/order.type').AppliedOffer[] };
        }>;
      }>;
    };
    items?: Array<{
      tickets?: Array<{
        status?: string;
        data?: { appliedOffers?: import('@components/order/order.type').AppliedOffer[] };
      }>;
    }>;
    tickets?: Array<{
      status?: string;
      data?: { appliedOffers?: import('@components/order/order.type').AppliedOffer[] };
    }>;
    appliedOffers?: import('@components/order/order.type').AppliedOffer[];
  } | null;
  if (!d) return [];

  const tickets =
    d.data?.items?.[0]?.tickets
    ?? d.items?.[0]?.tickets
    ?? d.tickets
    ?? [];

  const draftTicket = Array.isArray(tickets)
    ? tickets.find((t) => !t?.status || String(t.status).toUpperCase() === ticketStatusConfig.draft)
      ?? tickets[0]
    : null;

  const fromTicket = (draftTicket as { data?: { appliedOffers?: import('@components/order/order.type').AppliedOffer[] } } | undefined)
    ?.data?.appliedOffers;
  if (Array.isArray(fromTicket)) return fromTicket;

  const fromSessionData = d.data?.appliedOffers ?? d.appliedOffers;
  if (Array.isArray(fromSessionData)) return fromSessionData;

  return [];
};

/** Session total from GET sessions: first DRAFT ticket's total, else first ticket / top-level (for QR flow amounts) */
export const selectSessionTotal = (state: RootState): import('@services/sessionService').SessionTotal | null => {
  const d = state.qrFlow.dineInSessionData as {
    total?: import('@services/sessionService').SessionTotal;
    data?: { items?: Array<{ total?: import('@services/sessionService').SessionTotal; tickets?: Array<{ total?: import('@services/sessionService').SessionTotal }> }> };
    items?: Array<{ total?: import('@services/sessionService').SessionTotal; tickets?: Array<{ total?: import('@services/sessionService').SessionTotal }> }>;
    tickets?: Array<{ total?: import('@services/sessionService').SessionTotal }>;
  } | null;
  if (!d) return null;
  const tickets = selectSessionTickets(state);
  const draftFirst = tickets.find((t) => !t.status || (t.status as string).toUpperCase() === ticketStatusConfig.draft);
  if (draftFirst?.total) return draftFirst.total;
  return (
    d.data?.items?.[0]?.tickets?.[0]?.total ??
    d.items?.[0]?.tickets?.[0]?.total ??
    (d as { tickets?: Array<{ total?: import('@services/sessionService').SessionTotal }> }).tickets?.[0]?.total ??
    d.data?.items?.[0]?.total ??
    d.items?.[0]?.total ??
    d.total ??
    null
  );
};

export default qrFlowSlice.reducer;
