"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@clerk/nextjs";

export interface PatientData {
  id: string;
  name: string;
  phone?: string;
  address?: string;
}

interface PatientSessionModalProps {
  isOpen: boolean;
  onSessionStart: (patient: PatientData) => void;
}

async function readApiError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    if (data.code === "DB_SCHEMA_MISSING") {
      return "Database not set up. Run supabase/schema.sql in your Supabase SQL Editor.";
    }
    if (data.details) return `${data.error ?? fallback}: ${data.details}`;
    if (data.error) return String(data.error);
  } catch {
    /* ignore */
  }
  return fallback;
}

export default function PatientSessionModal({
  isOpen,
  onSessionStart,
}: PatientSessionModalProps) {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [modalPatientId, setModalPatientId] = useState("");
  const [modalPatientName, setModalPatientName] = useState("");
  const [modalPatientPhone, setModalPatientPhone] = useState("");
  const [modalPatientAddress, setModalPatientAddress] = useState("");
  const [loadError, setLoadError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadPatient = async () => {
    setLoadError("");
    if (!modalPatientId.trim()) return;

    try {
      setIsLoading(true);
      const res = await fetch(
        `/api/patient?id=${encodeURIComponent(modalPatientId.trim())}`
      );

      if (!res.ok) {
        if (res.status === 404) {
          setLoadError("No patient found. Please create a new user.");
        } else {
          setLoadError(await readApiError(res, "Failed to verify patient. Try again."));
        }
        return;
      }

      const data = await res.json();
      const patient = data.patient;

      const patientData: PatientData = {
        id: patient.user_id,
        name: patient.user_name,
        phone: patient.user_mobile ?? undefined,
        address: patient.address ?? undefined,
      };

      onSessionStart(patientData);
      router.push(`/dashboard/transcription/${patientData.id}`);
    } catch {
      setLoadError("Network error. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterNewPatient = async () => {
    setRegisterError("");

    if (!isLoaded) {
      setRegisterError("Loading your account…");
      return;
    }

    if (!user?.id) {
      setRegisterError("You must be signed in to register a patient.");
      return;
    }

    if (!modalPatientName.trim() || !modalPatientPhone.trim()) return;

    try {
      setIsLoading(true);
      const res = await fetch(`/api/patient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: modalPatientName.trim(),
          phone: modalPatientPhone.trim(),
          address: modalPatientAddress.trim() || undefined,
        }),
      });

      if (!res.ok) {
        setRegisterError(await readApiError(res, "Failed to register patient."));
        return;
      }

      const data = await res.json();
      const patient = data.patient;

      const patientData: PatientData = {
        id: patient.user_id,
        name: patient.user_name,
        phone: patient.user_mobile ?? undefined,
        address: patient.address ?? undefined,
      };

      onSessionStart(patientData);
      router.push(`/dashboard/transcription/${patientData.id}`);
    } catch {
      setRegisterError("Network error. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="sm:max-w-[450px]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Start Patient Session</DialogTitle>
          <DialogDescription>
            Load an existing patient record or register a new one.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="load" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="load">Load Patient</TabsTrigger>
            <TabsTrigger value="new">New Patient</TabsTrigger>
          </TabsList>

          <TabsContent value="load">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient ID</Label>
                <Input
                  id="patientId"
                  value={modalPatientId}
                  onChange={(e) => setModalPatientId(e.target.value)}
                  placeholder="Patient UUID from registration"
                />
              </div>

              {loadError && (
                <Alert variant="warning">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{loadError}</AlertDescription>
                </Alert>
              )}
            </div>

            <Button
              onClick={handleLoadPatient}
              disabled={!modalPatientId.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? "Checking..." : "Load Existing Patient"}
            </Button>
          </TabsContent>

          <TabsContent value="new">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Patient Name</Label>
                <Input
                  value={modalPatientName}
                  onChange={(e) => setModalPatientName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Patient Phone</Label>
                <Input
                  value={modalPatientPhone}
                  onChange={(e) => setModalPatientPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Address (optional)</Label>
                <Input
                  value={modalPatientAddress}
                  onChange={(e) => setModalPatientAddress(e.target.value)}
                />
              </div>

              {registerError && (
                <Alert variant="warning">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{registerError}</AlertDescription>
                </Alert>
              )}
            </div>

            <Button
              onClick={handleRegisterNewPatient}
              disabled={
                !isLoaded ||
                !user?.id ||
                !modalPatientName.trim() ||
                !modalPatientPhone.trim() ||
                isLoading
              }
              className="w-full"
            >
              {isLoading ? "Registering..." : "Register New Patient"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
