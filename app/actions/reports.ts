"use server";

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteReport(reportId: string, patientId: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("reports").delete().eq("report_id", reportId);

  if (error) throw error;

  revalidatePath(`/dashboard/transcription/${patientId}`);
}
