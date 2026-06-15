"use client";

import { useCallback, useRef, useState } from "react";

import {
  interruptVoiceSession,
  startVoiceSession,
  streamVoiceAudioUtterance,
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
  stt_latency_ms?: number;
  tts_latency_ms?: number;
};

type UseVoiceAgentOptions = {
  patientId: string;
  consultationId?: string;
};

const STATUS_LABELS: Record<string, string> = {
  preparing: "Searching patient records…",
  generating: "Generating answer…",
};

function playBase64Audio(base64: string, mime: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const src = `data:${mime};base64,${base64}`;
    const audio = new Audio(src);
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("Audio playback failed"));
    void audio.play().catch(reject);
  });
}

export function useVoiceAgent({ patientId, consultationId }: UseVoiceAgentOptions) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStage, setThinkingStage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [briefingPreview, setBriefingPreview] = useState<string | null>(null);
  const [alertsPreview, setAlertsPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const assistantTurnIdRef = useRef<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const serverAudioRef = useRef<HTMLAudioElement | null>(null);

  const finalizeAssistantTurn = useCallback((assistantId: string, content: string) => {
    setTurns((current) =>
      current.map((turn) =>
        turn.id === assistantId
          ? { ...turn, content, streaming: false }
          : turn,
      ),
    );
  }, []);

  const stopOutput = useCallback((options?: { notifyServer?: boolean }) => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    speechRef.current = null;
    serverAudioRef.current?.pause();
    serverAudioRef.current = null;
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsSpeaking(false);
    setIsListening(false);
    setIsThinking(false);
    setThinkingStage(null);
    if (sessionIdRef.current && options?.notifyServer !== false) {
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

  const speakFallback = useCallback((text: string) => {
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

  const processUtteranceStream = useCallback(
    async (sid: string, utterance: string, assistantId: string) => {
      abortRef.current = new AbortController();
      let accumulated = "";
      let pendingAudio: { content: string; mime: string } | null = null;
      let completed = false;

      await streamVoiceUtterance(sid, utterance, {
        signal: abortRef.current.signal,
        onStatus: (stage) => {
          setThinkingStage(STATUS_LABELS[stage] ?? "Working on your question…");
        },
        onToken: (token) => {
          accumulated += token;
          setTurns((current) =>
            current.map((turn) =>
              turn.id === assistantId ? { ...turn, content: accumulated } : turn,
            ),
          );
        },
        onInterrupted: () => {
          if (!accumulated) {
            finalizeAssistantTurn(
              assistantId,
              "Response interrupted. Ask again to continue.",
            );
          }
          stopOutput({ notifyServer: false });
        },
        onError: (message) => {
          finalizeAssistantTurn(assistantId, message);
          setError(message);
        },
        onAudio: (audio) => {
          pendingAudio = audio;
        },
        onDone: (result) => {
          completed = true;
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
                    stt_latency_ms: result.stt_latency_ms,
                    tts_latency_ms: result.tts_latency_ms,
                  }
                : turn,
            ),
          );
          if (pendingAudio) {
            setIsSpeaking(true);
            void playBase64Audio(pendingAudio.content, pendingAudio.mime)
              .catch(() => {
                if (result.speak && result.answer) speakFallback(result.answer);
              })
              .finally(() => setIsSpeaking(false));
          } else if (result.speak && result.answer) {
            speakFallback(result.answer);
          }
        },
      });

      if (!completed && !accumulated) {
        throw new Error("No response received from the clinical assistant.");
      }
    },
    [finalizeAssistantTurn, speakFallback, stopOutput],
  );

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
      setThinkingStage("Starting…");

      const doctorTurnId = crypto.randomUUID();
      setTurns((current) => [
        ...current,
        { id: doctorTurnId, role: "doctor", content: trimmed },
      ]);

      const assistantId = crypto.randomUUID();
      assistantTurnIdRef.current = assistantId;
      setTurns((current) => [
        ...current,
        { id: assistantId, role: "assistant", content: "", streaming: true },
      ]);

      try {
        const sid = await ensureSession();
        await processUtteranceStream(sid, trimmed, assistantId);
        return null;
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          const message = (err as Error).message ?? "Voice agent request failed";
          setError(message);
          finalizeAssistantTurn(
            assistantId,
            "I couldn't generate a response. Please try again.",
          );
        }
        return null;
      } finally {
        setIsThinking(false);
        setThinkingStage(null);
        abortRef.current = null;
      }
    },
    [ensureSession, finalizeAssistantTurn, processUtteranceStream, stopOutput],
  );

  const askWithAudio = useCallback(
    async (blob: Blob, mimeType: string) => {
      setError(null);
      setIsThinking(true);
      setThinkingStage("Transcribing audio…");

      const assistantId = crypto.randomUUID();
      assistantTurnIdRef.current = assistantId;
      setTurns((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "doctor", content: "(voice)" },
        { id: assistantId, role: "assistant", content: "", streaming: true },
      ]);

      try {
        const sid = await ensureSession();
        abortRef.current = new AbortController();
        let transcript = "";
        let pendingAudio: { content: string; mime: string } | null = null;
        let completed = false;

        await streamVoiceAudioUtterance(sid, blob, mimeType, {
          signal: abortRef.current.signal,
          onStatus: (stage) => {
            setThinkingStage(STATUS_LABELS[stage] ?? "Working on your question…");
          },
          onTranscript: (text) => {
            transcript = text;
            setTurns((current) =>
              current.map((turn, index) =>
                index === current.length - 2 && turn.role === "doctor"
                  ? { ...turn, content: text }
                  : turn,
              ),
            );
          },
          onToken: (token) => {
            setTurns((current) =>
              current.map((turn) =>
                turn.id === assistantId
                  ? { ...turn, content: (turn.content || "") + token }
                  : turn,
              ),
            );
          },
          onAudio: (audio) => {
            pendingAudio = audio;
          },
          onInterrupted: () => {
            finalizeAssistantTurn(
              assistantId,
              "Response interrupted. Ask again to continue.",
            );
            stopOutput({ notifyServer: false });
          },
          onDone: (result) => {
            completed = true;
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
                      stt_latency_ms: result.stt_latency_ms,
                      tts_latency_ms: result.tts_latency_ms,
                    }
                  : turn,
              ),
            );
            if (pendingAudio) {
              setIsSpeaking(true);
              void playBase64Audio(pendingAudio.content, pendingAudio.mime)
                .catch(() => {
                  if (result.speak && result.answer) speakFallback(result.answer);
                })
                .finally(() => setIsSpeaking(false));
            } else if (result.speak && result.answer) {
              speakFallback(result.answer);
            }
          },
          onError: (message) => {
            finalizeAssistantTurn(assistantId, message);
            setError(message);
          },
        });

        if (!completed) {
          throw new Error("No response received from the clinical assistant.");
        }

        if (!transcript) {
          setError("Could not transcribe audio. Try again or type your question.");
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          const message = (err as Error).message ?? "Voice upload failed";
          setError(message);
          finalizeAssistantTurn(
            assistantId,
            "I couldn't generate a response. Please try again.",
          );
        }
      } finally {
        setIsThinking(false);
        setThinkingStage(null);
        abortRef.current = null;
      }
    },
    [ensureSession, finalizeAssistantTurn, speakFallback, stopOutput],
  );

  const startListening = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Microphone not available in this browser.");
      return;
    }
    stopOutput();
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (blob.size > 0) {
          void askWithAudio(blob, "audio/webm");
        }
        setIsListening(false);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsListening(true);
    } catch (err) {
      setError((err as Error).message ?? "Microphone permission denied");
      setIsListening(false);
    }
  }, [askWithAudio, stopOutput]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    } else {
      setIsListening(false);
    }
  }, []);

  return {
    sessionId,
    turns,
    isStarting,
    isThinking,
    thinkingStage,
    isSpeaking,
    isListening,
    briefingPreview,
    alertsPreview,
    error,
    ask,
    startListening,
    stopListening,
    stopOutput,
    ensureSession,
  };
}
