import "server-only";
import type { User } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "./server";

/** Legacy API shape used by existing UI components */
export function mapPatientForClient(row: {
  patient_id: string;
  full_name: string;
  phone: string | null;
  address: string | null;
}) {
  return {
    patient_id: row.patient_id,
    user_id: row.patient_id,
    full_name: row.full_name,
    user_name: row.full_name,
    phone: row.phone,
    user_mobile: row.phone,
    address: row.address,
  };
}

export async function getDoctorByClerkUser(clerkUser: User) {
  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function ensureDoctorHospital(doctor: {
  doctor_id: string;
  hospital_id: string | null;
}) {
  if (doctor.hospital_id) return doctor.hospital_id;

  const supabase = getSupabaseAdmin();
  const { data: hospital, error: hErr } = await supabase
    .from("hospitals")
    .insert({
      name: "Airo Default Clinic",
      type: "clinic",
    })
    .select("hospital_id")
    .single();

  if (hErr) throw hErr;

  const { error: uErr } = await supabase
    .from("doctors")
    .update({ hospital_id: hospital.hospital_id })
    .eq("doctor_id", doctor.doctor_id);

  if (uErr) throw uErr;
  return hospital.hospital_id;
}

export async function getOrCreateConsultation(params: {
  doctorId: string;
  patientId: string;
  hospitalId: string;
}) {
  const supabase = getSupabaseAdmin();

  const { data: existing, error: findErr } = await supabase
    .from("consultations")
    .select("consultation_id")
    .eq("doctor_id", params.doctorId)
    .eq("patient_id", params.patientId)
    .eq("status", "in_progress")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (findErr) throw findErr;
  if (existing) return existing.consultation_id;

  const { data: created, error: createErr } = await supabase
    .from("consultations")
    .insert({
      doctor_id: params.doctorId,
      patient_id: params.patientId,
      hospital_id: params.hospitalId,
      status: "in_progress",
      consultation_type: "in_person",
      started_at: new Date().toISOString(),
    })
    .select("consultation_id")
    .single();

  if (createErr) throw createErr;
  return created.consultation_id;
}

export function mapReportForClient(row: {
  report_id: string;
  patient_id: string;
  file_url: string;
  title: string;
  notes: string | null;
  report_type: string;
  created_at: string;
}) {
  return {
    id: row.report_id,
    report_id: row.report_id,
    userId: row.patient_id,
    patient_id: row.patient_id,
    file_url: row.file_url,
    title: row.title,
    note: row.notes,
    notes: row.notes,
    report_type: row.report_type,
    created_at: row.created_at,
  };
}
