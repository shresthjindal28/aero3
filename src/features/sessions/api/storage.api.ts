import { apiClient } from "@/lib/api/client";
import { uploadStorageFile } from "@/features/documents/api/storage.api";

export type UploadUrlRequest = {
  resource_type: "audio_chunk";
  session_id: string;
  file_name: string;
};

export type UploadUrlResponse = {
  upload_url: string;
  object_key: string;
  expires_in: number;
  content_type: string;
};

export async function requestUploadUrl(
  input: UploadUrlRequest,
): Promise<UploadUrlResponse> {
  const { data } = await apiClient.post<UploadUrlResponse>(
    "/storage/upload-url",
    input,
  );
  return data;
}

export async function uploadSessionChunk(
  input: UploadUrlRequest,
  blob: Blob,
): Promise<{ object_key: string; content_type: string }> {
  return uploadStorageFile(
    {
      resource_type: "audio_chunk",
      session_id: input.session_id,
      file_name: input.file_name,
    },
    blob,
    input.file_name,
  );
}

/** @deprecated Use uploadSessionChunk — avoids R2 bucket CORS requirements. */
export async function uploadToPresignedUrl(
  uploadUrl: string,
  blob: Blob,
  contentType: string,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: blob,
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }
}
