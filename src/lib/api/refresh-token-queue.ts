import type { TokenResponse } from "@/lib/api/types/api-response.types";
import type { ActorType } from "@/types/domain/actor.types";

type RefreshHandler = (refreshToken: string) => Promise<TokenResponse>;

let refreshPromise: Promise<TokenResponse> | null = null;

export async function enqueueTokenRefresh(
  actorType: ActorType,
  refreshToken: string,
  handler: RefreshHandler,
): Promise<TokenResponse> {
  if (!refreshPromise) {
    refreshPromise = handler(refreshToken).finally(() => {
      refreshPromise = null;
    });
  }

  void actorType;
  return refreshPromise;
}

export function clearRefreshQueue(): void {
  refreshPromise = null;
}
