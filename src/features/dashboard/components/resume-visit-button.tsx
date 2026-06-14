"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useActiveSessionsMap } from "@/features/sessions/hooks/use-active-sessions-map";
import { routes } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/primitives/button";

type ResumeVisitButtonProps = {
  consultationId: string;
  size?: "default" | "sm" | "lg";
  className?: string;
};

export function ResumeVisitButton({
  consultationId,
  size = "lg",
  className,
}: ResumeVisitButtonProps) {
  const { sessionByConsultationId } = useActiveSessionsMap([consultationId]);
  const activeSession = sessionByConsultationId.get(consultationId);
  const href = activeSession
    ? routes.app.sessionDetail(activeSession.id)
    : routes.app.consultationDetail(consultationId);
  const label = activeSession ? "Continue visit" : "Begin visit";

  return (
    <Button asChild size={size} className={className}>
      <Link href={href}>
        {label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  );
}
