import type { TranscriptSegment } from "@/features/sessions/types/transcript.types";

export class TranscriptRingBuffer {
  private readonly capacity: number;
  private readonly ids: string[] = [];
  private readonly segments = new Map<string, TranscriptSegment>();
  private start = 0;
  private size = 0;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  upsert(segment: TranscriptSegment): "created" | "updated" {
    const exists = this.segments.has(segment.id);
    this.segments.set(segment.id, segment);

    if (exists) {
      return "updated";
    }

    if (this.size < this.capacity) {
      this.ids.push(segment.id);
      this.size += 1;
      return "created";
    }

    const evictedId = this.ids[this.start];
    this.segments.delete(evictedId);
    this.ids[this.start] = segment.id;
    this.start = (this.start + 1) % this.capacity;
    return "created";
  }

  loadSnapshot(segments: TranscriptSegment[]): void {
    this.clear();
    const tail = segments.slice(-this.capacity);
    for (const segment of tail) {
      this.upsert(segment);
    }
  }

  toArray(): TranscriptSegment[] {
    const result: TranscriptSegment[] = [];

    for (let index = 0; index < this.size; index += 1) {
      const slot = (this.start + index) % this.capacity;
      const id = this.ids[slot];
      const segment = this.segments.get(id);
      if (segment) {
        result.push(segment);
      }
    }

    return result;
  }

  get count(): number {
    return this.size;
  }

  clear(): void {
    this.ids.length = 0;
    this.segments.clear();
    this.start = 0;
    this.size = 0;
  }
}
