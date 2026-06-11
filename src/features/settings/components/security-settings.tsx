"use client";

import { Monitor, Shield } from "lucide-react";

import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";
import { Label } from "@/shared/ui/primitives/label";

const placeholderSessions = [
  { id: "1", device: "MacBook Pro — Chrome", lastActive: "Active now", current: true },
  { id: "2", device: "iPhone — Safari", lastActive: "2 days ago", current: false },
];

const placeholderLogins = [
  { id: "1", at: "Today, 9:14 AM", ip: "192.168.1.1", success: true },
  { id: "2", at: "Yesterday, 6:02 PM", ip: "192.168.1.1", success: true },
];

export function SecuritySettings() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border/60 bg-card/50 p-6">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <h2 className="text-base font-semibold">Change password</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Password change API is not yet available. Form is ready for backend integration.
        </p>
        <div className="mt-6 grid max-w-md gap-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input id="current-password" type="password" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input id="new-password" type="password" disabled />
          </div>
          <Button type="button" disabled>
            Update password
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-border/60 bg-card/50 p-6">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          <h2 className="text-base font-semibold">Active sessions</h2>
        </div>
        <ul className="mt-4 space-y-2">
          {placeholderSessions.map((session) => (
            <li
              key={session.id}
              className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2 text-sm"
            >
              <span>{session.device}</span>
              <span className="text-muted-foreground">
                {session.current ? "Current session" : session.lastActive}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-border/60 bg-card/50 p-6">
        <h2 className="text-base font-semibold">Login history</h2>
        <ul className="mt-4 space-y-2">
          {placeholderLogins.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2 text-sm"
            >
              <span>{entry.at}</span>
              <span className="text-muted-foreground">{entry.ip}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
