import { z } from "zod";

export const createConsultationSchema = z.object({
  chief_complaint: z.string().trim().min(1, "Chief complaint is required"),
  notes: z.string().trim().optional(),
});

export const updateConsultationSchema = z.object({
  chief_complaint: z.string().trim().min(1, "Chief complaint is required"),
  status: z.enum(["scheduled", "active", "completed", "cancelled"]),
});

export type CreateConsultationFormValues = z.infer<typeof createConsultationSchema>;
export type UpdateConsultationFormValues = z.infer<typeof updateConsultationSchema>;
