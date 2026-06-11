import Link from "next/link";

import { routes } from "@/shared/constants/routes";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { Button } from "@/shared/ui/primitives/button";

export default function MemoryIndexPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Memory"
        description="Patient memory is available from each patient's workspace"
      />
      <div className="mt-8 rounded-xl border border-dashed border-border/60 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Open a patient record to explore AIRO&apos;s memory profile, documents, and
          vector search.
        </p>
        <Button type="button" className="mt-4" asChild>
          <Link href={routes.app.patients}>Go to patients</Link>
        </Button>
      </div>
    </PageContainer>
  );
}
