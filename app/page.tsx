"use client";

import Transcription from "@/components/transcription";
import { socket } from "@/lib/socket";
import React, { useEffect } from "react";

const page = () => {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected");
    });
    return () => {
      socket.off("connect");
      socket.disconnect();
    };
  }, []);
  return (
    <div>
      <Transcription socket={socket} />
    </div>
  );
};

export default page;
