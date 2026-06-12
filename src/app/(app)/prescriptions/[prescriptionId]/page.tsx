import { PrescriptionDetailPage } from "@/features/prescription/pages/prescription-detail-page";

type PrescriptionDetailRouteProps = {
  params: Promise<{ prescriptionId: string }>;
};

export default async function PrescriptionDetailRoute({
  params,
}: PrescriptionDetailRouteProps) {
  const { prescriptionId } = await params;
  return <PrescriptionDetailPage prescriptionId={prescriptionId} />;
}
