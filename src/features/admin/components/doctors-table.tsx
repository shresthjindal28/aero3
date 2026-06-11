"use client";

import Link from "next/link";

import type { DoctorProfile } from "@/features/auth/types/actor.types";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/shared/ui/primitives/button";

type DoctorsTableProps = {
  doctors: DoctorProfile[];
  onApprove?: (doctorId: string) => void;
  onReject?: (doctorId: string) => void;
  isActionPending?: boolean;
};

export function DoctorsTable({
  doctors,
  onApprove,
  onReject,
  isActionPending,
}: DoctorsTableProps) {
  if (doctors.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No doctors found.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full text-sm">
        <thead className="border-b border-border/60 bg-muted/20 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Specialization</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doctor) => (
            <tr key={doctor.id} className="border-b border-border/40 last:border-0">
              <td className="px-4 py-3">{doctor.full_name}</td>
              <td className="px-4 py-3 text-muted-foreground">{doctor.email}</td>
              <td className="px-4 py-3">{doctor.specialization ?? "—"}</td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-xs capitalize",
                    doctor.verification_status === "approved" &&
                      "border-emerald-500/30 text-emerald-400",
                    doctor.verification_status === "pending" &&
                      "border-amber-500/30 text-amber-400",
                    doctor.verification_status === "rejected" &&
                      "border-red-500/30 text-red-400",
                  )}
                >
                  {doctor.verification_status}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <Link href={routes.admin.doctorDetail(doctor.id)}>View</Link>
                  </Button>
                  {doctor.verification_status === "pending" && onApprove ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isActionPending}
                        onClick={() => onApprove(doctor.id)}
                      >
                        Approve
                      </Button>
                      {onReject ? (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={isActionPending}
                          onClick={() => onReject(doctor.id)}
                        >
                          Reject
                        </Button>
                      ) : null}
                    </>
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
