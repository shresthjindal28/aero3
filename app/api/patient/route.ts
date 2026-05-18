import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { supabaseErrorResponse } from "@/lib/supabase/api-response";
import {
  ensureDoctorHospital,
  getDoctorByClerkUser,
  getOrCreateConsultation,
  mapPatientForClient,
} from "@/lib/supabase/helpers";

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, address } = body || {};

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Patient name is required" }, { status: 400 });
    }

    const doctor = await getDoctorByClerkUser(clerkUser);
    if (!doctor) {
      return NextResponse.json(
        {
          error:
            "No doctor profile in the database for your sign-in email. Complete onboarding at /onboarding (profile must save successfully).",
        },
        { status: 403 }
      );
    }
    if (!doctor.is_onboarded) {
      return NextResponse.json(
        { error: "Finish doctor onboarding at /onboarding before registering patients." },
        { status: 403 }
      );
    }

    const hospitalId = await ensureDoctorHospital(doctor);
    const supabase = getSupabaseAdmin();

    const { data: patient, error } = await supabase
      .from("patients")
      .insert({
        full_name: name,
        phone: phone ?? null,
        address: address ?? null,
        hospital_id: hospitalId,
      })
      .select()
      .single();

    if (error) return supabaseErrorResponse(error, "Failed to create patient");

    const consultationId = await getOrCreateConsultation({
      doctorId: doctor.doctor_id,
      patientId: patient.patient_id,
      hospitalId,
    });

    return NextResponse.json(
      {
        success: true,
        patient: { ...mapPatientForClient(patient), consultation_id: consultationId },
      },
      { status: 201 }
    );
  } catch (error) {
    return supabaseErrorResponse(error, "Failed to create patient");
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: patient, error } = await supabase
      .from("patients")
      .select("*")
      .eq("patient_id", id)
      .maybeSingle();

    if (error) return supabaseErrorResponse(error, "Failed to fetch patient");
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ patient: mapPatientForClient(patient) }, { status: 200 });
  } catch (error) {
    return supabaseErrorResponse(error, "Failed to fetch patient");
  }
}
