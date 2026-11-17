import React from "react";
import { ModifierListProps } from "./order.type";
import formatCurrency from "@lib/helper/price";
import { useSelector } from "react-redux";
import { selectCart } from "@redux/slices/cartSlice";
import { useSessionTicketItems } from "@hooks/useQrSessionDerivedState";

type LineItemForModifiers = {
  id: string;
  quantity?: number;
  productType?: string;
  comboGroups?: Array<{ id: string }>;
};

const ModifierGroupList: React.FC<ModifierListProps> = ({
  item,
  language,
  isQrFlow = false,
}) => {
  const cart = useSelector(selectCart);
  const sessionTicketItems = useSessionTicketItems();

  if (!item.modifierGroup) return null;

  const cartLineItems: LineItemForModifiers[] = isQrFlow
    ? sessionTicketItems
    : ((cart.cartData?.data?.items as LineItemForModifiers[] | undefined) ??
      []);

  const currentItem = cartLineItems.find((line) => line.id === item.id);

  // For combo group modifier rendering, `item.id` can be the combo group id (not the line item id).
  // Normal flow: cart `data.items[].comboGroups`; QR flow: ticket items flattened by the QR session derived-state hook.
  const comboParentItem = cartLineItems.find((lineItem) => {
    const isCombo = lineItem?.productType === "COMBO";
    const comboGroups = lineItem?.comboGroups;
    return !!(isCombo && comboGroups?.some((g) => g?.id === item.id));
  });

  const productType =
    (item as unknown as { productType?: string } | undefined)?.productType ||
    (currentItem as unknown as { productType?: string } | undefined)
      ?.productType ||
    (comboParentItem as unknown as { productType?: string } | undefined)
      ?.productType;
  const isComboProduct = productType === "COMBO";

  const quantity = isComboProduct
    ? (comboParentItem?.quantity ?? 1)
    : (currentItem?.quantity ?? item?.quantity ?? 1);

  return (
    <>
      {item?.modifierGroup?.map((group, i) =>
        group?.modifiers?.map((subItem, j) => (
          <div
            key={`${i}-${j}`}
            className="flex items-center justify-between modifier-item"
          >
            <div
              className={`modifier-name ${isComboProduct ? "extra-small-font md-heading-6 text-[var(--secondary-text)]" : ""}`}
            >
              {quantity} x {subItem?.modifierName?.[language]}
            </div>
            <h4
              className={`${isComboProduct ? "extra-small-font md-heading-6 text-[var(--secondary-text)]" : "modifier-price"}`}
            >
              {formatCurrency({ amount: (subItem.totalPrice ?? 0) * quantity })}
            </h4>
          </div>
        )),
      )}
    </>
  );
};

export default ModifierGroupList;
