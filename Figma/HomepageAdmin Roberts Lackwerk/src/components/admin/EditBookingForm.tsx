import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  ArrowLeft, 
  Save, 
  Truck,
  User,
  Calendar,
  Clock,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';

interface Booking {
  id: string;
  date: string;
  customerName: string;
  truck: string;
  duration: string;
  pickupDate: string;
  status: string;
  totalAmount: string;
  phone?: string;
  email?: string;
  address?: string;
  returnDate?: string;
  paymentMethod?: string;
  notes?: string;
  timeBlock?: string;
}

interface EditBookingFormProps {
  booking: Booking;
  onBack: () => void;
  onSave: (updatedBooking: Booking) => void;
}

const VEHICLES = [
  'Transporter Rot',
  'Transporter Weiss 1',
  'Transporter Weiss 2',
];

const TIME_BLOCKS = [
  { value: 'morning', label: 'Vormittag (08:00 - 12:00)' },
  { value: 'afternoon', label: 'Nachmittag (13:00 - 18:00)' },
  { value: 'fullday', label: 'Ganztag (08:00 - 18:00)' },
];

export function EditBookingForm({ booking, onBack, onSave }: EditBookingFormProps) {
  const [formData, setFormData] = useState<Booking>({
    ...booking,
    phone: booking.phone || '+41 79 123 45 67',
    email: booking.email || 'kunde@email.ch',
    address: booking.address || 'Musterstrasse 10, 8000 Zürich',
    returnDate: booking.returnDate || booking.pickupDate,
    paymentMethod: booking.paymentMethod || 'stripe',
    notes: booking.notes || '',
    timeBlock: booking.timeBlock || booking.duration === 'Ganztag' ? 'fullday' : 'morning',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simuliere Speichervorgang
    setTimeout(() => {
      onSave(formData);
      setIsSaving(false);
      toast.success('Buchung erfolgreich aktualisiert');
    }, 1000);
  };

  const updateField = (field: keyof Booking, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Ausstehend</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Bestätigt</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Abgeschlossen</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Storniert</Badge>;
      default:
        return <Badge variant="outline">Unbekannt</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl flex items-center gap-2">
              <Truck className="h-6 w-6" />
              Buchung bearbeiten
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {formData.id} • Gebucht am {new Date(formData.date).toLocaleDateString('de-CH')}
            </p>
          </div>
        </div>
        {getStatusBadge(formData.status)}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status & Verwaltung */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Status & Verwaltung
            </CardTitle>
            <CardDescription>
              Verwalten Sie den Status der Buchung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => updateField('status', value)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Ausstehend</SelectItem>
                    <SelectItem value="confirmed">Bestätigt</SelectItem>
                    <SelectItem value="completed">Abgeschlossen</SelectItem>
                    <SelectItem value="cancelled">Storniert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Gesamtbetrag *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="totalAmount"
                    value={formData.totalAmount}
                    onChange={(e) => updateField('totalAmount', e.target.value)}
                    className="pl-10"
                    required
                    placeholder="CHF 0"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notizen</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Interne Notizen zur Buchung..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Kundeninformationen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Kundeninformationen
            </CardTitle>
            <CardDescription>
              Persönliche Daten des Kunden
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => updateField('customerName', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fahrzeug & Mietdetails */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Fahrzeug & Mietdetails
            </CardTitle>
            <CardDescription>
              Details zur Transporter-Miete
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="truck">Fahrzeug *</Label>
              <Select value={formData.truck} onValueChange={(value) => updateField('truck', value)}>
                <SelectTrigger id="truck">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLES.map((vehicle) => (
                    <SelectItem key={vehicle} value={vehicle}>
                      {vehicle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeBlock">Zeitblock *</Label>
              <Select value={formData.timeBlock} onValueChange={(value) => updateField('timeBlock', value)}>
                <SelectTrigger id="timeBlock">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_BLOCKS.map((block) => (
                    <SelectItem key={block.value} value={block.value}>
                      {block.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickupDate">Abholdatum *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="pickupDate"
                    type="date"
                    value={formData.pickupDate}
                    onChange={(e) => updateField('pickupDate', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="returnDate">Rückgabedatum *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="returnDate"
                    type="date"
                    value={formData.returnDate}
                    onChange={(e) => updateField('returnDate', e.target.value)}
                    className="pl-10"
                    min={formData.pickupDate}
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zahlungsinformationen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Zahlungsinformationen
            </CardTitle>
            <CardDescription>
              Zahlungsart und -details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Zahlungsmethode *</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => updateField('paymentMethod', value)}>
                <SelectTrigger id="paymentMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Kreditkarte (Stripe)</SelectItem>
                  <SelectItem value="cash">Barzahlung bei Abholung</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Zahlungsstatus</span>
                {formData.paymentMethod === 'stripe' ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    Bezahlt
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                    Bei Abholung
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gesamtbetrag</span>
                <span className="text-xl font-medium text-primary">{formData.totalAmount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hinweis */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Alle Änderungen werden sofort gespeichert. Der Kunde wird automatisch per E-Mail über Statusänderungen informiert.
          </AlertDescription>
        </Alert>

        {/* Aktionen */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Abbrechen
          </Button>
          <Button type="submit" disabled={isSaving} className="flex-1">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Wird gespeichert...' : 'Änderungen speichern'}
          </Button>
        </div>
      </form>
    </div>
  );
}
