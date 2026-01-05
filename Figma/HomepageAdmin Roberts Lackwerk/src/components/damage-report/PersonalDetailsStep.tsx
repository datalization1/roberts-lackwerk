import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { PersonalDetails } from '../DamageReportForm';

interface PersonalDetailsStepProps {
  data: PersonalDetails;
  onChange: (data: Partial<PersonalDetails>) => void;
}

export function PersonalDetailsStep({ data, onChange }: PersonalDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Vollständiger Name *</Label>
        <Input
          id="name"
          placeholder="Vor- und Nachname"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse *</Label>
        <Textarea
          id="address"
          placeholder="Strasse, Stadt, Postleitzahl"
          value={data.address}
          onChange={(e) => onChange({ address: e.target.value })}
          required
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefonnummer *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+41 XX XXX XX XX"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-Mail-Adresse *</Label>
          <Input
            id="email"
            type="email"
            placeholder="ihre.email@beispiel.ch"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            required
          />
        </div>
      </div>
    </div>
  );
}