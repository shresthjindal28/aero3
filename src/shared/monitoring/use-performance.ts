"use client";

import { useEffect } from "react";

export function usePerformanceTracking(pageName: string) {
  useEffect(() => {
    if (typeof window === "undefined" || !("performance" in window)) return;

    const mark = `${pageName}-mounted`;
    performance.mark(mark);

    return () => {
      try {
        performance.clearMarks(mark);
      } catch {
        // Ignore cleanup errors.
      }
    };
  }, [pageName]);
}
