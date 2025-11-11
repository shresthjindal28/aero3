import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Props = {
  transcribedText: string;
};

const TscriptionContent = ({ transcribedText }: Props) => {
  return (
    <div>
      <div className="space-y-4">
        <Label htmlFor="transcription" className="text-lg font-semibold">
          Transcription
        </Label>
        <Textarea
          id="transcription"
          value={transcribedText}
          readOnly
          placeholder="Your recorded voice will appear here as text after stopping..."
          rows={15}
          className="text-base"
        />
      </div>
    </div>
  );
};

export default TscriptionContent
