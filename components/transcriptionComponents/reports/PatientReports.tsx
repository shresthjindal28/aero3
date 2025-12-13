"use client";

import type { Report } from "./types";

export default function PatientReports({
  reports,
}: {
  reports: Report[];
}) {
  if (reports.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground">No reports found.</p>;
  }

  return (
    <div className="p-4 space-y-3">
      {reports.map((r) => (
        <div key={r.id} className="border rounded-md p-3">
          <a
            href={r.file_url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            View Report
          </a>

          {r.note && (
            <p className="text-sm text-muted-foreground mt-1">
              {r.note}
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-1">
            {r.created_at.toLocaleString()} {/* ✅ Date-safe */}
          </p>
        </div>
      ))}
    </div>
  );
}
