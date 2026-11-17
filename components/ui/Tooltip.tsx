"use client";

import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

interface TooltipProps {
  text: React.ReactNode;
  children: React.ReactNode;
  delayDuration?: number;
  side?: "top" | "right" | "bottom" | "left";
  contentClassName?: string;
  arrowClassName?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  text,
  children,
  delayDuration = 300,
  side = "top",
  contentClassName = "",
  arrowClassName = "",
}) => {
  return (
    <>
      <TooltipPrimitive.Provider delayDuration={delayDuration}>
        <TooltipPrimitive.Root>
          <TooltipPrimitive.Trigger asChild>
            {children}
          </TooltipPrimitive.Trigger>
          <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
              side={side}
              className={`tooltip-content ${contentClassName}`.trim()}
              sideOffset={5}
            >
              {text}
              <TooltipPrimitive.Arrow
                className={`tooltip-arrow ${arrowClassName}`.trim()}
              />
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
      </TooltipPrimitive.Provider>
      <style>{`
        .tooltip-content {
          background-color: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          max-width: 300px;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
          line-height: 1.4;
        }
        .tooltip-arrow {
          fill: rgba(0, 0, 0, 0.9);
        }
      `}</style>
    </>
  );
};

export default Tooltip;

