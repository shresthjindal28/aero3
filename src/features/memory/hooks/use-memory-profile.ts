"use client";

import { useQuery } from "@tanstack/react-query";

import { getMemoryProfile } from "@/features/memory/api/memory.api";
import { memoryQueries } from "@/features/memory/queries/memory-queries";

export function useMemoryProfile(patientId: string, enabled = true) {
  return useQuery({
    ...memoryQueries.profile(patientId),
    queryFn: () => getMemoryProfile(patientId),
    enabled: enabled && Boolean(patientId),
  });
}
