"use client";

import React, { ReactNode } from 'react';

interface ResizablePanelsProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  leftRatio?: number;
  rightRatio?: number;
}

// Named export for dynamic import
export function ResizablePanels({
  leftPanel,
  rightPanel,
  leftRatio = 35,
  rightRatio = 75
}: ResizablePanelsProps) {
  return (
    <div
      className="grid h-full gap-4"
      style={{ gridTemplateColumns: `minmax(320px, ${leftRatio}fr) minmax(0, ${rightRatio}fr)` }}
    >
      <div className="h-full overflow-y-auto pr-2">
        {leftPanel}
      </div>
      <div className="h-full overflow-hidden">
        {rightPanel}
      </div>
    </div>
  );
}
