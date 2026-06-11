import { apiClient } from "@/lib/api/client";

export type DocumentUploadUrlRequest = {
  resource_type:
    | "consultation_document"
    | "doctor_document"
    | "doctor_profile_picture";
  consultation_id?: string;
  file_name: string;
};

export type UploadUrlResponse = {
  upload_url: string;
  object_key: string;
  expires_in: number;
  content_type: string;
};

export type DownloadUrlResponse = {
  download_url: string;
  object_key: string;
  expires_in: number;
};

export async function requestDocumentUploadUrl(
  input: DocumentUploadUrlRequest,
): Promise<UploadUrlResponse> {
  const { data } = await apiClient.post<UploadUrlResponse>(
    "/storage/upload-url",
    input,
  );
  return data;
}

export async function requestDownloadUrl(
  objectKey: string,
): Promise<DownloadUrlResponse> {
  const { data } = await apiClient.post<DownloadUrlResponse>(
    "/storage/download-url",
    { object_key: objectKey },
  );
  return data;
}

export async function uploadToPresignedUrl(
  uploadUrl: string,
  file: File,
  contentType: string,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }
}

export async function deleteStorageObject(objectKey: string): Promise<void> {
  await apiClient.delete("/storage/object", {
    data: { object_key: objectKey },
  });
}
