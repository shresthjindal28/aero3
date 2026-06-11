"use client";

import { SessionWorkspace } from "@/features/sessions/components/session-workspace";

type SessionWorkspacePageProps = {
  sessionId: string;
};

export function SessionWorkspacePage({ sessionId }: SessionWorkspacePageProps) {
  return <SessionWorkspace sessionId={sessionId} />;
}
