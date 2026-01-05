import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { InsuranceDetails } from '../DamageReportForm';

interface InsuranceDetailsStepProps {
  data: InsuranceDetails;
  onChange: (data: Partial<InsuranceDetails>) => void;
}

export function InsuranceDetailsStep({ data, onChange }: InsuranceDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="insurance">Versicherungsgesellschaft *</Label>
        <Input
          id="insurance"
          placeholder="z.B. AXA, Zurich, Mobiliar"
          value={data.insurance}
          onChange={(e) => onChange({ insurance: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="documentNo">Versicherungspolice-Nummer</Label>
        <Input
          id="documentNo"
          placeholder="Falls verfügbar"
          value={data.documentNo}
          onChange={(e) => onChange({ documentNo: e.target.value })}
        />
        <p className="text-sm text-muted-foreground">Optional - bitte angeben, falls verfügbar</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="accidentNo">Schadennummer</Label>
        <Input
          id="accidentNo"
          placeholder="Schaden-/Unfallreferenznummer"
          value={data.accidentNo}
          onChange={(e) => onChange({ accidentNo: e.target.value })}
        />
        <p className="text-sm text-muted-foreground">Optional - bitte angeben, falls bereits bei der Versicherung gemeldet</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactPerson">Versicherungs-Ansprechperson</Label>
        <Input
          id="contactPerson"
          placeholder="Name Ihrer Ansprechperson bei der Versicherung"
          value={data.contactPerson}
          onChange={(e) => onChange({ contactPerson: e.target.value })}
        />
        <p className="text-sm text-muted-foreground">Optional - falls Sie eine spezifische Ansprechperson haben</p>
      </div>
    </div>
  );
}