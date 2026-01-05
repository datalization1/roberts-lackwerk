import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Calendar as CalendarIcon,
  Truck,
  User,
  Phone,
  Mail,
  Clock,
  DollarSign,
  Search as SearchIcon
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { CustomerSearchDialog } from './CustomerSearchDialog';
import { Customer } from './CustomerManagement';

interface Booking {
  id: string;
  vehicleId: string;
  vehicleName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  duration: string;
  status: 'confirmed' | 'pending' | 'completed';
  totalAmount: number;
  notes?: string;
}

interface Vehicle {
  id: string;
  name: string;
  color: string;
}

const vehicles: Vehicle[] = [
  { id: '1', name: 'Transporter Rot', color: 'bg-red-500' },
  { id: '2', name: 'Transporter Weiss 1', color: 'bg-gray-300' },
  { id: '3', name: 'Transporter Weiss 2', color: 'bg-gray-200' },
];

const mockBookings: Booking[] = [
  {
    id: 'BU-2025-101',
    vehicleId: '1',
    vehicleName: 'Transporter Rot',
    customerName: 'Thomas Keller',
    customerEmail: 'thomas.keller@email.com',
    customerPhone: '+41 79 123 45 67',
    startDate: '2025-01-08',
    endDate: '2025-01-08',
    duration: 'Ganztag',
    status: 'confirmed',
    totalAmount: 167,
    notes: 'Umzug innerhalb Zürich'
  },
  {
    id: 'BU-2025-102',
    vehicleId: '2',
    vehicleName: 'Transporter Weiss 1',
    customerName: 'Sandra Huber',
    customerEmail: 'sandra.huber@email.com',
    customerPhone: '+41 78 234 56 78',
    startDate: '2025-01-07',
    endDate: '2025-01-07',
    duration: 'Vormittag',
    status: 'pending',
    totalAmount: 154,
  },
  {
    id: 'BU-2025-103',
    vehicleId: '3',
    vehicleName: 'Transporter Weiss 2',
    customerName: 'Marco Bianchi',
    customerEmail: 'marco.bianchi@email.com',
    customerPhone: '+41 76 345 67 89',
    startDate: '2025-01-06',
    endDate: '2025-01-07',
    duration: 'Ganztag',
    status: 'completed',
    totalAmount: 129,
  },
  {
    id: 'BU-2025-104',
    vehicleId: '1',
    vehicleName: 'Transporter Rot',
    customerName: 'Julia Wagner',
    customerEmail: 'julia.wagner@email.com',
    customerPhone: '+41 77 456 78 90',
    startDate: '2025-01-10',
    endDate: '2025-01-12',
    duration: 'Mehrere Tage',
    status: 'confirmed',
    totalAmount: 450,
  },
];

export function BookingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 5)); // Start bei 5. Januar 2025
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 'CUST-001',
      firstName: 'Max',
      lastName: 'Müller',
      email: 'max.mueller@email.ch',
      phone: '+41 79 123 45 67',
      address: 'Bahnhofstrasse 123',
      city: 'Zürich',
      postalCode: '8001',
      source: 'damage-report',
      createdDate: '2025-11-25',
      customerSince: '2023-03-15',
      notes: 'Stammkunde, bevorzugt Direktkontakt per Telefon',
    },
    {
      id: 'CUST-002',
      firstName: 'Thomas',
      lastName: 'Keller',
      email: 'thomas.keller@email.ch',
      phone: '+41 79 345 67 89',
      address: 'Seestrasse 78',
      city: 'Zürich',
      postalCode: '8008',
      source: 'rental',
      createdDate: '2025-11-26',
      customerSince: '2024-01-10',
      company: 'Keller Transport GmbH'
    },
    {
      id: 'CUST-003',
      firstName: 'Sandra',
      lastName: 'Huber',
      email: 'sandra.huber@email.ch',
      phone: '+41 78 234 56 78',
      address: 'Hauptstrasse 45',
      city: 'Winterthur',
      postalCode: '8400',
      source: 'both',
      createdDate: '2024-05-12',
      customerSince: '2024-05-12',
    }
  ]);
  const [newBooking, setNewBooking] = useState<Partial<Booking>>({
    vehicleId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    startDate: '',
    endDate: '',
    totalAmount: 0,
    status: 'confirmed',
  });

  // Kalender-Logik
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Montag als erster Tag
    return new Date(d.setDate(diff));
  };

  const generateCalendarDays = () => {
    const start = getStartOfWeek(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    const days = [];
    
    // Generiere 14 Tage (2 Wochen Ansicht)
    for (let i = 0; i < 14; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date(2025, 0, 5));
  };

  const isDateInRange = (date: Date, startDate: string, endDate: string) => {
    const d = date.toISOString().split('T')[0];
    return d >= startDate && d <= endDate;
  };

  const getBookingForVehicleOnDate = (vehicleId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.find(booking => 
      booking.vehicleId === vehicleId && 
      isDateInRange(date, booking.startDate, booking.endDate)
    );
  };

  const getBookingSpan = (booking: Booking, startDay: Date) => {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Check if booking starts on this day
    const dayStr = startDay.toISOString().split('T')[0];
    if (dayStr === booking.startDate) {
      return days;
    }
    return 0;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-CH', { 
      weekday: 'short', 
      day: 'numeric',
      month: 'short'
    });
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setNewBooking({
      ...newBooking,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerEmail: customer.email,
      customerPhone: customer.phone,
    });
    
    // Wenn Kunde noch nicht in Liste, hinzufügen
    if (!customers.find(c => c.id === customer.id)) {
      setCustomers([...customers, customer]);
    }
  };

  const handleCreateBooking = () => {
    if (!selectedCustomer) {
      toast.error('Bitte wählen Sie einen Kunden aus');
      setShowCustomerSearch(true);
      return;
    }
    
    if (!newBooking.vehicleId || !newBooking.startDate || !newBooking.endDate) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    const vehicle = vehicles.find(v => v.id === newBooking.vehicleId);
    const bookingId = `BU-2025-${String(bookings.length + 200).padStart(3, '0')}`;
    
    const booking: Booking = {
      id: bookingId,
      vehicleId: newBooking.vehicleId,
      vehicleName: vehicle?.name || '',
      customerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
      customerEmail: selectedCustomer.email,
      customerPhone: selectedCustomer.phone,
      startDate: newBooking.startDate,
      endDate: newBooking.endDate,
      duration: newBooking.startDate === newBooking.endDate ? 'Ganztag' : 'Mehrere Tage',
      status: newBooking.status as 'confirmed' | 'pending' | 'completed',
      totalAmount: newBooking.totalAmount || 0,
      notes: newBooking.notes,
    };

    setBookings([...bookings, booking]);
    setIsCreatingBooking(false);
    setSelectedCustomer(null);
    setNewBooking({
      vehicleId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      startDate: '',
      endDate: '',
      totalAmount: 0,
      status: 'confirmed',
    });
    toast.success('Buchung erfolgreich erstellt');
  };

  const handleSendInvoice = (booking: Booking) => {
    toast.success(`Rechnung für ${booking.customerName} wurde versendet`);
    // Hier würde die Rechnungserstellung implementiert werden
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 border-green-500 text-green-700';
      case 'pending': return 'bg-yellow-500/20 border-yellow-500 text-yellow-700';
      case 'completed': return 'bg-blue-500/20 border-blue-500 text-blue-700';
      default: return 'bg-gray-500/20 border-gray-500 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header mit Kalender-Steuerung */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Buchungskalender
              </CardTitle>
              <CardDescription>
                Übersicht aller Fahrzeugvermietungen im Zeitverlauf
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Heute
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Dialog open={isCreatingBooking} onOpenChange={setIsCreatingBooking}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Manuelle Buchung
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Neue Buchung erstellen</DialogTitle>
                    <DialogDescription>
                      Erstellen Sie eine manuelle Buchung für Telefonkunden
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    {/* Fahrzeugauswahl */}
                    <div className="space-y-2">
                      <Label htmlFor="vehicle">Fahrzeug *</Label>
                      <Select
                        value={newBooking.vehicleId}
                        onValueChange={(value) => setNewBooking({ ...newBooking, vehicleId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Fahrzeug auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicles.map(vehicle => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${vehicle.color}`} />
                                {vehicle.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Kundenauswahl */}
                    <div className="space-y-2">
                      <Label>Kunde *</Label>
                      {selectedCustomer ? (
                        <Card className="bg-muted/50 border-primary/50">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{selectedCustomer.firstName} {selectedCustomer.lastName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  <span>{selectedCustomer.phone}</span>
                                </div>
                                {selectedCustomer.email && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    <span>{selectedCustomer.email}</span>
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedCustomer(null);
                                  setNewBooking({
                                    ...newBooking,
                                    customerName: '',
                                    customerEmail: '',
                                    customerPhone: '',
                                  });
                                }}
                              >
                                Ändern
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => setShowCustomerSearch(true)}
                          className="w-full"
                        >
                          <SearchIcon className="h-4 w-4 mr-2" />
                          Kunde suchen oder anlegen
                        </Button>
                      )}
                    </div>

                    {/* Buchungszeitraum */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Startdatum *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={newBooking.startDate}
                          onChange={(e) => setNewBooking({ ...newBooking, startDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">Enddatum *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={newBooking.endDate}
                          onChange={(e) => setNewBooking({ ...newBooking, endDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="totalAmount">Gesamtbetrag (CHF)</Label>
                        <Input
                          id="totalAmount"
                          type="number"
                          value={newBooking.totalAmount}
                          onChange={(e) => setNewBooking({ ...newBooking, totalAmount: parseFloat(e.target.value) })}
                          placeholder="167.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={newBooking.status}
                          onValueChange={(value) => setNewBooking({ ...newBooking, status: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="confirmed">Bestätigt</SelectItem>
                            <SelectItem value="pending">Ausstehend</SelectItem>
                            <SelectItem value="completed">Abgeschlossen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Notizen */}
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notizen</Label>
                      <Textarea
                        id="notes"
                        value={newBooking.notes}
                        onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                        placeholder="Zusätzliche Informationen..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreatingBooking(false)}>
                      Abbrechen
                    </Button>
                    <Button onClick={handleCreateBooking}>
                      <Plus className="h-4 w-4 mr-2" />
                      Buchung erstellen
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Kalender-Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header mit Datum */}
              <div className="grid grid-cols-[150px_repeat(14,1fr)] gap-1 mb-2">
                <div className="p-2"></div>
                {calendarDays.map((day, idx) => {
                  const isToday = day.toDateString() === new Date(2025, 0, 5).toDateString();
                  return (
                    <div
                      key={idx}
                      className={`p-2 text-center text-xs ${
                        isToday ? 'bg-primary/20 text-primary rounded-t-lg' : 'text-muted-foreground'
                      }`}
                    >
                      <div className={isToday ? 'font-bold' : ''}>{formatDate(day)}</div>
                    </div>
                  );
                })}
              </div>

              {/* Fahrzeuge und Buchungen */}
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="grid grid-cols-[150px_repeat(14,1fr)] gap-1 mb-2">
                  {/* Fahrzeugname */}
                  <div className="p-3 bg-card border border-border rounded-lg flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${vehicle.color}`} />
                    <span className="text-sm font-medium truncate">{vehicle.name}</span>
                  </div>

                  {/* Tage */}
                  {calendarDays.map((day, dayIdx) => {
                    const booking = getBookingForVehicleOnDate(vehicle.id, day);
                    const span = booking ? getBookingSpan(booking, day) : 0;

                    if (span > 0) {
                      return (
                        <button
                          key={dayIdx}
                          className={`p-2 border rounded-lg text-xs hover:opacity-80 transition-opacity text-left ${getStatusColor(booking.status)}`}
                          style={{ gridColumn: `span ${Math.min(span, 14 - dayIdx)}` }}
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <div className="font-medium truncate">{booking.customerName}</div>
                          <div className="text-xs opacity-75">{booking.duration}</div>
                        </button>
                      );
                    } else if (!booking || getBookingSpan(booking, day) === 0) {
                      return (
                        <div
                          key={dayIdx}
                          className="p-2 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legende */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500/20 border border-green-500 rounded" />
              <span>Bestätigt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500/20 border border-yellow-500 rounded" />
              <span>Ausstehend</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500/20 border border-blue-500 rounded" />
              <span>Abgeschlossen</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buchungsdetails Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Buchungsdetails - {selectedBooking.id}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Fahrzeug</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-3 h-3 rounded-full ${vehicles.find(v => v.id === selectedBooking.vehicleId)?.color}`} />
                      <span className="font-medium">{selectedBooking.vehicleName}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedBooking.status)}>
                        {selectedBooking.status === 'confirmed' && 'Bestätigt'}
                        {selectedBooking.status === 'pending' && 'Ausstehend'}
                        {selectedBooking.status === 'completed' && 'Abgeschlossen'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Card className="bg-muted/50">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{selectedBooking.customerName}</span>
                    </div>
                    {selectedBooking.customerEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedBooking.customerEmail}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedBooking.customerPhone}</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Startdatum</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(selectedBooking.startDate).toLocaleDateString('de-CH')}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Enddatum</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(selectedBooking.endDate).toLocaleDateString('de-CH')}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Dauer</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedBooking.duration}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Gesamtbetrag</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-primary">CHF {selectedBooking.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {selectedBooking.notes && (
                  <div>
                    <Label className="text-muted-foreground">Notizen</Label>
                    <p className="mt-1 text-sm bg-muted/50 p-3 rounded-lg">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                  Schliessen
                </Button>
                <Button onClick={() => handleSendInvoice(selectedBooking)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Rechnung versenden
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Kundensuche Dialog */}
      <CustomerSearchDialog
        open={showCustomerSearch}
        onOpenChange={setShowCustomerSearch}
        onSelectCustomer={handleSelectCustomer}
        existingCustomers={customers}
      />
    </div>
  );
}