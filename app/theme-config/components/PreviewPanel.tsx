"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useThemeConfig } from '../context/ThemeConfigContext';

export function PreviewPanel() {
  const { getCssVariables, mode } = useThemeConfig();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);

  // Send theme updates to iframe
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const cssVars = getCssVariables();
      
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'theme-update',
          cssVars,
          mode
        },
        window.location.origin
      );
    }
  }, [getCssVariables, mode]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    // Send initial theme
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const cssVars = getCssVariables();
      
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'theme-update',
          cssVars,
          mode
        },
        window.location.origin
      );
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Preview Header with Refresh Button */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b" style={{ 
        backgroundColor: 'var(--cards-containers)',
        borderColor: 'var(--borders-dividers)'
      }}>
        <span className="text-sm font-medium" style={{ color: 'var(--primary-text)' }}>
          Live Preview
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMobileView((prev) => !prev)}
            className="p-1.5 rounded-lg transition-all hover:opacity-70"
            style={{
              color: 'var(--secondary-text)'
            }}
            title={isMobileView ? 'Switch to desktop view' : 'Switch to mobile view'}
          >
            {isMobileView ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 4h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.5 4.5A2.25 2.25 0 019.75 2.25h4.5A2.25 2.25 0 0116.5 4.5v15a2.25 2.25 0 01-2.25 2.25h-4.5A2.25 2.25 0 017.5 19.5v-15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 5.25h4M11 18.75h2" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            className="p-1.5 rounded-lg transition-all hover:opacity-70"
            style={{
              color: 'var(--secondary-text)'
            }}
            title="Refresh preview"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 relative" style={{ backgroundColor: 'var(--secondary-background)' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10" style={{ 
            backgroundColor: 'var(--primary-background)' 
          }}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ 
                borderColor: 'var(--primary-color)' 
              }}></div>
              <p style={{ color: 'var(--secondary-text)' }}>Loading preview...</p>
            </div>
          </div>
        )}
        
        <div className="w-full h-full flex items-center justify-center p-3">
          <div
            className={isMobileView ? 'overflow-hidden rounded-2xl shadow-lg border' : 'w-full h-full'}
            style={{
              width: isMobileView ? '390px' : '100%',
              height: isMobileView ? '844px' : '100%',
              maxHeight: '100%',
              borderColor: isMobileView ? 'var(--borders-dividers)' : 'transparent',
              backgroundColor: 'var(--primary-background)'
            }}
          >
            <iframe
              ref={iframeRef}
              src="/?preview=true"
              onLoad={handleIframeLoad}
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-popups-to-escape-sandbox"
              title="Theme Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

