import { ChunkUploadStatus } from "@/features/sessions/components/chunk-upload-status";
import { formatElapsedMs } from "@/features/sessions/utils/session.utils";

type SessionMetricsProps = {
  elapsedMs: number;
  transcriptSegmentCount: number;
  chunksUploaded: number;
  chunksPending: number;
  chunksFailed: number;
};

export function SessionMetrics({
  elapsedMs,
  transcriptSegmentCount,
  chunksUploaded,
  chunksPending,
  chunksFailed,
}: SessionMetricsProps) {
  return (
    <div className="space-y-4 rounded-xl border border-border/60 bg-card/50 p-4">
      <h3 className="text-sm font-medium">Session metrics</h3>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground">Elapsed</p>
          <p className="font-mono font-semibold">{formatElapsedMs(elapsedMs)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Transcript segments</p>
          <p className="font-mono font-semibold">{transcriptSegmentCount}</p>
        </div>
      </div>

      <ChunkUploadStatus
        uploaded={chunksUploaded}
        pending={chunksPending}
        failed={chunksFailed}
      />
    </div>
  );
}
