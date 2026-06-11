"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { resolveBreadcrumbs } from "@/config/breadcrumbs.config";

export function useBreadcrumbs() {
  const pathname = usePathname();

  return useMemo(() => resolveBreadcrumbs(pathname), [pathname]);
}
