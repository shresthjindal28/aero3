import { z } from "zod";

export const doctorSignupSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  specialization: z.string().optional(),
  qualification: z.string().optional(),
});

export const adminSignupSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type DoctorSignupFormValues = z.infer<typeof doctorSignupSchema>;
export type AdminSignupFormValues = z.infer<typeof adminSignupSchema>;
