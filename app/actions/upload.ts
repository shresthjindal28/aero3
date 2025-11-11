"use server";

import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import type { UploadApiResponse } from "cloudinary";

type UploadResult = { url: string };

function assertCloudinaryConfig() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary configuration missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.");
  }
}

export async function uploadAudioAction(formData: FormData): Promise<UploadResult> {
  assertCloudinaryConfig();
  const patientId = formData.get("patientId");
  const transcript = formData.get("transcript");
  const file = formData.get("file");

  if (!patientId || typeof patientId !== "string") {
    throw new Error("patientId is required");
  }
  if (!(file instanceof File)) {
    throw new Error("file is required");
  }

  // Convert File to Buffer for Cloudinary upload_stream
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let uploadRes: UploadApiResponse;
  try {
    uploadRes = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video", // audio is treated as video on Cloudinary
          folder: "patient_audio",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as UploadApiResponse);
        }
      );
      stream.end(buffer);
    });
  } catch (err: unknown) {
    console.error("Cloudinary audio upload failed", err);
    throw new Error("Cloudinary audio upload failed. Check credentials and cloud name.");
  }

  const secureUrl: string = uploadRes.secure_url;

  await prisma.user.update({
    where: { user_id: patientId },
    data: {
      audio_url: secureUrl,
      transcripted_data: typeof transcript === "string" ? transcript : null,
    },
  });

  return { url: secureUrl };
}

export async function uploadReportAction(formData: FormData): Promise<UploadResult> {
  assertCloudinaryConfig();
  const patientId = formData.get("patientId");
  const file = formData.get("file");
  const note = formData.get("note");

  if (!patientId || typeof patientId !== "string") {
    throw new Error("patientId is required");
  }
  if (!(file instanceof File)) {
    throw new Error("file is required");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let uploadRes: UploadApiResponse;
  try {
    uploadRes = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "patient_reports",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as UploadApiResponse);
        }
      );
      stream.end(buffer);
    });
  } catch (err: unknown) {
    console.error("Cloudinary report upload failed", err);
    throw new Error("Cloudinary report upload failed. Check credentials and cloud name.");
  }

  const secureUrl: string = uploadRes.secure_url;

  await prisma.report.create({
    data: {
      id: uuidv4(),
      userId: patientId,
      file_url: secureUrl,
      note: typeof note === "string" ? note : null,
    },
  });

  return { url: secureUrl };
}