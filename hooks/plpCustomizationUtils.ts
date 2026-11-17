import type { ComboGroup } from "@components/order/order.type";
import type {
  CartItem,
  CartItemModifier,
  CartItemModifierGroup,
} from "@services/storePage";
import { normalizePrice } from "../utils/sessionTicketItemToCartItem";

type CartItemWithCombo = CartItem & { comboGroups?: ComboGroup[] };

function getLocalizedText(
  record: Record<string, string> | { en: string } | undefined,
  language: string,
): string {
  if (!record) return "";
  return record[language as keyof typeof record] || record.en || "";
}

function buildComboCustomizationDescriptionParts(
  comboGroups: ComboGroup[],
  quantity: number,
  language: string,
): string[] {
  const descriptionParts: string[] = [];

  comboGroups.forEach((group) => {
    const name = getLocalizedText(group.productName, language);
    if (!name) return;

    let productDisplayName = name;
    if (
      group.variantAttributes &&
      Object.keys(group.variantAttributes).length > 0
    ) {
      productDisplayName += ` (${Object.values(group.variantAttributes).join(", ")})`;
    }
    descriptionParts.push(productDisplayName);

    if (group.modifierGroup) {
      const groupModifiers: string[] = [];
      group.modifierGroup.forEach((modGroup) => {
        modGroup.modifiers?.forEach((modifier) => {
          const modName = getLocalizedText(modifier.modifierName, language);
          if (modName) groupModifiers.push(`${quantity}x ${modName}`);
        });
      });
      if (groupModifiers.length > 0) {
        descriptionParts.push(groupModifiers.join(", "));
      }
    }
  });

  return descriptionParts;
}

/** Newline-separated combo breakdown — matches cart `QuantityControls.getDescriptionWithVariant`. */
export function getComboCustomizationRepeatDescription(
  item: CartItem | null,
  language: string = "en",
): string {
  const comboGroups = (item as CartItemWithCombo)?.comboGroups;
  if (!comboGroups?.length) return "";

  const quantity = item?.quantity ?? 1;
  return buildComboCustomizationDescriptionParts(
    comboGroups,
    quantity,
    language,
  ).join("\n");
}

export function getCustomizationRepeatDisplayForCartItem(
  item: CartItem | null,
  language: string = "en",
): { productName?: string; description?: string } {
  if (!item) return {};

  const comboGroups = (item as CartItemWithCombo).comboGroups;
  if (comboGroups && comboGroups.length > 0) {
    const description = getComboCustomizationRepeatDescription(item, language);
    return description ? { description } : {};
  }

  const quantity = item.quantity ?? 1;
  const variantInfo =
    item.variantAttributes && Object.keys(item.variantAttributes).length > 0
      ? Object.values(item.variantAttributes).join(", ")
      : "";

  const modifierItems: string[] = [];
  item.modifierGroup?.forEach((modGroup: CartItemModifierGroup) => {
    modGroup.modifiers?.forEach((mod: CartItemModifier) => {
      const modName =
        getLocalizedText(
          mod.modifierName as Record<string, string> | undefined,
          language,
        ) || `Modifier ${mod.modifierId}`;
      modifierItems.push(`${quantity}x ${modName}`);
    });
  });

  const descriptionParts: string[] = [];
  if (variantInfo) descriptionParts.push(variantInfo);
  if (modifierItems.length > 0) descriptionParts.push(modifierItems.join(", "));

  if (descriptionParts.length > 0) {
    return { description: descriptionParts.join(", ") };
  }

  return {
    productName:
      getLocalizedText(item.productName, language) || "Standard",
  };
}

export function getModifierDescriptionForCartItem(
  item: CartItem | null,
  language: string = "en",
): string {
  if (!item) return "";

  const comboGroups = (item as CartItemWithCombo).comboGroups;
  if (comboGroups && comboGroups.length > 0) {
    const comboDescription = getComboCustomizationRepeatDescription(
      item,
      language,
    );
    if (comboDescription) return comboDescription;
  }

  const descriptions: string[] = [];

  if (
    item.variantAttributes &&
    Object.keys(item.variantAttributes).length > 0
  ) {
    descriptions.push(Object.values(item.variantAttributes).join(", "));
  }

  if (item.modifierGroup?.length) {
    item.modifierGroup.forEach((modGroup: CartItemModifierGroup) => {
      if (modGroup.modifiers?.length) {
        const modifierNames = modGroup.modifiers
          .map(
            (mod: CartItemModifier) =>
              getLocalizedText(
                mod.modifierName as Record<string, string> | undefined,
                language,
              ) || `Modifier ${mod.modifierId}`,
          )
          .join(", ");
        descriptions.push(modifierNames);
      }
    });
  }

  return (
    descriptions.join(", ") ||
    getLocalizedText(item.productName, language) ||
    "Standard"
  );
}

export function getRepeatPricesForCartItem(item: CartItem | null): {
  price: number;
  discountedPrice: number;
} {
  if (!item) return { price: 0, discountedPrice: 0 };

  return {
    price: normalizePrice(item.totalBasePrice ?? item.unitBasePrice ?? 0),
    discountedPrice: normalizePrice(
      item.totalBasePriceAfterBaseDiscount ??
        (item.unitBasePrice ?? 0) - (item.totalBaseDiscountAmount ?? 0),
    ),
  };
}

export const customizationRepeatDialogSx = {
  "& .MuiPaper-root": {
    "@media (max-width: 768px)": { padding: "20px 16px" },
  },
  "& .MuiDialogContent-root": { padding: "20px 16px" },
} as const;


export function appendPdpChooseParams(productLink: string): string {
  const separator = productLink.includes("?") ? "&" : "?";
  // Match cart "I'll choose" PDP params (rfcEdit) without fromQuantityIncrease (no cart redirect after add)
  return `${productLink}${separator}fromPlpChoose=true&rfcEdit=true`;
}
