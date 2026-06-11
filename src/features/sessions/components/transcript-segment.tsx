import type { TranscriptSegment as TranscriptSegmentType } from "@/features/sessions/types/transcript.types";
import {
  formatSegmentTime,
  formatSpeaker,
} from "@/features/sessions/utils/session.utils";
import { cn } from "@/lib/utils/cn";

type TranscriptSegmentProps = {
  segment: TranscriptSegmentType;
  isLatest?: boolean;
};

export function TranscriptSegment({
  segment,
  isLatest = false,
}: TranscriptSegmentProps) {
  return (
    <article
      className={cn(
        "group rounded-lg border border-transparent px-3 py-2 transition-colors",
        isLatest && "border-primary/20 bg-primary/5",
      )}
    >
      <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground/80">
          {formatSpeaker(segment.provider)}
        </span>
        <span>·</span>
        <time className="font-mono">
          {formatSegmentTime(segment.start_time_ms)}
        </time>
        {segment.confidence_score !== null ? (
          <>
            <span>·</span>
            <span>{Math.round(segment.confidence_score * 100)}%</span>
          </>
        ) : null}
      </div>
      <p className="text-sm leading-relaxed text-foreground/90">{segment.text}</p>
    </article>
  );
}
