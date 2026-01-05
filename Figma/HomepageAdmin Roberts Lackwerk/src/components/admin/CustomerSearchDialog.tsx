import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Search, Plus, User, Mail, Phone, MapPin, Building2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Customer } from './CustomerManagement';

interface CustomerSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCustomer: (customer: Customer) => void;
  existingCustomers: Customer[];
}

export function CustomerSearchDialog({
  open,
  onOpenChange,
  onSelectCustomer,
  existingCustomers,
}: CustomerSearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    company: '',
    notes: '',
  });

  const filteredCustomers = existingCustomers.filter(customer =>
    customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.company && customer.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectCustomer = (customer: Customer) => {
    onSelectCustomer(customer);
    onOpenChange(false);
    setSearchTerm('');
    setIsCreatingNew(false);
    toast.success(`Kunde ${customer.firstName} ${customer.lastName} ausgewählt`);
  };

  const handleCreateCustomer = () => {
    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.email || !newCustomer.phone || !newCustomer.address || !newCustomer.postalCode || !newCustomer.city) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    const customer: Customer = {
      id: `CUST-${String(existingCustomers.length + 100).padStart(3, '0')}`,
      firstName: newCustomer.firstName,
      lastName: newCustomer.lastName,
      email: newCustomer.email,
      phone: newCustomer.phone,
      address: newCustomer.address,
      city: newCustomer.city,
      postalCode: newCustomer.postalCode,
      company: newCustomer.company,
      notes: newCustomer.notes,
      source: 'rental',
      createdDate: new Date().toISOString().split('T')[0],
      customerSince: new Date().toISOString().split('T')[0],
    };

    onSelectCustomer(customer);
    onOpenChange(false);
    setIsCreatingNew(false);
    setNewCustomer({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      company: '',
      notes: '',
    });
    setSearchTerm('');
    toast.success(`Neuer Kunde ${customer.firstName} ${customer.lastName} angelegt`);
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'damage-report':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-xs">
          Schadenmeldung
        </Badge>;
      case 'rental':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20 text-xs">
          Vermietung
        </Badge>;
      case 'both':
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
          Beide
        </Badge>;
      case 'manual':
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20 text-xs">
          Manuell
        </Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreatingNew ? 'Neuen Kunden anlegen' : 'Kunde suchen'}
          </DialogTitle>
          <DialogDescription>
            {isCreatingNew 
              ? 'Geben Sie die Kundendaten ein'
              : 'Wählen Sie einen bestehenden Kunden aus oder legen Sie einen neuen an'
            }
          </DialogDescription>
        </DialogHeader>

        {!isCreatingNew ? (
          <div className="space-y-4">
            {/* Suchfeld */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nach Name, E-Mail, Telefon oder Firma suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Neuen Kunden Button */}
            <Button 
              onClick={() => setIsCreatingNew(true)}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Neuen Kunden anlegen
            </Button>

            {/* Kundenliste */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Keine Kunden gefunden</p>
                  <p className="text-sm">Versuchen Sie einen anderen Suchbegriff oder legen Sie einen neuen Kunden an</p>
                </div>
              ) : (
                filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer)}
                    className="w-full p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors text-left"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{customer.firstName} {customer.lastName}</span>
                            {getSourceBadge(customer.source)}
                          </div>
                          {customer.company && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                              <Building2 className="h-3 w-3" />
                              <span>{customer.company}</span>
                            </div>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {customer.id}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">
                            {customer.city ? `${customer.postalCode} ${customer.city}` : '-'}
                          </span>
                        </div>
                        <div className="text-xs">
                          Kunde seit: {new Date(customer.customerSince).toLocaleDateString('de-CH')}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Formular für neuen Kunden */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Vorname *</Label>
                <Input
                  id="firstName"
                  value={newCustomer.firstName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                  placeholder="Max"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nachname *</Label>
                <Input
                  id="lastName"
                  value={newCustomer.lastName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                  placeholder="Mustermann"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  placeholder="kunde@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="+41 79 123 45 67"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Firma</Label>
              <Input
                id="company"
                value={newCustomer.company}
                onChange={(e) => setNewCustomer({ ...newCustomer, company: e.target.value })}
                placeholder="Firma GmbH"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse *</Label>
              <Input
                id="address"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                placeholder="Musterstrasse 123"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">PLZ *</Label>
                <Input
                  id="postalCode"
                  value={newCustomer.postalCode}
                  onChange={(e) => setNewCustomer({ ...newCustomer, postalCode: e.target.value })}
                  placeholder="8001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ort *</Label>
                <Input
                  id="city"
                  value={newCustomer.city}
                  onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                  placeholder="Zürich"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notizen</Label>
              <Textarea
                id="notes"
                value={newCustomer.notes}
                onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                placeholder="Zusätzliche Informationen zum Kunden..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreatingNew(false);
                  setNewCustomer({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    address: '',
                    city: '',
                    postalCode: '',
                    company: '',
                    notes: '',
                  });
                }}
                className="flex-1"
              >
                Zurück
              </Button>
              <Button onClick={handleCreateCustomer} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Kunde anlegen
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}