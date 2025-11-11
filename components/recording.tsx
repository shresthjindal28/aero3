"use client";

import { useRef, useState } from "react";
import { Mic, Pause, Play, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";

type RecordingStatus = "idle" | "recording" | "paused" | "stopped";

type RecordingProps = {
  onTranscribed: (text: string) => void;
  patientId?: string;
};

export default function Recording({ onTranscribed, patientId }: RecordingProps) {
  const [recordingStatus, setRecordingStatus] =
    useState<RecordingStatus>("idle");
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
    } catch {
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

  const blobToDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const handleTranscription = async (audioBlob: Blob) => {
    onTranscribed("Transcribing...");
    const audioBase64 = await blobToDataUrl(audioBlob);

    setTimeout(async () => {
      const simulated =
        "This is the simulated transcribed text from the recorded audio.";
      onTranscribed(simulated);

      if (patientId) {
        try {
          setUploading(true);
          await fetch("/api/audio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              patientId,
              audioBase64,
              transcript: simulated,
            }),
          });
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
          {patientId && uploading && <span className="ml-2">(Uploading…)</span>}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-center justify-center gap-6 min-h-[180px]">

          <div className="relative w-36 h-36 flex items-center justify-center">

            {(recordingStatus === "idle" || recordingStatus === "stopped") ? (
              <Button
                onClick={startRecording}
                className="w-full h-full rounded-full bg-green-600 hover:bg-green-700 text-primary-foreground text-lg font-semibold shadow-lg flex flex-col items-center justify-center transition-all duration-300"
              >
                <Mic className="h-10 w-10" />
                Start
              </Button>
            ) : (
              <div className="relative flex items-center justify-center w-36 h-36">

                {/* Outer dark atmospheric glow */}
                <motion.div
                  className="absolute rounded-full blur-xl"
                  style={{
                    width: "160px",
                    height: "160px",
                    background:
                      "radial-gradient(circle, rgba(50,40,80,0.15) 0%, rgba(10,8,16,0.6) 70%)",
                  }}
                  animate={{
                    scale: recordingStatus === "recording" ? [1, 1.25, 1] : 1,
                    opacity: recordingStatus === "recording" ? [0.5, 1, 0.5] : 0.6,
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.4,
                    ease: "easeInOut",
                  }}
                />

                {/* Smooth breathing wave ring */}
                <motion.div
                  className="absolute rounded-full border border-purple-300/25"
                  style={{
                    width: "135px",
                    height: "135px",
                  }}
                  animate={{
                    scale: recordingStatus === "recording" ? [1, 1.4, 1] : 1,
                    opacity: recordingStatus === "recording" ? [1, 0.4, 1] : 0.3,
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.1,
                    ease: "easeInOut",
                  }}
                />

                {/* Inner faint glow */}
                <motion.div
                  className="absolute rounded-full bg-purple-500/20 blur-lg"
                  style={{ width: "95px", height: "95px" }}
                  animate={{
                    scale: recordingStatus === "recording" ? [1, 1.15, 1] : 1,
                    opacity: recordingStatus === "recording" ? [0.6, 1, 0.6] : 0.8,
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.8,
                    ease: "easeInOut",
                  }}
                />

                {/* Mic icon small and centered */}
                <Mic className="relative z-10 h-7 w-7 text-white opacity-90 drop-shadow-xl" />
              </div>
            )}
          </div>

          {(recordingStatus === "recording" || recordingStatus === "paused") && (
            <div className="flex gap-4">
              {recordingStatus === "recording" ? (
                <Button onClick={pauseRecording} variant="outline">
                  <Pause className="mr-2 h-4 w-4" /> Pause
                </Button>
              ) : (
                <Button onClick={resumeRecording} variant="outline">
                  <Play className="mr-2 h-4 w-4" /> Resume
                </Button>
              )}

              <Button onClick={stopRecording} variant="destructive">
                <StopCircle className="mr-2 h-4 w-4" /> Stop
              </Button>
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
}
