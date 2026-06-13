"use client";

import { Loader2, Mic, Send, Sparkles, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useVoiceAgent } from "@/features/voice-agent/hooks/use-voice-agent";
import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";
import { cn } from "@/lib/utils/cn";

const QUICK_PROMPTS = [
  "What should I know before seeing this patient?",
  "Give me a 30 second briefing.",
  "What medications are they currently taking?",
  "What medications has the patient taken over time?",
  "How has hypertension progressed?",
  "Any allergies or risk factors?",
];

type VoiceAgentPanelProps = {
  patientId: string;
  consultationId?: string;
  className?: string;
};

export function VoiceAgentPanel({
  patientId,
  consultationId,
  className,
}: VoiceAgentPanelProps) {
  const agent = useVoiceAgent({ patientId, consultationId });
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { ensureSession } = agent;

  useEffect(() => {
    void ensureSession();
  }, [ensureSession, patientId, consultationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agent.turns, agent.isThinking]);

  const submit = async () => {
    const text = input.trim();
    if (!text || agent.isThinking) return;
    setInput("");
    await agent.ask(text);
  };

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      {(agent.briefingPreview || agent.alertsPreview) && (
        <div className="space-y-2 border-b border-border/60 bg-muted/20 px-4 py-3 text-xs">
          {agent.briefingPreview ? (
            <div>
              <p className="font-medium text-foreground">Pre-consult briefing</p>
              <p className="mt-1 leading-relaxed text-muted-foreground">
                {agent.briefingPreview}
              </p>
            </div>
          ) : null}
          {agent.alertsPreview ? (
            <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-700 dark:text-amber-300">
              {agent.alertsPreview}
            </p>
          ) : null}
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {agent.turns.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Mic className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">Clinical voice assistant</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Ask follow-up questions naturally — &quot;they&quot;, &quot;it&quot;,
              &quot;when was it prescribed&quot; are understood from context.
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {QUICK_PROMPTS.map((prompt) => (
                <Button
                  key={prompt}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-auto whitespace-normal text-left text-xs"
                  onClick={() => void agent.ask(prompt)}
                  disabled={agent.isThinking || agent.isStarting}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          agent.turns.map((turn) => (
            <div
              key={turn.id}
              className={cn(
                "max-w-[95%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                turn.role === "doctor"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted/50 text-foreground",
              )}
            >
              <p>
                {turn.content}
                {turn.streaming ? (
                  <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-current" />
                ) : null}
              </p>
              {turn.role === "assistant" && turn.latency_ms !== undefined ? (
                <p className="mt-1 text-[10px] opacity-70">
                  {turn.latency_ms}ms
                  {turn.stt_latency_ms ? ` · STT ${turn.stt_latency_ms}ms` : ""}
                  {turn.tts_latency_ms ? ` · TTS ${turn.tts_latency_ms}ms` : ""}
                  {turn.cache_hit ? " · cached" : ""}
                  {turn.intent ? ` · ${turn.intent}` : ""}
                </p>
              ) : null}
            </div>
          ))
        )}

        {agent.isThinking ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Retrieving clinical memory…
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      {agent.error ? (
        <p className="px-4 text-xs text-red-500">{agent.error}</p>
      ) : null}

      <form
        className="flex gap-2 border-t border-border/60 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about this patient…"
          disabled={agent.isStarting || agent.isListening}
        />
        <Button
          type="button"
          size="icon"
          variant={agent.isListening ? "destructive" : "secondary"}
          onClick={() =>
            agent.isListening ? agent.stopListening() : void agent.startListening()
          }
          disabled={agent.isStarting || agent.isThinking}
          aria-label={agent.isListening ? "Stop recording" : "Record voice"}
        >
          <Mic className="h-4 w-4" />
        </Button>
        {(agent.isThinking || agent.isSpeaking) && (
          <Button
            type="button"
            size="icon"
            variant="destructive"
            onClick={() => agent.stopOutput()}
            aria-label="Stop"
          >
            <Square className="h-4 w-4" />
          </Button>
        )}
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || agent.isStarting}
        >
          {agent.isThinking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>

      <div className="flex items-center gap-1 border-t border-border/40 px-3 py-2 text-[10px] text-muted-foreground">
        <Sparkles className="h-3 w-3" />
        Streaming · Sarvam STT/TTS · follow-up context · say &quot;stop&quot; to interrupt
      </div>
    </div>
  );
}
