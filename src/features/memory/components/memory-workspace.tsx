"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { usePatient } from "@/features/patients/hooks/use-patient";
import { MemoryDocumentExplorer } from "@/features/memory/components/memory-document-explorer";
import { MemoryProfileCard } from "@/features/memory/components/memory-profile-card";
import { MemoryRetrievalHistory } from "@/features/memory/components/memory-retrieval-history";
import { MemorySearchResults } from "@/features/memory/components/memory-search-results";
import { MemoryTimeline } from "@/features/memory/components/memory-timeline";
import { useMemoryDocuments } from "@/features/memory/hooks/use-memory-documents";
import { useMemoryProfile } from "@/features/memory/hooks/use-memory-profile";
import { useMemorySearch } from "@/features/memory/hooks/use-memory-search";
import { useMemoryRetrievalStore } from "@/features/memory/store/memory-retrieval.store";
import { buildMemoryTimeline } from "@/features/memory/utils/memory.utils";
import { AiCopilotPanel } from "@/shared/copilot/ai-copilot-panel";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { ShellSkeletonLoader } from "@/shared/ui/feedback/skeleton-loader";
import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";

type MemoryWorkspaceProps = {
  patientId: string;
};

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
  const retrievalHistory = useMemoryRetrievalStore((s) => s.getHistory(patientId));

  const timeline = buildMemoryTimeline(documentsQuery.data ?? []);

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

  if (patientLoading) {
    return <ShellSkeletonLoader />;
  }

  if (!patient) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <ApiErrorDisplay error={new Error("Patient not found")} />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background">
      <header className="border-b border-border/60 bg-card/40 px-6 py-4 backdrop-blur">
        <p className="text-sm text-muted-foreground">Patient memory</p>
        <h1 className="text-2xl font-semibold tracking-tight">{patient.full_name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything AIRO remembers about this patient
        </p>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 lg:p-6">
          <MemoryProfileCard
            profile={profileQuery.data}
            isLoading={profileQuery.isLoading}
          />

          <section className="rounded-xl border border-border/60 bg-card/50 p-4">
            <h2 className="text-sm font-medium">Vector search</h2>
            <div className="mt-3 flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleSearch();
                  }}
                  placeholder="Search patient memory…"
                  className="pl-9"
                  aria-label="Search patient memory"
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

          <div className="grid gap-4 lg:grid-cols-2">
            <MemoryTimeline items={timeline} isLoading={documentsQuery.isLoading} />
            <MemoryRetrievalHistory records={retrievalHistory} />
          </div>

          <MemoryDocumentExplorer
            documents={documentsQuery.data ?? []}
            isLoading={documentsQuery.isLoading}
          />
        </div>

        <AiCopilotPanel />
      </div>
    </div>
  );
}
