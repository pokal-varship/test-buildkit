import PlayButton from "@components/icons/PlayButton";
import { MediaType } from "@components/type/pdp.type";
import { DiscountOffer } from "@services/typesense";
import React, { FC } from "react";

interface MediaIndicatorProps {
  items: MediaType[] | DiscountOffer[];
  activeIndex: number;
  onSelect?: (index: number) => void;
  containerClassName?: string;
  itemClassName?: string;
  activeClassName?: string;
}

const MediaIndicator: FC<MediaIndicatorProps> = ({
  items,
  activeIndex,
  onSelect,
  containerClassName,
  itemClassName,
  activeClassName,
}) => {
  return (
    <div className={`flex gap-2 ${containerClassName || ""}`}>
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        return (
          <div key={index}>
            {!(item.type === 'video' || item.type?.startsWith('video/')) ? (
              <div
                onClick={() => onSelect && onSelect(index)}
                className={` min-w-[8px] cursor-pointer min-h-[8px] max-w-[8px] max-h-[8px] rounded-full  ${
                  isActive
                    ? `bg-[var(--accent-color)] ${activeClassName || ""}`
                    : "border border-[var(--secondary-text)] bg-transparent"
                } ${itemClassName || ""}`}
              ></div>
            ) : (
              <PlayButton  borderColor={isActive ? "var(--accent-color)" : "var(--black)"} className="cursor-pointer" onClick={() => onSelect && onSelect(index)} height="9" width="9" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MediaIndicator;
