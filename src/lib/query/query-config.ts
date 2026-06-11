export const queryConfig = {
  defaultStaleTimeMs: 60_000,
  defaultGcTimeMs: 5 * 60_000,
  retry: 1,
  refetchOnWindowFocus: false,
} as const;
