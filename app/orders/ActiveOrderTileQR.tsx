"use client";

import React from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { TranslationKeys } from "types";
import useLang from "@hooks/useLang";
import useProductUrl from "@hooks/useProductUrl";
import {
  selectQrFlowTableNumber,
  selectDineInSessionProductCount,
  selectSessionTablePin,
} from "@redux/slices/qrFlowSlice";
import { ARROW_RIGHT, DINE_IN_ICON_ORDER } from "@config/Header/image.config";
import Icon from "@components/image/Icons";
import { cn } from "@lib/utils";

const ACTIVE_TILE_BG = "linear-gradient(172.43deg, #FAEDFF 5.86%, #E5E7FF 95.99%)";
const ACTIVE_TILE_BORDER =
  "linear-gradient(98.5deg, #F28DFF 5.77%, #A325FF 93.03%)";

export default function ActiveOrderTileQR() {
  const [lang]: [TranslationKeys, "en" | "ar"] = useLang();
  const router = useRouter();
  const { getQrCheckoutUrl } = useProductUrl();
  const productCount = useSelector(selectDineInSessionProductCount);
  const tableNumber = useSelector(selectQrFlowTableNumber);
  const sessionTablePin = useSelector(selectSessionTablePin);
  const showTablePinButton = Boolean(sessionTablePin);
  const tablePinDisplay = sessionTablePin ?? "—";

  const handleClick = () => {
    router.push(getQrCheckoutUrl());
  };

  if (productCount < 1) {
    return null;
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className="rounded-lg cursor-pointer mb-4 p-[1px]"
      style={{ background: ACTIVE_TILE_BORDER }}
    >
      <div
        className={cn(
          "flex flex-col items-start gap-2 py-4 px-[10px] rounded-[7px]"
        )}
        style={{ background: ACTIVE_TILE_BG }}
      >
        <span className="heading-5 font-600 text-[var(--primary-text)]">
          {lang.order.activeOrder}
        </span>
        <div className="flex items-center gap-4 w-full">
          <Image
            src={DINE_IN_ICON_ORDER}
            alt={lang.dineIn}
            width={74}
            height={74}
            className="object-contain"
          />
          <div className="flex flex-1 justify-between gap-y-1 min-w-0">
            <div>
            <p className="small-font font-500">
              {productCount} Product{productCount !== 1 ? "(s)" : ""}
            </p>
            <p className="small-font text-[var(--secondary-text)]">
              {lang.tableNo} : {tableNumber ?? "—"}
            </p>
            <div className="flex items-center justify-between">
              {showTablePinButton && (
                <button
                  type="button"
                  className="mt-1 w-fit px-3 py-1.5 rounded heading-6 font-600 bg-[#4285F4] text-[var(--white)] border-0 cursor-pointer hover:opacity-90 tracking-wider"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                  }}
                >
                  {lang.order.tablePin} : {tablePinDisplay}
                </button>
              )}              
            </div>
            </div>
            <div className="flex items-center shrink-0 rounded-full transition-colors border border-[var(--rating-border-primary)] bg-[var(--primary-tab-background)] md:bg-[var(--primary-background)] justify-center w-7 h-7 self-end">
                <Icon
                  icon={`${ARROW_RIGHT}#arrow-right`}
                  width={18}
                  height={18}
                  color="var(--primary-text)"
                  className="w-5 h-5"
                  viewBox="0 0 15 15"
                />
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
