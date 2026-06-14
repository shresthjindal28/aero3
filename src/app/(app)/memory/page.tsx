import Link from "next/link";

import { routes } from "@/shared/constants/routes";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { Button } from "@/shared/ui/primitives/button";

export default function MemoryIndexPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Chart summary"
        description="Open a patient chart to view their clinical summary."
      />
      <div className="mt-8 rounded-xl border border-dashed border-border/60 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Open a patient record to review their chart summary and clinical context.
        </p>
        <Button type="button" className="mt-4" asChild>
          <Link href={routes.app.patients}>Go to patients</Link>
        </Button>
      </div>
    </PageContainer>
  );
}
