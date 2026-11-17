import { cn } from "@lib/utils";
import { FC } from "react";

type ProgressBarProps = {
  percentage: number;
  color?: string;
  remainingPercentageColor?: string;
  className?: string;
  progressPercentageClassName?: string;
  progressBarHeight?: string;
};

const ProgressBar: FC<ProgressBarProps> = ({
  percentage,
  color = 'var(--primary-text)',
  remainingPercentageColor = 'var(--primary-background)',
  className,
  progressPercentageClassName,
  progressBarHeight = 'var(--progress-bar-height, 8px)',
}) => (
  <div
    className={cn('w-full rounded-lg', className)}
    style={{ background: remainingPercentageColor }}
  >
    <div
      className={cn('rounded-lg', progressPercentageClassName)}
      style={{
        width: `${percentage}%`,
        background: color,
        height: progressBarHeight,
      }}
    />
  </div>
);
export default ProgressBar;