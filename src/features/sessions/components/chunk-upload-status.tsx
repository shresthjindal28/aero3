type ChunkUploadStatusProps = {
  uploaded: number;
  pending: number;
  failed: number;
};

export function ChunkUploadStatus({
  uploaded,
  pending,
  failed,
}: ChunkUploadStatusProps) {
  return (
    <div className="grid grid-cols-3 gap-2 text-center text-xs">
      <div className="rounded-lg border border-border/60 bg-muted/20 p-2">
        <p className="text-muted-foreground">Uploaded</p>
        <p className="mt-1 font-mono text-sm font-semibold text-emerald-400">
          {uploaded}
        </p>
      </div>
      <div className="rounded-lg border border-border/60 bg-muted/20 p-2">
        <p className="text-muted-foreground">Pending</p>
        <p className="mt-1 font-mono text-sm font-semibold text-amber-400">
          {pending}
        </p>
      </div>
      <div className="rounded-lg border border-border/60 bg-muted/20 p-2">
        <p className="text-muted-foreground">Failed</p>
        <p className="mt-1 font-mono text-sm font-semibold text-red-400">
          {failed}
        </p>
      </div>
    </div>
  );
}
