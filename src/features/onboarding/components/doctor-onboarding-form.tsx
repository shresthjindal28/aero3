"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useDoctorMe } from "@/features/auth/hooks/use-doctor-auth";
import { uploadStorageFile } from "@/features/documents/api/storage.api";
import {
  useDeleteDoctorDocument,
  useDoctorDocuments,
  useOnboardingStatus,
  useSubmitVerification,
  useUpdateDoctorProfile,
  useUploadDoctorDocument,
} from "@/features/onboarding/hooks/use-onboarding";
import {
  onboardingProfileSchema,
  onboardingVerificationSchema,
  type OnboardingProfileFormValues,
  type OnboardingVerificationFormValues,
} from "@/features/onboarding/schemas/onboarding.schema";
import type { DoctorDocumentType } from "@/features/onboarding/types/onboarding.types";
import type { ApiError } from "@/lib/api/types/api-error.types";
import { routes } from "@/shared/constants/routes";
import { FormField } from "@/shared/forms/form-field";
import { FormSection } from "@/shared/forms/form-section";
import { useZodForm } from "@/shared/forms/use-zod-form";
import { LoadingButton } from "@/shared/ui/buttons/loading-button";
import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";

const REQUIRED_DOCUMENTS: Array<{
  type: DoctorDocumentType;
  label: string;
  description: string;
}> = [
  {
    type: "government_id",
    label: "Government ID",
    description: "Passport, Aadhaar, or national ID",
  },
  {
    type: "medical_license",
    label: "Medical license",
    description: "Valid medical practice license",
  },
  {
    type: "medical_certificate",
    label: "Medical certificate",
    description: "Medical degree or certification",
  },
  {
    type: "specialization_certificate",
    label: "Specialization certificate",
    description: "Specialty board or fellowship certificate",
  },
  {
    type: "hospital_affiliation",
    label: "Hospital affiliation",
    description: "Proof of hospital or clinic affiliation",
  },
];

const PROFILE_FIELD_LABELS: Record<string, string> = {
  phone: "Phone",
  date_of_birth: "Date of birth",
  gender: "Gender",
  qualification: "Qualification",
  specialization: "Specialization",
  years_of_experience: "Years of experience",
  hospital_name: "Hospital / clinic",
  city: "City",
  state: "State",
  country: "Country",
  profile_picture_url: "Profile picture",
};

type Step = "profile" | "credentials" | "documents" | "review";

export function DoctorOnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("profile");
  const [profilePictureName, setProfilePictureName] = useState<string | null>(null);
  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);
  const [pendingDocuments, setPendingDocuments] = useState<
    Partial<Record<DoctorDocumentType, File>>
  >({});
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const { data: doctor } = useDoctorMe();
  const { data: status } = useOnboardingStatus();
  const { data: documents = [] } = useDoctorDocuments();
  const updateProfile = useUpdateDoctorProfile();
  const uploadDocument = useUploadDoctorDocument();
  const deleteDocument = useDeleteDoctorDocument();
  const submitVerification = useSubmitVerification();

  const profileForm = useZodForm<OnboardingProfileFormValues>(onboardingProfileSchema, {
    defaultValues: {
      phone: "",
      date_of_birth: "",
      gender: undefined,
      qualification: "",
      specialization: "",
      years_of_experience: undefined,
      hospital_name: "",
      city: "",
      state: "",
      country: "",
      profile_picture_url: "",
    },
  });

  const verificationForm = useZodForm<OnboardingVerificationFormValues>(
    onboardingVerificationSchema,
    {
      defaultValues: {
        registration_number: "",
        medical_council: "",
      },
    },
  );

  useEffect(() => {
    if (!doctor) return;
    profileForm.reset({
      phone: doctor.phone ?? "",
      date_of_birth: doctor.date_of_birth ?? "",
      gender: doctor.gender as OnboardingProfileFormValues["gender"] | undefined,
      qualification: doctor.qualification ?? "",
      specialization: doctor.specialization ?? "",
      years_of_experience: doctor.years_of_experience ?? undefined,
      hospital_name: doctor.hospital_name ?? "",
      city: doctor.city ?? "",
      state: doctor.state ?? "",
      country: doctor.country ?? "",
      profile_picture_url: doctor.profile_picture_url ?? "",
    });
    if (doctor.profile_picture_url) {
      setProfilePictureName(doctor.profile_picture_url.split("/").pop() ?? "Uploaded");
    }
  }, [doctor, profileForm]);

  const uploadedByType = useMemo(() => {
    return new Map(documents.map((document) => [document.document_type, document]));
  }, [documents]);

  const handleProfilePictureUpload = async (file: File | null) => {
    if (!file) return;

    try {
      setUploadingProfilePicture(true);
      const upload = await uploadStorageFile(
        {
          resource_type: "doctor_profile_picture",
          file_name: file.name,
        },
        file,
        file.name,
      );
      profileForm.setValue("profile_picture_url", upload.object_key, {
        shouldValidate: true,
      });
      setProfilePictureName(file.name);
      toast.success("Profile picture uploaded");
    } catch {
      toast.error("Unable to upload profile picture");
    } finally {
      setUploadingProfilePicture(false);
    }
  };

  const saveProfile = profileForm.handleSubmit(async (values) => {
    try {
      await updateProfile.mutateAsync(values);
      toast.success("Profile saved");
      setStep("credentials");
    } catch (error) {
      const apiError = error as unknown as ApiError;
      toast.error(apiError.message ?? "Unable to save profile");
    }
  });

  const saveCredentials = verificationForm.handleSubmit(async () => {
    setStep("documents");
  });

  const handleSubmit = verificationForm.handleSubmit(async (verificationValues) => {
    try {
      const profileValues = profileForm.getValues();
      await updateProfile.mutateAsync(profileValues);
      await submitVerification.mutateAsync(verificationValues);
      toast.success("Application submitted for admin review");
      router.replace(routes.auth.doctorPendingApproval);
    } catch (error) {
      const apiError = error as unknown as ApiError;
      toast.error(apiError.message ?? "Unable to submit application");
    }
  });

  const handleDocumentSelect = (documentType: DoctorDocumentType, file: File | null) => {
    if (!file) return;

    setPendingDocuments((current) => ({
      ...current,
      [documentType]: file,
    }));
  };

  const isDocumentReady = (documentType: DoctorDocumentType) =>
    uploadedByType.has(documentType) || Boolean(pendingDocuments[documentType]);

  const handleDocumentsContinue = async () => {
    const missing = REQUIRED_DOCUMENTS.filter((item) => !isDocumentReady(item.type));
    if (missing.length > 0) {
      toast.error("Please select all required documents before continuing");
      return;
    }

    const toUpload = REQUIRED_DOCUMENTS.filter((item) => pendingDocuments[item.type]);
    if (toUpload.length === 0) {
      setStep("review");
      return;
    }

    try {
      setUploadingDocuments(true);
      await Promise.all(
        toUpload.map(async (item) => {
          const file = pendingDocuments[item.type]!;
          const existing = uploadedByType.get(item.type);
          if (existing) {
            await deleteDocument.mutateAsync(existing.id);
          }
          await uploadDocument.mutateAsync({ file, documentType: item.type });
        }),
      );
      setPendingDocuments({});
      toast.success("All documents uploaded");
      setStep("review");
    } catch (error) {
      const apiError = error as unknown as ApiError;
      toast.error(apiError.message ?? "Unable to upload documents");
    } finally {
      setUploadingDocuments(false);
    }
  };

  return (
    <div className="space-y-8">
      {status?.rejection_notes ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-medium">Your previous application was rejected</p>
          <p className="mt-1">{status.rejection_notes}</p>
        </div>
      ) : null}

      {status?.missing_profile_fields.length ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <p className="font-medium">Complete all required profile fields</p>
          <p className="mt-1 text-muted-foreground">
            Missing:{" "}
            {status.missing_profile_fields
              .map((field) => PROFILE_FIELD_LABELS[field] ?? field)
              .join(", ")}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 text-sm">
        {(["profile", "credentials", "documents", "review"] as Step[]).map((item) => (
          <span
            key={item}
            className={
              step === item
                ? "rounded-full bg-primary px-3 py-1 text-primary-foreground"
                : "rounded-full bg-muted px-3 py-1 text-muted-foreground"
            }
          >
            {item}
          </span>
        ))}
      </div>

      {step === "profile" ? (
        <form onSubmit={saveProfile} className="space-y-6">
          <FormSection
            title="Account"
            description="These details come from your signup."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium">Full name</p>
                <p className="mt-1 text-sm text-muted-foreground">{doctor?.full_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="mt-1 text-sm text-muted-foreground">{doctor?.email}</p>
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Personal details"
            description="All fields are required."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={profileForm.control}
                name="phone"
                label="Phone"
                render={({ field }) => <Input type="tel" required {...field} />}
              />
              <FormField
                control={profileForm.control}
                name="date_of_birth"
                label="Date of birth"
                render={({ field }) => <Input type="date" required {...field} />}
              />
              <FormField
                control={profileForm.control}
                name="gender"
                label="Gender"
                render={({ field }) => (
                  <select
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...field}
                    value={field.value ?? ""}
                  >
                    <option value="" disabled>
                      Select gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                )}
              />
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Profile picture <span className="text-destructive">*</span>
                </p>
                <Input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  required={!profileForm.getValues("profile_picture_url")}
                  disabled={uploadingProfilePicture}
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    void handleProfilePictureUpload(file);
                    event.target.value = "";
                  }}
                />
                {profilePictureName ? (
                  <p className="text-sm text-emerald-600">Uploaded: {profilePictureName}</p>
                ) : null}
                {profileForm.formState.errors.profile_picture_url ? (
                  <p className="text-sm text-destructive">
                    {profileForm.formState.errors.profile_picture_url.message}
                  </p>
                ) : null}
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Professional details"
            description="All fields are required."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={profileForm.control}
                name="qualification"
                label="Qualification"
                render={({ field }) => <Input required {...field} />}
              />
              <FormField
                control={profileForm.control}
                name="specialization"
                label="Specialization"
                render={({ field }) => <Input required {...field} />}
              />
              <FormField
                control={profileForm.control}
                name="years_of_experience"
                label="Years of experience"
                render={({ field }) => (
                  <Input type="number" min={0} required {...field} value={field.value ?? ""} />
                )}
              />
              <FormField
                control={profileForm.control}
                name="hospital_name"
                label="Hospital / clinic"
                render={({ field }) => <Input required {...field} />}
              />
              <FormField
                control={profileForm.control}
                name="city"
                label="City"
                render={({ field }) => <Input required {...field} />}
              />
              <FormField
                control={profileForm.control}
                name="state"
                label="State"
                render={({ field }) => <Input required {...field} />}
              />
              <FormField
                control={profileForm.control}
                name="country"
                label="Country"
                render={({ field }) => <Input required {...field} />}
              />
            </div>
          </FormSection>

          <LoadingButton type="submit" loading={updateProfile.isPending}>
            Continue
          </LoadingButton>
        </form>
      ) : null}

      {step === "credentials" ? (
        <form onSubmit={saveCredentials} className="space-y-6">
          <FormSection
            title="Medical registration"
            description="All fields are required for admin verification."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={verificationForm.control}
                name="registration_number"
                label="Registration number"
                render={({ field }) => <Input required {...field} />}
              />
              <FormField
                control={verificationForm.control}
                name="medical_council"
                label="Medical council"
                render={({ field }) => <Input required {...field} />}
              />
            </div>
          </FormSection>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep("profile")}>
              Back
            </Button>
            <LoadingButton type="submit">Continue</LoadingButton>
          </div>
        </form>
      ) : null}

      {step === "documents" ? (
        <div className="space-y-6">
          <FormSection
            title="Verification documents"
            description="Upload every document below. All are required."
          >
            <div className="space-y-4">
              {REQUIRED_DOCUMENTS.map((item) => {
                const uploaded = uploadedByType.get(item.type);
                const pendingFile = pendingDocuments[item.type];
                return (
                  <div
                    key={item.type}
                    className="rounded-xl border border-border/60 bg-card/50 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">
                          {item.label} <span className="text-destructive">*</span>
                        </p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        {pendingFile ? (
                          <p className="mt-1 text-sm text-emerald-600">
                            Selected: {pendingFile.name}
                          </p>
                        ) : uploaded ? (
                          <p className="mt-1 text-sm text-emerald-600">
                            Uploaded: {uploaded.file_name}
                          </p>
                        ) : null}
                      </div>
                      <Input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.webp"
                        disabled={uploadingDocuments}
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          handleDocumentSelect(item.type, file);
                          event.target.value = "";
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </FormSection>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep("credentials")}>
              Back
            </Button>
            <LoadingButton
              type="button"
              onClick={() => void handleDocumentsContinue()}
              loading={uploadingDocuments}
              loadingText="Uploading documents..."
              disabled={REQUIRED_DOCUMENTS.some((item) => !isDocumentReady(item.type))}
            >
              Continue
            </LoadingButton>
          </div>
        </div>
      ) : null}

      {step === "review" ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection
            title="Review and submit"
            description="Every profile field and document must be complete before submission."
          >
            <div className="rounded-xl border border-border/60 bg-card/50 p-4 text-sm">
              <p>
                <span className="text-muted-foreground">Doctor:</span> {doctor?.full_name}
              </p>
              <p className="mt-2">
                <span className="text-muted-foreground">Email:</span> {doctor?.email}
              </p>
              <p className="mt-2">
                <span className="text-muted-foreground">Hospital:</span>{" "}
                {profileForm.getValues("hospital_name")}
              </p>
              <p className="mt-2">
                <span className="text-muted-foreground">Registration:</span>{" "}
                {verificationForm.getValues("registration_number")}
              </p>
              <p className="mt-2">
                <span className="text-muted-foreground">Documents:</span>{" "}
                {documents.length} / {REQUIRED_DOCUMENTS.length} uploaded
              </p>
            </div>
          </FormSection>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep("documents")}>
              Back
            </Button>
            <LoadingButton
              type="submit"
              loading={submitVerification.isPending || updateProfile.isPending}
              loadingText="Submitting..."
            >
              Submit for approval
            </LoadingButton>
          </div>
        </form>
      ) : null}
    </div>
  );
}
