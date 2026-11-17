import { usePathname } from "next/navigation";

/**
 * Checks if current route matches the given path.
 * @param path The route path to check, e.g. "/about-us"
 * @returns boolean - true if on the given path
 */
export function useIsCurrentPage(path: string): boolean {
  const pathname = usePathname();
  return pathname === path || pathname?.startsWith(path + "/") || false;
}