import type {
  Session,
  SessionStartInput,
} from "@/features/sessions/types/session.types";
import { apiClient } from "@/lib/api/client";

export async function startSession(input: SessionStartInput): Promise<Session> {
  const { data } = await apiClient.post<Session>("/sessions/start", input);
  return data;
}

export async function getSession(id: string): Promise<Session> {
  const { data } = await apiClient.get<Session>(`/sessions/${id}`);
  return data;
}

export async function listSessionsByConsultation(
  consultationId: string,
): Promise<Session[]> {
  const { data } = await apiClient.get<Session[]>(
    `/sessions/consultation/${consultationId}`,
  );
  return data;
}

export async function pauseSession(id: string): Promise<Session> {
  const { data } = await apiClient.post<Session>(`/sessions/${id}/pause`);
  return data;
}

export async function resumeSession(id: string): Promise<Session> {
  const { data } = await apiClient.post<Session>(`/sessions/${id}/resume`);
  return data;
}

export async function endSession(id: string): Promise<Session> {
  const { data } = await apiClient.post<Session>(`/sessions/${id}/end`);
  return data;
}
