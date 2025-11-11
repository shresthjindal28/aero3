import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Upload audio to Cloudinary and store URL/transcript on User (optional)
export async function POST(req: Request) {
  try {
    const { patientId, audioBase64, transcript } = (await req.json()) as {
      patientId: string;
      audioBase64?: string;
      transcript?: string;
    };

    if (!patientId || typeof patientId !== "string") {
      return NextResponse.json({ error: "patientId is required" }, { status: 400 });
    }

    let audioUrl: string | null = null;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (audioBase64 && cloudName && uploadPreset) {
      const formData = new FormData();
      formData.append("file", typeof audioBase64 === "string" ? audioBase64 : String(audioBase64));
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "patient-audio");

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      });

      if (uploadRes.ok) {
        const payload = await uploadRes.json();
        audioUrl = payload.secure_url ?? payload.url ?? null;
      } else {
        console.warn("Cloudinary upload failed", await uploadRes.text());
      }
    }

    const updated = await prisma.user.update({
      where: { user_id: patientId },
      data: {
        audio_url: audioUrl,
        transcripted_data: transcript ?? null,
      },
    });

    return NextResponse.json({ success: true, patient: updated, audioUrl }, { status: 200 });
  } catch (error) {
    console.error("POST /api/audio error", error);
    return NextResponse.json({ error: "Failed to store audio" }, { status: 500 });
  }
}