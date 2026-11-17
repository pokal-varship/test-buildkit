import { useEffect } from 'react';
import { useParams } from 'next/navigation';

type PLPParams = {
  city?: string;
  areaName?: string;
  storeSlug?: string;
  menuSlug?: string;
  categorySlug?: string;
};

export function useSetPLPUrl() {
  const params = useParams() as PLPParams;

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      params &&
      typeof params.storeSlug === 'string' &&
      typeof params.menuSlug === 'string' &&
      typeof params.categorySlug === 'string'
    ) {
      const plpUrl = `/${params.storeSlug}/${params.menuSlug}/${params.categorySlug}`;
      localStorage.setItem('lastPLP', plpUrl);
    }
  }, [params]);
}

export function getPLPUrlFromStorage() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('lastPLP');
  }
  return null;
} 