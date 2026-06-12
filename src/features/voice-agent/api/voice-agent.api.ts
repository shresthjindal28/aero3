import { apiClient } from "@/lib/api/client";

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
};

export type CacheWarmResponse = {
  patient_id: string;
  warmed: boolean;
  briefing_preview?: string;
  alerts_count?: number;
};

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

export async function streamVoiceUtterance(
  sessionId: string,
  utterance: string,
  handlers: {
    onToken: (token: string) => void;
    onDone: (result: VoiceUtteranceResponse) => void;
    onInterrupted?: () => void;
    signal?: AbortSignal;
  },
): Promise<void> {
  const baseUrl = apiClient.defaults.baseURL ?? "";
  const token = typeof window !== "undefined"
    ? localStorage.getItem("access_token")
    : null;

  const response = await fetch(
    `${baseUrl}/voice-agent/sessions/${sessionId}/utterance/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ utterance }),
      signal: handlers.signal,
    },
  );

  if (!response.ok || !response.body) {
    throw new Error("Streaming request failed");
  }

  const reader = response.body.getReader();
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
      } & Partial<VoiceUtteranceResponse>;

      if (payload.type === "token" && payload.content) {
        handlers.onToken(payload.content);
      } else if (payload.type === "interrupted") {
        handlers.onInterrupted?.();
      } else if (payload.type === "done") {
        handlers.onDone(payload as VoiceUtteranceResponse);
      }
    }
  }
}
