export type TranscriptSegment = {
  id: string;
  consultation_id: string;
  session_id: string;
  chunk_id: string;
  chunk_number: number;
  text: string;
  confidence_score: number | null;
  start_time_ms: number;
  end_time_ms: number;
  provider: string;
  processing_latency_ms: number | null;
  created_at: string;
};

export type TranscriptSnapshotEvent = {
  type: "snapshot";
  segments: TranscriptSegment[];
};

export type SegmentCreatedEvent = {
  type: "segment_created";
  session_id: string;
  consultation_id: string;
  segment: TranscriptSegment;
};

export type SegmentUpdatedEvent = {
  type: "segment_updated";
  session_id: string;
  consultation_id: string;
  segment: TranscriptSegment;
};

export type TranscriptFinalizedEvent = {
  type: "transcript_finalized";
  session_id: string;
  consultation_id: string;
  merged_text: string | null;
  missing_chunks: number[] | null;
};

export type TranscriptWsEvent =
  | TranscriptSnapshotEvent
  | SegmentCreatedEvent
  | SegmentUpdatedEvent
  | TranscriptFinalizedEvent;
