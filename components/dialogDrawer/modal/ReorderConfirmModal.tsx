import React from "react";
import CustomButton from "@components/buttons/Button";
import SecondaryButton from "@components/buttons/secondaryButton";
import formatCurrency from "@lib/helper/price";
import type { SessionTicketItem } from "@services/sessionService";
import { ModifierGroup } from "@components/order/order.type";
import DietaryIndicator from "@components/ui/DietaryIndicator";
import { TranslationKeys } from "types";
import useLang from "@hooks/useLang";
import { getTenantConfig } from "@config/tenant.config";
interface ReorderConfirmModalProps {
  item: SessionTicketItem;
  language?: string;
  onClose?: () => void;
  onConfirm?: () => void;
}

const ReorderConfirmModal: React.FC<ReorderConfirmModalProps> = ({
  item,
  language = "en",
  onClose,
  onConfirm,
}) => {
  const [lang] = useLang() as [TranslationKeys, "en" | "ar"];
  const displayName =
    (typeof item.productName === "object" && item.productName?.en)
      ? item.productName.en
      : item.itemName || "—";
  
  const unitPrice = item.subTotalAfterBaseDiscount ?? item.totalBasePrice ?? 0;
  const totalPrice = item.totalBasePrice ?? item.totalPrice ?? unitPrice * item.quantity;
  const priceAfterDiscount = item.totalBasePriceAfterBaseDiscount ?? totalPrice;
  const hasDiscount = (item.totalBaseDiscountAmount ?? 0) > 0;
  const { showStrikethroughPrice } = getTenantConfig();

  const modifierGroups = (item.modifierGroup as ModifierGroup[] | undefined) ?? [];
  const modifiersList = modifierGroups.flatMap((g) => g?.modifiers ?? []);
  const containsMeat = !!(item.metaData as Record<string, unknown>)?.["productAttributes.containsMeat"];

  return (
    <div className="bg-[var(--cards-containers)]">
      <div className="text-left p-4 m-0 rounded-none flex flex-col min-h-full">
        <h2 className="heading-3 font-[var(--font-medium)] text-[var(--primary-text)] mb-4">
          {lang?.areYouSureYouWantToReorderTheItem}
        </h2>
        
        {/* Product Details */}
        <div className="mb-6 bg-[#F9F8F0] rounded-lg p-2 px-3">
          <DietaryIndicator
            containsMeat={containsMeat}
            containerClassName="shrink-0 !pb-1 !pt-0"
            size={{ width: 12, height: 12 }}
          />
          <span className="heading-5 font-600 break-words">{displayName}</span>
          
          {modifiersList.length > 0 && (
            <div className="mb-1">
              {modifiersList.map((mod, idx) => (
                <div key={`${mod?.modifierName?.[language] ?? idx}-${idx}`} className="text-[var(--secondary-text)] justify-between font-400 flex">
                  <span className="flex-1">
                    {(mod?.quantity ?? 1)} x {mod?.modifierName?.[language] ?? mod?.modifierName?.en ?? "—"}
                  </span>
                  <span className="flex-shrink-0">{formatCurrency({ amount: mod?.totalPrice ?? 0 })}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {hasDiscount && showStrikethroughPrice && (
              <span className="extra-small-font text-[var(--secondary-text)] line-through">
                {formatCurrency({ amount: totalPrice })}
              </span>
            )}
            <span className="small-font font-600 text-[var(--primary-text)]">
              {formatCurrency({ amount: priceAfterDiscount })}
            </span>
          </div>

          {item.specialInstructions?.trim() && (
            <div className="mb-2">
              <span className="font-500">Instructions:</span>
              <span className="">{item.specialInstructions}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3">
          <SecondaryButton className="flex-1 font-700 heading-4" onClick={onClose}>
            {lang?.cancelIt}
          </SecondaryButton>
          <CustomButton className="flex-1 font-700 heading-4" onClick={onConfirm}>
            {lang?.orderAgain}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default ReorderConfirmModal;
