# Robert's Lackwerk SPA (React/Vite)

React/TypeScript + Tailwind SPA für Landing, Schaden-Wizard, Buchungs-Wizard.

## Setup
```bash
cd spa
npm install
npm run dev
```

## Env
Legen Sie `.env` oder `.env.local` an:
```
VITE_API_URL=http://localhost:8000/api
```

## Pages/Routes
- `/` Startseite
- `/damage-report` Schaden-Wizard (5 Schritte, Upload optional)
- `/truck-rental` Buchungs-Wizard (5 Schritte, Preis lokal, Booking-POST)
- `/about` Über uns

## API Nutzung
- Schadenmeldung: POST `/api/damage-reports/`, danach optional Upload `/api/damage-reports/<id>/upload-photo/`
- Buchung: POST `/api/bookings/` (Status pending), Stripe-Flow folgt serverseitig
- Meta-Optionen: GET `/api/meta/options/` (KM/Insurance/Extras)

## Styling
Tailwind + eigene Farb-Extension in `tailwind.config.js`, globale Styles `src/index.css`.

## Nächste Schritte
- Stripe PaymentIntent integrieren (Backend-Endpunkt + client secret) und im Schritt 5 Payment-Formular anbinden.
- Fahrzeuge/Transporter aus API listen statt Platzhalter-ID.
- Fehlerhandling/Validation clientseitig verschärfen; Status-/Fehlermeldungen UI verbessern.
- Auth für Admin-Bereich hinzufügen und Admin-Views anbinden (Folge-Block). 
