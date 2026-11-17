"use client";

import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { isValidHexColor } from '@lib/theme/themeValidator';
import { ResetButton } from './ResetButton';

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  envVariable: string;
  description?: string;
  onReset?: () => void;
}

export function ColorPickerField({
  label,
  value,
  onChange,
  // envVariable,
  description,
  onReset
}: ColorPickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [error, setError] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
    setError('');
  }, [value]);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (isValidHexColor(newValue)) {
      setError('');
      onChange(newValue);
    } else if (newValue.trim() !== '') {
      setError('Invalid hex color format (e.g., #FFFFFF)');
    }
  };

  const handlePickerChange = (color: string) => {
    setInputValue(color);
    setError('');
    onChange(color);
  };

  return (
    <div className="mb-4">
      <div className="flex items-start justify-between gap-3 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--primary-text)' }}>
            {label}
          </label>
          {description && (
            <p className="text-xs mb-2" style={{ color: 'var(--secondary-text)' }}>
              {description}
            </p>
          )}
        </div>

        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 rounded-lg border-2 cursor-pointer transition-transform hover:scale-105 shadow-sm"
            style={{
              backgroundColor: value,
              borderColor: 'var(--borders-dividers)'
            }}
            title="Click to open color picker"
          />

          {isOpen && (
            <div
              ref={popoverRef}
              className="absolute right-0 mt-2 z-50 p-3 rounded-lg shadow-xl"
              style={{
                backgroundColor: 'var(--primary-background)',
                border: '1px solid var(--borders-dividers)'
              }}
            >
              <HexColorPicker color={value} onChange={handlePickerChange} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="#FFFFFF"
            className="flex-1 px-3 py-2 text-sm rounded-lg border-2 transition-colors"
            style={{
              backgroundColor: 'var(--primary-background)',
              color: 'var(--primary-text)',
              borderColor: error ? '#EF4444' : 'var(--borders-dividers)',
              opacity: 1
            }}
          />
          {onReset && (
            <ResetButton 
              onReset={onReset} 
              title={`Reset ${label} to default value`}
              size="sm"
            />
          )}
        </div>
        {error && (
          <p className="text-xs mt-1" style={{ color: '#EF4444' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

