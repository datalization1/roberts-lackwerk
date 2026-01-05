import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { CarDetailsStep } from './damage-report/CarDetailsStep';
import { PersonalDetailsStep } from './damage-report/PersonalDetailsStep';
import { InsuranceDetailsStep } from './damage-report/InsuranceDetailsStep';
import { AccidentDetailsStep } from './damage-report/AccidentDetailsStep';
import { ReviewStep } from './damage-report/ReviewStep';

interface DamageReportFormProps {
  onBack: () => void;
}

export interface CarDetails {
  licensePlate: string;
  carBrand: string;
  carModel: string;
  stammnumber: string;
}

export interface PersonalDetails {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface InsuranceDetails {
  insurance: string;
  documentNo: string;
  accidentNo: string;
  contactPerson: string;
}

export interface AccidentDetails {
  damagedParts: string[];
  description: string;
  images: File[];
}

export interface FormData {
  car: CarDetails;
  personal: PersonalDetails;
  insurance: InsuranceDetails;
  accident: AccidentDetails;
}

export function DamageReportForm({ onBack }: DamageReportFormProps) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    car: {
      licensePlate: '',
      carBrand: '',
      carModel: '',
      stammnumber: '',
    },
    personal: {
      name: '',
      address: '',
      phone: '',
      email: '',
    },
    insurance: {
      insurance: '',
      documentNo: '',
      accidentNo: '',
      contactPerson: '',
    },
    accident: {
      damagedParts: [],
      description: '',
      images: [],
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
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

  const updateCarDetails = (data: Partial<CarDetails>) => {
    setFormData(prev => ({
      ...prev,
      car: { ...prev.car, ...data },
    }));
  };

  const updatePersonalDetails = (data: Partial<PersonalDetails>) => {
    setFormData(prev => ({
      ...prev,
      personal: { ...prev.personal, ...data },
    }));
  };

  const updateInsuranceDetails = (data: Partial<InsuranceDetails>) => {
    setFormData(prev => ({
      ...prev,
      insurance: { ...prev.insurance, ...data },
    }));
  };

  const updateAccidentDetails = (data: Partial<AccidentDetails>) => {
    setFormData(prev => ({
      ...prev,
      accident: { ...prev.accident, ...data },
    }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-16 h-16 bg-red-950 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl mb-4">Schadenmeldung erfolgreich eingereicht!</h2>
              <p className="text-muted-foreground mb-8">
                Vielen Dank für Ihre Schadenmeldung. Wir werden Ihren Fall prüfen und uns innerhalb von 24 Stunden bei Ihnen melden.
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
          <h1 className="text-3xl mb-2">Schadenmeldung</h1>
          <p className="text-muted-foreground">
            Bitte geben Sie detaillierte Informationen über den Schaden an Ihrem Fahrzeug an
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
              {step === 1 && 'Fahrzeugdaten'}
              {step === 2 && 'Persönliche Daten'}
              {step === 3 && 'Versicherungsdaten'}
              {step === 4 && 'Unfalldetails'}
              {step === 5 && 'Überprüfen & Absenden'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Geben Sie Informationen zu Ihrem Fahrzeug ein'}
              {step === 2 && 'Geben Sie Ihre Kontaktinformationen an'}
              {step === 3 && 'Geben Sie Ihre Versicherungsinformationen ein'}
              {step === 4 && 'Beschreiben Sie den Schaden und laden Sie Fotos hoch'}
              {step === 5 && 'Überprüfen Sie Ihre Angaben vor dem Absenden'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <CarDetailsStep data={formData.car} onChange={updateCarDetails} />
            )}
            {step === 2 && (
              <PersonalDetailsStep data={formData.personal} onChange={updatePersonalDetails} />
            )}
            {step === 3 && (
              <InsuranceDetailsStep data={formData.insurance} onChange={updateInsuranceDetails} />
            )}
            {step === 4 && (
              <AccidentDetailsStep data={formData.accident} onChange={updateAccidentDetails} />
            )}
            {step === 5 && (
              <ReviewStep formData={formData} />
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
                <Button onClick={handleSubmit}>
                  Meldung absenden
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}