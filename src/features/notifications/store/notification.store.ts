import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { NotificationItem } from "@/features/notifications/types/notification.types";

type NotificationState = {
  items: NotificationItem[];
  add: (item: Omit<NotificationItem, "id" | "read" | "createdAt">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: () => number;
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        set((state) => ({
          items: [
            {
              ...item,
              id: crypto.randomUUID(),
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...state.items,
          ].slice(0, 100),
        }));
      },
      markRead: (id) => {
        set((state) => ({
          items: state.items.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        }));
      },
      markAllRead: () => {
        set((state) => ({
          items: state.items.map((n) => ({ ...n, read: true })),
        }));
      },
      unreadCount: () => get().items.filter((n) => !n.read).length,
    }),
    { name: "airo-notifications" },
  ),
);
