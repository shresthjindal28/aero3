import { ConnectionBadge } from "@/features/sessions/components/connection-badge";
import type { ConnectionDisplayStatus } from "@/features/sessions/services/session-realtime.service";
import {
  formatElapsedMs,
  formatSessionStatus,
} from "@/features/sessions/utils/session.utils";
import type { Session } from "@/features/sessions/types/session.types";
import { cn } from "@/lib/utils/cn";

type SessionHeaderProps = {
  patientName: string;
  consultationLabel: string;
  session: Session;
  elapsedMs: number;
  connectionStatus: ConnectionDisplayStatus;
};

function resolveConnectionLabel(
  sessionStatus: Session["status"],
  connectionStatus: ConnectionDisplayStatus,
): string {
  if (sessionStatus === "ended") {
    return "Session complete";
  }

  const labels: Record<ConnectionDisplayStatus, string> = {
    connected: "Connected",
    reconnecting: "Reconnecting",
    syncing: "Connecting",
    disconnected: "Disconnected",
  };

  return labels[connectionStatus];
}

const statusStyles: Record<Session["status"], string> = {
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  paused: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  ended: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
  failed: "border-red-500/30 bg-red-500/10 text-red-400",
};

export function SessionHeader({
  patientName,
  consultationLabel,
  session,
  elapsedMs,
  connectionStatus,
}: SessionHeaderProps) {
  return (
    <header className="border-b border-border/60 bg-card/40 px-6 py-4 backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{patientName}</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {consultationLabel}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium capitalize",
              statusStyles[session.status] ?? statusStyles.active,
            )}
          >
            {formatSessionStatus(session.status)}
          </span>
          <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 font-mono text-xs">
            {formatElapsedMs(elapsedMs)}
          </span>
          <ConnectionBadge
            status={session.status === "ended" ? "connected" : connectionStatus}
            label={resolveConnectionLabel(session.status, connectionStatus)}
          />
        </div>
      </div>
    </header>
  );
}
