export type ChannelName = "transcript";

export type ChannelSubscription = {
  channel: ChannelName;
  key: string;
  unsubscribe: () => void;
};

export type ChannelHandler<TPayload = unknown> = (payload: TPayload) => void;
