import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";

export default function DoctorDashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Your clinical command center. Feature modules will appear here as they ship."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {["Consultations", "Live Sessions", "Memory"].map((item) => (
          <div
            key={item}
            className="rounded-lg border bg-card p-5 text-sm text-muted-foreground shadow-sm"
          >
            <p className="font-medium text-foreground">{item}</p>
            <p className="mt-2">Insights and activity will surface in a future release.</p>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
