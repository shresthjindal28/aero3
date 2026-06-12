import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { MemoryRetrievalRecord } from "@/features/memory/types/memory.types";

type MemoryRetrievalState = {
  history: Record<string, MemoryRetrievalRecord[]>;
  addRecord: (patientId: string, record: MemoryRetrievalRecord) => void;
  getHistory: (patientId: string) => MemoryRetrievalRecord[];
  clearHistory: (patientId: string) => void;
};

const MAX_HISTORY = 50;

/** Stable reference so Zustand selectors do not re-render on every read. */
export const EMPTY_MEMORY_HISTORY: MemoryRetrievalRecord[] = [];

export const useMemoryRetrievalStore = create<MemoryRetrievalState>()(
  persist(
    (set, get) => ({
      history: {},
      addRecord: (patientId, record) => {
        set((state) => {
          const existing = state.history[patientId] ?? [];
          return {
            history: {
              ...state.history,
              [patientId]: [record, ...existing].slice(0, MAX_HISTORY),
            },
          };
        });
      },
      getHistory: (patientId) => get().history[patientId] ?? EMPTY_MEMORY_HISTORY,
      clearHistory: (patientId) => {
        set((state) => {
          const next = { ...state.history };
          delete next[patientId];
          return { history: next };
        });
      },
    }),
    { name: "airo-memory-retrieval" },
  ),
);
