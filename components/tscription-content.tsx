// clinet component beacuse parent in client
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { type Socket } from "socket.io-client";
import { AnimatedList } from "@/components/ui/animated-list";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { AudioLines } from "lucide-react";

const TscriptionContent = ({
  patientId,
  socket,
}: {
  patientId: string;
  socket: Socket | null;
}) => {
  const [transcribedText, setTranscribedText] = useState("");
  const { user, isLoaded } = useUser();
  const [transcribedTextList, setTranscribedTextList] = useState<string[]>([]);

  const handleTranscriptChunk = (chunk: string) => {
    if (!chunk) return;
    setTranscribedText((prev) => (prev ? `${prev} ${chunk}` : chunk));
    setTranscribedTextList((prev) => [...prev, chunk]);
  };

  useEffect(() => {
    if (!socket) return;

    if (!isLoaded || !user) return;

    const eventName = `transcripted-data-${user.id}`;
    console.log("Listening for:", eventName);

    const handler = (data: string) => {
      console.log("Received transcript chunk:", data);
      if (typeof data === "string") {
        handleTranscriptChunk(data);
      } else if (data) {
        handleTranscriptChunk(data);
      }
    };

    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, [socket, user, isLoaded]);

  return (
    <>
      {isLoaded ? (
        <div>
          <Card className="p-3 bg-background relative space-y-2 h-[70vh] overflow-hidden">
            {/* <Label htmlFor="transcription">Transcription</Label> */}
            {/* <Textarea
              id="transcription"
              value={transcribedText}
              readOnly
              placeholder="Your recorded voice will appear here as text after stopping..."
              rows={15}
              className="text-base rounded-(--radius) w-full h-full"
            /> */}

            <AnimatedList className="h-full no-scrollbar overflow-scroll ">
              {transcribedTextList.length > 0 ? (
                transcribedTextList.map((el: string, i) => (
                  <div
                    className="border rounded-(--radius) bg-card py-4 text-sm px-2 duration-150 text-center w-full"
                    key={i}
                  >
                    <p>{el}</p>
                  </div>
                ))
              ) : (
                <div className="absolute top-1/2 gap-4 -translate-y-1/2 w-full flex flex-col items-center justify-center">
                  <AudioLines size={60} />
                  <div className="text-sm text-muted-foreground">
                    Transcribed Text will appear here.
                  </div>
                </div>
              )}
            </AnimatedList>
          </Card>
        </div>
      ) : (
        <p>loading..</p>
      )}
    </>
  );
};

export default TscriptionContent;
