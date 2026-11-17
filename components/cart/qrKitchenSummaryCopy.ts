import type { KitchenTicketSummary } from '@redux/slices/qrFlowSlice';

type LangLike = {
  items?: string;
  order?: {
    in?: string;
    tickets?: string;
    cooking?: string;
    sentToKitchen?: string;
    preparing?: string;
    readyToServe?: string;
    itemsBeingCooked?: string;
    beingCooked?: string;
  };
};

export type QrKitchenSummaryCopy = {
  title: string;
  subtitle?: string;
};

function safe(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

/**
 * Builds the QR bottom-bar kitchen summary copy.
 *
 * Rules:
 * - Single Ticket: show status text for that ticket only
 * - Multiple Tickets - Same Status: show combined ticket count + status (READY uses "ready to serve!" format)
 * - Mixed Statuses - No Ready Items: show title + breakdown (cooking/sent-to-kitchen/preparing), exclude READY
 */
export function getQrKitchenSummaryCopy(
  lang: LangLike,
  kitchenSummary: KitchenTicketSummary
): QrKitchenSummaryCopy {
  const itemsLabel = safe(lang?.items, 'items');
  const inLabel = safe(lang?.order?.in, 'in');
  const ticketsLabel = safe(lang?.order?.tickets, 'tickets');
  const beingCookedLabel = safe(lang?.order?.beingCooked, 'being cooked');
  const itemsBeingCookedLabel = safe(lang?.order?.itemsBeingCooked, 'items being cooked');
  const cookingLabel = safe(lang?.order?.cooking, 'cooking');
  const sentToKitchenLabel = safe(lang?.order?.sentToKitchen, 'sent to kitchen');
  const preparingLabel = safe(lang?.order?.preparing, 'preparing');
  const readyToServeLabel = safe(lang?.order?.readyToServe, 'ready to serve');

  const cookingItems = kitchenSummary.submittedItems;
  const cookingTickets = kitchenSummary.submittedTickets;
  const sentToKitchenItems = kitchenSummary.sentToKitchenItems;
  const sentToKitchenTickets = kitchenSummary.sentToKitchenTickets;
  const preparingItems = kitchenSummary.preparingItems;
  const preparingTickets = kitchenSummary.preparingTickets;
  const readyItems = kitchenSummary.readyItems;
  const readyTickets = kitchenSummary.readyTickets;

  const activeTicketsTotal =
    cookingTickets + sentToKitchenTickets + preparingTickets + readyTickets;

  // 1) Single Ticket (exactly one active ticket)
  if (activeTicketsTotal === 1) {
    if (cookingTickets === 1) return { title: `${cookingItems} ${itemsBeingCookedLabel}` };
    if (sentToKitchenTickets === 1) return { title: `${sentToKitchenItems} ${itemsLabel} ${sentToKitchenLabel}` };
    if (preparingTickets === 1) return { title: `${preparingItems} ${itemsLabel} ${preparingLabel}` };
    if (readyTickets === 1) return { title: `${readyItems} ${itemsLabel} ${readyToServeLabel}` };
  }

  // 2) Multiple Tickets - Same Status
  const nonZeroGroups =
    Number(cookingTickets > 0) +
    Number(sentToKitchenTickets > 0) +
    Number(preparingTickets > 0) +
    Number(readyTickets > 0);

  if (activeTicketsTotal > 1 && nonZeroGroups === 1) {
    // Same status across multiple tickets
    if (readyTickets > 0) {
      // match screenshot: omit ticket count and use exclamation
      return { title: `${readyItems} ${itemsLabel} ${readyToServeLabel}!` };
    }
    if (cookingTickets > 0) {
      return {
        title: `${cookingItems} ${itemsLabel} ${inLabel} ${cookingTickets} ${ticketsLabel} ${beingCookedLabel}`,
      };
    }
    if (sentToKitchenTickets > 0) {
      return {
        title: `${sentToKitchenItems} ${itemsLabel} ${inLabel} ${sentToKitchenTickets} ${ticketsLabel} ${sentToKitchenLabel}`,
      };
    }
    // preparing
    return {
      title: `${preparingItems} ${itemsLabel} ${inLabel} ${preparingTickets} ${ticketsLabel} ${preparingLabel}`,
    };
  }

  // 3) Mixed Statuses - No Ready Items (exclude READY from title + breakdown)
  const mixedItemsTotal = cookingItems + sentToKitchenItems + preparingItems;
  const mixedTicketsTotal = cookingTickets + sentToKitchenTickets + preparingTickets;

  const parts: string[] = [];
  if (cookingItems > 0) parts.push(`${cookingItems} ${cookingLabel}`);
  if (sentToKitchenItems > 0) parts.push(`${sentToKitchenItems} ${sentToKitchenLabel}`);
  if (preparingItems > 0) parts.push(`${preparingItems} ${preparingLabel}`);

  return {
    title: `${mixedItemsTotal} ${itemsLabel} ${inLabel} ${mixedTicketsTotal} ${ticketsLabel}`,
    subtitle: parts.join(' • '),
  };
}

