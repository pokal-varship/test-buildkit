import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ticketStatusConfig } from "@config/ticketStatus.config";
import type { RootState } from "@redux/store";
import type {
  DineInSessionData,
  SessionTicketItem,
  SessionTotal,
} from "@services/sessionService";
import type { KitchenTicketSummary } from "@redux/slices/qrFlowSlice";

type SessionTicket = {
  id?: string;
  status?: string;
  itemCount?: number;
  submittedAt?: string | number | Date;
  items?: SessionTicketItem[];
  total?: SessionTotal;
};

const EMPTY_SESSION_TICKETS: SessionTicket[] = [];
const EMPTY_SESSION_TICKET_ITEMS: SessionTicketItem[] = [];
const EMPTY_KITCHEN_TICKET_SUMMARY: KitchenTicketSummary = {
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

type QrSessionDerivedState = {
  sessionTickets: SessionTicket[];
  sessionTicketItems: SessionTicketItem[];
  draftTicketItemCount: number;
  draftTicketsItemCountSum: number;
  kitchenTicketSummary: KitchenTicketSummary;
  qrCheckoutHasSubmittedOrderContent: boolean;
};

const EMPTY_QR_SESSION_DERIVED_STATE: QrSessionDerivedState = {
  sessionTickets: EMPTY_SESSION_TICKETS,
  sessionTicketItems: EMPTY_SESSION_TICKET_ITEMS,
  draftTicketItemCount: 0,
  draftTicketsItemCountSum: 0,
  kitchenTicketSummary: EMPTY_KITCHEN_TICKET_SUMMARY,
  qrCheckoutHasSubmittedOrderContent: false,
};

type SessionDataShape = {
  data?: {
    items?: Array<{
      tickets?: Array<{
        id?: string;
        status?: string;
        itemCount?: number;
        submittedAt?: string | number | Date;
        items?: unknown[];
        total?: SessionTotal;
      }>;
    }>;
    tickets?: SessionTicket[];
  };
  items?: Array<{
    tickets?: Array<{
      id?: string;
      status?: string;
      itemCount?: number;
      submittedAt?: string | number | Date;
      items?: unknown[];
      total?: SessionTotal;
    }>;
  }>;
  tickets?: Array<{
    id?: string;
    status?: string;
    itemCount?: number;
    submittedAt?: string | number | Date;
    items?: unknown[];
    total?: SessionTotal;
  }>;
};

const selectDineInSessionDataForDerivedState = (state: RootState) =>
  state.qrFlow.dineInSessionData;

export const getSessionTicketsFromData = (
  dineInSessionData: DineInSessionData | null,
): SessionTicket[] => {
  const d = dineInSessionData as SessionDataShape | null;
  if (!d) return EMPTY_SESSION_TICKETS;

  const tickets =
    d.data?.items?.[0]?.tickets ??
    d.items?.[0]?.tickets ??
    d.data?.tickets ??
    d.tickets;

  if (Array.isArray(tickets) && tickets.length > 0) {
    return tickets.map((ticket) => ({
      id: ticket?.id,
      status: ticket?.status,
      itemCount: Number(ticket?.itemCount ?? 0),
      submittedAt: ticket?.submittedAt,
      total: ticket?.total,
      items: Array.isArray(ticket?.items)
        ? (ticket.items as SessionTicketItem[])
        : EMPTY_SESSION_TICKET_ITEMS,
    }));
  }

  const singleTicket =
    d.data?.items?.[0]?.tickets?.[0] ??
    d.items?.[0]?.tickets?.[0] ??
    d.data?.tickets?.[0] ??
    d.tickets?.[0];
  const singleTicketItems = singleTicket?.items;

  if (Array.isArray(singleTicketItems) && singleTicketItems.length > 0) {
    return [
      {
        id: undefined,
        status: singleTicket?.status,
        submittedAt: singleTicket?.submittedAt,
        total: singleTicket?.total,
        items: singleTicketItems as SessionTicketItem[],
      },
    ];
  }

  return EMPTY_SESSION_TICKETS;
};

export const getDraftTicketItems = (
  tickets: SessionTicket[],
): SessionTicketItem[] => {
  if (tickets.length === 0) return EMPTY_SESSION_TICKET_ITEMS;

  const draftTickets = tickets.filter((ticket) => {
    const status = ticket.status?.toUpperCase?.();
    return !status || status === ticketStatusConfig.draft;
  });

  if (draftTickets.length === 0) return EMPTY_SESSION_TICKET_ITEMS;

  const items = draftTickets.flatMap(
    (ticket) => ticket.items ?? EMPTY_SESSION_TICKET_ITEMS,
  );
  return items.length > 0 ? items : EMPTY_SESSION_TICKET_ITEMS;
};

export const getDraftTicketItemCountSum = (
  tickets: SessionTicket[],
): number => {
  if (!tickets.length) return 0;

  const sum = tickets.reduce((acc, ticket) => {
    const status = String(ticket?.status ?? "").toUpperCase();
    if (status && status !== ticketStatusConfig.draft) return acc;
    return acc + Number(ticket?.itemCount ?? 0);
  }, 0);

  return Number.isFinite(sum) ? sum : 0;
};

export const getKitchenTicketSummary = (
  tickets: SessionTicket[],
): KitchenTicketSummary => {
  if (!tickets.length) return EMPTY_KITCHEN_TICKET_SUMMARY;

  const summary = tickets.reduce<KitchenTicketSummary>(
    (acc, ticket) => {
      const status = String(ticket?.status ?? "").toUpperCase();
      const itemCountRaw = Number(
        ticket?.itemCount ?? ticket.items?.length ?? 0,
      );
      const itemCount = Number.isFinite(itemCountRaw) ? itemCountRaw : 0;
      if (itemCount <= 0) return acc;

      if (
        status === ticketStatusConfig.submitted ||
        status === ticketStatusConfig.inProgress
      ) {
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
    },
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

export const getQrCheckoutHasSubmittedOrderContent = (
  tickets: SessionTicket[],
): boolean => {
  const visibleTickets = tickets.filter((ticket) => {
    const status = ticket.status?.toUpperCase();
    return (
      status === ticketStatusConfig.submitted ||
      status === ticketStatusConfig.pendingPayment
    );
  });

  return (
    visibleTickets.length > 0 &&
    visibleTickets.some((ticket) => (ticket.items?.length ?? 0) > 0)
  );
};

export const getQrSessionDerivedState = (
  dineInSessionData: DineInSessionData | null,
): QrSessionDerivedState => {
  if (!dineInSessionData) return EMPTY_QR_SESSION_DERIVED_STATE;

  const sessionTickets = getSessionTicketsFromData(dineInSessionData);
  const sessionTicketItems = getDraftTicketItems(sessionTickets);

  return {
    sessionTickets,
    sessionTicketItems,
    draftTicketItemCount: sessionTicketItems.length,
    draftTicketsItemCountSum: getDraftTicketItemCountSum(sessionTickets),
    kitchenTicketSummary: getKitchenTicketSummary(sessionTickets),
    qrCheckoutHasSubmittedOrderContent:
      getQrCheckoutHasSubmittedOrderContent(sessionTickets),
  };
};

export const useQrSessionDerivedState = (): QrSessionDerivedState => {
  const dineInSessionData = useSelector(selectDineInSessionDataForDerivedState);
  const [derivedState, setDerivedState] = useState<QrSessionDerivedState>(() =>
    getQrSessionDerivedState(dineInSessionData),
  );

  useEffect(() => {
    setDerivedState(getQrSessionDerivedState(dineInSessionData));
  }, [dineInSessionData]);

  return derivedState;
};

export const useSessionTickets = (): SessionTicket[] => {
  return useQrSessionDerivedState().sessionTickets;
};

export const useSessionTicketItems = (): SessionTicketItem[] => {
  return useQrSessionDerivedState().sessionTicketItems;
};

export const useDraftTicketItemCount = (): number => {
  return useQrSessionDerivedState().draftTicketItemCount;
};

export const useDraftTicketsItemCountSum = (): number => {
  return useQrSessionDerivedState().draftTicketsItemCountSum;
};

export const useKitchenTicketSummary = (): KitchenTicketSummary => {
  return useQrSessionDerivedState().kitchenTicketSummary;
};

export const useQrCheckoutHasSubmittedOrderContent = (): boolean => {
  return useQrSessionDerivedState().qrCheckoutHasSubmittedOrderContent;
};
