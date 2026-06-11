import { CheckCircle2, FileDown, RefreshCw, Save } from "lucide-react";

import { Button } from "@/shared/ui/primitives/button";

type SoapActionsProps = {
  canSave: boolean;
  canApprove: boolean;
  isSaving: boolean;
  isApproving: boolean;
  isApproved: boolean;
  onSave: () => void;
  onApprove: () => void;
};

export function SoapActions({
  canSave,
  canApprove,
  isSaving,
  isApproving,
  isApproved,
  onSave,
  onApprove,
}: SoapActionsProps) {
  return (
    <div className="sticky bottom-0 z-10 border-t border-border/60 bg-background/90 px-4 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          <kbd className="rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono">
            ⌘S
          </kbd>{" "}
          Save draft
        </p>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled
            title="Coming soon"
          >
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled
            title="Coming soon"
          >
            <FileDown className="h-4 w-4" />
            Export PDF
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onSave}
            disabled={!canSave || isSaving || isApproved}
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving…" : "Save draft"}
          </Button>
          <Button
            type="button"
            onClick={onApprove}
            disabled={!canApprove || isApproving || isApproved}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isApproving ? "Approving…" : isApproved ? "Approved" : "Approve SOAP"}
          </Button>
        </div>
      </div>
    </div>
  );
}
