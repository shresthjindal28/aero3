export const authConfig = {
  storageKeys: {
    accessToken: "airo_access_token",
    refreshToken: "airo_refresh_token",
    actorType: "airo_actor_type",
    verificationStatus: "airo_verification_status",
    doctorAccessState: "airo_doctor_access_state",
  },
  cookieKeys: {
    accessToken: "airo_access_token",
    refreshToken: "airo_refresh_token",
    actorType: "airo_actor_type",
    verificationStatus: "airo_verification_status",
    doctorAccessState: "airo_doctor_access_state",
  },
  refreshBufferMs: 5 * 60 * 1000,
  cookieMaxAgeDays: 30,
} as const;
