"use client";

import { LoadingButton } from "@/shared/ui/buttons/loading-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/primitives/dialog";
import { Button } from "@/shared/ui/primitives/button";

type DeletePatientDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  onConfirm: () => void;
  isDeleting?: boolean;
};

export function DeletePatientDialog({
  open,
  onOpenChange,
  patientName,
  onConfirm,
  isDeleting = false,
}: DeletePatientDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove patient</DialogTitle>
          <DialogDescription>
            This will soft-delete <span className="font-medium text-foreground">{patientName}</span>.
            The record is retained for audit purposes but removed from your active patient list.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <LoadingButton
            type="button"
            variant="destructive"
            loading={isDeleting}
            loadingText="Removing..."
            onClick={onConfirm}
          >
            Remove patient
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
