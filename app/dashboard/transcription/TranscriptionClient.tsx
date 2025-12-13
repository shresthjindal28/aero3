"use client";

import { useEffect } from "react";
import { useSocket } from "@/lib/socket";
import RouteAwareTranscription from "@/app/dashboard/transcription/RouteAwareTranscription";

export default function TranscriptionClient() {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {});

    return () => {
      socket.disconnect(); 
    };
  }, [socket]);

  return <RouteAwareTranscription socket={socket} />;
}
