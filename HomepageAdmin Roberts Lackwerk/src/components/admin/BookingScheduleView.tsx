import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Calendar, 
  Truck, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  CreditCard,
  FileText,
  X,
  Sun,
  Sunset,
  Filter
} from 'lucide-react';
import { existingBookings, Booking } from '../../utils/availability';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const VEHICLES = [
  { id: 'red', name: 'Transporter Rot', color: 'Rot' },
  { id: 'white1', name: 'Transporter Weiss #1', color: 'Weiss' },
  { id: 'white2', name: 'Transporter Weiss #2', color: 'Weiss' },
];

const TIME_BLOCKS = [
  { id: 'morning', name: 'Vormittag', icon: Sun, time: '08:00 - 12:00' },
  { id: 'afternoon', name: 'Nachmittag', icon: Sunset, time: '13:00 - 18:00' },
  { id: 'fullday', name: 'Ganztag', icon: Clock, time: '08:00 - 18:00' },
];

// Erweiterte Mock-Daten mit mehr Details
interface ExtendedBooking extends Booking {
  timeBlock: 'morning' | 'afternoon' | 'fullday';
  phone: string;
  email: string;
  address: string;
  paymentMethod: 'stripe' | 'cash';
  totalAmount: string;
  status: 'confirmed' | 'pending' | 'completed';
  notes?: string;
}

const extendedBookings: ExtendedBooking[] = [
  {
    id: 'B001',
    truckId: 'red',
    startDate: '2025-12-01',
    endDate: '2025-12-03',
    customerName: 'Max Mustermann',
    timeBlock: 'fullday',
    phone: '+41 79 123 45 67',
    email: 'max.mustermann@email.ch',
    address: 'Bahnhofstrasse 10, 8001 Zürich',
    paymentMethod: 'stripe',
    totalAmount: 'CHF 387',
    status: 'confirmed',
    notes: 'Umzug innerhalb Zürich'
  },
  {
    id: 'B002',
    truckId: 'white1',
    startDate: '2025-12-05',
    endDate: '2025-12-07',
    customerName: 'Anna Schmidt',
    timeBlock: 'fullday',
    phone: '+41 78 987 65 43',
    email: 'anna.schmidt@email.ch',
    address: 'Musterweg 25, 8050 Zürich',
    paymentMethod: 'cash',
    totalAmount: 'CHF 387',
    status: 'pending',
    notes: 'Möbeltransport'
  },
  {
    id: 'B003',
    truckId: 'red',
    startDate: '2025-12-10',
    endDate: '2025-12-12',
    customerName: 'Peter Müller',
    timeBlock: 'fullday',
    phone: '+41 76 555 44 33',
    email: 'peter.mueller@email.ch',
    address: 'Seestrasse 88, 8002 Zürich',
    paymentMethod: 'stripe',
    totalAmount: 'CHF 387',
    status: 'confirmed'
  },
  {
    id: 'B004',
    truckId: 'white2',
    startDate: '2025-12-15',
    endDate: '2025-12-18',
    customerName: 'Sarah Weber',
    timeBlock: 'fullday',
    phone: '+41 77 222 11 00',
    email: 'sarah.weber@email.ch',
    address: 'Bergstrasse 15, 8032 Zürich',
    paymentMethod: 'stripe',
    totalAmount: 'CHF 516',
    status: 'confirmed',
    notes: 'Geschäftsumzug - Sorgfältiger Umgang erforderlich'
  },
  {
    id: 'B005',
    truckId: 'white1',
    startDate: '2025-11-30',
    endDate: '2025-11-30',
    customerName: 'Thomas Keller',
    timeBlock: 'morning',
    phone: '+41 79 888 77 66',
    email: 'thomas.keller@email.ch',
    address: 'Dorfstrasse 5, 8044 Zürich',
    paymentMethod: 'cash',
    totalAmount: 'CHF 154',
    status: 'confirmed'
  },
  {
    id: 'B006',
    truckId: 'red',
    startDate: '2025-12-20',
    endDate: '2025-12-20',
    customerName: 'Lisa Meier',
    timeBlock: 'afternoon',
    phone: '+41 78 333 22 11',
    email: 'lisa.meier@email.ch',
    address: 'Hauptstrasse 42, 8008 Zürich',
    paymentMethod: 'stripe',
    totalAmount: 'CHF 154',
    status: 'pending'
  },
];

export function BookingScheduleView() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [selectedTimeBlock, setSelectedTimeBlock] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<ExtendedBooking | null>(null);

  // Filter Buchungen
  const filteredBookings = extendedBookings.filter((booking) => {
    const matchesDate = !selectedDate || 
      (new Date(booking.startDate) <= new Date(selectedDate) && 
       new Date(booking.endDate) >= new Date(selectedDate));
    
    const matchesVehicle = selectedVehicle === 'all' || booking.truckId === selectedVehicle;
    const matchesTimeBlock = selectedTimeBlock === 'all' || booking.timeBlock === selectedTimeBlock;

    return matchesDate && matchesVehicle && matchesTimeBlock;
  });

  // Gruppiere nach Datum
  const bookingsByDate = filteredBookings.reduce((acc, booking) => {
    const dates = [];
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      dates.push(date.toISOString().split('T')[0]);
    }
    
    dates.forEach((date) => {
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(booking);
    });
    
    return acc;
  }, {} as Record<string, ExtendedBooking[]>);

  const sortedDates = Object.keys(bookingsByDate).sort();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Bestätigt</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Ausstehend</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Abgeschlossen</Badge>;
      default:
        return <Badge variant="outline">Unbekannt</Badge>;
    }
  };

  const getVehicleName = (truckId: string) => {
    return VEHICLES.find(v => v.id === truckId)?.name || truckId;
  };

  const getTimeBlockInfo = (blockId: string) => {
    return TIME_BLOCKS.find(b => b.id === blockId);
  };

  const resetFilters = () => {
    setSelectedDate('');
    setSelectedVehicle('all');
    setSelectedTimeBlock('all');
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter
              </CardTitle>
              <CardDescription>
                Filtern Sie die Buchungen nach Ihren Kriterien
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Zurücksetzen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filterDate">Datum</Label>
              <Input
                id="filterDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="Alle Daten"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filterVehicle">Fahrzeug</Label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger id="filterVehicle">
                  <SelectValue placeholder="Alle Fahrzeuge" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Fahrzeuge</SelectItem>
                  {VEHICLES.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filterTimeBlock">Zeitblock</Label>
              <Select value={selectedTimeBlock} onValueChange={setSelectedTimeBlock}>
                <SelectTrigger id="filterTimeBlock">
                  <SelectValue placeholder="Alle Zeitblöcke" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Zeitblöcke</SelectItem>
                  {TIME_BLOCKS.map((block) => (
                    <SelectItem key={block.id} value={block.id}>
                      {block.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buchungsübersicht */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Buchungsübersicht
          </CardTitle>
          <CardDescription>
            {filteredBookings.length} Buchung(en) gefunden
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedDates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Buchungen gefunden</p>
              <p className="text-sm mt-2">Ändern Sie die Filter oder fügen Sie neue Buchungen hinzu</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((date) => {
                const bookingsOnDate = bookingsByDate[date];
                const dateObj = new Date(date);
                
                return (
                  <div key={date}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 text-center min-w-[80px]">
                        <div className="text-2xl">{dateObj.getDate()}</div>
                        <div className="text-xs text-muted-foreground uppercase">
                          {dateObj.toLocaleDateString('de-CH', { month: 'short' })}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {dateObj.toLocaleDateString('de-CH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {bookingsOnDate.length} Buchung(en)
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ml-[92px]">
                      {bookingsOnDate.map((booking) => {
                        const timeBlockInfo = getTimeBlockInfo(booking.timeBlock);
                        const TimeBlockIcon = timeBlockInfo?.icon || Clock;
                        
                        return (
                          <Card
                            key={booking.id}
                            className="border-border hover:border-primary/50 transition-colors cursor-pointer"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <CardContent className="pt-4 pb-4">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="bg-primary/10 p-2 rounded-lg">
                                      <Truck className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{getVehicleName(booking.truckId)}</p>
                                      <p className="text-xs text-muted-foreground">{booking.id}</p>
                                    </div>
                                  </div>
                                  {getStatusBadge(booking.status)}
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm">
                                  <TimeBlockIcon className="h-4 w-4 text-muted-foreground" />
                                  <span>{timeBlockInfo?.name} ({timeBlockInfo?.time})</span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span>{booking.customerName}</span>
                                </div>
                                
                                {booking.startDate !== booking.endDate && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                      {new Date(booking.startDate).toLocaleDateString('de-CH')} - {new Date(booking.endDate).toLocaleDateString('de-CH')}
                                    </span>
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between pt-2 border-t border-border">
                                  <span className="text-sm text-muted-foreground">Gesamtbetrag</span>
                                  <span className="font-medium text-primary">{booking.totalAmount}</span>
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

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Buchungsdetails
                  </CardTitle>
                  <CardDescription>Buchung {selectedBooking.id}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedBooking(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusBadge(selectedBooking.status)}
              </div>

              {/* Fahrzeug & Zeitraum */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span>Fahrzeug</span>
                  </div>
                  <p className="font-medium">{getVehicleName(selectedBooking.truckId)}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Zeitblock</span>
                  </div>
                  <p className="font-medium">{getTimeBlockInfo(selectedBooking.timeBlock)?.name}</p>
                  <p className="text-sm text-muted-foreground">{getTimeBlockInfo(selectedBooking.timeBlock)?.time}</p>
                </div>
              </div>

              {/* Zeitraum */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Zeitraum</span>
                </div>
                <p className="font-medium">
                  {new Date(selectedBooking.startDate).toLocaleDateString('de-CH', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  {selectedBooking.startDate !== selectedBooking.endDate && (
                    <>
                      {' bis '}
                      {new Date(selectedBooking.endDate).toLocaleDateString('de-CH', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </>
                  )}
                </p>
              </div>

              {/* Kundeninformationen */}
              <div className="border-t border-border pt-4">
                <h4 className="mb-4 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Kundeninformationen
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Name</p>
                    <p className="font-medium">{selectedBooking.customerName}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Telefon
                      </p>
                      <p>{selectedBooking.phone}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        E-Mail
                      </p>
                      <p className="text-sm break-all">{selectedBooking.email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Adresse
                    </p>
                    <p>{selectedBooking.address}</p>
                  </div>
                </div>
              </div>

              {/* Zahlungsinformationen */}
              <div className="border-t border-border pt-4">
                <h4 className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Zahlungsinformationen
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Zahlungsmethode</span>
                    <Badge variant="outline">
                      {selectedBooking.paymentMethod === 'stripe' ? 'Kreditkarte (Stripe)' : 'Barzahlung bei Abholung'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Gesamtbetrag</span>
                    <span className="text-xl font-medium text-primary">{selectedBooking.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Notizen */}
              {selectedBooking.notes && (
                <div className="border-t border-border pt-4">
                  <h4 className="mb-2 text-sm text-muted-foreground">Notizen</h4>
                  <p className="text-sm bg-muted/30 p-3 rounded-lg">{selectedBooking.notes}</p>
                </div>
              )}

              {/* Aktionen */}
              <div className="border-t border-border pt-4 flex gap-2">
                <Button variant="outline" className="flex-1">
                  Bearbeiten
                </Button>
                <Button variant="outline" className="flex-1">
                  Drucken
                </Button>
                {selectedBooking.status === 'pending' && (
                  <Button className="flex-1">
                    Bestätigen
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
