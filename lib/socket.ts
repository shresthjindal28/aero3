"use client";

import { io, Socket } from "socket.io-client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";

const URL = "http://localhost:3500";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!URL || !isLoaded || !user) {
      return;
    }

    const socket = io(URL, {
      query: {
        doctorId: user.id,
      },
    });

    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, [isLoaded, user]);

  return socket;
}
