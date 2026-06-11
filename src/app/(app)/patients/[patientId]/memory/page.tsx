import { MemoryWorkspacePage } from "@/features/memory/pages/memory-workspace-page";

type PatientMemoryRouteProps = {
  params: Promise<{ patientId: string }>;
};

export default async function PatientMemoryRoute({ params }: PatientMemoryRouteProps) {
  const { patientId } = await params;
  return <MemoryWorkspacePage patientId={patientId} />;
}
