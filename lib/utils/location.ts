import { getCookie, setCookie } from '../cookie';
import { isBrowser } from '../helper';
export interface UserLocationData {
  ip: string;
  city: string;
  country: string;
  os: string;
  device: string;
  browser: string;
  lat: number;
  lng: number;
  source: string;
  internalTrigger: string;
}

// Parse user agent string to detect OS, device, and browser
const parseUserAgent = (userAgent: string): { os: string; device: string; browser: string } => {
  let os = 'unknown';
  let device = 'unknown';
  let browser = 'unknown';

  // Detect OS
  if (userAgent.includes('Windows')) os = 'windows';
  else if (userAgent.includes('Mac')) os = 'mac';
  else if (userAgent.includes('Linux')) os = 'linux';
  else if (userAgent.includes('Android')) os = 'android';
  else if (userAgent.includes('iOS')) os = 'ios';

  // Detect device
  if (userAgent.includes('Mobile')) device = 'mobile';
  else if (userAgent.includes('Tablet')) device = 'tablet';
  else if (userAgent.includes('iPad')) device = 'ipad';
  else if (userAgent.includes('iPhone')) device = 'iphone';
  else device = 'desktop';

  // Detect browser
  if (userAgent.includes('Chrome')) browser = 'chrome';
  else if (userAgent.includes('Firefox')) browser = 'firefox';
  else if (userAgent.includes('Safari')) browser = 'safari';
  else if (userAgent.includes('Edge')) browser = 'edge';
  else if (userAgent.includes('Opera')) browser = 'opera';

  return { os, device, browser };
};

// Server-side location detection
export const getServerLocationData = async (userAgent: string, internalTrigger: string): Promise<UserLocationData> => {
  try {
    // Get IP-based location for server-side
    const response = await fetch('https://ipapi.co/json/', {
      headers: {
        'User-Agent': userAgent || ''
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch IP location');
    }

    const data = await response.json();

    // Parse user agent for OS, device, and browser detection
    const { os, device, browser } = parseUserAgent(userAgent || '');

    return {
      ip: data.ip || '0.0.0.0',
      city: data.city || 'Unknown',
      country: data.country || 'Unknown',
      os,
      device,
      browser,
      lat: data.latitude || 0,
      lng: data.longitude || 0,
      source: 'web',
      internalTrigger
    };
  } catch {
    // Error handled silently
    const { os, device, browser } = parseUserAgent(userAgent || '');
    return {
      ip: '0.0.0.0',
      city: 'Unknown',
      country: 'Unknown',
      os,
      device,
      browser,
      lat: 0,
      lng: 0,
      source: 'web',
      internalTrigger
    };
  }
};

// Get user's browser information (client-side only)
const getBrowserInfo = (): { os: string; device: string; browser: string } => {
  if (!isBrowser()) {
    return { os: 'unknown', device: 'unknown', browser: 'unknown' };
  }

  const userAgent = navigator.userAgent;
  return parseUserAgent(userAgent);
};

// Get user location using browser geolocation (client-side only)
const getGeolocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!isBrowser() || !navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000 // 5 minutes cache
      }
    );
  });
};

// Get IP-based location as fallback (client-side)
const getIPLocation = async (): Promise<{ lat: number; lng: number; city: string; country: string; ip: string }> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();

    return {
      lat: data.latitude || 0,
      lng: data.longitude || 0,
      city: data.city || 'Unknown',
      country: data.country || 'Unknown',
      ip: data.ip || '0.0.0.0'
    };
  } catch {

    return {
      lat: 0,
      lng: 0,
      city: 'Unknown',
      country: 'Unknown',
      ip: '0.0.0.0'
    };
  }
};

// Main function to get user location data (client-side only)
export const getUserLocationData = async (internalTrigger: string): Promise<UserLocationData> => {
  const { os, device, browser } = getBrowserInfo();

  try {
    // Try to get precise location first
    const coords = await getGeolocation();
    const ipData = await getIPLocation();

    return {
      ip: ipData.ip,
      city: ipData.city,
      country: ipData.country,
      os,
      device,
      browser,
      lat: coords.lat,
      lng: coords.lng,
      source: 'web',
      internalTrigger
    };
  } catch {

    // Fallback to IP-based location
    const ipData = await getIPLocation();

    return {
      ip: ipData.ip,
      city: ipData.city,
      country: ipData.country,
      os,
      device,
      browser,
      lat: ipData.lat,
      lng: ipData.lng,
      source: 'web',
      internalTrigger
    };
  }
};

// Format location data for API header
export const formatLocationHeader = (locationData: UserLocationData): string => {
  return JSON.stringify(locationData);
};

// Helper function to get location data from cookies (server-side)
const getLocationFromCookies = async (): Promise<UserLocationData | null> => {
  try {
    if (!isBrowser()) {
      // Server-side: use Next.js cookies
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const ipLocationCookie = cookieStore.get('ip_location');
      
      if (ipLocationCookie?.value) {
        try {
          return JSON.parse(ipLocationCookie.value);
        } catch {

          return null;
        }
      }
    }
    return null;
  } catch {

    return null;
  }
};

// Helper function to store location data in cookies (client-side only)
const storeLocationInCookies = (locationData: UserLocationData): void => {
  if (isBrowser()) {
    try {
      setCookie('ip_location', JSON.stringify(locationData), 7); // Store for 30 days
    } catch {

    }
  }
};

export const getLocationHeader = async (internalTrigger: string): Promise<string> => {
  // Get fresh location data based on environment
  try {
    if (!isBrowser()) {
      // Server-side: get location from cookies only
      const cookieLocationData = await getLocationFromCookies();
      
      if (cookieLocationData) {
        // Update the internalTrigger if provided
        cookieLocationData.internalTrigger = internalTrigger;
        return formatLocationHeader(cookieLocationData);
      } else {
        // No cookie data found, return default values directly
        const fallbackData: UserLocationData = {
          ip: '0.0.0.0',
          city: 'Default City',
          country: 'US',
          os: 'windows',
          device: 'desktop',
          browser: 'chrome',
          lat: 40.7128,
          lng: -74.0060,
          source: 'web',
          internalTrigger
        };
        return formatLocationHeader(fallbackData);
      }
    } else {
      const locationClientCookie = getCookie('ip_location');
      if (locationClientCookie) {
        return locationClientCookie;
      } else {
        // Client-side: use browser-based location and store everything in cookies
        const browserLocationData = await getUserLocationData(internalTrigger);
        // Store the complete location data in cookies for future server-side use
        storeLocationInCookies(browserLocationData);
        return formatLocationHeader(browserLocationData);
      }
    }
  } catch {

    // Return fallback data
    const fallbackData: UserLocationData = {
      ip: '0.0.0.0',
      city: 'Default City',
      country: 'US',
      os: 'windows',
      device: 'desktop',
      browser: 'chrome',
      lat: 40.7128,
      lng: -74.0060,
      source: 'web',
      internalTrigger
    };

    return formatLocationHeader(fallbackData);
  }
};
