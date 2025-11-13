"use client";

import Transcription from "@/components/transcription";
import React, { useEffect } from "react";
import { useSocket } from "@/lib/socket";

const page = () => {
  const socket = useSocket();
  useEffect(() => {
    socket?.on("connect", () => {
      console.log("connected to server");
    });
    return () => {
      socket?.off("connect");
      socket?.disconnect();
    };
  }, []);
  return (
    <div className="min-w-[80vw] mx-auto p-4 md:p-8 flex items-center flex-col justify-between">
      <Transcription socket={socket} />
    </div>
  );
};

export default page;
