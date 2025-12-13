import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "report";
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const userId = formData.get("userId") as string | null;
    const note = (formData.get("note") as string | null) ?? undefined;
    const file = formData.get("report") as File | null;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const mime = file.type || "";
    let resourceType: "image" | "video" | "raw";
    if (mime === "application/pdf") {
      resourceType = "raw";
    } else if (mime.startsWith("image/")) {
      resourceType = "image";
    } else if (mime.startsWith("video/") || mime.startsWith("audio/")) {
      resourceType = "video";
    } else {
      resourceType = "raw";
    }

    const publicId = note ? slugify(note) : undefined;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `patients/${userId}/reports`,
      resource_type: resourceType,
      ...(publicId
        ? { public_id: publicId, overwrite: false, unique_filename: false, use_filename: false }
        : {}),
    });

    const reportUrl = result.secure_url;

    await prisma.report.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        file_url: reportUrl,
        note,
      },
    });

    return NextResponse.json({ success: true, url: reportUrl }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("POST /api/patient/report error:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
    }

    const reports = await prisma.report.findMany({
      where: { userId },
      orderBy: { created_at: "desc" },
    });

    const payload = reports.map((r) => ({
      id: r.id,
      userId: r.userId,
      file_url: r.file_url,
      note: r.note ?? null,
      created_at:
        r.created_at instanceof Date
          ? r.created_at.toISOString()
          : String(r.created_at),
    }));

    return NextResponse.json({ success: true, reports: payload }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch reports";
    console.error("GET /api/patient/report error:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
