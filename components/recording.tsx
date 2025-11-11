"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
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

type RecordingStatus = "idle" | "recording" | "paused" | "stopped";
const CHUNKS_LENGTH = 10000;

type RecordingProps = {
  onTranscribed: (text: string) => void;
  patientId?: string;
  socket: Socket;
  setTranscribedText: Dispatch<SetStateAction<string>>;
};

export default function Recording({
  onTranscribed,
  patientId,
  socket,
  setTranscribedText,
}: RecordingProps) {
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
      mediaRecorder.start(CHUNKS_LENGTH);
      setRecordingStatus("recording");

      mediaRecorder.ondataavailable = async (event: BlobEvent) => {
        // send data only when recording not when paused
        if (
          event.data.size > 0 &&
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          console.log(mediaRecorderRef.current.state);
          setAudioChunks((prev) => [...prev, event.data]);
          console.log("streaming audio to backend..");
          socket.emit("audio-channel-DOCT-000001", await event.data.arrayBuffer());
        }
      };

      mediaRecorder.onstop = () => {
        // this will have the full audio of the chunks
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        // write code to convert into mp3 and upload to cloudinary
        // handleTranscription(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
        setRecordingStatus("stopped");
        console.log("stopped recording");

        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
        }
        socket.emit("audio-channel-commands-DOCT-000001", "stop");
      };
    } catch {
      alert("Microphone access was denied.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current) {
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
    if (mediaRecorderRef.current) {
      console.log("stopped recording");
      socket.emit("audio-channel-commands-DOCT-000001", "stop");
      mediaRecorderRef.current.stop();
    }
  };

  useEffect(() => {
    socket.on("transcripted-data-DOCT-000001", (data) => {
      console.log("transcripted-data", data);
      // try {
      //   const t = data?.transcription?.text as string | undefined;
      //   const lc = (data?.transcription?.language_code as string | null) ?? null;

      //   if (typeof t === "string" && t.length) {
      //     setTranscribedText((prev) => {
      //       if (!prev) return t;
      //       const nl = prev.endsWith("\n") ? "" : "\n";
      //       return prev + nl + t;
      //     });
      //   }

      //   // setLanguageCode(lc);
      //   // setProcessing(false);
      //   // setError(null);
      // } catch (e) {
      //   console.error(e);
      // }
    });

    return () => {
      socket.off("transcripted-data");
    };
  }, []);

  const blobToDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const handleTranscription = async (audioBlob: Blob) => {
    onTranscribed("Transcribing...");
    // const audioBase64 = await blobToDataUrl(audioBlob);

    // setTimeout(async () => {
    //   const simulated = "This is the simulated transcribed text from the recorded audio.";
    //   onTranscribed(simulated);

    //   if (patientId) {
    //     try {
    //       setUploading(true);
    //       const file = new File([audioBlob], "recording.wav", { type: "audio/wav" });
    //       console.log(file);

    //       const fd = new FormData();
    //       fd.append("patientId", patientId);
    //       fd.append("file", file);
    //       fd.append("transcript", simulated);
    //       await uploadAudioAction(fd);
    //     } finally {
    //       setUploading(false);
    //     }
    //   }
    // }, 2000);
  };

  return (
    <Card className="gap-0!">
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
          <div className="absolute top-1/2 left-1/2 -translate-1/2 flex items-center justify-center">
            {recordingStatus === "idle" || recordingStatus === "stopped" ? (
              <button
                onClick={startRecording}
                className="border flex bg-secondary  hover:scale-105 duration-150 flex-col items-center justify-center gap-1 h-[100px] w-[100px] rounded-full"
              >
                <Mic width={30} height={30} />
                <p className="text-lg">Start</p>
              </button>
            ) : (
              <div className="relative flex  items-center justify-center w-36 h-36">
                {/* Smooth breathing wave ring */}
                <motion.div
                  className="absolute bg-white/10 hover:scale-105 rounded-full border"
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
                {/* Mic icon small and centered */}
                <Mic className="relative z-10 h-7 w-7 text-white opacity-90 drop-shadow-xl" />
              </div>
            )}
          </div>

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
  );
}
