"use client";

import { useCallback, useRef, useState } from "react";

const MAX_HISTORY = 50;

export function useHtmlEditorHistory(initialHtml: string) {
  const [html, setHtml] = useState(initialHtml);
  const [historyIndex, setHistoryIndex] = useState(0);
  const historyRef = useRef<string[]>([initialHtml]);
  const isApplyingRef = useRef(false);

  const pushState = useCallback((nextHtml: string) => {
    if (isApplyingRef.current) return;

    const current = historyRef.current[historyIndex];
    if (current === nextHtml) return;

    const truncated = historyRef.current.slice(0, historyIndex + 1);
    truncated.push(nextHtml);
    if (truncated.length > MAX_HISTORY) {
      truncated.shift();
    }

    historyRef.current = truncated;
    const nextIndex = truncated.length - 1;
    setHistoryIndex(nextIndex);
    setHtml(nextHtml);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return null;
    const nextIndex = historyIndex - 1;
    const previous = historyRef.current[nextIndex];
    isApplyingRef.current = true;
    setHistoryIndex(nextIndex);
    setHtml(previous);
    isApplyingRef.current = false;
    return previous;
  }, [historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= historyRef.current.length - 1) return null;
    const nextIndex = historyIndex + 1;
    const next = historyRef.current[nextIndex];
    isApplyingRef.current = true;
    setHistoryIndex(nextIndex);
    setHtml(next);
    isApplyingRef.current = false;
    return next;
  }, [historyIndex]);

  const reset = useCallback((nextHtml: string) => {
    historyRef.current = [nextHtml];
    setHistoryIndex(0);
    setHtml(nextHtml);
  }, []);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyRef.current.length - 1;

  return {
    html,
    pushState,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  };
}
