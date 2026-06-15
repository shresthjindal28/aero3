import type {
  MemoryDocument,
  MemoryProfile,
  ParsedMemoryProfile,
} from "@/features/memory/types/memory.types";

const PLACEHOLDER_PATTERNS = [
  /^not documented/i,
  /^none$/i,
  /^n\/a$/i,
  /^unknown$/i,
  /^—$/,
  /^-$/,
];

export function isMeaningfulClinicalValue(value: string): boolean {
  const trimmed = value.trim().replace(/\.$/, "");
  if (!trimmed) return false;
  return !PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function normalizeClinicalList(items: unknown): string[] {
  if (!Array.isArray(items)) return [];

  const normalized = items
    .map((item) => String(item).trim().replace(/\.$/, ""))
    .filter(isMeaningfulClinicalValue);

  return [...new Set(normalized)];
}

function formatProfileDate(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function parseMemoryProfileSummary(
  summary: string | null | undefined,
): ParsedMemoryProfile {
  const empty: ParsedMemoryProfile = {
    conditions: [],
    symptoms: [],
    medications: [],
    diagnoses: [],
    recommendations: [],
    mostRecentConsultationDate: null,
    narrativeSummary: null,
    hasStructuredData: false,
  };

  if (!summary?.trim()) return empty;

  try {
    const data = JSON.parse(summary) as Record<string, unknown>;
    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      const conditions = normalizeClinicalList(data.conditions);
      const symptoms = normalizeClinicalList(data.symptoms);
      const medications = normalizeClinicalList(data.medications);
      const diagnoses = normalizeClinicalList(data.diagnoses);
      const recommendations = normalizeClinicalList(data.recommendations);

      return {
        conditions,
        symptoms,
        medications,
        diagnoses,
        recommendations,
        mostRecentConsultationDate: formatProfileDate(
          data.most_recent_consultation_date,
        ),
        narrativeSummary: null,
        hasStructuredData:
          conditions.length +
            symptoms.length +
            medications.length +
            diagnoses.length +
            recommendations.length >
          0,
      };
    }
  } catch {
    // Fall through to narrative parsing.
  }

  const lines = summary
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(isMeaningfulClinicalValue);

  return {
    ...empty,
    recommendations: lines,
    narrativeSummary: summary.trim(),
    hasStructuredData: lines.length > 0,
  };
}

export function splitDelimitedPatientField(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return [
    ...new Set(
      value
        .split(/[,;]/)
        .map((part) => part.trim())
        .filter(isMeaningfulClinicalValue),
    ),
  ];
}

export function formatSourceType(sourceType: MemoryDocument["source_type"]): string {
  const labels: Record<MemoryDocument["source_type"], string> = {
    transcript: "Visit transcript",
    soap_note: "SOAP note",
    consultation_document: "Consultation document",
    clinical_summary: "Clinical summary",
    doctor_note: "Doctor note",
  };
  return labels[sourceType] ?? sourceType;
}

export function formatScore(score: number): string {
  return `${Math.round(score * 100)}% match`;
}

export function buildMemoryTimeline(documents: MemoryDocument[]) {
  return [...documents]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((doc) => ({
      id: doc.id,
      title: doc.title,
      sourceType: doc.source_type,
      createdAt: doc.created_at,
      consultationId: doc.consultation_id,
    }));
}

export function hasPatientMemory(
  profile: MemoryProfile | undefined,
  documents: MemoryDocument[] | undefined,
): boolean {
  const parsed = parseMemoryProfileSummary(profile?.summary);
  const hasSummary = parsed.hasStructuredData || Boolean(parsed.narrativeSummary?.trim());
  const hasDocuments = (documents?.length ?? 0) > 0;
  return hasSummary || hasDocuments;
}

export function countProfileInsights(profile: ParsedMemoryProfile): number {
  return (
    profile.conditions.length +
    profile.symptoms.length +
    profile.medications.length +
    profile.diagnoses.length +
    profile.recommendations.length
  );
}
