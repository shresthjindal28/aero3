import { listTranscriptSegments } from "@/features/sessions/api/transcript-segments.api";
import type { TranscriptSegment } from "@/features/sessions/types/transcript.types";
import { TranscriptRingBuffer } from "@/features/sessions/utils/transcript-ring-buffer";

export class TranscriptSyncService {
  constructor(private readonly buffer: TranscriptRingBuffer) {}

  applySnapshot(segments: TranscriptSegment[]): void {
    this.buffer.loadSnapshot(segments);
  }

  upsert(segment: TranscriptSegment): "created" | "updated" {
    return this.buffer.upsert(segment);
  }

  getSegments(): TranscriptSegment[] {
    return this.buffer.toArray();
  }

  get segmentCount(): number {
    return this.buffer.count;
  }

  async syncFromApi(sessionId: string): Promise<TranscriptSegment[]> {
    const segments = await listTranscriptSegments(sessionId);
    this.applySnapshot(segments);
    return this.getSegments();
  }
}
