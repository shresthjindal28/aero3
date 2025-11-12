"use client";

import { useState, ChangeEvent, useEffect, useRef } from "react";
import { Stethoscope } from "lucide-react";
import PatientSessionModal, {
  PatientData,
} from "@/components/PatientSessionModal"; // Import the new modal
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TscriptionContent from "./tscription-content";
import Recording from "@/components/recording";
import UploadReports from "@/components/Upload-reports";
import { type Socket } from "socket.io-client";
import PatientDetails from "@/components/PatientDetails";
import PatientReports from "@/components/PatientReports";

const CHUNKS_LENGTH = 10000;

export default function DoctorInputPage({ socket }: { socket: Socket }) {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [patientNumber, setPatientNumber] = useState("");
  const [patientName, setPatientName] = useState("");
  const [transcribedText, setTranscribedText] = useState("");
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportUploading, setReportUploading] = useState<boolean>(false);
  // const [entities, setEntities] = useState<MedicalEntities | null>(null);

  const [reports, setReports] = useState<Array<{ id: string; file_url: string; note?: string | null; created_at: string }>>([]);
  const [reportsLoading, setReportsLoading] = useState<boolean>(false);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const handleSessionStart = (patient: PatientData) => {
    setPatientName(patient.name);
    setPatientNumber(patient.id);
    setIsModalOpen(false);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReportFile(file);
    }
  };

  const fetchReports = async () => {
    if (!patientNumber) {
      setReports([]);
      return;
    }
    setReportsLoading(true);
    setReportsError(null);
    try {
      const res = await fetch(`/api/patient/report?userId=${encodeURIComponent(patientNumber)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setReports(data.reports ?? []);
      } else {
        setReports([]);
        setReportsError(data?.error ?? "Failed to fetch reports");
      }
    } catch (err) {
      console.error("Fetch reports error", err);
      setReportsError("Unexpected error while fetching reports");
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [patientNumber]);

  return (
    <main className="bg-background text-foreground min-h-screen">
      {/* The modal is now just one clean line here */}
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
            <Card>
              <PatientDetails name={patientName} id={patientNumber} />
            </Card>

            <Card>
              <PatientReports
                reports={reports}
                reportsLoading={reportsLoading}
                reportsError={reportsError}
              />
            </Card>
          </>
        )}

        <Recording
          patientId={patientNumber || undefined}
          onTranscribed={setTranscribedText}
          socket={socket}
          setTranscribedText={setTranscribedText}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TscriptionContent patientId={patientNumber} />

          <div className="space-y-6">
            <UploadReports
              patientId={patientNumber}
              onUploadSuccess={() => {
                // Immediately refresh reports
                fetchReports();
              }}
            />

            <Card>
              <CardHeader>
                <CardTitle>Generated Report (Preview)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-dashed border-muted-foreground rounded-md p-4 min-h-[100px]">
                  <p className="text-muted-foreground">
                    As you suggested, this area would load a new component
                    (e.g., {"<PdfPreviewComponent data={...} />"}) to render
                    the generated PDF.
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
