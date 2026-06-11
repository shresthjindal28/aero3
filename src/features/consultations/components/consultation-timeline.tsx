"use client";

import Link from "next/link";

import type { TimelineEvent } from "@/features/consultations/types/consultation.types";
import { groupTimelineByDate } from "@/features/consultations/utils/consultation.utils";
import { formatDateTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { Skeleton } from "@/shared/ui/primitives/skeleton";

type ConsultationTimelineProps = {
  events: TimelineEvent[];
  isLoading?: boolean;
};

const eventStyles: Record<TimelineEvent["type"], string> = {
  patient_created: "bg-primary",
  consultation_created: "bg-blue-500",
  consultation_completed: "bg-emerald-500",
  consultation_cancelled: "bg-destructive",
  soap_approved: "bg-violet-500",
  transcript_generated: "bg-amber-500",
  memory_updated: "bg-cyan-500",
};

export function ConsultationTimeline({ events, isLoading = false }: ConsultationTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        No timeline events yet.
      </div>
    );
  }

  const grouped = groupTimelineByDate(events);

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([dateLabel, dateEvents]) => (
        <section key={dateLabel} className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">{dateLabel}</h3>
          <div className="space-y-4 border-l border-border pl-4">
            {dateEvents.map((event) => {
              const content = (
                <div className="relative rounded-lg border bg-card p-4 shadow-sm">
                  <span
                    className={cn(
                      "absolute -left-[21px] top-5 h-2.5 w-2.5 rounded-full ring-4 ring-background",
                      eventStyles[event.type],
                    )}
                  />
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      {event.description ? (
                        <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                      ) : null}
                    </div>
                    <time className="shrink-0 text-xs text-muted-foreground">
                      {formatDateTime(event.timestamp)}
                    </time>
                  </div>
                </div>
              );

              if (event.href) {
                return (
                  <Link key={event.id} href={event.href} className="block transition-opacity hover:opacity-90">
                    {content}
                  </Link>
                );
              }

              return <div key={event.id}>{content}</div>;
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
