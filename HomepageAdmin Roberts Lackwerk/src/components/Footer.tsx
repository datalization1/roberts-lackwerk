import { MapPin, Phone, Mail, Clock, Settings, Linkedin, Instagram } from 'lucide-react';

type Page = 'home' | 'damage-report' | 'truck-rental' | 'about' | 'admin';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-border bg-black">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Über uns Sektion */}
          <div className="lg:col-span-1">
            <h3 className="mb-4">AutoRepair Pro</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ihr zuverlässiger Partner für professionelle Karosseriereparaturen und Transporter-Vermietung in der Schweiz.
            </p>
            <div className="space-y-4">
              <div>
                <h4 className="mb-3 text-sm">Folgen Sie uns</h4>
                <div className="flex gap-3">
                  <a
                    href="https://www.linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-card border border-border hover:bg-primary/10 hover:border-primary transition-all hover:scale-110"
                    title="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a
                    href="https://www.instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-card border border-border hover:bg-primary/10 hover:border-primary transition-all hover:scale-110"
                    title="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href="https://www.tiktok.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-card border border-border hover:bg-primary/10 hover:border-primary transition-all hover:scale-110"
                    title="TikTok"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </a>
                  <button
                    onClick={() => onNavigate('admin')}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-card border border-border opacity-40 hover:opacity-100 hover:bg-primary/10 hover:border-primary transition-all hover:scale-110"
                    title="Verwaltung"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Schnelllinks */}
          <div>
            <h4 className="mb-4">Schnelllinks</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Startseite
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('damage-report')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Schadenmeldung
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('truck-rental')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Transporter mieten
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Über uns
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Karosseriereparatur
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Autolackierung
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Versicherungsabwicklung
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('truck-rental')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Fahrzeugvermietung
                </button>
              </li>
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h4 className="mb-4">Kontakt</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-muted-foreground">
                  Musterstrasse 123<br />
                  8000 Zürich
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="tel:+41443334455" className="text-muted-foreground hover:text-primary transition-colors">
                  +41 44 333 44 55
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="mailto:info@autorepair-pro.ch" className="text-muted-foreground hover:text-primary transition-colors">
                  info@autorepair-pro.ch
                </a>
              </li>
            </ul>
          </div>

          {/* Öffnungszeiten */}
          <div>
            <h4 className="mb-4">Öffnungszeiten</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Mo - Fr:</span>
                <span>07:30 - 18:00</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Samstag:</span>
                <span>08:00 - 12:00</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Sonntag:</span>
                <span className="text-muted-foreground">Geschlossen</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-card rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm">24/7 Notfall</span>
              </div>
              <a href="tel:+41791234567" className="text-sm text-primary hover:underline">
                +41 79 123 45 67
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; 2025 AutoRepair Pro GmbH. Alle Rechte vorbehalten.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Impressum
              </a>
              <span className="text-muted-foreground">•</span>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Datenschutz
              </a>
              <span className="text-muted-foreground">•</span>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                AGB
              </a>
              <span className="text-muted-foreground">•</span>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Cookie-Einstellungen
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
