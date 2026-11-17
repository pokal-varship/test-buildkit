import Icon from "@components/image/Icons";
import {
  DELIVERY_ACTIVE_ICON,
  ORDERED_ICON,
  PREPARING_STEP_ACTIVE_ICON,
  READY_FOR_PICKUP_ACTIVE_ICON,
} from "@config/Header/image.config";
import { cn } from "@lib/utils";
import React, { FC } from "react";

const ACCENT_STEP_ICONS: Record<string, { href: string; viewBox: string }> = {
  [ORDERED_ICON]: { href: `${ORDERED_ICON}#ordered`, viewBox: "0 0 60 60" },
  [PREPARING_STEP_ACTIVE_ICON]: {
    href: `${PREPARING_STEP_ACTIVE_ICON}#preparing`,
    viewBox: "0 0 60 60",
  },
  [READY_FOR_PICKUP_ACTIVE_ICON]: {
    href: `${READY_FOR_PICKUP_ACTIVE_ICON}#pickup-ready`,
    viewBox: "0 0 60 60",
  },
  [DELIVERY_ACTIVE_ICON]: {
    href: `${DELIVERY_ACTIVE_ICON}#delivery-active`,
    viewBox: "0 0 60 60",
  },
};

export interface Step {
  id: number;
  label: string;
  desktopLabel?: string;
  icon: string;
  value: string;
  isCompleted: boolean;
  iconSize?: number;
  isActive?: boolean;
}

interface OrderTrackerProps {
  steps: Step[];
  containerClassName?: string;
}

const OrderTracker: FC<OrderTrackerProps> = ({ steps = [], containerClassName }) => {
  return (
    <div className={cn("w-full overflow-x-auto md:overflow-x-visible", containerClassName)} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
        .order-tracker-icon-track {
          width: 40px;
          height: 40px;
        }
        .order-tracker-connector {
          height: 40px;
        }
        .order-tracker-normal-icon {
          width: 32px;
          height: 32px;
        }
        .order-tracker-active-icon {
          width: 40px;
          height: 40px;
        }
        @media (min-width: 768px) {
          .order-tracker-icon-track {
            width: 60px;
            height: 60px;
          }
          .order-tracker-connector {
            height: 60px;
          }
          .order-tracker-normal-icon {
            width: 40px;
            height: 40px;
          }
          .order-tracker-active-icon {
            width: 60px;
            height: 60px;
          }
        }
      `}</style>
      <div className="flex items-start justify-between min-w-max md:min-w-0 md:w-full mb-4 md:mb-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isCompleted = step.isCompleted;
          const isActiveStep = Boolean(step.isActive);
          const accentIcon = ACCENT_STEP_ICONS[step.icon];
          const lineColor = isCompleted
            ? "bg-[var(--success)]"
            : "bg-[var(--center-alignment)]";
          return (
            <div
              key={index}
              className={`flex items-start ${
                isLast ? "flex-shrink-0" : "flex-1"
              }`}
            >
              <div className="flex flex-col items-center flex-shrink-0  md:mx-0">
                <div className="order-tracker-icon-track flex items-center justify-center flex-shrink-0">
                  {accentIcon ? (
                    <Icon
                      icon={accentIcon.href}
                      color="var(--accent-color)"
                      width={100}
                      height={100}
                      viewBox={accentIcon.viewBox}
                      className={cn(
                        "object-contain",
                        isActiveStep
                          ? "order-tracker-active-icon"
                          : "order-tracker-normal-icon",
                      )}
                    />
                  ) : (
                    <img
                      src={step.icon}
                      alt={step.label}
                      className={cn(
                        "object-contain",
                        isActiveStep
                          ? "order-tracker-active-icon"
                          : "order-tracker-normal-icon",
                      )}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[13px] md:text-xs text-center leading-tight whitespace-nowrap",
                    step.isActive && "invisible",
                    isCompleted
                      ? "font-bold text-[#007A2F]"
                      : "text-[var(--primary-text)]",
                  )}
                  aria-hidden={step.isActive}
                >
                  <span className="md:hidden">{step.label}</span>
                  <span className="hidden md:inline">{step.desktopLabel ?? step.label}</span>
                </span>
              </div>
              {!isLast && (
                <div className="order-tracker-connector flex flex-1 items-center mx-1 md:mx-2 min-w-[30px] md:min-w-0">
                  <div className={`w-full h-0.5 ${lineColor}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTracker;
