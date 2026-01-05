import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent } from '../ui/card';
import { AdditionalOptions } from '../TruckBookingForm';
import { Shield, Package, Wrench, Circle } from 'lucide-react';

interface AdditionalOptionsStepProps {
  data: AdditionalOptions;
  onChange: (data: Partial<AdditionalOptions>) => void;
}

const OPTIONS = [
  {
    id: 'insurance' as keyof AdditionalOptions,
    icon: Shield,
    name: 'Additional Insurance',
    description: 'Extra coverage for peace of mind',
    price: 'CHF 25/day',
  },
  {
    id: 'blankets' as keyof AdditionalOptions,
    icon: Package,
    name: 'Moving Blankets (10 pcs)',
    description: 'Protect your furniture during transport',
    price: 'CHF 15',
  },
  {
    id: 'dolly' as keyof AdditionalOptions,
    icon: Wrench,
    name: 'Hand Truck / Dolly',
    description: 'Make moving heavy items easier',
    price: 'CHF 10',
  },
  {
    id: 'straps' as keyof AdditionalOptions,
    icon: Circle,
    name: 'Tie-Down Straps (4 pcs)',
    description: 'Secure your items during transport',
    price: 'CHF 8',
  },
];

export function AdditionalOptionsStep({ data, onChange }: AdditionalOptionsStepProps) {
  const handleOptionToggle = (option: keyof AdditionalOptions) => {
    if (typeof data[option] === 'boolean') {
      onChange({ [option]: !data[option] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Additional Equipment & Services</Label>
        <p className="text-sm text-gray-500">Select any additional items you need for your move</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const isChecked = data[option.id] as boolean;
            
            return (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all ${
                  isChecked
                    ? 'border-blue-500 bg-blue-50'
                    : 'hover:border-gray-400'
                }`}
                onClick={() => handleOptionToggle(option.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isChecked ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        isChecked ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="flex-1">{option.name}</h4>
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => handleOptionToggle(option.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                      <p className="text-blue-600">{option.price}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any special requests or information we should know..."
          value={data.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={4}
        />
        <p className="text-sm text-gray-500">
          Optional - Let us know if you have any special requirements
        </p>
      </div>
    </div>
  );
}
