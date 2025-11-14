"use client";

import { useEffect, useState } from "react";
import { Stethoscope } from "lucide-react";
import PatientSessionModal, {
  PatientData,
} from "@/components/PatientSessionModal"; // Import the new modal
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TscriptionContent, { SoapNotesType } from "./tscription-content";
import Recording from "@/components/recording";
import UploadReports from "@/components/Upload-reports";
import { type Socket } from "socket.io-client";
import PatientDetails from "@/components/PatientDetails";
import ReportsDrawer from "./reportsdrawer";
import { MorphSurface } from "@/components/smoothui/ai-input";

export default function DoctorInputPage({ socket }: { socket: Socket | null }) {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [patientNumber, setPatientNumber] = useState("");
  const [patientName, setPatientName] = useState("");
  const [isLastChunkRef, setIsLastChunkRef] = useState(false);
  const [soapNotes, setSoapNotes] = useState<SoapNotesType | null>(null);

  const handleSessionStart = (patient: PatientData) => {
    setPatientName(patient.name);
    setPatientNumber(patient.id);
    setIsModalOpen(false);
  };

  useEffect(() => {
    console.log("soap notes");

    console.log(soapNotes);
  }, [soapNotes]);

  return (
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
          />

          <div className="space-y-6">
            <UploadReports patientId={patientNumber} />
            <Card>
              <CardHeader>
                <CardTitle>Generated Report (Preview)</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-around">
                <ReportsDrawer patientId={patientNumber} />
              </CardContent>
            </Card>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Generated Report </CardTitle>
          </CardHeader>
          <CardContent>
            {soapNotes === null ? (
              <div className="border border-dashed border-muted-foreground rounded-md p-4 min-h-[100px]"></div>
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
  );
}
