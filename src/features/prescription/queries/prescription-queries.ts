export const prescriptionQueryKeys = {
  byConsultation: (consultationId: string) =>
    ["prescription", "consultation", consultationId] as const,
  byId: (prescriptionId: string) => ["prescription", prescriptionId] as const,
  byPatient: (patientId: string, search?: string) =>
    ["prescription", "patient", patientId, search ?? ""] as const,
  versions: (prescriptionId: string) =>
    ["prescription", prescriptionId, "versions"] as const,
};
