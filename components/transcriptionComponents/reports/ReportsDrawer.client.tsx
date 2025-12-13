"use client";

import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import PatientReports from "./PatientReports";
import type { Report } from "./types"; // ✅ SAME TYPE

export default function ReportsDrawerClient({
  reports,
}: {
  reports: Report[];
}) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Open Reports</Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Patient Reports</DrawerTitle>
          <DrawerDescription>
            View and manage patient reports.
          </DrawerDescription>
        </DrawerHeader>

        <PatientReports reports={reports} />
      </DrawerContent>
    </Drawer>
  );
}
