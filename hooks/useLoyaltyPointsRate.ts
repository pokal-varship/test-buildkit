import { useState } from 'react';
import axiosClient from '@services/axios';
import { LOYALTY_SETTINGS_ENDPOINT } from '@config/api.config';

interface LoyaltySettingsResponse {
  data: {
    default_points_earning_rate?: string;
    budget_status?: { can_earn_loyalty?: boolean };
    [key: string]: unknown;
  };
}

let cachedRate: number | null = null;
let cachedCanEarnLoyalty = false;
let loaded = false;
let fetchPromise: Promise<{ rate: number | null; canEarnLoyalty: boolean }> | null = null;

export async function fetchLoyaltyPointsRate() {
  if (loaded) return { rate: cachedRate, canEarnLoyalty: cachedCanEarnLoyalty };
  if (fetchPromise) return fetchPromise;

  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || '';
  if (!tenantId) return { rate: null, canEarnLoyalty: false };

  fetchPromise = axiosClient
    .get<LoyaltySettingsResponse>(LOYALTY_SETTINGS_ENDPOINT, { params: { tenantId } })
    .then((response) => {
      const rate = parseFloat(response.data?.data?.default_points_earning_rate || '0');
      const resultRate = Number.isFinite(rate) && rate > 0 ? rate : null;
      cachedCanEarnLoyalty =
        response.data?.data?.budget_status?.can_earn_loyalty === true;
      cachedRate = resultRate;
      loaded = true;
      return { rate: resultRate, canEarnLoyalty: cachedCanEarnLoyalty };
    })
    .catch(() => {
      fetchPromise = null;
      return { rate: null, canEarnLoyalty: false };
    });

  return fetchPromise;
}

export function useLoyaltyPointsRate() {
  const [rate, setRate] = useState<number | null>(cachedRate);
  const [canEarnLoyalty, setCanEarnLoyalty] = useState(cachedCanEarnLoyalty);
  return { rate, setRate, canEarnLoyalty, setCanEarnLoyalty };
}
