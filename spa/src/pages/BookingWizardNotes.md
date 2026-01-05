Notizen für Booking-Wizard:
- Schritt 1 nutzt Transporter aus `/api/transporters/` und optional Fahrzeuge `/api/vehicles/`.
- Preisberechnung nutzt Transporterpreis (feld `preis_chf`) x Tage + km/Versicherung/Extras (Meta-API).
- POST `/api/bookings/` mit `transporter` ID und optional `vehicle`.
- Stripe fehlt: PaymentIntent-Endpunkt aufsetzen, dann im Schritt 5 Client-Secret nutzen.
