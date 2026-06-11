import { SoapWorkspacePage } from "@/features/soap/pages/soap-workspace-page";

type SoapRoutePageProps = {
  params: Promise<{ consultationId: string }>;
};

export default async function SoapRoutePage({ params }: SoapRoutePageProps) {
  const { consultationId } = await params;
  return <SoapWorkspacePage consultationId={consultationId} />;
}
