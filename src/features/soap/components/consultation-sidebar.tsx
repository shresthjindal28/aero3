"use client";

import {
  ChevronLeft,
  ChevronRight,
  Info,
  User,
} from "lucide-react";

import { ConsultationStatusBadge } from "@/features/consultations/components/consultation-status-badge";
import type { Consultation } from "@/features/consultations/types/consultation.types";
import type { Patient } from "@/features/patients/types/patient.types";
import {
  calculateAge,
  formatGender,
} from "@/features/patients/utils/patient.utils";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/shared/ui/primitives/button";

type ConsultationSidebarProps = {
  consultation: Consultation;
  patient: Patient;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onOpenDetails: () => void;
};

export function ConsultationSidebar({
  consultation,
  patient,
  collapsed,
  onToggleCollapsed,
  onOpenDetails,
}: ConsultationSidebarProps) {
  const chiefComplaint = consultation.chief_complaint ?? "—";
  const age = calculateAge(patient.date_of_birth);
  const gender = formatGender(patient.gender);

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-border/60 bg-card/20 transition-[width] duration-200 ease-out",
        collapsed ? "w-12" : "w-[220px]",
      )}
    >
      <div className="flex items-center justify-between border-b border-border/60 px-2 py-2">
        {!collapsed ? (
          <span className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Consultation
          </span>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand consultation sidebar" : "Collapse consultation sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {collapsed ? (
        <div className="flex flex-1 flex-col items-center gap-3 py-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={onOpenDetails}
            aria-label="View consultation details"
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          <SidebarField label="Patient" value={patient.full_name} prominent />
          <SidebarField label="Age" value={age} />
          <SidebarField label="Gender" value={gender} />
          <SidebarField label="Chief complaint" value={chiefComplaint} />
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </p>
            <ConsultationStatusBadge status={consultation.status} />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-auto w-full justify-start gap-2"
            onClick={onOpenDetails}
          >
            <Info className="h-3.5 w-3.5" />
            More details
          </Button>
        </div>
      )}
    </aside>
  );
}

function SidebarField({
  label,
  value,
  prominent = false,
}: {
  label: string;
  value: string;
  prominent?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "leading-snug",
          prominent ? "text-sm font-semibold" : "text-sm",
        )}
      >
        {value}
      </p>
    </div>
  );
}
