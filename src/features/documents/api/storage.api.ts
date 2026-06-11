import { apiClient } from "@/lib/api/client";

export type DocumentUploadUrlRequest = {
  resource_type:
    | "consultation_document"
    | "doctor_document"
    | "doctor_profile_picture"
    | "audio_chunk";
  consultation_id?: string;
  session_id?: string;
  file_name: string;
};

export type StorageUploadResponse = {
  object_key: string;
  content_type: string;
};

export type UploadUrlResponse = StorageUploadResponse & {
  upload_url: string;
  expires_in: number;
};

export type DownloadUrlResponse = {
  download_url: string;
  object_key: string;
  expires_in: number;
};

export async function uploadStorageFile(
  input: DocumentUploadUrlRequest,
  file: File | Blob,
  fileName: string,
): Promise<StorageUploadResponse> {
  const formData = new FormData();
  formData.append("resource_type", input.resource_type);
  formData.append("file_name", fileName);
  formData.append("file", file, fileName);
  if (input.consultation_id) {
    formData.append("consultation_id", input.consultation_id);
  }
  if (input.session_id) {
    formData.append("session_id", input.session_id);
  }

  const { data } = await apiClient.post<StorageUploadResponse>(
    "/storage/upload",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data;
}

/** @deprecated Prefer uploadStorageFile — direct R2 PUT requires bucket CORS rules. */
export async function requestDocumentUploadUrl(
  input: DocumentUploadUrlRequest,
): Promise<UploadUrlResponse> {
  const { data } = await apiClient.post<UploadUrlResponse>(
    "/storage/upload-url",
    input,
  );
  return data;
}

/** @deprecated Prefer uploadStorageFile — browser PUT to R2 fails without bucket CORS. */
export async function uploadToPresignedUrl(
  uploadUrl: string,
  file: File | Blob,
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

export async function requestDownloadUrl(
  objectKey: string,
): Promise<DownloadUrlResponse> {
  const { data } = await apiClient.post<DownloadUrlResponse>(
    "/storage/download-url",
    { object_key: objectKey },
  );
  return data;
}

export async function deleteStorageObject(objectKey: string): Promise<void> {
  await apiClient.delete("/storage/object", {
    data: { object_key: objectKey },
  });
}
