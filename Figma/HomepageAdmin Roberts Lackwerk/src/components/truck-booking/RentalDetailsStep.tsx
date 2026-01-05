import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RentalDetails } from '../TruckBookingForm';
import { Card, CardContent } from '../ui/card';
import { Clock, Sun, Sunset, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { getVehicleAvailability } from '../../utils/availability';
import { useState, useEffect } from 'react';

interface RentalDetailsStepProps {
  data: RentalDetails;
  onChange: (data: Partial<RentalDetails>) => void;
}

const TRUCK_MODELS = [
  { id: 'red', name: 'Transporter Rot', color: 'Rot', price: 'CHF 129' },
  { id: 'white1', name: 'Transporter Weiss #1', color: 'Weiss', price: 'CHF 129' },
  { id: 'white2', name: 'Transporter Weiss #2', color: 'Weiss', price: 'CHF 129' },
];

const TIME_BLOCKS = [
  { id: 'morning', name: 'Vormittag', description: '08:00 - 12:00', icon: Sun },
  { id: 'afternoon', name: 'Nachmittag', description: '13:00 - 18:00', icon: Sunset },
  { id: 'fullday', name: 'Ganztag', description: '08:00 - 18:00', icon: Clock },
];

export function RentalDetailsStep({ data, onChange }: RentalDetailsStepProps) {
  const [availability, setAvailability] = useState<Record<string, { available: boolean; nextAvailableDate?: string }>>({});

  // Berechne Verfügbarkeit wenn Datum sich ändert
  useEffect(() => {
    if (data.pickupDate) {
      const endDate = data.pickupTimeBlock === 'fullday' && data.returnDate 
        ? data.returnDate 
        : data.pickupDate;
      
      const avail = getVehicleAvailability(data.pickupDate, endDate);
      setAvailability(avail);
    } else {
      setAvailability({});
    }
  }, [data.pickupDate, data.returnDate, data.pickupTimeBlock]);

  const handlePickupBlockChange = (blockId: 'morning' | 'afternoon' | 'fullday') => {
    // Allow switching by always updating the selected block
    onChange({ pickupTimeBlock: blockId });
  };

  // Show return date only if fullday is selected
  const showReturnDate = data.pickupTimeBlock === 'fullday';

  // Check if selected truck is available
  const selectedTruckAvailability = data.truckSize && availability[data.truckSize];
  const isSelectedTruckAvailable = !selectedTruckAvailability || selectedTruckAvailability.available;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="pickupDate">Abholdatum *</Label>
        <Input
          id="pickupDate"
          type="date"
          value={data.pickupDate}
          onChange={(e) => onChange({ pickupDate: e.target.value })}
          required
          min={new Date().toISOString().split('T')[0]}
        />
        <p className="text-sm text-muted-foreground">
          Wählen Sie zuerst das Datum, um verfügbare Fahrzeuge zu sehen
        </p>
      </div>

      <div className="space-y-4">
        <Label>Zeitblock auswählen *</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIME_BLOCKS.map((block) => {
            const Icon = block.icon;
            const isSelected = data.pickupTimeBlock === block.id;
            
            return (
              <Card
                key={block.id}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary bg-red-950'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handlePickupBlockChange(block.id as 'morning' | 'afternoon' | 'fullday')}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-primary' : 'bg-muted'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        isSelected ? 'text-white' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div>
                      <h4 className="mb-1">{block.name}</h4>
                      <p className="text-sm text-muted-foreground">{block.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {!showReturnDate && (
          <p className="text-sm text-muted-foreground">
            Bei Halbtags-Mieten ist die Rückgabe am selben Tag erforderlich.
          </p>
        )}
      </div>

      {showReturnDate && (
        <div className="space-y-2">
          <Label htmlFor="returnDate">Rückgabedatum *</Label>
          <Input
            id="returnDate"
            type="date"
            value={data.returnDate}
            onChange={(e) => onChange({ returnDate: e.target.value })}
            required
            min={data.pickupDate || new Date().toISOString().split('T')[0]}
          />
          <p className="text-sm text-muted-foreground">
            Bei Ganztags-Mieten können Sie den Transporter mehrere Tage behalten.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <Label>Modell auswählen *</Label>
        
        {!data.pickupDate ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Bitte wählen Sie zuerst ein Abholdatum und einen Zeitblock, um verfügbare Fahrzeuge zu sehen.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {Object.values(availability).every(v => !v.available) && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Alle Fahrzeuge sind für diesen Zeitraum ausgebucht.</strong><br />
                  Bitte wählen Sie ein anderes Datum oder kontaktieren Sie uns telefonisch.
                </AlertDescription>
              </Alert>
            )}
            {Object.values(availability).some(v => v.available) && Object.values(availability).some(v => !v.available) && (
              <Alert className="bg-green-950/20 border-green-700">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <AlertDescription>
                  <strong>{Object.values(availability).filter(v => v.available).length} von 3 Fahrzeugen verfügbar</strong> für den gewählten Zeitraum.
                </AlertDescription>
              </Alert>
            )}
            {Object.values(availability).every(v => v.available) && (
              <Alert className="bg-green-950/20 border-green-700">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <AlertDescription>
                  <strong>Alle Fahrzeuge verfügbar!</strong> Wählen Sie Ihr bevorzugtes Modell.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${!data.pickupDate ? 'opacity-50 pointer-events-none' : ''}`}>
          {TRUCK_MODELS.map((truck) => {
            const truckAvailability = availability[truck.id];
            const isAvailable = !truckAvailability || truckAvailability.available;
            const isSelected = data.truckSize === truck.id;

            return (
              <Card
                key={truck.id}
                className={`transition-all ${
                  isSelected
                    ? 'border-primary bg-red-950'
                    : !isAvailable
                    ? 'opacity-60 cursor-not-allowed border-muted'
                    : 'cursor-pointer hover:border-primary/50'
                }`}
                onClick={() => isAvailable && onChange({ truckSize: truck.id })}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-full h-32 bg-muted rounded-lg overflow-hidden relative">
                      <ImageWithFallback
                        src={`https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=400&h=300&fit=crop`}
                        alt={truck.name}
                        className="w-full h-full object-cover"
                      />
                      {data.pickupDate && (
                        <div className="absolute top-2 right-2">
                          {isAvailable ? (
                            <Badge variant="secondary" className="bg-green-950 border-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Verfügbar
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Ausgebucht
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-center w-full">
                      <h4 className="mb-1">{truck.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">Farbe: {truck.color}</p>
                      <p className="text-primary">{truck.price}</p>
                      {!isAvailable && truckAvailability?.nextAvailableDate && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Nächste Verfügbarkeit:<br />
                          {new Date(truckAvailability.nextAvailableDate).toLocaleDateString('de-CH')}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {!isSelectedTruckAvailable && data.truckSize && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Das ausgewählte Fahrzeug ist für diesen Zeitraum nicht verfügbar. 
              {selectedTruckAvailability?.nextAvailableDate && (
                <> Nächste Verfügbarkeit: <strong>{new Date(selectedTruckAvailability.nextAvailableDate).toLocaleDateString('de-CH')}</strong></>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}