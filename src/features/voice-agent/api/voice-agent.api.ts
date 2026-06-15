import { apiClient } from "@/lib/api/client";
import { useTokenStore } from "@/features/auth/store/token.store";
import { readStoredSession } from "@/features/auth/utils/token-storage";

function getAccessToken(): string | null {
  return (
    useTokenStore.getState().accessToken ?? readStoredSession().accessToken
  );
}

export type VoiceSessionStartInput = {
  patient_id: string;
  consultation_id?: string;
  session_id?: string;
};

export type VoiceSessionStartResponse = {
  session_id: string;
  patient_id: string;
  consultation_id: string | null;
  briefing_preview: string | null;
  alerts_preview?: string | null;
};

export type VoiceUtteranceResponse = {
  session_id: string;
  patient_id: string;
  utterance: string;
  answer: string;
  intent: string;
  latency_ms: number;
  cache_hit: boolean;
  sources_used: string[];
  retrieval_count: number;
  speak: boolean;
  stt_latency_ms?: number;
  tts_latency_ms?: number;
  retrieval_latency_ms?: number;
  llm_latency_ms?: number;
  audio_available?: boolean;
};

export type VoicePipelineStatus = {
  speech_to_speech_enabled: boolean;
  stt_provider: string;
  tts_provider: string;
  llm_provider: string;
};

export type CacheWarmResponse = {
  patient_id: string;
  warmed: boolean;
  briefing_preview?: string;
  alerts_count?: number;
};

export async function getVoicePipelineStatus(): Promise<VoicePipelineStatus> {
  const { data } = await apiClient.get<VoicePipelineStatus>(
    "/voice-agent/pipeline/status",
  );
  return data;
}

export async function warmPatientCache(
  patientId: string,
): Promise<CacheWarmResponse> {
  const { data } = await apiClient.post<CacheWarmResponse>(
    `/voice-agent/cache/warm/${patientId}`,
  );
  return data;
}

export async function startVoiceSession(
  input: VoiceSessionStartInput,
): Promise<VoiceSessionStartResponse> {
  const { data } = await apiClient.post<VoiceSessionStartResponse>(
    "/voice-agent/sessions",
    input,
  );
  return data;
}

export async function sendVoiceUtterance(
  sessionId: string,
  utterance: string,
): Promise<VoiceUtteranceResponse> {
  const { data } = await apiClient.post<VoiceUtteranceResponse>(
    `/voice-agent/sessions/${sessionId}/utterance`,
    { utterance },
  );
  return data;
}

export async function interruptVoiceSession(sessionId: string): Promise<void> {
  await apiClient.post(`/voice-agent/sessions/${sessionId}/interrupt`);
}

type StreamHandlers = {
  onToken: (token: string) => void;
  onDone: (result: VoiceUtteranceResponse) => void;
  onInterrupted?: () => void;
  onStatus?: (stage: string) => void;
  onTranscript?: (text: string) => void;
  onAudio?: (audio: { content: string; mime: string }) => void;
  onError?: (message: string) => void;
  signal?: AbortSignal;
  timeoutMs?: number;
};

async function consumeSseStream(
  response: Response,
  handlers: StreamHandlers,
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = JSON.parse(line.slice(6)) as {
        type: string;
        content?: string;
        mime?: string;
        message?: string;
        stage?: string;
      } & Partial<VoiceUtteranceResponse>;

      switch (payload.type) {
        case "status":
          if (payload.stage) handlers.onStatus?.(payload.stage);
          break;
        case "token":
          if (payload.content) handlers.onToken(payload.content);
          break;
        case "transcript":
          if (payload.content) handlers.onTranscript?.(payload.content);
          break;
        case "audio":
          if (payload.content && payload.mime) {
            handlers.onAudio?.({ content: payload.content, mime: payload.mime });
          }
          break;
        case "interrupted":
          handlers.onInterrupted?.();
          break;
        case "error":
          handlers.onError?.(payload.message ?? "Voice pipeline error");
          break;
        case "tts_fallback":
          break;
        case "done":
          handlers.onDone(payload as VoiceUtteranceResponse);
          break;
        default:
          break;
      }
    }
  }
}

export async function streamVoiceUtterance(
  sessionId: string,
  utterance: string,
  handlers: StreamHandlers,
): Promise<void> {
  const baseUrl = apiClient.defaults.baseURL ?? "";
  const token = getAccessToken();
  const timeoutMs = handlers.timeoutMs ?? 120_000;
  const timeoutController = new AbortController();
  const timeoutId = window.setTimeout(() => timeoutController.abort(), timeoutMs);

  const abortController = new AbortController();
  const onExternalAbort = () => abortController.abort();
  handlers.signal?.addEventListener("abort", onExternalAbort, { once: true });
  timeoutController.signal.addEventListener("abort", onExternalAbort, { once: true });

  try {
    const response = await fetch(
      `${baseUrl}/voice-agent/sessions/${sessionId}/utterance/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ utterance }),
        signal: abortController.signal,
        credentials: "include",
      },
    );

    if (!response.ok || !response.body) {
      if (response.status === 401) {
        throw new Error("Voice session expired. Please refresh the page and sign in again.");
      }
      throw new Error(`Streaming request failed (${response.status})`);
    }

    await consumeSseStream(response, handlers);
  } catch (error) {
    if (timeoutController.signal.aborted && !handlers.signal?.aborted) {
      throw new Error("Voice assistant timed out. Please try a shorter question.");
    }
    throw error;
  } finally {
    handlers.signal?.removeEventListener("abort", onExternalAbort);
    window.clearTimeout(timeoutId);
  }
}

export async function streamVoiceAudioUtterance(
  sessionId: string,
  audioBlob: Blob,
  mimeType: string,
  handlers: StreamHandlers,
): Promise<void> {
  const baseUrl = apiClient.defaults.baseURL ?? "";
  const token = getAccessToken();
  const form = new FormData();
  form.append("audio", audioBlob, "utterance.webm");
  form.append("mime_type", mimeType);

  const response = await fetch(
    `${baseUrl}/voice-agent/sessions/${sessionId}/utterance/audio/stream`,
    {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: form,
      signal: handlers.signal,
      credentials: "include",
    },
  );

  if (!response.ok || !response.body) {
    if (response.status === 401) {
      throw new Error("Voice session expired. Please refresh the page and sign in again.");
    }
    throw new Error(`Audio streaming request failed (${response.status})`);
  }

  await consumeSseStream(response, handlers);
}
