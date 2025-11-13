import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import PatientReports from "@/components/PatientReports";
import { useState, useEffect } from "react";
const ReportsDrawer = ({ patientId }: { patientId?: string }) => {
  const [reports, setReports] = useState<
    Array<{
      id: string;
      file_url: string;
      note?: string | null;
      created_at: string;
    }>
  >([]);
  const [reportsLoading, setReportsLoading] = useState<boolean>(false);
  const [reportsError, setReportsError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setReports([]);
      return;
    }
    const run = async () => {
      setReportsLoading(true);
      setReportsError(null);
      try {
        const res = await fetch(
          `/api/patient/report?userId=${encodeURIComponent(patientId)}`
        );
        const data = await res.json();
        if (res.ok && data.success) {
          setReports(data.reports ?? []);
        } else {
          setReports([]);
          setReportsError(data?.error ?? "Failed to fetch reports");
        }
      } catch (err) {
        console.error("Fetch reports error", err);
        setReportsError("Unexpected error while fetching reports");
        setReports([]);
      } finally {
        setReportsLoading(false);
      }
    };
    run();
  }, [patientId]);
  return (
    <>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant={"default"}>Open Reports</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Patient Reports</DrawerTitle>
            <DrawerDescription>View and manage patient reports.</DrawerDescription>
          </DrawerHeader>
          <PatientReports
            reports={reports}
            reportsLoading={reportsLoading}
            reportsError={reportsError}
          />
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default ReportsDrawer;
