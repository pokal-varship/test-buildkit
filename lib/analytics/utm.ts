import { getCookie, setCookie } from "@lib/cookie";

export const UTM_COOKIE_KEY = "utm_attribution";
export const UTM_COOKIE_TTL_DAYS = 30;

export type UtmTouch = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  utm_id?: string;
  gclid?: string;
  fbclid?: string;
  landing_page?: string;
  referrer?: string;
  captured_at: string;
};

export type UtmAttribution = {
  first: UtmTouch;
  last: UtmTouch;
};

const ATTRIBUTION_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "gclid",
  "fbclid",
] as const;

type AttributionParamKey = (typeof ATTRIBUTION_PARAM_KEYS)[number];

const getParam = (
  params: URLSearchParams,
  key: AttributionParamKey,
): string | undefined => {
  const value = params.get(key)?.trim();
  return value ? value : undefined;
};

/**
 * Parse campaign / click-id params from a URLSearchParams (or search string).
 * Returns null when no attribution params are present.
 */
export const parseUtmFromSearchParams = (
  search: URLSearchParams | string,
  options?: { landingPage?: string; referrer?: string },
): UtmTouch | null => {
  const params =
    typeof search === "string"
      ? new URLSearchParams(
          search.startsWith("?") ? search.slice(1) : search,
        )
      : search;

  const touch: Partial<UtmTouch> = {};
  let hasAttribution = false;

  for (const key of ATTRIBUTION_PARAM_KEYS) {
    const value = getParam(params, key);
    if (value) {
      touch[key] = value;
      hasAttribution = true;
    }
  }

  if (!hasAttribution) {
    return null;
  }

  return {
    ...touch,
    landing_page: options?.landingPage,
    referrer: options?.referrer,
    captured_at: new Date().toISOString(),
  };
};

export const readUtmAttribution = (): UtmAttribution | null => {
  const raw = getCookie(UTM_COOKIE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as UtmAttribution;
    if (!parsed?.first || !parsed?.last) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const writeUtmAttribution = (attribution: UtmAttribution): void => {
  setCookie(
    UTM_COOKIE_KEY,
    JSON.stringify(attribution),
    UTM_COOKIE_TTL_DAYS,
  );
};

/**
 * Capture UTM / click-ids from the current URL into a 30-day cookie.
 * - First-touch is written once and never overwritten.
 * - Last-touch is updated whenever a new attribution set is present.
 */
export const captureUtmAttribution = (
  search?: URLSearchParams | string | null,
): UtmAttribution | null => {
  if (typeof window === "undefined") {
    return readUtmAttribution();
  }

  const searchInput =
    search ??
    (typeof window !== "undefined" ? window.location.search : "");

  const touch = parseUtmFromSearchParams(searchInput, {
    landingPage: `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer || undefined,
  });

  if (!touch) {
    return readUtmAttribution();
  }

  const existing = readUtmAttribution();
  const next: UtmAttribution = existing
    ? { first: existing.first, last: touch }
    : { first: touch, last: touch };

  writeUtmAttribution(next);
  return next;
};

const prefixTouch = (
  touch: UtmTouch | undefined,
  prefix: "" | "first_",
): Record<string, string> => {
  if (!touch) {
    return {};
  }

  const props: Record<string, string> = {};
  const assign = (key: string, value?: string) => {
    if (value) {
      props[`${prefix}${key}`] = value;
    }
  };

  assign("utm_source", touch.utm_source);
  assign("utm_medium", touch.utm_medium);
  assign("utm_campaign", touch.utm_campaign);
  assign("utm_term", touch.utm_term);
  assign("utm_content", touch.utm_content);
  assign("utm_id", touch.utm_id);
  assign("gclid", touch.gclid);
  assign("fbclid", touch.fbclid);

  // Meta fields: last-touch uses utm_*; first-touch uses first_*
  if (prefix === "first_") {
    assign("landing_page", touch.landing_page);
    assign("referrer", touch.referrer);
    assign("captured_at", touch.captured_at);
  } else {
    assign("utm_landing_page", touch.landing_page);
    assign("utm_referrer", touch.referrer);
    assign("utm_captured_at", touch.captured_at);
  }

  return props;
};

export const getAttributionChannel = (touch?: UtmTouch | null): string => {
  if (!touch) {
    return "";
  }

  if (touch.utm_source && touch.utm_medium) {
    return `${touch.utm_source}/${touch.utm_medium}`;
  }

  return touch.utm_source || touch.utm_medium || touch.gclid || touch.fbclid || "";
};

/**
 * Flat event properties for RudderStack:
 * - last-touch as `utm_*` / `gclid` / `fbclid`
 * - first-touch as `first_utm_*` / `first_gclid` / …
 * - `attribution_channel` derived from last-touch
 */
export const getUtmEventProperties = (): Record<string, string> => {
  // Ensure current URL UTMs are captured before reading (covers race with mount).
  const attribution = captureUtmAttribution();
  if (!attribution) {
    return { attribution_channel: "" };
  }

  return {
    ...prefixTouch(attribution.last, ""),
    ...prefixTouch(attribution.first, "first_"),
    attribution_channel: getAttributionChannel(attribution.last),
  };
};
