import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import cloudinary from "@/lib/cloudinary";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { supabaseErrorResponse } from "@/lib/supabase/api-response";

async function uploadFileToCloudinary(file: File, folder: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "auto",
    use_filename: true,
    filename_override: file.name,
    invalidate: true,
  });
  return result.secure_url;
}

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email =
      clerkUser.primaryEmailAddress?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Clerk account must have an email" }, { status: 400 });
    }

    const formData = await req.formData();
    const phone_number = (formData.get("phone_number") as string) || undefined;
    const doctor_name =
      (formData.get("doctor_name") as string) || clerkUser.fullName || "Doctor";
    const certificate = formData.get("certificate") as File | null;
    const id_document = formData.get("id_document") as File | null;

    if (!phone_number) {
      return NextResponse.json({ error: "phone_number is required" }, { status: 400 });
    }
    if (!certificate || !id_document) {
      return NextResponse.json(
        { error: "certificate and id_document files are required" },
        { status: 400 }
      );
    }

    const [certificate_url, id_document_url] = await Promise.all([
      uploadFileToCloudinary(certificate, "doctors/certificates"),
      uploadFileToCloudinary(id_document, "doctors/id_documents"),
    ]);

    const supabase = getSupabaseAdmin();
    const doctorRow = {
      email,
      full_name: doctor_name,
      phone: phone_number,
      certificate_url,
      id_document_url,
      is_onboarded: true,
      specialization: "General Practice",
      last_login_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from("doctors")
      .select("doctor_id")
      .eq("email", email)
      .maybeSingle();

    const { data: doctor, error } = existing
      ? await supabase
          .from("doctors")
          .update(doctorRow)
          .eq("doctor_id", existing.doctor_id)
          .select()
          .single()
      : await supabase.from("doctors").insert(doctorRow).select().single();

    if (error) return supabaseErrorResponse(error, "Failed to register doctor");

    return NextResponse.json({ success: true, doctor });
  } catch (err) {
    return supabaseErrorResponse(err, "Doctor registration failed");
  }
}
