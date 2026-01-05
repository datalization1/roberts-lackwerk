import { VehicleAvailabilityView } from './admin/VehicleAvailabilityView';
import { BookingScheduleView } from './admin/BookingScheduleView';
import { EditDamageReportForm } from './admin/EditDamageReportForm';
import { EditBookingForm } from './admin/EditBookingForm';
import { VehicleManagement } from './admin/VehicleManagement';
import { CustomerManagement } from './admin/CustomerManagement';
import { InvoiceManagement } from './admin/InvoiceManagement';
import { Settings } from './admin/Settings';
import { BookingCalendar } from './admin/BookingCalendar';
import { useState } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  Filter,
  Search,
  TrendingUp,
  Users,
  AlertCircle,
  LogOut,
  Calendar,
  Receipt,
  Settings as SettingsIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { VehicleAvailabilityView } from './admin/VehicleAvailabilityView';
import { BookingScheduleView } from './admin/BookingScheduleView';
import { EditDamageReportForm } from './admin/EditDamageReportForm';
import { EditBookingForm } from './admin/EditBookingForm';
import { VehicleManagement } from './admin/VehicleManagement';
import { CustomerManagement } from './admin/CustomerManagement';
import { InvoiceManagement } from './admin/InvoiceManagement';
import { Settings } from './admin/Settings';
import { BookingCalendar } from './admin/BookingCalendar';

interface AdminPageProps {
  onBack: () => void;
  onLogout: () => void;
}

// Mock-Daten für Schadenmeldungen
const mockDamageReports = [
  {
    id: 'SM-2025-001',
    date: '2025-11-25',
    customerName: 'Max Müller',
    vehicle: 'VW Golf, ZH 12345',
    status: 'pending',
    insuranceCompany: 'AXA Versicherung',
    damageType: 'Unfallschaden vorne',
    estimatedCost: 'CHF 3\'500'
  },
  {
    id: 'SM-2025-002',
    date: '2025-11-24',
    customerName: 'Anna Schmidt',
    vehicle: 'BMW 3er, ZH 67890',
    status: 'in-progress',
    insuranceCompany: 'Mobiliar',
    damageType: 'Lackschaden Seitentür',
    estimatedCost: 'CHF 1\'200'
  },
  {
    id: 'SM-2025-003',
    date: '2025-11-23',
    customerName: 'Peter Weber',
    vehicle: 'Audi A4, ZH 11223',
    status: 'completed',
    insuranceCompany: 'Helvetia',
    damageType: 'Hagelschaden',
    estimatedCost: 'CHF 5\'800'
  },
  {
    id: 'SM-2025-004',
    date: '2025-11-22',
    customerName: 'Lisa Meier',
    vehicle: 'Mercedes C-Klasse, ZH 99887',
    status: 'pending',
    insuranceCompany: 'Zurich Versicherung',
    damageType: 'Parkschaden hinten',
    estimatedCost: 'CHF 2\'100'
  }
];

// Mock-Daten für Buchungen
const mockBookings = [
  {
    id: 'BU-2025-101',
    date: '2025-11-26',
    customerName: 'Thomas Keller',
    truck: 'Transporter Rot',
    duration: 'Ganztag',
    pickupDate: '2025-11-28',
    status: 'confirmed',
    totalAmount: 'CHF 167'
  },
  {
    id: 'BU-2025-102',
    date: '2025-11-25',
    customerName: 'Sandra Huber',
    truck: 'Transporter Weiss 1',
    duration: 'Vormittag',
    pickupDate: '2025-11-27',
    status: 'pending',
    totalAmount: 'CHF 154'
  },
  {
    id: 'BU-2025-103',
    date: '2025-11-24',
    customerName: 'Marco Bianchi',
    truck: 'Transporter Weiss 2',
    duration: 'Ganztag',
    pickupDate: '2025-11-26',
    status: 'completed',
    totalAmount: 'CHF 129'
  }
];

export function AdminPage({ onBack, onLogout }: AdminPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [editingReport, setEditingReport] = useState<any | null>(null);
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const [damageReports, setDamageReports] = useState(mockDamageReports);
  const [bookings, setBookings] = useState(mockBookings);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Ausstehend</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">In Bearbeitung</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Abgeschlossen</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Bestätigt</Badge>;
      default:
        return <Badge variant="outline">Unbekannt</Badge>;
    }
  };

  const stats = {
    totalReports: damageReports.length,
    pendingReports: damageReports.filter(r => r.status === 'pending').length,
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
  };

  const handleSaveReport = (updatedReport: any) => {
    setDamageReports(prev => 
      prev.map(report => report.id === updatedReport.id ? updatedReport : report)
    );
    setEditingReport(null);
    setSelectedTab('damage-reports');
  };

  const handleSaveBooking = (updatedBooking: any) => {
    setBookings(prev => 
      prev.map(booking => booking.id === updatedBooking.id ? updatedBooking : booking)
    );
    setEditingBooking(null);
    setSelectedTab('bookings');
  };

  // Wenn im Bearbeitungsmodus
  if (editingReport) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <EditDamageReportForm
            report={editingReport}
            onBack={() => setEditingReport(null)}
            onSave={handleSaveReport}
          />
        </div>
      </div>
    );
  }

  if (editingBooking) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <EditBookingForm
            booking={editingBooking}
            onBack={() => setEditingBooking(null)}
            onSave={handleSaveBooking}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={onBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
            <Button
              variant="outline"
              onClick={onLogout}
              className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Abmelden
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Verwaltung von Schadenmeldungen und Buchungen
              </p>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Administrator
            </Badge>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-1">
            <TabsTrigger value="dashboard">
              <TrendingUp className="mr-2 h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="damage-reports">
              <FileText className="mr-2 h-4 w-4" />
              Schadenmeldungen
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Truck className="mr-2 h-4 w-4" />
              Buchungen
            </TabsTrigger>
            <TabsTrigger value="vehicles">
              <Truck className="mr-2 h-4 w-4" />
              Fahrzeuge
            </TabsTrigger>
            <TabsTrigger value="customers">
              <Users className="mr-2 h-4 w-4" />
              Kunden
            </TabsTrigger>
            <TabsTrigger value="invoices">
              <Receipt className="mr-2 h-4 w-4" />
              Rechnungen
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Calendar className="mr-2 h-4 w-4" />
              Zeitplan
            </TabsTrigger>
            <TabsTrigger value="availability">
              <Calendar className="mr-2 h-4 w-4" />
              Verfügbarkeit
            </TabsTrigger>
            <TabsTrigger value="settings">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Einstellungen
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Statistiken */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Schadenmeldungen</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{stats.totalReports}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.pendingReports} ausstehend
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Buchungen</CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{stats.totalBookings}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.pendingBookings} ausstehend
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">In Bearbeitung</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">
                    {mockDamageReports.filter(r => r.status === 'in-progress').length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reparaturen aktiv
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Abgeschlossen</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">
                    {mockDamageReports.filter(r => r.status === 'completed').length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Diesen Monat
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Neueste Aktivitäten */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Neueste Schadenmeldungen</CardTitle>
                  <CardDescription>Kürzlich eingereichte Meldungen</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {damageReports.slice(0, 3).map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{report.id}</span>
                            {getStatusBadge(report.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{report.customerName}</p>
                          <p className="text-xs text-muted-foreground">{report.vehicle}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setEditingReport(report)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Anstehende Buchungen</CardTitle>
                  <CardDescription>Nächste Abholtermine</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{booking.id}</span>
                            {getStatusBadge(booking.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{booking.customerName}</p>
                          <p className="text-xs text-muted-foreground">Abholung: {booking.pickupDate}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setEditingBooking(booking)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Schadenmeldungen Tab */}
          <TabsContent value="damage-reports" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Schadenmeldungen</CardTitle>
                    <CardDescription>Übersicht aller eingereichten Schadenmeldungen</CardDescription>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Suchen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full sm:w-64"
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {damageReports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-medium">{report.id}</span>
                            {getStatusBadge(report.status)}
                            <span className="text-sm text-muted-foreground">{report.date}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Kunde: </span>
                              <span>{report.customerName}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Fahrzeug: </span>
                              <span>{report.vehicle}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Versicherung: </span>
                              <span>{report.insuranceCompany}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Schätzung: </span>
                              <span className="text-primary">{report.estimatedCost}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {report.damageType}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingReport(report)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Details
                          </Button>
                          <Button size="sm" onClick={() => setEditingReport(report)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Buchungen Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Transporter-Buchungen</CardTitle>
                    <CardDescription>Übersicht aller Fahrzeugvermietungen</CardDescription>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Suchen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full sm:w-64"
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-medium">{booking.id}</span>
                            {getStatusBadge(booking.status)}
                            <span className="text-sm text-muted-foreground">Gebucht am: {booking.date}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Kunde: </span>
                              <span>{booking.customerName}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Fahrzeug: </span>
                              <span>{booking.truck}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Abholung: </span>
                              <span>{booking.pickupDate}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Gesamt: </span>
                              <span className="text-primary">{booking.totalAmount}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Dauer: {booking.duration}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingBooking(booking)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Details
                          </Button>
                          <Button size="sm" onClick={() => setEditingBooking(booking)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Buchungskalender */}
            <BookingCalendar />
          </TabsContent>

          {/* Fahrzeuge Tab */}
          <TabsContent value="vehicles" className="space-y-6">
            <VehicleManagement />
          </TabsContent>

          {/* Kunden Tab */}
          <TabsContent value="customers" className="space-y-6">
            <CustomerManagement />
          </TabsContent>

          {/* Rechnungen Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <InvoiceManagement />
          </TabsContent>

          {/* Zeitplan Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <BookingScheduleView />
          </TabsContent>

          {/* Verfügbarkeit Tab */}
          <TabsContent value="availability" className="space-y-6">
            <VehicleAvailabilityView />
          </TabsContent>

          {/* Einstellungen Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Settings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}