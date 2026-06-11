import { DocumentCenterPage } from "@/features/documents/pages/document-center-page";

type PatientDocumentsRouteProps = {
  params: Promise<{ patientId: string }>;
};

export default async function PatientDocumentsRoute({
  params,
}: PatientDocumentsRouteProps) {
  const { patientId } = await params;
  return <DocumentCenterPage patientId={patientId} />;
}
