import { authConfig } from "@/config/auth.config";
import type { ActorType } from "@/types/domain/actor.types";

const isBrowser = typeof window !== "undefined";

function setCookie(name: string, value: string, maxAgeDays: number) {
  if (!isBrowser) return;
  const maxAge = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (!isBrowser) return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function persistSession(input: {
  accessToken: string;
  refreshToken: string;
  actorType: ActorType;
}) {
  if (!isBrowser) return;

  localStorage.setItem(authConfig.storageKeys.accessToken, input.accessToken);
  localStorage.setItem(authConfig.storageKeys.refreshToken, input.refreshToken);
  localStorage.setItem(authConfig.storageKeys.actorType, input.actorType);

  setCookie(
    authConfig.cookieKeys.accessToken,
    input.accessToken,
    authConfig.cookieMaxAgeDays,
  );
  setCookie(
    authConfig.cookieKeys.refreshToken,
    input.refreshToken,
    authConfig.cookieMaxAgeDays,
  );
  setCookie(
    authConfig.cookieKeys.actorType,
    input.actorType,
    authConfig.cookieMaxAgeDays,
  );
}

export function readStoredSession(): {
  accessToken: string | null;
  refreshToken: string | null;
  actorType: ActorType | null;
} {
  if (!isBrowser) {
    return { accessToken: null, refreshToken: null, actorType: null };
  }

  const actorType = localStorage.getItem(authConfig.storageKeys.actorType);

  return {
    accessToken: localStorage.getItem(authConfig.storageKeys.accessToken),
    refreshToken: localStorage.getItem(authConfig.storageKeys.refreshToken),
    actorType:
      actorType === "doctor" || actorType === "admin" || actorType === "receptionist"
        ? actorType
        : null,
  };
}

export function clearSession() {
  if (!isBrowser) return;

  localStorage.removeItem(authConfig.storageKeys.accessToken);
  localStorage.removeItem(authConfig.storageKeys.refreshToken);
  localStorage.removeItem(authConfig.storageKeys.actorType);

  deleteCookie(authConfig.cookieKeys.accessToken);
  deleteCookie(authConfig.cookieKeys.refreshToken);
  deleteCookie(authConfig.cookieKeys.actorType);
}
