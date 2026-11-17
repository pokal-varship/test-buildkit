"use client";

import React, { useState, useRef, useEffect } from 'react';
import { THEME_PRESETS, getThemePresetById } from '@lib/theme/themePresets';

interface ThemePresetDropdownProps {
  currentPresetId: string;
  onPresetChange: (presetId: string) => void;
}

export function ThemePresetDropdown({ currentPresetId, onPresetChange }: ThemePresetDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentPreset = getThemePresetById(currentPresetId);
  const displayName = currentPreset?.name || 'Custom Theme';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
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

  const handlePresetSelect = (presetId: string) => {
    onPresetChange(presetId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
        style={{
          backgroundColor: 'var(--cards-containers)',
          color: 'var(--primary-text)',
          border: '1px solid var(--borders-dividers)'
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
        <span>{displayName}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-96 rounded-lg shadow-xl z-50 border"
          style={{
            backgroundColor: 'var(--cards-containers)',
            borderColor: 'var(--borders-dividers)'
          }}
        >
          <div className="p-2">
            <div className="mb-2 px-3 py-2">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--primary-text)' }}>
                Choose Theme Preset
              </h3>
              <p className="text-xs mt-1" style={{ color: 'var(--secondary-text)' }}>
                Select a pre-designed color scheme for your food commerce site
              </p>
            </div>
            
            <div className="space-y-1">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`w-full text-left px-3 py-3 rounded-md transition-all hover:opacity-80 ${
                    currentPresetId === preset.id ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor: currentPresetId === preset.id 
                      ? 'var(--secondary-background)' 
                      : 'transparent',
                    '--tw-ring-color': currentPresetId === preset.id 
                      ? 'var(--button-primary-background)' 
                      : 'transparent'
                  } as React.CSSProperties}
                >
                  <div className="flex items-start gap-3">
                    {/* Color Preview */}
                    <div className="flex gap-1 mt-1">
                      <div 
                        className="w-3 h-3 rounded-full border"
                        style={{ 
                          backgroundColor: preset.config.themeColors.light.primaryColor,
                          borderColor: 'var(--borders-dividers)'
                        }}
                      />
                      <div 
                        className="w-3 h-3 rounded-full border"
                        style={{ 
                          backgroundColor: preset.config.themeColors.light.accentColor,
                          borderColor: 'var(--borders-dividers)'
                        }}
                      />
                      <div 
                        className="w-3 h-3 rounded-full border"
                        style={{ 
                          backgroundColor: preset.config.themeColors.light.primaryBackground,
                          borderColor: 'var(--borders-dividers)'
                        }}
                      />
                    </div>
                    
                    {/* Theme Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm" style={{ color: 'var(--primary-text)' }}>
                          {preset.name}
                        </h4>
                        {currentPresetId === preset.id && (
                          <svg className="w-4 h-4" style={{ color: 'var(--button-primary-background)' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--secondary-text)' }}>
                        {preset.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
