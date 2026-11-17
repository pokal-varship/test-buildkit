import { Data } from "@measured/puck";
import fs from "fs";
import path from "path";

// Get page data from live database (for public pages)
export const getPage = (pagePath: string) => {
  try {
    const databasePath = path.join(process.cwd(), "database.json");
    const allData: Record<string, Data> | null = fs.existsSync(databasePath)
      ? JSON.parse(fs.readFileSync(databasePath, "utf-8"))
      : null;

    return allData ? allData[pagePath] : null;
  } catch {

    return null;
  }
};

// Get page data from external API (for editors) - always fresh
// When `token` is set (e.g. from `?token=Bearer ...` on /edit), it is forwarded so SSR
// can load page content without relying on cookies alone.
// `isDraft`: true loads draft content, false loads published/live content.
export const getDraftPage = async (
  pagePath: string,
  token?: string | null,
  isDraft = true,
) => {
  try {
    // Import the API function dynamically to avoid server-side issues
    const { getPageDraft } = await import('../../services/pageManagement');

    const result = await getPageDraft(pagePath, token ?? undefined, isDraft);

    if (result.success && result.data) {
      return result.data;
    }

    return null;
  } catch {
    return null;
  }
};

// Get all available pages for static generation
export const getAllPages = (): string[] => {
  try {
    const databasePath = path.join(process.cwd(), "database.json");
    if (!fs.existsSync(databasePath)) {
      return [];
    }

    const allData: Record<string, Data> = JSON.parse(fs.readFileSync(databasePath, "utf-8"));
    return Object.keys(allData).filter(pagePath => pagePath !== "/puck"); // Exclude editor data
  } catch {

    return [];
  }
};

// Get page data with fallback
export const getPageWithFallback = (pagePath: string, fallbackData?: Data): Data | null => {
  const data = getPage(pagePath);
  return data || fallbackData || null;
};
 