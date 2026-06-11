"use client";

import { useEffect } from "react";

import { subscribeToTranscriptChannel } from "@/shared/realtime/channels/transcript.channel";
import type { TranscriptWsEvent } from "@/features/transcripts/types/segment.types";

export function useTranscriptChannelSubscription(input: {
  sessionId: string | null;
  token: string | null;
  enabled?: boolean;
  onEvent: (event: TranscriptWsEvent) => void;
}) {
  useEffect(() => {
    if (!input.enabled || !input.sessionId || !input.token) {
      return;
    }

    return subscribeToTranscriptChannel({
      sessionId: input.sessionId,
      token: input.token,
      onEvent: input.onEvent,
    });
  }, [input.enabled, input.onEvent, input.sessionId, input.token]);
}
