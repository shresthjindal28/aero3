import type { Session } from "@/features/sessions/types/session.types";

export function resolveActiveSession(sessions: Session[]): Session | null {
  return (
    sessions.find(
      (session) => session.status === "active" || session.status === "paused",
    ) ?? null
  );
}
