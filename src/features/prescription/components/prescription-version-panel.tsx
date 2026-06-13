"use client";

import Link from "next/link";

import { usePrescriptionVersions } from "@/features/prescription/hooks/use-prescription-versions";
import { routes } from "@/shared/constants/routes";
import { formatDateTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

type PrescriptionVersionPanelProps = {
  prescriptionId: string;
  activeVersionId?: string;
  className?: string;
};

export function PrescriptionVersionPanel({
  prescriptionId,
  activeVersionId,
  className,
}: PrescriptionVersionPanelProps) {
  const { data: versions = [], isLoading } = usePrescriptionVersions(prescriptionId);

  if (isLoading) {
    return (
      <div className={cn("rounded-xl border border-border/60 p-4 text-sm", className)}>
        Loading versions…
      </div>
    );
  }

  if (versions.length === 0) {
    return null;
  }

  return (
    <div className={cn("rounded-xl border border-border/60 bg-card p-4", className)}>
      {versions.length > 1 ? (
        <>
          <h3 className="text-sm font-semibold">Version history</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Clinical revisions are preserved for medico-legal auditability.
          </p>
        </>
      ) : null}
      <ul className={cn("space-y-2", versions.length > 1 ? "mt-4" : "")}>
        {versions.map((version) => {
          const isActive = version.id === (activeVersionId ?? prescriptionId);
          return (
            <li key={version.id}>
              <Link
                href={routes.app.prescriptionDetail(version.id)}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/60 hover:bg-muted/40",
                )}
              >
                <span>Version {version.version_number}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      version.is_approved
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {version.is_approved ? "Approved" : "Draft"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(version.created_at)}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
