export const queryConfig = {
  defaultStaleTimeMs: 3 * 60_000,
  defaultGcTimeMs: 15 * 60_000,
  retry: 1,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
} as const;
