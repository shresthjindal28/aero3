"use client";

import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  List,
  Redo2,
  Underline,
  Undo2,
} from "lucide-react";

import { useHtmlEditorHistory } from "@/features/prescription/hooks/use-html-editor-history";
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
  const { html, pushState, undo, redo, reset, canUndo, canRedo } =
    useHtmlEditorHistory(value);

  useEffect(() => {
    reset(value);
  }, [version, reset, value]);

  useEffect(() => {
    const element = editorRef.current;
    if (!element) return;
    if (element.innerHTML !== html) {
      element.innerHTML = html;
    }
  }, [html]);

  const syncFromDom = () => {
    const element = editorRef.current;
    if (!element || readOnly) return;
    const nextHtml = element.innerHTML;
    pushState(nextHtml);
    onChange(nextHtml);
  };

  const runCommand = (command: string, valueArg?: string) => {
    if (readOnly) return;
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
    <div className="flex h-full min-h-0 flex-col">
      {!readOnly ? (
        <div className="flex flex-wrap items-center gap-1 border-b border-border/60 bg-muted/20 px-3 py-2">
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
          <div className="mx-1 h-5 w-px bg-border/60" />
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
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto bg-background p-6 sm:p-10">
        <div
          ref={editorRef}
          contentEditable={!readOnly}
          suppressContentEditableWarning
          onInput={syncFromDom}
          onBlur={syncFromDom}
          className={cn(
            "prescription-document mx-auto min-h-[70vh] max-w-4xl rounded-lg border border-border/40 bg-white p-8 text-[15px] leading-relaxed text-gray-900 shadow-sm",
            "prose prose-sm max-w-none focus:outline-none",
            "[&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:font-semibold",
            "[&_table]:w-full [&_table]:border-collapse [&_th]:border [&_td]:border [&_th]:bg-gray-50 [&_th]:p-2 [&_td]:p-2",
            readOnly && "cursor-default opacity-95",
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
      className="h-8 w-8"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {icon}
    </Button>
  );
}
