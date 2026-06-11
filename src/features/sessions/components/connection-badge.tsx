import { Loader2, Wifi, WifiOff } from "lucide-react";

import type { ConnectionDisplayStatus } from "@/features/sessions/services/session-realtime.service";
import { cn } from "@/lib/utils/cn";

type ConnectionBadgeProps = {
  status: ConnectionDisplayStatus;
};

const statusConfig: Record<
  ConnectionDisplayStatus,
  { label: string; className: string; icon: "wifi" | "off" | "loader" }
> = {
  connected: {
    label: "Connected",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    icon: "wifi",
  },
  reconnecting: {
    label: "Reconnecting",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    icon: "loader",
  },
  syncing: {
    label: "Syncing",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-400",
    icon: "loader",
  },
  disconnected: {
    label: "Disconnected",
    className: "border-red-500/30 bg-red-500/10 text-red-400",
    icon: "off",
  },
};

export function ConnectionBadge({ status }: ConnectionBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        config.className,
      )}
    >
      {config.icon === "wifi" ? (
        <Wifi className="h-3.5 w-3.5" />
      ) : config.icon === "loader" ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <WifiOff className="h-3.5 w-3.5" />
      )}
      {config.label}
    </span>
  );
}
