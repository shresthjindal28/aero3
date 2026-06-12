"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { getAiJob } from "@/features/soap/api/ai-jobs.api";
import { generateSoapNote } from "@/features/soap/api/soap.api";
import type { SoapGenerateInput } from "@/features/soap/types/soap.types";
import type { ApiError } from "@/lib/api/types/api-error.types";
import { queryKeys } from "@/shared/constants/query-keys";

const POLL_INTERVAL_MS = 2_000;
const MAX_POLL_ATTEMPTS = 90;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useGenerateSoap(consultationId: string) {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (input?: Omit<SoapGenerateInput, "consultation_id">) => {
      setIsGenerating(true);
      setError(null);

      try {
        const job = await generateSoapNote({
          consultation_id: consultationId,
          ...input,
        });

        for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
          const latest = await getAiJob(job.id);

          if (latest.status === "completed") {
            await queryClient.invalidateQueries({
              queryKey: queryKeys.soap.byConsultation(consultationId),
            });
            toast.success("SOAP note generated");
            return latest;
          }

          if (latest.status === "failed") {
            throw new Error(
              latest.error_message ?? "SOAP note generation failed",
            );
          }

          await delay(POLL_INTERVAL_MS);
        }

        throw new Error("SOAP note generation timed out. Please try again.");
      } catch (err) {
        const message =
          (err as ApiError).message ??
          (err instanceof Error ? err.message : "Failed to generate SOAP note");
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    [consultationId, queryClient],
  );

  return {
    generate,
    isGenerating,
    error,
  };
}
