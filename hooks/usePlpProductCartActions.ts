"use client";

import { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { TypesenseProduct } from "@services/typesense/types";
import { AddToCartPayload } from "@components/type/pdp.type";
import { addToCart } from "@services/pdp";
import { useStoreCart } from "@hooks/storepage/useStore";
import { useQuantityControls } from "@hooks/useQuantityControls";
import { useTicketQuantityControls } from "@hooks/useTicketQuantityControls";
import { selectCart } from "@redux/slices/cartSlice";
import {
  selectIsQrFlowActive,
  selectQrResolveData,
  selectSessionId,
  selectSessionTableId,
} from "@redux/slices/qrFlowSlice";
import { RootState } from "@redux/store";
import { useSessionTicketItems } from "@hooks/useQrSessionDerivedState";
import { useToast } from "@components/toast/Toast";
import useLang from "@hooks/useLang";
import { LanguageCode, TranslationKeys } from "types";
import { addItemsToTicket } from "@services/ticketService";
import { getSession, SessionTicketItem } from "@services/sessionService";
import { setDineInSessionData } from "@redux/slices/qrFlowSlice";
import { CartItem } from "@services/storePage";
import { close_dialog, open_dialog } from "@lib/modalHandler";
import type { MultipleCustomizationsStagedState } from "@components/dialogDrawer/modal/Cart/MultipleCustomizations";
import {
  getProductItemsAndLineCount,
  sessionTicketItemToCartItem,
} from "../utils/sessionTicketItemToCartItem";
import { useQrFlowPdpHandlers } from "@hooks/useQrFlowPdpHandlers";
import {
  appendPdpChooseParams,
  customizationRepeatDialogSx,
  getCustomizationRepeatDisplayForCartItem,
  getModifierDescriptionForCartItem,
  getRepeatPricesForCartItem,
} from "@hooks/plpCustomizationUtils";

function getPlpVariantId(product: TypesenseProduct): string | undefined {
  const primaryVariant = product.primaryVariant;

  return (
    primaryVariant?.variantId ||
    primaryVariant?.id ||
    primaryVariant?._id ||
    product.variants?.[0]?._id
  );
}

function buildAddToCartPayload(
  product: TypesenseProduct,
  menuSlug?: string,
): AddToCartPayload {
  const shouldSendVariantId = product.type?.hasVariants === true;
  const variantId = getPlpVariantId(product);

  return {
    quantity: 1,
    productId: product.productId || product.id || "",
    ...(menuSlug && menuSlug !== "all-day" && { menuSlug }),
    ...(shouldSendVariantId && variantId && { variantId: String(variantId) }),
  };
}

function findSimpleCartItem(
  items: CartItem[] | undefined,
  productId: string,
): CartItem | undefined {
  if (!items?.length) return undefined;

  return (
    items.find(
      (item) =>
        item.productId === productId &&
        (!item.modifierGroup || item.modifierGroup.length === 0),
    ) ?? items.find((item) => item.productId === productId)
  );
}

function findTicketItem(
  items: SessionTicketItem[],
  productId: string,
): SessionTicketItem | undefined {
  return items.find(
    (item) => item.itemId === productId || item.productId === productId,
  );
}

export function usePlpProductCartActions({
  product,
  isCustomisable,
  productLink,
  onProductClick,
  onAddClick,
}: {
  product: TypesenseProduct;
  isCustomisable: boolean;
  productLink?: string;
  onProductClick?: () => void;
  onAddClick?: (product: TypesenseProduct) => void;
}) {
  const router = useRouter();
  const params = useParams();
  const menuSlug = params?.menuSlug as string | undefined;
  const dispatch = useDispatch();
  const toast = useToast();
  const [lang, language]: [TranslationKeys, LanguageCode] = useLang();
  const [isAdding, setIsAdding] = useState(false);
  const [isDialogLoading, setIsDialogLoading] = useState(false);

  const cartData = useSelector(selectCart).cartData;
  const store = useSelector((state: RootState) => state.store);
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const qrResolveData = useSelector(selectQrResolveData);
  const sessionId = useSelector(selectSessionId);
  const sessionTableId = useSelector(selectSessionTableId);
  const sessionTicketItems = useSessionTicketItems();
  const { handleGetCart } = useStoreCart();

  const cartId = cartData?.data?.id || "";
  const { handleQuantity, loading: quantityLoading } =
    useQuantityControls(cartId);
  const { handleTicketQuantity, loading: ticketLoading } =
    useTicketQuantityControls();

  const productId = product.productId || product.id || "";

  const cartItem = useMemo(
    () => findSimpleCartItem(cartData?.data?.items, productId),
    [cartData?.data?.items, productId],
  );

  const ticketItem = useMemo(
    () => findTicketItem(sessionTicketItems, productId),
    [sessionTicketItems, productId],
  );

  const matchingSessionItems = useMemo(
    () =>
      sessionTicketItems.filter(
        (item) =>
          (item.itemId === productId || item.productId === productId) &&
          (item.quantity || 0) > 0,
      ),
    [sessionTicketItems, productId],
  );

  const allSessionItemsAsCart = useMemo((): CartItem[] => {
    const productForCart = {
      id: productId,
      name: product.name,
      slug: product.seo?.urlManagement?.customSlug,
    };
    return matchingSessionItems.map((ticketItem) =>
      sessionTicketItemToCartItem(ticketItem, productForCart),
    );
  }, [matchingSessionItems, product.name, product.seo?.urlManagement?.customSlug, productId]);

  const firstSessionItemAsCart = allSessionItemsAsCart[0] ?? null;

  const getDistinctProductLineCount = useMemo(
    () =>
      cartData?.data?.items?.filter(
        (item) => item.productId === productId && (item.quantity || 0) > 0,
      ).length ?? 0,
    [cartData?.data?.items, productId],
  );
  const getDistinctSessionLineCount = matchingSessionItems.length;

  const { allProductItems, lineCount } = useMemo(
    () =>
      getProductItemsAndLineCount({
        isQrFlow: isQrFlowActive,
        allSessionProductItemsAsCart: allSessionItemsAsCart,
        cartItems: cartData?.data?.items,
        productId,
        getDistinctSessionLineCount,
        getDistinctProductLineCount,
      }),
    [
      isQrFlowActive,
      allSessionItemsAsCart,
      cartData?.data?.items,
      productId,
      getDistinctSessionLineCount,
      getDistinctProductLineCount,
    ],
  );

  const repeatLineItem = useMemo((): CartItem | null => {
    if (isQrFlowActive) return firstSessionItemAsCart;
    const activeItems = allProductItems.filter((item) => (item.quantity || 0) > 0);
    return activeItems[activeItems.length - 1] ?? null;
  }, [isQrFlowActive, firstSessionItemAsCart, allProductItems]);

  const storeIdForQr =
    store?.currentStore?.id ?? qrResolveData?.storefrontId ?? undefined;

  const showAddToCartSuccessToast = useCallback(() => {
    toast("success", lang.itemHasBeenAddedOnCart);
  }, [toast, lang.itemHasBeenAddedOnCart]);

  const {
    handleAddRemovedItemQr,
    handleMultipleCustomizationsConfirmQr,
    handleRepeatLastQr,
  } = useQrFlowPdpHandlers({
    storeId: storeIdForQr,
    sessionId,
    sessionTableId,
    setLoading: setIsDialogLoading,
    toast: (type, msg) =>
      toast(type as "success" | "error" | "info", msg ?? "Something went wrong"),
    showAddToCartSuccessToast,
    dispatch,
    syntheticCartItemForQr: firstSessionItemAsCart,
    handleTicketQuantity,
  });

  const isCartActionLoading =
    isAdding || quantityLoading || ticketLoading || isDialogLoading;

  const navigateToPdpForChoose = useCallback(() => {
    onProductClick?.();
    if (productLink) {
      router.push(appendPdpChooseParams(productLink));
    }
  }, [onProductClick, productLink, router]);

  const handleDirectAdd = useCallback(async () => {
    if (isCustomisable) return;

    setIsAdding(true);
    try {
      const storeId = store?.currentStore?.id || "";

      if (isQrFlowActive) {
        if (!sessionId || !storeId) {
          toast("error", "Session or store not found.");
          return;
        }

        const payload = buildAddToCartPayload(product, menuSlug);
        const existingTicket = findTicketItem(sessionTicketItems, productId);

        if (existingTicket?.id) {
          await handleTicketQuantity("ADD_QUANTITY", existingTicket.id);
        } else {
          await addItemsToTicket(storeId, {
            sessionId,
            items: [
              {
                itemId: payload.productId,
                itemSku: product.sku || payload.productId,
                quantity: 1,
                sequenceNumber: 1,
                ...(payload.variantId && { variantId: payload.variantId }),
              },
            ],
          });
          const sessionData = await getSession(storeId, {
            tableId: sessionTableId ?? undefined,
            sessionId,
          });
          dispatch(setDineInSessionData(sessionData));
        }
      } else {
        if (!storeId) {
          toast("error", "Store not found.");
          return;
        }
        const payload = buildAddToCartPayload(product, menuSlug);
        await addToCart(storeId, payload);
        await handleGetCart(storeId);
      }

      toast("success", lang.itemHasBeenAddedOnCart);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || "Something went wrong";
      const lowerMessage = message.toLowerCase();

      if (
        lowerMessage.includes("variant") ||
        lowerMessage.includes("modifier") ||
        lowerMessage.includes("select")
      ) {
        if (productLink) {
          onProductClick?.();
          router.push(productLink);
        } else {
          toast("info", message);
        }
      } else {
        toast("error", message);
      }
    } finally {
      setIsAdding(false);
    }
  }, [
    isCustomisable,
    store?.currentStore?.id,
    isQrFlowActive,
    sessionId,
    sessionTableId,
    product,
    menuSlug,
    productId,
    sessionTicketItems,
    handleTicketQuantity,
    dispatch,
    handleGetCart,
    toast,
    lang.itemHasBeenAddedOnCart,
    productLink,
    onProductClick,
    router,
  ]);

  const handleRepeatLast = useCallback(
    async (customType: string, itemId: string) => {
      try {
        setIsDialogLoading(true);
        close_dialog(["customizationRepeat"]);
        await handleQuantity(
          customType,
          itemId,
          repeatLineItem?.specialInstructions,
        );
        showAddToCartSuccessToast();
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast("error", err?.response?.data?.message || "Something went wrong");
      } finally {
        setIsDialogLoading(false);
      }
    },
    [handleQuantity, repeatLineItem?.specialInstructions, showAddToCartSuccessToast, toast],
  );

  const handleAddRemovedItem = useCallback(
    async (removedItem: CartItem) => {
      if (isQrFlowActive) {
        return handleAddRemovedItemQr(removedItem);
      }

      try {
        setIsDialogLoading(true);
        const payload: AddToCartPayload = {
          quantity: 1,
          productId: removedItem.productId || productId,
          menuSlug: menuSlug || "",
          ...(menuSlug &&
            menuSlug !== "all-day" && { menuSlug }),
          ...(removedItem.variantId && { variantId: removedItem.variantId }),
          ...(removedItem.modifierGroup?.length && {
            modifierGroups: removedItem.modifierGroup.map((modGroup) => ({
              modifierGroupId: modGroup.modifierGroupId,
              modifiers: modGroup.modifiers.map((mod) => ({
                modifierId: mod.modifierId,
                quantity: 1,
              })),
            })),
          }),
        };

        await addToCart(store?.currentStore?.id || "", payload);
        await handleGetCart(store?.currentStore?.id || "");
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast("error", err?.response?.data?.message || "Something went wrong");
      } finally {
        setIsDialogLoading(false);
      }
    },
    [
      isQrFlowActive,
      handleAddRemovedItemQr,
      productId,
      menuSlug,
      store?.currentStore?.id,
      handleGetCart,
      toast,
    ],
  );

  const handleMultipleCustomizationsConfirm = useCallback(
    async (
      isRemoveDialog?: boolean,
      stagedState?: MultipleCustomizationsStagedState,
    ) => {
      if (isQrFlowActive) {
        return handleMultipleCustomizationsConfirmQr(isRemoveDialog, stagedState);
      }

      try {
        setIsDialogLoading(true);
        const batchOptions = { skipGetCart: true } as const;

        if (stagedState) {
          const {
            items: stagedItems,
            removedItems: stagedRemoved,
            initialItems,
          } = stagedState;
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
            await handleQuantity(
              "DELETE_ITEM",
              id,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              batchOptions,
            );
          }

          for (const item of stagedItems || []) {
            if (!item?.id || (item.quantity ?? 0) === 0) continue;
            if (toDeleteIds.has(item.id)) continue;

            const initialItem = initialById.get(item.id);
            const initialQty = initialItem?.quantity ?? 0;
            const newQty = item.quantity ?? 0;
            const specialInstructions =
              item.specialInstructions ?? initialItem?.specialInstructions;
            const alreadyInCartQty = initialItem ? 0 : 1;

            if (newQty > initialQty + alreadyInCartQty) {
              const addCount = newQty - initialQty - alreadyInCartQty;
              for (let i = 0; i < addCount; i++) {
                await handleQuantity(
                  "ADD_QUANTITY",
                  item.id,
                  specialInstructions ?? undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  batchOptions,
                );
              }
            } else if (initialItem && newQty < initialQty) {
              let currentQty = initialQty;
              const toReduce = initialQty - newQty;
              for (let i = 0; i < toReduce; i++) {
                if (currentQty === 1) {
                  await handleQuantity(
                    "DELETE_ITEM",
                    item.id,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    batchOptions,
                  );
                  break;
                }
                await handleQuantity(
                  "SUBTRACT_QUANTITY",
                  item.id,
                  specialInstructions ?? undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  batchOptions,
                );
                currentQty--;
              }
            }
          }
        }

        await handleGetCart(store?.currentStore?.id || "");
        close_dialog(["multipleCustomizations"]);

        if (!isRemoveDialog) {
          showAddToCartSuccessToast();
        }
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast("error", err?.response?.data?.message || "Something went wrong");
        await handleGetCart(store?.currentStore?.id || "");
      } finally {
        setIsDialogLoading(false);
      }
    },
    [
      isQrFlowActive,
      handleMultipleCustomizationsConfirmQr,
      handleQuantity,
      handleGetCart,
      store?.currentStore?.id,
      showAddToCartSuccessToast,
      toast,
    ],
  );

  const openMultipleCustomizationsDialog = useCallback(
    (isRemoveDialog: boolean) => {
      open_dialog("multipleCustomizations", {
        open: true,
        propsData: {
          title: isRemoveDialog
            ? "Remove previous customisation?"
            : lang.repeatTitle || "Repeat previous customisation?",
          items: allProductItems,
          getModifierDescription: (item: CartItem) =>
            getModifierDescriptionForCartItem(item, language),
          productId,
          showChooseButton: !isRemoveDialog,
          onConfirm: (stagedState: MultipleCustomizationsStagedState) =>
            handleMultipleCustomizationsConfirm(isRemoveDialog, stagedState),
          onAddItem: handleAddRemovedItem,
          isRemoveDialog,
          allowRemoveLastItem: isRemoveDialog,
          syncFromCart: !isQrFlowActive,
          onClose: () => {
            close_dialog(["multipleCustomizations"]);
            if (!isRemoveDialog) {
              navigateToPdpForChoose();
            }
          },
        },
        type: "multipleCustomizations",
        handlerDialog: () => {},
        handleClose: () => close_dialog(["multipleCustomizations"]),
        anchor: "bottom",
        className: "multiple-customizations-dialog",
        onlyDialog: false,
        dialogPosition: "bottom",
        sxStyle: customizationRepeatDialogSx,
      });
    },
    [
      lang.repeatTitle,
      allProductItems,
      productId,
      language,
      handleMultipleCustomizationsConfirm,
      handleAddRemovedItem,
      isQrFlowActive,
      navigateToPdpForChoose,
    ],
  );

  const openCustomizationRepeatDialog = useCallback(() => {
    const { price, discountedPrice } = getRepeatPricesForCartItem(repeatLineItem);
    const repeatItemId = repeatLineItem?.id || "";
    const { productName, description } =
      getCustomizationRepeatDisplayForCartItem(repeatLineItem, language);

    open_dialog("customizationRepeat", {
      open: true,
      propsData: {
        title: lang.repeatTitle || "Repeat previous customisation?",
        ...(productName ? { productName } : {}),
        ...(description ? { description } : {}),
        price,
        discountedPrice,
        mobileTitle: lang.repeatTitle || "Repeat previous customisation?",
        yesButtonText: lang.repeatYes || "Repeat last",
        noButtonText: lang.repeatNo || "I'll choose",
        onYes: () => {
          if (isQrFlowActive) {
            handleRepeatLastQr("ADD_QUANTITY", repeatItemId);
          } else {
            handleRepeatLast("ADD_QUANTITY", repeatItemId);
          }
        },
        onNo: () => {
          close_dialog(["customizationRepeat"]);
          navigateToPdpForChoose();
        },
      },
      type: "customizationRepeat",
      handlerDialog: () => {},
      handleClose: () => close_dialog(["customizationRepeat"]),
      anchor: "bottom",
      dialogPosition: 'bottom',
      onlyDialog: false,
      sxStyle: customizationRepeatDialogSx,
    });
  }, [
    repeatLineItem,
    language,
    lang.repeatTitle,
    lang.repeatYes,
    lang.repeatNo,
    isQrFlowActive,
    handleRepeatLastQr,
    handleRepeatLast,
    navigateToPdpForChoose,
  ]);

  const handleCustomizableIncrease = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (lineCount >= 2) {
        openMultipleCustomizationsDialog(false);
        return;
      }

      if (repeatLineItem?.id) {
        openCustomizationRepeatDialog();
        return;
      }

      onProductClick?.();
      if (productLink) router.push(productLink);
    },
    [
      lineCount,
      repeatLineItem?.id,
      openMultipleCustomizationsDialog,
      openCustomizationRepeatDialog,
      onProductClick,
      productLink,
      router,
    ],
  );

  const handleCustomizableDecrease = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      if (lineCount >= 2) {
        openMultipleCustomizationsDialog(true);
        return;
      }

      if (isQrFlowActive) {
        const itemId = firstSessionItemAsCart?.id;
        if (!itemId) return;
        const qty = firstSessionItemAsCart?.quantity || 0;
        if (qty <= 1) {
          await handleTicketQuantity("DELETE_ITEM", itemId);
        } else {
          await handleTicketQuantity("SUBTRACT_QUANTITY", itemId);
        }
        return;
      }

      const item = repeatLineItem;
      if (!item?.id) return;
      if ((item.quantity || 0) <= 1) {
        await handleQuantity("DELETE_ITEM", item.id);
      } else {
        await handleQuantity(
          "SUBTRACT_QUANTITY",
          item.id,
          item.specialInstructions,
        );
      }
    },
    [
      lineCount,
      openMultipleCustomizationsDialog,
      isQrFlowActive,
      firstSessionItemAsCart,
      repeatLineItem,
      handleTicketQuantity,
      handleQuantity,
    ],
  );

  const handleAddButtonClick = useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation();

      if (onAddClick) {
        onAddClick(product);
        return;
      }

      if (isCustomisable) {
        onProductClick?.();
        if (productLink) router.push(productLink);
        return;
      }

      await handleDirectAdd();
    },
    [
      onAddClick,
      product,
      isCustomisable,
      onProductClick,
      productLink,
      router,
      handleDirectAdd,
    ],
  );

  const handleIncrease = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isCustomisable) {
        handleCustomizableIncrease(e);
        return;
      }

      if (isQrFlowActive) {
        const itemId = ticketItem?.id;
        if (!itemId) {
          await handleDirectAdd();
          return;
        }
        await handleTicketQuantity("ADD_QUANTITY", itemId);
        return;
      }

      const itemId = cartItem?.id;
      if (!itemId) {
        await handleDirectAdd();
        return;
      }
      await handleQuantity(
        "ADD_QUANTITY",
        itemId,
        cartItem.specialInstructions,
      );
    },
    [
      isCustomisable,
      handleCustomizableIncrease,
      isQrFlowActive,
      ticketItem?.id,
      cartItem,
      handleDirectAdd,
      handleTicketQuantity,
      handleQuantity,
    ],
  );

  const handleDecrease = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isCustomisable) {
        await handleCustomizableDecrease(e);
        return;
      }

      if (isQrFlowActive) {
        const itemId = ticketItem?.id;
        if (!itemId) return;
        const qty = ticketItem.quantity || 0;
        if (qty <= 1) {
          await handleTicketQuantity("DELETE_ITEM", itemId);
        } else {
          await handleTicketQuantity("SUBTRACT_QUANTITY", itemId);
        }
        return;
      }

      const itemId = cartItem?.id;
      if (!itemId) return;
      if ((cartItem.quantity || 0) <= 1) {
        await handleQuantity("DELETE_ITEM", itemId);
      } else {
        await handleQuantity(
          "SUBTRACT_QUANTITY",
          itemId,
          cartItem.specialInstructions,
        );
      }
    },
    [
      isCustomisable,
      handleCustomizableDecrease,
      isQrFlowActive,
      ticketItem,
      cartItem,
      handleTicketQuantity,
      handleQuantity,
    ],
  );

  return {
    isCartActionLoading,
    handleAddButtonClick,
    handleIncrease,
    handleDecrease,
  };
}
