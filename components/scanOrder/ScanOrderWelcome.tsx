'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useLang from '@hooks/useLang';
import { LanguageCode, TranslationKeys } from 'types';
import CustomButton from '@components/buttons/Button';
import Icon from '@components/image/Icons';
import { NAVIGATION_IMAGE } from '@config/Header/image.config';
import { getTenantConfig } from '@config/tenant.config';
import { selectQrResolveData, selectSessionId, setDineInSessionData, setQrResolveSessionId } from '@redux/slices/qrFlowSlice';
import { getSession, postSession } from '@services/sessionService';
import { open_dialog } from '@lib/modalHandler';
import { useSession } from 'next-auth/react';
import { useQrFullMenuNavigation } from '@hooks/useQrFullMenuNavigation';
import { useToast } from '@components/toast/Toast';
import useAnalytics from '@hooks/useAnalytics';
import { sanitizeAnalyticsErrorMessage } from '@lib/analytics/dineInAnalytics';

interface ScanOrderWelcomeProps {
  storeSlug: string;
  tableNumber: string;
  /** Static placeholder when no API - location name */
  locationName?: string;
  /** Static placeholder - rating */
  rating?: string;
  /** Static placeholder - review count */
  reviewCount?: string;
}

export default function ScanOrderWelcome({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for parent API; navigation uses useQrFullMenuNavigation
  storeSlug,
  tableNumber,
  locationName,
}: ScanOrderWelcomeProps) {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const config = getTenantConfig();
  const dispatch = useDispatch();
  const qrResolveData = useSelector(selectQrResolveData);
  const sessionIdFromRedux = useSelector(selectSessionId);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);
  const { navigateToQrFullMenu } = useQrFullMenuNavigation();
  const showToast = useToast();
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;
  const {
    trackDineInWelcomeViewed,
    trackDineInExploreMenuClicked,
    trackDineInSessionStarted,
    trackDineInSessionFailed,
  } = useAnalytics();
  const hasTrackedWelcomeView = useRef(false);

  useEffect(() => {
    if (hasTrackedWelcomeView.current || !qrResolveData) return;
    hasTrackedWelcomeView.current = true;
    void trackDineInWelcomeViewed({
      table_number: tableNumber,
      location_name: locationName,
      store_id: String(qrResolveData.storefrontId || ''),
      store_name: String(
        qrResolveData.storefrontName || qrResolveData.restaurant?.name || '',
      ),
    });
  }, [
    qrResolveData,
    tableNumber,
    locationName,
    trackDineInWelcomeViewed,
  ]);

  /** Runs session API then navigates to full-menu (same logic as bottom nav / empty cart "Go to menu"). */
  const callSessionAndNavigate = async () => {
    setIsLoading(true);
    let sessionCreatedVia: 'get' | 'post' = 'get';
    try {
      const sessionId = sessionIdFromRedux ?? qrResolveData?.sessionId;
      const storeId = qrResolveData?.storefrontId;
      const tableId = qrResolveData?.tableId;
      const autoCreateSession = qrResolveData?.autoCreateSession === false;
      const sessionParams = { tableId, sessionId };
      let sessionData;

      if (sessionId) {
        sessionData = await getSession(storeId, sessionParams);
      } else if (tableId && autoCreateSession) {
        // Only when autoCreateSession is false and sessionId is not there → create session via POST
        sessionCreatedVia = 'post';
        const postResponse = await postSession(tableId, 1, storeId);
        const res = postResponse as { id?: string; data?: { id?: string } };
        const newSessionId = res?.data?.id ?? res?.id;
        if (newSessionId) dispatch(setQrResolveSessionId(newSessionId));
        sessionData = await getSession(storeId, { tableId, sessionId: newSessionId });
      } else if (tableId) {
        // No sessionId, autoCreateSession true or missing → use existing session (GET with tableId only)
        sessionData = await getSession(storeId, { tableId });
      } else {
        throw new Error('Table ID is required to start a dine-in session');
      }

      dispatch(setDineInSessionData(sessionData));
      const resolvedSessionId =
        sessionData?.sessionId ??
        sessionData?.id ??
        sessionId ??
        '';
      void trackDineInSessionStarted({
        session_id: String(resolvedSessionId),
        table_id: String(tableId || ''),
        table_number: tableNumber,
        party_size: sessionData?.partySize ?? 1,
        session_created_via: sessionCreatedVia,
        store_id: String(storeId || ''),
      });
    } catch (err) {
      console.error('Session API error:', err);
      void trackDineInSessionFailed({
        error_message: sanitizeAnalyticsErrorMessage(err),
        table_id: String(qrResolveData?.tableId || ''),
      });
      setIsLoading(false);
      return;
    } finally {
      setIsLoading(false);
    }

    navigateToQrFullMenu();
  };

  /** Runs after table PIN is entered (or directly if anchorUser is true): requireLogin → login dialog or session + navigate */
  const runAfterTablePinOrDirect = async () => {
    if (qrResolveData?.requireLoginBeforeOrder === true && !isLoggedIn) {
      open_dialog('login', {
        open: true,
        propsData: {
          onSuccess: () => callSessionAndNavigate(),
        },
        type: 'login',
        handlerDialog: () => {},
        handleClose: () => {},
        anchor: 'bottom',
        onlyDialog: false,
        sxStyle: {
          '& .MuiDialogContent-root': {
            padding: '20px 16px',
            backgroundColor: 'var(--tertiary-background)',
          },
        },
      });
      return;
    }
    await callSessionAndNavigate();
  };

  const handleExploreMenu = async () => {
    void trackDineInExploreMenuClicked({
      table_number: tableNumber,
      is_logged_in: isLoggedIn,
      require_login_before_order: qrResolveData?.requireLoginBeforeOrder,
    });
    await runAfterTablePinOrDirect();
  };

  return (
  <>
    <div
      className="flex flex-col items-center justify-center px-8 py-12 pb-7 bg-[var(--primary-background)]"
    >
      <div className="w-full max-w-md flex flex-col items-center text-center">
        {/* Logo - circular with border */}
        <div className="mb-5">
          <img
            src={config?.lightLogoUrl || '/images/placeholder/no-store-placeholder.svg'}
            alt=""
            className="w-52 h-auto object-cover"
          />
        </div>

        {/* Welcome to - with dashed lines */}
        <div className="flex items-center justify-center gap-3 w-full mb-6 mt-2">
          <span
            className="flex-1 border-t border-[var(--accent-color)] shrink-0"
          />
          <span className="heading-6 font-600 tracking-wide text-[var(--primary-text)]">
            {lang.welcomeTo}
          </span>
          <span
            className="flex-1 border-t border-[var(--accent-color)] shrink-0"
          />
        </div>

        {/* Location & table card */}
        <div
          className="w-full rounded-2xl px-6 py-7 mb-6 text-center shadow-sm bg-[var(--cards-containers)]"
        >
          {/* Location pin - mx-auto for reliable center on iOS (justify-self only works in grid) */}
          <div className="flex mx-auto mb-2 bg-[var(--button-primary-background)] rounded-full p-2 h-12 w-12 items-center justify-center">
            <Icon
              icon={`${NAVIGATION_IMAGE}#nav-icon`}
              width={32}
              height={32}
              color="var(--primary-text-light)"
              className="block"
              viewBox="0 0 15 17"
            />
          </div>
          <p className="heading-5 font-600 mb-6 text-[var(--primary-text)]">
            {locationName}
          </p>
          {/* <div className="flex items-center justify-center gap-1.5 mb-3 heading-6 font-400 text-[var(--secondary-text)]">
            <Icon
              icon={`${STAR_ICON}#star2`}
              aria-label=""
              width={14}
              height={14}
              color="var(--rating-bg-primary)"
              viewBox="0 0 28 26"
              className="shrink-0"
            />
            <span>{rating}</span>
            <span className="opacity-70">·</span>
            <span className="underline cursor-pointer">{reviewCount} {lang.reviews}</span>
          </div> */}

          {/* YOU ARE AT with dotted lines on both sides */}
          <div className="flex items-center gap-3 mt-4 mb-2.5 w-full">
            <span
              className="flex-1 shrink-0 h-0 border-t border-[var(--secondary-text)] border-dashed min-w-[24px]"
            />
            <p className="extra-small-font font-400 uppercase tracking-wider text-[var(--secondary-text)] whitespace-nowrap">
              {lang.youAreAt}
            </p>
            <span
              className="flex-1 shrink-0 h-0 border-t border-[var(--secondary-text)] border-dashed min-w-[24px]"
            />
          </div>
          <p className="text-[51px] font-800 leading-none text-[var(--accent-color)]">
            {tableNumber}
          </p>
          <p className="heading-6 mt-1 font-400 uppercase tracking-wider text-[var(--accent-color)]">
            {lang.tableNo}
          </p>

          {/* TABLE PIN - static for now; will come from QR resolve API */}
          {/* <div
            className="mt-4 w-full rounded-xl p-4 text-center border border-dashed border-[var(--accent-color)] bg-[var(--dinein-info-bg)]"
          >
            <p className="extra-small-font font-600 uppercase tracking-wider text-[var(--primary-text)] mb-2">
              {lang.order.tablePin}
            </p>
            <p className="text-[31px] font-800 text-[#4285F4] mb-1">
              3424
            </p>
            <p className="heading-6 font-400 text-[var(--secondary-text)]">
              {lang.order.shareTablePinWithGroup}
            </p>
          </div> */}

        </div>

        {/* Scan complete message */}
        <p className="extra-small-font font-400 text-[var(--secondary-text)]">
          {lang.scanCompleteDineInStarted}
        </p>
        <p className="extra-small-font font-400 text-[var(--secondary-text)]">
          {lang.ordersLinkedToTablePrefix}<span className="font-600"> {lang.table} {tableNumber}</span>
        </p>

      </div>
    </div>
    {/* Explore Menu - sticky at bottom */}
    <div className="fixed bottom-0 left-0 right-0 z-50 w-full px-4 pt-4 pb-5 bg-[var(--primary-background)] border-t border-[var(--cards-containers)]">
      <CustomButton
        onClick={handleExploreMenu}
        disabled={isLoading}
        className="font-700 !py-3.5 mt-0 !w-full heading-4"
      >
        {isLoading ? lang.loading : lang.exploreMenu}
      </CustomButton>
    </div>
  </>
  );
}
