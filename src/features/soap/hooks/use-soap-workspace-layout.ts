"use client";

import { useCallback, useState } from "react";

const TRANSCRIPT_WIDTH_COLLAPSED = 0;
const TRANSCRIPT_WIDTH_DEFAULT = 280;
const TRANSCRIPT_WIDTH_EXPANDED = 500;

export function useSoapWorkspaceLayout() {
  const [consultationSidebarCollapsed, setConsultationSidebarCollapsed] =
    useState(false);
  const [consultationDetailsOpen, setConsultationDetailsOpen] = useState(false);
  const [transcriptCollapsed, setTranscriptCollapsed] = useState(false);
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [transcriptDrawerOpen, setTranscriptDrawerOpen] = useState(false);

  const transcriptWidth = transcriptCollapsed
    ? TRANSCRIPT_WIDTH_COLLAPSED
    : transcriptExpanded
      ? TRANSCRIPT_WIDTH_EXPANDED
      : TRANSCRIPT_WIDTH_DEFAULT;

  const toggleConsultationSidebar = useCallback(() => {
    setConsultationSidebarCollapsed((current) => !current);
  }, []);

  const toggleTranscriptCollapsed = useCallback(() => {
    setTranscriptCollapsed((current) => {
      if (current) setTranscriptExpanded(false);
      return !current;
    });
  }, []);

  const toggleTranscriptExpanded = useCallback(() => {
    setTranscriptExpanded((current) => !current);
    setTranscriptCollapsed(false);
  }, []);

  return {
    consultationSidebarCollapsed,
    consultationDetailsOpen,
    transcriptCollapsed,
    transcriptExpanded,
    transcriptWidth,
    aiAssistantOpen,
    transcriptDrawerOpen,
    setConsultationDetailsOpen,
    setAiAssistantOpen,
    setTranscriptDrawerOpen,
    toggleConsultationSidebar,
    toggleTranscriptCollapsed,
    toggleTranscriptExpanded,
  };
}
