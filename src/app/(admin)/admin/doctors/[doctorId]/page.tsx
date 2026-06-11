import { DoctorDetailPage } from "@/features/admin/pages/doctor-detail-page";

type AdminDoctorDetailRouteProps = {
  params: Promise<{ doctorId: string }>;
};

export default async function AdminDoctorDetailRoute({
  params,
}: AdminDoctorDetailRouteProps) {
  const { doctorId } = await params;
  return <DoctorDetailPage doctorId={doctorId} />;
}
