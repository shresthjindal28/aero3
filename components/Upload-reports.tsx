"use client";

import { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UploadReportsProps = {
  reportFile: File | null;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export default function UploadReports({
  reportFile,
  onFileChange,
}: UploadReportsProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="reportUpload" className="text-lg font-semibold">
        Upload Reports (Optional)
      </Label>
      <Input
        type="file"
        id="reportUpload"
        accept="image/*,.pdf"
        onChange={onFileChange}
      />
      {reportFile && (
        <p className="text-sm text-muted-foreground">
          File selected: {reportFile.name}
        </p>
      )}
    </div>
  );
}