"use client";

import { useEffect, useRef } from "react";

import { TranscriptSegment } from "@/features/sessions/components/transcript-segment";
import type { TranscriptSegment as TranscriptSegmentType } from "@/features/sessions/types/transcript.types";
import { getTranscriptPlaceholderMessage } from "@/features/sessions/utils/session.utils";
import type { RecordingState } from "@/features/sessions/services/audio-recorder.service";
import type { Session } from "@/features/sessions/types/session.types";

type TranscriptStreamProps = {
  segments: TranscriptSegmentType[];
  autoScrollEnabled: boolean;
  onAutoScrollChange: (enabled: boolean) => void;
  sessionStatus: Session["status"];
  recordingState: RecordingState;
  chunksUploaded: number;
  lastChunkNumber: number;
};

export function TranscriptStream({
  segments,
  autoScrollEnabled,
  onAutoScrollChange,
  sessionStatus,
  recordingState,
  chunksUploaded,
  lastChunkNumber,
}: TranscriptStreamProps) {
  const placeholderMessage = getTranscriptPlaceholderMessage({
    sessionStatus,
    recordingState,
    chunksUploaded,
    lastChunkNumber,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);

  useEffect(() => {
    if (!autoScrollEnabled || userScrolledRef.current) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [autoScrollEnabled, segments]);

  return (
    <div className="flex h-[min(72vh,720px)] min-h-[420px] flex-col rounded-xl border border-border/60 bg-card/30 lg:h-full lg:max-h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-medium">Live transcript</h2>
        {!autoScrollEnabled ? (
          <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={() => {
              userScrolledRef.current = false;
              onAutoScrollChange(true);
            }}
          >
            Resume auto-scroll
          </button>
        ) : null}
      </div>

      <div
        ref={containerRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-3"
        onScroll={(event) => {
          const element = event.currentTarget;
          const distanceFromBottom =
            element.scrollHeight - element.scrollTop - element.clientHeight;

          if (distanceFromBottom > 80) {
            userScrolledRef.current = true;
            onAutoScrollChange(false);
          } else {
            userScrolledRef.current = false;
            onAutoScrollChange(true);
          }
        }}
      >
        {segments.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
            {placeholderMessage}
          </div>
        ) : (
          <div className="space-y-1">
            {segments.map((segment, index) => (
              <TranscriptSegment
                key={segment.id}
                segment={segment}
                isLatest={index === segments.length - 1}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}
