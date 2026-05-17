import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { supabaseErrorResponse } from "@/lib/supabase/api-response";
import {
  ensureDoctorHospital,
  getDoctorByClerkUser,
  getOrCreateConsultation,
} from "@/lib/supabase/helpers";

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { patientId, transcript, consultationId } = (await req.json()) as {
      patientId: string;
      consultationId?: string;
      audioBase64?: string;
      transcript?: string;
    };

    if (!patientId || typeof patientId !== "string") {
      return NextResponse.json({ error: "patientId is required" }, { status: 400 });
    }

    const doctor = await getDoctorByClerkUser(clerkUser);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 403 });
    }

    const hospitalId = await ensureDoctorHospital(doctor);
    const activeConsultationId =
      consultationId ??
      (await getOrCreateConsultation({
        doctorId: doctor.doctor_id,
        patientId,
        hospitalId,
      }));

    const supabase = getSupabaseAdmin();

    const { data: consultation, error: fetchError } = await supabase
      .from("consultations")
      .select("transcript_raw, transcript_cleaned")
      .eq("consultation_id", activeConsultationId)
      .maybeSingle();

    if (fetchError) return supabaseErrorResponse(fetchError, "Failed to load consultation");

    const updatePayload: {
      audio_url?: string | null;
      transcript_raw?: string | null;
      transcript_cleaned?: string | null;
    } = {};

    if (typeof transcript === "string" && transcript.trim().length > 0) {
      const previous = consultation?.transcript_cleaned ?? consultation?.transcript_raw ?? "";
      const combined = previous ? `${previous}\n${transcript}` : transcript;
      updatePayload.transcript_raw = combined;
      updatePayload.transcript_cleaned = combined;
    }

    const { data: updated, error: updateError } = await supabase
      .from("consultations")
      .update(updatePayload)
      .eq("consultation_id", activeConsultationId)
      .select()
      .single();

    if (updateError) return supabaseErrorResponse(updateError, "Failed to store audio");

    return NextResponse.json(
      {
        success: true,
        consultation: updated,
        consultationId: activeConsultationId,
        audioUrl: null,
      },
      { status: 200 }
    );
  } catch (error) {
    return supabaseErrorResponse(error, "Failed to store audio");
  }
}
