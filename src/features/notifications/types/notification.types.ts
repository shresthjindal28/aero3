export type NotificationType =
  | "ai_job"
  | "verification"
  | "transcript"
  | "soap"
  | "system";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  href?: string;
};
