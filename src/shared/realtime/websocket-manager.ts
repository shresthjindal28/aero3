import { websocketConfig } from "@/config/websocket.config";
import { connectionPool } from "@/shared/realtime/connection-pool";
import { eventRegistry } from "@/shared/realtime/event-registry";
import { connectionEvents } from "@/shared/realtime/events/connection.events";
import { Heartbeat } from "@/shared/realtime/heartbeat";
import { ReconnectStrategy } from "@/shared/realtime/reconnect-strategy";
import { subscriptionManager } from "@/shared/realtime/subscription-manager";
import type { WebSocketStatus } from "@/shared/realtime/types/websocket.types";

type ConnectInput = {
  key: string;
  path: string;
  token: string;
};

export class WebSocketManager {
  private status: WebSocketStatus = "idle";
  private readonly heartbeat = new Heartbeat();
  private readonly reconnect = new ReconnectStrategy();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private lastConnectInput: ConnectInput | null = null;

  getStatus(): WebSocketStatus {
    return this.status;
  }

  connect(input: ConnectInput): WebSocket {
    this.lastConnectInput = input;
    this.setStatus("connecting");

    const url = `${websocketConfig.baseUrl}${input.path}?token=${encodeURIComponent(input.token)}`;

    const socket = connectionPool.acquire(input.key, () => new WebSocket(url));

    socket.onopen = () => {
      this.reconnect.reset();
      this.setStatus("connected");
      this.heartbeat.start(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send("ping");
        }
      });
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(String(event.data));
        subscriptionManager.dispatch("transcript", input.key, payload);
        eventRegistry.emit("transcript:message", payload);
      } catch {
        // Non-JSON heartbeat or ping responses are ignored.
      }
    };

    socket.onerror = () => {
      this.setStatus("error");
      eventRegistry.emit(connectionEvents.error, { key: input.key });
    };

    socket.onclose = (event) => {
      this.heartbeat.stop();
      this.setStatus("disconnected");
      eventRegistry.emit(connectionEvents.disconnected, { key: input.key, event });

      if (
        event.code !== websocketConfig.closeCodes.unauthorized &&
        event.code !== websocketConfig.closeCodes.forbidden &&
        this.reconnect.canRetry() &&
        this.lastConnectInput
      ) {
        this.scheduleReconnect();
      }
    };

    return socket;
  }

  disconnect(key: string): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    connectionPool.release(key);
    this.setStatus("disconnected");
  }

  shutdown(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.heartbeat.stop();
    connectionPool.closeAll();
    subscriptionManager.clear();
    eventRegistry.clear();
    this.setStatus("idle");
  }

  private scheduleReconnect(): void {
    if (!this.lastConnectInput) return;

    this.setStatus("reconnecting");
    eventRegistry.emit(connectionEvents.reconnecting, {
      key: this.lastConnectInput.key,
    });

    const delay = this.reconnect.nextAttempt();
    this.reconnectTimer = setTimeout(() => {
      if (this.lastConnectInput) {
        this.connect(this.lastConnectInput);
      }
    }, delay);
  }

  private setStatus(status: WebSocketStatus): void {
    this.status = status;
    if (status === "connected") {
      eventRegistry.emit(connectionEvents.connected, {});
    }
  }
}

export const websocketManager = new WebSocketManager();
