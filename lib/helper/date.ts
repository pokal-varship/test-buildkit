import moment from "moment";
import { getTenantConfig } from "@config/tenant.config";

/** Coerce API epoch values (seconds or ms) to milliseconds. */
export const toTimestampMs = (value: unknown): number | null => {
  if (value == null || value === "") return null;

  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n) || n <= 0) return null;

  return n < 1e12 ? n * 1000 : n;
};

export const getFormattedTime = (
  timestamp: number,
  formatStr = getTenantConfig().timeDisplayFormat
) => {
  const correctedFormat = formatStr?.replace(/AM\/PM/g, "A");
  return moment(timestamp).format(correctedFormat);
};

  export const getFormattedDate = (
  timestamp: number,
  formatStr = getTenantConfig().dateDisplayFormat
) => {
  return moment(timestamp).format(formatStr);
};

const normalizeTimeFormat = (format?: string) => {
  if (!format) return "hh:mm A";
  return format.replace(/AM\/PM/gi, "A");
};

export const getFormattedDateTime = (
  timestamp: number,
  timeFormat = getTenantConfig().timeDisplayFormat,
  dateFormat = getTenantConfig().dateDisplayFormat,
) => {
  const validTimeFormat = normalizeTimeFormat(timeFormat);
  const validDateFormat = dateFormat || "DD MMMM YYYY";
  return moment(timestamp).format(`${validDateFormat}, ${validTimeFormat}`);
};

export const timeSince = (timestamp:number): string => {
  // Convert timestamp to milliseconds if it's in seconds (Unix timestamp)
  const timestampMs = timestamp < 1e12 ? timestamp * 1000 : timestamp;
  
  // Current time in milliseconds
  const now = Date.now();
  // Difference in milliseconds
  const diffMs = now - timestampMs;
  
  // Convert to seconds
  const diffSec = Math.floor(diffMs / 1000);
  
  // Convert to minutes
  const diffMin = Math.floor(diffSec / 60);
  
  // Convert to hours
  const diffHours = Math.floor(diffMin / 60);
  
  // Convert to days
  const diffDays = Math.floor(diffHours / 24);
  
  // Convert to months (approximate)
  const diffMonths = Math.floor(diffDays / 30);
  
  // Convert to years (approximate)
  const diffYears = Math.floor(diffDays / 365);

  if (diffSec < 60) {
      return "just now";
  } else if (diffMin < 60) {
      return `${diffMin} Min${diffMin === 1 ? "" : "s"} ago`;
  } else if (diffHours < 24) {
      return `${diffHours} Hour${diffHours === 1 ? "" : "s"} ago`;
  } else if (diffDays < 30) {
      return `${diffDays} Day${diffDays === 1 ? "" : "s"} ago`;
  } else if (diffMonths < 12) {
      return `${diffMonths} Month${diffMonths === 1 ? "" : "s"} ago`;
  } else {
      return `${diffYears} Year${diffYears === 1 ? "" : "s"} ago`;
  }
}
