import { transcriptEvents } from "@/shared/realtime/events/transcript.events";
import { eventRegistry } from "@/shared/realtime/event-registry";
import { subscriptionManager } from "@/shared/realtime/subscription-manager";
import { websocketManager } from "@/shared/realtime/websocket-manager";
import type { TranscriptWsEvent } from "@/features/transcripts/types/segment.types";

export function subscribeToTranscriptChannel(input: {
  sessionId: string;
  token: string;
  onEvent: (event: TranscriptWsEvent) => void;
}) {
  websocketManager.connect({
    key: input.sessionId,
    path: `/sessions/${input.sessionId}/transcript`,
    token: input.token,
  });

  const subscription = subscriptionManager.subscribe<TranscriptWsEvent>(
    "transcript",
    input.sessionId,
    (payload) => {
      input.onEvent(payload);

      if (payload.type === "snapshot") {
        eventRegistry.emit(transcriptEvents.snapshot, payload);
      }

      if (
        payload.type === "segment_created" ||
        payload.type === "segment_updated"
      ) {
        eventRegistry.emit(transcriptEvents.segment, payload);
      }

      if (payload.type === "transcript_finalized") {
        eventRegistry.emit(transcriptEvents.finalized, payload);
      }
    },
  );

  return () => {
    subscription.unsubscribe();
    websocketManager.disconnect(input.sessionId);
  };
}
