export type MemorySourceType =
  | "transcript"
  | "soap_note"
  | "consultation_document"
  | "clinical_summary"
  | "doctor_note";

export type MemoryProfile = {
  patient_id: string;
  summary: string;
  last_updated_at: string | null;
};

export type MemoryDocument = {
  id: string;
  patient_id: string;
  consultation_id: string | null;
  source_type: MemorySourceType;
  source_id: string | null;
  title: string;
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type MemorySearchResult = {
  document_id: string;
  chunk_id: string;
  source_type: MemorySourceType;
  title: string;
  chunk_text: string;
  score: number;
  consultation_id: string | null;
};

export type MemorySearchRequest = {
  patient_id: string;
  query: string;
  consultation_id?: string;
  top_k?: number;
  source_types?: MemorySourceType[];
};

export type MemorySearchResponse = {
  patient_id: string;
  query: string;
  results: MemorySearchResult[];
};

export type PatientMemoryContext = {
  patient_id: string;
  consultation_id: string | null;
  profile_summary: string | null;
  query: string;
  top_k: number;
  results: MemorySearchResult[];
};

export type MemoryRetrievalRecord = {
  id: string;
  query: string;
  resultCount: number;
  topScore: number | null;
  searchedAt: string;
};

export type ParsedMemoryProfile = {
  conditions: string[];
  symptoms: string[];
  medications: string[];
  diagnoses: string[];
  recommendations: string[];
  mostRecentConsultationDate: string | null;
  narrativeSummary: string | null;
  hasStructuredData: boolean;
};
