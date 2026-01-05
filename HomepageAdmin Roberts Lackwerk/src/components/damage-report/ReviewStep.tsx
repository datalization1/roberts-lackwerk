import { FormData } from '../DamageReportForm';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';

interface ReviewStepProps {
  formData: FormData;
}

export function ReviewStep({ formData }: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">Bitte überprüfen Sie alle Angaben, bevor Sie Ihre Schadenmeldung absenden.</p>

      <Card>
        <CardHeader>
          <CardTitle>Fahrzeugdaten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Kontrollschild:</span>
            <span>{formData.car.licensePlate || '-'}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fahrzeugmarke:</span>
            <span>{formData.car.carBrand || '-'}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fahrzeugmodell:</span>
            <span>{formData.car.carModel || '-'}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stammnummer:</span>
            <span>{formData.car.stammnumber || '-'}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Persönliche Daten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span>{formData.personal.name || '-'}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Adresse:</span>
            <span className="text-right">{formData.personal.address || '-'}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Telefon:</span>
            <span>{formData.personal.phone || '-'}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">E-Mail:</span>
            <span>{formData.personal.email || '-'}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Versicherungsdaten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Versicherungsgesellschaft:</span>
            <span>{formData.insurance.insurance || '-'}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Police-Nummer:</span>
            <span>{formData.insurance.documentNo || '-'}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Schadennummer:</span>
            <span>{formData.insurance.accidentNo || '-'}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ansprechperson:</span>
            <span>{formData.insurance.contactPerson || '-'}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Unfalldetails</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-muted-foreground">Beschädigte Teile:</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.accident.damagedParts.length > 0 ? (
                formData.accident.damagedParts.map((part) => (
                  <span key={part} className="bg-red-950 text-primary px-3 py-1 rounded-full text-sm">
                    {part}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground">Keine ausgewählt</span>
              )}
            </div>
          </div>
          <Separator />
          <div>
            <span className="text-muted-foreground">Beschreibung:</span>
            <p className="mt-2 text-foreground whitespace-pre-wrap">
              {formData.accident.description || '-'}
            </p>
          </div>
          <Separator />
          <div>
            <span className="text-muted-foreground">Hochgeladene Fotos:</span>
            <p className="mt-2">
              {formData.accident.images.length} Bild(er)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}