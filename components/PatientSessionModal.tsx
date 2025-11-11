"use client";

import { useState } from "react";
import { generatePatientId } from "@/lib/generateId";
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
// Import the Tabs components
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


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

export default function PatientSessionModal({
  isOpen,
  onSessionStart,
}: PatientSessionModalProps) {
  const [modalPatientId, setModalPatientId] = useState("");
  const [modalPatientName, setModalPatientName] = useState("");
  const [modalPatientPhone, setModalPatientPhone] =useState("");
  const [modalPatientAddress, setModalPatientAddress] = useState("");
  const [loadError, setLoadError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Loads a patient using ONLY the ID.
   * We send a blank name, assuming the parent
   * will fetch the full details using the ID.
   */
  const handleLoadPatient = async () => {
    setLoadError("");
    if (!modalPatientId.trim()) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/patient?id=${encodeURIComponent(modalPatientId.trim())}`);
      if (!res.ok) {
        if (res.status === 404) {
          setLoadError("No patient found. Please create a new user.");
        } else {
          setLoadError("Failed to verify patient. Try again.");
        }
        return;
      }
      const data = await res.json();
      const patient = data.patient;
      onSessionStart({ id: patient.user_id, name: patient.user_name, phone: patient.user_mobile ?? undefined, address: patient.address ?? undefined });
    } catch (e) {
      setLoadError("Network error. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registers a new patient.
   * Name and Phone are required.
   */
  const handleRegisterNewPatient = async () => {
    if (!modalPatientName.trim() || !modalPatientPhone.trim()) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/patient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: modalPatientName.trim(), phone: modalPatientPhone.trim(), address: modalPatientAddress.trim() || undefined }),
      });
      if (!res.ok) {
        // Stay on modal and show no toast; parent will handle
        return;
      }
      const data = await res.json();
      const patient = data.patient;
      onSessionStart({ id: patient.user_id, name: patient.user_name, phone: patient.user_mobile ?? undefined, address: patient.address ?? undefined });
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

          {/* === LOAD PATIENT TAB === */}
          <TabsContent value="load">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient ID</Label>
                <Input
                  id="patientId"
                  value={modalPatientId}
                  onChange={(e) => setModalPatientId(e.target.value)}
                  placeholder="PAT-123456"
                />
              </div>
              {loadError && (
                <Alert variant="warning">
                  <AlertTitle>Patient not found</AlertTitle>
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

          {/* === NEW PATIENT TAB === */}
          <TabsContent value="new">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">Patient Name</Label>
                <Input
                  id="patientName"
                  value={modalPatientName}
                  onChange={(e) => setModalPatientName(e.target.value)}
                  placeholder="e.g., John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientPhone">Patient Phone</Label>
                <Input
                  id="patientPhone"
                  type="tel"
                  value={modalPatientPhone}
                  onChange={(e) => setModalPatientPhone(e.target.value)}
                  placeholder="e.g., +91 XXXXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientAddress">Patient Address (Optional)</Label>
                <Input
                  id="patientAddress"
                  value={modalPatientAddress}
                  onChange={(e) => setModalPatientAddress(e.target.value)}
                  placeholder="e.g., 123 Main St, Springfield"
                />
              </div>
            </div>
            <Button
              onClick={handleRegisterNewPatient}
              disabled={
                !modalPatientName.trim() || !modalPatientPhone.trim() || isLoading
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