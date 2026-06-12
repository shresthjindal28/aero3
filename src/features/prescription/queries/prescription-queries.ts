export const prescriptionQueryKeys = {
  byConsultation: (consultationId: string) =>
    ["prescription", "consultation", consultationId] as const,
};
