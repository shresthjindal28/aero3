import ReportsDrawer from "@/components/transcriptionComponents/reports/ReportsDrawer.server";
import TranscriptionClient from "../TranscriptionClient";

export default async function TranscriptionPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;

  return (
    <div className="min-w-[80vw] mx-auto p-4 md:p-8 flex items-center flex-col justify-between">
      <TranscriptionClient />
      <ReportsDrawer patientId={patientId} />
    </div>
  );
}
