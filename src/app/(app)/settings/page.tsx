import Link from "next/link";

import { routes } from "@/shared/constants/routes";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { PageHeader } from "@/shared/ui/layout/page-header";

export default function DoctorSettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Manage your profile, security, and workspace preferences."
      />
      <div className="mt-8 grid gap-3 md:max-w-md">
        <Link
          href={routes.app.settingsProfile}
          className="rounded-lg border bg-card px-4 py-3 text-sm transition-colors hover:bg-accent"
        >
          Profile
        </Link>
        <Link
          href={routes.app.settingsSecurity}
          className="rounded-lg border bg-card px-4 py-3 text-sm transition-colors hover:bg-accent"
        >
          Security
        </Link>
      </div>
    </PageContainer>
  );
}
