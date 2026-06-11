export const capabilities = [
  "dashboard:view",
  "patients:read",
  "patients:write",
  "consultations:read",
  "consultations:write",
  "sessions:read",
  "sessions:record",
  "transcripts:read",
  "soap:read",
  "soap:write",
  "memory:read",
  "documents:read",
  "documents:write",
  "settings:read",
  "settings:write",
  "notifications:read",
  "admin:access",
  "admin:doctors:read",
  "admin:doctors:approve",
  "admin:ai-jobs:retry",
] as const;

export type Capability = (typeof capabilities)[number];
