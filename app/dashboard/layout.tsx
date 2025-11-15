"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import dynamic from "next/dynamic";
const AppSidebar = dynamic(() => import("@/components/app-sidebar").then(m => m.AppSidebar), { ssr: false });
import { Toaster } from "@/components/ui/sonner";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <Toaster position="top-center" richColors />
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
