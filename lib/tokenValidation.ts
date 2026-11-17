/**
 * Token validation utilities for Puck page access control and API auth.
 */

/** Clock skew buffer so tokens near expiry are refreshed before the server rejects them. */
const DEFAULT_EXPIRY_BUFFER_SECONDS = 60;

interface JwtPayload {
  exp?: number;
  iat?: number;
}

/** Strips an optional `Bearer ` prefix from an authorization value. */
export function stripBearerToken(token: string): string {
  return token.replace(/^Bearer\s+/i, "").trim();
}

/** Decodes a JWT payload without verifying the signature (client-side expiry checks only). */
export function parseJwtPayload(token: string | null | undefined): JwtPayload | null {
  if (!token) return null;

  try {
    const cleanToken = stripBearerToken(token);
    if (!cleanToken) return null;

    const jwtParts = cleanToken.split(".");
    if (jwtParts.length !== 3) return null;

    const payload = JSON.parse(atob(jwtParts[1])) as JwtPayload;
    return payload && typeof payload === "object" ? payload : null;
  } catch {
    return null;
  }
}

/** Returns true when the access token is missing, malformed, or past its expiry (with buffer). */
export function isAccessTokenExpired(
  token: string | null | undefined,
  bufferSeconds: number = DEFAULT_EXPIRY_BUFFER_SECONDS,
): boolean {
  if (!token) return true;

  const cleanToken = stripBearerToken(token);
  if (!cleanToken || cleanToken.split(".").length !== 3) return true;

  const payload = parseJwtPayload(cleanToken);
  if (!payload?.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp <= currentTime + bufferSeconds;
}

/** Computes LRU/cache TTL from JWT `exp`, falling back to `fallbackMs`. */
export function getAccessTokenCacheTtlMs(
  token: string,
  fallbackMs: number = 3_600_000,
  bufferSeconds: number = DEFAULT_EXPIRY_BUFFER_SECONDS,
): number {
  const payload = parseJwtPayload(token);
  if (payload?.exp) {
    const remainingMs = payload.exp * 1000 - Date.now() - bufferSeconds * 1000;
    return Math.max(remainingMs, 60_000);
  }
  return Math.max(fallbackMs - bufferSeconds * 1000, 60_000);
}

function readSearchParamValue(
  value: string | string[] | undefined,
): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  if (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === "string" &&
    value[0].trim().length > 0
  ) {
    return value[0].trim();
  }
  return null;
}

/**
 * Returns the first non-empty token from candidates (`?token=` or `?editToken=`).
 */
export function resolveAuthToken(
  ...candidates: Array<string | null | undefined>
): string | null {
  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

/**
 * Appends `editToken` to a href (readers also accept `?token=` via resolveAuthToken).
 */
export function appendAuthTokenToHref(
  href: string,
  token: string | null | undefined,
): string {
  const resolved = token?.trim();
  if (!resolved) return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}editToken=${encodeURIComponent(resolved)}`;
}

/**
 * Resolves auth token from a prop (SSR) and current URL query on the client.
 */
export function getClientAuthToken(propToken?: string | null): string | null {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    return resolveAuthToken(propToken, params.get("editToken"), params.get("token"));
  }
  return propToken?.trim() || null;
}

/**
 * Validates if a JWT token is present and has basic structure
 * @param token - The token string to validate
 * @returns boolean indicating if token is valid
 */
export function validateToken(token: string | null): boolean {
  if (!token) return false;

  const payload = parseJwtPayload(token);
  if (!payload?.exp || !payload?.iat) return false;

  return !isAccessTokenExpired(token, 0);
}

/**
 * Extracts token from Next.js searchParams object
 * @param searchParams - Next.js searchParams object
 * @returns token string or null
 */
export function extractTokenFromSearchParams(searchParams: {
  [key: string]: string | string[] | undefined;
}): string | null {
  if (!searchParams || typeof searchParams !== "object") return null;

  return resolveAuthToken(
    readSearchParamValue(searchParams.token),
    readSearchParamValue(searchParams.editToken),
  );
}
