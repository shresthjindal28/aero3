import { refreshAccessToken } from "@/features/auth/api/refresh.api";
import { useTokenStore } from "@/features/auth/store/token.store";
import { readStoredSession } from "@/features/auth/utils/token-storage";
import { enqueueTokenRefresh } from "@/lib/api/refresh-token-queue";
import type { ActorType } from "@/types/domain/actor.types";

export async function refreshStoredSession(
  actorType?: ActorType | null,
  refreshToken?: string | null,
): Promise<boolean> {
  const stored = readStoredSession();
  const resolvedActorType = actorType ?? stored.actorType ?? useTokenStore.getState().actorType;
  const resolvedRefreshToken =
    refreshToken ?? stored.refreshToken ?? useTokenStore.getState().refreshToken;

  if (!resolvedActorType || !resolvedRefreshToken) {
    return false;
  }

  try {
    const tokens = await enqueueTokenRefresh(
      resolvedActorType,
      resolvedRefreshToken,
      refreshAccessToken,
    );

    useTokenStore.getState().setTokens({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      actorType: resolvedActorType,
    });

    return true;
  } catch {
    return false;
  }
}
