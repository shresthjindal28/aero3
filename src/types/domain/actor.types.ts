export type ActorType = "doctor" | "admin" | "receptionist";

export type AuthSession = {
  actorType: ActorType;
  accessToken: string;
  refreshToken: string;
  expiresAt: number | null;
};
