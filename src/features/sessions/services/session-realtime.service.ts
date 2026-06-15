import type { TranscriptWsEvent } from "@/features/sessions/types/transcript.types";
import { TranscriptSyncService } from "@/features/sessions/services/transcript-sync.service";
import { connectionEvents } from "@/shared/realtime/events/connection.events";
import { eventRegistry } from "@/shared/realtime/event-registry";
import { subscribeToTranscriptChannel } from "@/shared/realtime/channels/transcript.channel";

export type ConnectionDisplayStatus =
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "syncing";

type SessionRealtimeCallbacks = {
  onConnectionChange: (status: ConnectionDisplayStatus) => void;
  onSegmentsChange: () => void;
  onFinalized: (payload: {
    mergedText: string | null;
    missingChunks: number[] | null;
  }) => void;
  onRecover: () => Promise<void>;
};

export class SessionRealtimeService {
  private unsubscribeChannel: (() => void) | null = null;
  private readonly unsubscribers: Array<() => void> = [];

  constructor(
    private readonly sessionId: string,
    private readonly token: string,
    private readonly transcriptSync: TranscriptSyncService,
    private readonly callbacks: SessionRealtimeCallbacks,
  ) {}

  connect(): void {
    this.callbacks.onConnectionChange("syncing");

    this.unsubscribeChannel = subscribeToTranscriptChannel({
      sessionId: this.sessionId,
      token: this.token,
      onEvent: (event) => this.handleEvent(event),
    });

    this.unsubscribers.push(
      eventRegistry.on(connectionEvents.connected, () => {
        void this.recover();
      }),
    );
    this.unsubscribers.push(
      eventRegistry.on(connectionEvents.reconnecting, () => {
        this.callbacks.onConnectionChange("reconnecting");
      }),
    );
    this.unsubscribers.push(
      eventRegistry.on(connectionEvents.disconnected, () => {
        this.callbacks.onConnectionChange("disconnected");
      }),
    );
  }

  disconnect(): void {
    this.unsubscribeChannel?.();
    this.unsubscribeChannel = null;
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers.length = 0;
    this.callbacks.onConnectionChange("disconnected");
  }

  private async recover(): Promise<void> {
    this.callbacks.onConnectionChange("syncing");
    try {
      await this.transcriptSync.syncFromApi(this.sessionId);
      this.callbacks.onSegmentsChange();
      await this.callbacks.onRecover();
      this.callbacks.onConnectionChange("connected");
    } catch {
      this.callbacks.onConnectionChange("disconnected");
    }
  }

  private handleEvent(event: TranscriptWsEvent): void {
    if (event.type === "snapshot") {
      this.transcriptSync.applySnapshot(event.segments);
      this.callbacks.onSegmentsChange();
      this.callbacks.onConnectionChange("connected");
      return;
    }

    if (event.type === "segment_created" || event.type === "segment_updated") {
      this.transcriptSync.upsert(event.segment);
      this.callbacks.onSegmentsChange();
      this.callbacks.onConnectionChange("connected");
      return;
    }

    if (event.type === "transcript_finalized") {
      void this.handleFinalized(event);
      return;
    }
  }

  private async handleFinalized(event: Extract<TranscriptWsEvent, { type: "transcript_finalized" }>): Promise<void> {
    try {
      await this.transcriptSync.syncFromApi(this.sessionId);
      this.callbacks.onSegmentsChange();
    } catch {
      // Polling on the workspace will retry if sync fails.
    }

    this.callbacks.onFinalized({
      mergedText: event.merged_text,
      missingChunks: event.missing_chunks,
    });
    this.callbacks.onConnectionChange("connected");
  }
}
