import type {
  DocumentFilterType,
  PatientDocumentItem,
} from "@/features/documents/types/document.types";

export function inferDocumentCategory(
  fileName: string,
  fileType: string | null,
): DocumentFilterType {
  const lower = `${fileName} ${fileType ?? ""}`.toLowerCase();
  if (lower.includes("prescription") || lower.includes("rx")) return "prescription";
  if (lower.includes("report") || lower.includes("lab")) return "report";
  if (lower.includes("pdf") || lower.endsWith(".pdf")) return "pdf";
  if (
    lower.includes("image") ||
    lower.includes("png") ||
    lower.includes("jpg") ||
    lower.includes("jpeg") ||
    lower.includes("webp")
  ) {
    return "image";
  }
  return "all";
}

export function filterDocuments(
  documents: PatientDocumentItem[],
  query: string,
  filter: DocumentFilterType,
): PatientDocumentItem[] {
  const normalized = query.trim().toLowerCase();

  return documents.filter((doc) => {
    const category = inferDocumentCategory(doc.file_name, doc.file_type);
    const matchesFilter = filter === "all" || category === filter;
    const matchesQuery =
      !normalized ||
      doc.file_name.toLowerCase().includes(normalized) ||
      doc.consultationLabel.toLowerCase().includes(normalized);

    return matchesFilter && matchesQuery;
  });
}

export function isPreviewable(fileType: string | null, fileName: string): boolean {
  const value = `${fileType ?? ""} ${fileName}`.toLowerCase();
  return (
    value.includes("pdf") ||
    value.includes("image") ||
    value.includes("png") ||
    value.includes("jpg") ||
    value.includes("jpeg") ||
    value.includes("webp")
  );
}
