import type { GenderType } from "@/types/domain/enums";

export type Patient = {
  id: string;
  doctor_id: string;
  full_name: string;
  phone: string | null;
  gender: GenderType | null;
  date_of_birth: string | null;
  blood_group: string | null;
  allergies: string | null;
  medical_history: string | null;
  current_medications: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PatientCreateInput = {
  full_name: string;
  phone?: string | null;
  gender?: GenderType | null;
  date_of_birth?: string | null;
  blood_group?: string | null;
  allergies?: string | null;
  medical_history?: string | null;
  current_medications?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  address?: string | null;
  notes?: string | null;
};

export type PatientUpdateInput = Partial<PatientCreateInput>;

export type PatientSortField =
  | "full_name"
  | "gender"
  | "phone"
  | "date_of_birth"
  | "blood_group"
  | "created_at";

export type SortDirection = "asc" | "desc";

export type PatientListParams = {
  search: string;
  page: number;
  pageSize: number;
  sortField: PatientSortField;
  sortDirection: SortDirection;
};
