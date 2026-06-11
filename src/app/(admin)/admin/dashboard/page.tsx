import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";

export default function AdminDashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Operations dashboard"
        description="Monitor platform health, doctor activity, and AI job throughput."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {["Doctors", "AI Jobs", "Verifications"].map((item) => (
          <div
            key={item}
            className="rounded-lg border bg-card p-5 text-sm text-muted-foreground shadow-sm"
          >
            <p className="font-medium text-foreground">{item}</p>
            <p className="mt-2">Operational metrics will appear in a future release.</p>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
