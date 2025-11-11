"use client";

import { useRef, useState } from "react";
import { Mic, Pause, Play, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type RecordingStatus = "idle" | "recording" | "paused" | "stopped";

type RecordingProps = {
  onTranscribed: (text: string) => void;
  patientId?: string;
};

export default function Recording({ onTranscribed, patientId }: RecordingProps) {
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>("idle");
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      setAudioChunks([]);
      mediaRecorder.start();
      setRecordingStatus("recording");

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        handleTranscription(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
        setRecordingStatus("stopped");
      };
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access was denied.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingStatus === "recording") {
      mediaRecorderRef.current.pause();
      setRecordingStatus("paused");
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingStatus === "paused") {
      mediaRecorderRef.current.resume();
      setRecordingStatus("recording");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      (recordingStatus === "recording" || recordingStatus === "paused")
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  const blobToDataUrl = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleTranscription = async (audioBlob: Blob) => {
    onTranscribed("Transcribing... (Processing audio)");
    const audioBase64 = await blobToDataUrl(audioBlob);
    setTimeout(async () => {
      const simulated = "This is the simulated transcribed text from the recorded audio. The audio blob was successfully created.";
      onTranscribed(simulated);

      // Optionally upload to server when a patient is selected
      if (patientId) {
        try {
          setUploading(true);
          await fetch("/api/audio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patientId, audioBase64, transcript: simulated }),
          });
        } catch (e) {
          console.error("Audio upload failed", e);
        } finally {
          setUploading(false);
        }
      }
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Voice Notes</CardTitle>
        <CardDescription>
          Status: <span className="font-medium capitalize">{recordingStatus}</span>
          {patientId && (
            <span className="ml-2 text-muted-foreground">{uploading ? "(Uploading…)" : ""}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={startRecording}
            disabled={recordingStatus === "recording"}
            className="bg-emerald-600 hover:bg-emerald-700 text-primary-foreground"
          >
            <Mic className="mr-2 h-4 w-4" /> Start
          </Button>
          <Button
            onClick={pauseRecording}
            disabled={recordingStatus !== "recording"}
            variant="outline"
          >
            <Pause className="mr-2 h-4 w-4" /> Pause
          </Button>
          <Button
            onClick={resumeRecording}
            disabled={recordingStatus !== "paused"}
            variant="outline"
          >
            <Play className="mr-2 h-4 w-4" /> Resume
          </Button>
          <Button
            onClick={stopRecording}
            disabled={recordingStatus === "idle" || recordingStatus === "stopped"}
            variant="destructive"
          >
            <StopCircle className="mr-2 h-4 w-4" /> Stop
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}