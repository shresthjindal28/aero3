import Link from "next/link";
import { UserPlus, Users } from "lucide-react";

import { routes } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/primitives/button";

type EmptyPatientsStateProps = {
  hasSearch?: boolean;
};

export function EmptyPatientsState({ hasSearch = false }: EmptyPatientsStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/40 px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Users className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="text-base font-medium">
        {hasSearch ? "No patients match your search" : "No patients yet"}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {hasSearch
          ? "Try a different name, phone number, or blood group."
          : "Add your first patient to begin consultations, sessions, and clinical memory."}
      </p>
      {!hasSearch ? (
        <Button asChild className="mt-6">
          <Link href={routes.app.patientsNew}>
            <UserPlus className="h-4 w-4" />
            Add patient
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
