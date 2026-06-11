"use client";

import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { Button } from "@/shared/ui/primitives/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <ApiErrorDisplay error={error} onRetry={reset} title="Application error" />
      <Button variant="outline" onClick={() => window.location.assign("/")}>
        Return home
      </Button>
    </div>
  );
}
