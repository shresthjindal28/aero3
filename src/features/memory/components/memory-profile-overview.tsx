import {
  Activity,
  Brain,
  ClipboardList,
  Lightbulb,
  Pill,
  Stethoscope,
} from "lucide-react";

import { MemorySectionCard } from "@/features/memory/components/memory-section-card";
import type { MemoryProfile, ParsedMemoryProfile } from "@/features/memory/types/memory.types";
import {
  countProfileInsights,
  parseMemoryProfileSummary,
  splitDelimitedPatientField,
} from "@/features/memory/utils/memory.utils";
import type { Patient } from "@/features/patients/types/patient.types";
import { formatDateTime } from "@/lib/utils/date";

type MemoryProfileOverviewProps = {
  profile: MemoryProfile | undefined;
  patient: Patient;
  isLoading: boolean;
};

function mergeUniqueLists(...lists: string[][]): string[] {
  return [...new Set(lists.flat())];
}

function buildOverview(
  profile: MemoryProfile | undefined,
  patient: Patient,
): ParsedMemoryProfile & {
  allergies: string[];
  patientMedications: string[];
} {
  const parsed = parseMemoryProfileSummary(profile?.summary);
  const allergies = splitDelimitedPatientField(patient.allergies);
  const patientMedications = splitDelimitedPatientField(patient.current_medications);

  return {
    ...parsed,
    medications: mergeUniqueLists(parsed.medications, patientMedications),
    allergies,
    patientMedications,
  };
}

export function MemoryProfileOverview({
  profile,
  patient,
  isLoading,
}: MemoryProfileOverviewProps) {
  if (isLoading) {
    return (
      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Loading chart summary…</p>
      </section>
    );
  }

  const overview = buildOverview(profile, patient);
  const insightCount = countProfileInsights(overview) + overview.allergies.length;

  if (!overview.hasStructuredData && !overview.narrativeSummary) {
    return (
      <section className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Brain className="h-5 w-5 text-muted-foreground" />
        </div>
        <h2 className="mt-4 text-base font-semibold">Chart summary building</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Aevomed will organize conditions, symptoms, medications, and visit notes
          here after you document consultations.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
          <Brain className="h-3.5 w-3.5" />
          Clinical memory overview
        </div>

        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex items-baseline justify-between gap-3 border-b border-border/40 pb-2">
            <dt className="text-muted-foreground">Insights</dt>
            <dd className="font-semibold tabular-nums">{insightCount}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-border/40 pb-2">
            <dt className="shrink-0 text-muted-foreground">Last visit</dt>
            <dd className="text-right font-medium leading-snug">
              {overview.mostRecentConsultationDate ?? "Not recorded"}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">Updated</dt>
            <dd className="text-right font-medium leading-snug">
              {profile?.last_updated_at
                ? formatDateTime(profile.last_updated_at)
                : "Recently"}
            </dd>
          </div>
        </dl>

        {overview.narrativeSummary && !overview.hasStructuredData ? (
          <p className="mt-3 rounded-lg border border-border/50 bg-muted/15 p-3 text-sm leading-relaxed text-foreground/90">
            {overview.narrativeSummary}
          </p>
        ) : null}
      </section>

      {overview.allergies.length > 0 ? (
        <MemorySectionCard
          title="Allergies"
          icon={Activity}
          items={overview.allergies}
          emptyLabel="No allergies recorded."
          accent="rose"
        />
      ) : null}

      <div className="space-y-3">
        <MemorySectionCard
          title="Active conditions"
          icon={Activity}
          items={overview.conditions}
          emptyLabel="No active conditions recorded yet."
          accent="teal"
        />
        <MemorySectionCard
          title="Recent symptoms"
          icon={Stethoscope}
          items={overview.symptoms}
          emptyLabel="No recent symptoms captured."
          accent="amber"
        />
        <MemorySectionCard
          title="Medications"
          icon={Pill}
          items={overview.medications}
          emptyLabel="No medications on record yet."
          accent="blue"
        />
        <MemorySectionCard
          title="Diagnoses"
          icon={ClipboardList}
          items={overview.diagnoses}
          emptyLabel="No diagnoses documented yet."
          accent="violet"
        />
        <MemorySectionCard
          title="Care recommendations"
          icon={Lightbulb}
          items={overview.recommendations}
          emptyLabel="No recommendations recorded yet."
          accent="teal"
        />
      </div>
    </div>
  );
}
