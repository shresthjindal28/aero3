export const routes = {
  home: "/",
  auth: {
    doctorLogin: "/doctor/login",
    doctorSignup: "/doctor/signup",
    doctorOnboarding: "/doctor/onboarding",
    doctorPendingApproval: "/doctor/pending-approval",
    adminLogin: "/admin/login",
    adminSignup: "/admin/signup",
  },
  app: {
    dashboard: "/dashboard",
    patients: "/patients",
    patientsNew: "/patients/new",
    patientDetail: (patientId: string) => `/patients/${patientId}`,
    patientEdit: (patientId: string) => `/patients/${patientId}/edit`,
    patientMemory: (patientId: string) => `/patients/${patientId}/memory`,
    patientDocuments: (patientId: string) => `/patients/${patientId}/documents`,
    patientPrescriptions: (patientId: string) =>
      `/patients/${patientId}/prescriptions`,
    prescriptionDetail: (prescriptionId: string) =>
      `/prescriptions/${prescriptionId}`,
    patientConsultationNew: (patientId: string) =>
      `/patients/${patientId}/consultations/new`,
    consultations: "/consultations",
    consultationDetail: (consultationId: string) => `/consultations/${consultationId}`,
    consultationSoap: (consultationId: string) =>
      `/consultations/${consultationId}/soap`,
    consultationPrescription: (
      consultationId: string,
      options?: { generate?: boolean; regenerate?: boolean },
    ) => {
      const params = new URLSearchParams();
      if (options?.generate) params.set("generate", "true");
      if (options?.regenerate) params.set("regenerate", "true");
      const query = params.toString();
      return `/consultations/${consultationId}/prescription${query ? `?${query}` : ""}`;
    },
    sessions: "/sessions",
    sessionDetail: (sessionId: string) => `/sessions/${sessionId}`,
    memory: "/memory",
    documents: "/documents",
    settings: "/settings",
    settingsProfile: "/settings/profile",
    settingsSecurity: "/settings/security",
    notifications: "/notifications",
  },
  admin: {
    dashboard: "/admin/dashboard",
    doctors: "/admin/doctors",
    doctorDetail: (doctorId: string) => `/admin/doctors/${doctorId}`,
    verification: "/admin/verification",
    aiJobs: "/admin/ai-jobs",
    systemHealth: "/admin/system-health",
    settings: "/admin/settings",
    settingsProfile: "/admin/settings/profile",
  },
} as const;
