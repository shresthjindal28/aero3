import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Store transcript on User. Audio upload is disabled (Cloudinary removed).
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
    // If needed in the future, implement an alternative storage solution.
    const audioUrl: string | null = null;

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