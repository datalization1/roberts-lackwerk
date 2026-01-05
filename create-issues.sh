#!/usr/bin/env bash
set -euo pipefail

# Optional: Wenn du nicht im Repo-Ordner bist, setze REPO explizit:
# export REPO="owner/repo"
REPO_FLAG=""
if [[ -n "${REPO:-}" ]]; then
  REPO_FLAG="--repo $REPO"
fi

echo "==> Repo: ${REPO:-"(current directory repo)"}"
echo "==> Ensuring labels exist..."

ensure_label () {
  local label="$1"
  if ! gh label list $REPO_FLAG --limit 500 | awk '{print $1}' | grep -qx "$label"; then
    gh label create $REPO_FLAG "$label" --description "auto" >/dev/null
    echo "  + created label: $label"
  else
    echo "  = label exists: $label"
  fi
}

# Labels (wie empfohlen)
labels=(
  "epic:foundation"
  "epic:public"
  "epic:admin"
  "epic:backend"
  "epic:payments"
  "epic:email"
  "epic:files"
  "epic:invoices"
  "epic:security"
  "epic:dsgo"
  "epic:testing"
  "epic:deploy"
)

for l in "${labels[@]}"; do
  ensure_label "$l"
done

echo "==> Creating issues (in order)..."
echo "    Hinweis: Beim 2. Run entstehen Duplikate. (Labels sind safe.)"

create_issue () {
  local title="$1"
  local labels_csv="$2"
  local body="$3"

  # gh issue create nimmt --label mehrfach oder comma-separated.
  gh issue create $REPO_FLAG \
    --title "$title" \
    --label "$labels_csv" \
    --body "$body" >/dev/null

  echo "  + $title"
}

# ---------------------------
# EPIC 0 — Foundation
# ---------------------------
create_issue "[Foundation] Projektstruktur & Konventionen festlegen" "epic:foundation" \
"**Tasks**
- [ ] Ordnerstruktur definieren (public/admin/shared/lib/api)
- [ ] Naming Conventions festlegen
- [ ] ESLint/Prettier konfigurieren
- [ ] Tailwind + shadcn/ui Setup prüfen

**Akzeptanzkriterien**
- Build läuft clean
- Lint/Format fixiert reproduzierbar
"

create_issue "[Foundation] Gemeinsame Types/Enums aus Doku ableiten" "epic:foundation" \
"**Tasks**
- [ ] Interfaces: Customer, Booking, DamageReport, Invoice, Vehicle
- [ ] Enums: Status, Fahrzeugtypen, Versicherungen, kmPakete, VAT-Rates
- [ ] Zentrale Konstanten-Datei anlegen

**Akzeptanzkriterien**
- Kein Copy/Paste der Typen quer durchs Projekt
- Types werden in Forms/Admin wiederverwendet
"

create_issue "[Foundation] ENV-Konzept vorbereiten (DEV/PROD)" "epic:foundation" \
"**Tasks**
- [ ] .env.example erstellen (Stripe, SMTP, API, DB, JWT)
- [ ] ENV-Loader/Validation (z.B. zod optional)
- [ ] Dokumentation für lokale Entwicklung

**Akzeptanzkriterien**
- Projekt läuft mit minimalem Setup
- Fehlende ENV Variablen werden klar gemeldet
"

# ---------------------------
# EPIC 1 — Public Area
# ---------------------------
create_issue "[Public] Navigation & Footer finalisieren" "epic:public" \
"**Tasks**
- [ ] Active State korrekt
- [ ] Mobile Burger Menü + Auto-Close
- [ ] Footer Links (Impressum/Datenschutz/AGB placeholders)

**Akzeptanzkriterien**
- Mobile/desktop funktionieren gemäss Doku
"

create_issue "[Public] LandingPage implementieren & CTA-Routing" "epic:public" \
"**Tasks**
- [ ] Hero + CTA Buttons (Schadenmeldung/Vermietung)
- [ ] Service Cards klickbar
- [ ] Responsive Check

**Akzeptanzkriterien**
- Navigation führt zu korrekten Screens
"

create_issue "[Public] DamageReport Wizard – Grundgerüst (5 Steps)" "epic:public" \
"**Tasks**
- [ ] Wizard Shell (Progressbar, Back/Next)
- [ ] Step Jump / Navigation
- [ ] State Persistenz zwischen Steps

**Akzeptanzkriterien**
- Daten bleiben erhalten beim Zurück/Weiter
- Schrittwechsel ist robust
"

create_issue "[Public] DamageReport Step 1 – Fahrzeugdetails + CH Validierung" "epic:public" \
"**Tasks**
- [ ] Pflichtfelder: Marke, Modell, Kennzeichen, Erstzulassung, VIN, Kilometerstand
- [ ] Optional: Farbe
- [ ] Validierung: Kennzeichen Format (ZH 12345), VIN plausibel

**Akzeptanzkriterien**
- Fehler werden pro Feld angezeigt
- Kein Next möglich bei invaliden Pflichtfeldern
"

create_issue "[Public] DamageReport Step 2 – Personendaten + CH Validierung" "epic:public" \
"**Tasks**
- [ ] Pflichtfelder: Name, E-Mail, Telefon, Adresse, PLZ, Ort
- [ ] Optional: Firma
- [ ] Validierung: E-Mail, +41 Telefonformat, PLZ 4-stellig

**Akzeptanzkriterien**
- Formate gemäss Doku umgesetzt
"

create_issue "[Public] DamageReport Step 3 – Versicherungsdetails" "epic:public" \
"**Tasks**
- [ ] Auswahl Versicherung (inkl. 'Andere')
- [ ] Pflichtfelder: Gesellschaft, Policennummer
- [ ] Optional: Schadennummer, Eigenbeteiligung, Notizen

**Akzeptanzkriterien**
- Daten werden im Review korrekt angezeigt
"

create_issue "[Public] DamageReport Step 4 – Unfalldetails + Upload UI" "epic:public,epic:files" \
"**Tasks**
- [ ] Pflichtfelder: Unfalldatum, Unfallort, Beschreibung (min 20 Zeichen)
- [ ] Schadenart Auswahl
- [ ] Betroffene Teile Multi-Select
- [ ] Upload UI: Fotos, Skizze, Polizeibericht (noch ohne Backend möglich)

**Akzeptanzkriterien**
- Uploads können ausgewählt/entfernt werden
- Validierung greift korrekt
"

create_issue "[Public] DamageReport Step 5 – Review & Submit Flow (Mock)" "epic:public" \
"**Tasks**
- [ ] Review Ansicht: alle Sektionen gemäss Doku
- [ ] 'Bearbeiten' springt zum passenden Step
- [ ] Submit erzeugt SM-ID (Mock)
- [ ] Success Screen

**Akzeptanzkriterien**
- SM-ID wird angezeigt
- Datensatz erscheint später im Admin (zunächst Mock)
"

create_issue "[Public] TruckBooking Wizard – Grundgerüst (5 Steps)" "epic:public" \
"**Tasks**
- [ ] Wizard Shell + Persistenz
- [ ] Step Jump möglich

**Akzeptanzkriterien**
- Wizard fühlt sich wie DamageReport gleich an
"

create_issue "[Public] TruckBooking Step 1 – Mietdetails & Preislogik" "epic:public" \
"**Tasks**
- [ ] Fahrzeugauswahl (small/medium/large) mit Preisen
- [ ] Datum/Time Pickers
- [ ] Tage berechnen + Mindestmietdauer 1 Tag
- [ ] kmPakete + Preisupdate
- [ ] Verfügbarkeit vorerst Mock

**Akzeptanzkriterien**
- Preis ändert live & korrekt
- Keine ungültigen Datumsranges möglich
"

create_issue "[Public] TruckBooking Step 2 – Extras & Versicherung (Live Update)" "epic:public" \
"**Tasks**
- [ ] Extras Multi-Select + Preise
- [ ] Versicherung basic/full/premium + Preis/Tag
- [ ] Gesamtsumme aktualisiert live

**Akzeptanzkriterien**
- Ausgewählte Extras erscheinen im Review korrekt
"

create_issue "[Public] TruckBooking Step 3 – Kundendaten + Führerschein Regeln" "epic:public,epic:dsgo" \
"**Tasks**
- [ ] Führerschein Felder + Validierung (≥1 Jahr alt, gültig bis)
- [ ] Mindestalter 21 (Geburtsdatum)
- [ ] Personendaten + CH Validierungen (+41, PLZ)
- [ ] AGB & Datenschutz Checkbox Pflicht

**Akzeptanzkriterien**
- Buchung nicht fortsetzbar ohne Consent
"

create_issue "[Public] TruckBooking Step 4 – Review inkl. MwSt 7.7%" "epic:public" \
"**Tasks**
- [ ] Kostenaufstellung: Miete, km, Extras, Versicherung
- [ ] MwSt 7.7% ausweisen
- [ ] Gesamtpreis prominent

**Akzeptanzkriterien**
- Zahlen stimmen (inkl. Rundung)
"

create_issue "[Public] TruckBooking Step 5 – Payment UI vorbereiten (placeholder)" "epic:public,epic:payments" \
"**Tasks**
- [ ] Payment Step Screen vorbereiten (ohne Stripe)
- [ ] Erfolgs-/Fehlerstates UI

**Akzeptanzkriterien**
- Flow ist end-to-end klickbar (noch Mock)
"

# ---------------------------
# EPIC 2 — Admin (zunächst Mock)
# ---------------------------
create_issue "[Admin] AdminLogin + Session Handling (Frontend)" "epic:admin,epic:security" \
"**Tasks**
- [ ] Login/Logout
- [ ] Session Speicherung (Übergangslösung)
- [ ] Guard für Admin Screens

**Akzeptanzkriterien**
- Admin Page nur nach Login erreichbar
"

create_issue "[Admin] AdminPage Layout + Tabs + Statistik-Karten (Mock)" "epic:admin" \
"**Tasks**
- [ ] Tabs gemäss Doku (6 Bereiche)
- [ ] Statistik Cards oben (Mock Zahlen)
- [ ] Basic Layout & Responsiveness

**Akzeptanzkriterien**
- Navigation zwischen Tabs stabil
"

create_issue "[Admin] Schadenmeldungen: Liste/Filter/Suche/Detail-Modal (Mock)" "epic:admin" \
"**Tasks**
- [ ] Tabelle mit Spalten gemäss Doku
- [ ] Filter nach Status
- [ ] Suche nach ID/Kunde/Fahrzeug/Versicherung
- [ ] Detail-Modal mit allen Daten

**Akzeptanzkriterien**
- Modal zeigt vollständige Schadenmeldung
"

create_issue "[Admin] Schadenmeldungen: Bearbeiten-Dialog (Mock)" "epic:admin" \
"**Tasks**
- [ ] Status ändern
- [ ] Kostenschätzung
- [ ] Reparaturdatum
- [ ] Notizen
- [ ] 'Rechnung erstellen' Hook (placeholder)

**Akzeptanzkriterien**
- Änderungen werden im UI reflektiert
"

create_issue "[Admin] Buchungen: Kalenderansicht + Detail-Modal (Mock)" "epic:admin" \
"**Tasks**
- [ ] Kalender (Monat/Woche/Tag/Liste) oder zunächst Monat+Liste
- [ ] Farb-Kodierung nach Status
- [ ] Detail-Modal: Kunde, Fahrzeug, Zeitraum, Payment, Extras

**Akzeptanzkriterien**
- Klick auf Booking öffnet Modal zuverlässig
"

create_issue "[Admin] Buchungen: Manuelle Buchung (CustomerSearchDialog) (Mock)" "epic:admin" \
"**Tasks**
- [ ] Kunde suchen (Name/E-Mail/Tel)
- [ ] neuen Kunden anlegen (Schnellformular)
- [ ] Buchungsformular starten

**Akzeptanzkriterien**
- Manuelle Buchung kann gespeichert werden (Mock)
"

create_issue "[Admin] Fahrzeugverwaltung: CRUD UI + Wartung (Mock)" "epic:admin" \
"**Tasks**
- [ ] Fahrzeuge Grid gemäss Doku
- [ ] Add/Edit Form
- [ ] Status setzbar (available/rented/maintenance/out-of-service)
- [ ] Wartungshistorie placeholder

**Akzeptanzkriterien**
- Fahrzeugdaten werden korrekt angezeigt/bearbeitet
"

create_issue "[Admin] Kundenverwaltung: CRM UI + Historie Tabs (Mock)" "epic:admin" \
"**Tasks**
- [ ] Kundenliste + Filter Quelle
- [ ] Suche (Name/E-Mail/Tel/ID/Firma)
- [ ] Detail View: Schadenmeldungen/Buchungen/Rechnungen Tabs

**Akzeptanzkriterien**
- Historie ist verknüpft (Mock IDs reichen)
"

create_issue "[Admin] Rechnungen: Liste + InvoiceGenerator UI (Mock)" "epic:admin,epic:invoices" \
"**Tasks**
- [ ] Liste + Filter Status/Typ
- [ ] Generator: Positionen, Menge, Einheit, VAT-Satz, Rabatt
- [ ] Total Berechnung

**Akzeptanzkriterien**
- VAT Sätze: 0/2.5/7.7/8.1 verfügbar
- Gesamtsumme korrekt
"

create_issue "[Admin] Einstellungen: UI für Firmendaten/Preise/Stripe/SMTP (Mock)" "epic:admin" \
"**Tasks**
- [ ] Firmendaten + Logo
- [ ] Öffnungszeiten + Specials
- [ ] Preise/Konditionen
- [ ] Stripe Keys + Webhook URL
- [ ] SMTP + Mail Templates Placeholder
- [ ] Benachrichtigungen Toggles

**Akzeptanzkriterien**
- Settings lassen sich speichern (Mock)
"

# ---------------------------
# EPIC 3 — Backend & DB
# ---------------------------
create_issue "[Backend] Datenbank-Schema (PostgreSQL) implementieren" "epic:backend" \
"**Tasks**
- [ ] Tabellen für Customer/Booking/DamageReport/Invoice/Vehicle
- [ ] Indizes (Status, Datum, CustomerId)
- [ ] Migrationsstrategie festlegen

**Akzeptanzkriterien**
- Schema entspricht Doku-Datenstrukturen
"

create_issue "[Backend] Auth: Admin Login + Rollen (Basis)" "epic:backend,epic:security" \
"**Tasks**
- [ ] Secure Login (kein hardcoded admin/admin123)
- [ ] JWT/Session
- [ ] Roles: admin/manager/employee

**Akzeptanzkriterien**
- Admin Endpoints geschützt
"

create_issue "[Backend] API: Customers CRUD" "epic:backend" \
"**Tasks**
- [ ] Create/Read/Update/Delete
- [ ] Suche/Filter (optional)

**Akzeptanzkriterien**
- Admin UI kann Customers laden/speichern
"

create_issue "[Backend] API: Vehicles CRUD + Status" "epic:backend" \
"**Tasks**
- [ ] CRUD + Status
- [ ] Wartungsfelder (nextService)

**Akzeptanzkriterien**
- VehicleManagement kann produktiv arbeiten
"

create_issue "[Backend] API: DamageReports CRUD + Workflow" "epic:backend" \
"**Tasks**
- [ ] Create (Public), Read/List/Update (Admin)
- [ ] Status Workflow (pending/in-progress/completed/cancelled)

**Akzeptanzkriterien**
- Schadenmeldung aus Public erscheint im Admin
"

create_issue "[Backend] API: Bookings CRUD + Availability Check" "epic:backend" \
"**Tasks**
- [ ] CRUD
- [ ] Overlap-Prüfung je Fahrzeug/Zeitraum

**Akzeptanzkriterien**
- Keine Doppelbuchung möglich
"

create_issue "[Backend] API: Invoices CRUD + Nummernlogik" "epic:backend,epic:invoices" \
"**Tasks**
- [ ] CRUD
- [ ] Nummernlogik RE-YYYY-XXX
- [ ] relatedId (BUC/SM)

**Akzeptanzkriterien**
- Rechnungsnummern eindeutig, fortlaufend
"

# ---------------------------
# EPIC 4 — Files
# ---------------------------
create_issue "[Files] Storage integrieren (Fotos/Dokumente)" "epic:files,epic:backend" \
"**Tasks**
- [ ] Storage wählen (z.B. S3/Supabase Storage)
- [ ] Upload Endpoint + Limits (Size/Type)
- [ ] Speicherung URLs im DamageReport
- [ ] Konzept Virenscan (mind. Roadmap)

**Akzeptanzkriterien**
- Uploads werden persistent gespeichert
"

create_issue "[Files] DamageReport Uploads an Backend anbinden" "epic:files,epic:public,epic:backend" \
"**Tasks**
- [ ] Upload im Step 4 → Storage
- [ ] URLs im DamageReport speichern
- [ ] Admin Modal zeigt Dateien/Links

**Akzeptanzkriterien**
- Dateien sind im Admin sichtbar & abrufbar
"

# ---------------------------
# EPIC 5 — Payments (Stripe)
# ---------------------------
create_issue "[Payments] Stripe Setup (Test Mode) + PaymentIntent Flow" "epic:payments,epic:backend" \
"**Tasks**
- [ ] Stripe Keys (Test) + Konfiguration
- [ ] PaymentIntent Endpoint
- [ ] Betrag aus Booking berechnen serverseitig

**Akzeptanzkriterien**
- PaymentIntent kann erstellt werden
"

create_issue "[Payments] Stripe Webhooks: paid/refunded → Booking Update" "epic:payments,epic:backend" \
"**Tasks**
- [ ] Webhook Endpoint + Signature Verify
- [ ] Update booking.paymentStatus + transactionId
- [ ] Error Handling + Retries

**Akzeptanzkriterien**
- Zahlung aktualisiert Booking Status zuverlässig
"

create_issue "[Payments] Public PaymentStep an Stripe anbinden" "epic:payments,epic:public" \
"**Tasks**
- [ ] Stripe Elements integrieren
- [ ] Fehlerfälle (3DS, declined, timeout)
- [ ] Success Screen + Booking-ID

**Akzeptanzkriterien**
- End-to-end Zahlung im Testmodus möglich
"

# ---------------------------
# EPIC 6 — E-Mail (SMTP + Templates)
# ---------------------------
create_issue "[Email] SMTP Integration + Template System" "epic:email,epic:backend" \
"**Tasks**
- [ ] SMTP Config
- [ ] Templates mit Platzhaltern (kundenname, buchungsnummer, etc.)
- [ ] Versand-Queue/Retry Konzept (leicht)

**Akzeptanzkriterien**
- Testmail kann versendet werden
"

create_issue "[Email] Automail: Schadenmeldung Bestätigung" "epic:email" \
"**Tasks**
- [ ] Trigger bei DamageReport create
- [ ] Template + Platzhalter

**Akzeptanzkriterien**
- Kunde erhält Bestätigungsmail
"

create_issue "[Email] Automail: Buchungsbestätigung + PDF Rechnung" "epic:email,epic:invoices" \
"**Tasks**
- [ ] Trigger nach erfolgreicher Zahlung
- [ ] PDF anhängen
- [ ] Template

**Akzeptanzkriterien**
- Mail mit PDF kommt an
"

create_issue "[Email] Admin Notifications (Buchung/Schaden/Zahlung)" "epic:email" \
"**Tasks**
- [ ] Toggles aus Settings respektieren
- [ ] Empfänger-Liste verwenden

**Akzeptanzkriterien**
- Admin erhält Mails gemäss Konfiguration
"

# ---------------------------
# EPIC 7 — Invoices (PDF + Mahnwesen)
# ---------------------------
create_issue "[Invoices] PDF-Generator produktiv" "epic:invoices" \
"**Tasks**
- [ ] PDF Layout: Logo, Positionen, VAT, Total
- [ ] Download/Preview im Admin
- [ ] Speicherung/Link

**Akzeptanzkriterien**
- PDF entspricht Rechnungskopf & Summen stimmen
"

create_issue "[Invoices] Mahnwesen Regeln (7/14/21 Tage) implementieren" "epic:invoices,epic:backend" \
"**Tasks**
- [ ] Overdue Detection
- [ ] Mahnstufen + Versand (E-Mail)
- [ ] Logging/History

**Akzeptanzkriterien**
- Mahnstufe wechselt korrekt nach Tagen
"

create_issue "[Invoices] Zahlungshistorie + 'Als bezahlt markieren'" "epic:invoices" \
"**Tasks**
- [ ] paymentDate/paymentMethod pflegen
- [ ] Status paid/unpaid/overdue korrekt setzen

**Akzeptanzkriterien**
- Admin kann Rechnungen korrekt abschliessen
"

# ---------------------------
# EPIC 8 — DSGVO & Security Hardening
# ---------------------------
create_issue "[Security] Passwortregeln + Rate Limit + Audit Log" "epic:security,epic:backend" \
"**Tasks**
- [ ] Passwort Policy
- [ ] Rate limiting (Login/API)
- [ ] Audit Log (wer hat was geändert)

**Akzeptanzkriterien**
- Security Basics sind umgesetzt
"

create_issue "[DSGVO] Consent/Cookie Banner + Datenexport + Lösch/Anonymize" "epic:dsgo,epic:backend" \
"**Tasks**
- [ ] Cookie Banner + Consent Speicherung
- [ ] Datenauskunft Export
- [ ] Löschen/Anonymisieren Kunde

**Akzeptanzkriterien**
- DSGVO Workflows ausführbar
"

# ---------------------------
# EPIC 9 — Testing & Deployment
# ---------------------------
create_issue "[Testing] Unit/Integration Test Setup" "epic:testing" \
"**Tasks**
- [ ] Unit Tests (Logik)
- [ ] Integration Tests (API)
- [ ] CI Integration

**Akzeptanzkriterien**
- Tests laufen in CI durch
"

create_issue "[Testing] E2E Tests: Schadenmeldung & Buchung" "epic:testing" \
"**Tasks**
- [ ] E2E Flow DamageReport
- [ ] E2E Flow TruckBooking + Payment (Test)
- [ ] Cross-browser basics

**Akzeptanzkriterien**
- Kritische Flows sind automatisch getestet
"

create_issue "[Deploy] Monitoring (Sentry) + Analytics + Uptime" "epic:deploy" \
"**Tasks**
- [ ] Sentry / Error Tracking
- [ ] Analytics (optional)
- [ ] Uptime Monitoring

**Akzeptanzkriterien**
- Errors werden zentral erfasst
"

create_issue "[Deploy] CI/CD Pipeline + Production ENV" "epic:deploy" \
"**Tasks**
- [ ] Build/Deploy Pipeline
- [ ] Secrets/ENV in GitHub Settings
- [ ] Staging/Prod Strategie (optional)

**Akzeptanzkriterien**
- Deploy ist automatisiert
"

create_issue "[Deploy] Go-Live Checklist (Smoke Tests)" "epic:deploy" \
"**Tasks**
- [ ] Smoke Test Liste definieren
- [ ] Durchführung dokumentieren
- [ ] Rollback Plan

**Akzeptanzkriterien**
- Release kann kontrolliert erfolgen
"

echo "==> Done. Issues created."
