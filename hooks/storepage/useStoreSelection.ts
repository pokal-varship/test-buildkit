import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentStore } from '@redux/slices/storeSlice';
import { Store } from '@components/type/store.types';
import { setStoreAddress } from '@redux/slices/addressSlice';
import useProductUrl from '@hooks/useProductUrl';
import { clearCart } from '@redux/slices/cartSlice';
import { RootState } from '@redux/store';
import { selectQrToken } from '@redux/slices/qrFlowSlice';
import { useQRToken } from '@components/provider/QRProvider';

export interface SelectStoreOptions {
    /** When true, redirect to /{storeSlug}/{menuSlug}/full-menu (e.g. scan-order flow) */
    redirectToFullMenu?: boolean;
}

export const useStoreSelection = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { getMenuUrl, getFullMenuUrl } = useProductUrl();
    const currentStore = useSelector((state: RootState) => state.store.currentStore);
    const qrTokenFromRedux = useSelector(selectQrToken);
    const qrTokenFromContext = useQRToken();
    const qrToken = qrTokenFromContext ?? qrTokenFromRedux;

    const selectStore = (store: Store, menuSlug: string, onClose?: () => void, options?: SelectStoreOptions) => {
        // Clear cart if switching to a different store
        if (currentStore && currentStore.id !== store.id) {
            dispatch(clearCart());
        }

        // Save the store data to Redux
        dispatch(setCurrentStore(store));
        dispatch(setStoreAddress(store.address.address));

        // Close modal if callback is provided
        if (onClose) {
            onClose();
        }
        const url = options?.redirectToFullMenu
            ? getFullMenuUrl(menuSlug, store.slug, qrToken ? { qrToken } : {})
            : getMenuUrl(menuSlug, store.slug);
        router.push(url);
    };

    return {
        selectStore,
    };
}; 