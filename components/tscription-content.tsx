import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

const TscriptionContent = ({ patientId }: { patientId: string }) => {
  const [transcribedText, setTranscribedText] = useState("");

  useEffect(() => {
    const handleTranscriptChunk = (data: {
      transcription?: { text?: string };
    }) => {
      // console.log("transcripted-data", data);
      const chunk =
        typeof data?.transcription?.text === "string"
          ? data.transcription.text
          : "";
      if (!chunk) return;

      setTranscribedText((prev) => (prev ? `${prev} ${chunk}` : chunk));
    };
    socket.on("transcripted-data-DOCT-000001", (data) => {
      // console.log("transcripted-data", data);
      handleTranscriptChunk(data);
    });

    return () => {
      socket.off("transcripted-data");
    };
  }, []);

  useEffect(() => {
    if (!patientId || !transcribedText) return;

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        await fetch("/api/audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId,
            transcript: transcribedText,
          }),
          signal: controller.signal,
        });
      } catch (err) {
        console.error("Failed to store transcript", err);
      }
    }, 1500);
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [patientId, transcribedText]);

  return (
    <div>
      <div className="space-y-2 h-[60vh]">
        <Label htmlFor="transcription">Transcription</Label>
        <Textarea
          id="transcription"
          value={transcribedText}
          readOnly
          placeholder="Your recorded voice will appear here as text after stopping..."
          rows={15}
          className="text-base rounded-(--radius) w-full h-full"
        />
      </div>
    </div>
  );
};

export default TscriptionContent;
