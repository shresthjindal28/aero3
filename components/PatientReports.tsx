"use client";

import { CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import ReportCardList from "./ReportCardItem";

export interface ReportItem {
  id: string;
  file_url: string;
  note?: string | null;
  created_at: string;
}

interface PatientReportsProps {
  reports: ReportItem[];
  reportsLoading: boolean;
  reportsError: string | null;
}

export default function PatientReports({ reports, reportsLoading, reportsError }: PatientReportsProps) {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-center underline">
          PATIENT REPORTS
        </CardTitle>
      </CardHeader>

      <CardContent>
        {reportsLoading ? (
          <p className="text-slate-500 dark:text-slate-400 text-center">
            Loading reports...
          </p>
        ) : reportsError ? (
          <p className="text-red-600 text-center">{reportsError}</p>
        ) : reports && reports.length > 0 ? (
          <ReportCardList reports={reports} />
        ) : (
          <p className="text-slate-500 dark:text-slate-400 text-center">
            No reports uploaded yet.
          </p>
        )}
      </CardContent>
    </>
  );
}
