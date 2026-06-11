import { z } from "zod";

const genderValues = ["male", "female", "other", "prefer_not_to_say"] as const;

const bloodGroupValues = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

const optionalText = z.string().trim().optional().or(z.literal(""));

export const patientFormSchema = z.object({
  full_name: z.string().trim().min(2, "Full name is required"),
  phone: optionalText,
  gender: z.enum(genderValues).optional().or(z.literal("")),
  date_of_birth: optionalText,
  blood_group: z.enum(bloodGroupValues).optional().or(z.literal("")),
  allergies: optionalText,
  medical_history: optionalText,
  current_medications: optionalText,
  emergency_contact_name: optionalText,
  emergency_contact_phone: optionalText,
  address: optionalText,
  notes: optionalText,
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

export const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

export const bloodGroupOptions = bloodGroupValues.map((value) => ({
  value,
  label: value,
}));
