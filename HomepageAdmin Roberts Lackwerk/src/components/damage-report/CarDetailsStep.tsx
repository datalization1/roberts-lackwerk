import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { CarDetails } from '../DamageReportForm';

interface CarDetailsStepProps {
  data: CarDetails;
  onChange: (data: Partial<CarDetails>) => void;
}

export function CarDetailsStep({ data, onChange }: CarDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="licensePlate">Kontrollschild *</Label>
        <Input
          id="licensePlate"
          placeholder="z.B. ZH 123456"
          value={data.licensePlate}
          onChange={(e) => onChange({ licensePlate: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="carBrand">Fahrzeugmarke *</Label>
          <Input
            id="carBrand"
            placeholder="z.B. BMW, Audi, VW"
            value={data.carBrand}
            onChange={(e) => onChange({ carBrand: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="carModel">Fahrzeugmodell *</Label>
          <Input
            id="carModel"
            placeholder="z.B. 3er, A4, Golf"
            value={data.carModel}
            onChange={(e) => onChange({ carModel: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="stammnumber">Stammnummer (FIN) *</Label>
        <Input
          id="stammnumber"
          placeholder="17-stellige Fahrzeug-Identifikationsnummer"
          value={data.stammnumber}
          onChange={(e) => onChange({ stammnumber: e.target.value })}
          required
        />
        <p className="text-sm text-muted-foreground">
          Die Stammnummer ist die Herstellernummer, die es uns ermöglicht, spezifische Details über Ihr Fahrzeug zu identifizieren
        </p>
      </div>
    </div>
  );
}