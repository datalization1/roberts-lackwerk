import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, CheckCircle2, XCircle, Truck } from 'lucide-react';
import { existingBookings, getVehicleAvailability, getBookingsForVehicle } from '../../utils/availability';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const VEHICLES = [
  { id: 'red', name: 'Transporter Rot', color: 'Rot' },
  { id: 'white1', name: 'Transporter Weiss #1', color: 'Weiss' },
  { id: 'white2', name: 'Transporter Weiss #2', color: 'Weiss' },
];

export function VehicleAvailabilityView() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const availability = getVehicleAvailability(selectedDate, selectedDate);

  // Gruppiere Buchungen nach Datum
  const upcomingBookings = existingBookings
    .filter((b) => new Date(b.endDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Verfügbarkeitsprüfung
          </CardTitle>
          <CardDescription>
            Prüfen Sie die Verfügbarkeit aller Fahrzeuge für ein bestimmtes Datum
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="checkDate">Datum prüfen</Label>
            <Input
              id="checkDate"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {VEHICLES.map((vehicle) => {
              const vehicleAvailability = availability[vehicle.id];
              const isAvailable = vehicleAvailability?.available;

              return (
                <Card
                  key={vehicle.id}
                  className={`${
                    isAvailable
                      ? 'border-green-700 bg-green-950/20'
                      : 'border-red-700 bg-red-950/20'
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isAvailable ? 'bg-green-950' : 'bg-red-950'
                        }`}
                      >
                        <Truck
                          className={`h-6 w-6 ${
                            isAvailable ? 'text-green-400' : 'text-red-400'
                          }`}
                        />
                      </div>
                      <div className="text-center">
                        <h4 className="mb-1">{vehicle.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Farbe: {vehicle.color}
                        </p>
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
                        {!isAvailable && vehicleAvailability?.nextAvailableDate && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Verfügbar ab:<br />
                            <strong>
                              {new Date(vehicleAvailability.nextAvailableDate).toLocaleDateString('de-CH')}
                            </strong>
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alle kommenden Buchungen</CardTitle>
          <CardDescription>
            Übersicht aller zukünftigen Reservierungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Keine kommenden Buchungen vorhanden
            </p>
          ) : (
            <div className="space-y-4">
              {VEHICLES.map((vehicle) => {
                const vehicleBookings = getBookingsForVehicle(vehicle.id).filter(
                  (b) => new Date(b.endDate) >= new Date()
                );

                if (vehicleBookings.length === 0) {
                  return null;
                }

                return (
                  <div key={vehicle.id}>
                    <div className="flex items-center gap-2 mb-3">
                      <Truck className="h-4 w-4 text-primary" />
                      <h4>{vehicle.name}</h4>
                      <Badge variant="outline">{vehicleBookings.length} Buchung(en)</Badge>
                    </div>
                    <div className="space-y-2 ml-6">
                      {vehicleBookings.map((booking) => {
                        const startDate = new Date(booking.startDate);
                        const endDate = new Date(booking.endDate);
                        const days = Math.ceil(
                          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
                        ) + 1;

                        return (
                          <Card key={booking.id} className="border-border">
                            <CardContent className="pt-4 pb-4">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <p className="text-sm">
                                    <strong>{booking.customerName}</strong>
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3 inline mr-1" />
                                    {startDate.toLocaleDateString('de-CH')} -{' '}
                                    {endDate.toLocaleDateString('de-CH')}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <Badge variant="secondary">
                                    {days} Tag{days > 1 ? 'e' : ''}
                                  </Badge>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    ID: {booking.id}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/30 border-muted">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl mb-1">{VEHICLES.length}</div>
              <p className="text-sm text-muted-foreground">Fahrzeuge gesamt</p>
            </div>
            <div>
              <div className="text-2xl mb-1">
                {Object.values(availability).filter((v) => v.available).length}
              </div>
              <p className="text-sm text-muted-foreground">
                Verfügbar am {new Date(selectedDate).toLocaleDateString('de-CH')}
              </p>
            </div>
            <div>
              <div className="text-2xl mb-1">{upcomingBookings.length}</div>
              <p className="text-sm text-muted-foreground">Kommende Buchungen</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
