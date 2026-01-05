import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Car, Truck, FileText, Shield, Clock, Award, Paintbrush } from 'lucide-react';

type Page = 'home' | 'damage-report' | 'truck-rental' | 'about';

interface LandingPageProps {
  onNavigate: (page: Page) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-900 to-black text-white">
        <div className="absolute inset-0 opacity-10">
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1727413434026-0f8314c037d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjByZXBhaXIlMjB3b3Jrc2hvcHxlbnwxfHx8fDE3NjE2NzMxMDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Autoreparaturwerkstatt"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl mb-6">Professionelle Karosseriereparatur & Transporter-Vermietung</h1>
            <p className="text-xl mb-8 text-red-100">
              Fachkundige Lackiererei für unfallbeschädigte Fahrzeuge und zuverlässige Umzugstransporter in der Schweiz
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                onClick={() => onNavigate('damage-report')}
              >
                Schaden melden
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="bg-transparent text-white border-white hover:bg-white/10"
                onClick={() => onNavigate('truck-rental')}
              >
                Transporter mieten
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-4">Unsere Dienstleistungen</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Umfassende Autoreparatur- und Vermietungslösungen nach Ihren Bedürfnissen
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-red-950 rounded-lg flex items-center justify-center mb-4">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Karosseriereparatur</CardTitle>
                <CardDescription>
                  Professionelle Instandsetzung von Unfallschäden an der Karosserie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Unfallschadenbehebung</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Dellenentfernung</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Schweissarbeiten</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Rahmenrichtarbeiten</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-red-950 rounded-lg flex items-center justify-center mb-4">
                  <Paintbrush className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Autolackierung</CardTitle>
                <CardDescription>
                  Fachgerechte Lackierarbeiten mit modernster Technik und Präzision
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Komplettlackierungen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Spot-Repair (Teillackierung)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Farbton-Anpassung</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Lackversiegelung</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-red-950 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Versicherungsunterstützung</CardTitle>
                <CardDescription>
                  Direkte Zusammenarbeit mit allen grossen Versicherungen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Direktabrechnung</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Schadengutachten</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Schadensmeldungen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Gesetz konforme Dokumentation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-red-950 rounded-lg flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Transporter-Vermietung</CardTitle>
                <CardDescription>
                  Zuverlässige Umzugs-Transporter für jeden Bedarf
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Verschiedene Grössen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Flexible Mietzeiten</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Gut gewartete Flotte</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Faire Preise</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-4">Warum uns wählen</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-950 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl mb-2">Expertentechniker</h3>
              <p className="text-muted-foreground">
                Zertifizierte Fachleute mit jahrelanger Erfahrung in Karosseriereparaturen
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-950 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl mb-2">Schnelle Bearbeitung</h3>
              <p className="text-muted-foreground">
                Effizienter Service, um Sie so schnell wie möglich wieder auf die Strasse zu bringen
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-950 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl mb-2">Schweizer Gesetz konform</h3>
              <p className="text-muted-foreground">
                Alle Dokumentationen und Prozesse entsprechen den Schweizer Rechtsvorschriften
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-red-900 to-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl mb-4">Bereit loszulegen?</h2>
          <p className="text-xl mb-8 text-red-100">
            Reichen Sie noch heute eine Schadenmeldung ein oder buchen Sie einen Transporter
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => onNavigate('damage-report')}
            >
              Schadenmeldung einreichen
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-transparent text-white border-white hover:bg-white/10"
              onClick={() => onNavigate('truck-rental')}
            >
              Transporter buchen
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-muted-foreground py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 AutoRepair Pro. Alle Rechte vorbehalten.</p>
          <p className="mt-2">Professionelle Karosseriereparatur und Transporter-Vermietung in der Schweiz</p>
        </div>
      </footer>
    </div>
  );
}