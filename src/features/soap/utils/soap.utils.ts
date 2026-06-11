import type {
  SoapDraft,
  SoapNote,
  SoapSectionKey,
} from "@/features/soap/types/soap.types";

export const SOAP_SECTIONS: Array<{
  key: SoapSectionKey;
  label: string;
  description: string;
}> = [
  {
    key: "subjective",
    label: "Subjective",
    description: "Patient-reported symptoms and history",
  },
  {
    key: "objective",
    label: "Objective",
    description: "Observable findings and measurements",
  },
  {
    key: "assessment",
    label: "Assessment",
    description: "Clinical impression and diagnosis",
  },
  {
    key: "plan",
    label: "Plan",
    description: "Treatment plan and follow-up",
  },
];

export function soapNoteToDraft(soap: SoapNote): SoapDraft {
  return {
    subjective: soap.subjective ?? "",
    objective: soap.objective ?? "",
    assessment: soap.assessment ?? "",
    plan: soap.plan ?? "",
  };
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function countTotalWords(draft: SoapDraft): number {
  return SOAP_SECTIONS.reduce(
    (total, section) => total + countWords(draft[section.key]),
    0,
  );
}

export function draftsEqual(a: SoapDraft, b: SoapDraft): boolean {
  return SOAP_SECTIONS.every((section) => a[section.key] === b[section.key]);
}

export function draftToUpdateInput(draft: SoapDraft) {
  return {
    subjective: draft.subjective || null,
    objective: draft.objective || null,
    assessment: draft.assessment || null,
    plan: draft.plan || null,
  };
}
