"use client";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectViewMode,
  setViewMode,
  ViewMode,
} from "@redux/slices/productViewSlice";
import {
  GRID_ICON,
  LIST_ICON,
  SELECTED_GRID_ICON,
  SELECTED_LIST_ICON,
} from "@config/Header/image.config";
import Icon from "@components/image/Icons";
import { useAnalytics } from "@hooks/useAnalytics";
import { selectIsQrFlowActive } from "@redux/slices/qrFlowSlice";
import { DINE_IN_ANALYTICS_CONTEXT } from "@lib/analytics/dineInAnalytics";

interface ToggleViewProps {
  mobile?: boolean;
}

export const ToggleView: React.FC<ToggleViewProps> = ({ mobile = false }) => {
  const dispatch = useDispatch();
  const currentViewMode = useSelector(selectViewMode);
  const { trackViewModeChanged } = useAnalytics();
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const dineInTrackExtra = isQrFlowActive ? DINE_IN_ANALYTICS_CONTEXT : undefined;

  const toggleViewMode = (mode: ViewMode) => {
    dispatch(setViewMode(mode));
    trackViewModeChanged(mode, dineInTrackExtra);
  };

  // Mobile view: show only one button with opposite icon
  if (mobile) {
    const oppositeMode: ViewMode = currentViewMode === "grid" ? "list" : "grid";
    const oppositeIcon = currentViewMode === "grid" 
      ? `${LIST_ICON}#list` 
      : `${GRID_ICON}#grid`;
    const oppositeLabel = currentViewMode === "grid" ? "List View" : "Grid View";

    return (
      <button
        onClick={() => toggleViewMode(oppositeMode)}
        aria-label={oppositeLabel}
        className="focus:outline-none bg-[var(--cards-containers)]"
      >
        <Icon
          icon={oppositeIcon}
          color="var(--primary-color)"
          width={37}
          height={37}
          className="w-[37px] h-[37px]"
          viewBox="0 0 42 42"
          aria-label={oppositeLabel}
        />
      </button>
    );
  }

  // Desktop view: show both buttons
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => toggleViewMode("grid")}
        aria-label="Grid View"
        className="focus:outline-none"
      >
        <Icon
          icon={currentViewMode === "grid" ? `${SELECTED_GRID_ICON}#grid-selected` : `${GRID_ICON}#grid`}
          color="var(--button-primary-background)"
          width={30}
          height={30}
          className="md:w-[40px] md:h-[40px] w-[30px] h-[30px]"
          viewBox="0 0 42 42"
          aria-label="Grid View"
        />
      </button>
      <button
        onClick={() => toggleViewMode("list")}
        aria-label="List View"
        className="focus:outline-none"
      >
        <Icon
          icon={currentViewMode === "list" ? `${SELECTED_LIST_ICON}#list-selected` : `${LIST_ICON}#list`}
          color="var(--button-primary-background)"
          width={30}
          height={30}
          className="md:w-[40px] md:h-[40px] w-[30px] h-[30px]"
          viewBox="0 0 42 42"
          aria-label="List View"
        />
      </button>
    </div>
  );
};
