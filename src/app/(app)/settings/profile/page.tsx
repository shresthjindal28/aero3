import { ProfileSettings } from "@/features/settings/components/profile-settings";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";

export default function ProfileSettingsRoute() {
  return (
    <PageContainer>
      <PageHeader title="Profile" description="Your doctor profile and registration" />
      <div className="mt-6">
        <ProfileSettings />
      </div>
    </PageContainer>
  );
}
