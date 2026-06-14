"use client";

import { create } from "zustand";

import { useTokenStore } from "@/features/auth/store/token.store";
import { readStoredSession } from "@/features/auth/utils/token-storage";
import type { ActorType } from "@/types/domain/actor.types";

function getInitialAuthState(): Pick<
  AuthState,
  "actorType" | "isAuthenticated" | "isHydrated"
> {
  if (typeof window === "undefined") {
    return { actorType: null, isAuthenticated: false, isHydrated: false };
  }

  const session = readStoredSession();
  return {
    actorType: session.actorType,
    isAuthenticated: Boolean(session.accessToken && session.actorType),
    isHydrated: true,
  };
}

type AuthState = {
  actorType: ActorType | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setSession: (actorType: ActorType) => void;
  hydrate: () => void;
  reset: () => void;
};

const initialAuth = getInitialAuthState();

export const useAuthStore = create<AuthState>((set) => ({
  actorType: initialAuth.actorType,
  isAuthenticated: initialAuth.isAuthenticated,
  isHydrated: initialAuth.isHydrated,

  setSession: (actorType) => {
    set({ actorType, isAuthenticated: true, isHydrated: true });
  },

  hydrate: () => {
    useTokenStore.getState().hydrate();
    const { accessToken, actorType } = useTokenStore.getState();

    set({
      actorType,
      isAuthenticated: Boolean(accessToken && actorType),
      isHydrated: true,
    });
  },

  reset: () => {
    useTokenStore.getState().clear();
    set({ actorType: null, isAuthenticated: false, isHydrated: true });
  },
}));
