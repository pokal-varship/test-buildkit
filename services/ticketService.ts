import axiosClient from './axios';
import { TICKET_ITEMS_ENDPOINT, TICKET_SUBMIT_ENDPOINT } from '@config/api.config';

/** Item for POST/PATCH /storefronts/tickets/items - same variant/modifier shape as cart add payload */
export interface TicketItemPayload {
  itemId?: string;
  ticketItemId?: string; // Ticket item ID from session (tickets[].items[].id) for updates
  itemSku?: string;
  variantId?: string;
  quantity: number;
  sequenceNumber?: number;
  customType?: 'ADD_QUANTITY' | 'SUBTRACT_QUANTITY' | 'DELETE_ITEM' | 'UPDATE_SPECIAL_INSTRUCTIONS' | 'UPDATE_MODIFIERS' | 'UPDATE_COMBO' | 'ADD_FREEBIE';
  specialInstructions?: string;
  /** Freebie selection (when customType is ADD_FREEBIE) */
  freebieProductId?: string;
  freebieOfferId?: string;
  cartItemId?: string;
  /** Same structure as cart API modifierGroups */
  modifierGroups?: {
    modifierGroupId: string;
    modifiers: { modifierId: string; quantity: number }[];
  }[];
  startAt?: number;
}

/** Request body for ticket items API (add and update use same shape) */
export interface AddItemsToTicketPayload {
  sessionId: string;
  /** Optional ticketId for flows where a specific ticket must be targeted */
  ticketId?: string;
  items: TicketItemPayload[];
}

/** Request body for cancel ticket session (QR flow) */
export interface CancelTicketSessionPayload {
  sessionId: string;
  customType: 'CANCEL_CART';
}

/** Request body for order-level instruction (QR flow) */
export interface UpdateOrderInstructionPayload {
  sessionId: string;
  ticketId: string;
  customType: 'UPDATE_ORDER_INSTRUCTION';
  orderInstruction: string;
}

/** Request body for submit ticket to kitchen (QR flow) */
export interface SubmitTicketToKitchenPayload {
  sessionId: string;
  ticketId: string;
}

/**
 * POST – add item(s) to ticket (QR/dine-in flow).
 * Payload: sessionId + items[] (itemId, itemSku, quantity, sequenceNumber, customType, etc.).
 */
export async function addItemsToTicket(
  storeId: string,
  payload: AddItemsToTicketPayload
): Promise<unknown> {
  const headers = storeId ? { 'Store-Id': storeId } : {};
  const response = await axiosClient.post(TICKET_ITEMS_ENDPOINT, payload, {
    headers: { 'Content-Type': 'application/json', ...headers },
  });
  return response.data;
}

/**
 * PATCH – update/delete/modify items on ticket (QR/dine-in flow).
 * Mirrors cart flow: patchCart (PATCH) for updates; same endpoint as addItemsToTicket.
 */
export async function updateTicketItems(
  storeId: string,
  payload: AddItemsToTicketPayload
): Promise<unknown> {
  const headers = storeId ? { 'Store-Id': storeId } : {};
  const response = await axiosClient.patch(TICKET_ITEMS_ENDPOINT, payload, {
    headers: { 'Content-Type': 'application/json', ...headers },
  });
  return response.data;
}

/**
 * PATCH – cancel ticket session (QR/dine-in flow).
 * Uses same items endpoint with sessionId and customType: "CANCEL_CART".
 */
export async function cancelTicketSession(
  storeId: string,
  payload: CancelTicketSessionPayload
): Promise<unknown> {
  const headers = storeId ? { 'Store-Id': storeId } : {};
  const response = await axiosClient.patch(TICKET_ITEMS_ENDPOINT, payload, {
    headers: { 'Content-Type': 'application/json', ...headers },
  });
  return response.data;
}

/**
 * PATCH – update order-level cooking instruction (QR/dine-in flow).
 */
export async function updateOrderInstruction(
  storeId: string,
  payload: UpdateOrderInstructionPayload
): Promise<unknown> {
  const headers = storeId ? { 'Store-Id': storeId } : {};
  const response = await axiosClient.patch(TICKET_ITEMS_ENDPOINT, payload, {
    headers: { 'Content-Type': 'application/json', ...headers },
  });
  return response.data;
}

/**
 * PATCH – submit ticket to kitchen (QR/dine-in flow).
 */
export async function submitTicketToKitchen(
  storeId: string,
  payload: SubmitTicketToKitchenPayload
): Promise<unknown> {
  const headers = storeId ? { 'Store-Id': storeId } : {};
  const response = await axiosClient.patch(TICKET_SUBMIT_ENDPOINT, payload, {
    headers: { 'Content-Type': 'application/json', ...headers },
  });
  return response.data;
}
