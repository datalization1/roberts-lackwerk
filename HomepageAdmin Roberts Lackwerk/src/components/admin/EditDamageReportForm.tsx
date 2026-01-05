import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  ArrowLeft, 
  Save, 
  FileText,
  User,
  Car,
  Building2,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Receipt
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
import { DamageReportInvoice } from './DamageReportInvoice';

interface DamageReport {
  id: string;
  date: string;
  customerName: string;
  vehicle: string;
  status: string;
  insuranceCompany: string;
  damageType: string;
  estimatedCost: string;
  phone?: string;
  email?: string;
  address?: string;
  accidentDate?: string;
  accidentLocation?: string;
  damageDescription?: string;
  repairNotes?: string;
}

interface EditDamageReportFormProps {
  report: DamageReport;
  onBack: () => void;
  onSave: (report: DamageReport) => void;
}

export function EditDamageReportForm({ report, onBack, onSave }: EditDamageReportFormProps) {
  const [formData, setFormData] = useState<DamageReport>(report);
  const [hasChanges, setHasChanges] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simuliere Speichervorgang
    setTimeout(() => {
      onSave(formData);
      setIsSaving(false);
      toast.success('Schadenmeldung erfolgreich aktualisiert');
    }, 1000);
  };

  const updateField = (field: keyof DamageReport, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Ausstehend</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">In Bearbeitung</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Abgeschlossen</Badge>;
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
              <FileText className="h-6 w-6" />
              Schadenmeldung bearbeiten
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {formData.id} • Eingereicht am {new Date(formData.date).toLocaleDateString('de-CH')}
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
              Verwalten Sie den Bearbeitungsstatus der Schadenmeldung
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
                    <SelectItem value="in-progress">In Bearbeitung</SelectItem>
                    <SelectItem value="completed">Abgeschlossen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Geschätzte Kosten *</Label>
                <Input
                  id="estimatedCost"
                  value={formData.estimatedCost}
                  onChange={(e) => updateField('estimatedCost', e.target.value)}
                  required
                  placeholder="CHF 0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="repairNotes">Reparatur-Notizen</Label>
              <Textarea
                id="repairNotes"
                value={formData.repairNotes}
                onChange={(e) => updateField('repairNotes', e.target.value)}
                placeholder="Interne Notizen zur Reparatur..."
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

        {/* Fahrzeuginformationen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Fahrzeuginformationen
            </CardTitle>
            <CardDescription>
              Details zum beschädigten Fahrzeug
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle">Fahrzeug *</Label>
              <Input
                id="vehicle"
                value={formData.vehicle}
                onChange={(e) => updateField('vehicle', e.target.value)}
                required
                placeholder="Marke Modell, Kennzeichen"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="damageType">Schadensart *</Label>
              <Input
                id="damageType"
                value={formData.damageType}
                onChange={(e) => updateField('damageType', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="damageDescription">Schadensbeschreibung</Label>
              <Textarea
                id="damageDescription"
                value={formData.damageDescription}
                onChange={(e) => updateField('damageDescription', e.target.value)}
                placeholder="Detaillierte Beschreibung des Schadens..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Versicherung & Unfall */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Versicherung & Unfalldetails
            </CardTitle>
            <CardDescription>
              Versicherungsdaten und Unfallhergang
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="insuranceCompany">Versicherungsgesellschaft *</Label>
              <Input
                id="insuranceCompany"
                value={formData.insuranceCompany}
                onChange={(e) => updateField('insuranceCompany', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accidentDate">Unfalldatum *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="accidentDate"
                    type="date"
                    value={formData.accidentDate}
                    onChange={(e) => updateField('accidentDate', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accidentLocation">Unfallort *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="accidentLocation"
                    value={formData.accidentLocation}
                    onChange={(e) => updateField('accidentLocation', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rechnung */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Rechnung
            </CardTitle>
            <CardDescription>
              Rechnung für den Kunden erstellen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowInvoice(true)}
                disabled={formData.status !== 'completed'}
              >
                Rechnung erstellen
              </Button>
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

      {/* Rechnung anzeigen */}
      {showInvoice && (
        <DamageReportInvoice
          damageReport={formData}
          onBack={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
}