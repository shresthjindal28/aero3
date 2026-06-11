import { z } from "zod";

export const onboardingProfileSchema = z.object({
  phone: z.string().min(10, "Phone number is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"], {
    required_error: "Gender is required",
  }),
  qualification: z.string().min(2, "Qualification is required"),
  specialization: z.string().min(2, "Specialization is required"),
  years_of_experience: z.coerce
    .number({
      required_error: "Years of experience is required",
      invalid_type_error: "Years of experience is required",
    })
    .int("Enter a whole number")
    .min(0, "Experience cannot be negative")
    .max(60, "Enter a valid number of years"),
  hospital_name: z.string().min(2, "Hospital or clinic name is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  profile_picture_url: z.string().min(1, "Profile picture is required"),
});

export const onboardingVerificationSchema = z.object({
  registration_number: z.string().min(2, "Registration number is required"),
  medical_council: z.string().min(2, "Medical council is required"),
});

export type OnboardingProfileFormValues = z.infer<typeof onboardingProfileSchema>;
export type OnboardingVerificationFormValues = z.infer<
  typeof onboardingVerificationSchema
>;
