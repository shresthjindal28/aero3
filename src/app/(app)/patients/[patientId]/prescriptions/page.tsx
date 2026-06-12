import { PatientPrescriptionsPage } from "@/features/prescription/pages/patient-prescriptions-page";

type PatientPrescriptionsRouteProps = {
  params: Promise<{ patientId: string }>;
};

export default async function PatientPrescriptionsRoute({
  params,
}: PatientPrescriptionsRouteProps) {
  const { patientId } = await params;
  return <PatientPrescriptionsPage patientId={patientId} />;
}
