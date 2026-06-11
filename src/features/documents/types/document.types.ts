export type ConsultationDocument = {
  id: string;
  consultation_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  uploaded_at: string;
};

export type ConsultationDocumentCreateInput = {
  consultation_id: string;
  file_name: string;
  file_url: string;
  file_type?: string | null;
};

export type PatientDocumentItem = ConsultationDocument & {
  consultationLabel: string;
  patientId: string;
};

export type DocumentFilterType = "all" | "pdf" | "image" | "report" | "prescription";
