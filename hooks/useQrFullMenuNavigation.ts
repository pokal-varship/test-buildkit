import React from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { selectIsQrFlowActive, selectQrResolveData } from '@redux/slices/qrFlowSlice';
import { useQRToken } from '@components/provider/QRProvider';
import useMenuModal, { MenuModalProps } from '@hooks/useMenuModal';
import useProductUrl from '@hooks/useProductUrl';

const DEFAULT_MENU_SLUG = 'all-day';

/**
 * Shared helper for navigating to the QR flow full-menu page.
 * Returns a function that performs navigation and reports whether it happened.
 */
export function useQrFullMenuNavigation() {
  const router = useRouter();
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const qrResolveData = useSelector((state: RootState) => selectQrResolveData(state));
  const qrToken = useQRToken();
  const storeData = useSelector((state: RootState) => state.homePage?.storeData?.data);
  const { handleOpenMenuModal } = useMenuModal();
  const { getFullMenuUrl } = useProductUrl();

  const navigateToQrFullMenu = React.useCallback((): boolean => {
    if (!isQrFlowActive) return false;

    const storeSlug = qrResolveData?.storefrontSlug ?? qrToken ?? '';
    const hasStoreSlug = Boolean(storeSlug);

    const store = Array.isArray(storeData)
      ? storeData.find(
          (s: { slug?: string; menuPeriods?: { isOpen?: boolean; slug?: string }[]; name?: string }) =>
            s?.slug === storeSlug
        ) ?? null
      : null;
    const periods = store?.menuPeriods ?? [];

    // If we can't safely build a full-menu URL, fall back to QR flow menu modal
    if (!hasStoreSlug || !store || !periods.length) {
      const modalProps: MenuModalProps = {
        availableStores: hasStoreSlug ? [storeSlug] : undefined,
        scanOrderMode: true,
        locationDisplayName: store?.name ?? undefined,
        redirectToFullMenu: true,
      };
      handleOpenMenuModal(modalProps);
      return true;
    }

    const openPeriod = periods.find((p: { isOpen?: boolean }) => p?.isOpen === true);
    const menuSlug = openPeriod?.slug ?? periods[0]?.slug ?? DEFAULT_MENU_SLUG;

    const queryParams: Record<string, string> = qrToken ? { qrToken } : {};
    const fullMenuUrl = getFullMenuUrl(menuSlug, storeSlug, queryParams);
    router.push(fullMenuUrl);
    return true;
  }, [isQrFlowActive, qrResolveData, qrToken, storeData, router, handleOpenMenuModal, getFullMenuUrl]);

  return { navigateToQrFullMenu };
}

