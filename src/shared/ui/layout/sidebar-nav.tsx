"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import type { NavItem } from "@/config/navigation.config";
import { prefetchDoctorRoute } from "@/lib/query/route-prefetch";
import { cn } from "@/lib/utils/cn";

type SidebarNavProps = {
  items: NavItem[];
  collapsed?: boolean;
  onNavigate?: () => void;
};

function NavLink({
  item,
  isActive,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      prefetch
      onMouseEnter={() => {
        router.prefetch(item.href);
        prefetchDoctorRoute(queryClient, item.href);
      }}
      onFocus={() => {
        router.prefetch(item.href);
        prefetchDoctorRoute(queryClient, item.href);
      }}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
        item.disabled && "pointer-events-none opacity-50",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed ? <span>{item.label}</span> : null}
    </Link>
  );
}

export function SidebarNav({ items, collapsed = false, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2 py-4">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <NavLink
            key={item.href}
            item={item}
            isActive={isActive}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        );
      })}
    </nav>
  );
}

export function SidebarFooterNav({
  items,
  collapsed = false,
  onNavigate,
}: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="mt-auto shrink-0 flex flex-col gap-1 border-t px-2 py-4">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <NavLink
            key={item.href}
            item={item}
            isActive={isActive}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        );
      })}
    </nav>
  );
}
