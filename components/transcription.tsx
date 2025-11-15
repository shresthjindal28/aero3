"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Play, StopCircle, Stethoscope } from "lucide-react";
import PatientSessionModal, { PatientData } from "@/components/PatientSessionModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TscriptionContent, { SoapNotesType } from "./tscription-content";
import Recording from "@/components/recording";
import UploadReports from "@/components/Upload-reports";
import { type Socket } from "socket.io-client";
import PatientDetails from "@/components/PatientDetails";
import { MorphSurface } from "@/components/smoothui/ai-input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SiriOrb from "./smoothui/siri-orb";
import { useUser } from "@clerk/nextjs";

export default function DoctorInputPage({ socket }: { socket: Socket | null }) {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [patientNumber, setPatientNumber] = useState("");
  const [patientName, setPatientName] = useState("");
  const [isLastChunkRef, setIsLastChunkRef] = useState(false);
  const [soapNotes, setSoapNotes] = useState<SoapNotesType | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const [recordingAskAI, setRecordingAskAI] = useState(false);
  const [, setReadyForTalk] = useState(false);

  const { user, isLoaded } = useUser();

  const handleSessionStart = (patient: PatientData) => {
    setPatientName(patient.name);
    setPatientNumber(patient.id);
    setIsModalOpen(false);
  };

  // ✅ LISTEN FOR AUDIO FROM BACKEND
  useEffect(() => {
    if (!socket || !user?.id || !isLoaded) return;

    const eventName = `ask-ai-output-${user.id}`;
    console.log("🎧 Listening on:", eventName);

    const handler = (arrayBuffer: ArrayBuffer) => {
      console.log("🔥 Received TTS audio from backend");

      const blob = new Blob([arrayBuffer], { type: "audio/wav" });
      console.log("🎵 Blob created:", blob);

      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.play();
    };

    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, [socket, isLoaded, user?.id]);

  return (
    <>
      {isLoaded ? (
        <main className="bg-background text-foreground min-h-screen">
          <PatientSessionModal isOpen={isModalOpen} onSessionStart={handleSessionStart} />

          <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                <Stethoscope className="h-8 w-8" />
                Doctor&apos;s Patient Notes
              </h1>
            </div>

            {(patientNumber || patientName) && (
              <Card className="bg-background!">
                <PatientDetails name={patientName} id={patientNumber} />
              </Card>
            )}

            <Recording
              setIsLastChunkRef={setIsLastChunkRef}
              patientId={patientNumber || undefined}
              socket={socket}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TscriptionContent
                soapNotes={soapNotes}
                setSoapNotes={setSoapNotes}
                setIsLastChunkRef={setIsLastChunkRef}
                isLastChunkRef={isLastChunkRef}
                patientId={patientNumber}
                socket={socket}
                setReadyForTalk={setReadyForTalk}
              />

              <div className="space-y-6">
                <UploadReports patientId={patientNumber} />

                <Card className="bg-background">
                  <CardHeader>
                    <CardTitle>Ask AI</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Talk with AI and get suggestions and information related to the patient.
                    </p>
                  </CardHeader>
                  <CardContent className="flex justify-end">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                          <Bot className="scale-125" />
                          Start Talk
                        </Button>
                      </DialogTrigger>

                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Talk with AI</DialogTitle>
                        </DialogHeader>

                        <div className="flex flex-col gap-8 relative mt-10 items-center">
                          <SiriOrb />

                          <div className="flex gap-4">

                            {/* 🎤 START RECORDING */}
                            <Button
                              variant="secondary"
                              onClick={async () => {
                                try {
                                  const stream = await navigator.mediaDevices.getUserMedia({
                                    audio: true,
                                  });

                                  const recorder = new MediaRecorder(stream);
                                  recorderRef.current = recorder;
                                  setRecordingAskAI(true);

                                  console.log("🎙️ Recording...");

                                  recorder.ondataavailable = async (e) => {
                                    if (e.data.size > 0) {
                                      const blob = new Blob([e.data], { type: "audio/webm" });

                                      socket?.emit(
                                        `ask-ai-input-${user?.id}`,
                                        await blob.arrayBuffer()
                                      );
                                    }
                                  };

                                  recorder.onstop = () => {
                                    console.log("🛑 Recording stopped");
                                    toast.info("Ask AI stopped");
                                    setRecordingAskAI(false);
                                  };

                                  recorder.start(300);
                                  toast.info("Ask AI started");
                                } catch (error) {
                                  console.log(error);
                                }
                              }}
                            >
                              <Play className="mr-2 h-4 w-4" /> Start
                            </Button>

                            {/* 🛑 STOP RECORDING */}
                            <Button
                              variant="destructive"
                              onClick={() => {
                                if (recorderRef.current && recordingAskAI) {
                                  recorderRef.current.stop();
                                }
                              }}
                            >
                              <StopCircle className="mr-2 h-4 w-4" /> Stop
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Generated Report</CardTitle>
              </CardHeader>
              <CardContent>
                {soapNotes ? (
                  <>
                    <section className="p-2">
                      <h2 className="font-medium mb-2">Subjective</h2>
                      <p className="text-sm">{soapNotes.subjective}</p>
                    </section>

                    <section className="p-2">
                      <h2 className="font-medium mb-2">Objective</h2>
                      <p className="text-sm">{soapNotes.objective}</p>
                    </section>

                    <section className="p-2">
                      <h2 className="font-medium mb-2">Assessment</h2>
                      <p className="text-sm">{soapNotes.assessment}</p>
                    </section>

                    <section className="p-2">
                      <h2 className="font-medium mb-2">Plan</h2>
                      <p className="text-sm">{soapNotes.plan}</p>
                    </section>

                    <section className="p-2 flex items-center justify-center">
                      <MorphSurface />
                    </section>
                  </>
                ) : (
                  <div className="border border-dashed rounded-md p-4 min-h-[100px]"></div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}
