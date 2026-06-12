"use client";

import { useEffect } from "react";

import { warmPatientCache } from "@/features/voice-agent/api/voice-agent.api";

export function useCacheWarm(patientId: string | undefined, enabled = true) {
  useEffect(() => {
    if (!patientId || !enabled) return;
    void warmPatientCache(patientId).catch(() => {
      // Non-blocking — cache warm is best-effort
    });
  }, [patientId, enabled]);
}
