import type { Patient } from "@/features/patients/types/patient.types";
import { formatDate, formatDateTime } from "@/lib/utils/date";
import { formatGender } from "@/features/patients/utils/patient.utils";

type PatientInfoCardProps = {
  patient: Patient;
};

type InfoItemProps = {
  label: string;
  value: string | null | undefined;
};

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm">{value?.trim() ? value : "—"}</p>
    </div>
  );
}

export function PatientInfoCard({ patient }: PatientInfoCardProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold">Patient information</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <InfoItem label="Full name" value={patient.full_name} />
          <InfoItem label="Phone" value={patient.phone} />
          <InfoItem label="Gender" value={formatGender(patient.gender)} />
          <InfoItem
            label="Date of birth"
            value={patient.date_of_birth ? formatDate(patient.date_of_birth) : null}
          />
          <InfoItem label="Blood group" value={patient.blood_group} />
          <InfoItem label="Allergies" value={patient.allergies} />
          <InfoItem label="Medical history" value={patient.medical_history} />
          <InfoItem label="Current medications" value={patient.current_medications} />
          <InfoItem label="Emergency contact" value={patient.emergency_contact_name} />
          <InfoItem label="Emergency phone" value={patient.emergency_contact_phone} />
          <div className="sm:col-span-2">
            <InfoItem label="Address" value={patient.address} />
          </div>
          <div className="sm:col-span-2">
            <InfoItem label="Notes" value={patient.notes} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold">Metadata</h2>
        <div className="mt-6 space-y-5">
          <InfoItem label="Patient ID" value={patient.id} />
          <InfoItem label="Status" value={patient.is_active ? "Active" : "Inactive"} />
          <InfoItem label="Created" value={formatDateTime(patient.created_at)} />
          <InfoItem label="Last updated" value={formatDateTime(patient.updated_at)} />
        </div>
      </section>
    </div>
  );
}
