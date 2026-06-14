"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Brain, FolderOpen, Pill, Plus } from "lucide-react";

import { ConsultationTable } from "@/features/consultations/components/consultation-table";
import { ConsultationTimeline } from "@/features/consultations/components/consultation-timeline";
import { EmptyConsultationsState } from "@/features/consultations/components/empty-consultations-state";
import { useConsultations } from "@/features/consultations/hooks/use-consultations";
import { buildPatientTimeline } from "@/features/consultations/utils/consultation.utils";
import { PrescriptionHistoryTable } from "@/features/prescription/components/prescription-history-table";
import { usePatientPrescriptions } from "@/features/prescription/hooks/use-patient-prescriptions";
import { PatientHeader } from "@/features/patients/components/patient-header";
import { PatientInfoCard } from "@/features/patients/components/patient-info-card";
import type { Patient } from "@/features/patients/types/patient.types";
import { routes } from "@/shared/constants/routes";
import { ApiErrorDisplay } from "@/shared/ui/feedback/api-error";
import { Button } from "@/shared/ui/primitives/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/primitives/tabs";

type PatientWorkspaceProps = {
  patient: Patient;
};

const tabs = ["overview", "timeline", "consultations", "prescriptions"] as const;
type PatientTab = (typeof tabs)[number];

function isPatientTab(value: string | null): value is PatientTab {
  return tabs.includes(value as PatientTab);
}

export function PatientWorkspace({ patient }: PatientWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = isPatientTab(tabParam) ? tabParam : "overview";

  const {
    data: consultations = [],
    isLoading: consultationsLoading,
    isError: consultationsError,
    error: consultationsErrorObject,
    refetch: refetchConsultations,
  } = useConsultations(patient.id);

  const timelineEvents = buildPatientTimeline(patient, consultations);
  const {
    data: prescriptions = [],
    isLoading: prescriptionsLoading,
    isError: prescriptionsError,
    error: prescriptionsErrorObject,
    refetch: refetchPrescriptions,
  } = usePatientPrescriptions(patient.id);

  const setTab = (tab: PatientTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${routes.app.patientDetail(patient.id)}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <PatientHeader
        patient={patient}
        extraActions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href={routes.app.patientMemory(patient.id)}>
                <Brain className="h-4 w-4" />
                Memory
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={routes.app.patientDocuments(patient.id)}>
                <FolderOpen className="h-4 w-4" />
                Documents
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={routes.app.patientPrescriptions(patient.id)}>
                <Pill className="h-4 w-4" />
                Prescriptions
              </Link>
            </Button>
            <Button asChild>
              <Link href={routes.app.patientConsultationNew(patient.id)}>
                <Plus className="h-4 w-4" />
                Start visit
              </Link>
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={(value) => setTab(value as PatientTab)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="consultations">Visits</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <PatientInfoCard patient={patient} />
        </TabsContent>

        <TabsContent value="timeline">
          <ConsultationTimeline events={timelineEvents} isLoading={consultationsLoading} />
        </TabsContent>

        <TabsContent value="consultations" className="space-y-4">
          <div className="flex justify-end">
            <Button asChild>
              <Link href={routes.app.patientConsultationNew(patient.id)}>
                <Plus className="h-4 w-4" />
                Start visit
              </Link>
            </Button>
          </div>

          {consultationsError ? (
            <ApiErrorDisplay
              error={
                (consultationsErrorObject as Error) ??
                new Error("Unable to load consultations")
              }
              onRetry={() => void refetchConsultations()}
            />
          ) : consultations.length === 0 && !consultationsLoading ? (
            <EmptyConsultationsState patientId={patient.id} />
          ) : (
            <>
              <ConsultationTable
                consultations={consultations}
                patientId={patient.id}
                isLoading={consultationsLoading}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" asChild>
              <Link href={routes.app.patientPrescriptions(patient.id)}>
                View full history
              </Link>
            </Button>
          </div>

          {prescriptionsError ? (
            <ApiErrorDisplay
              error={
                (prescriptionsErrorObject as Error) ??
                new Error("Unable to load prescriptions")
              }
              onRetry={() => void refetchPrescriptions()}
            />
          ) : (
            <PrescriptionHistoryTable
              prescriptions={prescriptions}
              isLoading={prescriptionsLoading}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
