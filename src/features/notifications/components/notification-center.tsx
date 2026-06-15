"use client";

import Link from "next/link";

import { useNotificationStore } from "@/features/notifications/store/notification.store";
import { formatDateTime } from "@/lib/utils/date";
import { Button } from "@/shared/ui/primitives/button";

export function NotificationCenter() {
  const items = useNotificationStore((s) => s.items);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            AI jobs, verification, transcripts, and SOAP updates
          </p>
        </div>
        {items.some((n) => !n.read) ? (
          <Button type="button" variant="outline" size="sm" onClick={markAllRead}>
            Mark all read
          </Button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
          No notifications yet. You&apos;ll see updates here as Aevomed processes your
          clinical workflow.
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-border/60 bg-card/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDateTime(item.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!item.read ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => markRead(item.id)}
                    >
                      Mark read
                    </Button>
                  ) : null}
                  {item.href ? (
                    <Button type="button" variant="outline" size="sm" asChild>
                      <Link href={item.href}>View</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
