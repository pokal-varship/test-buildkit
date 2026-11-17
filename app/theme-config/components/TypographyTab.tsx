"use client";

import React from 'react';
import { useThemeConfig } from '../context/ThemeConfigContext';
import { isValidFontSize, isValidFontWeight } from '@lib/theme/themeValidator';
import { ResetButton } from './ResetButton';

export function TypographyTab() {
  const { config, updateFontFamily, updateBaseFontSize, updateFontWeight, updateFontSize, resetFontFamily, resetBaseFontSize, resetFontWeight, resetFontSize } = useThemeConfig();

  const [fontFamilyInput, setFontFamilyInput] = React.useState(config.fontFamily);
  const [baseFontSizeInput, setBaseFontSizeInput] = React.useState(config.baseFontSize);
  const [fontSizeInputs, setFontSizeInputs] = React.useState(config.fontSizes);
  const [fontSizeErrors, setFontSizeErrors] = React.useState<Record<string, string>>({});
  const [fontWeightErrors, setFontWeightErrors] = React.useState<Record<string, string>>({});

  // Sync local state with config changes (e.g., from reset or preset changes)
  React.useEffect(() => {
    setFontFamilyInput(config.fontFamily);
    setBaseFontSizeInput(config.baseFontSize);
    setFontSizeInputs(config.fontSizes);
  }, [config.fontFamily, config.baseFontSize, config.fontSizes]);

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFontFamilyInput(value);
    if (value.trim()) {
      updateFontFamily(value);
    }
  };

  const handleBaseFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBaseFontSizeInput(value);
    if (isValidFontSize(value)) {
      updateBaseFontSize(value);
    }
  };

  const handleFontWeightChange = (key: keyof typeof config.fontWeights, value: string) => {
    if (isValidFontWeight(value)) {
      updateFontWeight(key, value);
      setFontWeightErrors(prev => ({ ...prev, [key]: '' }));
    } else if (value.trim()) {
      setFontWeightErrors(prev => ({ ...prev, [key]: 'Must be 100-900 in steps of 100' }));
    }
  };

  const handleFontSizeChange = (key: keyof typeof config.fontSizes, value: string) => {
    // Update local input state immediately (allows free typing)
    setFontSizeInputs(prev => ({ ...prev, [key]: value }));
    
    // If valid, update config immediately for live preview
    if (isValidFontSize(value)) {
      updateFontSize(key, value);
      setFontSizeErrors(prev => ({ ...prev, [key]: '' }));
    } else {
      // Don't show error while typing, just clear any existing error
      setFontSizeErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleFontSizeBlur = (key: keyof typeof config.fontSizes, value: string) => {
    // On blur, validate and show error if invalid (but don't revert)
    if (!value.trim()) {
      // Allow empty, no error
      setFontSizeErrors(prev => ({ ...prev, [key]: '' }));
      return;
    }
    
    if (!isValidFontSize(value)) {
      // Show error on blur if invalid
      setFontSizeErrors(prev => ({ ...prev, [key]: 'Must be in px format (e.g., 16px)' }));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--primary-text)' }}>
        Typography Configuration
      </h2>

      {/* Font Family */}
      <section className="mb-8 p-4 rounded-lg" style={{ backgroundColor: 'var(--cards-containers)' }}>
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--primary-text)' }}>
          Font Family
        </h3>
        <label className="block mb-2">
          <span className="text-sm font-medium block mb-1" style={{ color: 'var(--primary-text)' }}>
            Primary Font Family
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={fontFamilyInput}
              onChange={handleFontFamilyChange}
              placeholder="Inter, sans-serif"
              className="flex-1 px-3 py-2 rounded-lg border-2"
              style={{
                backgroundColor: 'var(--primary-background)',
                color: 'var(--primary-text)',
                borderColor: 'var(--borders-dividers)',
                opacity: 1
              }}
            />
            <ResetButton 
              onReset={() => {
                resetFontFamily();
                setFontFamilyInput(config.fontFamily);
              }}
              title="Reset font family to default value"
              size="sm"
            />
          </div>
        </label>
        <div className="mt-3 p-3 rounded" style={{ backgroundColor: 'var(--secondary-background)' }}>
          <p className="text-sm" style={{ color: 'var(--secondary-text)', fontFamily: config.fontFamily }}>
            Preview: The quick brown fox jumps over the lazy dog
          </p>
        </div>
      </section>

      {/* Base Font Size */}
      <section className="mb-8 p-4 rounded-lg" style={{ backgroundColor: 'var(--cards-containers)' }}>
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--primary-text)' }}>
          Base Font Size
        </h3>
        <label className="block mb-2">
          <span className="text-sm font-medium block mb-1" style={{ color: 'var(--primary-text)' }}>
            Base Size (in pixels)
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={baseFontSizeInput}
              onChange={handleBaseFontSizeChange}
              placeholder="16px"
              className="flex-1 px-3 py-2 rounded-lg border-2"
              style={{
                backgroundColor: 'var(--primary-background)',
                color: 'var(--primary-text)',
                borderColor: 'var(--borders-dividers)',
                opacity: 1
              }}
            />
            <ResetButton 
              onReset={() => {
                resetBaseFontSize();
                setBaseFontSizeInput(config.baseFontSize);
              }}
              title="Reset base font size to default value"
              size="sm"
            />
          </div>
        </label>
      </section>

      {/* Font Weights */}
      <section className="mb-8 p-4 rounded-lg" style={{ backgroundColor: 'var(--cards-containers)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--primary-text)' }}>
          Font Weights
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {Object.entries(config.fontWeights).map(([key, value]) => (
            <div key={key} className="min-w-0">
              <label className="block">
                <span className="text-xs font-medium block mb-1 capitalize truncate" style={{ color: 'var(--primary-text)' }} title={key === 'semiBold' ? 'Semi Bold' : key === 'extraBold' ? 'Extra Bold' : key}>
                  {key === 'semiBold' ? 'Semi Bold' : key === 'extraBold' ? 'Extra Bold' : key}
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleFontWeightChange(key as keyof typeof config.fontWeights, e.target.value)}
                    placeholder="400"
                    className="flex-1 min-w-0 px-2 py-1.5 rounded-lg border-2 text-sm"
                    style={{
                      backgroundColor: 'var(--primary-background)',
                      color: 'var(--primary-text)',
                      borderColor: fontWeightErrors[key] ? '#EF4444' : 'var(--borders-dividers)',
                      opacity: 1,
                      width: '70px'
                    }}
                  />
                  <ResetButton 
                    onReset={() => resetFontWeight(key as keyof typeof config.fontWeights)}
                    title={`Reset ${key} font weight to default value`}
                    size="sm"
                  />
                </div>
                {fontWeightErrors[key] && (
                  <span className="text-xs mt-1 block" style={{ color: '#EF4444' }}>
                    {fontWeightErrors[key]}
                  </span>
                )}
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* Font Sizes */}
      <section className="mb-8 p-4 rounded-lg" style={{ backgroundColor: 'var(--cards-containers)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--primary-text)' }}>
          Font Sizes (in pixels)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(config.fontSizes).map(([key]) => {
            const labels: Record<string, string> = {
              xss: 'Extra Small',
              small: 'Small',
              description: 'Description',
              h1: 'Heading 1',
              h2: 'Heading 2',
              h3: 'Heading 3',
              h4: 'Heading 4',
              h5: 'Heading 5',
              h6: 'Heading 6'
            };
            
            return (
              <div key={key}>
                <label className="block">
                  <span className="text-sm font-medium block mb-1" style={{ color: 'var(--primary-text)' }}>
                    {labels[key] || key}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={fontSizeInputs[key as keyof typeof config.fontSizes]}
                      onChange={(e) => handleFontSizeChange(key as keyof typeof config.fontSizes, e.target.value)}
                      onBlur={(e) => handleFontSizeBlur(key as keyof typeof config.fontSizes, e.target.value)}
                      placeholder="16px"
                      className="flex-1 px-3 py-2 rounded-lg border-2 text-sm"
                      style={{
                        backgroundColor: 'var(--primary-background)',
                        color: 'var(--primary-text)',
                        borderColor: fontSizeErrors[key] ? '#EF4444' : 'var(--borders-dividers)',
                        opacity: 1
                      }}
                    />
                    <ResetButton 
                      onReset={() => resetFontSize(key as keyof typeof config.fontSizes)}
                      title={`Reset ${labels[key] || key} font size to default value`}
                      size="sm"
                    />
                  </div>
                  {fontSizeErrors[key] && (
                    <span className="text-xs mt-1 block" style={{ color: '#EF4444' }}>
                      {fontSizeErrors[key]}
                    </span>
                  )}
                </label>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

