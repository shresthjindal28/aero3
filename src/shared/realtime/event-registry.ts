import type { ChannelHandler } from "@/shared/realtime/types/channel.types";

type EventMap = Map<string, Set<ChannelHandler>>;

export class EventRegistry {
  private readonly events: EventMap = new Map();

  on<TPayload>(event: string, handler: ChannelHandler<TPayload>): () => void {
    const handlers = this.events.get(event) ?? new Set();
    handlers.add(handler as ChannelHandler);
    this.events.set(event, handlers);

    return () => {
      handlers.delete(handler as ChannelHandler);
      if (handlers.size === 0) {
        this.events.delete(event);
      }
    };
  }

  emit<TPayload>(event: string, payload: TPayload): void {
    const handlers = this.events.get(event);
    if (!handlers) return;

    handlers.forEach((handler) => {
      handler(payload);
    });
  }

  clear(): void {
    this.events.clear();
  }
}

export const eventRegistry = new EventRegistry();
