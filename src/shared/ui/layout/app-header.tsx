"use client";

import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { useShellStore } from "@/shared/store/shell.store";
import { SearchBox } from "@/shared/ui/inputs/search-box";
import { BreadcrumbNav } from "@/shared/ui/layout/breadcrumb-nav";
import { NotificationBell } from "@/shared/ui/layout/notification-bell";
import { ThemeToggle } from "@/shared/ui/layout/theme-toggle";
import { UserMenu } from "@/shared/ui/layout/user-menu";
import { Button } from "@/shared/ui/primitives/button";
import type { BreadcrumbSegment } from "@/config/breadcrumbs.config";

type AppHeaderProps = {
  breadcrumbs?: BreadcrumbSegment[];
  user: {
    name: string;
    email: string;
    avatarUrl?: string | null;
    actorType: "doctor" | "admin";
  };
  onLogout: () => void;
  onSearchClick?: () => void;
  showBreadcrumbs?: boolean;
  showThemeToggle?: boolean;
  searchPlaceholder?: string;
  className?: string;
};

export function AppHeader({
  breadcrumbs = [],
  user,
  onLogout,
  onSearchClick,
  showBreadcrumbs = true,
  showThemeToggle = true,
  searchPlaceholder = "Find patient or visit… ⌘K",
  className,
}: AppHeaderProps) {
  const { sidebarCollapsed, toggleSidebar, setMobileSidebarOpen } = useShellStore();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-14 items-center gap-3 overflow-hidden border-b bg-background/80 px-4 backdrop-blur md:px-6",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="hidden md:inline-flex"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {sidebarCollapsed ? (
          <PanelLeftOpen className="h-4 w-4" />
        ) : (
          <PanelLeftClose className="h-4 w-4" />
        )}
      </Button>

      {showBreadcrumbs ? (
        <div className="hidden min-w-0 flex-1 overflow-hidden md:block">
          <BreadcrumbNav items={breadcrumbs} />
        </div>
      ) : (
        <div className="min-w-0 flex-1" />
      )}

      <SearchBox
        className="hidden shrink-0 lg:flex"
        placeholder={searchPlaceholder}
        onClick={onSearchClick}
      />

      <div className="flex shrink-0 items-center gap-1">
        <NotificationBell />
        {showThemeToggle ? <ThemeToggle /> : null}
        <UserMenu
          name={user.name}
          email={user.email}
          avatarUrl={user.avatarUrl}
          actorType={user.actorType}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
}
