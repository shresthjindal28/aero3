// clinet component beacuse parent in client
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/nextjs";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { type Socket } from "socket.io-client";
import { AnimatedList } from "@/components/ui/animated-list";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { AudioLines } from "lucide-react";
import { toast } from "sonner";

export type SoapNotesType = {
  assessment: string;
  objective: string;
  plan: string;
  subjective: string;
};

const TscriptionContent = ({
  patientId,
  socket,
  isLastChunkRef,
  setIsLastChunkRef,
  soapNotes,
  setSoapNotes,
}: {
  patientId: string;
  socket: Socket | null;
  isLastChunkRef: boolean;
  setIsLastChunkRef: Dispatch<SetStateAction<boolean>>;
  soapNotes: SoapNotesType | null;
  setSoapNotes: Dispatch<SetStateAction<SoapNotesType | null>>;
}) => {
  const [transcribedText, setTranscribedText] = useState("");
  const { user, isLoaded } = useUser();
  const [transcribedTextList, setTranscribedTextList] = useState<string[]>([]);

  useEffect(() => {
    // console.log("islastchunk:" + isLastChunkRef);
    const lastChunkChores = async () => {
      console.log("streaming stopped");
      console.log("Sending this data to llm..");
      console.log(transcribedText);

      // getting soap data to llm
      const fd = new FormData();
      fd.append("conversation_text", transcribedText);
      try {
        const data = await (
          await fetch(" https://med-llm.onrender.com/generate-soap", {
            method: "POST",
            body: fd,
          })
        ).json();
        console.log(data.soap_notes);
        if (data.soap_notes) setSoapNotes(data.soap_notes as SoapNotesType);

        // sending data to db
        if (!data.soap_notes || !patientId) {
          console.error(
            "Soap notes or patientID not found while updating db with soap notes"
          );
          return;
        }
        fd.append("patient_id", patientId);
        fd.append("transcribed_text", transcribedText);
        fd.append(
          "soap_notes",
          `
date: ${new Date().toLocaleDateString()}\n
Subjective:
${data.soap_notes.subjective}

Objective:
${data.soap_notes.objective}

Assessment:
${data.soap_notes.assessment}

Plan:
${data.soap_notes.plan}
`
        );

        const response = await fetch("/api/update-soapnotes", {
          method: "POST",
          body: fd,
        });

        const data2 = await response.json();
        if (!response.ok) {
          console.error("Server error:", data2);
          alert(data2.error ?? "Failed to update SOAP notes");
          return;
        }

        console.log("Success:", data2);
        toast.success("soap notes pushed to DB");

        const responseRagEmbedding = await fetch("/api/rag-update", {
          method: "POST",
          body: fd,
        });

        const dataRagEmbedding = await responseRagEmbedding.json();
        if (!response.ok) {
          console.error("Server error:", dataRagEmbedding);
          alert(data2.error ?? "Failed to update rag embeddings notes");
          return;
        }
        toast.success("Data updated to rag embeddings");
      } catch (error) {
        console.log(error);
      }

      // after sending data to llm and db
      setIsLastChunkRef(false);
    };

    if (isLastChunkRef && transcribedTextList.length > 0) {
      lastChunkChores();
    }
  }, [isLastChunkRef]);

  const handleTranscriptChunk = (chunk: string) => {
    if (!chunk) return;
    // concatenation of chunk
    setTranscribedText((prev) => (prev ? `${prev} ${chunk}` : chunk));
    // push into list per chunk
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
