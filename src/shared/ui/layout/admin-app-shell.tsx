"use client";

import { adminNavigation } from "@/config/navigation.config";
import { appConfig } from "@/config/app.config";
import { useAdminLogout, useAdminMe } from "@/features/auth/hooks/use-admin-auth";
import { useShellStore } from "@/shared/store/shell.store";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { ShellSkeletonLoader } from "@/shared/ui/feedback/skeleton-loader";
import { AppHeader } from "@/shared/ui/layout/app-header";
import { MobileSidebarDrawer } from "@/shared/ui/layout/mobile-sidebar-drawer";
import { Sidebar } from "@/shared/ui/layout/sidebar";

type AdminAppShellProps = {
  children: React.ReactNode;
};

export function AdminAppShell({ children }: AdminAppShellProps) {
  const logout = useAdminLogout();
  const { sidebarCollapsed } = useShellStore();
  const { data: admin, isLoading, isError, error, refetch } = useAdminMe();

  if (isLoading) {
    return <ShellSkeletonLoader />;
  }

  if (isError || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <ApiErrorDisplay
          error={(error as Error) ?? new Error("Unable to load profile")}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:flex">
        <Sidebar
          brand={appConfig.name}
          subtitle="Operations"
          items={adminNavigation}
          collapsed={sidebarCollapsed}
        />
      </div>

      <MobileSidebarDrawer
        brand={appConfig.name}
        subtitle="Operations"
        items={adminNavigation}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          user={{
            name: admin.full_name,
            email: admin.email,
            actorType: "admin",
          }}
          onLogout={logout}
          showBreadcrumbs={false}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
