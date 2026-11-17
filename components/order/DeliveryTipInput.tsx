import { EDIT_ICON } from "@config/Header/image.config";
import { getTenantConfig } from "@config/tenant.config";
import useLang from "@hooks/useLang";
import { useQuantityControls } from "@hooks/useQuantityControls";
import formatCurrency from "@lib/helper/price";
import React, { useState, useCallback } from "react";
import { LanguageCode, TranslationKeys } from "types";
import CustomButton from "@components/buttons/Button";
import useAnalytics from "@hooks/useAnalytics";
import { useSelector } from "react-redux";
import { selectSessionId } from "@redux/slices/qrFlowSlice";

interface DeliveryTipInputProps {
  onTipChange?: (amount: number) => void;
  initialTip?: number;
  tips?: number[];
  cartId?: string;
  /** When true, show "Show your appreciation" server tip UI (QR/dine-in flow) */
  isQrFlow?: boolean;
  /** Subtotal/total used to calculate percentage tips (required when isQrFlow) */
  baseAmount?: number;
  /** Server name for QR flow card */
  serverName?: string;
  /** Server rating e.g. 4.8 */
  serverRating?: string | number;
}

const TIP_EMOJIS = ["😀", "🤩", "😍"] as const;
const CUSTOM_TIP_EMOJI = "🥰";

const DeliveryTipInput: React.FC<DeliveryTipInputProps> = ({
  onTipChange,
  initialTip = 0,
  tips = [5, 10, 15],
  cartId,
  isQrFlow = false,
  baseAmount = 0,
  serverName,
  serverRating,
}) => {
  const config = getTenantConfig();
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const { handleQuantity } = useQuantityControls(cartId as string);
  const { trackDineInTipUpdated } = useAnalytics();
  const qrSessionId = useSelector(selectSessionId);

  // ---- Delivery flow state ----
  const [selected, setSelected] = useState<"preset" | "custom" | null>(
    tips.includes(initialTip) ? "preset" : initialTip > 0 ? "custom" : null
  );
  const [customValue, setCustomValue] = useState(
    initialTip > 0 && !tips.includes(initialTip) ? initialTip : 0
  );
  const [inputValue, setInputValue] = useState(
    initialTip > 0 && !tips.includes(initialTip) ? initialTip.toString() : "0"
  );
  const [activePreset, setActivePreset] = useState<number | null>(
    tips.includes(initialTip) ? initialTip : null
  );

  // ---- QR flow state: 10%, 15%, 20%, Custom with $/% toggle ----
  const QR_PERCENTS = [10, 15, 20] as const;
  const [qrSelectedPercent, setQrSelectedPercent] = useState<number | null>(null);
  const [qrCustomSelected, setQrCustomSelected] = useState(false);
  const [qrCustomMode, setQrCustomMode] = useState<"percent" | "amount">("percent");
  const [qrCustomPercent, setQrCustomPercent] = useState(0);
  const [qrCustomAmount, setQrCustomAmount] = useState(0);
  const [qrCustomInputStr, setQrCustomInputStr] = useState("");

  // Save tip to server only when user finishes editing
  const saveTipToServer = useCallback(
    async (amount: number) => {
      if (!cartId) return;
      try {
        await handleQuantity(
          "UPDATE_TIP",
          "",
          "",
          "",
          undefined,
          cartId as string,
          undefined,
          amount
        );
      } catch (error) {
        console.error("Failed to update tip:", error);
      }
    },
    [handleQuantity, cartId]
  );

  // ---- QR flow: get current tip amount in currency ----
  const getQrTipAmount = useCallback((): number => {
    if (qrCustomSelected) {
      if (qrCustomMode === "percent") return (baseAmount * qrCustomPercent) / 100;
      return qrCustomAmount;
    }
    if (qrSelectedPercent != null) return (baseAmount * qrSelectedPercent) / 100;
    return 0;
  }, [qrCustomSelected, qrCustomMode, qrCustomPercent, qrCustomAmount, qrSelectedPercent, baseAmount]);

  const applyQrTip = useCallback(
    (amount: number) => {
      onTipChange?.(amount);
      if (cartId) saveTipToServer(amount);
      void trackDineInTipUpdated({
        tip_amount: amount,
        session_id: String(qrSessionId || cartId || ""),
        has_server_name: Boolean(serverName),
      });
    },
    [onTipChange, cartId, saveTipToServer, trackDineInTipUpdated, qrSessionId, serverName],
  );

  const handleQrPresetClick = (percent: number) => {
    if (qrSelectedPercent === percent && !qrCustomSelected) {
      setQrSelectedPercent(null);
      setQrCustomSelected(false);
      applyQrTip(0);
    } else {
      setQrSelectedPercent(percent);
      setQrCustomSelected(false);
      const amt = (baseAmount * percent) / 100;
      applyQrTip(amt);
    }
  };

  const handleQrCustomClick = () => {
    if (qrCustomSelected) {
      setQrCustomSelected(false);
      setQrSelectedPercent(null);
      setQrCustomPercent(0);
      setQrCustomAmount(0);
      setQrCustomInputStr("");
      applyQrTip(0);
    } else {
      setQrCustomSelected(true);
      setQrSelectedPercent(null);
      if (qrCustomPercent > 0) applyQrTip((baseAmount * qrCustomPercent) / 100);
      else if (qrCustomAmount > 0) applyQrTip(qrCustomAmount);
    }
  };

  const handleQrCustomPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, "");
    setQrCustomInputStr(val);
    const pct = val ? parseFloat(val) : 0;
    setQrCustomPercent(pct);
    setQrCustomAmount((baseAmount * pct) / 100);
    applyQrTip((baseAmount * pct) / 100);
  };

  const handleQrCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, "");
    setQrCustomInputStr(val);
    const amt = val ? parseFloat(val) : 0;
    setQrCustomAmount(amt);
    setQrCustomPercent(baseAmount > 0 ? (amt / baseAmount) * 100 : 0);
    applyQrTip(amt);
  };

  const handleQrCustomBlur = () => {
    const amt = getQrTipAmount();
    if (cartId) saveTipToServer(amt);
  };

  const handlePresetClick = (amount: number) => {
    // Toggle: if clicking the same preset, deselect it
    if (selected === "preset" && activePreset === amount) {
      setSelected(null);
      setActivePreset(null);
      setCustomValue(0);
      setInputValue("0");
      onTipChange?.(0);
      saveTipToServer(0);
    } else {
      setSelected("preset");
      setActivePreset(amount);
      setCustomValue(0);
      setInputValue("0");
      onTipChange?.(amount);
      saveTipToServer(amount);
    }
  };

  const handleCustomClick = () => {
    // Toggle: if custom is already selected, deselect it
    if (selected === "custom") {
      setSelected(null);
      setActivePreset(null);
      setCustomValue(0);
      setInputValue("0");
      onTipChange?.(0);
      saveTipToServer(0);
    } else {
      setSelected("custom");
      setActivePreset(null);
      if (customValue > 0) onTipChange?.(customValue);
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, "");
    setInputValue(val);
    const parsed = val ? parseFloat(val) : 0;
    setCustomValue(parsed);
    // Keep custom field visible while typing
    setSelected("custom");
    setActivePreset(null);

    // Immediate UI feedback only
    onTipChange?.(parsed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent 'e', 'E', '+', '-' characters
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }

    // Save tip on Enter key
    if (e.key === "Enter") {
      if (customValue === 0 || inputValue === "" || inputValue === "0") {
        setSelected(null);
        setInputValue("0");
        setCustomValue(0);
      }
      saveTipToServer(customValue);
    }
  };

  const handleBlur = () => {
    // Save tip when user leaves the input field
    // If input is empty or 0, clear the selection
    if (customValue === 0 || inputValue === "" || inputValue === "0") {
      setSelected(null);
      setInputValue("0");
      setCustomValue(0);
    }
    saveTipToServer(customValue);
  };

  const handleClearTip = () => {
    setSelected(null);
    setActivePreset(null);
    setCustomValue(0);
    setInputValue("0");
    onTipChange?.(0);
    saveTipToServer(0);
  };

  // ---- QR flow: "Show your appreciation" UI ----
  if (isQrFlow) {
    const currencySymbol = config.currencySymbolPrefix ?? "$";
    return (
      <div className="qr-tip-container rounded-xl bg-[var(--cards-containers)] py-6 md:p-5">
        <h3 className="font-700 heading-5 text-[var(--primary-text)] mb-1">
          {lang.showYourAppreciation}
        </h3>
        <p className="text-[var(--secondary-text)] small-font mb-4">
          {lang.tipGoesToServer}
        </p>
        {serverName != null && (
          <div className="flex items-center justify-between rounded-lg bg-[var(--primary-background)] p-3 mb-4">
            <div className="flex items-center gap-3">
            <img src="/images/icon/person-img.svg" alt="" className="w-8 h-8 object-contain" />
              <div>
                <p className="font-600 heading-6 text-[var(--primary-text)]">{serverName}</p>
                <p className="text-[var(--secondary-text)] extra-small-font">{lang.yourServer}</p>
              </div>
            </div>
            {serverRating != null && (
              <div className="flex items-center gap-1 rounded-[20px] py-0.5 px-1.5 text-[var(--primary-text)] bg-[var(--primary-color)]">
                <span className="text-lg">★</span>
                <span className="font-600 heading-6">{String(serverRating)}</span>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {QR_PERCENTS.map((pct) => {
            const amount = (baseAmount * pct) / 100;
            const isActive = !qrCustomSelected && qrSelectedPercent === pct;
            return (
              <CustomButton
                key={pct}
                onClick={() => handleQrPresetClick(pct)}
                className="flex-1 min-w-[70px] font-600 heading-6 !py-2 !border !border-[var(--borders-dividers)] text-[var(--primary-text)]"
                styles={{
                  backgroundColor: isActive ? "var(--button-primary-active-background)" : "var(--tertiary-background)"
                }}
              >
                <span className="block">{pct}%</span>
                <span className="block text-[var(--secondary-text)] font-400 extra-small-font mt-0.5 px-2 py-1 rounded-md bg-[var(--primary-background)]">
                  {formatCurrency({ amount })}
                </span>
              </CustomButton>
            );
          })}
          <CustomButton
            onClick={handleQrCustomClick}
            className="flex-1 min-w-[70px] font-600 heading-6 !py-2 !border !border-[var(--borders-dividers)] text-[var(--primary-text)]"
            styles={{
              backgroundColor: qrCustomSelected ? "var(--button-primary-active-background)" : "var(--tertiary-background)"
            }}
          >
            {lang.custom}
          </CustomButton>
        </div>
        {qrCustomSelected && (
          <div className="qr-tip-custom flex flex-col sm:flex-row sm:items-end gap-3">
            {/* Left: label + $/% toggle in one rounded container */}
            <div className="flex flex-col gap-2 sm:min-w-[120px]">
              <label className="text-[var(--secondary-text)] small-font mt-2">
                {lang.enterPercentage}
              </label>
              <div className="flex items-center gap-12">
              <div className="inline-flex rounded-xl bg-[var(--tertiary-background)] p-1 border border-[var(--borders-dividers)] w-fit">
                <button
                  type="button"
                  onClick={() => {
                    setQrCustomMode("amount");
                    setQrCustomInputStr("");
                  }}
                  className={`px-4 py-2 rounded-lg heading-6 font-600 transition-colors ${qrCustomMode === "amount" ? "bg-[var(--accent-color)] text-[var(--white)]" : "bg-transparent text-[var(--primary-text)]"}`}
                >
                  {currencySymbol}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQrCustomMode("percent");
                    setQrCustomInputStr("");
                  }}
                  className={`px-4 py-2 rounded-lg heading-6 font-600 transition-colors ${qrCustomMode === "percent" ? "bg-[var(--accent-color)] text-[var(--white)]" : "bg-transparent text-[var(--primary-text)]"}`}
                >
                  %
                </button>
              </div>
              {/* Right: single input row – value, calculated amount (beige), circular edit */}
            <div className="flex-1 flex items-center rounded-xl border border-[var(--borders-dividers)] bg-[var(--quaternary-background)] overflow-hidden min-h-12">
              {qrCustomMode === "percent" ? (
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  inputMode="decimal"
                  placeholder="0"
                  value={qrCustomInputStr !== "" ? qrCustomInputStr : (qrCustomPercent ? String(qrCustomPercent) : "")}
                  onChange={handleQrCustomPercentChange}
                  onBlur={handleQrCustomBlur}
                  className="flex-1 min-w-0 py-3 pl-4 pr-2 bg-transparent heading-5 font-600 text-[var(--primary-text)] outline-none"
                />
              ) : (
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  inputMode="decimal"
                  placeholder="0"
                  value={qrCustomInputStr !== "" ? qrCustomInputStr : (qrCustomAmount ? String(qrCustomAmount) : "")}
                  onChange={handleQrCustomAmountChange}
                  onBlur={handleQrCustomBlur}
                  className="flex-1 min-w-0 py-3 pl-4 pr-2 bg-transparent heading-5 font-600 text-[var(--primary-text)] outline-none"
                />
              )}
              <span className="heading-6 text-[var(--secondary-text)] py-1 px-3 rounded-lg bg-[var(--primary-background)] mr-2 shrink-0">
                {qrCustomMode === "percent" ? formatCurrency({ amount: (baseAmount * qrCustomPercent) / 100 }) : formatCurrency({ amount: qrCustomAmount })}
              </span>
              <span className="flex items-center justify-center shrink-0 mr-2">
                <img src={EDIT_ICON} alt="" className="w-6 h-6" aria-hidden />
              </span>
            </div>
            </div>
            </div>
            
          </div>
        )}
      </div>
    );
  }

  // ---- Delivery flow: "Add a Tip for Your Delivery" UI ----
  const hasAppliedTip =
    (selected === "preset" && activePreset != null && activePreset > 0) ||
    (selected === "custom" && customValue > 0);

  return (
    <div className="delivery-tip-container">
      <div className="tip-title">{lang.addATipForYourDelivery}</div>
      <div className="flex justify-between gap-2 flex-col md:flex-row">
      <div className="tip-options">
        <div className="tip-buttons">
          {tips.map((tip, index) => (
            <button
              key={tip}
              className={`tip-btn${selected === "preset" && activePreset === tip ? " selected" : ""
                }`}
              onClick={() => handlePresetClick(tip)}
              type="button"
            >
              <span className="inline-flex items-center justify-center gap-0.5 md:gap-1.5">
                <span className="heading-6 md-heading-5 leading-none" aria-hidden="true">
                  {TIP_EMOJIS[index] ?? TIP_EMOJIS[0]}
                </span>
                <span>{formatCurrency({ amount: tip })}</span>
              </span>
            </button>
          ))}
          <button
            className={`tip-btn${selected === "custom" ? " selected" : ""}`}
            onClick={handleCustomClick}
            type="button"
          >
            <span className="inline-flex items-center justify-center gap-0.5 md:gap-1.5">
              <span className="heading-6 md-heading-5 leading-none" aria-hidden="true">
                {CUSTOM_TIP_EMOJI}
              </span>
              <span>{lang.custom}</span>
            </span>
          </button>
        </div>
        {selected === "custom" && (
          <div className="tip-custom-input-wrapper">
            <label className="tip-label">
              {lang.enterAmount} ({config.currencySymbolPrefix})
            </label>
            <div className="input-container">
              <input
                type="number"
                min={0}
                step={0.01}
                placeholder="0"
                inputMode="decimal"
                value={inputValue}
                onChange={handleCustomChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className="tip-input"
              />
              <span className="edit-icon">
                <img src={EDIT_ICON} alt="edit" />
              </span>
            </div>
          </div>
        )}
      </div>
      {hasAppliedTip && (
        <div className="mt-3 flex flex-wrap items-end justify-end gap-2">
          <button
            type="button"
            className="small-font font-500 text-[var(--accent-color)] hover:underline bg-transparent border-0 p-0 cursor-pointer text-nowrap"
            onClick={handleClearTip}
          >
            {lang.clearTip}
          </button>
        </div>
      )}
      </div>

      <style>{`
        .delivery-tip-container {
          background-color: var(--cards-containers);
          border: 1px solid var(--borders-dividers);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .tip-title {
          font-size: var(--heading-h4);
          font-weight: var(--font-bold);
          margin-bottom: ${selected === "custom" ? "0px" : "16px"};
          color: var(--text-primary);
        }

        .tip-options {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          gap: 12px;
          justify-content: space-between;
        }

        .tip-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          padding-top: 14px;
        }

        .tip-btn {
          border: 1px solid #e6e6e6;
          background-color: var(--tertiary-background);
          border-radius: 12px;
          padding: 12px 24px;
          font-size: var(--description-font);
          font-weight: var(--font-medium);
          color: var(--primary-text);
          transition: all 0.2s ease-in-out;
          cursor: pointer;
          white-space: nowrap;
        }

        .tip-btn.selected {
          border: 1px solid var(--primary-color);
          font-weight: 700;
          background-color: var(--button-primary-active-background);
        }

        .tip-custom-input-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 150px;
          max-width: 180px;
        }

        .tip-label {
          font-size: var(--small-font);
          color: #888;
          margin-bottom: 0;
          line-height: 1;
        }

        .input-container {
          position: relative;
          width: 100%;
        }

        .tip-input {
          width: 100%;
          padding: 12px 44px 12px 14px;
          font-size: var(--description-font);
          border-radius: 12px;
          border: 1px solid var(--borders-dividers);
          background-color: var(--primary-background);
          color: var(--primary-text);
        }

        .tip-input:focus {
          outline: none;
          border-color: var(--primary-color);
          background-color: var(--primary-background);
        }

        .edit-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          display: flex;
          align-items: center;
        }

        @media (max-width: 1024px) {
          .tip-custom-input-wrapper {
            min-width: 160px;
            max-width: 220px;
          }
        }

        @media (max-width: 900px) {
          .tip-options {
            flex-wrap: wrap;
          }

          .tip-custom-input-wrapper {
            width: 100%;
            max-width: 100%;
            min-width: 100%;
          }
        }

        @media (max-width: 768px) {
          .delivery-tip-container {
            margin-bottom: 0px;
            padding: 16px;
          }

          .tip-title {
            font-size: 16px;
            margin-bottom: 12px;
          }

          .tip-options {
            flex-wrap: wrap;
            gap: 10px;
          }

          .tip-buttons {
            width: 100%;
            flex-wrap: wrap;
            justify-content: flex-start;
            gap: 10px;
          }

          .tip-btn {
            flex: 1;
            min-width: 80px;
            text-align: center;
            padding: 10px 16px;
            font-size: 15px;
          }

          .tip-custom-input-wrapper {
            width: 100%;
            max-width: 100%;
            min-width: 100%;
          }

          .tip-input {
            font-size: 15px;
            padding: 10px 40px 10px 12px;
          }

          .tip-label {
            font-size: 11px;
          }
        }

        @media (max-width: 480px) {
          .delivery-tip-container {
            padding: 14px;
          }

          .tip-title {
            font-size: 15px;
          }

          .tip-options {
            gap: 8px;
          }

          .tip-buttons {
            gap: 12px;
            padding-top: 0px !important;
          }

          .tip-btn {
            min-width: 70px;
            padding: 10px 0;
            font-size: 14px;
          }

          .tip-input {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default DeliveryTipInput;
