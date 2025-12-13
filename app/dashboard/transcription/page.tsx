import ReportsDrawer from "@/components/transcriptionComponents/reports/ReportsDrawer.server";
import TranscriptionClient from "./TranscriptionClient";

export default function TranscriptionPage() {
  const patientNumber = "PAT-581569"; // later from params/session

  return (
    <div className="min-w-[80vw] mx-auto p-4 md:p-8 flex items-center flex-col justify-between">
      <TranscriptionClient />
      <ReportsDrawer patientId={patientNumber} />
    </div>
  );
}
