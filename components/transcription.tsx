"use client";

import { useState, ChangeEvent } from "react";
import { Stethoscope } from "lucide-react";
import PatientSessionModal, { PatientData } from "@/components/PatientSessionModal"; // Import the new modal
import UploadReports from "@/components/Upload-reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import TscriptionContent from "./tscription-content";
import Recording from "@/components/recording";

export default function DoctorInputPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [patientNumber, setPatientNumber] = useState("");
  const [patientName, setPatientName] = useState("");
  const [transcribedText, setTranscribedText] = useState("");
  const [reportFile, setReportFile] = useState<File | null>(null);

  const handleSessionStart = (patient: PatientData) => {
    setPatientName(patient.name);
    setPatientNumber(patient.id);
    setIsModalOpen(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReportFile(e.target.files[0]);
    }
  };

  return (
    <main className="bg-background text-foreground min-h-screen">
      {/* The modal is now just one clean line here */}
      {/* <PatientSessionModal isOpen={isModalOpen} onSessionStart={handleSessionStart} /> */}

      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Stethoscope className="h-8 w-8" />
            Doctor&apos;s Patient Notes
          </h1>
        </div>

        {(patientNumber || patientName) && (
          <Card>
            <CardHeader>
              <CardTitle>Patient Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-lg">
                <strong>Patient Name:</strong> {patientName}
              </p>
              <p className="text-lg">
                <strong>Patient ID:</strong> {patientNumber}
              </p>
            </CardContent>
          </Card>
        )}

        <Recording
          patientId={patientNumber || undefined}
          onTranscribed={setTranscribedText}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TscriptionContent transcribedText={transcribedText} />

          <div className="space-y-6">
            <UploadReports reportFile={reportFile} onFileChange={handleFileChange} />

            <Card>
              <CardHeader>
                <CardTitle>Generated Report (Preview)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-dashed border-muted-foreground rounded-md p-4 min-h-[100px]">
                  <p className="text-muted-foreground">
                    As you suggested, this area would load a new component (e.g., `
                    {`<PdfPreviewComponent data={...} />`}`) to render the generated PDF.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
