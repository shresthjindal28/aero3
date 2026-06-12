"use client";

import { useCallback, useEffect, useRef } from "react";

export function useAutoResizeTextarea(value: string, minHeight = 120) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.max(element.scrollHeight, minHeight)}px`;
  }, [minHeight]);

  useEffect(() => {
    resize();
  }, [value, resize]);

  return { ref, resize };
}
