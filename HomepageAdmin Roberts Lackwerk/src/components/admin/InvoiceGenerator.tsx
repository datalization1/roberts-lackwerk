import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Mail, 
  Eye,
  Plus,
  Trash2,
  CheckCircle,
  User,
  Search
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Customer, Transaction } from './CustomerDatabase';

interface InvoiceGeneratorProps {
  customer?: Customer | null;
  transaction?: Transaction | null;
  onBack: () => void;
  availableCustomers?: Customer[];
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export function InvoiceGenerator({ customer: initialCustomer, transaction, onBack, availableCustomers }: InvoiceGeneratorProps) {
  const [step, setStep] = useState<'edit' | 'preview' | 'sent'>('edit');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(initialCustomer || null);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(`RE-2025-${String(Math.floor(Math.random() * 9000) + 1000)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [items, setItems] = useState<InvoiceItem[]>(
    transaction ? [{
      id: '1',
      description: transaction.description,
      quantity: 1,
      unitPrice: transaction.amount,
      total: transaction.amount,
    }] : []
  );
  const [notes, setNotes] = useState('Zahlbar innerhalb von 30 Tagen netto.\nVielen Dank für Ihr Vertrauen!');
  const [taxRate, setTaxRate] = useState(7.7);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: String(Date.now()),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const handleGeneratePDF = () => {
    // In einer echten Anwendung würde hier eine PDF generiert werden
    console.log('Generiere PDF-Rechnung...', {
      invoiceNumber,
      customer,
      items,
      total,
    });
    alert('PDF-Rechnung würde heruntergeladen werden.\n\nIn einer echten Anwendung wird hier eine PDF-Datei generiert.');
  };

  const handleGenerateDOCX = () => {
    // In einer echten Anwendung würde hier ein DOCX generiert werden
    console.log('Generiere DOCX-Rechnung...', {
      invoiceNumber,
      customer,
      items,
      total,
    });
    alert('DOCX-Rechnung würde heruntergeladen werden.\n\nIn einer echten Anwendung wird hier eine DOCX-Datei generiert.');
  };

  const handleSendEmail = () => {
    if (!selectedCustomer) return;
    console.log('Sende Rechnung per E-Mail an:', selectedCustomer.email);
    setStep('sent');
  };

  // Kundenauswahl anzeigen, wenn kein Kunde ausgewählt ist
  if (!selectedCustomer && availableCustomers && availableCustomers.length > 0) {
    const filteredCustomers = availableCustomers.filter(c =>
      c.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
      c.email.toLowerCase().includes(searchCustomer.toLowerCase()) ||
      c.id.toLowerCase().includes(searchCustomer.toLowerCase())
    );

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kunde auswählen</CardTitle>
              <CardDescription>Wählen Sie einen Kunden für die Rechnungserstellung</CardDescription>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Abbrechen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kunde suchen (Name, E-Mail, ID)..."
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Keine Kunden gefunden</p>
                </div>
              ) : (
                filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.email}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {customer.id} • {customer.phone}
                          </div>
                        </div>
                      </div>
                      <Button size="sm">
                        Auswählen
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedCustomer) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fehler</CardTitle>
              <CardDescription>Kein Kunde ausgewählt</CardDescription>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Bitte wählen Sie zuerst einen Kunden aus.</p>
        </CardContent>
      </Card>
    );
  }

  if (step === 'sent') {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl mb-4">Rechnung erfolgreich versendet!</h2>
          <p className="text-muted-foreground mb-4">
            Die Rechnung <strong>{invoiceNumber}</strong> wurde erfolgreich an <strong>{selectedCustomer.email}</strong> gesendet.
          </p>
          <p className="text-muted-foreground mb-8">
            Gesamtbetrag: <strong className="text-primary">CHF {total.toFixed(2)}</strong>
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zur Kundendatenbank
            </Button>
            <Button variant="outline" onClick={() => setStep('preview')}>
              <Eye className="h-4 w-4 mr-2" />
              Rechnung ansehen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'preview') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Rechnungsvorschau</CardTitle>
                <CardDescription>Überprüfen Sie die Rechnung vor dem Versand</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setStep('edit')}>
                Bearbeiten
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Rechnung Vorschau */}
            <div className="bg-white text-black p-8 rounded-lg border-2 border-border max-w-4xl mx-auto">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-red-600 mb-2">AutoRepair Pro</h1>
                  <p className="text-sm text-gray-600">
                    Musterstrasse 123<br />
                    8000 Zürich<br />
                    Schweiz<br />
                    Tel: +41 44 123 45 67<br />
                    info@autorepairpro.ch
                  </p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold mb-2">RECHNUNG</h2>
                  <p className="text-sm text-gray-600">
                    Rechnungsnr: <strong>{invoiceNumber}</strong><br />
                    Datum: {invoiceDate}<br />
                    Fällig: {dueDate}
                  </p>
                </div>
              </div>

              {/* Kundenadresse */}
              <div className="mb-8">
                <h3 className="font-semibold mb-2">Rechnungsempfänger:</h3>
                <p className="text-sm">
                  {selectedCustomer.name}<br />
                  {selectedCustomer.address}<br />
                  {selectedCustomer.email}<br />
                  {selectedCustomer.phone}
                </p>
              </div>

              {/* Rechnungspositionen */}
              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2">Beschreibung</th>
                    <th className="text-right py-2">Menge</th>
                    <th className="text-right py-2">Einzelpreis</th>
                    <th className="text-right py-2">Gesamt</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-3">{item.description}</td>
                      <td className="text-right py-3">{item.quantity}</td>
                      <td className="text-right py-3">CHF {item.unitPrice.toFixed(2)}</td>
                      <td className="text-right py-3">CHF {item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summen */}
              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span>Zwischensumme:</span>
                    <span>CHF {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>MwSt ({taxRate}%):</span>
                    <span>CHF {taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-t-2 border-gray-300 font-bold text-lg">
                    <span>Gesamtbetrag:</span>
                    <span className="text-red-600">CHF {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notizen */}
              {notes && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-2">Anmerkungen:</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 pt-6 border-t text-center text-xs text-gray-500">
                <p>
                  AutoRepair Pro GmbH | UID: CHE-123.456.789 | Bank: Zürcher Kantonalbank<br />
                  IBAN: CH93 0076 2011 6238 5295 7 | BIC: ZKBKCHZZ80A
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center mt-6">
              <Button variant="outline" onClick={handleGeneratePDF}>
                <Download className="h-4 w-4 mr-2" />
                Als PDF herunterladen
              </Button>
              <Button variant="outline" onClick={handleGenerateDOCX}>
                <Download className="h-4 w-4 mr-2" />
                Als DOCX herunterladen
              </Button>
              <Button onClick={handleSendEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Per E-Mail versenden
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rechnung erstellen</CardTitle>
              <CardDescription>
                Erstellen Sie eine Rechnung für {selectedCustomer.name}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kundeninformationen */}
            <div className="lg:col-span-1">
              <div className="p-4 bg-card border border-border rounded-lg sticky top-4">
                <h3 className="font-medium mb-4">Kunde</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">E-Mail</p>
                    <p>{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Telefon</p>
                    <p>{selectedCustomer.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Adresse</p>
                    <p>{selectedCustomer.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rechnungsformular */}
            <div className="lg:col-span-2 space-y-6">
              {/* Rechnungsdetails */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rechnungsdetails</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoiceNumber">Rechnungsnummer</Label>
                      <Input
                        id="invoiceNumber"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoiceDate">Rechnungsdatum</Label>
                      <Input
                        id="invoiceDate"
                        type="date"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Fälligkeitsdatum</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rechnungspositionen */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Positionen</CardTitle>
                    <Button size="sm" onClick={addItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Position hinzufügen
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={item.id} className="p-4 bg-card border border-border rounded-lg">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <Badge variant="outline">Position {index + 1}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="md:col-span-2 space-y-2">
                            <Label htmlFor={`desc-${item.id}`}>Beschreibung</Label>
                            <Input
                              id={`desc-${item.id}`}
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              placeholder="Leistungsbeschreibung"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`qty-${item.id}`}>Menge</Label>
                            <Input
                              id={`qty-${item.id}`}
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`price-${item.id}`}>Preis (CHF)</Label>
                            <Input
                              id={`price-${item.id}`}
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                        <div className="mt-3 text-right">
                          <span className="text-sm text-muted-foreground">Gesamt: </span>
                          <span className="text-lg font-medium text-primary">CHF {item.total.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Keine Positionen vorhanden</p>
                        <p className="text-sm">Klicken Sie auf "Position hinzufügen"</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Summen und Optionen */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Zusammenfassung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">MwSt-Satz (%)</Label>
                    <Select
                      value={String(taxRate)}
                      onValueChange={(value) => setTaxRate(parseFloat(value))}
                    >
                      <SelectTrigger id="taxRate">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0% (befreit)</SelectItem>
                        <SelectItem value="2.5">2.5% (reduziert)</SelectItem>
                        <SelectItem value="7.7">7.7% (normal)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Anmerkungen</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Zahlungsbedingungen, Danksagung, etc."
                    />
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Zwischensumme:</span>
                      <span>CHF {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>MwSt ({taxRate}%):</span>
                      <span>CHF {taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Gesamtbetrag:</span>
                      <span className="text-primary">CHF {total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => setStep('preview')}
                    disabled={items.length === 0}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Vorschau anzeigen
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}