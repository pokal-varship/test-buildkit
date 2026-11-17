"use client";

import { useEffect } from 'react';
import { applyCssVariables } from '@lib/theme/cssVariableGenerator';

/**
 * PreviewThemeReceiver Component
 * Listens for theme updates from parent window and applies CSS variables
 * Should be included in the app when ?preview=true query parameter is present
 */
export function PreviewThemeReceiver() {
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // CRITICAL SECURITY: Verify origin
      if (event.origin !== window.location.origin) {
        console.warn('Rejected message from untrusted origin:', event.origin);
        return;
      }

      // Process theme update messages
      if (event.data && event.data.type === 'theme-update') {
        const { cssVars, mode } = event.data;
        
        // Apply theme mode
        if (mode) {
          document.documentElement.setAttribute('data-theme', mode);
        }

        // Apply CSS variables with !important flag
        if (cssVars && document.documentElement) {
          applyCssVariables(document.documentElement, cssVars);
        }
      }
    }

    // Listen for messages from parent window
    window.addEventListener('message', handleMessage);

    // Notify parent that receiver is ready
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: 'preview-ready' },
        window.location.origin
      );
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return null;
}

