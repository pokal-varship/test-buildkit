import React from "react";
import { cn } from "@lib/utils";

export interface RadioGroupOption {
  label: string;
  value: string;
}

interface RadioGroupProps {
  label?: string;
  options: RadioGroupOption[];
  value: string;
  onChange: (option: RadioGroupOption) => void;
  name: string;
  containerClassName?: string;
  labelClassName?: string;
  optionClassName?: string;
  radioClassName?: string;
  optionContainerClassName?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  options,
  value,
  onChange,
  name,
  containerClassName = "",
  labelClassName = "",
  optionClassName = "",
  radioClassName = "",
  optionContainerClassName = "",
}) => {
  return (
    <>
      <div className={cn("text-[var(--primary-text)]", containerClassName)}>
        {label && (
          <div className={cn("font-700 mb-2", labelClassName)}>{label}</div>
        )}
        <div className={cn("flex flex-col gap-4", optionContainerClassName)}>
          {options.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex items-center cursor-pointer font-normal",
                optionClassName
              )}
            >
              <input
                type="radio"
                name={name}
                checked={value === option.value}
                onChange={() => onChange(option)}
                className={cn("mr-2 h-5 w-5 custom-radio", radioClassName)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>
      <style>
        {`
          .custom-radio {
            appearance: none;
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            border: 2px solid var(--secondary-text);
            border-radius: 50%;
            position: relative;
            cursor: pointer;
          }

          .custom-radio:checked {
            border-color: var(--button-primary-background);
          }

          .custom-radio:checked::before {
              content: "";
              position: absolute;
              top: 2px;
              left: 2px;
              width: 10px;
              height: 10px;
              background-color: var(--button-primary-background);
              border-radius: 50%;
          }
           
          @media only screen and (min-width: 1280px) {
            .cancel-radio:checked::before {
              left: 2.25px !important;
            }
          }
        `}
      </style>
    </>
  );
};

export default RadioGroup;