import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { 
  User, 
  Search, 
  Eye, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Car,
  Truck,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Save,
  Receipt,
  FileText,
  DollarSign
} from 'lucide-react';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import { InvoiceGenerator } from './InvoiceGenerator';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  source: 'damage-report' | 'rental' | 'manual' | 'both';
  createdDate: string;
  customerSince: string; // Neues Feld
  notes?: string;
  company?: string;
}

interface Transaction {
  id: string;
  type: 'damage-report' | 'rental';
  date: string;
  description: string;
  amount: number;
  status: 'pending' | 'completed' | 'invoiced';
}

// Mock-Kundendaten mit Transaktionen
const initialCustomers: Customer[] = [
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
    firstName: 'Anna',
    lastName: 'Schmidt',
    email: 'anna.schmidt@email.ch',
    phone: '+41 79 234 56 78',
    address: 'Limmatstrasse 45',
    city: 'Zürich',
    postalCode: '8005',
    source: 'damage-report',
    createdDate: '2025-11-24',
    customerSince: '2024-08-20',
  },
  {
    id: 'CUST-003',
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
    company: 'Keller Transport GmbH',
  },
  {
    id: 'CUST-004',
    firstName: 'Sandra',
    lastName: 'Huber',
    email: 'sandra.huber@email.ch',
    phone: '+41 79 456 78 90',
    address: 'Universitätstrasse 12',
    city: 'Zürich',
    postalCode: '8006',
    source: 'rental',
    createdDate: '2025-11-25',
    customerSince: '2025-11-01',
  },
  {
    id: 'CUST-005',
    firstName: 'Peter',
    lastName: 'Weber',
    email: 'peter.weber@email.ch',
    phone: '+41 79 567 89 01',
    address: 'Hardstrasse 234',
    city: 'Zürich',
    postalCode: '8005',
    source: 'both',
    createdDate: '2025-11-23',
    customerSince: '2022-05-12',
    notes: 'VIP-Kunde, Geschäftsführer bei Weber AG',
    company: 'Weber AG',
  },
];

// Mock-Transaktionen pro Kunde
const customerTransactions: Record<string, Transaction[]> = {
  'CUST-001': [
    {
      id: 'SM-2025-001',
      type: 'damage-report',
      date: '2025-11-25',
      description: 'Unfallschaden vorne - VW Golf',
      amount: 3500,
      status: 'pending',
    },
    {
      id: 'SM-2024-087',
      type: 'damage-report',
      date: '2024-08-10',
      description: 'Lackierung Stoßstange - VW Golf',
      amount: 890,
      status: 'invoiced',
    },
    {
      id: 'SM-2023-045',
      type: 'damage-report',
      date: '2023-06-22',
      description: 'Kratzer an Tür - VW Golf',
      amount: 450,
      status: 'invoiced',
    },
  ],
  'CUST-002': [
    {
      id: 'SM-2025-002',
      type: 'damage-report',
      date: '2025-11-24',
      description: 'Lackschaden Seitentür - BMW 3er',
      amount: 1200,
      status: 'completed',
    },
  ],
  'CUST-003': [
    {
      id: 'BU-2025-101',
      type: 'rental',
      date: '2025-11-26',
      description: 'Transporter Rot - Ganztag',
      amount: 167,
      status: 'completed',
    },
    {
      id: 'BU-2025-105',
      type: 'rental',
      date: '2025-10-15',
      description: 'Transporter Weiss 1 - Ganztag',
      amount: 129,
      status: 'invoiced',
    },
    {
      id: 'BU-2025-078',
      type: 'rental',
      date: '2025-09-05',
      description: 'Transporter Rot - Halbtag',
      amount: 95,
      status: 'invoiced',
    },
  ],
  'CUST-004': [
    {
      id: 'BU-2025-102',
      type: 'rental',
      date: '2025-11-25',
      description: 'Transporter Weiss 1 - Vormittag',
      amount: 154,
      status: 'pending',
    },
  ],
  'CUST-005': [
    {
      id: 'SM-2025-003',
      type: 'damage-report',
      date: '2025-11-23',
      description: 'Hagelschaden - Audi A4',
      amount: 5800,
      status: 'completed',
    },
    {
      id: 'BU-2025-104',
      type: 'rental',
      date: '2025-10-10',
      description: 'Transporter Rot - Ganztag',
      amount: 129,
      status: 'invoiced',
    },
    {
      id: 'SM-2024-156',
      type: 'damage-report',
      date: '2024-12-05',
      description: 'Parkschaden hinten - Audi A4',
      amount: 2100,
      status: 'invoiced',
    },
  ],
};

export function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState(false);

  const filteredCustomers = customers.filter(customer =>
    customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.company && customer.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'damage-report':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
          <Car className="h-3 w-3 mr-1" />
          Schadenmeldung
        </Badge>;
      case 'rental':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
          <Truck className="h-3 w-3 mr-1" />
          Vermietung
        </Badge>;
      case 'both':
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          Beide
        </Badge>;
      case 'manual':
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
          Manuell
        </Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          Ausstehend
        </Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
          Abgeschlossen
        </Badge>;
      case 'invoiced':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
          Berechnet
        </Badge>;
      default:
        return null;
    }
  };

  const handleCreateCustomer = () => {
    setIsCreating(true);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      source: 'manual',
      customerSince: new Date().toISOString().split('T')[0],
      notes: '',
      company: '',
    });
  };

  const handleEditCustomer = (customer: Customer) => {
    setIsEditing(true);
    setFormData(customer);
  };

  const handleSaveCustomer = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.postalCode || !formData.customerSince) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    if (isCreating) {
      const newCustomer: Customer = {
        id: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
        firstName: formData.firstName!,
        lastName: formData.lastName!,
        email: formData.email!,
        phone: formData.phone!,
        address: formData.address!,
        city: formData.city!,
        postalCode: formData.postalCode!,
        source: formData.source as Customer['source'] || 'manual',
        createdDate: new Date().toISOString().split('T')[0],
        customerSince: new Date().toISOString().split('T')[0],
        notes: formData.notes,
        company: formData.company,
      };
      setCustomers([...customers, newCustomer]);
      customerTransactions[newCustomer.id] = [];
      toast.success('Kunde erfolgreich erstellt');
      setIsCreating(false);
    } else if (isEditing) {
      setCustomers(customers.map(c => 
        c.id === formData.id ? { ...formData as Customer } : c
      ));
      toast.success('Kunde erfolgreich aktualisiert');
      setIsEditing(false);
      if (selectedCustomer?.id === formData.id) {
        setSelectedCustomer({ ...formData as Customer });
      }
    }
    setFormData({});
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm('Möchten Sie diesen Kunden wirklich löschen?')) {
      setCustomers(customers.filter(c => c.id !== id));
      toast.success('Kunde erfolgreich gelöscht');
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(null);
      }
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setFormData({});
  };

  const updateFormField = (field: keyof Customer, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateInvoiceForCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowInvoiceGenerator(true);
  };

  // Invoice Generator anzeigen
  if (showInvoiceGenerator && selectedCustomer) {
    return (
      <InvoiceGenerator
        customer={{
          id: selectedCustomer.id,
          name: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
          email: selectedCustomer.email,
          phone: selectedCustomer.phone,
          address: `${selectedCustomer.address}, ${selectedCustomer.postalCode} ${selectedCustomer.city}`,
          source: selectedCustomer.source,
          createdDate: selectedCustomer.createdDate,
          totalTransactions: customerTransactions[selectedCustomer.id]?.length || 0,
          totalRevenue: customerTransactions[selectedCustomer.id]?.reduce((sum, t) => sum + t.amount, 0) || 0,
          transactions: [],
        }}
        transaction={null}
        onBack={() => {
          setShowInvoiceGenerator(false);
        }}
      />
    );
  }

  // Formular für Erstellen/Bearbeiten
  if (isCreating || isEditing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{isCreating ? 'Neuen Kunden anlegen' : 'Kunde bearbeiten'}</CardTitle>
              <CardDescription>
                {isCreating ? 'Geben Sie die Kundendaten ein' : `Bearbeiten Sie die Daten von ${formData.firstName} ${formData.lastName}`}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Abbrechen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 max-w-2xl">
            {/* Persönliche Informationen */}
            <div className="space-y-4">
              <h3 className="font-medium">Persönliche Informationen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Vorname *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName || ''}
                    onChange={(e) => updateFormField('firstName', e.target.value)}
                    placeholder="Max"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nachname *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName || ''}
                    onChange={(e) => updateFormField('lastName', e.target.value)}
                    placeholder="Mustermann"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Firma (optional)</Label>
                  <Input
                    id="company"
                    value={formData.company || ''}
                    onChange={(e) => updateFormField('company', e.target.value)}
                    placeholder="Mustermann GmbH"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => updateFormField('email', e.target.value)}
                      className="pl-10"
                      placeholder="max@beispiel.ch"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => updateFormField('phone', e.target.value)}
                      className="pl-10"
                      placeholder="+41 79 123 45 67"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerSince">Kunde seit</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customerSince"
                    type="date"
                    value={formData.customerSince || ''}
                    onChange={(e) => updateFormField('customerSince', e.target.value)}
                    className="pl-10"
                    disabled={isCreating}
                  />
                </div>
                {isCreating && (
                  <p className="text-xs text-muted-foreground">Wird automatisch auf das heutige Datum gesetzt</p>
                )}
              </div>
            </div>

            {/* Adressinformationen */}
            <div className="space-y-4">
              <h3 className="font-medium">Adresse</h3>
              <div className="space-y-2">
                <Label htmlFor="address">Strasse & Hausnummer *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => updateFormField('address', e.target.value)}
                    className="pl-10"
                    placeholder="Musterstrasse 123"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">PLZ *</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode || ''}
                    onChange={(e) => updateFormField('postalCode', e.target.value)}
                    placeholder="8000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ort *</Label>
                  <Input
                    id="city"
                    value={formData.city || ''}
                    onChange={(e) => updateFormField('city', e.target.value)}
                    placeholder="Zürich"
                  />
                </div>
              </div>
            </div>

            {/* Weitere Informationen */}
            <div className="space-y-4">
              <h3 className="font-medium">Weitere Informationen</h3>
              <div className="space-y-2">
                <Label htmlFor="source">Quelle</Label>
                <Select 
                  value={formData.source || 'manual'} 
                  onValueChange={(value) => updateFormField('source', value)}
                >
                  <SelectTrigger id="source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manuell angelegt</SelectItem>
                    <SelectItem value="damage-report">Schadenmeldung</SelectItem>
                    <SelectItem value="rental">Vermietung</SelectItem>
                    <SelectItem value="both">Beide</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notizen (optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => updateFormField('notes', e.target.value)}
                  placeholder="Interne Notizen zum Kunden..."
                  rows={4}
                />
              </div>
            </div>

            {/* Aktionen */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                Abbrechen
              </Button>
              <Button onClick={handleSaveCustomer} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {isCreating ? 'Kunde anlegen' : 'Änderungen speichern'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Detailansicht eines Kunden mit Tabs
  if (selectedCustomer) {
    const transactions = customerTransactions[selectedCustomer.id] || [];
    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kundendetails</CardTitle>
              <CardDescription>Vollständige Informationen zu {selectedCustomer.firstName} {selectedCustomer.lastName}</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zur Liste
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="info" className="space-y-6">
            <TabsList>
              <TabsTrigger value="info">
                <User className="h-4 w-4 mr-2" />
                Informationen
              </TabsTrigger>
              <TabsTrigger value="orders">
                <FileText className="h-4 w-4 mr-2" />
                Aufträge ({transactions.length})
              </TabsTrigger>
            </TabsList>

            {/* Tab: Informationen */}
            <TabsContent value="info" className="space-y-6">
              <div className="p-6 bg-card border border-border rounded-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">{selectedCustomer.firstName} {selectedCustomer.lastName}</h3>
                      <p className="text-sm text-muted-foreground">{selectedCustomer.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCustomer(selectedCustomer)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Bearbeiten
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleCreateInvoiceForCustomer(selectedCustomer)}
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      Rechnung erstellen
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCustomer(selectedCustomer.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Löschen
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Quelle</p>
                      {getSourceBadge(selectedCustomer.source)}
                    </div>
                    
                    {selectedCustomer.company && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Firma</p>
                        <p>{selectedCustomer.company}</p>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">E-Mail</p>
                        <p>{selectedCustomer.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Telefon</p>
                        <p>{selectedCustomer.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Adresse</p>
                        <p>{selectedCustomer.address}</p>
                        <p>{selectedCustomer.postalCode} {selectedCustomer.city}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Kunde seit</p>
                        <p className="font-medium">{new Date(selectedCustomer.customerSince).toLocaleDateString('de-CH')}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Gesamtumsatz</p>
                        <p className="font-medium text-primary">CHF {totalRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedCustomer.notes && (
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Notizen</p>
                    <p className="text-sm bg-muted/50 p-3 rounded">{selectedCustomer.notes}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab: Aufträge */}
            <TabsContent value="orders" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium">Aufträge & Transaktionen</h3>
                  <p className="text-sm text-muted-foreground">
                    Gesamtumsatz: <span className="text-primary font-medium">CHF {totalRevenue.toLocaleString()}</span>
                  </p>
                </div>
                <Button onClick={() => handleCreateInvoiceForCustomer(selectedCustomer)}>
                  <Receipt className="h-4 w-4 mr-2" />
                  Neue Rechnung
                </Button>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-12 bg-card border border-border rounded-lg">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">Noch keine Aufträge vorhanden</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-medium">{transaction.id}</span>
                            {getStatusBadge(transaction.status)}
                            <Badge variant="outline" className={
                              transaction.type === 'damage-report'
                                ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                : 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                            }>
                              {transaction.type === 'damage-report' ? (
                                <><Car className="h-3 w-3 mr-1" />Reparatur</>
                              ) : (
                                <><Truck className="h-3 w-3 mr-1" />Vermietung</>
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm">{transaction.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {transaction.date}
                            </span>
                            <span className="flex items-center gap-1 text-primary font-medium">
                              <DollarSign className="h-3 w-3" />
                              CHF {transaction.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  // Hauptansicht - Kundenliste
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Kundenverwaltung</CardTitle>
              <CardDescription>Verwalten Sie alle Kundendaten zentral</CardDescription>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Kunden suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleCreateCustomer}>
                <Plus className="h-4 w-4 mr-2" />
                Neuer Kunde
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Statistiken */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{customers.length}</div>
              <p className="text-sm text-muted-foreground">Gesamt Kunden</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {customers.filter(c => c.source === 'damage-report' || c.source === 'both').length}
              </div>
              <p className="text-sm text-muted-foreground">Schadenmeldungen</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {customers.filter(c => c.source === 'rental' || c.source === 'both').length}
              </div>
              <p className="text-sm text-muted-foreground">Vermietungen</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-500">
                {customers.filter(c => c.source === 'manual').length}
              </div>
              <p className="text-sm text-muted-foreground">Manuell</p>
            </div>
          </div>

          {/* Kundenliste */}
          <div className="space-y-3">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Keine Kunden gefunden</p>
                {searchTerm && (
                  <Button 
                    variant="link" 
                    onClick={() => setSearchTerm('')}
                    className="mt-2"
                  >
                    Filter zurücksetzen
                  </Button>
                )}
              </div>
            ) : (
              filteredCustomers.map((customer) => {
                const transactions = customerTransactions[customer.id] || [];
                const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
                
                return (
                  <div
                    key={customer.id}
                    className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-medium text-lg">{customer.firstName} {customer.lastName}</span>
                            {getSourceBadge(customer.source)}
                            {customer.company && (
                              <Badge variant="outline" className="text-xs">
                                {customer.company}
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground truncate">{customer.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{customer.phone}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Seit {new Date(customer.customerSince).toLocaleDateString('de-CH')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-muted-foreground" />
                              <span className="text-primary font-medium">CHF {totalRevenue.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleCreateInvoiceForCustomer(customer)}
                        >
                          <Receipt className="h-4 w-4 mr-2" />
                          Rechnung
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}