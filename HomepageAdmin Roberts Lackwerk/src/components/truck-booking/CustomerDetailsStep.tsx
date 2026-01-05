import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { CustomerDetails } from '../TruckBookingForm';

interface CustomerDetailsStepProps {
  data: CustomerDetails;
  onChange: (data: Partial<CustomerDetails>) => void;
}

export function CustomerDetailsStep({ data, onChange }: CustomerDetailsStepProps) {
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

      <div className="space-y-2">
        <Label htmlFor="driverLicense">Führerscheinnummer *</Label>
        <Input
          id="driverLicense"
          placeholder="Schweizer Führerscheinnummer"
          value={data.driverLicense}
          onChange={(e) => onChange({ driverLicense: e.target.value })}
          required
        />
        <p className="text-sm text-muted-foreground">
          Sie müssen Ihren Führerschein bei der Abholung vorlegen
        </p>
      </div>
    </div>
  );
}