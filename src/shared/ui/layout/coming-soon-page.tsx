import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";

type ComingSoonPageProps = {
  title: string;
  description?: string;
};

export function ComingSoonPage({
  title,
  description = "This section will be available in an upcoming release.",
}: ComingSoonPageProps) {
  return (
    <PageContainer>
      <PageHeader title={title} description={description} />
      <div className="mt-8 rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        Module scaffold ready — feature implementation coming next.
      </div>
    </PageContainer>
  );
}
