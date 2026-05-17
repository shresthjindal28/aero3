import ReportsDrawerClient from "./ReportsDrawer.client";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isMissingTableError } from "@/lib/supabase/errors";
import { mapReportForClient } from "@/lib/supabase/helpers";
import type { Report } from "./types";

export default async function ReportsDrawer({
  patientId,
}: {
  patientId?: string;
}) {
  if (!patientId) {
    return <ReportsDrawerClient reports={[]} />;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("patient_id", patientId)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (error) {
    if (process.env.NODE_ENV === "development" && isMissingTableError(error)) {
      console.warn(
        "[ReportsDrawer] Run frontend/supabase/schema.sql in Supabase SQL Editor."
      );
    }
    return <ReportsDrawerClient reports={[]} />;
  }

  const reports: Report[] = (data ?? []).map((r) => {
    const mapped = mapReportForClient(r);
    return {
      id: mapped.id,
      userId: mapped.userId,
      file_url: mapped.file_url,
      note: mapped.note,
      title: mapped.title,
      created_at: new Date(mapped.created_at),
    };
  });

  return <ReportsDrawerClient reports={reports} />;
}
