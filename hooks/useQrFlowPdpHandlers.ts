import { useCallback } from "react";
import { addItemsToTicket } from "@services/ticketService";
import { getSession } from "@services/sessionService";
import { setDineInSessionData } from "@redux/slices/qrFlowSlice";
import { close_dialog } from "@lib/modalHandler";
import type { CartItem } from "@services/storePage";
import type { MultipleCustomizationsStagedState } from "@components/dialogDrawer/modal/Cart/MultipleCustomizations";
import type { AppDispatch } from "@redux/store";
import type { TicketQuantityOptions} from "@hooks/useTicketQuantityControls";

export type UseQrFlowPdpHandlersParams = {
  storeId: string | undefined;
  sessionId: string | null;
  sessionTableId: string | null;
  setLoading: (v: boolean) => void;
  toast: (type: string, msg?: string) => void;
  showAddToCartSuccessToast: () => void;
  dispatch: AppDispatch;
  syntheticCartItemForQr: CartItem | null;
  handleTicketQuantity: (
    action: string,
    itemId: string,
    options?: TicketQuantityOptions
  ) => Promise<unknown>;
};

/**
 * QR-flow-only PDP handlers: add removed item, confirm multiple customizations, repeat last.
 * Used by ProductOptions so QR logic stays in one place and does not clutter the main component.
 */
export function useQrFlowPdpHandlers(params: UseQrFlowPdpHandlersParams) {
  const {
    storeId,
    sessionId,
    sessionTableId,
    setLoading,
    toast,
    showAddToCartSuccessToast,
    dispatch,
    syntheticCartItemForQr,
    handleTicketQuantity,
  } = params;

  const handleAddRemovedItemQr = useCallback(
    async (removedItem: CartItem) => {
      if (!sessionId || !storeId) {
        toast("error", "Session or store not found.");
        return;
      }
      try {
        setLoading(true);
        await addItemsToTicket(storeId, {
          sessionId,
          items: [
            {
              itemId: removedItem.productId,
              itemSku: removedItem.productSku ?? removedItem.productId,
              variantId: removedItem.variantId || undefined,
              quantity: 1,
              sequenceNumber: 1,
            },
          ],
        });
        const sessionData = await getSession(storeId, {
          tableId: sessionTableId ?? undefined,
          sessionId,
        });
        dispatch(setDineInSessionData(sessionData));
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast("error", err?.response?.data?.message ?? "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [sessionId, storeId, sessionTableId, setLoading, toast, dispatch]
  );

  const handleMultipleCustomizationsConfirmQr = useCallback(
    async (isRemoveDialog?: boolean, stagedState?: MultipleCustomizationsStagedState) => {
      if (!sessionId || !storeId) {
        toast("error", "Session or store not found.");
        return;
      }
      try {
        setLoading(true);
        if (stagedState) {
          const { items: stagedItems, removedItems: stagedRemoved, initialItems } = stagedState;
          const initialById = new Map((initialItems || []).map((i) => [i.id, i]));
          const stagedById = new Map((stagedItems || []).map((i) => [i.id, i]));

          const toDeleteIds = new Set<string>();
          (stagedRemoved || []).forEach((r) => {
            if (r?.id) toDeleteIds.add(r.id);
          });
          initialItems?.forEach((init) => {
            if (!init?.id) return;
            const staged = stagedById.get(init.id);
            if (!staged || (staged.quantity ?? 0) === 0) toDeleteIds.add(init.id);
          });
          for (const id of toDeleteIds) {
            const item = initialItems?.find((i) => i.id === id);
            if (item && item.id) await handleTicketQuantity("DELETE_ITEM", item.id);
          }

          for (const item of stagedItems || []) {
            if (!item?.id || (item.quantity ?? 0) === 0) continue;
            if (toDeleteIds.has(item.id)) continue;
            const initialItem = initialById.get(item.id);
            const initialQty = initialItem?.quantity ?? 0;
            const newQty = item.quantity ?? 0;
            const itemToSend = {
              ...item,
              specialInstructions: item.specialInstructions ?? initialItem?.specialInstructions ?? "",
            };

            if (newQty > initialQty) {
              const addCount = newQty - initialQty;
              for (let i = 0; i < addCount; i++) {
                await handleTicketQuantity("ADD_QUANTITY", itemToSend.id, { instructions: itemToSend.specialInstructions, skipGetSession: true });
              }
            } else if (initialItem && newQty < initialQty) {
              let currentQty = initialQty;
              const toReduce = initialQty - newQty;
              for (let i = 0; i < toReduce; i++) {
                if (currentQty === 1) {
                  await handleTicketQuantity("DELETE_ITEM", itemToSend.id, { instructions: itemToSend.specialInstructions, skipGetSession: true });
                  break;
                }
                await handleTicketQuantity("SUBTRACT_QUANTITY", itemToSend.id, { instructions: itemToSend.specialInstructions, skipGetSession: true });
                currentQty--;
              }
            }
          }
        }

        const sessionData = await getSession(storeId, {
          tableId: sessionTableId ?? undefined,
          sessionId,
        });
        dispatch(setDineInSessionData(sessionData));
        close_dialog(["multipleCustomizations"]);
        if (!isRemoveDialog) {
          showAddToCartSuccessToast();
        }
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast("error", err?.response?.data?.message ?? "Something went wrong");
        if (sessionId && storeId) {
          const sessionData = await getSession(storeId, {
            tableId: sessionTableId ?? undefined,
            sessionId,
          });
          dispatch(setDineInSessionData(sessionData));
        }
      } finally {
        setLoading(false);
      }
    },
    [
      sessionId,
      storeId,
      sessionTableId,
      setLoading,
      toast,
      dispatch,
      showAddToCartSuccessToast,
      handleTicketQuantity,
    ]
  );

  const handleRepeatLastQr = useCallback(
    // Signature must match dialog onYes(customType, itemId)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (_customType: string, _itemId: string) => {
      try {
        setLoading(true);
        close_dialog(["customizationRepeat"]);
        if (syntheticCartItemForQr && syntheticCartItemForQr.id) await handleTicketQuantity("ADD_QUANTITY", syntheticCartItemForQr.id, { instructions: syntheticCartItemForQr.specialInstructions });
        showAddToCartSuccessToast();
      } catch (err) {
        const e = err as { response?: { data?: { message?: string } } };
        toast("error", e?.response?.data?.message ?? "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, syntheticCartItemForQr, handleTicketQuantity, showAddToCartSuccessToast, toast]
  );

  return { handleAddRemovedItemQr, handleMultipleCustomizationsConfirmQr, handleRepeatLastQr };
}
