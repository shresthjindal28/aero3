import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Props = {
  transcribedText: string;
};

const TscriptionContent = ({ transcribedText }: Props) => {
  return (
    <div>
      <div className="space-y-2 h-[60vh]">
        <Label htmlFor="transcription">Transcription</Label>
        <Textarea
          id="transcription"
          value={transcribedText}
          readOnly
          placeholder="Your recorded voice will appear here as text after stopping..."
          rows={15}
          className="text-base rounded-(--radius) w-full h-full"
        />
      </div>
    </div>
  );
};

export default TscriptionContent;
