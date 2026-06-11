import { SecuritySettings } from "@/features/settings/components/security-settings";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";

export default function SecuritySettingsRoute() {
  return (
    <PageContainer>
      <PageHeader title="Security" description="Password, sessions, and login history" />
      <div className="mt-6">
        <SecuritySettings />
      </div>
    </PageContainer>
  );
}
