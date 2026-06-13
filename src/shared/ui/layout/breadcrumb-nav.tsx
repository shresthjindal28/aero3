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
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex min-w-0 items-center gap-1 overflow-hidden whitespace-nowrap text-sm",
        className,
      )}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isExpandable = index > 0 && !isLast;

        return (
          <div
            key={`${item.label}-${index}`}
            className={cn(
              "flex min-w-0 items-center gap-1",
              isExpandable ? "max-w-[40%] flex-1" : "shrink-0",
              isLast && "max-w-none shrink-0",
            )}
          >
            {index > 0 ? (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            ) : null}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="truncate text-muted-foreground transition-colors hover:text-foreground"
                title={item.label}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "truncate",
                  isLast ? "font-medium text-foreground" : "text-muted-foreground",
                )}
                title={item.label}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
