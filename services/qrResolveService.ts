import axiosClient from '@services/axios';
import { QR_RESOLVE_ENDPOINT, QR_VALIDATE_PIN_ENDPOINT } from '@config/api.config';
import type { QrResolveData } from '@redux/slices/qrFlowSlice';

export interface ValidatePinBody {
  sessionId: string;
  tablePin: string;
}

export interface QrResolveApiResponse {
  status: string;
  message: string;
  data: QrResolveData;
}

/**
 * Fetches QR resolve details from API.
 * Uses shared axiosClient so Authorization (guest token) is added by interceptor.
 * @param token - Token from QR URL (/t/{token})
 * @returns Full API response data
 */
export async function fetchQrResolve(token: string): Promise<QrResolveData> {
  const response = await axiosClient.get<QrResolveApiResponse>(
    QR_RESOLVE_ENDPOINT,
    {
      params: { token: token.trim() },
    }
  );

  if (response.data?.status !== 'Request successfully completed' || !response.data?.data) {
    throw new Error(response.data?.message || 'Failed to resolve QR code');
  }

  return response.data.data;
}

/**
 * Validates table PIN for joining an existing dine-in session.
 * Call after user enters PIN in enterTablePin modal; on success proceed to get session + navigate.
 * @param storeId - Store-Id header (e.g. qrResolveData.storefrontId)
 * @param sessionId - Session ID from QR resolve
 * @param tablePin - PIN entered by user (e.g. 4 digits)
 */
export async function validateTablePin(
  storeId: string,
  sessionId: string,
  tablePin: string
): Promise<void> {
  const headers = storeId ? { 'Store-Id': storeId } : {};
  const body: ValidatePinBody = { sessionId, tablePin };
  const response = await axiosClient.post<{ status?: string; message?: string }>(
    QR_VALIDATE_PIN_ENDPOINT,
    body,
    { headers }
  );
  if (response.data?.status !== 'Request successfully completed') {
    throw new Error(response.data?.message || 'Invalid table PIN');
  }
}
