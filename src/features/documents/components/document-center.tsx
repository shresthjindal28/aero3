"use client";

import { useMemo, useRef, useState } from "react";
import {
  Download,
  Eye,
  FileText,
  Trash2,
  Upload,
} from "lucide-react";

import { useConsultations } from "@/features/consultations/hooks/use-consultations";
import { usePatient } from "@/features/patients/hooks/use-patient";
import {
  useDeleteDocument,
  useUploadDocument,
} from "@/features/documents/hooks/use-document-mutations";
import { usePatientDocuments } from "@/features/documents/hooks/use-patient-documents";
import { requestDownloadUrl } from "@/features/documents/api/storage.api";
import type { DocumentFilterType } from "@/features/documents/types/document.types";
import {
  filterDocuments,
  inferDocumentCategory,
  isPreviewable,
} from "@/features/documents/utils/document.utils";
import { formatDateTime } from "@/lib/utils/date";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { ShellSkeletonLoader } from "@/shared/ui/feedback/skeleton-loader";
import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";
import { Select } from "@/shared/ui/primitives/select";
import { toast } from "sonner";

type DocumentCenterProps = {
  patientId: string;
};

const filters: Array<{ value: DocumentFilterType; label: string }> = [
  { value: "all", label: "All" },
  { value: "pdf", label: "PDF" },
  { value: "image", label: "Images" },
  { value: "report", label: "Reports" },
  { value: "prescription", label: "Prescriptions" },
];

export function DocumentCenter({ patientId }: DocumentCenterProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<DocumentFilterType>("all");
  const [consultationId, setConsultationId] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: patient, isLoading: patientLoading } = usePatient(patientId);
  const { data: consultations = [] } = useConsultations(patientId);
  const { data: documents = [], isLoading, refetch } = usePatientDocuments(patientId);
  const uploadMutation = useUploadDocument(patientId);
  const deleteMutation = useDeleteDocument(patientId);

  const filtered = useMemo(
    () => filterDocuments(documents, query, filter),
    [documents, filter, query],
  );

  const handleUpload = async (file: File) => {
    if (!consultationId) {
      toast.error("Select a consultation first");
      return;
    }
    await uploadMutation.mutateAsync({ consultationId, file });
  };

  const handleDownload = async (objectKey: string) => {
    const { download_url: url } = await requestDownloadUrl(objectKey);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (patientLoading) {
    return <ShellSkeletonLoader />;
  }

  if (!patient) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <ApiErrorDisplay error={new Error("Patient not found")} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <header>
        <p className="text-sm text-muted-foreground">Document center</p>
        <h1 className="text-2xl font-semibold tracking-tight">{patient.full_name}</h1>
      </header>

      <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/50 p-4 lg:flex-row lg:items-end">
        <div className="flex-1 space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Upload to consultation
          </label>
          <Select
            value={consultationId}
            onChange={(e) => setConsultationId(e.target.value)}
            aria-label="Select consultation"
          >
            <option value="">Select consultation</option>
            {consultations.map((c) => (
              <option key={c.id} value={c.id}>
                {c.chief_complaint ?? "Consultation"}
              </option>
            ))}
          </Select>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
        >
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search documents…"
          aria-label="Search documents"
        />
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as DocumentFilterType)}
          className="sm:w-48"
          aria-label="Filter documents"
        >
          {filters.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading documents…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
          No documents found.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((doc) => (
            <article
              key={doc.id}
              className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{doc.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.consultationLabel} ·{" "}
                    {inferDocumentCategory(doc.file_name, doc.file_type)} ·{" "}
                    {formatDateTime(doc.uploaded_at)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {isPreviewable(doc.file_type, doc.file_name) ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const { download_url: url } = await requestDownloadUrl(
                        doc.file_url,
                      );
                      setPreviewUrl(url);
                    }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleDownload(doc.file_url)}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate(doc.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {previewUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Document preview"
        >
          <div className="flex h-[80vh] w-full max-w-4xl flex-col rounded-xl bg-background">
            <div className="flex justify-end border-b p-2">
              <Button type="button" variant="ghost" onClick={() => setPreviewUrl(null)}>
                Close
              </Button>
            </div>
            <iframe
              src={previewUrl}
              title="Document preview"
              className="min-h-0 flex-1"
            />
          </div>
        </div>
      ) : null}

      <Button type="button" variant="ghost" size="sm" onClick={() => void refetch()}>
        Refresh
      </Button>
    </div>
  );
}
