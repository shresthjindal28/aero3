import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

export async function POST(req: Request) {
  const fd = await req.formData();
  if (!fd) return NextResponse.json({ error: "fd not found" }, { status: 402 });

  const soap_notes = fd.get("soap_notes") as string | null;
  const patient_id = fd.get("patient_id") as string | null;
  const transcribed_text = fd.get("transcribed_text") as string | null;
  console.log(soap_notes);
  console.log([patient_id]);

  if (!soap_notes || !patient_id || !transcribed_text)
    return NextResponse.json({ error: "proper fields not found" }, { status: 402 });

  try {
    const user = await prisma.user.findUnique({
      where: {
        user_id: patient_id,
      },
      select: {
        user_name: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: "Patient Not found" }, { status: 404 });
    }
    const response = await fetch("https://771fd7603723.ngrok-free.app/soap-notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patient_id: patient_id,
        soap_notes: soap_notes,
        date_time: new Date().toUTCString(),
        patient_name: user.user_name,
      }),
    });
    const body = await response.json();
    if (body.status === "processing") return NextResponse.json({ status: 200 });
    else
      NextResponse.json({ error: "Error while embedding data to rag" }, { status: 500 });
  } catch (error: unknown) {
    console.error("Update SOAP notes error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message,
      },
      { status: 500 }
    );
  }
}
