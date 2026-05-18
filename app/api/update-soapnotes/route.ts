import { getUserFromRequest } from "@/lib/clerk/request-auth";

export const runtime = "nodejs";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { supabaseErrorResponse } from "@/lib/supabase/api-response";
import {
  ensureDoctorHospital,
  getDoctorByClerkUser,
  getOrCreateConsultation,
} from "@/lib/supabase/helpers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const clerkUser = await getUserFromRequest(req);
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fd = await req.formData();
    const patient_id = fd.get("patient_id") as string | null;
    const transcribed_text = fd.get("transcribed_text") as string | null;
    const subjective = fd.get("subjective") as string | null;
    const objective = fd.get("objective") as string | null;
    const assessment = fd.get("assessment") as string | null;
    const plan = fd.get("plan") as string | null;
    const consultation_id = fd.get("consultation_id") as string | null;

    if (!patient_id || !transcribed_text) {
      return NextResponse.json(
        { error: "patient_id and transcribed_text required" },
        { status: 400 }
      );
    }

    if (!subjective && !objective && !assessment && !plan) {
      return NextResponse.json({ error: "SOAP sections required" }, { status: 400 });
    }

    const doctor = await getDoctorByClerkUser(clerkUser);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 403 });
    }

    const hospitalId = await ensureDoctorHospital(doctor);
    const activeConsultationId =
      consultation_id ??
      (await getOrCreateConsultation({
        doctorId: doctor.doctor_id,
        patientId: patient_id,
        hospitalId,
      }));

    const supabase = getSupabaseAdmin();

    const { data: consultation, error: cErr } = await supabase
      .from("consultations")
      .select("transcript_cleaned")
      .eq("consultation_id", activeConsultationId)
      .maybeSingle();

    if (cErr) return supabaseErrorResponse(cErr, "Failed to load consultation");

    const transcript_cleaned = consultation?.transcript_cleaned
      ? `${consultation.transcript_cleaned}\n${transcribed_text}`
      : transcribed_text;

    const { error: uErr } = await supabase
      .from("consultations")
      .update({ transcript_cleaned, transcript_raw: transcript_cleaned })
      .eq("consultation_id", activeConsultationId);

    if (uErr) return supabaseErrorResponse(uErr, "Failed to update transcript");

    const { error: soapError } = await supabase.from("soap_notes").insert({
      consultation_id: activeConsultationId,
      doctor_id: doctor.doctor_id,
      patient_id,
      subjective,
      objective,
      assessment,
      plan,
      ai_model_version: "med-llm",
    });

    if (soapError) return supabaseErrorResponse(soapError, "Failed to save SOAP note");

    return NextResponse.json({ status: 200, consultation_id: activeConsultationId });
  } catch (error) {
    return supabaseErrorResponse(error, "Failed to update SOAP notes");
  }
}
