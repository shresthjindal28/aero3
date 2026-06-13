import { Suspense } from "react";

import { PrescriptionWorkspacePage } from "@/features/prescription/pages/prescription-workspace-page";
import { PageLoader } from "@/shared/ui/feedback/page-loader";

type PrescriptionRoutePageProps = {
  params: Promise<{ consultationId: string }>;
};

export default async function PrescriptionRoutePage({
  params,
}: PrescriptionRoutePageProps) {
  const { consultationId } = await params;

  return (
    <Suspense fallback={<PageLoader label="Loading prescription..." className="h-full min-h-0" />}>
      <PrescriptionWorkspacePage consultationId={consultationId} />
    </Suspense>
  );
}
