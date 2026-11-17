import {
  WalletRechargeInitiatePayload,
  WalletRechargeInitiateResponse,
} from "@components/type/walletRecharge.types";
import { WALLET_RECHARGE_INITIATE_ENDPOINT } from "@config/api.config";
import axiosClient from "./axios";

export const initiateWalletRecharge = async (
  payload: WalletRechargeInitiatePayload
) => {
  const response = await axiosClient.post<WalletRechargeInitiateResponse>(
    WALLET_RECHARGE_INITIATE_ENDPOINT,
    payload
  );
  return response.data;
};
