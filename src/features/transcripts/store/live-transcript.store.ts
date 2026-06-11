"use client";

import { create } from "zustand";

import type { TranscriptSegment } from "@/features/transcripts/types/segment.types";

type LiveTranscriptState = {
  segments: TranscriptSegment[];
  setSnapshot: (segments: TranscriptSegment[]) => void;
  appendSegment: (segment: TranscriptSegment) => void;
  reset: () => void;
};

export const useLiveTranscriptStore = create<LiveTranscriptState>((set) => ({
  segments: [],
  setSnapshot: (segments) => set({ segments }),
  appendSegment: (segment) =>
    set((state) => ({ segments: [...state.segments, segment] })),
  reset: () => set({ segments: [] }),
}));
