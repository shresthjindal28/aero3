import { getSupabaseAdmin } from "@/lib/supabase/server";
import { supabaseErrorResponse } from "@/lib/supabase/api-response";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const fd = await req.formData();
  if (!fd) return NextResponse.json({ error: "fd not found" }, { status: 402 });

  const soap_notes = fd.get("soap_notes") as string | null;
  const patient_id = fd.get("patient_id") as string | null;
  const transcribed_text = fd.get("transcribed_text") as string | null;

  if (!soap_notes || !patient_id || !transcribed_text) {
    return NextResponse.json({ error: "proper fields not found" }, { status: 402 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: patient, error } = await supabase
      .from("patients")
      .select("full_name")
      .eq("patient_id", patient_id)
      .maybeSingle();

    if (error) return supabaseErrorResponse(error, "Failed to load patient");
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const ragBase = process.env.RAG_URL ?? "https://771fd7603723.ngrok-free.app";
    const response = await fetch(`${ragBase.replace(/\/$/, "")}/soap-notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id,
        soap_notes,
        date_time: new Date().toUTCString(),
        patient_name: patient.full_name,
      }),
    });

    const body = await response.json();
    if (body.status === "processing") return NextResponse.json({ status: 200 });

    return NextResponse.json({ error: "Error while embedding data to rag" }, { status: 500 });
  } catch (error) {
    return supabaseErrorResponse(error, "RAG update failed");
  }
}
