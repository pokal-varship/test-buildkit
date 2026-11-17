"use client";

import React, { useState } from 'react';
import { ModeToggle } from './ModeToggle';
import { ColorPickerField } from './ColorPickerField';
import { ResetButton } from './ResetButton';
import { useThemeConfig } from '../context/ThemeConfigContext';
import { isValidFontSize, isValidBorderWidth } from '@lib/theme/themeValidator';
import { ButtonStyle } from 'types/themeConfig.types';

export function ButtonsTab() {
  const { config, mode, setMode, updateButtonStyle, resetButtonStyle } = useThemeConfig();
  const [activeButton, setActiveButton] = useState<'primary' | 'secondary'>('primary');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localFontSize, setLocalFontSize] = useState<Record<string, string>>({});
  const [localBorderWidth, setLocalBorderWidth] = useState<Record<string, string>>({});

  // Sync local state when button type or mode changes
  React.useEffect(() => {
    const key = `${mode}-${activeButton}`;
    setLocalFontSize(prev => ({ ...prev, [key]: config.buttonStyles[mode][activeButton].fontSize }));
    setLocalBorderWidth(prev => ({ ...prev, [key]: config.buttonStyles[mode][activeButton].borderWidth }));
  }, [mode, activeButton, config.buttonStyles]);

  const buttonStyles = config.buttonStyles[mode][activeButton];
  const stateKey = `${mode}-${activeButton}`;

  const handleStyleChange = (property: keyof ButtonStyle, value: string) => {
    // For fontSize and borderWidth, update local state immediately
    if (property === 'fontSize') {
      setLocalFontSize(prev => ({ ...prev, [stateKey]: value }));
      // If valid, update config immediately for live preview
      if (isValidFontSize(value)) {
        updateButtonStyle(mode, activeButton, 'fontSize', value);
        setErrors(prev => ({ ...prev, fontSize: '' }));
      } else {
        // Don't show error while typing
        setErrors(prev => ({ ...prev, fontSize: '' }));
      }
      return;
    }
    if (property === 'borderWidth') {
      setLocalBorderWidth(prev => ({ ...prev, [stateKey]: value }));
      // If valid, update config immediately for live preview
      if (isValidBorderWidth(value)) {
        updateButtonStyle(mode, activeButton, 'borderWidth', value);
        setErrors(prev => ({ ...prev, borderWidth: '' }));
      } else {
        // Don't show error while typing
        setErrors(prev => ({ ...prev, borderWidth: '' }));
      }
      return;
    }
    
    // For other properties, update immediately
    updateButtonStyle(mode, activeButton, property, value);
  };

  const handleFontSizeBlur = (value: string) => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, fontSize: '' }));
      return;
    }
    
    if (!isValidFontSize(value)) {
      setErrors(prev => ({ ...prev, fontSize: 'Must be in px format (e.g., 16px)' }));
    }
  };

  const handleBorderWidthBlur = (value: string) => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, borderWidth: '' }));
      return;
    }
    
    if (!isValidBorderWidth(value)) {
      setErrors(prev => ({ ...prev, borderWidth: 'Must be in px format (e.g., 1px or 0px)' }));
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--primary-text)' }}>
          Button Styles
        </h2>
        <ModeToggle mode={mode} onChange={setMode} />
      </div>

      {/* Button Type Selector */}
      <div className="mb-6 flex gap-3">
        <button
          type="button"
          onClick={() => setActiveButton('primary')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeButton === 'primary' ? 'shadow-md' : ''
          }`}
          style={{
            backgroundColor: activeButton === 'primary' ? 'var(--button-primary-background)' : 'var(--cards-containers)',
            color: activeButton === 'primary' ? 'var(--button-primary-text)' : 'var(--secondary-text)'
          }}
        >
          Primary Button
        </button>
        <button
          type="button"
          onClick={() => setActiveButton('secondary')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeButton === 'secondary' ? 'shadow-md' : ''
          }`}
          style={{
            backgroundColor: activeButton === 'secondary' ? 'var(--button-primary-background)' : 'var(--cards-containers)',
            color: activeButton === 'secondary' ? 'var(--button-primary-text)' : 'var(--secondary-text)'
          }}
        >
          Secondary Button
        </button>
      </div>

      {/* Configuration Panel */}
      <div className="space-y-6">
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--cards-containers)' }}>
          <h3 className="text-lg font-semibold mb-4 capitalize" style={{ color: 'var(--primary-text)' }}>
            {activeButton} Button Configuration
          </h3>

          <ColorPickerField
            label="Background Color"
            value={buttonStyles.background}
            onChange={(v) => handleStyleChange('background', v)}
            onReset={() => resetButtonStyle(mode, activeButton, 'background')}
            envVariable={`NEXT_PUBLIC_BUTTON_${activeButton.toUpperCase()}_BG_${mode.toUpperCase()}`}
          />

          <ColorPickerField
            label="Text Color"
            value={buttonStyles.text}
            onChange={(v) => handleStyleChange('text', v)}
            onReset={() => resetButtonStyle(mode, activeButton, 'text')}
            envVariable={`NEXT_PUBLIC_BUTTON_${activeButton.toUpperCase()}_TEXT_${mode.toUpperCase()}`}
          />

          <ColorPickerField
            label="Hover Background"
            value={buttonStyles.hoverBackground}
            onChange={(v) => handleStyleChange('hoverBackground', v)}
            onReset={() => resetButtonStyle(mode, activeButton, 'hoverBackground')}
            envVariable={`NEXT_PUBLIC_BUTTON_${activeButton.toUpperCase()}_HOVER_BG_${mode.toUpperCase()}`}
          />

          <ColorPickerField
            label="Hover Text"
            value={buttonStyles.hoverText}
            onChange={(v) => handleStyleChange('hoverText', v)}
            onReset={() => resetButtonStyle(mode, activeButton, 'hoverText')}
            envVariable={`NEXT_PUBLIC_BUTTON_${activeButton.toUpperCase()}_HOVER_TEXT_${mode.toUpperCase()}`}
          />

          <ColorPickerField
            label="Border Color"
            value={buttonStyles.borderColor}
            onChange={(v) => handleStyleChange('borderColor', v)}
            onReset={() => resetButtonStyle(mode, activeButton, 'borderColor')}
            envVariable={`NEXT_PUBLIC_BUTTON_${activeButton.toUpperCase()}_BORDER_COLOR_${mode.toUpperCase()}`}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--primary-text)' }}>
              Border Width
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={localBorderWidth[stateKey] || buttonStyles.borderWidth}
                onChange={(e) => handleStyleChange('borderWidth', e.target.value)}
                onBlur={(e) => handleBorderWidthBlur(e.target.value)}
                placeholder="0px"
                className="flex-1 px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--primary-background)',
                  color: 'var(--primary-text)',
                  borderColor: errors.borderWidth ? '#EF4444' : 'var(--borders-dividers)'
                }}
              />
              <ResetButton 
                onReset={() => resetButtonStyle(mode, activeButton, 'borderWidth')}
                title="Reset border width to default value"
                size="sm"
              />
            </div>
            {errors.borderWidth && (
              <span className="text-xs mt-1 block" style={{ color: '#EF4444' }}>
                {errors.borderWidth}
              </span>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--primary-text)' }}>
              Font Size
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={localFontSize[stateKey] || buttonStyles.fontSize}
                onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                onBlur={(e) => handleFontSizeBlur(e.target.value)}
                placeholder="16px"
                className="flex-1 px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--primary-background)',
                  color: 'var(--primary-text)',
                  borderColor: errors.fontSize ? '#EF4444' : 'var(--borders-dividers)'
                }}
              />
              <ResetButton 
                onReset={() => resetButtonStyle(mode, activeButton, 'fontSize')}
                title="Reset font size to default value"
                size="sm"
              />
            </div>
            {errors.fontSize && (
              <span className="text-xs mt-1 block" style={{ color: '#EF4444' }}>
                {errors.fontSize}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

