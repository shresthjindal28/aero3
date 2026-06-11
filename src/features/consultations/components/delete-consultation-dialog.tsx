"use client";

import { LoadingButton } from "@/shared/ui/buttons/loading-button";
import { Button } from "@/shared/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/primitives/dialog";

type DeleteConsultationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultationLabel: string;
  onConfirm: () => void;
  isDeleting?: boolean;
};

export function DeleteConsultationDialog({
  open,
  onOpenChange,
  consultationLabel,
  onConfirm,
  isDeleting = false,
}: DeleteConsultationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete consultation</DialogTitle>
          <DialogDescription>
            This will permanently remove the consultation for{" "}
            <span className="font-medium text-foreground">{consultationLabel}</span>.
            This action cannot be undone.
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
            loadingText="Deleting..."
            onClick={onConfirm}
          >
            Delete consultation
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
