"use client";

import { create } from "zustand";

import { useTokenStore } from "@/features/auth/store/token.store";
import type { ActorType } from "@/types/domain/actor.types";

type AuthState = {
  actorType: ActorType | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setSession: (actorType: ActorType) => void;
  hydrate: () => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  actorType: null,
  isAuthenticated: false,
  isHydrated: false,

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
