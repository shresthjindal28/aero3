"use client";

import { useDoctorMe } from "@/features/auth/hooks/use-doctor-auth";
import { formatDate } from "@/lib/utils/date";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { PageLoader } from "@/shared/ui/feedback/page-loader";
import { cn } from "@/lib/utils/cn";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

const statusStyles = {
  pending: "text-amber-400",
  approved: "text-emerald-400",
  rejected: "text-red-400",
} as const;

export function ProfileSettings() {
  const { data: doctor, isLoading, isError, error, refetch } = useDoctorMe(true);

  if (isLoading) return <PageLoader label="Loading profile..." />;

  if (isError || !doctor) {
    return (
      <ApiErrorDisplay
        error={(error as Error) ?? new Error("Unable to load profile")}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border/60 bg-card/50 p-6">
        <h2 className="text-base font-semibold">Doctor details</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Full name" value={doctor.full_name} />
          <Field label="Email" value={doctor.email} />
          <Field label="Phone" value={doctor.phone ?? "—"} />
          <Field label="Specialization" value={doctor.specialization ?? "—"} />
          <Field label="Qualification" value={doctor.qualification ?? "—"} />
          <Field
            label="Experience"
            value={
              doctor.years_of_experience !== null
                ? `${doctor.years_of_experience} years`
                : "—"
            }
          />
        </div>
      </section>

      <section className="rounded-xl border border-border/60 bg-card/50 p-6">
        <h2 className="text-base font-semibold">Registration & hospital</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Hospital" value={doctor.hospital_name ?? "—"} />
          <Field label="City" value={doctor.city ?? "—"} />
          <Field label="State" value={doctor.state ?? "—"} />
          <Field label="Country" value={doctor.country ?? "—"} />
          <Field
            label="Date of birth"
            value={doctor.date_of_birth ? formatDate(doctor.date_of_birth) : "—"}
          />
          <Field label="Gender" value={doctor.gender ?? "—"} />
        </div>
      </section>

      <section className="rounded-xl border border-border/60 bg-card/50 p-6">
        <h2 className="text-base font-semibold">Verification status</h2>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span
            className={cn(
              "rounded-full border border-border/60 px-3 py-1 capitalize",
              statusStyles[doctor.verification_status],
            )}
          >
            {doctor.verification_status}
          </span>
          <span className="rounded-full border border-border/60 px-3 py-1">
            Email {doctor.email_verified ? "verified" : "pending"}
          </span>
          <span className="rounded-full border border-border/60 px-3 py-1">
            Phone {doctor.phone_verified ? "verified" : "pending"}
          </span>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Profile editing will be available when the backend profile update API ships.
        </p>
      </section>
    </div>
  );
}
