import { ThemeConfig } from 'types/themeConfig.types';
import { generateEnvJson } from './jsonConfigGenerator';

/**
 * API client for theme configuration
 * Use these functions to integrate with your backend API
 */

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  timestamp?: string;
}

/**
 * Saves theme configuration to the server via API
 * @param config - The theme configuration object
 * @param endpoint - API endpoint (default: '/api/theme-config')
 * @returns Promise with API response
 */
export const saveThemeToServer = async (
  config: ThemeConfig,
  endpoint: string = '/api/theme-config'
): Promise<ApiResponse> => {
  try {
    // Convert config to ENV format for backend
    const envVars = generateEnvJson(config);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(envVars),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to save configuration');
    }

    return data;
  } catch (error) {
    console.error('Error saving theme to server:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Note: Theme loading from server is not implemented
 * Theme configuration is loaded directly from environment variables in defaultThemeConfig.ts
 * The system reads from NEXT_PUBLIC_* env vars defined in .env.local
 */

/**
 * Example usage with toast notifications
 */
export const saveWithNotification = async (config: ThemeConfig): Promise<boolean> => {
  try {
    const result = await saveThemeToServer(config);
    
    if (result.success) {
      console.log('✅ Theme configuration saved successfully');
      // You can integrate with a toast notification library here
      // Example: toast.success('Theme saved successfully!');
      return true;
    } else {
      console.error('❌ Failed to save theme:', result.error);
      // Example: toast.error('Failed to save theme');
      return false;
    }
  } catch (error) {
    console.error('❌ Error saving theme:', error);
    return false;
  }
};

