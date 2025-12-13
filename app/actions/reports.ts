"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteReport(reportId: string, patientId: string) {
  await db.report.delete({
    where: { id: reportId },
  });

  revalidatePath(`/dashboard/transcription/${patientId}`);
}
