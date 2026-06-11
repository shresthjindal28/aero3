"use client";

import { Search } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Input } from "@/shared/ui/primitives/input";

type SearchBoxProps = {
  placeholder?: string;
  className?: string;
  onClick?: () => void;
};

export function SearchBox({
  placeholder = "Search...",
  className,
  onClick,
}: SearchBoxProps) {
  return (
    <div className={cn("relative w-full max-w-sm", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        readOnly
        onClick={onClick}
        placeholder={placeholder}
        className="cursor-pointer bg-muted/40 pl-9"
      />
    </div>
  );
}
