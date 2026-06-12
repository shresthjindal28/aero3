export const queryKeys = {
  doctor: {
    me: ["doctor", "me"] as const,
    onboarding: ["doctor", "onboarding"] as const,
    documents: ["doctor", "documents"] as const,
  },
  admin: {
    me: ["admin", "me"] as const,
    doctors: ["admin", "doctors"] as const,
    doctorsPending: ["admin", "doctors", "pending"] as const,
  },
  patients: {
    all: ["patients"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["patients", "list", filters ?? {}] as const,
    detail: (id: string) => ["patients", id] as const,
  },
  consultations: {
    all: ["consultations"] as const,
    byPatient: (patientId: string) =>
      ["consultations", "patient", patientId] as const,
    detail: (id: string) => ["consultations", id] as const,
  },
  sessions: {
    byConsultation: (consultationId: string) =>
      ["sessions", "consultation", consultationId] as const,
    detail: (id: string) => ["sessions", id] as const,
  },
  transcripts: {
    byConsultation: (consultationId: string) =>
      ["transcripts", "consultation", consultationId] as const,
    segments: (sessionId: string) =>
      ["transcripts", "segments", sessionId] as const,
  },
  soap: {
    byConsultation: (consultationId: string) =>
      ["soap", "consultation", consultationId] as const,
  },
  prescription: {
    byConsultation: (consultationId: string) =>
      ["prescription", "consultation", consultationId] as const,
  },
  memory: {
    profile: (patientId: string) => ["memory", "profile", patientId] as const,
    documents: (patientId: string) => ["memory", "documents", patientId] as const,
    context: (patientId: string, consultationId?: string) =>
      ["memory", "context", patientId, consultationId ?? ""] as const,
    search: (patientId: string, query: string) =>
      ["memory", "search", patientId, query] as const,
  },
  documents: {
    byPatient: (patientId: string) => ["documents", "patient", patientId] as const,
    byConsultation: (consultationId: string) =>
      ["documents", "consultation", consultationId] as const,
  },
  notifications: {
    all: ["notifications"] as const,
  },
  dashboard: {
    doctor: ["dashboard", "doctor"] as const,
    admin: ["dashboard", "admin"] as const,
  },
  aiJobs: {
    byConsultation: (consultationId: string) =>
      ["ai-jobs", "consultation", consultationId] as const,
    detail: (id: string) => ["ai-jobs", id] as const,
  },
} as const;
