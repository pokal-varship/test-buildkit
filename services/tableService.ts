import axiosClient from '@services/axios';
import { STOREFRONT_TABLES_ENDPOINT } from '@config/api.config';

export interface ServingStaffDetails {
  id?: string;
  name?: string;
  number?: string;
  rating?: number | string;
  [key: string]: unknown;
}

export interface StorefrontTable {
  tableId?: string;
  tableNumber?: string;
  displayName?: string;
  servingStaffDetails?: ServingStaffDetails;
  [key: string]: unknown;
}

type TablesApiResponseShape = {
  status?: string;
  message?: string;
  data?:
    | { items?: StorefrontTable[]; totalCount?: number }
    | { tables?: StorefrontTable[]; totalCount?: number }
    | StorefrontTable[]
    | StorefrontTable
    | null;
  items?: StorefrontTable[];
  totalCount?: number;
};

/**
 * Fetch table details for QR flow.
 * Uses shared axiosClient so Authorization is handled by interceptor.
 */
export async function fetchStorefrontTableById(
  tableId: string,
  signal?: AbortSignal,
  storeId?: string
): Promise<StorefrontTable | null> {
  const id = String(tableId ?? '').trim();
  if (!id) return null;

  const response = await axiosClient.get<TablesApiResponseShape>(STOREFRONT_TABLES_ENDPOINT, {
    params: { tableId: id },
    signal,
    headers: storeId ? { 'Store-Id': storeId } : undefined,
  });

  const payload = response.data;
  const data = payload?.data;

  const fromDataItems =
    (data && typeof data === 'object' && !Array.isArray(data) && 'items' in data
      ? (data as { items?: StorefrontTable[] }).items?.[0]
      : undefined) ?? undefined;

  const fromDataTables =
    (data && typeof data === 'object' && !Array.isArray(data) && 'tables' in data
      ? (data as { tables?: StorefrontTable[] }).tables?.[0]
      : undefined) ?? undefined;

  const fromTopItems = payload?.items?.[0];
  const fromDataArray = Array.isArray(data) ? data[0] : undefined;
  const fromDataObject = data && typeof data === 'object' && !Array.isArray(data) && !('items' in data) && !('tables' in data)
    ? (data as StorefrontTable)
    : undefined;

  return fromDataTables ?? fromDataItems ?? fromTopItems ?? fromDataArray ?? fromDataObject ?? null;
}

