import { Suspense } from "react";

import { CreateConsultationPage } from "@/features/consultations/pages/create-consultation-page";
import { PageLoader } from "@/shared/ui/feedback/page-loader";

export default function CreateConsultationRoutePage() {
  return (
    <Suspense fallback={<PageLoader label="Loading..." />}>
      <CreateConsultationPage />
    </Suspense>
  );
}
