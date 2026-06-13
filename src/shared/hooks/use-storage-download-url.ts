"use client";

import { useQuery } from "@tanstack/react-query";

import { requestDownloadUrl } from "@/features/documents/api/storage.api";
import { isStorageObjectKey } from "@/lib/utils/storage-url";
import { queryKeys } from "@/shared/constants/query-keys";

const DOWNLOAD_URL_STALE_MS = 14 * 60 * 1000;

export function useStorageDownloadUrl(objectKey: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.storage.downloadUrl(objectKey ?? ""),
    queryFn: () => requestDownloadUrl(objectKey!),
    enabled: isStorageObjectKey(objectKey),
    select: (data) => data.download_url,
    staleTime: DOWNLOAD_URL_STALE_MS,
  });
}
