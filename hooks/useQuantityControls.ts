import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useStoreCart } from './storepage/useStore';
import { updateStoreCart } from '@services/cartService';
import { RootState } from '@redux/store';
import { selectQrFlow } from '@redux/slices/qrFlowSlice';
import { useToast } from '@components/toast/Toast';
import { updateItemQuantity, setItemQuantity } from '@redux/slices/cartSlice';
import { close_dialog } from '@lib/modalHandler';
import useAnalytics from './useAnalytics';

interface CartPayload {
  id: string;
  customType: string;
  cartItemId?: string;
  quantity?: number;
  specialInstructions?: string | null;
  modifierGroups?: [{
    modifierGroupId: string,
    modifiers: string,
    modifierId: number,
    quantity: number,
  }]
  orderInstruction?: string;
  promoCodeId?: string;
  promoCode?: string;
  freebieIdPayload?: {
    customType: string,
    id: string,
    freebieProductId: string,
    freebieOfferId: string,
    cartItemId: string,
  }
  freebieProductId?: string;
  freebieOfferId?: string;
  tipAmount?: number;
}

export interface QuantityControlOptions {
  /** When true, skip calling handleGetCart after a successful PATCH. Use when batching multiple updates then calling get once. */
  skipGetCart?: boolean;
}

export const useQuantityControls = (cartId: string) => {
  const { handleGetCart, cartData } = useStoreCart();
  const store = useSelector((state: RootState) => state.store);
  const isQrFlow = useSelector(selectQrFlow);
  const toast = useToast();
  const dispatch = useDispatch();
  const { trackCartItemQuantityUpdate, trackCartItemRemoved } = useAnalytics();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const requestSequenceRef = useRef<number>(0);

  const handleQuantity = async (
    customType: string,
    itemId: string,
    instructions?: string,
    orderInstruction?: string,
    modifierGroup?: {
      modifierGroupId: string,
      modifiers: string,
      modifierId: number,
      quantity: number,
    },
    promoCodeId?: string,
    freebieIdPayload?: {
      customType: string,
      id: string,
      freebieProductId: string,
      freebieOfferId: string,
      cartItemId: string,
    },
    deliveryTip?: number,
    promoCode?: string,
    options?: QuantityControlOptions,
  ) => {
    // In QR flow do not call cart PATCH API
    if (isQrFlow) {
      setLoading(false);
      return;
    }

    // Track this request sequence
    const currentSequence = ++requestSequenceRef.current;
    // Capture pre-optimistic qty so we can restore UI if PATCH fails
    let quantityBeforeOptimisticUpdate: number | null = null;
    setLoading(true);
    try {
      const payload: CartPayload = {
        id: cartId,
        customType,
        cartItemId: itemId,
      };

      if (customType === 'ADD_QUANTITY' || customType === 'SUBTRACT_QUANTITY') {
        payload.quantity = 1;
        // Include special instructions when repeating last customization
        if (instructions && instructions.trim() !== '') {
          payload.specialInstructions = instructions.trim();
        }
        
        // Get current item data for analytics tracking
        const currentItem = cartData?.data?.items?.find((item: any) => item.id === itemId);
        const previousQuantity = currentItem?.quantity || 0;
        quantityBeforeOptimisticUpdate = previousQuantity;
        const newQuantity = customType === 'ADD_QUANTITY' ? previousQuantity + 1 : Math.max(0, previousQuantity - 1);
        const action = customType === 'ADD_QUANTITY' ? 'increase' : 'decrease';
        const unitPrice = currentItem?.unitBasePrice || currentItem?.totalBasePrice || 0;
        const cartValue = cartData?.data?.total?.finalAmount || 0;
        
        // Update local state immediately for better UX (optimistic update)
        dispatch(updateItemQuantity({ 
          itemId, 
          type: customType === 'ADD_QUANTITY' ? 'increment' : 'decrement' 
        }));
        
        // Track quantity update after optimistic update
        if (currentItem?.productId && previousQuantity > 0) {
          trackCartItemQuantityUpdate({
            product_id: currentItem.productId,
            previous_quantity: previousQuantity,
            new_quantity: newQuantity,
            action: action as 'increase' | 'decrease',
            price: unitPrice,
            cart_value: cartValue,
          });
        }
      }

      if (customType === 'UPDATE_SPECIAL_INSTRUCTIONS') {
        // Backend API limitation: specialInstructions field is required when updating
        // For now, set it to a single space which backend might accept as "empty"
        payload.specialInstructions = (instructions && instructions.trim() !== '') 
          ? instructions.trim() 
          : ' '; // Send space character to bypass validation
      }

      if (customType === 'UPDATE_MODIFIERS' && modifierGroup) {
        payload.modifierGroups = [modifierGroup];
      }

      if (customType === 'UPDATE_ORDER_INSTRUCTION') {
        delete payload.cartItemId;
        payload.orderInstruction = orderInstruction;
      }

      if (customType === 'APPLY_PROMO_CODE') {
        delete payload.cartItemId;
        payload.promoCodeId = promoCodeId;
        payload.promoCode = promoCode;
      }

      if (customType === 'REMOVE_PROMO_CODE') {
        delete payload.cartItemId;
      }

      if (customType === 'UPDATE_TIP') {
        delete payload.cartItemId;
        payload.tipAmount = deliveryTip;
      }

      if (customType === 'ADD_FREEBIE') {
        payload.customType = "ADD_FREEBIE";
        payload.id = freebieIdPayload?.id as string;
        payload.cartItemId = freebieIdPayload?.cartItemId as string;
        payload.freebieProductId = freebieIdPayload?.freebieProductId as string;
        payload.freebieOfferId = freebieIdPayload?.freebieOfferId as string;
        payload.cartItemId = freebieIdPayload?.cartItemId as string;
      }

      const response = await updateStoreCart(store?.currentStore?.id as string, payload);

      // Only process response if this is still the latest request
      // This prevents stale responses from overwriting newer state
      // if (currentSequence !== requestSequenceRef.current) {
      //   return null; // This request is stale, ignore it
      // }
      if (response && response?.message === "Success") {
        // Track item removal before refreshing cart
        if (customType === 'DELETE_ITEM') {
          const deletedItem = cartData?.data?.items?.find((item: any) => item.id === itemId);
          if (deletedItem?.productId) {
            const cartValueAfterRemoval = (cartData?.data?.total?.finalAmount || 0) - (deletedItem.subTotalAfterDiscount || 0);
            const productNameObj = deletedItem.productName as Record<string, string> | undefined;
            const productName = productNameObj?.en || productNameObj?.[Object.keys(productNameObj || {})[0]] || '';
            trackCartItemRemoved({
              product_id: deletedItem.productId,
              product_name: productName,
              quantity: deletedItem.quantity || 0,
              cart_value_after_removal: Math.max(0, cartValueAfterRemoval),
            });
          }
        }
        
      // Refresh cart for impactful changes; skip for UPDATE_TIP to avoid jarring reloads
      if (!options?.skipGetCart) {
        if (customType === 'ADD_QUANTITY'
          || customType === 'SUBTRACT_QUANTITY'
          || customType === 'DELETE_ITEM'
          || customType === 'UPDATE_SPECIAL_INSTRUCTIONS'
          || customType === 'UPDATE_ORDER_INSTRUCTION'
          || customType === 'APPLY_PROMO_CODE'
          || customType === 'REMOVE_PROMO_CODE'
          || customType === 'ADD_FREEBIE') {
          // Pass the current sequence to ensure only latest GET request updates state
          handleGetCart(store?.currentStore?.id as string);
        } else if (!response.data) {
          handleGetCart(store?.currentStore?.id as string);
        }
      }
    }
      if (customType === 'UPDATE_SPECIAL_INSTRUCTIONS') {
        close_dialog(["instructions"]);
      }
      setError(null); // reset previous errors if successful
      return response;
    } catch (err: unknown) {
      // Only handle error if this is still the latest request
      if (currentSequence === requestSequenceRef.current) {
        // Undo optimistic qty so UI does not stay ahead of a failed cart PATCH
        if (
          (customType === 'ADD_QUANTITY' || customType === 'SUBTRACT_QUANTITY') &&
          quantityBeforeOptimisticUpdate !== null
        ) {
          dispatch(
            setItemQuantity({
              itemId,
              quantity: quantityBeforeOptimisticUpdate,
            }),
          );
        }

        const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'An error occurred';
        toast('error', message);
        setError(message);
        // Sync from server. Do not pass quantity-controls sequence — useStore has its own.
        handleGetCart(store?.currentStore?.id as string);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    handleQuantity,
    error,
    loading,
  };
};
