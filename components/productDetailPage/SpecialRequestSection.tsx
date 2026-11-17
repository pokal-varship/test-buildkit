"use client";

import React from "react";
import { cn } from "@lib/utils";
import { TranslationKeys } from "types";

interface SpecialRequestSectionProps {
  specialInstructions: string;
  setSpecialInstructions: (value: string) => void;
  lang: TranslationKeys;
  containerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  textareaClassName?: string;
}

const SpecialRequestSection: React.FC<SpecialRequestSectionProps> = ({
  specialInstructions,
  setSpecialInstructions,
  lang,
  containerClassName,
  titleClassName,
  descriptionClassName,
  textareaClassName,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 pb-5",
        containerClassName
      )}
    >
      <div>
        <h3
          className={cn(
            "font-700 pb-1 md:pb-2",
            titleClassName
          )}
        >
          {lang.specialRequest}
        </h3>
        <p
          className={cn(
            "extra-small-font md-heading-6 text-[var(--secondary-text)]",
            descriptionClassName
          )}
        >
          {lang.specialRequestDescription}
        </p>
      </div>
      <textarea
        value={specialInstructions}
        onChange={(e) => setSpecialInstructions(e.target.value)}
        placeholder={lang.specialRequestPlaceholder}
        className={cn(
          "w-full px-4 py-3 border border-[var(--borders-dividers)] rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[var(--borders-dividers)] bg-[var(--tertiary-background)] text-[var(--primary-text)] placeholder:text-[var(--secondary-text)]",
          textareaClassName
        )}
        rows={1}
      />
    </div>
  );
};

export default SpecialRequestSection;
