"use client";

import React from "react";
import { useSelector } from "react-redux";
import {
  selectQrFlowTableNumber,
  selectSessionTablePin,
} from "@redux/slices/qrFlowSlice";

/** Lang object from useLang / order screens; only table, tableNo, order.tablePin are used */
export interface TablePinBadgeLang {
  table?: string;
  tableNo?: string;
  order?: { tablePin?: string; [key: string]: unknown };
}

interface TablePinBadgeProps {
  /** Optional labels; defaults: TABLE, TABLE NO, TABLE PIN */
  lang?: TablePinBadgeLang;
  /** Optional wrapper className (e.g. "shrink-0 ml-2" in header) */
  className?: string;
  /** When true, single badge uses .table-no-badge style (e.g. MyOrderHeader) */
  useBadgeStyle?: boolean;
  /** When true, forces single-part badge regardless of table pin existence */
  forceSinglePart?: boolean;
}

const TablePinBadge: React.FC<TablePinBadgeProps> = ({
  lang,
  className = "",
  useBadgeStyle = false,
  forceSinglePart = false,
}) => {
  const qrFlowTableNumber = useSelector(selectQrFlowTableNumber);
  const sessionTablePin = useSelector(selectSessionTablePin);
  // NOTE: Do not gate table PIN display on qrResolveData.isParticipant; rely on sessionTablePin presence.

  if (!qrFlowTableNumber) return null;

  const tableLabel = lang?.table ?? "TABLE";
  const tableNoLabel = lang?.tableNo ?? "TABLE NO";
  const tablePinLabel = lang?.order?.tablePin ?? "TABLE PIN";
  const showTwoPart = !forceSinglePart && sessionTablePin;

  if (showTwoPart) {
    return (
      <div
        className={`flex shrink-0 overflow-hidden rounded-lg text-[var(--white)] ${className}`.trim()}
      >
        <div className="flex flex-col items-center justify-center px-3 py-1 bg-[var(--error)] min-w-[52px] text-nowrap">
          <span className="heading-6 font-800 leading-tight tracking-wider">
            {qrFlowTableNumber}
          </span>
          <span className="text-[10px] font-700 uppercase tracking-wide">
            {tableLabel}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center px-3 py-1 bg-[#4285F4] min-w-[52px] text-nowrap">
          <span className="heading-6 font-800 leading-tight tracking-wider">
            {sessionTablePin}
          </span>
          <span className="text-[10px] font-700 uppercase tracking-wide">
            {tablePinLabel}
          </span>
        </div>
      </div>
    );
  }

  if (useBadgeStyle) {
    return (
      <span className={`table-no-badge ${className}`.trim()}>
        {tableNoLabel}: {qrFlowTableNumber}
      </span>
    );
  }

  return (
    <div
      className={`shrink-0 px-2 py-2.5 rounded-md bg-[var(--error)] text-[var(--white)] extra-small-font font-700 uppercase tracking-wide ${className}`.trim()}
    >
      {tableNoLabel}: {qrFlowTableNumber}
    </div>
  );
};

export default TablePinBadge;
