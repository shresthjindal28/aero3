import { Brain } from "lucide-react";

import type { MemoryProfile } from "@/features/memory/types/memory.types";
import { formatDateTime } from "@/lib/utils/date";

type MemoryProfileCardProps = {
  profile: MemoryProfile | undefined;
  isLoading: boolean;
};

export function MemoryProfileCard({ profile, isLoading }: MemoryProfileCardProps) {
  return (
    <section className="rounded-xl border border-border/60 bg-card/50 p-5">
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-medium">Patient memory profile</h2>
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading profile…</p>
      ) : profile ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm leading-relaxed text-foreground/90">
            {profile.summary || "No memory profile generated yet."}
          </p>
          {profile.last_updated_at ? (
            <p className="text-xs text-muted-foreground">
              Last updated {formatDateTime(profile.last_updated_at)}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Memory profile will appear after consultations are processed.
        </p>
      )}
    </section>
  );
}
