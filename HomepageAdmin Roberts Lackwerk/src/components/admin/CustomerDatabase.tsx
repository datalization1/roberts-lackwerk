import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  User, 
  Search, 
  Eye, 
  FileText, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Car,
  Truck,
  Receipt
} from 'lucide-react';
import { InvoiceGenerator } from './InvoiceGenerator';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  source: 'damage-report' | 'rental' | 'both';
  createdDate: string;
  totalTransactions: number;
  totalRevenue: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'damage-report' | 'rental';
  date: string;
  description: string;
  amount: number;
  status: 'pending' | 'completed' | 'invoiced';
}

// Mock-Kundendaten generiert aus Schadenmeldungen und Buchungen
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
    transactions: [
      {
        id: 'SM-2025-001',
        type: 'damage-report',
        date: '2025-11-25',
        description: 'Unfallschaden vorne - VW Golf',
        amount: 3500,
        status: 'pending',
      }
    ]
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
    transactions: [
      {
        id: 'SM-2025-002',
        type: 'damage-report',
        date: '2025-11-24',
        description: 'Lackschaden Seitentür - BMW 3er',
        amount: 1200,
        status: 'completed',
      }
    ]
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
    transactions: [
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
      }
    ]
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
    transactions: [
      {
        id: 'BU-2025-102',
        type: 'rental',
        date: '2025-11-25',
        description: 'Transporter Weiss 1 - Vormittag',
        amount: 154,
        status: 'pending',
      }
    ]
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
    transactions: [
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
      }
    ]
  },
];

export function CustomerDatabase() {
  const [customers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
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

  const handleCreateInvoice = (customer: Customer, transaction?: Transaction) => {
    setSelectedCustomer(customer);
    setSelectedTransaction(transaction || null);
    setShowInvoiceGenerator(true);
  };

  if (showInvoiceGenerator && selectedCustomer) {
    return (
      <InvoiceGenerator
        customer={selectedCustomer}
        transaction={selectedTransaction}
        onBack={() => {
          setShowInvoiceGenerator(false);
          setSelectedCustomer(null);
          setSelectedTransaction(null);
        }}
      />
    );
  }

  if (selectedCustomer) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kundendetails</CardTitle>
              <CardDescription>Vollständige Informationen und Transaktionsverlauf</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
              Zurück zur Liste
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kundeninformationen */}
            <div className="lg:col-span-1 space-y-4">
              <div className="p-4 bg-card border border-border rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedCustomer.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.id}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">E-Mail</p>
                      <p className="text-sm">{selectedCustomer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Telefon</p>
                      <p className="text-sm">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Adresse</p>
                      <p className="text-sm">{selectedCustomer.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Kunde seit</p>
                      <p className="text-sm">{selectedCustomer.createdDate}</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    {getSourceBadge(selectedCustomer.source)}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Transaktionen</p>
                    <p className="text-xl font-bold">{selectedCustomer.totalTransactions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Umsatz</p>
                    <p className="text-xl font-bold text-primary">CHF {selectedCustomer.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>

                <Button 
                  className="w-full mt-4"
                  onClick={() => handleCreateInvoice(selectedCustomer)}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Neue Rechnung erstellen
                </Button>
              </div>
            </div>

            {/* Transaktionsverlauf */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-medium">Transaktionsverlauf</h3>
              <div className="space-y-3">
                {selectedCustomer.transactions.map((transaction) => (
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
                          <span>{transaction.date}</span>
                          <span className="text-primary font-medium">CHF {transaction.amount.toLocaleString()}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCreateInvoice(selectedCustomer, transaction)}
                        disabled={transaction.status === 'invoiced'}
                      >
                        <Receipt className="h-4 w-4 mr-2" />
                        {transaction.status === 'invoiced' ? 'Berechnet' : 'Rechnung'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Kundendatenbank</CardTitle>
              <CardDescription>Alle Kunden aus Schadenmeldungen und Vermietungen</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kunden suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
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
              <p className="text-sm text-muted-foreground">Reparaturen</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {customers.filter(c => c.source === 'rental' || c.source === 'both').length}
              </div>
              <p className="text-sm text-muted-foreground">Vermietungen</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                CHF {customers.reduce((sum, c) => sum + c.totalRevenue, 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Gesamtumsatz</p>
            </div>
          </div>

          {/* Kundenliste */}
          <div className="space-y-3">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Keine Kunden gefunden</p>
              </div>
            ) : (
              filteredCustomers.map((customer) => (
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
                          <span className="font-medium text-lg">{customer.name}</span>
                          {getSourceBadge(customer.source)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground truncate">{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{customer.phone}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{customer.totalTransactions} Transaktionen</span>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Umsatz: </span>
                          <span className="text-primary font-medium">CHF {customer.totalRevenue.toLocaleString()}</span>
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
                        onClick={() => handleCreateInvoice(customer)}
                      >
                        <Receipt className="h-4 w-4 mr-2" />
                        Rechnung
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
