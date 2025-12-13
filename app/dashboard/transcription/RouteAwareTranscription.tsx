"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import type { Socket } from "socket.io-client";
import Transcription from "@/components/transcription";

export default function RouteAwareTranscription({
  socket,
}: {
  socket: Socket | null;
}) {
  const params = useParams<{ patientId?: string }>();
  const patientIdFromRoute = params?.patientId;

  useEffect(() => {
    if (patientIdFromRoute) {
      localStorage.setItem("currentPatientId", patientIdFromRoute);
    }
  }, [patientIdFromRoute]);

  return <Transcription socket={socket} />;
}
