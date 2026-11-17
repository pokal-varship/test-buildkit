"use client";

import React from "react";
import { ticketStatusConfig } from "@config/ticketStatus.config";

export interface KitchenTicketProps {
  /** Ticket number to show in pill (e.g. 1, 2) */
  ticketNumber: number;
  /** Number of items in this ticket */
  itemCount: number;
  /** Optional time string (e.g. "12:37 PM") - when not provided, "—" or empty */
  displayTime?: string;
  /** Ticket status from sessions API (e.g. SUBMITTED, PENDING_PAYMENT) */
  status?: string;
  /** Content below the header (e.g. list of KitchenTicketItemDetail) */
  children: React.ReactNode;
  /** Optional class for the container */
  className?: string;
}

/**
 * Reusable ticket block for Kitchen Status: orange "Ticket #N" pill, "X items • time", and children.
 * Use multiple KitchenTicket components when there are multiple tickets.
 */
const KitchenTicket: React.FC<KitchenTicketProps> = ({
  ticketNumber,
  itemCount,
  displayTime,
  status,
  children,
  className = "",
}) => {
  const timeLabel = displayTime || "—";
  const itemLabel = itemCount === 1 ? "1 item" : `${itemCount} items`;
  const statusUpper = (status ?? "").toUpperCase();

  const STATUS_LABELS: Record<string, string> = {
    [ticketStatusConfig.submitted]: "Submitted",
    [ticketStatusConfig.sentToKitchen]: "Sent to Kitchen",
    [ticketStatusConfig.pendingPayment]: "Payment Pending",
    [ticketStatusConfig.inProgress]: "In Progress",
    [ticketStatusConfig.ready]: "Ready",
    [ticketStatusConfig.completed]: "Completed",
    [ticketStatusConfig.cancelled]: "Cancelled",
    [ticketStatusConfig.abandoned]: "Abandoned",
    [ticketStatusConfig.draft]: "Draft",
  };

  const statusLabel = statusUpper ? (STATUS_LABELS[statusUpper] ?? statusUpper) : null;

  return (
    <div className={`kitchen-ticket ${className}`}>
      <div className="flex items-start justify-between gap-2 border-b border-[var(--rating-border-primary)] pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-1 rounded-[4px] bg-[var(--accent-color)] text-[var(--white)] font-600 extra-small-font">
            Ticket #{ticketNumber}
          </span>
          <span className="extra-small-font text-[var(--secondary-text)]">
            {itemLabel}
            {timeLabel !== "—" ? ` • ${timeLabel}` : ""}
          </span>
        </div>
        {statusLabel && (
          <span
            className="inline-flex items-center px-1.5 py-1 rounded-[4px] font-500 extra-small-font whitespace-nowrap bg-[var(--success)] text-[var(--white)] tracking-wide"
          >
            {statusLabel}
          </span>
        )}
      </div>
      <div className="kitchen-ticket__content flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default KitchenTicket;
