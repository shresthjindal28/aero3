import { apiClient } from "@/lib/api/client";

export type SystemHealth = {
  database: string;
  redis: string;
  r2: string;
  worker: string;
  sarvam: string;
  deepseek: string;
  websocket: string;
};

export type WorkerSummary = {
  total: number;
  active: number;
  dead: number;
  workers: Array<{
    worker_id: string;
    hostname?: string;
    last_heartbeat?: string;
    jobs_processed: number;
    jobs_failed: number;
    active_jobs: number;
    dead: boolean;
  }>;
};

export type SystemSnapshot = {
  health: SystemHealth;
  workers: WorkerSummary;
  queue: Record<string, number>;
  cache: Record<string, unknown>;
  websockets: Record<string, unknown>;
  storage: Record<string, unknown>;
  costs: Record<string, unknown>;
  jobs: Record<string, unknown>;
};

export async function fetchSystemHealth(): Promise<SystemHealth> {
  const { data } = await apiClient.get<SystemHealth>("/system/health");
  return data;
}

export async function fetchSystemSnapshot(): Promise<SystemSnapshot> {
  const { data } = await apiClient.get<SystemSnapshot>("/system/snapshot");
  return data;
}
