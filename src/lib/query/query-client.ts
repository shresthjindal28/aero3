import { QueryClient } from "@tanstack/react-query";

import { queryConfig } from "@/lib/query/query-config";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: queryConfig.defaultStaleTimeMs,
        gcTime: queryConfig.defaultGcTimeMs,
        retry: queryConfig.retry,
        refetchOnWindowFocus: queryConfig.refetchOnWindowFocus,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
