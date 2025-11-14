"use client";

import { useState } from "react";
import { Stethoscope } from "lucide-react";
import PatientSessionModal, { PatientData } from "@/components/PatientSessionModal"; // Import the new modal
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TscriptionContent from "./tscription-content";
import Recording from "@/components/recording";
import UploadReports from "@/components/Upload-reports";
import { type Socket } from "socket.io-client";
import PatientDetails from "@/components/PatientDetails";
import ReportsDrawer from "./reportsdrawer";

export default function DoctorInputPage({ socket }: { socket: Socket | null }) {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [patientNumber, setPatientNumber] = useState("");
  const [patientName, setPatientName] = useState("");

  const handleSessionStart = (patient: PatientData) => {
    setPatientName(patient.name);
    setPatientNumber(patient.id);
    setIsModalOpen(false);
  };

  return (
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
          <>
            <Card className="bg-background!">
              <PatientDetails name={patientName} id={patientNumber} />
            </Card>
          </>
        )}

        <Recording patientId={patientNumber || undefined} socket={socket} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TscriptionContent patientId={patientNumber} socket={socket} />

          <div className="space-y-6">
            <UploadReports patientId={patientNumber} />

            <Card>
              <CardHeader>
                <CardTitle>Generated Report (Preview)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-dashed border-muted-foreground rounded-md p-4 min-h-[100px]">
                  <p className="text-muted-foreground">
                    As you suggested, this area would load a new component (e.g.,{" "}
                    {"<PdfPreviewComponent data={...} />"}) to render the generated PDF.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <ReportsDrawer patientId={patientNumber} />
      </div>
    </main>
  );
}
