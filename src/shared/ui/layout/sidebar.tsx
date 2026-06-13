"use client";

import type { NavItem } from "@/config/navigation.config";
import { cn } from "@/lib/utils/cn";
import { StorageAvatar } from "@/shared/ui/primitives/storage-avatar";
import { SidebarFooterNav, SidebarNav } from "@/shared/ui/layout/sidebar-nav";

type SidebarUser = {
  name: string;
  email: string;
  avatarUrl?: string | null;
};

type SidebarProps = {
  brand?: string;
  subtitle?: string;
  user?: SidebarUser;
  items: NavItem[];
  footerItems?: NavItem[];
  collapsed?: boolean;
  className?: string;
  onNavigate?: () => void;
};

export function Sidebar({
  brand,
  subtitle,
  user,
  items,
  footerItems,
  collapsed = false,
  className,
  onNavigate,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col overflow-hidden border-r bg-card/50",
        collapsed ? "w-[72px]" : "w-64",
        className,
      )}
    >
      <div className={cn("shrink-0 border-b px-4 py-5", collapsed && "px-3")}>
        {user ? (
          <div className="flex items-center gap-3">
            <StorageAvatar name={user.name} imageRef={user.avatarUrl} />
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight">
                  {user.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
              A
            </div>
            {!collapsed ? (
              <div>
                <p className="text-sm font-semibold tracking-tight">{brand}</p>
                {subtitle ? (
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </div>
      <SidebarNav items={items} collapsed={collapsed} onNavigate={onNavigate} />
      {footerItems?.length ? (
        <SidebarFooterNav
          items={footerItems}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      ) : null}
    </aside>
  );
}
