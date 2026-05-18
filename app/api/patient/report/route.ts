import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/clerk/request-auth";
import cloudinary from "@/lib/cloudinary";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { supabaseErrorResponse } from "@/lib/supabase/api-response";
import {
  getDoctorByClerkUser,
  getOrCreateConsultation,
  ensureDoctorHospital,
  mapReportForClient,
} from "@/lib/supabase/helpers";

export const runtime = "nodejs";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "report";
}

function inferReportType(mime: string): string {
  if (mime === "application/pdf") return "lab";
  if (mime.startsWith("image/")) return "imaging";
  if (mime.startsWith("video/")) return "imaging";
  if (mime.startsWith("audio/")) return "other";
  return "other";
}

export async function POST(req: Request) {
  try {
    const clerkUser = await getUserFromRequest(req);
    if (!clerkUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const userId = formData.get("userId") as string | null;
    const note = (formData.get("note") as string | null) ?? undefined;
    const titleInput = (formData.get("title") as string | null) ?? undefined;
    const file = formData.get("report") as File | null;
    const consultationId = formData.get("consultationId") as string | null;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const doctor = await getDoctorByClerkUser(clerkUser);
    if (!doctor) {
      return NextResponse.json({ success: false, error: "Doctor not found" }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("patient_id")
      .eq("patient_id", userId)
      .maybeSingle();

    if (patientError) return supabaseErrorResponse(patientError, "Failed to verify patient");
    if (!patient) {
      return NextResponse.json({ success: false, error: "Patient not found" }, { status: 404 });
    }

    const hospitalId = await ensureDoctorHospital(doctor);
    const activeConsultationId =
      consultationId ??
      (await getOrCreateConsultation({
        doctorId: doctor.doctor_id,
        patientId: userId,
        hospitalId,
      }));

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;
    const mime = file.type || "";

    let resourceType: "image" | "video" | "raw";
    if (mime === "application/pdf") resourceType = "raw";
    else if (mime.startsWith("image/")) resourceType = "image";
    else if (mime.startsWith("video/") || mime.startsWith("audio/")) resourceType = "video";
    else resourceType = "raw";

    const publicId = note ? slugify(note) : undefined;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `patients/${userId}/reports`,
      resource_type: resourceType,
      ...(publicId
        ? { public_id: publicId, overwrite: false, unique_filename: false, use_filename: false }
        : {}),
    });

    const reportUrl = result.secure_url;
    const storagePath = result.public_id ?? reportUrl;
    const title = titleInput || note || file.name || "Patient report";

    const { error } = await supabase.from("reports").insert({
      patient_id: userId,
      consultation_id: activeConsultationId,
      uploaded_by: doctor.doctor_id,
      report_type: inferReportType(mime),
      title,
      file_url: reportUrl,
      storage_path: storagePath,
      mime_type: mime || null,
      file_size_bytes: file.size,
      notes: note ?? null,
      report_date: new Date().toISOString().slice(0, 10),
    });

    if (error) return supabaseErrorResponse(error, "Failed to save report");

    return NextResponse.json({ success: true, url: reportUrl }, { status: 201 });
  } catch (err: unknown) {
    return supabaseErrorResponse(err, "Upload failed");
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: reports, error } = await supabase
      .from("reports")
      .select("*")
      .eq("patient_id", userId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (error) return supabaseErrorResponse(error, "Failed to fetch reports");

    const payload = (reports ?? []).map(mapReportForClient);

    return NextResponse.json({ success: true, reports: payload }, { status: 200 });
  } catch (err: unknown) {
    return supabaseErrorResponse(err, "Failed to fetch reports");
  }
}
