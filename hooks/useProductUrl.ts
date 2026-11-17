'use client';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { TypesenseProduct } from '@services/typesense';
import { selectIsQrFlowActive, selectQrToken, selectQrResolveData } from '@redux/slices/qrFlowSlice';
import { useQRToken } from '@components/provider/QRProvider';

/**
 * Custom hook to generate product and category URLs consistently across the app
 * Use with Next.js Link component for instant navigation with loading.tsx
 */
export function useProductUrl() {
  const params = useParams();
  const storeSlugFromRedux = useSelector((state: RootState) => state.store?.currentStore?.slug);
  const menuSlugFromParams = params?.menuSlug as string;
  const storeSlugFromParams = params?.storeSlug as string;
  const categorySlugFromParams = params?.categorySlug as string;
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const qrResolveData = useSelector(selectQrResolveData);
  const qrTokenFromContext = useQRToken();
  const qrTokenFromRedux = useSelector(selectQrToken);
  const qrToken = qrTokenFromContext ?? qrTokenFromRedux;

  /** When QR flow is active, append qrToken to any URL. */
  function appendQrTokenIfActive(url: string): string {
    if (!isQrFlowActive || !qrToken) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}qrToken=${encodeURIComponent(qrToken)}`;
  }

  /**
   * Generate product URL from TypesenseProduct
   * Format: /products/{customSlug}?store={storeSlug}&category={categorySlug}&menu={menuSlug}
   */
  function getProductUrl(product: TypesenseProduct, storeSlug?: string): string {
    const store = storeSlug || storeSlugFromRedux || '';
    const url = `/products/${product.seo?.urlManagement?.customSlug}?store=${store}&category=${product.productCategorySlug}&menu=${menuSlugFromParams}`;
    return appendQrTokenIfActive(url);
  }

  /**
   * Generate product URL for search results (menu before category)
   * Format: /products/{customSlug}?store={storeSlug}&menu={menuSlug}&category={categorySlug}
   */
  function getSearchProductUrl(product: TypesenseProduct, storeSlug?: string): string {
    const store = storeSlug || storeSlugFromRedux || '';
    const url = `/products/${product.seo?.urlManagement?.customSlug}?store=${store}&menu=${menuSlugFromParams}&category=${product.productCategorySlug}`;
    return appendQrTokenIfActive(url);
  }

  /**
   * Generate product URL from order item
   * Format: /products/{productSlug}?store={storeSlug}&category={categorySlug}&menu={menuSlug}
   */
  function getOrderProductUrl(
    productSlug: string,
    categorySlug: string,
    itemMenuSlug?: string,
    storeSlug?: string,
    extraParams?: Record<string, string>
  ): string {
    const store = storeSlug || storeSlugFromRedux || '';
    const menu = itemMenuSlug || 'all-day';
    let url = `/products/${productSlug}?store=${store}&category=${categorySlug}&menu=${menu}`;
    
    if (extraParams) {
      Object.entries(extraParams).forEach(([key, value]) => {
        if (value) url += `&${key}=${value}`;
      });
    }
    return appendQrTokenIfActive(url);
  }

  /**
   * Generate product URL from cart/order item (menu before category)
   * Format: /products/{productSlug}?store={storeSlug}&menu={menuSlug}&category={categorySlug}
   */
  function getCartItemProductUrl(
    productSlug: string,
    categorySlug: string,
    itemMenuSlug?: string,
    storeSlug?: string,
    extraParams?: Record<string, string>
  ): string {
    const store = storeSlug || storeSlugFromRedux || '';
    const menu = itemMenuSlug || 'all-day';
    let url = `/products/${productSlug}?store=${store}&menu=${menu}&category=${categorySlug}`;
    
    if (extraParams) {
      Object.entries(extraParams).forEach(([key, value]) => {
        if (value) url += `&${key}=${value}`;
      });
    }
    return appendQrTokenIfActive(url);
  }

  // ========== Category/Menu URL Generation Functions ==========

  /**
   * Generate category page URL (PLP)
   * Format: /{storeSlug}/{menuSlug}/{categorySlug}
   * Query params: pass via extraParams (e.g. { qrToken: '...' }); only these are appended.
   */
  function getCategoryUrl(
    categorySlug: string,
    menuSlug?: string,
    storeSlug?: string,
    extraParams?: Record<string, string>
  ): string {
    const store = storeSlug || storeSlugFromParams || storeSlugFromRedux || '';
    const menu = menuSlug || menuSlugFromParams || '';
    let url = `/${store}/${menu}/${categorySlug}`;
    const params = { ...extraParams };
    if (Object.keys(params).length > 0) {
      const queryString = Object.entries(params)
        .filter(([, value]) => value)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      if (queryString) url += `?${queryString}`;
    }
    return url;
  }

  /**
   * Generate menu page URL
   * Format: /{storeSlug}/{menuSlug}
   */
  function getMenuUrl(
    menuSlug?: string,
    storeSlug?: string
  ): string {
    const store = storeSlug || storeSlugFromParams || storeSlugFromRedux || '';
    const menu = menuSlug || menuSlugFromParams || '';
    return appendQrTokenIfActive(`/${store}/${menu}`);
  }

  /**
   * Generate full menu URL (for showing all products without category filter)
   * Format: /{storeSlug}/{menuSlug}/full-menu
   * Query params: pass via extraParams (e.g. { qrToken: '...' }); only these are appended.
   */
  function getFullMenuUrl (
    menuSlug: string = menuSlugFromParams,
    storeSlug: string = storeSlugFromParams,
    extraParams: Record<string, string> = {}
  ): string {
    const store = storeSlug || '';
    const menu = menuSlug || '';
    let url = `/${store}/${menu}/full-menu`;
    const params = { ...extraParams };
    if (Object.keys(params).length > 0) {
      const queryString = Object.entries(params)
        .filter(([, value]) => value)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      if (queryString) url += `?${queryString}`;
    }
    return url;
  }

  /**
   * Generate store page URL
   * Format: /{storeSlug}
   */
  function getStoreUrl(storeSlug?: string): string {
    const store = storeSlug || storeSlugFromParams || storeSlugFromRedux || '';
    return appendQrTokenIfActive(`/${store}`);
  }

  /**
   * Generate cart page URL
   * Format: /{storeSlug}/cart
   */
  function getCartUrl(storeSlug?: string): string {
    const store = storeSlug || storeSlugFromParams || storeSlugFromRedux || '';
    const url = store ? `/${store}/cart` : '/cart';
    return appendQrTokenIfActive(url);
  }

  /**
   * Generate combo step URL with query params
   * Format: /{storeSlug}/{menuSlug}/{categorySlug}?type=combo&step={stepName}
   */
  function getComboStepUrl(
    categorySlug: string,
    stepName: string,
    menuSlug?: string,
    storeSlug?: string
  ): string {
    const store = storeSlug || storeSlugFromParams || storeSlugFromRedux || '';
    const menu = menuSlug || menuSlugFromParams || '';
    const url = `/${store}/${menu}/${categorySlug}?type=combo&step=${encodeURIComponent(stepName)}`;
    return appendQrTokenIfActive(url);
  }

  // ========== Utility Page URL Functions ==========

  /**
   * Generate wishlist page URL
   * Format: /{storeSlug}/{menuSlug}/wishlist
   */
  function getWishlistUrl(menuSlug?: string, storeSlug?: string): string {
    const store = storeSlug || storeSlugFromParams || storeSlugFromRedux || '';
    const menu = menuSlug || menuSlugFromParams || '';
    return appendQrTokenIfActive(`/${store}/${menu}/wishlist`);
  }

  /**
   * Generate checkout page URL
   * Format: /{storeSlug}/checkout
   */
  function getCheckoutUrl(storeSlug?: string): string {
    const store = storeSlug || storeSlugFromParams || storeSlugFromRedux || '';
    const url = store ? `/${store}/checkout` : '/checkout';
    return appendQrTokenIfActive(url);
  }

  /**
   * Generate payment page URL
   * Format: /payment/{orderId}?storeId={storeId}
   */
  function getPaymentUrl(orderId: string, storeId?: string): string {
    const store =
      storeId || storeSlugFromParams || storeSlugFromRedux || '';
    let url = `/payment/${orderId}`;
    if (store) {
      url += `?storeId=${store}`;
    }
    return appendQrTokenIfActive(url);
  }

  /**
   * Generate QR checkout page URL (for active order tile in QR flow)
   * Format: /{storeSlug}/qr-checkout?qrToken={qrToken}
   */
  function getQrCheckoutUrl(storeSlug?: string, qrTokenParam?: string): string {
    const store =
      storeSlug ||
      storeSlugFromParams ||
      storeSlugFromRedux ||
      qrResolveData?.storefrontSlug ||
      '';
    const token = qrTokenParam ?? qrToken ?? '';
    if (!store || !token) return getCartUrl(store || undefined);
    return `/${store}/qr-checkout?qrToken=${encodeURIComponent(token)}`;
  }

  /**
   * Generate orders page URL
   * Format: /orders (with qrToken appended when QR flow is active)
   */
  function getOrdersUrl(): string {
    return appendQrTokenIfActive('/orders');
  }

  /**
   * Generate edit profile page URL
   * Format: /editProfile (qrToken appended when QR flow is active)
   */
  function getEditProfileUrl(): string {
    return appendQrTokenIfActive('/editProfile');
  }

  /**
   * Generate edit profile → update email URL (mobile route)
   * Format: /editProfile/updateEmail (qrToken appended when QR flow is active)
   */
  function getEditProfileUpdateEmailUrl(): string {
    return appendQrTokenIfActive('/editProfile/updateEmail');
  }

  /**
   * Generate edit profile → update phone URL (mobile route)
   * Format: /editProfile/updatePhone (qrToken appended when QR flow is active)
   */
  function getEditProfileUpdatePhoneUrl(): string {
    return appendQrTokenIfActive('/editProfile/updatePhone');
  }

  return {
    // Product URL functions
    getProductUrl,
    getSearchProductUrl,
    getOrderProductUrl,
    getCartItemProductUrl,
    // Category/Menu URL functions
    getCategoryUrl,
    getMenuUrl,
    getFullMenuUrl,
    getStoreUrl,
    getCartUrl,
    getQrCheckoutUrl,
    getComboStepUrl,
    // Utility page URL functions
    getWishlistUrl,
    getCheckoutUrl,
    getPaymentUrl,
    getOrdersUrl,
    getEditProfileUrl,
    getEditProfileUpdateEmailUrl,
    getEditProfileUpdatePhoneUrl,
    /** Append qrToken to any URL when QR flow is active (for back navigation, etc.) */
    appendQrTokenIfActive,
    // Current context values
    storeSlug: storeSlugFromRedux || storeSlugFromParams,
    menuSlug: menuSlugFromParams,
    categorySlug: categorySlugFromParams,
  };
}

export default useProductUrl;
