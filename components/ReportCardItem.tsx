"use client";

import { ReportItem } from "./PatientReports";
import { FileText } from "lucide-react"; // CHANGED: Removed the non-existent FilePdf
import Image from "next/image";

interface ReportCardItemProps {
  reports: ReportItem[];
}

function getExtension(url: string): string {
  try {
    const u = new URL(url);
    const pathname = u.pathname;
    const last = pathname.split("/").pop() || "";
    const ext = last.includes(".") ? last.split(".").pop() || "" : "";
    return ext.toLowerCase();
  } catch {
    const clean = url.split("?")[0].split("#")[0];
    const last = clean.split("/").pop() || "";
    const ext = last.includes(".") ? last.split(".").pop() || "" : "";
    return ext.toLowerCase();
  }
}

function buildCloudinaryUrlWithTransform(
  url: string,
  transformation: string,
  forceResourceType?: "image" | "video" | "raw"
): string {
  try {
    const u = new URL(url);
    const path = u.pathname;
    const parts = path.split("/upload/");
    if (parts.length !== 2) return url;
    let before = parts[0];
    const after = parts[1];
    if (forceResourceType) {
      const segs = before.split("/").filter(Boolean);
      if (segs.length >= 2) {
        segs[segs.length - 1] = forceResourceType;
        before = "/" + segs.join("/");
      }
    }
    const transformedPath = `${before}/upload/${transformation}/${after}`;
    return `${u.origin}${transformedPath}`;
  } catch {
    return url;
  }
}

export default function ReportCardList({ reports }: ReportCardItemProps) {
  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent py-4 px-2">
      {reports.map((report, index) => {
        const ext = getExtension(report.file_url);
        const isPdf = ext === "pdf";
        const isImage = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff", "svg"].includes(ext);
        const isVideo = ["mp4", "webm", "mov", "avi", "mkv", "m4v"].includes(ext);
        const isAudio = ["mp3", "wav", "m4a", "aac", "ogg", "flac"].includes(ext);

        const previewImageUrl = (() => {
          if (isImage) {
            return buildCloudinaryUrlWithTransform(
              report.file_url,
              "f_auto,q_auto,c_fit,w_600,h_256"
            );
          }
          return null;
        })();

        const videoPosterUrl = isVideo
          ? buildCloudinaryUrlWithTransform(
              report.file_url,
              "so_0,f_jpg,c_fit,w_600,h_256",
              "video"
            )
          : null;

        return (
          <div
            key={index}
            className="space-y-2 border rounded-lg p-2 bg-black  shadow-md shrink-0 w-[150px] h-[150px] flex items-center justify-center flex-col"
          >
            <div className="w-full h-64 bg-muted/30 rounded-md overflow-hidden border relative">
              {isPdf ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                  {/* --- CHANGED: Replaced FilePdf with FileText --- */}
                  <FileText className="w-16 h-16" />
                  <span
                    className="mt-2 text-sm text-center"
                    title={report.note || "PDF Document"}
                  >
                    {report.note ? report.note : "PDF"}
                  </span>
                </div>
              ) : isImage && previewImageUrl ? (
                <Image
                  src={previewImageUrl}
                  alt="Patient Report"
                  fill
                  sizes="(max-width: 640px) 100vw, 300px"
                  className="object-contain"
                />
              ) : isVideo ? (
                <video
                  controls
                  className="w-full h-full object-contain"
                  poster={videoPosterUrl ?? undefined}
                  src={report.file_url}
                />
              ) : isAudio ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <audio controls className="w-full">
                    <source src={report.file_url} />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                  <FileText className="w-16 h-16" />
                  <span className="mt-2 text-sm">DOCS</span>
                </div>
              )}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300 flex justify-between items-center pt-1">
              <span className="truncate pr-2" title={report.note || "Report"}>
                {report.note ? report.note : ""}
              </span>
              <a
                href={report.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800"
              >
                Open
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}