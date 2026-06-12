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

  static async exportPrescriptionPdf(input: {
    htmlContent: string;
    patientName: string;
    doctorName: string;
    doctorRegistration: string;
    hospitalName: string;
    consultationLabel: string;
    autoPrint?: boolean;
  }): Promise<void> {
    const html = ExportService.buildPrescriptionPrintHtml(input);
    const printWindow = window.open("", "_blank", "noopener,noreferrer");

    if (!printWindow) {
      throw new Error("Unable to open print window. Check popup blocker.");
    }

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    if (input.autoPrint !== false) {
      printWindow.print();
    }
  }

  private static buildPrescriptionPrintHtml(input: {
    htmlContent: string;
    patientName: string;
    doctorName: string;
    doctorRegistration: string;
    hospitalName: string;
    consultationLabel: string;
  }): string {
    const date = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Prescription — ${input.patientName}</title>
  <style>
    @page { margin: 20mm; }
    body { font-family: Georgia, "Times New Roman", serif; color: #111; line-height: 1.5; }
    .letterhead { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e3a5f; padding-bottom: 16px; margin-bottom: 24px; }
    .hospital { font-size: 22px; font-weight: 700; color: #1e3a5f; }
    .meta { font-size: 12px; color: #555; text-align: right; }
    .prescription-body h1, .prescription-body h2, .prescription-body h3 { color: #1e3a5f; }
    .prescription-body table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    .prescription-body th, .prescription-body td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    .prescription-body th { background: #f4f6f8; }
  </style>
</head>
<body>
  <div class="letterhead">
    <div>
      <div class="hospital">${input.hospitalName}</div>
      <div style="font-size:13px;color:#555;margin-top:4px;">Medical Prescription</div>
    </div>
    <div class="meta">
      <div><strong>Patient:</strong> ${input.patientName}</div>
      <div><strong>Consultation:</strong> ${input.consultationLabel}</div>
      <div><strong>Date:</strong> ${date}</div>
    </div>
  </div>
  <div class="prescription-body">
    ${input.htmlContent}
  </div>
  <footer style="margin-top:48px;border-top:1px solid #ccc;padding-top:16px;">
    <p><strong>Dr. ${input.doctorName}</strong></p>
    <p>Registration No: ${input.doctorRegistration || "—"}</p>
    <p style="margin-top:32px;">Signature: _________________________</p>
    <p style="font-size:12px;color:#666;margin-top:8px;">Date: ${date}</p>
  </footer>
</body>
</html>`;
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
