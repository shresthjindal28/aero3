"use client";

import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { PageContainer } from "@/shared/ui/layout/page-container";
import { Button } from "@/shared/ui/primitives/button";

export default function DoctorAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageContainer>
      <ApiErrorDisplay error={error} onRetry={reset} title="Workspace error" />
      <div className="mt-4 flex justify-center">
        <Button variant="outline" onClick={() => window.location.assign("/dashboard")}>
          Go to dashboard
        </Button>
      </div>
    </PageContainer>
  );
}
