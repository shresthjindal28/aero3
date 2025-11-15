"use client";
import React, { useState } from "react";
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Recordings",
    url: "/dashboard/recordings",
    icon: Inbox,
  },
  {
    title: "Transcription",
    url: "/dashboard/transcription",
    icon: Calendar,
  },
  {
    title: "Soap Notes",
    url: "/dashboard/SOAP-notes",
    icon: Search,
  },
  // {
  //   title: "Settings",
  //   url: "/dashboard/settings",
  //   icon: Settings,
  // },
];

export function AppSidebar() {
  const [patientId] = useState<string | null>(() => {
    try {
      return localStorage.getItem("currentPatientId");
    } catch {
      return null;
    }
  });
  return (
    <Sidebar>
      {/* <h2 className="text-emerald-500 text-2xl mt-2 ml-4">MediScript</h2> */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Applications</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={
                      item.title === "Dashboard"
                        ? item.url
                        : patientId
                        ? `${item.url}?patientId=${encodeURIComponent(patientId)}`
                        : item.url
                    }>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="">
        <div className="px-3 py-4 border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a
                  href={patientId ? `/dashboard/settings?patientId=${encodeURIComponent(patientId)}` : "/dashboard/settings"}
                  className="flex items-center gap-2"
                >
                  <Settings />
                  <span>Settings</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => {
                  try {
                    localStorage.removeItem("currentPatientId");
                    localStorage.removeItem("currentPatientName");
                  } catch {}
                  window.location.href = "/dashboard/transcription";
                }}
              >
                <span>Another User</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </div>
    </Sidebar>
  );
}
