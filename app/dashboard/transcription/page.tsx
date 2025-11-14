"use client";

import Transcription from "@/components/transcription";
import React, { useEffect } from "react";
import { useSocket } from "@/lib/socket";

const TranscriptionPage = () => {
  const socket = useSocket();
  useEffect(() => {
    if (!socket) return;
    const onConnect = () => {};
    socket.on("connect", onConnect);
    return () => {
      socket.off("connect", onConnect);
      socket.disconnect();
    };
  }, [socket]);
  return (
    <div className="min-w-[80vw] mx-auto p-4 md:p-8 flex items-center flex-col justify-between">
      <Transcription socket={socket} />
    </div>
  );
};

export default TranscriptionPage;
