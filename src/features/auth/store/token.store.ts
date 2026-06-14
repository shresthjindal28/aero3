"use client";

import { create } from "zustand";

import {
  clearSession,
  persistSession,
  readStoredSession,
} from "@/features/auth/utils/token-storage";
import type { ActorType } from "@/types/domain/actor.types";

type TokenState = {
  accessToken: string | null;
  refreshToken: string | null;
  actorType: ActorType | null;
  setTokens: (input: {
    accessToken: string;
    refreshToken: string;
    actorType?: ActorType;
  }) => void;
  hydrate: () => void;
  clear: () => void;
};

const initialSession = readStoredSession();

export const useTokenStore = create<TokenState>((set, get) => ({
  accessToken: initialSession.accessToken,
  refreshToken: initialSession.refreshToken,
  actorType: initialSession.actorType,

  setTokens: ({ accessToken, refreshToken, actorType }) => {
    const resolvedActorType = actorType ?? get().actorType;
    if (!resolvedActorType) return;

    persistSession({
      accessToken,
      refreshToken,
      actorType: resolvedActorType,
    });

    set({ accessToken, refreshToken, actorType: resolvedActorType });
  },

  hydrate: () => {
    const session = readStoredSession();
    set({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      actorType: session.actorType,
    });
  },

  clear: () => {
    clearSession();
    set({ accessToken: null, refreshToken: null, actorType: null });
  },
}));
