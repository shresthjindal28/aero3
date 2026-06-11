export type ExportFormat = "pdf" | "text";

export type ExportPayload = {
  title: string;
  content: string;
  metadata?: Record<string, string>;
};

export class ExportService {
  static async exportText(payload: ExportPayload): Promise<void> {
    const blob = new Blob([payload.content], { type: "text/plain;charset=utf-8" });
    ExportService.downloadBlob(blob, `${ExportService.slugify(payload.title)}.txt`);
  }

  static async exportPdf(payload: ExportPayload): Promise<void> {
    const html = ExportService.buildPrintHtml(payload);
    const printWindow = window.open("", "_blank", "noopener,noreferrer");

    if (!printWindow) {
      throw new Error("Unable to open print window. Check popup blocker.");
    }

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  static async exportTranscriptPdf(input: {
    patientName: string;
    consultationLabel: string;
    transcript: string;
  }): Promise<void> {
    await ExportService.exportPdf({
      title: `Transcript — ${input.patientName}`,
      content: input.transcript,
      metadata: {
        Patient: input.patientName,
        Consultation: input.consultationLabel,
      },
    });
  }

  static async exportSoapPdf(input: {
    patientName: string;
    consultationLabel: string;
    sections: Record<string, string>;
  }): Promise<void> {
    const content = Object.entries(input.sections)
      .map(([key, value]) => `${key.toUpperCase()}\n${value || "—"}\n`)
      .join("\n");

    await ExportService.exportPdf({
      title: `SOAP — ${input.patientName}`,
      content,
      metadata: {
        Patient: input.patientName,
        Consultation: input.consultationLabel,
      },
    });
  }

  static async exportPatientSummaryPdf(input: {
    patientName: string;
    summary: string;
  }): Promise<void> {
    await ExportService.exportPdf({
      title: `Patient Summary — ${input.patientName}`,
      content: input.summary,
    });
  }

  private static buildPrintHtml(payload: ExportPayload): string {
    const meta = payload.metadata
      ? Object.entries(payload.metadata)
          .map(([k, v]) => `<p><strong>${k}:</strong> ${v}</p>`)
          .join("")
      : "";

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${payload.title}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 40px; line-height: 1.6; color: #111; }
    h1 { font-size: 20px; margin-bottom: 16px; }
    pre { white-space: pre-wrap; font-family: inherit; }
    .meta { margin-bottom: 24px; color: #555; font-size: 14px; }
  </style>
</head>
<body>
  <h1>${payload.title}</h1>
  <div class="meta">${meta}</div>
  <pre>${payload.content.replace(/</g, "&lt;")}</pre>
</body>
</html>`;
  }

  private static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private static slugify(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
}
