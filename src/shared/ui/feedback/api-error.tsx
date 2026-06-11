"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import type { ApiError } from "@/lib/api/types/api-error.types";
import { Button } from "@/shared/ui/primitives/button";

type ApiErrorDisplayProps = {
  error: ApiError | Error;
  onRetry?: () => void;
  title?: string;
};

export function ApiErrorDisplay({
  error,
  onRetry,
  title = "Something went wrong",
}: ApiErrorDisplayProps) {
  const message =
    "message" in error ? error.message : "An unexpected error occurred";

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
