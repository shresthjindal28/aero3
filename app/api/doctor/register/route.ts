import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/clerk/request-auth";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { supabaseErrorResponse } from "@/lib/supabase/api-response";

function formatCloudinaryError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object") {
    const e = err as { message?: string; error?: { message?: string } };
    if (typeof e.message === "string" && e.message) return e.message;
    if (typeof e.error?.message === "string" && e.error.message) {
      return e.error.message;
    }
  }
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown upload error";
  }
}

async function uploadFileToCloudinary(
  file: File,
  folder: string
): Promise<{ url: string | null; error?: string }> {
  const hasCloudinary =
    process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET);

  if (!hasCloudinary) {
    return {
      url: null,
      error:
        "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local",
    };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type || "application/octet-stream"};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: "auto",
    });
    return { url: result.secure_url };
  } catch (err) {
    const message = formatCloudinaryError(err);
    console.error(`Cloudinary upload failed (${folder}):`, message);
    return { url: null, error: message };
  }
}

export async function POST(req: Request) {
  try {
    const clerkUser = await getUserFromRequest(req);
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
    const profile = formData.get("profile") as File | null;

    if (!phone_number) {
      return NextResponse.json({ error: "phone_number is required" }, { status: 400 });
    }
    if (!certificate || !id_document) {
      return NextResponse.json(
        { error: "certificate and id_document files are required" },
        { status: 400 }
      );
    }

    const uploads: Promise<{ url: string | null; error?: string }>[] = [
      uploadFileToCloudinary(certificate, "doctors/certificates"),
      uploadFileToCloudinary(id_document, "doctors/id_documents"),
    ];
    if (profile?.size) {
      uploads.push(uploadFileToCloudinary(profile, "doctors/profiles"));
    }

    const uploadResults = await Promise.all(uploads);
    const certUpload = uploadResults[0];
    const idUpload = uploadResults[1];
    const profileUpload = profile?.size ? uploadResults[2] : undefined;

    const uploadWarnings: string[] = [];
    if (!certUpload.url) {
      uploadWarnings.push(
        certUpload.error
          ? `Certificate upload failed: ${certUpload.error}`
          : "Certificate was not uploaded."
      );
    }
    if (!idUpload.url) {
      uploadWarnings.push(
        idUpload.error
          ? `ID document upload failed: ${idUpload.error}`
          : "ID document was not uploaded."
      );
    }
    if (profile?.size && profileUpload && !profileUpload.url) {
      uploadWarnings.push(
        profileUpload.error
          ? `Profile image upload failed: ${profileUpload.error}`
          : "Profile image was not uploaded."
      );
    }

    const supabase = getSupabaseAdmin();
    const doctorRow = {
      email,
      full_name: doctor_name,
      phone: phone_number,
      profile_image_url: profileUpload?.url ?? null,
      certificate_url: certUpload.url,
      id_document_url: idUpload.url,
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

    return NextResponse.json({
      success: true,
      doctor,
      warnings:
        uploadWarnings.length > 0
          ? uploadWarnings
          : undefined,
    });
  } catch (err) {
    return supabaseErrorResponse(err, "Doctor registration failed");
  }
}
