"use client";

import type { NavItem } from "@/config/navigation.config";
import { cn } from "@/lib/utils/cn";
import { SidebarNav } from "@/shared/ui/layout/sidebar-nav";

type SidebarProps = {
  brand: string;
  subtitle?: string;
  items: NavItem[];
  collapsed?: boolean;
  className?: string;
  onNavigate?: () => void;
};

export function Sidebar({
  brand,
  subtitle,
  items,
  collapsed = false,
  className,
  onNavigate,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-card/50",
        collapsed ? "w-[72px]" : "w-64",
        className,
      )}
    >
      <div className={cn("border-b px-4 py-5", collapsed && "px-3")}>
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
      </div>
      <SidebarNav items={items} collapsed={collapsed} onNavigate={onNavigate} />
    </aside>
  );
}
