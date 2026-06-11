"use client";

import type { ReactNode } from "react";

import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { RealtimeProvider } from "@/providers/realtime-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { registerServiceWorker } from "@/shared/pwa/register-service-worker";
import { useEffect } from "react";

type AppProvidersProps = {
  children: ReactNode;
};

function PwaInitializer() {
  useEffect(() => {
    registerServiceWorker();
  }, []);
  return null;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <RealtimeProvider>
            <ToastProvider>
              <PwaInitializer />
              {children}
            </ToastProvider>
          </RealtimeProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
