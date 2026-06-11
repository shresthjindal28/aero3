import Link from "next/link";

import { routes } from "@/shared/constants/routes";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";
import { Button } from "@/shared/ui/primitives/button";

export default function DocumentsIndexPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Documents"
        description="Clinical documents are managed per patient"
      />
      <div className="mt-8 rounded-xl border border-dashed border-border/60 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Upload, preview, and manage consultation documents from a patient&apos;s
          document center.
        </p>
        <Button type="button" className="mt-4" asChild>
          <Link href={routes.app.patients}>Go to patients</Link>
        </Button>
      </div>
    </PageContainer>
  );
}
