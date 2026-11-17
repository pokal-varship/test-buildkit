import axiosClient from './axios';
import { SESSION_CREATE_CART_ENDPOINT, SESSION_ENDPOINT, SESSIONS_ENDPOINT } from '@config/api.config';

/** One item inside data.items[].tickets[].items from GET sessions */
export interface SessionTicketItem {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  /** When present (same as cart items), use for price display - else fallback to unitPrice/totalPrice */
  unitBasePrice?: number;
  subTotalAfterBaseDiscount?: number;
  totalBasePrice?: number;
  totalBaseDiscountAmount?: number;
  totalBasePriceAfterBaseDiscount?: number;
  baseDiscountAmount?: number;
  baseModifiersPrice?: number;
  variantId?: string;
  itemCategoryId?: string;
  status?: string;
  productionDisplayId?: string;
  productionDisplayName?: string;
  modifierGroup?: unknown[];
  specialInstructions?: string;
  mediaURL?: string;
  productName?: Record<string, string>;
  productCategory?: Record<string, string>;
  productCategorySlug?: string;
  productSku?: string;
  productSlug?: string;
  estimatedLoyaltyPoints?: number;
  [key: string]: unknown;
}

/** Session object with tickets (one element of data.items) */
export interface SessionItemWithTickets {
  tickets?: Array<{ id?: string; status?: string; items?: SessionTicketItem[]; total?: SessionTotal }>;
  /** Totals from session API when at item level (fallback) */
  total?: SessionTotal;
  sessionSummary?: SessionSummary;
  /** Table PIN from GET sessions (e.g. data.items[0].tablePin) */
  tablePin?: string;
  [key: string]: unknown;
}

/** Session total from GET sessions (total object in API response) */
export interface SessionTotal {
  ticketId?: string;
  sessionId?: string;
  itemSubTotal?: number;
  deliveryFee?: number;
  itemLevelDiscount?: number;
  ticketLevelDiscount?: number;
  itemLevelTax?: number;
  ticketLevelTax?: number;
  tipAmount?: number;
  totalDiscount?: number;
  totalTax?: number;
  finalAmount?: number;
  platformFee?: number;
  [key: string]: unknown;
}

/** Session data returned by GET /storefronts/sessions */
export interface DineInSessionData {
  id?: string;
  sessionId?: string;
  tableId?: string;
  orderType?: string;
  partySize?: number;
  /** When API returns list format: data.items[].tickets[].items */
  data?: { items?: SessionItemWithTickets[] };
  /** When API returns flat format */
  items?: SessionItemWithTickets[];
  /** Aggregated totals for QR/dine-in session (cartCreated: false) */
  sessionSummary?: SessionSummary;
  total?: SessionTotal;
  [key: string]: unknown;
}

/** Dine-in session totals from GET sessions (aggregated across tickets). */
export interface SessionSummary {
  totalTickets?: number;
  totalItems?: number;
  itemSubtotal?: number;
  itemSubTotal?: number;
  itemLevelDiscount?: number;
  itemLevelTax?: number;
  totalDiscount?: number;
  totalTax?: number;
  finalAmount?: number;
  roundOffAmount?: number;
  maxCashbackUsable?: number;
  maximumLoyaltyPointsUsable?: number;
  cartCreated?: boolean;
  /** Legacy fallbacks from older session responses */
  currentSubtotal?: number;
  estimatedTax?: number;
  estimatedTotal?: number;
  [key: string]: unknown;
}

/** Response from POST /storefronts/sessions (creates session, returns sessionId) */
export interface PostSessionResponse {
  id?: string;
  sessionId?: string;
  data?: DineInSessionData;
  [key: string]: unknown;
}

/** POST body to create a dine-in session */
export interface PostSessionBody {
  orderType: 'DINE_IN';
  tableId: string;
  partySize: number;
  /** Channel: POS | APP | WEBSITE */
  orderChannel: 'POS' | 'APP' | 'WEBSITE';
  /** Entry method: STAFF | COUNTER_SERVICE | QR | KIOSK */
  orderEntryMethod: 'STAFF' | 'COUNTER_SERVICE' | 'QR' | 'KIOSK';
}

export interface CreateSessionCartPayload {
  sessionId: string;
  paymentMethod: string;
  orderType: 'DINE_IN';
  timezone: string;
  scheduleType: 'ASAP' | 'SCHEDULED' | string;
  scheduledAt: number;
}

export interface CreateSessionCartResponse {
  message?: string;
  data?: {
    orderId?: string;
    cartId?: string;
    sessionId?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * GET session - fetches current session data.
 * Used when sessionId already exists (e.g. from QR resolve).
 * Pass storeId to send Store-Id header (e.g. from qrResolveData.storefrontId).
 * Query: session_id (when provided), wantItems=true. tableId on params is ignored for GET (not sent).
 */
export async function getSession(
  storeId?: string,
  params?: { tableId?: string; sessionId?: string }
): Promise<DineInSessionData> {
  const headers = storeId ? { 'Store-Id': storeId } : {};
  const requestParams: Record<string, string> = {
    wantItems: 'true',
  };
  if (params?.sessionId) requestParams.session_id = params.sessionId;
  const response = await axiosClient.get<DineInSessionData | { data?: DineInSessionData }>(SESSION_ENDPOINT, {
    headers,
    params: requestParams,
  });
  const payload = response.data as DineInSessionData | { data?: DineInSessionData };
  if (payload && typeof payload === 'object' && 'data' in payload && payload.data) {
    return payload.data;
  }
  return payload as DineInSessionData;
}

/**
 * POST session - creates a new dine-in session.
 * Returns sessionId / session data. Use tableId from QR resolve response.
 * Pass storeId to send Store-Id header (e.g. from qrResolveData.storefrontId).
 */
export async function postSession(
  tableId: string,
  partySize: number = 1,
  storeId?: string
): Promise<PostSessionResponse | DineInSessionData> {
  const body: PostSessionBody = {
    orderType: 'DINE_IN',
    tableId,
    partySize,
    orderChannel: 'WEBSITE',
    orderEntryMethod: 'QR',
  };
  const headers = storeId ? { 'Store-Id': storeId } : {};
  const response = await axiosClient.post<PostSessionResponse | DineInSessionData>(
    SESSIONS_ENDPOINT,
    body,
    { headers }
  );
  return response.data;
}

/**
 * POST - create cart from dine-in session (QR flow).
 * Endpoint: /storefronts/sessions/checkout
 */
export async function createSessionCart(
  storeId: string,
  payload: CreateSessionCartPayload
): Promise<CreateSessionCartResponse> {
  const headers = storeId ? { 'Store-Id': storeId } : {};
  const response = await axiosClient.post<CreateSessionCartResponse>(
    SESSION_CREATE_CART_ENDPOINT,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }
  );
  return response.data;
}
