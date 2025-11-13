import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

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
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = user.id;

    const formData = await req.formData();
    const phone_number = (formData.get("phone_number") as string) || undefined;
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

    // Upload to Cloudinary (server-side)
    const [certificate_url, id_document_url] = await Promise.all([
      uploadFileToCloudinary(certificate, "doctors/certificates"),
      uploadFileToCloudinary(id_document, "doctors/id_documents"),
    ]);

    const doctor_name =
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      user.emailAddresses[0]?.emailAddress ||
      "Doctor";

    // Upsert Doctor record
    const doctor = await prisma.doctor.upsert({
      where: { doctor_id: userId },
      update: {
        doctor_name,
        phone_number,
        certificate_url,
        id_document_url,
      },
      create: {
        doctor_id: userId,
        doctor_name,
        phone_number,
        certificate_url,
        id_document_url,
      },
    });

    return NextResponse.json({ success: true, doctor });
  } catch (err) {
    console.error("Doctor register error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
