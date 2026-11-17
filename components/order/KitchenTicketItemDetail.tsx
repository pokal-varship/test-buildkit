"use client";

import React from "react";
import formatCurrency from "@lib/helper/price";
import { getTenantConfig } from "@config/tenant.config";
import type { SessionTicketItem } from "@services/sessionService";
import { ComboGroup, ModifierGroup } from "./order.type";
import DietaryIndicator from "@components/ui/DietaryIndicator";
// import useLang from "@hooks/useLang";
// import { TranslationKeys } from "types";
// import { open_dialog, close_dialog } from "@lib/modalHandler";
import { useRouter } from "next/navigation";
import useProductUrl from "@hooks/useProductUrl";
// import { useDispatch, useSelector } from "react-redux";
// import { addItemsToTicket } from "@services/ticketService";
// import { getSession } from "@services/sessionService";
// import {
//   selectQrResolveData,
//   selectSessionId,
//   selectSessionTableId,
//   setDineInSessionData,
// } from "@redux/slices/qrFlowSlice";
// import { useToast } from "@components/toast/Toast";

export interface KitchenTicketItemDetailProps {
  /** Session/cart item (product + modifiers + instructions) */
  item: SessionTicketItem;
  /** Language key for modifier display (e.g. "en") */
  language?: string;
  /** Total label, e.g. "Total" */
  totalLabel: string;
  /** When true, hide the dashed divider under this row */
  isLast?: boolean;
}

/**
 * Reusable row for one product inside a kitchen ticket: status dot, name, pricing (original + discounted),
 * add-ons/modifiers, instructions, and item total.
 * Used in Kitchen Status view and anywhere we show ticket item details.
 */
const KitchenTicketItemDetail: React.FC<KitchenTicketItemDetailProps> = ({
  item,
  language = "en",
  totalLabel,
  isLast = false,
}) => {
  // const [lang] = useLang() as [TranslationKeys, "en" | "ar"];
  const router = useRouter();
  const { getOrderProductUrl, storeSlug, menuSlug } = useProductUrl();
  // const dispatch = useDispatch();
  // const toast = useToast();
  // const qrResolveData = useSelector(selectQrResolveData);
  // const sessionId = useSelector(selectSessionId);
  // const sessionTableId = useSelector(selectSessionTableId);

  const displayName =
    (typeof item.productName === "object" && item.productName?.en)
      ? item.productName.en
      : item.itemName || "—";
  const variantName = item.productionDisplayName;
  const nameVariantAttributes = (item as { variantAttributes?: unknown })
    .variantAttributes as Record<string, unknown> | undefined;
  const variantAttributesList = nameVariantAttributes
    ? Object.values(nameVariantAttributes).filter(
        (val): val is string => typeof val === "string"
      )
    : [];
  const variantAttributesStr =
    variantAttributesList.length > 0 ? variantAttributesList.join(" | ") : "";
  const fullDisplayName = variantAttributesStr
    ? `${displayName} (${variantAttributesStr})`
    : variantName
      ? `${displayName} (${variantName})`
      : displayName;
  const unitPrice = item.subTotalAfterBaseDiscount ?? item.totalBasePrice ?? 0;
  const unitPriceForTotal =  ((item.unitBasePrice ?? 0) - (item.baseDiscountAmount ?? 0) + (item.baseModifiersPrice ?? 0));
  const totalPrice = item.totalBasePrice ?? item.totalPrice ?? unitPriceForTotal * item.quantity;
  const priceAfterDiscount = item.totalBasePriceAfterBaseDiscount ?? totalPrice;
  const hasDiscount = (item.totalBaseDiscountAmount ?? 0) > 0;
  const { showStrikethroughPrice } = getTenantConfig();

  const modifierGroups = (item.modifierGroup as ModifierGroup[] | undefined) ?? [];
  const modifiersList = modifierGroups.flatMap((g) => g?.modifiers ?? []);
  const containsMeat = !!(item.metaData as Record<string, unknown>)?.["productAttributes.containsMeat"];
  const comboGroups = (
    (item as unknown as { comboGroups?: ComboGroup[] }).comboGroups ?? []
  ).filter(Boolean);
  const isCombo =
    (typeof (item as unknown as { productType?: string }).productType === "string" &&
      String((item as unknown as { productType?: string }).productType).toUpperCase() === "COMBO") ||
    comboGroups.length > 0;

  const handleNavigateToPdp = React.useCallback(() => {
    const productSlug = String(item?.productSlug ?? "").trim();
    const categorySlug = String(item?.productCategorySlug ?? "").trim();
    if (!productSlug || !categorySlug) return;
    router.push(getOrderProductUrl(productSlug, categorySlug, menuSlug || "all-day", storeSlug));
  }, [getOrderProductUrl, item?.productCategorySlug, item?.productSlug, menuSlug, router, storeSlug]);

  // const handleReorderClick = async () => {
  //   const effectiveStoreId =
  //     (qrResolveData as { storefrontId?: string } | null)?.storefrontId ?? "";

  //   const normalizeModifierGroups = (rawGroups: unknown[]): Array<{
  //     modifierGroupId: string;
  //     modifiers: { modifierId: string; quantity: number }[];
  //   }> => {
  //     return rawGroups
  //       .map((g) => {
  //         const group = g as {
  //           modifierGroupId?: string;
  //           modifierGroup?: { id?: string; _id?: string };
  //           id?: string;
  //           _id?: string;
  //           modifiers?: Array<{
  //             modifierId?: string;
  //             id?: string;
  //             _id?: string;
  //             quantity?: number;
  //           }>;
  //         };
  //         const modifierGroupId =
  //           group.modifierGroupId ??
  //           group.modifierGroup?.id ??
  //           group.modifierGroup?._id ??
  //           group.id ??
  //           group._id ??
  //           null;
  //         const modifiers =
  //           (group.modifiers ?? [])
  //             .map((m) => {
  //               const modifierId = m.modifierId ?? m.id ?? m._id ?? null;
  //               if (!modifierId) return null;
  //               return { modifierId: String(modifierId), quantity: m.quantity ?? 1 };
  //             })
  //             .filter(Boolean) as Array<{ modifierId: string; quantity: number }>;

  //         if (!modifierGroupId || modifiers.length === 0) return null;
  //         return { modifierGroupId: String(modifierGroupId), modifiers };
  //       })
  //       .filter(Boolean) as Array<{
  //       modifierGroupId: string;
  //       modifiers: { modifierId: string; quantity: number }[];
  //     }>;
  //   };

  //   // Build payload once and reuse for both direct repeat and dialog "Repeat last"
  //   const rawModifierGroups = Array.isArray(item.modifierGroup)
  //     ? (item.modifierGroup as unknown[])
  //     : [];

  //   const modifierGroupsPayload = normalizeModifierGroups(rawModifierGroups);

  //   type ComboProductPayload = {
  //     groupName: string;
  //     productId: string;
  //     variantId?: string;
  //     modifierGroups?: Array<{ modifierGroupId: string; modifiers: { modifierId: string; quantity: number }[] }>;
  //   };

  //   const comboPayloadFromItem = (() => {
  //     if (!isCombo) return null;

  //     // Prefer raw fields if backend already stores them (same shape as first add).
  //     const rawComboPrimaryProductId = (item as unknown as { comboPrimaryProductId?: unknown }).comboPrimaryProductId;
  //     const rawComboPrimaryProductVariantId = (item as unknown as { comboPrimaryProductVariantId?: unknown }).comboPrimaryProductVariantId;
  //     const rawComboPrimaryProductModifierGroups = (item as unknown as { comboPrimaryProductModifierGroups?: unknown }).comboPrimaryProductModifierGroups;
  //     const rawComboProducts = (item as unknown as { comboProducts?: unknown }).comboProducts;

  //     const storedComboPrimaryProductId = typeof rawComboPrimaryProductId === "string" ? rawComboPrimaryProductId : "";
  //     const storedComboPrimaryProductVariantId = typeof rawComboPrimaryProductVariantId === "string" ? rawComboPrimaryProductVariantId : "";
  //     const storedComboPrimaryProductModifierGroups = Array.isArray(rawComboPrimaryProductModifierGroups)
  //       ? normalizeModifierGroups(rawComboPrimaryProductModifierGroups as unknown[])
  //       : [];

  //     const rawDerivedComboProducts: ComboProductPayload[] = Array.isArray(rawComboProducts)
  //       ? (rawComboProducts as ComboProductPayload[])
  //       : (comboGroups.map((g) => {
  //           const groupAny = g as unknown as {
  //             groupName?: string;
  //             productId?: string;
  //             variantId?: string;
  //             modifierGroup?: unknown[];
  //           };
  //           const groupName = groupAny.groupName ?? "";
  //           const productId = groupAny.productId ?? "";
  //           const variantId = typeof groupAny.variantId === "string" ? groupAny.variantId : undefined;
  //           const mg = Array.isArray(groupAny.modifierGroup) ? normalizeModifierGroups(groupAny.modifierGroup) : undefined;
  //           return {
  //             groupName,
  //             productId,
  //             ...(variantId ? { variantId } : {}),
  //             ...(mg && mg.length > 0 ? { modifierGroups: mg } : {}),
  //           };
  //         }).filter((p) => Boolean(p.groupName || p.productId)) as ComboProductPayload[]);

  //     // Some APIs include the primary selection inside comboProducts as groupName "Primary".
  //     // Backend expects that to be split into comboPrimaryProduct* fields, and NOT included in comboProducts[].
  //     const primaryEntryIdx = rawDerivedComboProducts.findIndex((p) => (p.groupName ?? "").trim().toUpperCase() === "PRIMARY");
  //     const primaryEntry = primaryEntryIdx >= 0 ? rawDerivedComboProducts[primaryEntryIdx] : null;
  //     const comboProducts =
  //       primaryEntryIdx >= 0
  //         ? rawDerivedComboProducts.filter((_, idx) => idx !== primaryEntryIdx)
  //         : rawDerivedComboProducts;

  //     const primaryFromEntry = primaryEntry
  //       ? {
  //           comboPrimaryProductId: primaryEntry.productId,
  //           comboPrimaryProductVariantId: primaryEntry.variantId ?? "",
  //           comboPrimaryProductModifierGroups: primaryEntry.modifierGroups ?? [],
  //         }
  //       : null;

  //     // Prefer extracted primary (from "Primary" group) > stored primary fields.
  //     // Never fall back to the combo itemId/productId (that is the combo product itself, not primary selection).
  //     const resolvedPrimaryProductId =
  //       primaryFromEntry?.comboPrimaryProductId ||
  //       (storedComboPrimaryProductId && storedComboPrimaryProductId !== item.itemId ? storedComboPrimaryProductId : "");
  //     const resolvedPrimaryVariantId =
  //       primaryFromEntry?.comboPrimaryProductVariantId || storedComboPrimaryProductVariantId || "";
  //     const resolvedPrimaryModifierGroups =
  //       (primaryFromEntry?.comboPrimaryProductModifierGroups && primaryFromEntry.comboPrimaryProductModifierGroups.length > 0)
  //         ? primaryFromEntry.comboPrimaryProductModifierGroups
  //         : storedComboPrimaryProductModifierGroups;

  //     return {
  //       comboPrimaryProductId: resolvedPrimaryProductId,
  //       comboPrimaryProductVariantId: resolvedPrimaryVariantId,
  //       comboPrimaryProductModifierGroups: resolvedPrimaryModifierGroups,
  //       comboProducts,
  //     };
  //   })();

  //   const repeatLastPayload = sessionId
  //     ? {
  //         sessionId,
  //         items: [
  //           {
  //             customType: "ADD_QUANTITY" as const,
  //             itemId: item.itemId,
  //             itemSku: item.productSku ?? item.itemId,
  //             productId: item.itemId,
  //             variantId: item.variantId || undefined,
  //             quantity: 1,
  //             sequenceNumber: 1,
  //             ...(isCombo && comboPayloadFromItem && {
  //               comboPrimaryProductId: comboPayloadFromItem.comboPrimaryProductId,
  //               comboPrimaryProductVariantId: comboPayloadFromItem.comboPrimaryProductVariantId,
  //               comboPrimaryProductModifierGroups: comboPayloadFromItem.comboPrimaryProductModifierGroups,
  //               comboProducts: comboPayloadFromItem.comboProducts,
  //             }),
  //             ...(modifierGroupsPayload.length > 0 && {
  //               modifierGroups: modifierGroupsPayload,
  //             }),
  //             ...(item.specialInstructions?.trim() && {
  //               specialInstructions: item.specialInstructions.trim(),
  //             }),
  //           },
  //         ],
  //       }
  //     : null;

  //   const repeatLast = async () => {
  //     if (!repeatLastPayload || !effectiveStoreId) {
  //       toast("error", lang.somethingWentWrong ?? "Session or store not found.");
  //       return;
  //     }

  //     try {
  //       await addItemsToTicket(effectiveStoreId, repeatLastPayload);

  //       const sessionData = await getSession(effectiveStoreId, {
  //         tableId: sessionTableId ?? undefined,
  //         sessionId: repeatLastPayload.sessionId,
  //       });
  //       dispatch(setDineInSessionData(sessionData));
  //     } catch (err: unknown) {
  //       const message =
  //         (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
  //         lang.somethingWentWrong ??
  //         "Something went wrong";
  //       toast("error", message);
  //       throw err;
  //     }
  //   };

  //   const hasModifiers = modifiersList.length > 0;
  //   const variantAttributes =
  //     (item as unknown as { variantAttributes?: Record<string, string> })
  //       .variantAttributes ?? {};
  //   const hasVariants = !!item.variantId && Object.keys(variantAttributes).length > 0;

  //   const shouldShowRepeatDialog = isCombo || hasModifiers || hasVariants;

  //   if (shouldShowRepeatDialog) {
  //     const modifierDescription =
  //       isCombo
  //         ? (
  //             comboGroups
  //               .map((g) => {
  //                 const name =
  //                   (g as unknown as { productName?: Record<string, string> })?.productName?.[language] ??
  //                   (g as unknown as { productName?: Record<string, string> })?.productName?.en ??
  //                   "";
  //                 return name ? `• ${name}` : "";
  //               })
  //               .filter(Boolean)
  //               .join("\n") ||
  //             lang.usedCustomization ||
  //             ""
  //           )
  //         : (modifiersList
  //             .map(
  //               (mod) =>
  //                 `${(mod?.quantity ?? 1)}x ${
  //                   mod?.modifierName?.[language] ?? mod?.modifierName?.en ?? "—"
  //                 }`
  //             )
  //             .join(", ") || "");

  //     open_dialog("customizationRepeat", {
  //       open: true,
  //       propsData: {
  //         title: lang.repeatTitle,
  //         description: modifierDescription,
  //         mobileTitle: (
  //           <>
  //             {lang.repeatLast}
  //             <br />
  //             {lang.usedCustomization}
  //           </>
  //         ),
  //         yesButtonText: lang.repeatYes,
  //         noButtonText: lang.repeatNo,
  //         price: item?.totalBasePrice ?? item?.totalPrice ?? 0,
  //         discountedPrice:
  //           item?.totalBasePriceAfterBaseDiscount ?? item?.totalPrice ?? 0,
  //         productName: item?.productName?.en || item?.itemName || "",
  //         onYes: async () => {
  //           await repeatLast();
  //           close_dialog(["customizationRepeat"]);
  //           router.push(getCartUrl());
  //         },
  //         onNo: () => {
  //           router.push(
  //             getOrderProductUrl(
  //               item.productSlug ?? "",
  //               item.productCategorySlug ?? "",
  //               menuSlug || "all-day",
  //               storeSlug,
  //               { rfcEdit: "true", fromQuantityIncrease: "true", cartItemId: item.id }
  //             )
  //           );
  //           close_dialog(["customizationRepeat"]);
  //         },
  //       },
  //       type: "customizationRepeat",
  //       handlerDialog: () => {},
  //       handleClose: () => close_dialog(["customizationRepeat"]),
  //       anchor: "bottom",
  //       onlyDialog: false,
  //       sxStyle: {
  //         "& .MuiPaper-root": {
  //           "@media (max-width: 768px)": { padding: "20px 16px" },
  //           "@media (min-width: 768px)": {
  //             position: "fixed",
  //             bottom: "50px",
  //             left: "50%",
  //             transform: "translateX(-50%)",
  //             top: "auto",
  //             margin: 0,
  //             maxWidth: "600px",
  //             width: "100%",
  //           },
  //         },
  //         "& .MuiDialogContent-root": { padding: "20px 16px" },
  //       },
  //     });
  //     return;
  //   }

  //   await repeatLast();
  //   router.push(getCartUrl());
  // };

  return (
    <div
      className={`kitchen-ticket-item-detail flex gap-2 items-start pt-2 pb-3 ${
        isLast ? "" : "border-b border-dashed border-[var(--rating-border-primary)]"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={handleNavigateToPdp}
            className="kitchen-ticket-item-detail__name flex items-center gap-2 font-600 small-font md:description-font text-[var(--primary-text)] min-w-0 flex-1 text-left bg-transparent border-0 p-0 cursor-pointer"
          >
            <DietaryIndicator
              containsMeat={containsMeat}
              containerClassName="shrink-0"
              size={{ width: 12, height: 12 }}
            />
            <span className="truncate">{fullDisplayName}</span>
          </button>
          <div className="kitchen-ticket-item-detail__pricing flex items-center gap-1.5 shrink-0 self-center">
            {hasDiscount && showStrikethroughPrice && (
              <span className="line-through text-[var(--secondary-text)] small-font">
                {formatCurrency({ amount: totalPrice })}
              </span>
            )}
            <span className="font-600 small-font md:description-font text-[var(--primary-text)]">
              {formatCurrency({ amount: priceAfterDiscount })}
            </span>
          </div>
        </div>

        {modifiersList.length > 0 && (
          <div className="flex flex-col gap-0.5">
            {modifiersList.map((mod, idx) => (
              <div
                key={`${mod?.modifierName?.[language] ?? idx}-${idx}`}
                className="flex justify-between extra-small-font text-[var(--secondary-text)]"
              >
                <span>
                  {item.quantity} x {mod?.modifierName?.[language] ?? mod?.modifierName?.en ?? "—"}
                </span>
                <span>{formatCurrency({ amount: item.quantity * (mod?.totalPrice ?? 0) })}</span>
              </div>
            ))}
          </div>
        )}

        {isCombo && comboGroups.length > 0 && (
          <div className="mt-2 flex flex-col gap-1.5">
            {comboGroups.map((group, idx) => {
              const name =
                group?.productName?.[language] ?? group?.productName?.en ?? "—";
              const variantLabel = group?.variantAttributes
                ? Object.values(group.variantAttributes)[0]
                : "";
              return (
                <div key={`${group?.id ?? idx}-${idx}`} className="flex flex-col gap-1">
                  <div className="extra-small-font text-[var(--primary-text)]">
                    {name}
                    {variantLabel ? ` (${variantLabel})` : ""}
                  </div>
                  {group?.modifierGroup?.length ? (
                    <div className="flex flex-col gap-0.5">
                      {group.modifierGroup.flatMap((mg, mgIdx) =>
                        (mg?.modifiers ?? []).map((m, mIdx) => (
                          <div
                            key={`${idx}-${mgIdx}-${m?.modifierName?.[language] ?? mIdx}-${mIdx}`}
                            className="flex justify-between extra-small-font text-[var(--secondary-text)]"
                          >
                            <span>
                              {item.quantity ?? 1} x{" "}
                              {m?.modifierName?.[language] ??
                                m?.modifierName?.en ??
                                "—"}
                            </span>
                            <span>
                              {formatCurrency({ amount: (item.quantity ?? 1) * (m?.totalPrice ?? 0) })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}


        <div className="total flex flex-col justify-between font-600 items-center mt-2.5 small-font">
          {item.specialInstructions?.trim() && (
            <p className="self-start mb-2 extra-small-font text-[var(--primary-text)] italic font-300">
              {item.specialInstructions}
            </p>
          )}
          <div className="flex justify-between w-full items-center">
            <p className="text-[var(--primary-text)]">
              {totalLabel}: {item.quantity} x {formatCurrency({ amount: unitPriceForTotal })}
            </p>
            <div className="flex items-center gap-3">
              <p className="text-[var(--primary-text)]">
                {formatCurrency({
                  amount: unitPrice,
                })}
              </p>
              {/* <button
                onClick={handleReorderClick}
                className="text-[var(--accent-color)] extra-small-font px-2.5 py-2 border rounded-md shadow-[0px_0px_4px_0px_#0000001C]"
              >
                {lang.order.reorder}
              </button> */}
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .kitchen-ticket-item-detail__name {
          word-break: break-word;
        }
      `}</style>
    </div>
  );
};

export default KitchenTicketItemDetail;
