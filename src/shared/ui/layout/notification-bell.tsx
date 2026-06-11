"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

import { useNotificationStore } from "@/features/notifications/store/notification.store";
import { routes } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/primitives/dropdown-menu";

export function NotificationBell() {
  const items = useNotificationStore((s) => s.items);
  const unreadCount = useNotificationStore((s) => s.unreadCount());
  const markRead = useNotificationStore((s) => s.markRead);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <span className="relative">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <DropdownMenuItem disabled>No notifications</DropdownMenuItem>
        ) : (
          items.slice(0, 5).map((item) => (
            <DropdownMenuItem
              key={item.id}
              className="flex flex-col items-start gap-1"
              onClick={() => markRead(item.id)}
              asChild={Boolean(item.href)}
            >
              {item.href ? (
                <Link href={item.href}>
                  <span className="font-medium">{item.title}</span>
                  <span className="text-xs text-muted-foreground">{item.message}</span>
                </Link>
              ) : (
                <>
                  <span className="font-medium">{item.title}</span>
                  <span className="text-xs text-muted-foreground">{item.message}</span>
                </>
              )}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={routes.app.notifications}>View all</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
