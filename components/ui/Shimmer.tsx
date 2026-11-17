import React from "react";

interface ShimmerProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  baseColor?: string;
  shimmerColor?: string;
  style?: React.CSSProperties;
  className?: string;
}

const Shimmer: React.FC<ShimmerProps> = ({
  width = "100%",
  height = 16,
  borderRadius = 8,
  baseColor = "#f0f0f0",
  shimmerColor = "#e0e0e0",
  style,
  className = "",
}) => {
  return (
    <>
      <div
        className={`shimmer-wrapper ${className}`}
        style={{
          width,
          height,
          minWidth: typeof width === "number" ? `${width}px` : width,
          minHeight: typeof height === "number" ? `${height}px` : height,
          borderRadius,
          backgroundColor: baseColor,
          position: "relative",
          overflow: "hidden",
          ...style,
        }}
      >
        <div className="shimmer-effect" />
      </div>
      <style>{`
        .shimmer-wrapper {
          display: block;
        }

        .shimmer-effect {
          pointer-events: none;
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          background-image: linear-gradient(
            90deg,
            transparent 0%,
            ${baseColor} 40%,
            ${shimmerColor} 50%,
            ${baseColor} 60%,
            transparent 100%
          );
          background-repeat: no-repeat;
          background-size: 200% 100%;
          animation: shimmer-move 1.5s infinite linear;
        }

        @keyframes shimmer-move {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 100% 0;
          }
        }
      `}</style>
    </>
  );
};

export default Shimmer;