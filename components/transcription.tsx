"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Play, Stethoscope, StopCircle, Loader2 } from "lucide-react";
import PatientSessionModal, {
  PatientData,
} from "@/components/PatientSessionModal"; // Import the new modal
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TscriptionContent, { SoapNotesType } from "./tscription-content";
import Recording from "@/components/recording";
import UploadReports from "@/components/Upload-reports";
import { type Socket } from "socket.io-client";
import PatientDetails from "@/components/PatientDetails";
import { MorphSurface } from "@/components/smoothui/ai-input";
import { Button } from "./ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [readyForTalk, setReadyForTalk] = useState(false);
  const recorderRef = useRef<MediaRecorder>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const [recordingAskAI, setRecordingAskAI] = useState(false);
  const [awaitingAIResponse, setAwaitingAIResponse] = useState(false);
  const [botSpeaking, setBotSpeaking] = useState(false);
  const { user, isLoaded } = useUser();
  const handleSessionStart = (patient: PatientData) => {
    setPatientName(patient.name);
    setPatientNumber(patient.id);
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!socket || !user?.id || !isLoaded) return;

    const eventName = `ask-ai-channel-${user.id}`;
    console.log("🎧 Listening on:", eventName);

    const handler = (arrayBuffer: ArrayBuffer) => {
      console.log("🔥 Received TTS audio from backend");

      const blob = new Blob([arrayBuffer], { type: "audio/wav" });
      console.log("🎵 Blob created:", blob);

      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      setAwaitingAIResponse(false);
      audio.addEventListener("playing", () => setBotSpeaking(true));
      audio.addEventListener("ended", () => setBotSpeaking(false));
      audio.addEventListener("error", () => setBotSpeaking(false));
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
          <PatientSessionModal
            isOpen={isModalOpen}
            onSessionStart={handleSessionStart}
          />

          <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                <Stethoscope className="h-8 w-8" />
                Doctor&apos;s Patient Notes
              </h1>
            </div>

            {(patientNumber || patientName) && (
              <>
                <Card className="bg-background!">
                  <PatientDetails name={patientName} id={patientNumber} />
                </Card>
              </>
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
                      Talk with AI and get suggestions and information related
                      to the patient.
                    </p>
                  </CardHeader>
                  <CardContent className="flex justify-end">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          // disabled={!readyForTalk}
                          // variant={!readyForTalk ? "secondary" : "default"}
                          onClick={() => {}}
                          className="flex items-center"
                        >
                          <p>
                            <Bot className="scale-125" />
                          </p>
                          <p>Start Talk</p>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Talk with AI</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-8 relative mt-10 items-center">
                          <SiriOrb />
                          <div className="">
                            <div className="flex gap-4 ">
                              <Button
                                variant="secondary"
                                onClick={async () => {
                                  try {
                                    const stream =
                                      await navigator.mediaDevices.getUserMedia(
                                        {
                                          audio: true,
                                        }
                                      );
                                    const recorder = new MediaRecorder(stream);
                                    recorderRef.current = recorder;
                                    setRecordingAskAI(true);
                                    setAwaitingAIResponse(true);
                                    console.log("🎙️ Started recording loop");

                                    recorder.ondataavailable = async (e) => {
                                      if (e.data.size > 0) {
                                        // chunksRef.current.push(e.data);
                                        const blob = new Blob([e.data], {
                                          type: "audio/webm",
                                        });
                                        // added emit here becuase, in the on stop e listner the last few seconds where not recorded
                                        socket?.emit(
                                          `ask-ai-channel-${user?.id}`,
                                          await blob.arrayBuffer()
                                        );
                                      }
                                    };

                                    recorder.onstop = () => {
                                      console.log("ask AI stopped");
                                      toast.info("Ask AI stopped");
                                      setRecordingAskAI(false);
                                      setAwaitingAIResponse(false);
                                      recorder.stop();
                                    };

                                    recorder.start();
                                    toast.info("Ask AI started");
                                  } catch (error) {
                                    console.log(error);
                                  }
                                }}
                              >
                                <Play className="mr-2 h-4 w-4" /> start
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  if (recorderRef.current) {
                                    recorderRef.current.stop();
                                  }
                                }}
                              >
                                <StopCircle className="mr-2 h-4 w-4" /> Stop
                              </Button>
                            </div>
                            {awaitingAIResponse && (
                              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Waiting for AI response…</span>
                              </div>
                            )}
                            {botSpeaking && (
                              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Speaking…</span>
                              </div>
                            )}
                            {/* {(recordingStatus === "recording" || recordingStatus === "paused") && (
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
              )} */}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>
              {/* <div className="space-y-6">
            <UploadReports patientId={patientNumber} />
            <Card>
              <CardHeader>
                <CardTitle>Patient Reports</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-around">
                <ReportsDrawer patientId={patientNumber} />
              </CardContent>
            </Card>
          </div> */}
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Generated Report </CardTitle>
              </CardHeader>
              <CardContent>
                {soapNotes === null ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-11/12" />
                      <Skeleton className="h-3 w-10/12" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-11/12" />
                      <Skeleton className="h-3 w-10/12" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-11/12" />
                      <Skeleton className="h-3 w-10/12" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-11/12" />
                      <Skeleton className="h-3 w-10/12" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <section className="p-2">
                      <h2 className="font-medium mb-2">Subjective</h2>
                      <p className="text-sm leading-relaxed text-foreground/80">
                        {soapNotes.subjective}
                      </p>
                    </section>

                    <section className="p-2">
                      <h2 className="font-medium mb-2">Objective</h2>
                      <p className="text-sm leading-relaxed text-foreground/80">
                        {soapNotes.objective}
                      </p>
                    </section>

                    <section className="p-2">
                      <h2 className="font-medium mb-2">Assessment</h2>
                      <p className="text-sm leading-relaxed text-foreground/80">
                        {soapNotes.assessment}
                      </p>
                    </section>

                    <section className="p-2">
                      <h2 className="font-medium mb-2">Plan</h2>
                      <p className="text-sm leading-relaxed text-foreground/80">
                        {soapNotes.plan}
                      </p>
                    </section>
                    <section className="p-2 flex items-center justify-center">
                      <MorphSurface />
                    </section>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      ) : (
        <p>loading...</p>
      )}
    </>
  );
}
