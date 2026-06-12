"use client";

import Link from "next/link";
import { Download, ExternalLink, FileText } from "lucide-react";

import type { PrescriptionListItem } from "@/features/prescription/types/prescription.types";
import { routes } from "@/shared/constants/routes";
import { formatDateTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/shared/ui/primitives/button";
import { Skeleton } from "@/shared/ui/primitives/skeleton";

type PrescriptionHistoryTableProps = {
  prescriptions: PrescriptionListItem[];
  isLoading?: boolean;
  onDownload?: (prescription: PrescriptionListItem) => void;
};

function PrescriptionStatusBadge({
  isApproved,
  version,
}: {
  isApproved: boolean;
  version: number;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        isApproved
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "bg-muted text-muted-foreground",
      )}
    >
      {isApproved ? "Approved" : "Draft"}
      {version > 1 ? ` · v${version}` : ""}
    </span>
  );
}

export function PrescriptionHistoryTable({
  prescriptions,
  isLoading,
  onDownload,
}: PrescriptionHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/20 p-10 text-center">
        <FileText className="h-8 w-8 text-muted-foreground" />
        <div>
          <p className="font-medium">No prescriptions yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Approved prescriptions become permanent clinical records in this history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr className="text-left">
            <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Diagnosis</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Medications</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Doctor</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {prescriptions.map((item) => (
            <tr key={item.id} className="border-t hover:bg-muted/20">
              <td className="whitespace-nowrap px-4 py-3">
                {formatDateTime(item.created_at)}
              </td>
              <td className="max-w-[180px] truncate px-4 py-3">
                {item.diagnosis_summary ?? item.chief_complaint ?? "—"}
              </td>
              <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">
                {item.medications_summary ?? "—"}
              </td>
              <td className="px-4 py-3">{item.doctor_name ?? "—"}</td>
              <td className="px-4 py-3">
                <PrescriptionStatusBadge
                  isApproved={item.is_approved}
                  version={item.version_number}
                />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={routes.app.prescriptionDetail(item.id)}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link
                      href={routes.app.consultationPrescription(item.consultation_id)}
                    >
                      <FileText className="h-4 w-4" />
                    </Link>
                  </Button>
                  {onDownload ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDownload(item)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
