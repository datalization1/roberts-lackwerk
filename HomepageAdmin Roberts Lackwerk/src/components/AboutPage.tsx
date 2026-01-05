import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MapPin, Phone, Mail, Clock, Users, Award, Wrench, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AboutPageProps {
  onBack: () => void;
}

export function AboutPage({ onBack }: AboutPageProps) {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl mb-4">Über uns</h1>
          <p className="text-xl text-muted-foreground">
            Ihr Partner für professionelle Karosseriereparaturen und Transporter-Vermietung
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-6 w-6 text-primary" />
                Unser Unternehmen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Willkommen bei AutoRepair Pro – Ihrer Fachwerkstatt für hochwertige Karosseriereparaturen 
                und zuverlässige Transporter-Vermietung in der Region.
              </p>
              <p>
                Seit vielen Jahren sind wir Ihr kompetenter Ansprechpartner, wenn es um die fachgerechte 
                Reparatur von unfallbeschädigten Fahrzeugen geht. Unser erfahrenes Team besteht aus 
                qualifizierten Karosseriebauern und Autolackierern, die mit modernster Technik und 
                höchster Präzision arbeiten.
              </p>
              <p>
                Ergänzend zu unserer Werkstatt bieten wir Ihnen einen zuverlässigen Transporter-Verleih 
                für Umzüge und Transporte jeder Art. Unsere Fahrzeuge werden regelmässig gewartet und 
                stehen Ihnen in verschiedenen Grössen zur Verfügung.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                Unsere Werte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h4 className="mb-1">Qualität</h4>
                  <p className="text-sm text-muted-foreground">
                    Höchste Präzision bei jeder Reparatur
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h4 className="mb-1">Zuverlässigkeit</h4>
                  <p className="text-sm text-muted-foreground">
                    Termintreue und transparente Kommunikation
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h4 className="mb-1">Erfahrung</h4>
                  <p className="text-sm text-muted-foreground">
                    Langjährige Expertise im Karosseriebau
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl mb-6">Unsere Leistungen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Karosseriereparaturen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Unfallschadenbehebung</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Delle und Kratzer entfernen</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Schweissarbeiten</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Rahmenrichtarbeiten</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Autolackierung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Komplettlackierungen</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Spot-Repair (Teillackierung)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Farbton-Anpassung</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Lackversiegelung</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Versicherungsabwicklung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Direktabrechnung mit Versicherungen</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Schadengutachten</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Kostenvoranschläge</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Beratung und Unterstützung</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transporter-Vermietung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Verschiedene Grössen (10m³ - 40m³)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Flexible Mietzeiten</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Zusatzausrüstung verfügbar</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Regelmässig gewartet</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Projekt-Galerie */}
        <div className="mb-12">
          <h2 className="text-3xl mb-6">Unsere Projekte</h2>
          <p className="text-muted-foreground mb-8">
            Einblick in unsere bisherigen Reparaturarbeiten – von kleineren Lackierungen bis zu kompletten Karosseriearbeiten
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="overflow-hidden group">
              <div className="relative h-64 overflow-hidden bg-muted">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1675034743126-0f250a5fee51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBib2R5JTIwcmVwYWlyJTIwd29ya3Nob3B8ZW58MXx8fHwxNzY0MjU0ODI5fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Karosseriereparatur in der Werkstatt"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="pt-4">
                <h3 className="mb-2">Komplette Frontschaden-Reparatur</h3>
                <p className="text-sm text-muted-foreground">
                  BMW 5er Serie – Vollständige Wiederherstellung nach Frontalzusammenstoss
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group">
              <div className="relative h-64 overflow-hidden bg-muted">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1744761806941-049f821d0bd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBwYWludCUyMGpvYiUyMHJlZHxlbnwxfHx8fDE3NjQyNjA3NTl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Professionelle Autolackierung"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="pt-4">
                <h3 className="mb-2">Komplettlackierung in Wunschfarbe</h3>
                <p className="text-sm text-muted-foreground">
                  Audi A4 – Neulackierung mit Metallic-Finish und Versiegelung
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group">
              <div className="relative h-64 overflow-hidden bg-muted">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1678472156730-2d80e958b9a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYW1hZ2VkJTIwY2FyJTIwYmVmb3JlJTIwcmVwYWlyfGVufDF8fHx8MTc2NDI2MDc2MHww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Schadensbegutachtung"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="pt-4">
                <h3 className="mb-2">Seitliche Aufprallschaden</h3>
                <p className="text-sm text-muted-foreground">
                  Mercedes C-Klasse – Karosseriearbeiten und Teillackierung
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group">
              <div className="relative h-64 overflow-hidden bg-muted">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1665051037302-76492022b6d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBkZW50JTIwcmVwYWlyfGVufDF8fHx8MTc2NDE3Njk3OHww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Dellenentfernung"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="pt-4">
                <h3 className="mb-2">Dellenentfernung ohne Lackierung</h3>
                <p className="text-sm text-muted-foreground">
                  VW Golf – Hagelschaden-Beseitigung mit Smart Repair
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group">
              <div className="relative h-64 overflow-hidden bg-muted">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1762049297259-f9fdd460ec99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvJTIwYm9keSUyMHBhaW50fGVufDF8fHx8MTc2NDI2MDc2MXww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Lackierarbeiten"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="pt-4">
                <h3 className="mb-2">Spot-Repair Türlackierung</h3>
                <p className="text-sm text-muted-foreground">
                  Toyota RAV4 – Parkschaden-Reparatur mit Farbton-Anpassung
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group">
              <div className="relative h-64 overflow-hidden bg-muted">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1730068001928-f0983eb1ce94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBwb2xpc2hpbmclMjBkZXRhaWx8ZW58MXx8fHwxNzY0MjYwNzYxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Fahrzeug-Politur"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="pt-4">
                <h3 className="mb-2">Premium-Aufbereitung & Versiegelung</h3>
                <p className="text-sm text-muted-foreground">
                  Porsche 911 – Keramik-Versiegelung nach Lackierung
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl mb-6">Kontakt</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Adresse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>AutoRepair Pro GmbH</p>
                <p>Musterstrasse 123</p>
                <p>8000 Zürich</p>
                <p className="mt-2">Schweiz</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Öffnungszeiten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex justify-between">
                  <span>Montag - Freitag:</span>
                  <span>07:30 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Samstag:</span>
                  <span>08:00 - 12:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Sonntag:</span>
                  <span>Geschlossen</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Telefon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">
                  <a href="tel:+41443334455" className="text-primary hover:underline">
                    +41 44 333 44 55
                  </a>
                </p>
                <p className="text-sm text-muted-foreground">
                  Montag - Freitag: 07:30 - 18:00<br />
                  Samstag: 08:00 - 12:00
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  E-Mail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">
                  <a href="mailto:info@autorepair-pro.ch" className="text-primary hover:underline">
                    info@autorepair-pro.ch
                  </a>
                </p>
                <p className="text-sm text-muted-foreground">
                  Wir antworten in der Regel innerhalb von 24 Stunden
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="bg-red-950 border-primary">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl mb-2">Haben Sie Fragen?</h3>
                <p className="text-muted-foreground">
                  Kontaktieren Sie uns – wir beraten Sie gerne!
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <a href="tel:+41443334455">Jetzt anrufen</a>
                </Button>
                <Button onClick={onBack}>
                  Zur Startseite
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
