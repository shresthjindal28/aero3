import { Suspense } from "react";

import { ConsultationsListPage } from "@/features/consultations/pages/consultations-list-page";
import { TableRowsSkeleton } from "@/shared/ui/feedback/clinical-skeletons";
import { PageContainer } from "@/shared/ui/layout/page-container";

export default function ConsultationsRoutePage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <TableRowsSkeleton rows={6} />
        </PageContainer>
      }
    >
      <ConsultationsListPage />
    </Suspense>
  );
}
