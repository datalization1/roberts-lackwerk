import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { 
  Settings as SettingsIcon,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Car,
  Shield,
  Package,
  Building2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';

// Initiale Listen
const initialCarParts = [
  'Vordere Stossstange',
  'Hintere Stossstange',
  'Vordere linke Tür',
  'Vordere rechte Tür',
  'Hintere linke Tür',
  'Hintere rechte Tür',
  'Motorhaube',
  'Kofferraum',
  'Vorderer linker Kotflügel',
  'Vorderer rechter Kotflügel',
  'Hinterer linker Kotflügel',
  'Hinterer rechter Kotflügel',
  'Windschutzscheibe',
  'Heckscheibe',
  'Seitenspiegel (links)',
  'Seitenspiegel (rechts)',
  'Scheinwerfer (links)',
  'Scheinwerfer (rechts)',
  'Rücklicht (links)',
  'Rücklicht (rechts)',
  'Dach',
  'Räder/Felgen',
];

const initialInsurances = [
  'AXA',
  'Zurich',
  'Mobiliar',
  'Generali',
  'Allianz',
  'Helvetia',
  'Baloise',
  'CSS',
  'Sympany',
  'Sanitas',
];

const initialCarBrands = [
  'Audi',
  'BMW',
  'Mercedes-Benz',
  'Volkswagen',
  'Opel',
  'Ford',
  'Toyota',
  'Honda',
  'Mazda',
  'Nissan',
  'Hyundai',
  'Kia',
  'Peugeot',
  'Renault',
  'Citroën',
  'Fiat',
  'Seat',
  'Skoda',
  'Volvo',
  'Tesla',
];

const initialServices = [
  'Unfallreparatur',
  'Karosserieinstandsetzung',
  'Lackierung',
  'Dellenentfernung',
  'Hagelschadenreparatur',
  'Stossstangenreparatur',
  'Scheibenreparatur/-austausch',
  'Smart Repair',
  'Politur & Aufbereitung',
  'Rostschutzbehandlung',
];

interface ListItem {
  id: string;
  value: string;
}

export function Settings() {
  // Listen-Status
  const [carParts, setCarParts] = useState<ListItem[]>(
    initialCarParts.map((part, index) => ({ id: String(index + 1), value: part }))
  );
  const [insurances, setInsurances] = useState<ListItem[]>(
    initialInsurances.map((ins, index) => ({ id: String(index + 1), value: ins }))
  );
  const [carBrands, setCarBrands] = useState<ListItem[]>(
    initialCarBrands.map((brand, index) => ({ id: String(index + 1), value: brand }))
  );
  const [services, setServices] = useState<ListItem[]>(
    initialServices.map((service, index) => ({ id: String(index + 1), value: service }))
  );

  // Editing-Status
  const [editingItem, setEditingItem] = useState<{ listType: string; id: string; value: string } | null>(null);
  const [newItemValue, setNewItemValue] = useState('');
  const [showAddForm, setShowAddForm] = useState<string | null>(null);

  // Helper-Funktionen
  const getList = (listType: string): ListItem[] => {
    switch (listType) {
      case 'carParts': return carParts;
      case 'insurances': return insurances;
      case 'carBrands': return carBrands;
      case 'services': return services;
      default: return [];
    }
  };

  const setList = (listType: string, newList: ListItem[]) => {
    switch (listType) {
      case 'carParts': setCarParts(newList); break;
      case 'insurances': setInsurances(newList); break;
      case 'carBrands': setCarBrands(newList); break;
      case 'services': setServices(newList); break;
    }
  };

  const handleAddItem = (listType: string) => {
    if (!newItemValue.trim()) {
      toast.error('Bitte geben Sie einen Wert ein');
      return;
    }

    const list = getList(listType);
    const newId = String(Math.max(...list.map(item => parseInt(item.id)), 0) + 1);
    const newItem: ListItem = { id: newId, value: newItemValue.trim() };
    
    setList(listType, [...list, newItem]);
    setNewItemValue('');
    setShowAddForm(null);
    toast.success('Eintrag erfolgreich hinzugefügt');
  };

  const handleDeleteItem = (listType: string, id: string) => {
    const list = getList(listType);
    const item = list.find(i => i.id === id);
    
    if (confirm(`Möchten Sie "${item?.value}" wirklich löschen?`)) {
      setList(listType, list.filter(i => i.id !== id));
      toast.success('Eintrag erfolgreich gelöscht');
    }
  };

  const handleEditItem = (listType: string, id: string, value: string) => {
    setEditingItem({ listType, id, value });
  };

  const handleSaveEdit = () => {
    if (!editingItem || !editingItem.value.trim()) {
      toast.error('Bitte geben Sie einen Wert ein');
      return;
    }

    const list = getList(editingItem.listType);
    setList(
      editingItem.listType,
      list.map(item => (item.id === editingItem.id ? { ...item, value: editingItem.value.trim() } : item))
    );
    
    setEditingItem(null);
    toast.success('Eintrag erfolgreich aktualisiert');
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const renderListItems = (listType: string, icon: any) => {
    const list = getList(listType);
    const Icon = icon;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Einträge ({list.length})</h3>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddForm(listType)}
            disabled={showAddForm === listType}
          >
            <Plus className="h-4 w-4 mr-2" />
            Hinzufügen
          </Button>
        </div>

        {showAddForm === listType && (
          <Card className="border-primary/50">
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={newItemValue}
                    onChange={(e) => setNewItemValue(e.target.value)}
                    placeholder="Neuer Eintrag..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddItem(listType);
                      if (e.key === 'Escape') {
                        setShowAddForm(null);
                        setNewItemValue('');
                      }
                    }}
                    autoFocus
                  />
                </div>
                <Button onClick={() => handleAddItem(listType)}>
                  <Save className="h-4 w-4 mr-2" />
                  Speichern
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(null);
                    setNewItemValue('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {list.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
            >
              {editingItem?.id === item.id && editingItem.listType === listType ? (
                <div className="space-y-2">
                  <Input
                    value={editingItem.value}
                    onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveEdit} className="flex-1">
                      <Save className="h-3 w-3 mr-1" />
                      Speichern
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm flex-1">{item.value}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditItem(listType, item.id, item.value)}
                      className="h-7 w-7 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(listType, item.id)}
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Einstellungen</CardTitle>
              <CardDescription>
                Verwalten Sie Listen und Konfigurationen für das System
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="carParts">
            <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-2 h-auto">
              <TabsTrigger value="carParts" className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                Fahrzeugteile
              </TabsTrigger>
              <TabsTrigger value="insurances" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Versicherungen
              </TabsTrigger>
              <TabsTrigger value="carBrands" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Automarken
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Dienstleistungen
              </TabsTrigger>
            </TabsList>

            <TabsContent value="carParts" className="space-y-4 mt-6">
              <div className="mb-4">
                <h3 className="font-medium mb-1">Fahrzeugteile</h3>
                <p className="text-sm text-muted-foreground">
                  Liste der auswählbaren Fahrzeugteile im Schadensmeldungsformular
                </p>
              </div>
              {renderListItems('carParts', Car)}
            </TabsContent>

            <TabsContent value="insurances" className="space-y-4 mt-6">
              <div className="mb-4">
                <h3 className="font-medium mb-1">Versicherungsgesellschaften</h3>
                <p className="text-sm text-muted-foreground">
                  Liste der Versicherungen für das Schadensmeldungsformular
                </p>
              </div>
              {renderListItems('insurances', Shield)}
            </TabsContent>

            <TabsContent value="carBrands" className="space-y-4 mt-6">
              <div className="mb-4">
                <h3 className="font-medium mb-1">Automarken</h3>
                <p className="text-sm text-muted-foreground">
                  Liste der verfügbaren Automarken für Schadenmeldungen
                </p>
              </div>
              {renderListItems('carBrands', Building2)}
            </TabsContent>

            <TabsContent value="services" className="space-y-4 mt-6">
              <div className="mb-4">
                <h3 className="font-medium mb-1">Dienstleistungen</h3>
                <p className="text-sm text-muted-foreground">
                  Liste der angebotenen Dienstleistungen für die Homepage
                </p>
              </div>
              {renderListItems('services', Package)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
