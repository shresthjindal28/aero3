import { websocketConfig } from "@/config/websocket.config";

export class ReconnectStrategy {
  private attempt = 0;

  get delayMs(): number {
    const { initialDelayMs, maxDelayMs, backoffMultiplier } =
      websocketConfig.reconnect;
    const delay = initialDelayMs * backoffMultiplier ** this.attempt;
    return Math.min(delay, maxDelayMs);
  }

  canRetry(): boolean {
    return this.attempt < websocketConfig.reconnect.maxAttempts;
  }

  nextAttempt(): number {
    this.attempt += 1;
    return this.delayMs;
  }

  reset(): void {
    this.attempt = 0;
  }
}
