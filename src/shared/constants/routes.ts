export const routes = {
  home: "/",
  auth: {
    doctorLogin: "/doctor/login",
    doctorSignup: "/doctor/signup",
    adminLogin: "/admin/login",
    adminSignup: "/admin/signup",
  },
  app: {
    dashboard: "/dashboard",
    patients: "/patients",
    patientsNew: "/patients/new",
    patientDetail: (patientId: string) => `/patients/${patientId}`,
    patientEdit: (patientId: string) => `/patients/${patientId}/edit`,
    patientConsultationNew: (patientId: string) =>
      `/patients/${patientId}/consultations/new`,
    consultations: "/consultations",
    consultationDetail: (consultationId: string) => `/consultations/${consultationId}`,
    consultationSoap: (consultationId: string) =>
      `/consultations/${consultationId}/soap`,
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
    aiJobs: "/admin/ai-jobs",
    settings: "/admin/settings",
    settingsProfile: "/admin/settings/profile",
  },
} as const;
