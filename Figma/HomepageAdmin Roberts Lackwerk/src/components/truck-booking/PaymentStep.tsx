import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { CreditCard, Banknote, Lock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface PaymentStepProps {
  totalPrice: number;
  onPaymentMethodChange: (method: 'stripe' | 'cash') => void;
  paymentMethod: 'stripe' | 'cash';
  onStripeDetailsChange: (details: StripeDetails) => void;
  stripeDetails: StripeDetails;
}

export interface StripeDetails {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

export function PaymentStep({ 
  totalPrice, 
  onPaymentMethodChange, 
  paymentMethod,
  onStripeDetailsChange,
  stripeDetails 
}: PaymentStepProps) {
  const [errors, setErrors] = useState<Partial<StripeDetails>>({});

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    onStripeDetailsChange({ ...stripeDetails, cardNumber: formatted });
    if (formatted.replace(/\s/g, '').length === 16) {
      setErrors({ ...errors, cardNumber: undefined });
    }
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiryDate(value);
    onStripeDetailsChange({ ...stripeDetails, expiryDate: formatted });
    if (formatted.length === 5) {
      setErrors({ ...errors, expiryDate: undefined });
    }
  };

  const handleCvvChange = (value: string) => {
    const v = value.replace(/[^0-9]/gi, '').slice(0, 4);
    onStripeDetailsChange({ ...stripeDetails, cvv: v });
    if (v.length >= 3) {
      setErrors({ ...errors, cvv: undefined });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4">Zahlungsmethode wählen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            className={`cursor-pointer transition-all ${
              paymentMethod === 'stripe' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => onPaymentMethodChange('stripe')}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  paymentMethod === 'stripe' ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  <CreditCard className={`h-6 w-6 ${
                    paymentMethod === 'stripe' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="mb-1">Kreditkarte (Stripe)</h4>
                  <p className="text-sm text-muted-foreground">
                    Bezahlen Sie sicher mit Kreditkarte
                  </p>
                  <div className="flex gap-2 mt-3">
                    <div className="px-2 py-1 bg-card border border-border rounded text-xs">VISA</div>
                    <div className="px-2 py-1 bg-card border border-border rounded text-xs">Mastercard</div>
                    <div className="px-2 py-1 bg-card border border-border rounded text-xs">AMEX</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${
              paymentMethod === 'cash' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => onPaymentMethodChange('cash')}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  paymentMethod === 'cash' ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  <Banknote className={`h-6 w-6 ${
                    paymentMethod === 'cash' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="mb-1">Barzahlung</h4>
                  <p className="text-sm text-muted-foreground">
                    Bezahlen Sie bei Abholung in bar
                  </p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Zahlung bei Fahrzeugübernahme
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {paymentMethod === 'stripe' && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Kreditkarten-Details
            </CardTitle>
            <CardDescription>
              Ihre Zahlungsdaten sind durch SSL-Verschlüsselung geschützt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-primary/5 border-primary/20">
              <Lock className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                <strong>Demo-Modus:</strong> Dies ist eine Testumgebung. Verwenden Sie die Testkartennummer: <code className="bg-background px-2 py-0.5 rounded">4242 4242 4242 4242</code>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="cardName">Karteninhaber</Label>
              <Input
                id="cardName"
                placeholder="Max Mustermann"
                value={stripeDetails.cardName}
                onChange={(e) => onStripeDetailsChange({ ...stripeDetails, cardName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Kartennummer</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={stripeDetails.cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  maxLength={19}
                  className="pl-9"
                />
              </div>
              {errors.cardNumber && (
                <p className="text-xs text-destructive">{errors.cardNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Gültig bis</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/JJ"
                  value={stripeDetails.expiryDate}
                  onChange={(e) => handleExpiryChange(e.target.value)}
                  maxLength={5}
                />
                {errors.expiryDate && (
                  <p className="text-xs text-destructive">{errors.expiryDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder="123"
                  value={stripeDetails.cvv}
                  onChange={(e) => handleCvvChange(e.target.value)}
                  maxLength={4}
                />
                {errors.cvv && (
                  <p className="text-xs text-destructive">{errors.cvv}</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Gesamtbetrag</span>
                <span className="text-2xl">CHF {totalPrice.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Der Betrag wird nach Bestätigung von Ihrer Karte abgebucht
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {paymentMethod === 'cash' && (
        <Card className="border-border bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-primary" />
              Barzahlung bei Abholung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Bitte bringen Sie den exakten Betrag oder passend Wechselgeld zur Fahrzeugabholung mit.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Zahlung erfolgt bei Fahrzeugübergabe</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Bitte gültigen Führerschein mitbringen</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Kaution kann in bar oder per Karte hinterlegt werden</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Zu zahlender Betrag</span>
                <span className="text-2xl">CHF {totalPrice.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Zusätzlich: CHF 500.00 Kaution (wird bei Rückgabe zurückerstattet)
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
