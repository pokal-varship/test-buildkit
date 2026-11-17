export const isBrowser = () => typeof window !== 'undefined';
import moment from 'moment';
import { getTenantConfig } from '@config/tenant.config';

const DEFAULT_TIMEZONE_FALLBACK = 'UTC';

/**
 * Env timezone is used by default.
 * When NEXT_PUBLIC_DISABLE_TIMEZONE=true, fall back to browser/cookie timezone.
 */
export const isEnvTimezoneDisabled = (): boolean =>
  getTenantConfig().disableTimezone === true;

/** Env timezone (NEXT_PUBLIC_TIME_ZONE), with UTC fallback. */
export const getEnvTimezone = (): string =>
  getTenantConfig().timeZone || DEFAULT_TIMEZONE_FALLBACK;

/**
 * Resolves timezone for API/cookie use.
 * - DISABLE_TIMEZONE=true → cookie / browser / fallback (system behaviour)
 * - otherwise → NEXT_PUBLIC_TIME_ZONE (default)
 */
export const resolveTimezone = (
  cookieOrBrowserTimezone?: string | null,
  fallback: string = DEFAULT_TIMEZONE_FALLBACK,
): string => {
  if (isEnvTimezoneDisabled()) {
    return cookieOrBrowserTimezone || fallback;
  }
  return getEnvTimezone();
};

export const getBrowserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return DEFAULT_TIMEZONE_FALLBACK;
  }
};

export const isTimeZone = (): string =>
  resolveTimezone(isBrowser() ? getBrowserTimezone() : undefined);

// Server-side function to get client timezone from cookies
export const getClientTimezoneFromCookies = async (): Promise<string> => {
  try {
    if (!isEnvTimezoneDisabled()) {
      return getEnvTimezone();
    }

    if (isBrowser()) {
      // Client-side: get from current browser
      return getBrowserTimezone();
    } else {
      // Server-side: get from cookies
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const clientTimezone = cookieStore.get('client_timezone')?.value;
      
      // Return client timezone if available, otherwise fallback to UTC
      return clientTimezone || DEFAULT_TIMEZONE_FALLBACK;
    }
  } catch {

    return DEFAULT_TIMEZONE_FALLBACK;
  }
};

export function isBot(userAgent: string | undefined): boolean {
    if (!userAgent) return false;
    
    // Convert to lowercase for case-insensitive matching
    const ua = userAgent.toLowerCase();
    
    // Common crawler/bot patterns
    const botPatterns = [
      // Search engine bots
      'googlebot', 'bingbot', 'yandexbot', 'duckduckbot', 'slurp', 'baiduspider',
      'adsbot', 'mediapartners-google', 'applebot', 'twitterbot', 'facebookexternalhit',
      
      // Page Speed Insights and other Google tools
      'lighthouse', 'chrome-lighthouse', 'pagespeed', 'speed insights', 'gtmetrix',
      
      // Generic crawler identifiers
      'bot', 'spider', 'crawl', 'checker', 'scraper',
      
      // Other common bots
      'pinterest', 'whatsapp', 'telegram', 'daum', 'semrushbot', 'ahrefsbot',
      'mj12bot', 'dotbot', 'rogerbot', 'petalbot', 'seznambot',
      
      // Link checkers and validators
      'validator', 'feed', 'crawler', 'linkdex', 'screaming frog',
      
      // Web monitoring services
      'pingdom', 'uptimerobot', 'statuscake', 'netcraft', 'monitis',
      
      // Headless browsers often used for crawling
      'headless', 'puppeteer', 'selenium'
    ];
    
    // Check if the user agent contains any bot patterns
    return botPatterns.some(pattern => ua.includes(pattern));
  }

  export const isMobileView = () => {
    if (typeof window !== 'undefined') {
        return window.innerWidth <= 768;
    }
    return false;
};

export const formatUnixTimestamp = (
  timestamp: number,
  formatStr: string = 'DD-MM-YYYY'
): string => {
  if (!timestamp) return '';
  return moment.unix(timestamp).format(formatStr);
};

export const getTimestampFromTime = (timeStr: string, dateStr: string | null = null) => {
  // Default to today's date if no date is provided
  const datePart = dateStr || moment().format('YYYY-MM-DD');

  // Combine date and time and parse with moment
  const dateTime = moment(`${datePart} ${timeStr}`, 'YYYY-MM-DD h:mm A');

  // Return Unix timestamp in milliseconds
  return dateTime.valueOf();
}

export const getMetaDatBaseUrl = () => {
  return process.env.NEXT_PUBLIC_IMAGE_BASE_URL
}

