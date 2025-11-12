import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Store transcript on User. Audio upload via Cloudinary is currently disabled.
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

    // Audio upload removed; do not persist external audio URL.
    const audioUrl: string | null = null;

    // Fetch existing transcript and concatenate with the new one (if provided)
    const existing = await prisma.user.findUnique({
      where: { user_id: patientId },
      select: { transcripted_data: true },
    });

    // Build update payload; only update transcript if a new one was provided
    const dataToUpdate: { audio_url: string | null; transcripted_data?: string | null } = {
      audio_url: audioUrl,
    };

    if (typeof transcript === "string" && transcript.trim().length > 0) {
      const previous = existing?.transcripted_data ?? "";
      const combinedTranscript = previous ? `${previous}\n${transcript}` : transcript;
      dataToUpdate.transcripted_data = combinedTranscript;
    }

    const updated = await prisma.user.update({
      where: { user_id: patientId },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, patient: updated, audioUrl }, { status: 200 });
  } catch (error) {
    console.error("POST /api/audio error", error);
    return NextResponse.json({ error: "Failed to store audio" }, { status: 500 });
  }
}