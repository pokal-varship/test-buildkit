import { useCallback, useRef } from 'react';

export function useDebouncedApiCall<T extends (...args: any[]) => Promise<any>>(
  apiCall: T,
  delay: number = 300
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedApiCall = useCallback(
    async (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      return new Promise<Awaited<ReturnType<T>>>((resolve, reject) => {
        timeoutRef.current = setTimeout(async () => {
          try {
            const result = await apiCall(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, delay);
      });
    },
    [apiCall, delay]
  );

  return debouncedApiCall;
} 