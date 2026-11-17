import React from 'react';

interface CheckboxSvgProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  id: string;
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const CheckboxSvg: React.FC<CheckboxSvgProps> = ({
  checked,
  onChange,
  name,
  id,
  value,
  children,
  className = ""
}) => {
  return (
    <>
    <label className={`w-full text-left flex items-center py-2 heading-5 ${className}`}>
      <input
        type="checkbox"
        className="mr-2 hidden"
        name={name}
        id={id}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <span className={`inline-flex items-center justify-center mr-2 checkbox-svg ${checked ? 'bg-[var(--primary-color)]' : 'border border-gray-400'} rounded-sm`}>
        {checked && (
          <svg xmlns="http://www.w3.org/2000/svg" className="text-white checkbox-svg" fill="none" viewBox="0 0 26 26" stroke="var(--black)">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      {children}
    </label>
    <style>
      {
        `
        .checkbox-svg {
          width: 1rem;
          height: 1rem;
        }
        
        `
      }
    </style>
    </>
  );
}; 