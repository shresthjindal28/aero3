export const authConfig = {
  storageKeys: {
    accessToken: "airo_access_token",
    refreshToken: "airo_refresh_token",
    actorType: "airo_actor_type",
  },
  cookieKeys: {
    accessToken: "airo_access_token",
    refreshToken: "airo_refresh_token",
    actorType: "airo_actor_type",
  },
  refreshBufferMs: 5 * 60 * 1000,
  cookieMaxAgeDays: 7,
} as const;
