import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type MemorySectionCardProps = {
  title: string;
  description?: string;
  icon: LucideIcon;
  items: string[];
  emptyLabel: string;
  accent?: "teal" | "amber" | "blue" | "violet" | "rose";
};

const accentStyles = {
  teal: "border-teal-500/20 bg-teal-500/5 text-teal-700 dark:text-teal-300",
  amber: "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-300",
  blue: "border-blue-500/20 bg-blue-500/5 text-blue-700 dark:text-blue-300",
  violet: "border-violet-500/20 bg-violet-500/5 text-violet-700 dark:text-violet-300",
  rose: "border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-300",
} as const;

export function MemorySectionCard({
  title,
  description,
  icon: Icon,
  items,
  emptyLabel,
  accent = "teal",
}: MemorySectionCardProps) {
  return (
    <section className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
            accentStyles[accent],
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-3">
        {items.length > 0 ? (
          <ul className="space-y-1.5">
            {items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 rounded-md border border-border/40 bg-muted/15 px-2.5 py-1.5 text-sm leading-relaxed"
              >
                <span
                  className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", {
                    "bg-teal-500": accent === "teal",
                    "bg-amber-500": accent === "amber",
                    "bg-blue-500": accent === "blue",
                    "bg-violet-500": accent === "violet",
                    "bg-rose-500": accent === "rose",
                  })}
                />
                <span className="text-foreground/90">{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-border/60 bg-muted/10 px-3 py-4 text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        )}
      </div>
    </section>
  );
}
