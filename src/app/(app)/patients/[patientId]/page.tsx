import { Suspense } from "react";

import { PatientDetailPage } from "@/features/patients/pages/patient-detail-page";
import { PageLoader } from "@/shared/ui/feedback/page-loader";

export default function PatientDetailRoutePage() {
  return (
    <Suspense fallback={<PageLoader label="Loading patient..." />}>
      <PatientDetailPage />
    </Suspense>
  );
}
