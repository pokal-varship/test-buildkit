"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ThemeConfig, ThemeMode, ButtonStyle } from 'types/themeConfig.types';
import { DEFAULT_THEME_CONFIG } from '@lib/theme/defaultThemeConfig';
import { getThemePresetById } from '@lib/theme/themePresets';
import { generateEnvFile, downloadEnvFile } from '@lib/theme/envFileGenerator';
import { generateCssVariables } from '@lib/theme/cssVariableGenerator';
import { saveThemeConfig } from '@services/themeConfigService';

// Type for nested color object navigation
type NestedColorValue = string | Record<string, string | Record<string, string>>;

interface ThemeConfigContextType {
  config: ThemeConfig;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  currentPresetId: string;
  token: string | null;
  isSaving: boolean;
  
  // Update functions
  updateColor: (mode: ThemeMode, path: string, value: string) => void;
  updateFontFamily: (value: string) => void;
  updateBaseFontSize: (value: string) => void;
  updateFontWeight: (key: keyof ThemeConfig['fontWeights'], value: string) => void;
  updateFontSize: (key: keyof ThemeConfig['fontSizes'], value: string) => void;
  updateButtonStyle: (
    mode: ThemeMode,
    button: 'primary' | 'secondary',
    property: keyof ButtonStyle,
    value: string
  ) => void;
  updateRatingColor: (mode: ThemeMode, key: string, value: string) => void;
  
  // Individual field reset functions
  resetColor: (mode: ThemeMode, path: string) => void;
  resetFontFamily: () => void;
  resetBaseFontSize: () => void;
  resetFontWeight: (key: keyof ThemeConfig['fontWeights']) => void;
  resetFontSize: (key: keyof ThemeConfig['fontSizes']) => void;
  resetButtonStyle: (
    mode: ThemeMode,
    button: 'primary' | 'secondary',
    property: keyof ButtonStyle
  ) => void;
  resetRatingColor: (mode: ThemeMode, key: string) => void;
  
  // Theme preset functions
  applyThemePreset: (presetId: string) => void;
  
  // Actions
  resetToDefaults: () => void;
  saveConfig: (authToken?: string | null) => void;
  downloadConfig: () => void;
  getCssVariables: () => string;
}

const ThemeConfigContext = createContext<ThemeConfigContextType | undefined>(undefined);

export function ThemeConfigProvider({ children, token }: { children: ReactNode; token?: string | null }) {
  const [config, setConfig] = useState<ThemeConfig>(DEFAULT_THEME_CONFIG);
  const [mode, setMode] = useState<ThemeMode>('light');
  const [currentPresetId, setCurrentPresetId] = useState<string>('default');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const updateColor = useCallback((mode: ThemeMode, path: string, value: string) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current: Record<string, NestedColorValue> = newConfig.themeColors[mode] as unknown as Record<string, NestedColorValue>;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const next = current[keys[i]];
        if (typeof next === 'object' && next !== null) {
          current = next as Record<string, NestedColorValue>;
        }
      }
      
      (current as Record<string, string>)[keys[keys.length - 1]] = value;
      return newConfig;
    });
  }, []);

  const updateFontFamily = useCallback((value: string) => {
    setConfig(prev => ({ ...prev, fontFamily: value }));
  }, []);

  const updateBaseFontSize = useCallback((value: string) => {
    setConfig(prev => ({ ...prev, baseFontSize: value }));
  }, []);

  const updateFontWeight = useCallback((key: keyof ThemeConfig['fontWeights'], value: string) => {
    setConfig(prev => ({
      ...prev,
      fontWeights: {
        ...prev.fontWeights,
        [key]: value
      }
    }));
  }, []);

  const updateFontSize = useCallback((key: keyof ThemeConfig['fontSizes'], value: string) => {
    setConfig(prev => ({
      ...prev,
      fontSizes: {
        ...prev.fontSizes,
        [key]: value
      }
    }));
  }, []);

  const updateButtonStyle = useCallback((
    mode: ThemeMode,
    button: 'primary' | 'secondary',
    property: keyof ButtonStyle,
    value: string
  ) => {
    setConfig(prev => ({
      ...prev,
      buttonStyles: {
        ...prev.buttonStyles,
        [mode]: {
          ...prev.buttonStyles[mode],
          [button]: {
            ...prev.buttonStyles[mode][button],
            [property]: value
          }
        }
      }
    }));
  }, []);

  const updateRatingColor = useCallback((mode: ThemeMode, key: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      themeColors: {
        ...prev.themeColors,
        [mode]: {
          ...prev.themeColors[mode],
          ratingColors: {
            ...prev.themeColors[mode].ratingColors,
            [key]: value
          }
        }
      }
    }));
  }, []);

  // Individual field reset functions
  const resetColor = useCallback((mode: ThemeMode, path: string) => {
    const keys = path.split('.');
    let defaultValue: NestedColorValue = DEFAULT_THEME_CONFIG.themeColors[mode] as unknown as NestedColorValue;
    
    for (const key of keys) {
      if (typeof defaultValue === 'string') break;
      if (typeof defaultValue === 'object' && defaultValue !== null) {
        defaultValue = defaultValue[key];
      }
    }
    
    updateColor(mode, path, defaultValue as string);
  }, [updateColor]);

  const resetFontFamily = useCallback(() => {
    setConfig(prev => ({ ...prev, fontFamily: DEFAULT_THEME_CONFIG.fontFamily }));
  }, []);

  const resetBaseFontSize = useCallback(() => {
    setConfig(prev => ({ ...prev, baseFontSize: DEFAULT_THEME_CONFIG.baseFontSize }));
  }, []);

  const resetFontWeight = useCallback((key: keyof ThemeConfig['fontWeights']) => {
    setConfig(prev => ({
      ...prev,
      fontWeights: {
        ...prev.fontWeights,
        [key]: DEFAULT_THEME_CONFIG.fontWeights[key]
      }
    }));
  }, []);

  const resetFontSize = useCallback((key: keyof ThemeConfig['fontSizes']) => {
    setConfig(prev => ({
      ...prev,
      fontSizes: {
        ...prev.fontSizes,
        [key]: DEFAULT_THEME_CONFIG.fontSizes[key]
      }
    }));
  }, []);

  const resetButtonStyle = useCallback((
    mode: ThemeMode,
    button: 'primary' | 'secondary',
    property: keyof ButtonStyle
  ) => {
    const defaultValue = DEFAULT_THEME_CONFIG.buttonStyles[mode][button][property];
    updateButtonStyle(mode, button, property, defaultValue);
  }, [updateButtonStyle]);

  const resetRatingColor = useCallback((mode: ThemeMode, key: string) => {
    const ratingColors = DEFAULT_THEME_CONFIG.themeColors[mode].ratingColors;
    const defaultValue = ratingColors[key as keyof typeof ratingColors];
    updateRatingColor(mode, key, defaultValue);
  }, [updateRatingColor]);

  // Theme preset functions
  const applyThemePreset = useCallback((presetId: string) => {
    const preset = getThemePresetById(presetId);
    if (preset) {
      setConfig(preset.config);
      setCurrentPresetId(presetId);
    }
  }, []);

  const resetToDefaults = useCallback(() => {
    if (confirm('Reset all theme settings to initial environment configuration?\n\nThis will discard all current changes and preset selections.')) {
      setConfig(DEFAULT_THEME_CONFIG);
      setCurrentPresetId('default');
    }
  }, []);

  const saveConfig = useCallback(async (authToken?: string | null) => {
    setIsSaving(true);
    try {
      const tokenToUse = authToken || token;
      const result = await saveThemeConfig(config, tokenToUse);
      
      if (result.success) {
        alert('✅ Theme configuration saved successfully! Environment variables updated.');
      } else {
        alert(`❌ Failed to save: ${result.error || 'Unknown error'}`);
      }
    } catch {
      alert('❌ Error saving theme configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [config, token]);

  const downloadConfig = useCallback(() => {
    const envContent = generateEnvFile(config);
    downloadEnvFile(envContent, '.env.theme');
  }, [config]);

  const getCssVariables = useCallback(() => {
    return generateCssVariables(config, mode);
  }, [config, mode]);

  const value: ThemeConfigContextType = {
    config,
    mode,
    setMode,
    currentPresetId,
    token: token || null,
    isSaving,
    updateColor,
    updateFontFamily,
    updateBaseFontSize,
    updateFontWeight,
    updateFontSize,
    updateButtonStyle,
    updateRatingColor,
    resetColor,
    resetFontFamily,
    resetBaseFontSize,
    resetFontWeight,
    resetFontSize,
    resetButtonStyle,
    resetRatingColor,
    applyThemePreset,
    resetToDefaults,
    saveConfig,
    downloadConfig,
    getCssVariables
  };

  return (
    <ThemeConfigContext.Provider value={value}>
      {children}
    </ThemeConfigContext.Provider>
  );
}

export function useThemeConfig() {
  const context = useContext(ThemeConfigContext);
  if (!context) {
    throw new Error('useThemeConfig must be used within ThemeConfigProvider');
  }
  return context;
}

