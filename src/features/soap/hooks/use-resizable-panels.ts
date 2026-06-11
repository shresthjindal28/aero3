"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseResizablePanelsInput = {
  initialLeft: number;
  initialRight: number;
  minPanelWidth?: number;
};

export function useResizablePanels({
  initialLeft,
  initialRight,
  minPanelWidth = 240,
}: UseResizablePanelsInput) {
  const [leftWidth, setLeftWidth] = useState(initialLeft);
  const [rightWidth, setRightWidth] = useState(initialRight);
  const draggingRef = useRef<"left" | "right" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      const container = containerRef.current;
      if (!container || !draggingRef.current) return;

      const rect = container.getBoundingClientRect();

      if (draggingRef.current === "left") {
        const next = event.clientX - rect.left;
        const max = rect.width - rightWidth - minPanelWidth - 16;
        setLeftWidth(Math.min(Math.max(next, minPanelWidth), max));
      }

      if (draggingRef.current === "right") {
        const next = rect.right - event.clientX;
        const max = rect.width - leftWidth - minPanelWidth - 16;
        setRightWidth(Math.min(Math.max(next, minPanelWidth), max));
      }
    },
    [leftWidth, minPanelWidth, rightWidth],
  );

  const stopDragging = useCallback(() => {
    draggingRef.current = null;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    const handleMove = (event: PointerEvent) => onPointerMove(event);
    const handleUp = () => stopDragging();

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [onPointerMove, stopDragging]);

  const startDragging = (side: "left" | "right") => {
    draggingRef.current = side;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  return {
    containerRef,
    leftWidth,
    rightWidth,
    startDragging,
  };
}
