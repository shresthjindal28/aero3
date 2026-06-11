import type {
  ChannelHandler,
  ChannelName,
  ChannelSubscription,
} from "@/shared/realtime/types/channel.types";

type SubscriptionRecord = {
  channel: ChannelName;
  key: string;
  handlers: Set<ChannelHandler>;
};

export class SubscriptionManager {
  private readonly subscriptions = new Map<string, SubscriptionRecord>();

  subscribe<TPayload>(
    channel: ChannelName,
    key: string,
    handler: ChannelHandler<TPayload>,
  ): ChannelSubscription {
    const subscriptionKey = `${channel}:${key}`;
    const record =
      this.subscriptions.get(subscriptionKey) ??
      ({
        channel,
        key,
        handlers: new Set(),
      } satisfies SubscriptionRecord);

    record.handlers.add(handler as ChannelHandler);
    this.subscriptions.set(subscriptionKey, record);

    return {
      channel,
      key,
      unsubscribe: () => {
        record.handlers.delete(handler as ChannelHandler);
        if (record.handlers.size === 0) {
          this.subscriptions.delete(subscriptionKey);
        }
      },
    };
  }

  dispatch<TPayload>(
    channel: ChannelName,
    key: string,
    payload: TPayload,
  ): void {
    const record = this.subscriptions.get(`${channel}:${key}`);
    if (!record) return;

    record.handlers.forEach((handler) => handler(payload));
  }

  clear(): void {
    this.subscriptions.clear();
  }
}

export const subscriptionManager = new SubscriptionManager();
