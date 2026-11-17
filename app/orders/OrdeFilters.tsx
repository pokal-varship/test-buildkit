import React, { FC, useEffect, useState, useRef } from "react";
import CustomButton from "@components/buttons/Button";
import RadioGroup, { RadioGroupOption } from "./RadioGroup";
import { cn } from "@lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useAppSearchParams } from "@context/SearchParamsContext";
import useLang from "@hooks/useLang";
import { LanguageCode, TranslationKeys } from "types";
// const tabs = [
//   { id: 1, label: lang.order.ongoing, value: "ONGOING" },
//   { id: 2, label: lang.order.completed, value: "COMPLETED" },
//   { id: 3, label: lang.order.cancelled, value: "CANCELLED" },
// ];
type OrderFiltersProps = {
  onClose: () => void;
};

const OrderFilters: FC<OrderFiltersProps> = ({ onClose }) => {
  const [lang]: [TranslationKeys, LanguageCode] = useLang();
  const [customDates, setCustomDates] = useState({
    start: "",
    end: "",
  });
  const filtersLang = lang.order.filters;
  const orderTypes: RadioGroupOption[] = [
    { label: filtersLang.orderType.allOrders, value: "ALL" },
    { label: filtersLang.orderType.openOrders, value: "ONGOING" },
    { label: filtersLang.orderType.completedOrders, value: "COMPLETED" },
    { label: filtersLang.orderType.cancelledOrders, value: "REFUNDED" },
  ];

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;
  const minDate = "2000-01-01";

  const timeFilters: RadioGroupOption[] = [
    { label: filtersLang.timeFilter.last30Days, value: "LAST_30_DAYS" },
    { label: filtersLang.timeFilter.last6Months, value: "LAST_6_MONTHS" },
    { label: filtersLang.timeFilter.lastYear, value: "LAST_YEAR" },
    { label: filtersLang.timeFilter.custom, value: "CUSTOM_DATE" },
  ];
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useAppSearchParams();
  const [filters, setFilters] = useState({
    orderType: "ALL",
    timeFilter: "",
  });
  const customDateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilters({
      orderType: searchParams.get("orderType") || "ALL",
      timeFilter: searchParams.get("timeFilter") || "",
    });
    if (searchParams.get("timeFilter") === "CUSTOM_DATE") {
      setCustomDates({
        start: searchParams.get("startDate") || "",
        end: searchParams.get("endDate") || "",
      });
    } else {
      setCustomDates({ start: "", end: "" });
    }
  }, [searchParams.params]);

  const handleChange = (key: string, value: string) => {
    setFilters({
      ...filters,
      [key]: value,
    });
    if (key === "timeFilter") {
      if (value === "CUSTOM_DATE") {
        setTimeout(() => {
          customDateRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      } else {
        setCustomDates({ start: "", end: "" });
      }
    }
  };

  const handleCustomDateChange = (key: "start" | "end", value: string) => {
    setCustomDates({
      ...customDates,
      [key]: value,
    });
    setFilters({
      ...filters,
      timeFilter: "CUSTOM_DATE",
    });
  };

  const handleApply = () => {
    const currentParams = new URLSearchParams(searchParams.toString() || "");
    if (filters.orderType) {
      currentParams.set("orderType", filters.orderType);
    }
    if (filters.timeFilter) {
      currentParams.set("timeFilter", filters.timeFilter);
      if (filters.timeFilter === "CUSTOM_DATE") {
        if (customDates.start)
          currentParams.set("startDate", customDates.start);
        if (customDates.end) currentParams.set("endDate", customDates.end);
      } else {
        currentParams.delete("startDate");
        currentParams.delete("endDate");
      }
    }
    router.push(`${pathname}?${currentParams.toString()}`);
    onClose();
  };

  const handleClear = () => {
    setFilters({
      orderType: "",
      timeFilter: "",
    });
    setCustomDates({ start: "", end: "" });
    const currentParams = new URLSearchParams(searchParams.toString() || "");
    currentParams.delete("orderType");
    currentParams.delete("timeFilter");
    currentParams.delete("startDate");
    currentParams.delete("endDate");
    router.push(
      `${pathname}${currentParams.toString() ? `?${currentParams.toString()}` : ""}`,
    );
    onClose();
  };

  const isFiltersValid = () => {
    if (filters.orderType !== "ALL") return true;
    if (filters.timeFilter) {
      if (filters.timeFilter === "CUSTOM_DATE") {
        return customDates.start && customDates.end;
      }
      return true;
    }
    return false;
  };

  return (
    <div
      className={cn(
        "w-full flex flex-col relative max-h-[82vh] overflow-y-auto p-4 md:p-0",
      )}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="m-0 text-2xl font-bold text-[var(--primary-text)]">{filtersLang.title}</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={handleClear}
            className="text-[var(--error)] bg-none border-none font-medium cursor-pointer hover:underline"
          >
            {filtersLang.clearFilter}
          </button>
          {/* <CrossIcon className='cursor-pointer' pathFillColor='var(--primary-text)' onClick={onClose} /> */}
        </div>
      </div>
      <div className="flex flex-col flex-1 h-full overflow-y-auto hide-scrollbar">
        <RadioGroup
          label={filtersLang.orderType.title}
          options={orderTypes}
          value={filters.orderType}
          onChange={(option) => handleChange("orderType", option.value)}
          name="orderType"
          containerClassName="mb-1"
          labelClassName="text-base"
          optionClassName=""
          radioClassName=""
        />
        <hr className="border-t  my-4" />
        <RadioGroup
          label={filtersLang.timeFilter.title}
          options={timeFilters}
          value={filters.timeFilter}
          onChange={(option) => handleChange("timeFilter", option.value)}
          name="timeFilter"
          containerClassName="mb-4"
          labelClassName="text-base"
          optionClassName=""
          radioClassName=""
        />
        {filters.timeFilter === "CUSTOM_DATE" && (
          <div ref={customDateRef} className="flex flex-col gap-2 mb-4">
            <div className="flex gap-2">
              <div className="flex flex-col flex-1">
                <label className="heading-6 mb-1 text-[var(--secondary-text)]">
                  {filtersLang.timeFilter.startDate}
                </label>
                <input
                  type="date"
                  className="border border-[var(--borders-dividers)] text-[var(--primary-text)] rounded px-2 py-2 bg-[var(--cards-containers)]"
                  min={minDate}
                  max={todayStr}
                  value={customDates.start}
                  onChange={(e) =>
                    handleCustomDateChange("start", e.target.value)
                  }
                  onClick={(e) => e.currentTarget.showPicker()}
                  onFocus={(e) => e.target.blur()} // This prevents the selection like "yyyy"
                />
              </div>
              <div className="flex flex-col flex-1">
                <label className="heading-6 mb-1 text-[var(--secondary-text)]">
                  {filtersLang.timeFilter.endDate}
                </label>
                <input
                  type="date"
                  className="border border-[var(--borders-dividers)] text-[var(--primary-text)] rounded px-2 py-2 bg-[var(--cards-containers)]"
                  min={minDate}
                  max={todayStr}
                  value={customDates.end}
                  onChange={(e) =>
                    handleCustomDateChange("end", e.target.value)
                  }
                  onClick={(e) => e.currentTarget.showPicker()}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <CustomButton
        className="order-filters-apply-button"
        onClick={handleApply}
        disabled={!isFiltersValid()}
      >
        {filtersLang.apply}
      </CustomButton>
      <style>{`
        .order-filters-apply-button {
          width: 100%;
          padding: 12px 0;
          border: none;
          margin-top: 16px;
          font-weight: var(--font-semi-bold) !important;
          font-size: var(--heading-h4) !important;
        }
      `}</style>
    </div>
  );
};

export default OrderFilters;
