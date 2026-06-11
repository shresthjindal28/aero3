import { SessionWorkspacePage } from "@/features/sessions/pages/session-workspace-page";

type SessionRoutePageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function SessionRoutePage({ params }: SessionRoutePageProps) {
  const { sessionId } = await params;
  return <SessionWorkspacePage sessionId={sessionId} />;
}
