"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { BreadcrumbSegment } from "@/config/breadcrumbs.config";
import { cn } from "@/lib/utils/cn";

type BreadcrumbNavProps = {
  items: BreadcrumbSegment[];
  className?: string;
};

export function BreadcrumbNav({ items, className }: BreadcrumbNavProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-sm", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 ? (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            ) : null}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span className={cn(isLast ? "font-medium text-foreground" : "text-muted-foreground")}>
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
