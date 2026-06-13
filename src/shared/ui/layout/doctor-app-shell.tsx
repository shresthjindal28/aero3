"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { doctorNavigation } from "@/config/navigation.config";
import { appConfig } from "@/config/app.config";
import { useDoctorLogout, useDoctorMe } from "@/features/auth/hooks/use-doctor-auth";
import { useAppBreadcrumbs } from "@/shared/hooks/use-app-breadcrumbs";
import { useShellStore } from "@/shared/store/shell.store";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { ShellSkeletonLoader } from "@/shared/ui/feedback/skeleton-loader";
import { AppHeader } from "@/shared/ui/layout/app-header";
import { MobileSidebarDrawer } from "@/shared/ui/layout/mobile-sidebar-drawer";
import { Sidebar } from "@/shared/ui/layout/sidebar";
import { CommandPalette } from "@/shared/search/command-palette";
import { useCommandPalette } from "@/shared/search/use-command-palette";

type DoctorAppShellProps = {
  children: React.ReactNode;
};

function isClinicalWorkspace(pathname: string): boolean {
  return (
    pathname.endsWith("/prescription") ||
    pathname.endsWith("/soap") ||
    /^\/sessions\/[^/]+/.test(pathname) ||
    /^\/prescriptions\/[^/]+$/.test(pathname)
  );
}

function isImmersiveWorkspace(pathname: string): boolean {
  return (
    pathname.endsWith("/prescription") ||
    /^\/prescriptions\/[^/]+$/.test(pathname)
  );
}

export function DoctorAppShell({ children }: DoctorAppShellProps) {
  const pathname = usePathname();
  const breadcrumbs = useAppBreadcrumbs();
  const logout = useDoctorLogout();
  const { sidebarCollapsed, setSidebarCollapsed } = useShellStore();
  const immersive = isImmersiveWorkspace(pathname);
  const { data: doctor, isLoading, isError, error, refetch } = useDoctorMe(true);
  const commandPalette = useCommandPalette();

  useEffect(() => {
    if (immersive) {
      setSidebarCollapsed(true);
    }
  }, [immersive, setSidebarCollapsed]);

  if (isLoading) {
    return <ShellSkeletonLoader />;
  }

  if (isError || !doctor) {
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
    <div className="flex min-h-screen w-full bg-background">
      {!immersive ? (
        <div className="hidden md:flex">
          <Sidebar
            brand={appConfig.name}
            subtitle="Clinical Workspace"
            items={doctorNavigation}
            collapsed={sidebarCollapsed}
          />
        </div>
      ) : null}

      {!immersive ? (
        <MobileSidebarDrawer
          brand={appConfig.name}
          subtitle="Clinical Workspace"
          items={doctorNavigation}
        />
      ) : null}

      <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
        {!immersive ? (
          <AppHeader
            breadcrumbs={breadcrumbs}
            showBreadcrumbs={!isClinicalWorkspace(pathname)}
            user={{
              name: doctor.full_name,
              email: doctor.email,
              avatarUrl: doctor.profile_picture_url,
              actorType: "doctor",
            }}
            onLogout={logout}
            onSearchClick={commandPalette.openPalette}
          />
        ) : null}
        <main
          className={
            isClinicalWorkspace(pathname)
              ? immersive
                ? "h-dvh min-h-0 overflow-hidden"
                : "min-h-0 flex-1 overflow-hidden"
              : "flex-1"
          }
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
      <CommandPalette open={commandPalette.open} onClose={commandPalette.closePalette} />
    </div>
  );
}
