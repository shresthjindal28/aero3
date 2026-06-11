import { DoctorOnboardingForm } from "@/features/onboarding/components/doctor-onboarding-form";

export default function DoctorOnboardingPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Complete your profile</h1>
        <p className="text-muted-foreground">
          Submit your professional details and verification documents. Dashboard access
          is enabled after admin approval.
        </p>
      </div>
      <DoctorOnboardingForm />
    </div>
  );
}
