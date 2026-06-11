"use client";

import { useQuery } from "@tanstack/react-query";

import { getMemoryDocuments } from "@/features/memory/api/memory.api";
import { memoryQueries } from "@/features/memory/queries/memory-queries";

export function useMemoryDocuments(patientId: string, enabled = true) {
  return useQuery({
    ...memoryQueries.documents(patientId),
    queryFn: () => getMemoryDocuments(patientId),
    enabled: enabled && Boolean(patientId),
  });
}
