"use client";

import type { NavItem } from "@/config/navigation.config";
import { useShellStore } from "@/shared/store/shell.store";
import { Sidebar } from "@/shared/ui/layout/sidebar";
import { Sheet, SheetContent } from "@/shared/ui/primitives/sheet";

type MobileSidebarDrawerProps = {
  brand?: string;
  subtitle?: string;
  user?: {
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  items: NavItem[];
  footerItems?: NavItem[];
};

export function MobileSidebarDrawer({
  brand,
  subtitle,
  user,
  items,
  footerItems,
}: MobileSidebarDrawerProps) {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useShellStore();

  return (
    <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
      <SheetContent side="left" className="w-72 p-0">
        <Sidebar
          brand={brand}
          subtitle={subtitle}
          user={user}
          items={items}
          footerItems={footerItems}
          onNavigate={() => setMobileSidebarOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
