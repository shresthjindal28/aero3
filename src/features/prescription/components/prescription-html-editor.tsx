"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  Bold,
  Italic,
  List,
  Redo2,
  Underline,
  Undo2,
} from "lucide-react";

import { useHtmlEditorHistory } from "@/features/prescription/hooks/use-html-editor-history";
import {
  normalizePrescriptionDocument,
  sanitizePrescriptionHtml,
} from "@/features/prescription/utils/prescription-document.utils";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/shared/ui/primitives/button";

type PrescriptionHtmlEditorProps = {
  value: string;
  version: number;
  readOnly?: boolean;
  onChange: (html: string) => void;
};

export function PrescriptionHtmlEditor({
  value,
  version,
  readOnly = false,
  onChange,
}: PrescriptionHtmlEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const sanitizedValue = useMemo(() => sanitizePrescriptionHtml(value), [value]);
  const { html, pushState, undo, redo, reset, canUndo, canRedo } =
    useHtmlEditorHistory(sanitizedValue);

  const wordCount = useMemo(() => countWords(stripHtml(html)), [html]);

  useEffect(() => {
    reset(sanitizePrescriptionHtml(value));
  }, [version, reset, value]);

  useEffect(() => {
    const element = editorRef.current;
    if (!element) return;

    const nextHtml = sanitizePrescriptionHtml(html);
    if (element.innerHTML !== nextHtml) {
      element.innerHTML = nextHtml;
    }
    normalizePrescriptionDocument(element);
  }, [html]);

  const syncFromDom = () => {
    const element = editorRef.current;
    if (!element || readOnly) return;
    normalizePrescriptionDocument(element);
    const nextHtml = element.innerHTML;
    pushState(nextHtml);
    onChange(nextHtml);
  };

  const runCommand = (command: string, valueArg?: string) => {
    if (readOnly) return;
    editorRef.current?.focus();
    document.execCommand(command, false, valueArg);
    syncFromDom();
  };

  const handleUndo = () => {
    const previous = undo();
    if (previous !== null) onChange(previous);
  };

  const handleRedo = () => {
    const next = redo();
    if (next !== null) onChange(next);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-background">
      {!readOnly ? (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-background px-4 py-2 lg:px-6">
          <div className="flex flex-wrap items-center gap-0.5">
            <ToolbarButton
              label="Bold"
              onClick={() => runCommand("bold")}
              icon={<Bold className="h-4 w-4" />}
            />
            <ToolbarButton
              label="Italic"
              onClick={() => runCommand("italic")}
              icon={<Italic className="h-4 w-4" />}
            />
            <ToolbarButton
              label="Underline"
              onClick={() => runCommand("underline")}
              icon={<Underline className="h-4 w-4" />}
            />
            <ToolbarButton
              label="Bullet list"
              onClick={() => runCommand("insertUnorderedList")}
              icon={<List className="h-4 w-4" />}
            />
            <div className="mx-2 h-5 w-px bg-border/60" />
            <ToolbarButton
              label="Undo"
              onClick={handleUndo}
              disabled={!canUndo}
              icon={<Undo2 className="h-4 w-4" />}
            />
            <ToolbarButton
              label="Redo"
              onClick={handleRedo}
              disabled={!canRedo}
              icon={<Redo2 className="h-4 w-4" />}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {wordCount.toLocaleString()} words · Edit freely before approval
          </p>
        </div>
      ) : (
        <div className="border-b border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-center text-xs font-medium text-emerald-700 dark:text-emerald-400">
          This prescription is approved and locked for editing.
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto bg-muted/20">
        <div
          ref={editorRef}
          contentEditable={!readOnly}
          suppressContentEditableWarning
          onInput={syncFromDom}
          onBlur={syncFromDom}
          className={cn(
            "prescription-document block min-h-full w-full max-w-none bg-white px-6 py-8 text-[15px] leading-relaxed text-slate-900 sm:px-10 sm:py-10",
            "focus:outline-none",
            "[&_*]:!max-w-none",
            "[&_header]:mb-8 [&_header]:w-full",
            "[&_h1]:mb-1 [&_h1]:text-[26px] [&_h1]:font-bold [&_h1]:text-slate-900",
            "[&_h2]:text-[20px] [&_h2]:font-semibold [&_h2]:text-slate-800",
            "[&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:border-b [&_h3]:border-slate-200 [&_h3]:pb-2 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:uppercase [&_h3]:text-slate-600",
            "[&_p]:mb-3",
            "[&_section]:mb-8 [&_section]:w-full",
            "[&_table]:my-4 [&_table]:w-full [&_table]:table-auto [&_table]:border-collapse [&_table]:text-[13px]",
            "[&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-100 [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-left [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:text-slate-700",
            "[&_td]:break-words [&_td]:border [&_td]:border-slate-200 [&_td]:px-4 [&_td]:py-2.5 [&_td]:align-top",
            "[&_tr:nth-child(even)_td]:bg-slate-50/80",
            "[&_footer]:mt-12 [&_footer]:w-full [&_footer]:border-t [&_footer]:border-slate-300 [&_footer]:pt-6",
            "[&_strong]:font-semibold [&_strong]:text-slate-900",
            "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-1.5",
            readOnly && "cursor-default",
          )}
        />
      </div>
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  disabled,
  icon,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-md"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {icon}
    </Button>
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function countWords(text: string): number {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}
