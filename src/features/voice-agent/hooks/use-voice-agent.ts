"use client";

import { useCallback, useRef, useState } from "react";

import {
  interruptVoiceSession,
  startVoiceSession,
  streamVoiceUtterance,
  type VoiceUtteranceResponse,
} from "@/features/voice-agent/api/voice-agent.api";

export type VoiceTurn = {
  id: string;
  role: "doctor" | "assistant";
  content: string;
  latency_ms?: number;
  cache_hit?: boolean;
  intent?: string;
  streaming?: boolean;
};

type UseVoiceAgentOptions = {
  patientId: string;
  consultationId?: string;
};

export function useVoiceAgent({ patientId, consultationId }: UseVoiceAgentOptions) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [briefingPreview, setBriefingPreview] = useState<string | null>(null);
  const [alertsPreview, setAlertsPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const assistantTurnIdRef = useRef<string | null>(null);

  const stopOutput = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    speechRef.current = null;
    setIsSpeaking(false);
    setIsThinking(false);
    if (sessionIdRef.current) {
      void interruptVoiceSession(sessionIdRef.current);
    }
    setTurns((current) =>
      current.map((turn) =>
        turn.id === assistantTurnIdRef.current
          ? { ...turn, streaming: false }
          : turn,
      ),
    );
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const ensureSession = useCallback(async () => {
    if (sessionIdRef.current) return sessionIdRef.current;
    setIsStarting(true);
    setError(null);
    try {
      const session = await startVoiceSession({
        patient_id: patientId,
        consultation_id: consultationId,
      });
      sessionIdRef.current = session.session_id;
      setSessionId(session.session_id);
      setBriefingPreview(session.briefing_preview);
      setAlertsPreview(session.alerts_preview ?? null);
      return session.session_id;
    } catch (err) {
      setError((err as Error).message ?? "Failed to start voice session");
      throw err;
    } finally {
      setIsStarting(false);
    }
  }, [consultationId, patientId]);

  const ask = useCallback(
    async (utterance: string): Promise<VoiceUtteranceResponse | null> => {
      const trimmed = utterance.trim();
      if (!trimmed) return null;

      if (/^(stop|cancel|interrupt|halt|enough)$/i.test(trimmed)) {
        stopOutput();
        return null;
      }

      setError(null);
      setIsThinking(true);

      const doctorTurnId = crypto.randomUUID();
      setTurns((current) => [
        ...current,
        { id: doctorTurnId, role: "doctor", content: trimmed },
      ]);

      const assistantId = crypto.randomUUID();
      assistantTurnIdRef.current = assistantId;
      setTurns((current) => [
        ...current,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          streaming: true,
        },
      ]);

      try {
        const sid = await ensureSession();
        abortRef.current = new AbortController();

        let accumulated = "";

        await streamVoiceUtterance(sid, trimmed, {
          signal: abortRef.current.signal,
          onToken: (token) => {
            accumulated += token;
            setTurns((current) =>
              current.map((turn) =>
                turn.id === assistantId
                  ? { ...turn, content: accumulated }
                  : turn,
              ),
            );
            if (accumulated.length === token.length) {
              speak(accumulated);
            }
          },
          onInterrupted: () => {
            stopOutput();
          },
          onDone: (result) => {
            setTurns((current) =>
              current.map((turn) =>
                turn.id === assistantId
                  ? {
                      ...turn,
                      content: result.answer,
                      latency_ms: result.latency_ms,
                      cache_hit: result.cache_hit,
                      intent: result.intent,
                      streaming: false,
                    }
                  : turn,
              ),
            );
            if (result.speak && result.answer) {
              speak(result.answer);
            }
          },
        });

        return null;
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError((err as Error).message ?? "Voice agent request failed");
        }
        return null;
      } finally {
        setIsThinking(false);
        abortRef.current = null;
      }
    },
    [ensureSession, speak, stopOutput],
  );

  return {
    sessionId,
    turns,
    isStarting,
    isThinking,
    isSpeaking,
    briefingPreview,
    alertsPreview,
    error,
    ask,
    stopOutput,
    ensureSession,
  };
}
