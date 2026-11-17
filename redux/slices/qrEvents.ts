import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export type QrTicketWsStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error';

export type TicketWsEventType =
  | 'TICKET_CREATED'
  | 'TICKET_SUBMITTED'
  | 'TICKET_STATUS_UPDATED'
  | 'TICKET_CANCELLED'
  | 'TICKET_COMPLETED'
  | string;

export interface TicketWsEventEnvelope {
  type?: TicketWsEventType;
  ticketId?: string;
  sessionId?: string;
  storefrontId?: string;
  timestamp?: number;
  updatedAt?: number;
  submittedAt?: number;
  [key: string]: unknown;
}

export interface QrEventsState {
  ticketWs: {
    status: QrTicketWsStatus;
    storefrontId: string | null;
    sessionId: string | null;
    connectedAt: number | null;
    disconnectedAt: number | null;
    retryCount: number;
    lastError: string | null;
    lastMessageAt: number | null;
    lastEventType: string | null;
    lastEvent: TicketWsEventEnvelope | null;
    messagesReceived: number;
    parseErrors: number;
    ignoredMessages: number;
    refetchesTriggered: number;
  };
}

const initialState: QrEventsState = {
  ticketWs: {
    status: 'idle',
    storefrontId: null,
    sessionId: null,
    connectedAt: null,
    disconnectedAt: null,
    retryCount: 0,
    lastError: null,
    lastMessageAt: null,
    lastEventType: null,
    lastEvent: null,
    messagesReceived: 0,
    parseErrors: 0,
    ignoredMessages: 0,
    refetchesTriggered: 0,
  },
};

const qrEventsSlice = createSlice({
  name: 'qrEvents',
  initialState,
  reducers: {
    setTicketWsContext: (
      state,
      action: PayloadAction<{ storefrontId: string | null; sessionId: string | null }>
    ) => {
      state.ticketWs.storefrontId = action.payload.storefrontId;
      state.ticketWs.sessionId = action.payload.sessionId;
    },
    setTicketWsStatus: (state, action: PayloadAction<{ status: QrTicketWsStatus; at?: number }>) => {
      state.ticketWs.status = action.payload.status;
      const at = typeof action.payload.at === 'number' ? action.payload.at : Date.now();
      if (action.payload.status === 'connected') state.ticketWs.connectedAt = at;
      if (action.payload.status === 'disconnected') state.ticketWs.disconnectedAt = at;
    },
    setTicketWsRetryCount: (state, action: PayloadAction<number>) => {
      state.ticketWs.retryCount = Math.max(0, Number(action.payload) || 0);
    },
    setTicketWsError: (state, action: PayloadAction<string | null>) => {
      state.ticketWs.lastError = action.payload;
      if (action.payload) state.ticketWs.status = 'error';
    },
    recordTicketWsMessage: (
      state,
      action: PayloadAction<{ at?: number; eventType?: string | null; event?: TicketWsEventEnvelope | null }>
    ) => {
      state.ticketWs.messagesReceived += 1;
      state.ticketWs.lastMessageAt = typeof action.payload.at === 'number' ? action.payload.at : Date.now();
      if (action.payload.eventType != null) state.ticketWs.lastEventType = action.payload.eventType;
      if (action.payload.event != null) state.ticketWs.lastEvent = action.payload.event;
    },
    recordTicketWsParseError: (state) => {
      state.ticketWs.parseErrors += 1;
    },
    recordTicketWsIgnoredMessage: (state) => {
      state.ticketWs.ignoredMessages += 1;
    },
    recordTicketWsRefetchTriggered: (state) => {
      state.ticketWs.refetchesTriggered += 1;
    },
    resetTicketWsMetrics: (state) => {
      state.ticketWs.messagesReceived = 0;
      state.ticketWs.parseErrors = 0;
      state.ticketWs.ignoredMessages = 0;
      state.ticketWs.refetchesTriggered = 0;
    },
    clearQrEvents: (state) => {
      state.ticketWs = { ...initialState.ticketWs };
    },
  },
});

export const {
  setTicketWsContext,
  setTicketWsStatus,
  setTicketWsRetryCount,
  setTicketWsError,
  recordTicketWsMessage,
  recordTicketWsParseError,
  recordTicketWsIgnoredMessage,
  recordTicketWsRefetchTriggered,
  resetTicketWsMetrics,
  clearQrEvents,
} = qrEventsSlice.actions;

export const selectTicketWsState = (state: RootState) => state.qrEvents?.ticketWs ?? initialState.ticketWs;

export default qrEventsSlice.reducer;

