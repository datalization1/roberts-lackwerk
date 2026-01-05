import { useState } from 'react';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { AccidentDetails } from '../DamageReportForm';
import { Upload, X } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface AccidentDetailsStepProps {
  data: AccidentDetails;
  onChange: (data: Partial<AccidentDetails>) => void;
}

const CAR_PARTS = [
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

export function AccidentDetailsStep({ data, onChange }: AccidentDetailsStepProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handlePartToggle = (part: string) => {
    const newParts = data.damagedParts.includes(part)
      ? data.damagedParts.filter(p => p !== part)
      : [...data.damagedParts, part];
    onChange({ damagedParts: newParts });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onChange({ images: [...data.images, ...files] });
      
      // Create preview URLs
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = data.images.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    onChange({ images: newImages });
    setPreviewUrls(newPreviews);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Beschädigte Fahrzeugteile *</Label>
        <p className="text-sm text-muted-foreground">Wählen Sie alle beschädigten Teile des Fahrzeugs aus</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto border rounded-lg p-4">
          {CAR_PARTS.map((part) => (
            <div key={part} className="flex items-start space-x-2">
              <Checkbox
                id={part}
                checked={data.damagedParts.includes(part)}
                onCheckedChange={() => handlePartToggle(part)}
              />
              <label
                htmlFor={part}
                className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {part}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Schadenbeschreibung *</Label>
        <Textarea
          id="description"
          placeholder="Bitte beschreiben Sie den Schaden detailliert, einschliesslich wie der Unfall geschehen ist, falls relevant..."
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          required
          rows={6}
        />
        <p className="text-sm text-muted-foreground">
          Geben Sie Details zu den Unfallumständen und dem Ausmass des Schadens an
        </p>
      </div>

      <div className="space-y-4">
        <Label>Schadenfotos *</Label>
        <p className="text-sm text-muted-foreground">
          Laden Sie klare Fotos der beschädigten Bereiche hoch (maximal 10 Bilder)
        </p>
        
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <label htmlFor="imageUpload" className="cursor-pointer">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-foreground mb-2">Klicken Sie, um Bilder hochzuladen</p>
            <p className="text-sm text-muted-foreground">PNG, JPG bis zu 10MB pro Bild</p>
          </label>
        </div>

        {previewUrls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <ImageWithFallback
                  src={url}
                  alt={`Schadenfoto ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}