/**
 * Ticket status values from sessions API (data.items[0].tickets[].status).
 * Use this config across QR flow and orders so statuses stay in sync.
 */
export const ticketStatusConfig = {
  draft: 'DRAFT',
  submitted: 'SUBMITTED',
  inProgress: 'IN_PROGRESS',
  sentToKitchen: 'SENT_TO_KITCHEN',
  ready: 'READY',
  preparing: 'PREPARING',
  pendingPayment: 'PENDING_PAYMENT',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
  abandoned: 'ABANDONED',
} as const;

export type TicketStatus = (typeof ticketStatusConfig)[keyof typeof ticketStatusConfig];

/** Ticket statuses whose itemCount is included in "items being cooked" / active product count (QR flow). */
export const ACTIVE_PRODUCT_COUNT_TICKET_STATUSES: readonly TicketStatus[] = [
  ticketStatusConfig.submitted,
  ticketStatusConfig.sentToKitchen,
  ticketStatusConfig.inProgress,
];

/** Returns true if the given status (case-insensitive) is one of the active product-count statuses. */
export function isActiveProductCountStatus(status: string | undefined): boolean {
  if (!status) return false;
  const upper = status.toUpperCase();
  return ACTIVE_PRODUCT_COUNT_TICKET_STATUSES.includes(upper as TicketStatus);
}
