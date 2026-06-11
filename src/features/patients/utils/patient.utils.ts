import type {
  Patient,
  PatientCreateInput,
  PatientListParams,
  PatientSortField,
  SortDirection,
} from "@/features/patients/types/patient.types";
import type { PatientFormValues } from "@/features/patients/schemas/patient.schema";
import { formatDate } from "@/lib/utils/date";
import type { GenderType } from "@/types/domain/enums";

export function formatGender(gender: GenderType | null | undefined): string {
  if (!gender) return "—";
  return gender
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function calculateAge(dateOfBirth: string | null | undefined): string {
  if (!dateOfBirth) return "—";

  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }

  return age >= 0 ? String(age) : "—";
}

export function formValuesToCreateInput(values: PatientFormValues): PatientCreateInput {
  return {
    full_name: values.full_name.trim(),
    phone: values.phone?.trim() || null,
    gender: values.gender ? (values.gender as GenderType) : null,
    date_of_birth: values.date_of_birth?.trim() || null,
    blood_group: values.blood_group?.trim() || null,
    allergies: values.allergies?.trim() || null,
    medical_history: values.medical_history?.trim() || null,
    current_medications: values.current_medications?.trim() || null,
    emergency_contact_name: values.emergency_contact_name?.trim() || null,
    emergency_contact_phone: values.emergency_contact_phone?.trim() || null,
    address: values.address?.trim() || null,
    notes: values.notes?.trim() || null,
  };
}

export function patientToFormValues(patient: Patient): PatientFormValues {
  return {
    full_name: patient.full_name,
    phone: patient.phone ?? "",
    gender: (patient.gender ?? "") as PatientFormValues["gender"],
    date_of_birth: patient.date_of_birth ?? "",
    blood_group: (patient.blood_group ?? "") as PatientFormValues["blood_group"],
    allergies: patient.allergies ?? "",
    medical_history: patient.medical_history ?? "",
    current_medications: patient.current_medications ?? "",
    emergency_contact_name: patient.emergency_contact_name ?? "",
    emergency_contact_phone: patient.emergency_contact_phone ?? "",
    address: patient.address ?? "",
    notes: patient.notes ?? "",
  };
}

export function filterPatients(patients: Patient[], search: string): Patient[] {
  const query = search.trim().toLowerCase();
  if (!query) return patients;

  return patients.filter((patient) => {
    const haystack = [
      patient.full_name,
      patient.phone,
      patient.blood_group,
      patient.gender,
      patient.allergies,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

function compareValues(
  a: string | null | undefined,
  b: string | null | undefined,
  direction: SortDirection,
): number {
  const left = (a ?? "").toLowerCase();
  const right = (b ?? "").toLowerCase();
  const result = left.localeCompare(right);
  return direction === "asc" ? result : -result;
}

export function sortPatients(
  patients: Patient[],
  sortField: PatientSortField,
  sortDirection: SortDirection,
): Patient[] {
  return [...patients].sort((a, b) => {
    switch (sortField) {
      case "full_name":
        return compareValues(a.full_name, b.full_name, sortDirection);
      case "gender":
        return compareValues(a.gender, b.gender, sortDirection);
      case "phone":
        return compareValues(a.phone, b.phone, sortDirection);
      case "blood_group":
        return compareValues(a.blood_group, b.blood_group, sortDirection);
      case "date_of_birth":
        return compareValues(a.date_of_birth, b.date_of_birth, sortDirection);
      case "created_at":
        return compareValues(a.created_at, b.created_at, sortDirection);
      default:
        return 0;
    }
  });
}

export function paginatePatients<T>(
  patients: T[],
  page: number,
  pageSize: number,
): { items: T[]; total: number; totalPages: number } {
  const total = patients.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: patients.slice(start, start + pageSize),
    total,
    totalPages,
  };
}

export function processPatientList(
  patients: Patient[],
  params: PatientListParams,
) {
  const filtered = filterPatients(patients, params.search);
  const sorted = sortPatients(filtered, params.sortField, params.sortDirection);
  const paginated = paginatePatients(sorted, params.page, params.pageSize);

  return {
    ...paginated,
    filteredTotal: filtered.length,
  };
}

export function formatPatientCreatedDate(value: string): string {
  return formatDate(value);
}
