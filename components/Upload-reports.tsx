"use client";

import { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "./ui/card";
import { CloudUpload, PackageCheck, Paperclip } from "lucide-react";
import Image from "next/image";

type UploadReportsProps = {
  reportFile: File | null;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export default function UploadReports({ reportFile, onFileChange }: UploadReportsProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="reportUpload">Upload Reports (Optional)</Label>
      <Label className="">
        <Card className="flex flex-col items-center w-full min-h-[30vh] justify-center">
          <Input
            type="file"
            id="reportUpload"
            accept="image/*,.pdf"
            className="hidden"
            onChange={onFileChange}
          />
          {!reportFile ? <CloudUpload size={40} /> : <PackageCheck size={40} />}
          {reportFile && (
            <p className="text-sm text-center max-w-sm text-muted-foreground">
              File selected: {reportFile.name}
            </p>
          )}
        </Card>
      </Label>
    </div>
  );
}
