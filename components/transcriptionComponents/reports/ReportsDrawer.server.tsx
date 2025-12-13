import ReportsDrawerClient from "./ReportsDrawer.client";
import { db } from "@/lib/db";
import type { Report } from "./types";

export default async function ReportsDrawer({
  patientId,
}: {
  patientId?: string;
}) {
  if (!patientId) {
    return <ReportsDrawerClient reports={[]} />;
  }

  const reports: Report[] = await db.report.findMany({
    where: { userId: patientId },
    orderBy: { created_at: "desc" },
  });

  return <ReportsDrawerClient reports={reports} />;
}
