"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Brain,
  FileText,
  Mic,
  Search,
  Stethoscope,
  Users,
} from "lucide-react";

import { consultationQueries } from "@/features/consultations/queries/consultation-queries";
import { patientQueries } from "@/features/patients/queries/patient-queries";
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
  const debouncedQuery = useDebouncedValue(query, 150);
  const [activeIndex, setActiveIndex] = useState(0);

  const patientsQuery = useQuery({
    ...patientQueries.list(),
    enabled: open,
    staleTime: 3 * 60_000,
  });

  const consultationsQuery = useQuery({
    ...consultationQueries.list(),
    enabled: open,
    staleTime: 3 * 60_000,
  });

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  const visibleResults = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return [];

    const patients = patientsQuery.data ?? [];
    const consultations = consultationsQuery.data ?? [];

    const patientResults: SearchResult[] = patients
      .filter((patient) => patient.full_name.toLowerCase().includes(q))
      .slice(0, 5)
      .map((patient) => ({
        id: patient.id,
        label: patient.full_name,
        subtitle: "Patient",
        href: routes.app.patientDetail(patient.id),
        type: "patient",
      }));

    const consultationResults: SearchResult[] = consultations
      .filter((consultation) => (consultation.chief_complaint ?? "").toLowerCase().includes(q))
      .slice(0, 5)
      .map((consultation) => ({
        id: consultation.id,
        label: consultation.chief_complaint ?? "Visit",
        subtitle: "Visit",
        href: routes.app.consultationDetail(consultation.id),
        type: "consultation",
      }));

    const soapResults: SearchResult[] = consultations
      .filter((consultation) => (consultation.chief_complaint ?? "").toLowerCase().includes(q))
      .slice(0, 3)
      .map((consultation) => ({
        id: `${consultation.id}-soap`,
        label: `Note — ${consultation.chief_complaint ?? "Visit"}`,
        subtitle: "Clinical note",
        href: routes.app.consultationSoap(consultation.id),
        type: "soap",
      }));

    const memoryResults: SearchResult[] = patients
      .filter((patient) => patient.full_name.toLowerCase().includes(q))
      .slice(0, 3)
      .map((patient) => ({
        id: `${patient.id}-memory`,
        label: `Chart summary — ${patient.full_name}`,
        subtitle: "Patient chart",
        href: routes.app.patientMemory(patient.id),
        type: "memory",
      }));

    return [...patientResults, ...consultationResults, ...soapResults, ...memoryResults].slice(
      0,
      12,
    );
  }, [consultationsQuery.data, debouncedQuery, patientsQuery.data]);

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery]);

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
      aria-label="Patient and visit search"
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
            placeholder="Find a patient or visit…"
            className="border-0 bg-transparent pl-11 shadow-none focus-visible:ring-0"
            aria-label="Search patients and visits"
          />
        </div>

        <ul className="max-h-80 overflow-y-auto p-2" role="listbox">
          {visibleResults.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              {query ? "No results" : "Type a patient name or visit reason"}
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
                        <p className="text-xs text-muted-foreground">{result.subtitle}</p>
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
