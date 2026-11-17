"use client";

import React, { useState } from 'react';
import { ThemeConfigProvider } from './context/ThemeConfigContext';
import { ColorsTab } from './components/ColorsTab';
import { TypographyTab } from './components/TypographyTab';
import { ButtonsTab } from './components/ButtonsTab';
import { PreviewPanel } from './components/PreviewPanel';
import { ResizablePanelsWrapper } from './components/ResizablePanelsWrapper';
import { ThemePresetDropdown } from './components/ThemePresetDropdown';
import { useThemeConfig } from './context/ThemeConfigContext';
import TokenProtectedClientWrapper from '@components/TokenProtectedClientWrapper';

type Tab = 'colors' | 'typography' | 'buttons' | 'preview';

interface ThemeConfigClientProps {
  token: string | null;
}

function ThemeConfigContent({ token }: { token: string | null }) {
  const [activeTab, setActiveTab] = useState<Tab>('colors');
  const { resetToDefaults, saveConfig, downloadConfig, currentPresetId, applyThemePreset, isSaving } = useThemeConfig();

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'colors',
      label: 'Colors',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      id: 'typography',
      label: 'Typography',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      id: 'buttons',
      label: 'Buttons',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
        </svg>
      )
    },
    {
      id: 'preview',
      label: 'Preview',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  const handleSaveConfig = async () => {
    await saveConfig(token);
  };

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--primary-background)' }}
    >
      {/* Header */}
      <div className="border-b" style={{ 
        backgroundColor: 'var(--cards-containers)',
        borderColor: 'var(--borders-dividers)'
      }}>
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--button-primary-background)' }}>
                <svg className="w-6 h-6" style={{ color: 'var(--button-primary-text)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--primary-text)' }}>
                  Theme Configuration
                </h1>
                <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>
                  Customize colors, fonts, and button styles for your application
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemePresetDropdown 
                currentPresetId={currentPresetId}
                onPresetChange={applyThemePreset}
              />
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetToDefaults}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 flex items-center gap-2 border"
                  style={{
                    backgroundColor: 'var(--cards-containers)',
                    color: 'var(--primary-text)',
                    borderColor: 'var(--borders-dividers)'
                  }}
                  title="Reset all changes to initial environment configuration"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset to Initial
                </button>

                <button
                  type="button"
                  onClick={downloadConfig}
                  className="p-2 rounded-lg transition-all hover:opacity-80 border"
                  style={{
                    backgroundColor: 'var(--cards-containers)',
                    color: 'var(--primary-text)',
                    borderColor: 'var(--borders-dividers)'
                  }}
                  title="Download theme configuration as .env file"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={isSaving}
                  className="btn-admin-primary px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b" style={{ 
        backgroundColor: 'var(--primary-background)',
        borderColor: 'var(--borders-dividers)'
      }}>
        <div className="w-full px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
                  activeTab === tab.id ? 'border-b-2' : 'border-transparent'
                }`}
                style={{
                  color: activeTab === tab.id ? 'var(--button-primary-background)' : 'var(--secondary-text)',
                  borderColor: activeTab === tab.id ? 'var(--button-primary-background)' : 'transparent'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 w-full px-6 py-3">
        {activeTab === 'preview' ? (
          <div
            className="h-full rounded-lg border overflow-hidden"
            style={{ borderColor: 'var(--borders-dividers)' }}
          >
            <PreviewPanel />
          </div>
        ) : (
          <ResizablePanelsWrapper
            leftRatio={35}
            rightRatio={75}
            leftPanel={
              <>
                {activeTab === 'colors' && <ColorsTab />}
                {activeTab === 'typography' && <TypographyTab />}
                {activeTab === 'buttons' && <ButtonsTab />}
              </>
            }
            rightPanel={
              <div className="h-full rounded-lg border overflow-hidden" style={{ 
                borderColor: 'var(--borders-dividers)'
              }}>
                <PreviewPanel />
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}

export default function ThemeConfigClient({ token }: ThemeConfigClientProps) {
  return (
    <TokenProtectedClientWrapper token={token}>
      <ThemeConfigProvider token={token}>
        <ThemeConfigContent token={token} />
      </ThemeConfigProvider>
    </TokenProtectedClientWrapper>
  );
}

