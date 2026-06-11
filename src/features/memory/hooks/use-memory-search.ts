"use client";

import { useMutation } from "@tanstack/react-query";

import { searchMemory } from "@/features/memory/api/memory.api";
import type { MemorySearchRequest } from "@/features/memory/types/memory.types";

export function useMemorySearch() {
  return useMutation({
    mutationFn: (input: MemorySearchRequest) => searchMemory(input),
  });
}
