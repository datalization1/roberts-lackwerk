import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Truck, Plus, Pencil, Trash2, Check, X, Upload, Image as ImageIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  price: number;
  status: 'active' | 'inactive';
  image?: string;
}

const initialVehicles: Vehicle[] = [
  {
    id: 'red',
    name: 'Transporter Rot',
    model: 'Mercedes Sprinter',
    price: 129,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400',
  },
  {
    id: 'white1',
    name: 'Transporter Weiss 1',
    model: 'VW Crafter',
    price: 129,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1562141961-4a4d50b5e2e4?w=400',
  },
  {
    id: 'white2',
    name: 'Transporter Weiss 2',
    model: 'Ford Transit',
    price: 129,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  },
];

export function VehicleManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Vehicle, 'id'>>(({
    name: '',
    model: '',
    price: 0,
    status: 'active',
    image: undefined,
  }));

  const handleAdd = () => {
    const newVehicle: Vehicle = {
      id: `vehicle-${Date.now()}`,
      ...formData,
    };
    setVehicles([...vehicles, newVehicle]);
    setIsAdding(false);
    resetForm();
  };

  const handleUpdate = (id: string) => {
    setVehicles(vehicles.map(v => 
      v.id === id ? { id, ...formData } : v
    ));
    setEditingId(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Möchten Sie dieses Fahrzeug wirklich löschen?')) {
      setVehicles(vehicles.filter(v => v.id !== id));
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingId(vehicle.id);
    setFormData({
      name: vehicle.name,
      model: vehicle.model,
      price: vehicle.price,
      status: vehicle.status,
      image: vehicle.image,
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      model: '',
      price: 0,
      status: 'active',
      image: undefined,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, image: url });
  };

  const getStatusBadge = (status: 'active' | 'inactive') => {
    return status === 'active' ? (
      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
        Aktiv
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
        Inaktiv
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Fahrzeugverwaltung</CardTitle>
              <CardDescription>Verwalten Sie Ihre Mietfahrzeuge</CardDescription>
            </div>
            {!isAdding && !editingId && (
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Fahrzeug hinzufügen
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Add/Edit Form */}
          {(isAdding || editingId) && (
            <Card className="mb-6 border-primary/50">
              <CardHeader>
                <CardTitle className="text-lg">
                  {isAdding ? 'Neues Fahrzeug hinzufügen' : 'Fahrzeug bearbeiten'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Fahrzeugname</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="z.B. Transporter Rot"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Modell</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="z.B. Mercedes Sprinter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Tagespreis (CHF)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="129"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: 'active' | 'inactive') => 
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Aktiv</SelectItem>
                        <SelectItem value="inactive">Inaktiv</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Image Upload Section */}
                  <div className="space-y-2 md:col-span-2">
                    <Label>Fahrzeugbild</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="imageFile" className="text-sm text-muted-foreground">
                          Bild hochladen
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="imageFile"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => document.getElementById('imageFile')?.click()}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imageUrl" className="text-sm text-muted-foreground">
                          Oder Bild-URL eingeben
                        </Label>
                        <Input
                          id="imageUrl"
                          value={formData.image || ''}
                          onChange={(e) => handleImageUrlChange(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>
                    
                    {/* Image Preview */}
                    {formData.image && (
                      <div className="mt-3 relative">
                        <Label className="text-sm text-muted-foreground mb-2 block">Vorschau</Label>
                        <div className="relative w-full h-48 bg-card border border-border rounded-lg overflow-hidden">
                          <img
                            src={formData.image}
                            alt="Fahrzeug Vorschau"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setFormData({ ...formData, image: undefined })}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button
                    onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
                    disabled={!formData.name || !formData.model || formData.price <= 0}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {isAdding ? 'Hinzufügen' : 'Speichern'}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="mr-2 h-4 w-4" />
                    Abbrechen
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vehicles List */}
          <div className="space-y-3">
            {vehicles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Truck className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Keine Fahrzeuge vorhanden</p>
              </div>
            ) : (
              vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {vehicle.image ? (
                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                          <img
                            src={vehicle.image}
                            alt={vehicle.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-red-950 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="h-8 w-8 text-primary opacity-50" />
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-medium text-lg">{vehicle.name}</span>
                          {getStatusBadge(vehicle.status)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Modell: </span>
                            <span>{vehicle.model}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tagespreis: </span>
                            <span className="text-primary font-medium">CHF {vehicle.price}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(vehicle)}
                        disabled={isAdding || editingId !== null}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Bearbeiten
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(vehicle.id)}
                        disabled={isAdding || editingId !== null}
                        className="border-destructive/50 text-destructive hover:bg-destructive/10"
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

          {/* Statistics */}
          <div className="mt-6 pt-6 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{vehicles.length}</div>
              <p className="text-sm text-muted-foreground">Gesamt</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {vehicles.filter(v => v.status === 'active').length}
              </div>
              <p className="text-sm text-muted-foreground">Aktiv</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-500">
                {vehicles.filter(v => v.status === 'inactive').length}
              </div>
              <p className="text-sm text-muted-foreground">Inaktiv</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {vehicles.length > 0 
                  ? `CHF ${(vehicles.reduce((sum, v) => sum + v.price, 0) / vehicles.length).toFixed(0)}`
                  : 'CHF 0'
                }
              </div>
              <p className="text-sm text-muted-foreground">Ø Preis</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}