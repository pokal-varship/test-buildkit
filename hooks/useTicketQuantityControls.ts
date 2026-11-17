import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@redux/store";
import {
  selectSessionId,
  selectSessionTableId,
  selectQrResolveData,
  selectSessionSummary,
  setDineInSessionData,
} from "@redux/slices/qrFlowSlice";
import { getSession } from "@services/sessionService";
import { updateTicketItems } from "@services/ticketService";
import type { TicketItemPayload } from "@services/ticketService";
import { useToast } from "@components/toast/Toast";
import { close_dialog } from "@lib/modalHandler";
import { useSessionTicketItems } from "@hooks/useQrSessionDerivedState";
import useAnalytics from "@hooks/useAnalytics";

export interface TicketQuantityOptions {
  instructions?: string;
  orderInstruction?: string;
  modifierGroup?: TicketQuantityModifierGroup;
  promoCodeId?: string;
  freebieIdPayload?: TicketQuantityFreebiePayload;
  deliveryTip?: number;
  promoCode?: string;
  /** When true, skip calling getSession after a successful API call. */
  skipGetSession?: boolean;
}

export interface TicketQuantityModifierGroup {
  modifierGroupId: string;
  modifiers: string;
  modifierId: number;
  quantity: number;
}

export interface TicketQuantityFreebiePayload {
  customType: string;
  id: string;
  freebieProductId: string;
  freebieOfferId: string;
  cartItemId: string;
}

/**
 * Hook for QR/dine-in flow: updates line-item quantity or special instructions
 * via the ticket items API (POST /storefronts/tickets/items) instead of the cart API.
 * Uses the exact same signature as useQuantityControls for consistency.
 */
export function useTicketQuantityControls() {
  const dispatch = useDispatch();
  const toast = useToast();
  const store = useSelector((state: RootState) => state.store);
  const sessionId = useSelector(selectSessionId);
  const tableId = useSelector(selectSessionTableId);
  const qrResolveData = useSelector(selectQrResolveData);
  const sessionTicketItems = useSessionTicketItems();
  const sessionSummary = useSelector(selectSessionSummary);
  const {
    trackDineInCartItemQuantityUpdate,
    trackDineInCartItemRemoved,
  } = useAnalytics();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSequenceRef = useRef<number>(0);

  const handleTicketQuantity = async (
    customType: string,
    itemId: string,
    options?: TicketQuantityOptions,
  ) => {
    const { instructions, modifierGroup, freebieIdPayload, skipGetSession } =
      options || {};

    const storeId =
      store?.currentStore?.id ?? qrResolveData?.storefrontId ?? undefined;

    if (!sessionId || !storeId) {
      toast("error", "Session or store not found.");
      return;
    }

    const currentSequence = ++requestSequenceRef.current;

    // In QR flow, the "itemId" passed from components is typically the ticket item ID
    // (since we map session data id to cart item id). Fallback to searching if not.
    let ticketItemId = itemId;
    const ticketItem = sessionTicketItems.find((t) => t.id === itemId);
    let resolvedTicketItem = ticketItem;

    // If we couldn't find it by ID directly, it might be a productId passed instead.
    if (!ticketItem) {
      const matched = sessionTicketItems.find(
        (t) => t.itemId === itemId || t.productId === itemId,
      );
      if (matched) {
        ticketItemId = matched.id;
        resolvedTicketItem = matched;
      }
    }

    const ticketItemPayload: TicketItemPayload = {
      ticketItemId: ticketItemId || itemId,
      quantity: 1,
      customType: customType as TicketItemPayload["customType"],
    };

    if (customType === "UPDATE_SPECIAL_INSTRUCTIONS") {
      ticketItemPayload.specialInstructions =
        instructions && instructions.trim() !== "" ? instructions.trim() : " ";
    } else if (
      customType === "ADD_QUANTITY" ||
      customType === "SUBTRACT_QUANTITY"
    ) {
      if (instructions && instructions.trim() !== "") {
        ticketItemPayload.specialInstructions = instructions.trim();
      }
    } else if (customType === "UPDATE_MODIFIERS" && modifierGroup) {
      // If we ever need to support modifier updates in ticket flow like we do in cart:
      ticketItemPayload.modifierGroups = [
        {
          modifierGroupId: modifierGroup.modifierGroupId,
          modifiers: [
            {
              modifierId: modifierGroup.modifierId.toString(),
              quantity: modifierGroup.quantity,
            },
          ],
        },
      ];
    } else if (customType === "ADD_FREEBIE") {
      // Freebie selection is product-level in ticket flow.
      ticketItemPayload.ticketItemId = undefined;
      ticketItemPayload.itemId = itemId;
      ticketItemPayload.freebieProductId = freebieIdPayload?.freebieProductId;
      ticketItemPayload.freebieOfferId = freebieIdPayload?.freebieOfferId;
      ticketItemPayload.cartItemId = freebieIdPayload?.cartItemId;
    }

    setLoading(true);
    setError(null);
    try {
      // All operations in this hook are updates (quantity/delete/instructions); use PATCH like cart's updateStoreCart
      const response = await updateTicketItems(storeId, {
        sessionId,
        items: [ticketItemPayload],
      });

      if (!skipGetSession) {
        const sessionData = await getSession(storeId, {
          tableId: tableId ?? undefined,
          sessionId,
        });
        dispatch(setDineInSessionData(sessionData));
      }

      if (customType === "UPDATE_SPECIAL_INSTRUCTIONS") {
        close_dialog(["instructions"]);
      }

      const cartValue =
        (sessionSummary?.finalAmount as number | undefined) ?? 0;
      const matchedItem = resolvedTicketItem;
      const productId =
        matchedItem?.itemId ?? matchedItem?.productId ?? itemId;
      const productName =
        matchedItem?.itemName ??
        matchedItem?.productName?.en ??
        matchedItem?.productName?.ar ??
        "";

      if (customType === "DELETE_ITEM") {
        void trackDineInCartItemRemoved({
          product_id: String(productId),
          product_name: String(productName),
          quantity: matchedItem?.quantity ?? 1,
          cart_value_after_removal: cartValue,
          session_id: String(sessionId),
        });
      } else if (
        customType === "ADD_QUANTITY" ||
        customType === "SUBTRACT_QUANTITY"
      ) {
        const previousQty = matchedItem?.quantity ?? 0;
        const newQty =
          customType === "ADD_QUANTITY"
            ? previousQty + 1
            : Math.max(0, previousQty - 1);
        void trackDineInCartItemQuantityUpdate({
          product_id: String(productId),
          previous_quantity: previousQty,
          new_quantity: newQty,
          action: customType === "ADD_QUANTITY" ? "increase" : "decrease",
          price: matchedItem?.unitPrice ?? 0,
          cart_value: cartValue,
          session_id: String(sessionId),
        });
      }

      setError(null);
      return response;
    } catch (err: unknown) {
      if (currentSequence === requestSequenceRef.current) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Something went wrong";
        toast("error", message);
        setError(message);
      }
      throw err;
    } finally {
      if (currentSequence === requestSequenceRef.current) {
        setLoading(false);
      }
    }
  };

  return {
    handleTicketQuantity,
    loading,
    error,
  };
}
