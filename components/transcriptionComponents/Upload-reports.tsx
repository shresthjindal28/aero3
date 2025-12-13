"use client";

import { useState } from "react";
import { CloudUpload, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  patientId?: string;
  onUploadSuccess?: () => void;
};

export default function UploadReports({ patientId, onUploadSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!patientId) {
      setStatus("error");
      setMessage("Please start a patient session first.");
      return;
    }
    if (!file) {
      setStatus("error");
      setMessage("Please select a file to upload.");
      return;
    }

    setStatus("uploading");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("userId", patientId);
      formData.append("report", file);
      if (note) formData.append("note", note);

      const res = await fetch("/api/patient/report", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("done");
        setUploadedUrl(data.url ?? null);
        setMessage("Uploaded successfully.");
        onUploadSuccess?.();
      } else {
        setStatus("error");
        setMessage(data?.error ?? "Upload failed.");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Unexpected error during upload.");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="border border-dashed rounded-md p-4">
        <div className="flex items-center gap-3">
          {status === "done" ? (
            <PackageCheck className="h-6 w-6 text-green-600" />
          ) : (
            <CloudUpload className="h-6 w-6 text-primary" />
          )}
          <div>
            <p className="font-medium">Upload Reports</p>
            <p className="text-sm mt-1 text-muted-foreground">
              Upload lab reports, images, videos, audio, or documents to attach with the
              patient session.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Report name"
            className="block w-full text-sm border border-primary rounded-md p-2"
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm border border-primary rounded-md p-2"
          />
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={!patientId || status === "uploading"}>
              {status === "uploading" ? "Uploading..." : "Upload"}
            </Button>
            {file && (
              <span className="text-sm text-muted-foreground">Selected: {file.name}</span>
            )}
          </div>

          {message && (
            <p className={status === "error" ? "text-red-600" : "text-green-600"}>
              {message}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
