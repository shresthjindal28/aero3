import { NextResponse } from "next/server";
import { generatePatientId } from "@/lib/generateId";
import { prisma } from "@/lib/prisma";

// Create new patient
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, address, treatedby } = body || {};

    if (!name || typeof name !== "string" || !treatedby) {
      return NextResponse.json(
        { error: "Patient name is required & doctor id is req" },
        { status: 400 }
      );
    }

    const userId = generatePatientId();

    // const user = await prisma.user.create({
    //   data: {
    //     user_id: userId,
    //     user_name: name,
    //     user_mobile: phone ?? null,
    //     address: address ?? null,

    //   } as any,
    // });

    const user = await prisma.user.create({
      data: {
        user_id: userId,
        user_name: name,
        user_mobile: phone ?? null,
        address: address ?? null,
        treated_by: treatedby,
      },
    });
    const patient = {
      user_id: user.user_id,
      user_name: user.user_name,
      user_mobile: user.user_mobile ?? null,
      address: user.address ?? null,
    };

    return NextResponse.json({ success: true, patient }, { status: 201 });
  } catch (error) {
    console.error("POST /api/patient error", error);
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 });
  }
}

// Fetch patient by ID: /api/patient?id=PAT-123456
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { user_id: id },
    });

    if (!user) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const patient = {
      user_id: user.user_id,
      user_name: user.user_name,
      user_mobile: user.user_mobile ?? null,
      address: user.address ?? null,
    };

    return NextResponse.json({ patient }, { status: 200 });
  } catch (error) {
    console.error("GET /api/patient error", error);
    return NextResponse.json({ error: "Failed to fetch patient" }, { status: 500 });
  }
}
