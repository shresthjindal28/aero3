"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  FileText,
  Mic,
  Search,
  Stethoscope,
  Users,
} from "lucide-react";

import { listConsultations } from "@/features/consultations/api/consultations.api";
import { listPatients } from "@/features/patients/api/patients.api";
import { routes } from "@/shared/constants/routes";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/shared/ui/primitives/input";

type SearchResult = {
  id: string;
  label: string;
  subtitle?: string;
  href: string;
  type: "patient" | "consultation" | "session" | "soap" | "memory" | "document";
};

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
};

const typeIcons = {
  patient: Users,
  consultation: Stethoscope,
  session: Mic,
  soap: FileText,
  memory: Brain,
  document: FileText,
};

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 200);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const q = debouncedQuery.trim().toLowerCase();

    void (async () => {
      const [patients, consultations] = await Promise.all([
        listPatients(),
        listConsultations(),
      ]);

      const patientResults: SearchResult[] = patients
        .filter((p) => p.full_name.toLowerCase().includes(q))
        .slice(0, 5)
        .map((p) => ({
          id: p.id,
          label: p.full_name,
          subtitle: "Patient",
          href: routes.app.patientDetail(p.id),
          type: "patient",
        }));

      const consultationResults: SearchResult[] = consultations
        .filter((c) => (c.chief_complaint ?? "").toLowerCase().includes(q))
        .slice(0, 5)
        .map((c) => ({
          id: c.id,
          label: c.chief_complaint ?? "Consultation",
          subtitle: "Consultation",
          href: routes.app.consultationDetail(c.id),
          type: "consultation",
        }));

      const soapResults: SearchResult[] = consultations
        .filter((c) => (c.chief_complaint ?? "").toLowerCase().includes(q))
        .slice(0, 3)
        .map((c) => ({
          id: `${c.id}-soap`,
          label: `SOAP — ${c.chief_complaint ?? "Consultation"}`,
          subtitle: "SOAP Note",
          href: routes.app.consultationSoap(c.id),
          type: "soap",
        }));

      const memoryResults: SearchResult[] = patients
        .filter((p) => p.full_name.toLowerCase().includes(q))
        .slice(0, 3)
        .map((p) => ({
          id: `${p.id}-memory`,
          label: `Memory — ${p.full_name}`,
          subtitle: "Patient memory",
          href: routes.app.patientMemory(p.id),
          type: "memory",
        }));

      setResults([
        ...patientResults,
        ...consultationResults,
        ...soapResults,
        ...memoryResults,
      ]);
      setActiveIndex(0);
    })();
  }, [debouncedQuery]);

  const visibleResults = useMemo(() => results.slice(0, 12), [results]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, visibleResults.length - 1));
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }

      if (event.key === "Enter" && visibleResults[activeIndex]) {
        event.preventDefault();
        router.push(visibleResults[activeIndex].href);
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, onClose, open, router, visibleResults]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[15vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-border/60 bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative border-b border-border/60">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients, consultations, SOAP, memory…"
            className="border-0 bg-transparent pl-11 shadow-none focus-visible:ring-0"
            aria-label="Global search"
          />
        </div>

        <ul className="max-h-80 overflow-y-auto p-2" role="listbox">
          {visibleResults.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              {query ? "No results" : "Type to search the workspace"}
            </li>
          ) : (
            visibleResults.map((result, index) => {
              const Icon = typeIcons[result.type];
              return (
                <li key={result.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm",
                      index === activeIndex && "bg-primary/10",
                    )}
                    onClick={() => {
                      router.push(result.href);
                      onClose();
                    }}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{result.label}</p>
                      {result.subtitle ? (
                        <p className="text-xs text-muted-foreground">
                          {result.subtitle}
                        </p>
                      ) : null}
                    </div>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
