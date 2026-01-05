import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Search, 
  Eye,
  Plus,
  FileText,
  Calendar,
  DollarSign,
  Download,
  Mail,
  Filter,
  Trash2
} from 'lucide-react';
import { InvoiceGenerator } from './InvoiceGenerator';
import { Customer } from './CustomerDatabase';

// Mock-Kunden für die Auswahl
const mockCustomers: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Max Müller',
    email: 'max.mueller@email.ch',
    phone: '+41 79 123 45 67',
    address: 'Bahnhofstrasse 123, 8001 Zürich',
    source: 'damage-report',
    createdDate: '2025-11-25',
    totalTransactions: 1,
    totalRevenue: 3500,
    transactions: [],
  },
  {
    id: 'CUST-002',
    name: 'Anna Schmidt',
    email: 'anna.schmidt@email.ch',
    phone: '+41 79 234 56 78',
    address: 'Limmatstrasse 45, 8005 Zürich',
    source: 'damage-report',
    createdDate: '2025-11-24',
    totalTransactions: 1,
    totalRevenue: 1200,
    transactions: [],
  },
  {
    id: 'CUST-003',
    name: 'Thomas Keller',
    email: 'thomas.keller@email.ch',
    phone: '+41 79 345 67 89',
    address: 'Seestrasse 78, 8008 Zürich',
    source: 'rental',
    createdDate: '2025-11-26',
    totalTransactions: 2,
    totalRevenue: 296,
    transactions: [],
  },
  {
    id: 'CUST-004',
    name: 'Sandra Huber',
    email: 'sandra.huber@email.ch',
    phone: '+41 79 456 78 90',
    address: 'Universitätstrasse 12, 8006 Zürich',
    source: 'rental',
    createdDate: '2025-11-25',
    totalTransactions: 1,
    totalRevenue: 154,
    transactions: [],
  },
  {
    id: 'CUST-005',
    name: 'Peter Weber',
    email: 'peter.weber@email.ch',
    phone: '+41 79 567 89 01',
    address: 'Hardstrasse 234, 8005 Zürich',
    source: 'both',
    createdDate: '2025-11-23',
    totalTransactions: 2,
    totalRevenue: 5929,
    transactions: [],
  },
];

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  type: 'damage-report' | 'rental' | 'manual';
  relatedId?: string; // ID der Schadenmeldung oder Buchung
}

// Mock-Rechnungen
const mockInvoices: Invoice[] = [
  {
    id: 'INV-001',
    invoiceNumber: 'RE-2025-1001',
    customerId: 'CUST-001',
    customerName: 'Max Müller',
    date: '2025-12-15',
    dueDate: '2026-01-14',
    amount: 3500,
    status: 'sent',
    type: 'damage-report',
    relatedId: 'SM-2025-001',
  },
  {
    id: 'INV-002',
    invoiceNumber: 'RE-2025-1002',
    customerId: 'CUST-002',
    customerName: 'Anna Schmidt',
    date: '2025-12-10',
    dueDate: '2026-01-09',
    amount: 1200,
    status: 'paid',
    type: 'damage-report',
    relatedId: 'SM-2025-002',
  },
  {
    id: 'INV-003',
    invoiceNumber: 'RE-2025-1003',
    customerId: 'CUST-003',
    customerName: 'Thomas Keller',
    date: '2025-11-26',
    dueDate: '2025-12-26',
    amount: 167,
    status: 'paid',
    type: 'rental',
    relatedId: 'BU-2025-101',
  },
  {
    id: 'INV-004',
    invoiceNumber: 'RE-2025-1004',
    customerId: 'CUST-004',
    customerName: 'Sandra Huber',
    date: '2025-12-20',
    dueDate: '2026-01-19',
    amount: 154,
    status: 'sent',
    type: 'rental',
    relatedId: 'BU-2025-102',
  },
  {
    id: 'INV-005',
    invoiceNumber: 'RE-2025-1005',
    customerId: 'CUST-005',
    customerName: 'Peter Weber',
    date: '2025-10-05',
    dueDate: '2025-11-04',
    amount: 5800,
    status: 'overdue',
    type: 'damage-report',
    relatedId: 'SM-2025-003',
  },
  {
    id: 'INV-006',
    invoiceNumber: 'RE-2025-1006',
    customerId: 'CUST-001',
    customerName: 'Max Müller',
    date: '2025-12-28',
    dueDate: '2026-01-27',
    amount: 850,
    status: 'draft',
    type: 'manual',
  },
];

export function InvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.relatedId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesType = typeFilter === 'all' || invoice.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDeleteInvoice = (invoice: Invoice) => {
    if (confirm(`Möchten Sie die Rechnung ${invoice.invoiceNumber} wirklich löschen?`)) {
      setInvoices(invoices.filter(inv => inv.id !== invoice.id));
      // In einer echten Anwendung würde hier ein API-Call stattfinden
      alert(`Rechnung ${invoice.invoiceNumber} wurde erfolgreich gelöscht.`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
          Entwurf
        </Badge>;
      case 'sent':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
          Versendet
        </Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
          Bezahlt
        </Badge>;
      case 'overdue':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
          Überfällig
        </Badge>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'damage-report':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
          Reparatur
        </Badge>;
      case 'rental':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
          Vermietung
        </Badge>;
      case 'manual':
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
          Manuell
        </Badge>;
      default:
        return null;
    }
  };

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingRevenue = invoices.filter(inv => inv.status === 'sent' || inv.status === 'draft').reduce((sum, inv) => sum + inv.amount, 0);
  const overdueRevenue = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);

  if (showCreateInvoice) {
    return (
      <InvoiceGenerator
        customer={null}
        transaction={null}
        onBack={() => setShowCreateInvoice(false)}
        availableCustomers={mockCustomers}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Rechnungsverwaltung</CardTitle>
              <CardDescription>Alle Rechnungen im Überblick</CardDescription>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechnungen suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={() => setShowCreateInvoice(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Neue Rechnung
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Statistiken */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">CHF {totalRevenue.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Gesamtumsatz</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">CHF {paidRevenue.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Bezahlt</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">CHF {pendingRevenue.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Ausstehend</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">CHF {overdueRevenue.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Überfällig</p>
            </div>
          </div>

          {/* Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
              >
                <option value="all">Alle Status</option>
                <option value="draft">Entwurf</option>
                <option value="sent">Versendet</option>
                <option value="paid">Bezahlt</option>
                <option value="overdue">Überfällig</option>
              </select>
            </div>
            <div className="flex-1">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
              >
                <option value="all">Alle Typen</option>
                <option value="damage-report">Reparatur</option>
                <option value="rental">Vermietung</option>
                <option value="manual">Manuell</option>
              </select>
            </div>
          </div>

          {/* Rechnungsliste */}
          <div className="space-y-3">
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Keine Rechnungen gefunden</p>
                {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
                  <Button 
                    variant="link" 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setTypeFilter('all');
                    }}
                    className="mt-2"
                  >
                    Filter zurücksetzen
                  </Button>
                )}
              </div>
            ) : (
              filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-medium text-lg">{invoice.invoiceNumber}</span>
                          {getStatusBadge(invoice.status)}
                          {getTypeBadge(invoice.type)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{invoice.customerName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{invoice.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span className="text-primary font-medium">CHF {invoice.amount.toLocaleString()}</span>
                          </div>
                        </div>
                        {invoice.relatedId && (
                          <div className="text-xs text-muted-foreground">
                            Bezug: {invoice.relatedId}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ansehen
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      {invoice.status !== 'paid' && (
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Senden
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteInvoice(invoice)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Löschen
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}