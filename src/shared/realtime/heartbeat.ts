import { websocketConfig } from "@/config/websocket.config";

export class Heartbeat {
  private timer: ReturnType<typeof setInterval> | null = null;

  start(send: () => void): void {
    this.stop();
    this.timer = setInterval(send, websocketConfig.heartbeatIntervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
