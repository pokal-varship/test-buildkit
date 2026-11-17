import { useRouter } from "next/navigation";
import Icon from "@components/image/Icons";
import { RECEIPT_EDIT_ICON, TRASH_ICON } from "@config/Header/image.config";
import ProductQuantitySelector from "./ProductQuantitySelector";
import { useQuantityControls } from "@hooks/useQuantityControls";
import { useTicketQuantityControls } from "@hooks/useTicketQuantityControls";
import { close_dialog, open_dialog } from "@lib/modalHandler";
import useLang from "@hooks/useLang";
import { LanguageCode, TranslationKeys } from "types";
import { CartItem } from "./order.type";
import { useSelector } from "react-redux";
import { selectCart } from "@redux/slices/cartSlice";
import { useParams } from "next/navigation";
import useProductUrl from "@hooks/useProductUrl";

interface QuantityControlsProps {
  item: CartItem;
  cartId: string;
  language: string;
  handleOpenFreebiesModal: (offerId: string) => void;
  offerType: string | undefined;
  /** When true, item is from session/ticket (QR flow); quantity comes from item only */
  isQrFlow?: boolean;
}

const QuantityControls: React.FC<QuantityControlsProps> = ({
  item,
  cartId,
  language,
  handleOpenFreebiesModal,
  offerType,
  isQrFlow = false,
}) => {
  const { handleQuantity, error } = useQuantityControls(cartId);
  const { handleTicketQuantity, error: ticketError } = useTicketQuantityControls();
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const router = useRouter();
  const params = useParams();
  const { appendQrTokenIfActive, getOrderProductUrl } = useProductUrl();
  const cart = useSelector(selectCart);

  /** In QR flow call ticket API for add/subtract/delete; otherwise cart API */
  const handleQuantityOrTicket = (customType: string, itemId: string, instructions?: string) => {
    if (isQrFlow && (customType === 'ADD_QUANTITY' || customType === 'SUBTRACT_QUANTITY' || customType === 'DELETE_ITEM')) {
      handleTicketQuantity(customType as 'ADD_QUANTITY' | 'SUBTRACT_QUANTITY' | 'DELETE_ITEM', itemId, { instructions });
      return;
    }
    handleQuantity(customType, itemId, instructions);
  };

  // In QR flow use item.quantity (no cart in Redux); otherwise get from Redux or item
  const currentItem = cart.cartData?.data?.items?.find(
    (cartItem) => cartItem.id === item.id
  );
  const quantity = isQrFlow ? item.quantity : (currentItem?.quantity ?? item.quantity);
  const menuSlug = params?.menuSlug || "all-day";
  const storeSlug = params?.storeSlug;
  const isFreebie = offerType === "FREEBIE";
  const actionButtonClassName =
    "p-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all border border-[var(--borders-dividers)] hover:bg-[var(--tertiary-button-hover-bg)] bg-[var(--tertiary-background)] text-[var(--primary-text)]";

  const getModifierItems = () => {
    const items: string[] = [];

    // Add modifiers from modifier groups
    if (item?.modifierGroup) {
      item?.modifierGroup?.forEach((group) => {
        group?.modifiers?.forEach((modifier) => {
          items.push(`${quantity}x ${modifier?.modifierName?.[language]}`);
        });
      });
    }

    // Add modifiers from combo groups
    if (item?.comboGroups) {
      item?.comboGroups?.forEach((group) => {
        items.push(group?.productName?.[language]);
        if (group?.modifierGroup) {
          group?.modifierGroup?.forEach((modGroup) => {
            modGroup?.modifiers?.forEach((modifier) => {
              items.push(`${quantity}x ${modifier?.modifierName?.[language]}`);
            });
          });
        }
      });
    }

    return items;
  };

  // Function to get description with variant and modifiers
  const getDescriptionWithVariant = (): string => {
    const modifierItems = getModifierItems();
    const variantInfo = item?.variantAttributes && Object.keys(item.variantAttributes).length > 0 
      ? Object.values(item.variantAttributes).join(", ") 
      : "";

    // Handle combo products
    if (item?.comboGroups && item.comboGroups.length > 0) {
      const descriptionParts: string[] = [];
      
      item.comboGroups.forEach((group) => {
        if (group?.productName?.[language]) {
          // Add product name with variant if exists
          let productDisplayName = group.productName[language];
          
          // Add variant information for this combo group
          if (group?.variantAttributes && Object.keys(group.variantAttributes).length > 0) {
            const variantValues = Object.values(group.variantAttributes).join(", ");
            productDisplayName += ` (${variantValues})`;
          }
          
          descriptionParts.push(productDisplayName);
          
          // Add modifiers for this combo group
          if (group?.modifierGroup) {
            const groupModifiers: string[] = [];
            group.modifierGroup.forEach((modGroup) => {
              modGroup.modifiers.forEach((modifier) => {
                groupModifiers.push(`${quantity}x ${modifier?.modifierName?.[language]}`);
              });
            });
            if (groupModifiers.length > 0) {
              descriptionParts.push(groupModifiers.join(", "));
            }
          }
        }
      });
      
      return descriptionParts.join("\n");
    } 
    // Handle regular products
    else {
      const descriptionParts: string[] = [];
      
      if (variantInfo) {
        descriptionParts.push(variantInfo);
      }
      if (modifierItems.length > 0) {
        descriptionParts.push(modifierItems.join(", "));
      }
      
      return descriptionParts.join(", ");
    }
  };

  const handleDelete = () => {
    open_dialog("deleteModal", {
      open: true,
      propsData: {
        title: lang.deleteTitle,
        description: item.productName[language],
        message: {
          items: getModifierItems(),
        },
        yesButtonText: lang.yes,
        noButtonText: lang.no,
        onYes: () => {
          if (isQrFlow) {
            handleTicketQuantity("DELETE_ITEM", item.id);
          } else {
            handleQuantity("DELETE_ITEM", item.id);
          }
          close_dialog(["deleteModal"]);
          handleOpenFreebiesModal("");
        },
        onNo: () => {
          close_dialog(["deleteModal"]);
        },
      },
      type: "deleteModal",
      handlerDialog: () => {},
      handleClose: () => {},
      anchor: "bottom",
      onlyDialog: true,
    });
  };

  const handleEdit = () => {
    // Check if this is a combo product
    const isComboProduct = (item.productType === "COMBO" || item.productType === "combo") || 
                          (item.comboGroups && item.comboGroups.length > 0) ||
                          (item.productSlug && item.productSlug.includes('combo'));
    
    if (isComboProduct) {
      // For combo products, redirect to combo flow with summary step
      const summaryStepIndex = (item.comboGroups?.length || 3) - 1; // Default to 2 for 3 combo groups

      let redirectUrl = `/${storeSlug}/${menuSlug}/${
        item.productCategorySlug
      }/${item.productSlug}?combo=true&step=${summaryStepIndex}&rfcEdit=true${
        item.id ? `&cid=${item.id}` : ""
      }`;
    
    // Append QR token for QR flow
    if (isQrFlow) {
      redirectUrl = appendQrTokenIfActive(redirectUrl);
    }

      router.push(redirectUrl);
    } else {
      // For regular products, use same URL structure for both flows
      const extraParams: Record<string, string> = { rfcEdit: "true" };
      if (item.id) extraParams.cid = item.id;
      
      router.push(
        getOrderProductUrl(
          item.productSlug,
          item.productCategorySlug,
          (menuSlug as string) || "all-day",
          (storeSlug as string) || '',
          extraParams
        )
      );
    }
  };

  const actionIcons = [
    {
      key: "edit",
      ariaLabel: "Edit item",
      icon: `${RECEIPT_EDIT_ICON}#edit-icon`,
      onClick: handleEdit,
    },
    {
      key: "delete",
      ariaLabel: "Delete item",
      icon: `${TRASH_ICON}#trash-icon`,
      onClick: handleDelete,
    },
  ] as const;

  return (
    <div className="flex items-center gap-4 md:gap-3 mt-2">
      <ProductQuantitySelector
        quantity={quantity}
        handleAddQuantity={(customType: string, itemId: string) => handleQuantityOrTicket(customType, itemId, item?.specialInstructions)}
        itemId={item.id}
        error={error || ticketError || ""}
        item={item}
        description={getDescriptionWithVariant()}
        getModifierItems={getModifierItems}
        offerType={offerType}
        padQuantity={false}
        buttonSizeClassName="w-7 h-7 md:w-8 md:h-8"
        textSizeClassName="text-base md-heading-3"
        buttonTextClassName="heading-2"
        decreaseButtonClassName="heading-2"
        increaseButtonClassName="bg-[var(--tertiary-background)] text-[var(--primary-text)]"
        decreaseButtonTextClassName="bg-[var(--tertiary-background)] text-[var(--primary-text)]"
      />
      {actionIcons.map((action) => (
        <button
          key={action.key}
          type="button"
          className={`${actionButtonClassName} ${
            isFreebie ? "cursor-not-allowed" : "cursor-pointer"
          }`}
          disabled={isFreebie}
          aria-label={action.ariaLabel}
          onClick={isFreebie ? undefined : action.onClick}
        >
          <Icon
            icon={action.icon}
            width={30}
            height={30}
            className={isFreebie ? "opacity-50" : ""}
            viewBox="0 0 40 40"
            color={`var(--primary-text)`}
          />
        </button>
      ))}
    </div>
  );
};

export default QuantityControls;
