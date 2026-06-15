"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { usePatient } from "@/features/patients/hooks/use-patient";
import { EmptyMemoryState } from "@/features/memory/components/empty-memory-state";
import { MemoryDocumentExplorer } from "@/features/memory/components/memory-document-explorer";
import { MemoryProfileCard } from "@/features/memory/components/memory-profile-card";
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
import { AiCopilotPanel } from "@/shared/copilot/ai-copilot-panel";
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
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background">
      <header className="border-b border-border/60 bg-card/40 px-6 py-4 backdrop-blur">
        <p className="text-sm text-muted-foreground">Chart summary</p>
        <h1 className="text-2xl font-semibold tracking-tight">{patient.full_name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A living summary of what Aevomed remembers from this patient&apos;s care
        </p>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 lg:p-6">
          {memoryLoadFailed ? (
            <ApiErrorDisplay
              error={toDoctorFriendlyLoadError(
                loadError instanceof Error ? loadError : new Error("Unknown error"),
              )}
              onRetry={retryMemoryLoad}
              title="Unable to load memory"
            />
          ) : null}

          {!memoryLoadFailed && noMemoryYet ? (
            <EmptyMemoryState patientId={patientId} patientName={patient.full_name} />
          ) : null}

          {!memoryLoadFailed ? (
            <>
              {noMemoryYet ? null : (
                <MemoryProfileCard
                  profile={profileQuery.data}
                  isLoading={profileQuery.isLoading}
                />
              )}

              <section className="rounded-xl border border-border/60 bg-card/50 p-4">
                <h2 className="text-sm font-medium">Search chart summary</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Find past notes, summaries, and visit details in plain language.
                </p>
                <div className="mt-3 flex gap-2">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void handleSearch();
                      }}
                      placeholder="e.g. medications, allergies, last visit…"
                      className="pl-9"
                      aria-label="Search chart summary"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => void handleSearch()}
                    disabled={searchMutation.isPending || !query.trim()}
                  >
                    Search
                  </Button>
                </div>
                <div className="mt-4">
                  <MemorySearchResults
                    results={results?.results ?? []}
                    query={query}
                    isSearching={searchMutation.isPending}
                  />
                </div>
              </section>

              {noMemoryYet ? null : (
                <>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <MemoryTimeline items={timeline} isLoading={documentsQuery.isLoading} />
                    <MemoryRetrievalHistory records={retrievalHistory} />
                  </div>

                  <MemoryDocumentExplorer
                    documents={documents}
                    isLoading={documentsQuery.isLoading}
                  />
                </>
              )}
            </>
          ) : null}
        </div>

        <AiCopilotPanel patientId={patientId} />
      </div>
    </div>
  );
}
