import TranscriptionClient from "./TranscriptionClient";

export default function TranscriptionPage() {
  return (
    <div className="min-w-[80vw] mx-auto p-4 md:p-8 flex items-center flex-col justify-between">
      <TranscriptionClient />
    </div>
  );
}
