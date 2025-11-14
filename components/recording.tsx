"use client";

import { Dispatch, SetStateAction, useRef, useState } from "react";
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
import RippleGrid from "./RippleGrid";
import { type Socket } from "socket.io-client";
import { useUser } from "@clerk/nextjs";

type RecordingStatus = "idle" | "recording" | "paused" | "stopped";

type RecordingProps = {
  patientId?: string;
  socket: Socket | null;
  setIsLastChunkRef: Dispatch<SetStateAction<boolean>>;
};

const CHUNK_DURATION_MS = 5000; // record 5 seconds per chunk (each chunk is valid WebM)

export default function Recording({
  patientId,
  socket,
  setIsLastChunkRef,
}: RecordingProps) {
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>("idle");
  const [uploading, setUploading] = useState<boolean>(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const isRecordingRef = useRef<boolean>(false);
  const isLastChunkRef = useRef<boolean>(false);

  const { user, isLoaded } = useUser();

  // Start recording loop (restarts MediaRecorder for each chunk)
  const startRecording = async () => {
    setIsLastChunkRef(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setRecordingStatus("recording");
      isRecordingRef.current = true;
      console.log("🎙️ Started recording loop");

      // Continuous loop
      const recordChunk = async (): Promise<Blob> => {
        return new Promise((resolve) => {
          const recorder = new MediaRecorder(stream, {
            mimeType: "audio/webm;codecs=opus",
          });

          const chunks: BlobPart[] = [];
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
          };

          recorder.onstop = () => {
            const blob = new Blob(chunks, { type: "audio/webm" });
            resolve(blob);
          };

          recorder.start();
          setTimeout(() => recorder.stop(), CHUNK_DURATION_MS);
        });
      };

      // Loop: record → send → repeat until stopped
      while (isRecordingRef.current === true || isLastChunkRef.current === true) {
        const blob = await recordChunk();
        if (isLastChunkRef.current) {
          console.log("This is the last chunk");
          setIsLastChunkRef(true);
          console.log(isRecordingRef.current);
        }

        console.log("🎧 Sending valid WebM chunk to backend...");
        const arrayBuffer = await blob.arrayBuffer();
        socket?.emit(`audio-channel-${user?.id}`, arrayBuffer);
        if (isLastChunkRef.current === true) {
          isLastChunkRef.current = false;
        }
      }
    } catch (err) {
      console.error("❌ Microphone access error:", err);
      alert("Microphone access was denied.");
    }
  };

  const pauseRecording = () => {
    if (recordingStatus === "recording") {
      isRecordingRef.current = false;
      setRecordingStatus("paused");
      console.log("⏸️ Paused recording");
    }
  };

  const resumeRecording = async () => {
    if (recordingStatus === "paused") {
      setRecordingStatus("recording");
      isRecordingRef.current = true;
      console.log("▶️ Resumed recording");
      startRecording(); // restart the chunk loop
    }
  };

  const stopRecording = () => {
    isLastChunkRef.current = true;
    console.log("🛑 Stopping recording...");
    isRecordingRef.current = false;
    setRecordingStatus("stopped");

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    socket?.emit(`audio-channel-commands-${user?.id}`, "stop");
  };

  return (
    <>
      {isLoaded ? (
        <Card className="bg-background! gap-0!">
          <CardHeader className="mb-0!">
            <CardTitle>Record Voice Notes</CardTitle>
            <CardDescription>
              Status: <span className="font-medium capitalize">{recordingStatus}</span>
              {patientId && uploading && <span className="ml-2">(Uploading…)</span>}
            </CardDescription>
          </CardHeader>

          <CardContent className="mt-0!">
            <div className="flex flex-col items-center justify-center relative gap-6 min-h-[180px]">
              <div className="h-[45vh] w-full">
                <RippleGrid
                  enableRainbow={false}
                  gridColor="#ffffff"
                  rippleIntensity={recordingStatus === "recording" ? 0.1 : 0}
                  gridSize={10}
                  gridThickness={15}
                  mouseInteraction={false}
                />
              </div>

              {/* Center mic button */}
              <div className="absolute top-1/2 left-1/2 -translate-1/2 flex items-center justify-center">
                {recordingStatus === "idle" || recordingStatus === "stopped" ? (
                  <button
                    onClick={startRecording}
                    className="border flex bg-secondary hover:scale-105 duration-150 flex-col items-center justify-center gap-1 h-[100px] w-[100px] rounded-full"
                  >
                    <Mic width={30} height={30} />
                    <p className="text-lg">Start</p>
                  </button>
                ) : (
                  <div className="relative flex items-center justify-center w-36 h-36">
                    {/* Breathing animation */}
                    <motion.div
                      className="absolute bg-white/10 hover:scale-105 rounded-full border"
                      style={{ width: "135px", height: "135px" }}
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
                    <Mic className="relative z-10 h-7 w-7 text-white opacity-90 drop-shadow-xl" />
                  </div>
                )}
              </div>

              {/* Bottom controls */}
              {(recordingStatus === "recording" || recordingStatus === "paused") && (
                <div className="flex gap-4 absolute bottom-0 right-0">
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
      ) : (
        <p>loading...</p>
      )}
    </>
  );
}
