"use client";

import { useState } from "react";
import { Bot, Search, UserRound } from "lucide-react";

import { usePatient } from "@/features/patients/hooks/use-patient";
import {
  calculateAge,
  formatGender,
} from "@/features/patients/utils/patient.utils";
import { EmptyMemoryState } from "@/features/memory/components/empty-memory-state";
import { MemoryDocumentExplorer } from "@/features/memory/components/memory-document-explorer";
import { MemoryProfileOverview } from "@/features/memory/components/memory-profile-overview";
import { MemoryRetrievalHistory } from "@/features/memory/components/memory-retrieval-history";
import { MemorySearchResults } from "@/features/memory/components/memory-search-results";
import { MemoryTimeline } from "@/features/memory/components/memory-timeline";
import { useMemoryDocuments } from "@/features/memory/hooks/use-memory-documents";
import { useMemoryProfile } from "@/features/memory/hooks/use-memory-profile";
import { useMemorySearch } from "@/features/memory/hooks/use-memory-search";
import {
  EMPTY_MEMORY_HISTORY,
  useMemoryRetrievalStore,
} from "@/features/memory/store/memory-retrieval.store";
import {
  buildMemoryTimeline,
  hasPatientMemory,
} from "@/features/memory/utils/memory.utils";
import { AiAssistantDrawer } from "@/features/soap/components/ai-assistant-drawer";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { ShellSkeletonLoader } from "@/shared/ui/feedback/skeleton-loader";
import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";

type MemoryWorkspaceProps = {
  patientId: string;
};

function toDoctorFriendlyLoadError(error: Error): Error {
  if (error.message.includes("Maximum update depth exceeded")) {
    return new Error(
      "We had trouble loading this page. Please refresh and try again.",
    );
  }

  return new Error(
    "We could not load this patient's memory right now. Please check your connection and try again.",
  );
}

export function MemoryWorkspace({ patientId }: MemoryWorkspaceProps) {
  const [query, setQuery] = useState("");
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [results, setResults] = useState<
    import("@/features/memory/types/memory.types").MemorySearchResponse | undefined
  >();

  const { data: patient, isLoading: patientLoading } = usePatient(patientId);
  const profileQuery = useMemoryProfile(patientId);
  const documentsQuery = useMemoryDocuments(patientId);
  const searchMutation = useMemorySearch();
  const addRecord = useMemoryRetrievalStore((s) => s.addRecord);
  const retrievalHistory = useMemoryRetrievalStore(
    (s) => s.history[patientId] ?? EMPTY_MEMORY_HISTORY,
  );

  const documents = documentsQuery.data ?? [];
  const timeline = buildMemoryTimeline(documents);
  const memoryLoading = profileQuery.isLoading || documentsQuery.isLoading;
  const memoryLoadFailed = profileQuery.isError || documentsQuery.isError;
  const loadError = profileQuery.error ?? documentsQuery.error;
  const noMemoryYet =
    !memoryLoading &&
    !memoryLoadFailed &&
    !hasPatientMemory(profileQuery.data, documents);

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const response = await searchMutation.mutateAsync({
      patient_id: patientId,
      query: trimmed,
      top_k: 10,
    });

    setResults(response);
    addRecord(patientId, {
      id: crypto.randomUUID(),
      query: trimmed,
      resultCount: response.results.length,
      topScore: response.results[0]?.score ?? null,
      searchedAt: new Date().toISOString(),
    });
  };

  const retryMemoryLoad = () => {
    void profileQuery.refetch();
    void documentsQuery.refetch();
  };

  if (patientLoading) {
    return <ShellSkeletonLoader />;
  }

  if (!patient) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <ApiErrorDisplay
          error={new Error("This patient record could not be found.")}
          title="Patient not found"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <header className="shrink-0 border-b border-border/60 bg-background px-3 py-3 lg:px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Chart summary
            </p>
            <h1 className="text-xl font-semibold tracking-tight lg:text-2xl">
              {patient.full_name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="h-4 w-4" />
                {formatGender(patient.gender)}
                {patient.date_of_birth
                  ? ` · ${calculateAge(patient.date_of_birth)}`
                  : ""}
              </span>
              {patient.blood_group ? (
                <span className="rounded-full border border-border/60 px-2 py-0.5 text-xs">
                  {patient.blood_group}
                </span>
              ) : null}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setAiAssistantOpen(true)}
          >
            <Bot className="h-4 w-4" />
            AI Assistant
          </Button>
        </div>
      </header>

      {memoryLoadFailed ? (
        <div className="p-4 lg:p-6">
          <ApiErrorDisplay
            error={toDoctorFriendlyLoadError(
              loadError instanceof Error ? loadError : new Error("Unknown error"),
            )}
            onRetry={retryMemoryLoad}
            title="Unable to load memory"
          />
        </div>
      ) : null}

      {!memoryLoadFailed && noMemoryYet ? (
        <div className="flex flex-1 items-center justify-center p-4 lg:p-6">
          <EmptyMemoryState patientId={patientId} patientName={patient.full_name} />
        </div>
      ) : null}

      {!memoryLoadFailed && !noMemoryYet ? (
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="min-h-0 space-y-3 overflow-y-auto border-b border-border/60 p-3 lg:w-80 lg:shrink-0 lg:border-b-0 lg:border-r xl:w-96">
            <MemoryProfileOverview
              profile={profileQuery.data}
              patient={patient}
              isLoading={profileQuery.isLoading}
            />

            <section className="rounded-xl border border-border/60 bg-card p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Search chart summary</h2>
              </div>

              <div className="mt-3 flex flex-col gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleSearch();
                  }}
                  placeholder="Medications, allergies, last visit…"
                  aria-label="Search chart summary"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void handleSearch()}
                  disabled={searchMutation.isPending || !query.trim()}
                >
                  {searchMutation.isPending ? "Searching…" : "Search"}
                </Button>
              </div>

              <div className="mt-3 rounded-lg border border-border/50 bg-muted/10 p-3">
                <MemorySearchResults
                  results={results?.results ?? []}
                  query={query}
                  isSearching={searchMutation.isPending}
                />
              </div>
            </section>

            <MemoryTimeline items={timeline} isLoading={documentsQuery.isLoading} />
            <MemoryRetrievalHistory records={retrievalHistory} />
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col p-2 lg:p-3">
            <MemoryDocumentExplorer
              documents={documents}
              isLoading={documentsQuery.isLoading}
            />
          </div>
        </div>
      ) : null}

      <AiAssistantDrawer
        open={aiAssistantOpen}
        onOpenChange={setAiAssistantOpen}
        patientId={patientId}
      />
    </div>
  );
}
