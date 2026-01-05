import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, CreditCard } from 'lucide-react';
import { RentalDetailsStep } from './truck-booking/RentalDetailsStep';
import { CustomerDetailsStep } from './truck-booking/CustomerDetailsStep';
import { AdditionalOptionsStep } from './truck-booking/AdditionalOptionsStep';
import { BookingReviewStep } from './truck-booking/BookingReviewStep';
import { PaymentStep, StripeDetails } from './truck-booking/PaymentStep';

interface TruckBookingFormProps {
  onBack: () => void;
}

export interface RentalDetails {
  truckSize: string;
  pickupDate: string;
  pickupTimeBlock: 'morning' | 'afternoon' | 'fullday' | '';
  returnDate: string;
}

export interface CustomerDetails {
  name: string;
  address: string;
  phone: string;
  email: string;
  driverLicense: string;
}

export interface AdditionalOptions {
  insurance: boolean;
  blankets: boolean;
  dolly: boolean;
  straps: boolean;
  notes: string;
}

export interface PaymentDetails {
  method: 'stripe' | 'cash';
  stripeDetails: StripeDetails;
}

export interface BookingData {
  rental: RentalDetails;
  customer: CustomerDetails;
  options: AdditionalOptions;
  payment: PaymentDetails;
}

export function TruckBookingForm({ onBack }: TruckBookingFormProps) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    rental: {
      truckSize: '',
      pickupDate: '',
      pickupTimeBlock: '',
      returnDate: '',
    },
    customer: {
      name: '',
      address: '',
      phone: '',
      email: '',
      driverLicense: '',
    },
    options: {
      insurance: false,
      blankets: false,
      dolly: false,
      straps: false,
      notes: '',
    },
    payment: {
      method: 'stripe',
      stripeDetails: {
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
      },
    },
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Booking submitted:', bookingData);
    setSubmitted(true);
  };

  const updateRentalDetails = (data: Partial<RentalDetails>) => {
    setBookingData(prev => ({
      ...prev,
      rental: { ...prev.rental, ...data },
    }));
  };

  const updateCustomerDetails = (data: Partial<CustomerDetails>) => {
    setBookingData(prev => ({
      ...prev,
      customer: { ...prev.customer, ...data },
    }));
  };

  const updateAdditionalOptions = (data: Partial<AdditionalOptions>) => {
    setBookingData(prev => ({
      ...prev,
      options: { ...prev.options, ...data },
    }));
  };

  const updatePaymentMethod = (method: 'stripe' | 'cash') => {
    setBookingData(prev => ({
      ...prev,
      payment: { ...prev.payment, method },
    }));
  };

  const updateStripeDetails = (details: StripeDetails) => {
    setBookingData(prev => ({
      ...prev,
      payment: { ...prev.payment, stripeDetails: details },
    }));
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    const TRUCK_SIZES: Record<string, { price: number }> = {
      red: { price: 129 },
      white1: { price: 129 },
      white2: { price: 129 },
    };

    const OPTION_PRICES = {
      insurance: 25,
      blankets: 15,
      dolly: 10,
      straps: 8,
    };

    const basePrice = TRUCK_SIZES[bookingData.rental.truckSize]?.price || 0;
    
    // Calculate number of days
    const pickup = new Date(bookingData.rental.pickupDate);
    const returnDate = new Date(bookingData.rental.returnDate);
    const days = Math.max(1, Math.ceil((returnDate.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    
    let total = basePrice * days;
    
    // Add options
    if (bookingData.options.insurance) total += OPTION_PRICES.insurance * days;
    if (bookingData.options.blankets) total += OPTION_PRICES.blankets;
    if (bookingData.options.dolly) total += OPTION_PRICES.dolly;
    if (bookingData.options.straps) total += OPTION_PRICES.straps;

    return total;
  };

  const totalPrice = calculateTotalPrice();

  if (submitted) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-16 h-16 bg-red-950 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl mb-4">
                {bookingData.payment.method === 'stripe' ? 'Zahlung erfolgreich!' : 'Buchung bestätigt!'}
              </h2>
              <p className="text-muted-foreground mb-4">
                Vielen Dank für Ihre Buchung. Ihre Transporter-Miete wurde bestätigt.
              </p>
              {bookingData.payment.method === 'stripe' ? (
                <p className="text-muted-foreground mb-4">
                  Die Zahlung von <strong>CHF {totalPrice.toFixed(2)}</strong> wurde erfolgreich von Ihrer Karte abgebucht.
                </p>
              ) : (
                <p className="text-muted-foreground mb-4">
                  Bitte bringen Sie <strong>CHF {totalPrice.toFixed(2)}</strong> in bar zur Fahrzeugabholung mit.
                </p>
              )}
              <p className="text-muted-foreground mb-8">
                Wir senden eine Bestätigungs-E-Mail an <strong>{bookingData.customer.email}</strong> mit allen Details.
              </p>
              <Button onClick={onBack}>Zurück zur Startseite</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Startseite
          </Button>
          <h1 className="text-3xl mb-2">Transporter-Vermietung Buchung</h1>
          <p className="text-muted-foreground">
            Buchen Sie einen Umzugstransporter für Ihre Umzugsbedürfnisse
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <CardTitle>
                Schritt {step} von {totalSteps}
              </CardTitle>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% Abgeschlossen</span>
            </div>
            <Progress value={progress} />
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Mietdetails'}
              {step === 2 && 'Kundendaten'}
              {step === 3 && 'Zusätzliche Optionen'}
              {step === 4 && 'Überprüfen & Bestätigen'}
              {step === 5 && 'Zahlung'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Wählen Sie Ihren Transporter und den Mietzeitraum'}
              {step === 2 && 'Geben Sie Ihre Kontaktinformationen an'}
              {step === 3 && 'Fügen Sie optionale Ausrüstung und Services hinzu'}
              {step === 4 && 'Überprüfen Sie Ihre Buchung vor der Bestätigung'}
              {step === 5 && 'Wählen Sie Ihre Zahlungsmethode'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <RentalDetailsStep data={bookingData.rental} onChange={updateRentalDetails} />
            )}
            {step === 2 && (
              <CustomerDetailsStep data={bookingData.customer} onChange={updateCustomerDetails} />
            )}
            {step === 3 && (
              <AdditionalOptionsStep data={bookingData.options} onChange={updateAdditionalOptions} />
            )}
            {step === 4 && (
              <BookingReviewStep bookingData={bookingData} />
            )}
            {step === 5 && (
              <PaymentStep 
                totalPrice={totalPrice}
                paymentMethod={bookingData.payment.method}
                onPaymentMethodChange={updatePaymentMethod}
                stripeDetails={bookingData.payment.stripeDetails}
                onStripeDetailsChange={updateStripeDetails}
              />
            )}

            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
              
              {step < totalSteps ? (
                <Button onClick={handleNext}>
                  Weiter
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="gap-2">
                  {bookingData.payment.method === 'stripe' ? (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Jetzt bezahlen (CHF {totalPrice.toFixed(2)})
                    </>
                  ) : (
                    <>
                      Buchung bestätigen
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}