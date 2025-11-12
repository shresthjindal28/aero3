"use client";

import { CardHeader, CardContent, CardTitle } from "@/components/ui/card";

interface PatientDetailsProps {
  name?: string;
  id?: string;
}

export default function PatientDetails({ name, id }: PatientDetailsProps) {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-lg font-bold w-full flex justify-center">
          Patient Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 flex items-center justify-between">
        <p className="text-lg">
          <strong>Patient Name:</strong> {name || "—"}
        </p>
        <p className="text-lg">
          <strong>Patient ID:</strong> {id || "—"}
        </p>
      </CardContent>
    </>
  );
}