"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { generatePrescription } from "@/features/prescription/api/prescription.api";
import { prescriptionQueryKeys } from "@/features/prescription/queries/prescription-queries";
import { getAiJob } from "@/features/soap/api/ai-jobs.api";
import type { ApiError } from "@/lib/api/types/api-error.types";

const POLL_INTERVAL_MS = 2_000;
const MAX_POLL_ATTEMPTS = 90;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useGeneratePrescription(consultationId: string) {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (regenerate = false) => {
      setIsGenerating(true);
      setError(null);

      try {
        const job = await generatePrescription(consultationId, regenerate);

        for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
          const latest = await getAiJob(job.id);

          if (latest.status === "completed") {
            await queryClient.invalidateQueries({
              queryKey: prescriptionQueryKeys.byConsultation(consultationId),
            });
            toast.success("Prescription generated");
            return latest;
          }

          if (latest.status === "failed") {
            throw new Error(
              latest.error_message ?? "Prescription generation failed",
            );
          }

          await delay(POLL_INTERVAL_MS);
        }

        throw new Error("Prescription generation timed out. Please try again.");
      } catch (err) {
        const message =
          (err as ApiError).message ??
          (err instanceof Error ? err.message : "Failed to generate prescription");
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    [consultationId, queryClient],
  );

  return { generate, isGenerating, error };
}
