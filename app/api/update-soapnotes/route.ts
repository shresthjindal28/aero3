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
    const updated = await prisma.user.update({
      where: {
        user_id: patient_id,
      },
      data: {
        transcripted_data: {
          push: transcribed_text,
        },
        soapNotes: {
          create: {
            id: randomUUID(),
            note: soap_notes,
          },
        },
      },
    });
    if (!updated) {
      return NextResponse.json({ error: "Could Not update" }, { status: 500 });
    }
    return NextResponse.json({ status: 200 });
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
