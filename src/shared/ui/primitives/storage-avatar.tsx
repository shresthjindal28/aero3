"use client";

import { isAbsoluteUrl } from "@/lib/utils/storage-url";
import { useStorageDownloadUrl } from "@/shared/hooks/use-storage-download-url";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/primitives/avatar";
import { cn } from "@/lib/utils/cn";

type StorageAvatarProps = {
  name: string;
  imageRef?: string | null;
  className?: string;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function StorageAvatar({ name, imageRef, className }: StorageAvatarProps) {
  const needsPresignedUrl = Boolean(imageRef && !isAbsoluteUrl(imageRef));
  const { data: presignedUrl } = useStorageDownloadUrl(
    needsPresignedUrl ? imageRef : null,
  );

  const src = imageRef
    ? isAbsoluteUrl(imageRef)
      ? imageRef
      : presignedUrl
    : undefined;

  return (
    <Avatar className={cn("h-9 w-9 shrink-0", className)}>
      {src ? <AvatarImage src={src} alt={name} /> : null}
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
}
