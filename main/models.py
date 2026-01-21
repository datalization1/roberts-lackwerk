from django.db import models
from django.utils import timezone

# -----------------------------
# Schaden melden (DamageReport)
# -----------------------------
CAR_PART_CHOICES = [
    ("FRONT_BUMPER", "Frontstossstange"),
    ("REAR_BUMPER",  "Heckstossstange"),
    ("LEFT_DOOR",    "Linke Tür"),
    ("RIGHT_DOOR",   "Rechte Tür"),
    ("HOOD",         "Motorhaube"),
    ("TRUNK",        "Heckklappe"),
    ("FENDER_FL",    "Kotflügel vorne links"),
    ("FENDER_FR",    "Kotflügel vorne rechts"),
    ("ROOF",         "Dach"),
    ("OTHER",        "Sonstiges"),
]

# Für UI-Checkboxen (Codes ≠ Model-Choices zwingend; wir nutzen diese Liste in Forms)
DAMAGE_PART_CODES = [
    ("FRONT_BUMPER", "Frontstossstange"),
    ("REAR_BUMPER", "Heckstossstange"),
    ("FRONT_LEFT_DOOR", "Tür vorne links"),
    ("FRONT_RIGHT_DOOR", "Tür vorne rechts"),
    ("REAR_LEFT_DOOR", "Tür hinten links"),
    ("REAR_RIGHT_DOOR", "Tür hinten rechts"),
    ("FRONT_LEFT_FENDER", "Kotflügel vorne links"),
    ("FRONT_RIGHT_FENDER", "Kotflügel vorne rechts"),
    ("REAR_LEFT_FENDER", "Kotflügel hinten links"),
    ("REAR_RIGHT_FENDER", "Kotflügel hinten rechts"),
    ("HOOD", "Motorhaube"),
    ("TRUNK", "Heckklappe"),
    ("WINDSHIELD", "Frontscheibe"),
    ("REAR_WINDOW", "Heckscheibe"),
    ("SIDE_MIRROR_LEFT", "Seitenspiegel links"),
    ("SIDE_MIRROR_RIGHT", "Seitenspiegel rechts"),
    ("HEADLIGHT_LEFT", "Scheinwerfer links"),
    ("HEADLIGHT_RIGHT", "Scheinwerfer rechts"),
    ("TAILLIGHT_LEFT", "Rücklicht links"),
    ("TAILLIGHT_RIGHT", "Rücklicht rechts"),
    ("ROOF", "Dach"),
    ("WHEELS", "Felgen/Räder"),
    ("OTHER", "Sonstiges"),
]
DAMAGED_PART_CHOICES = DAMAGE_PART_CODES

# --- Versicherungen (global, vor der Klasse definieren) ---
INSURER_NO = "NO_INSURANCE"
INSURER_OTHER = "OTHER"
INSURER_CHOICES = [
    ("Allianz Suisse", "Allianz Suisse"),
    ("AXA", "AXA"),
    ("Baloise", "Baloise"),
    ("Mobiliar", "Die Mobiliar"),
    ("Generali", "Generali"),
    ("Helvetia", "Helvetia"),
    ("Zurich", "Zurich"),
    ("Vaudoise", "Vaudoise"),
    ("TCS", "TCS"),
    ("Simpego", "Simpego"),
    ("Smile", "Smile"),
    ("PostFinance", "PostFinance"),
    (INSURER_OTHER, "Andere"),
    (INSURER_NO, "Ohne Versicherung melden"),
]


# -----------------------------
# Kunden / Fahrzeuge / Rechnungen
# -----------------------------
class Customer(models.Model):
    SOURCE_CHOICES = [
        ("rental", "Transporter-Buchung"),
        ("damage-report", "Schadenmeldung"),
        ("manual", "Manuell"),
        ("both", "Beides"),
    ]

    first_name = models.CharField(max_length=80)
    last_name = models.CharField(max_length=80)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    address = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)
    company = models.CharField(max_length=120, blank=True)
    notes = models.TextField(blank=True)
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default="manual")
    created_date = models.DateField(auto_now_add=True)
    customer_since = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Vehicle(models.Model):
    VEHICLE_TYPES = [
        ("small", "Sprinter Klein"),
        ("medium", "Sprinter Mittel"),
        ("large", "Sprinter Gross"),
    ]
    VEHICLE_STATUSES = [
        ("available", "Verfügbar"),
        ("rented", "Vermietet"),
        ("maintenance", "In Wartung"),
        ("out-of-service", "Außer Betrieb"),
    ]

    type = models.CharField(max_length=10, choices=VEHICLE_TYPES)
    license_plate = models.CharField(max_length=20, unique=True)
    brand = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.PositiveIntegerField(null=True, blank=True)
    mileage = models.PositiveIntegerField(default=0)
    volume = models.DecimalField(max_digits=5, decimal_places=1, help_text="m³", null=True, blank=True)
    payload = models.PositiveIntegerField(help_text="kg", null=True, blank=True)
    features = models.JSONField(default=list, blank=True)
    daily_rate = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    vin = models.CharField(max_length=32, blank=True)
    insurance_number = models.CharField(max_length=64, blank=True)
    next_service = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=VEHICLE_STATUSES, default="available")
    photo = models.ImageField(upload_to="vehicle_photos/%Y/%m/%d/", null=True, blank=True)

    def __str__(self):
        return f"{self.brand} {self.model} ({self.license_plate})"


class Invoice(models.Model):
    INVOICE_STATUS = [
        ("unpaid", "Offen"),
        ("paid", "Bezahlt"),
        ("overdue", "Überfällig"),
        ("cancelled", "Storniert"),
    ]
    INVOICE_TYPES = [
        ("damage-report", "Schadenmeldung"),
        ("rental", "Vermietung"),
        ("other", "Sonstiges"),
    ]

    invoice_number = models.CharField(max_length=40, unique=True, null=True, blank=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="invoices")
    invoice_date = models.DateField(default=timezone.now)
    due_date = models.DateField(null=True, blank=True)
    items = models.JSONField(default=list, blank=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    vat_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=INVOICE_STATUS, default="unpaid")
    payment_date = models.DateField(null=True, blank=True)
    payment_method = models.CharField(max_length=30, blank=True)
    type = models.CharField(max_length=20, choices=INVOICE_TYPES, default="other")
    related_id = models.CharField(max_length=32, blank=True)
    notes = models.TextField(blank=True)
    public_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Rechnung {self.invoice_number or self.id} ({self.customer})"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self.invoice_number = self.generate_invoice_number()
        if not self.due_date and self.invoice_date:
            self.due_date = self.invoice_date + timezone.timedelta(days=30)
        return super().save(*args, **kwargs)

    @classmethod
    def generate_invoice_number(cls):
        today = timezone.localdate()
        year = today.year
        prefix = f"RE-{year}-"
        last = cls.objects.filter(invoice_number__startswith=prefix).order_by("-invoice_number").first()
        if last and last.invoice_number:
            try:
                last_counter = int(last.invoice_number.split("-")[-1])
            except Exception:
                last_counter = 0
        else:
            last_counter = 0
        return f"{prefix}{last_counter + 1:04d}"


# … oben bleibt alles
class DamageReport(models.Model):
    STATUS_CHOICES = [
        ("pending", "Ausstehend"),
        ("in_progress", "In Bearbeitung"),
        ("completed", "Abgeschlossen"),
        ("cancelled", "Storniert"),
    ]

    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="damage_reports",
    )
    # bestehend …
    first_name = models.CharField("Vorname", max_length=80, blank=True, null=True)
    last_name  = models.CharField("Nachname", max_length=80, blank=True, null=True)
    company_name = models.CharField("Firmenname", max_length=120, blank=True, null=True)

    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True)

    # 🚗 NEU nach Figma Step 1
    car_brand = models.CharField("Automarke", max_length=80, blank=True)
    car_model = models.CharField("Automodell", max_length=80, blank=True)
    vin       = models.CharField("Stammnummer (VIN)", max_length=32, blank=True)
    type_certificate_number = models.CharField("Typenscheinnummer", max_length=16, blank=True)
    registration_document = models.FileField("Fahrzeugausweis", upload_to="vehicle_docs/%Y/%m/%d/", blank=True, null=True)
    first_registration = models.DateField("Erstzulassung", null=True, blank=True)
    mileage = models.PositiveIntegerField("Kilometerstand", null=True, blank=True)

    # Schaden
    car_part = models.CharField(max_length=50, choices=CAR_PART_CHOICES, blank=True)  # ← war früher ohne blank
    # Mehrfachauswahl (Figma Checkbox-Liste)
    damaged_parts = models.JSONField("Beschädigte Teile", default=list, blank=True)
    affected_parts = models.JSONField("Betroffene Teile", default=list, blank=True)
    damage_type = models.CharField("Schadensart", max_length=50, blank=True)
    accident_date = models.DateField("Unfalldatum", null=True, blank=True)
    accident_location = models.CharField("Unfallort", max_length=200, blank=True)
    message = models.TextField(blank=True)

    # Adresse (Figma Step 2)
    address = models.CharField("Adresse", max_length=200, blank=True)

    # Versicherung (Figma Step 3)
    plate = models.CharField("Kontrollschild", max_length=16, blank=True)
    no_plate = models.BooleanField("Kontrollschild nicht bekannt", default=False)
    insurer = models.CharField("Versicherung", max_length=40, blank=True, choices=INSURER_CHOICES)
    other_insurer = models.CharField("Andere Versicherung", max_length=100, blank=True)
    policy_number = models.CharField("Policennummer", max_length=64, blank=True)

    # NEU: gemäss Figma (optional)
    accident_number = models.CharField("Schaden-/Unfallnummer", max_length=64, blank=True)
    insurer_contact = models.CharField("Versicherung Ansprechperson", max_length=120, blank=True)
    insurer_contact_phone = models.CharField("Telefon Kontaktperson", max_length=50, blank=True)
    insurer_contact_email = models.EmailField("E-Mail Kontaktperson", blank=True)
    other_party_involved = models.BooleanField(default=False)
    police_involved = models.BooleanField(default=False)
    documents = models.JSONField(default=list, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    admin_notes = models.TextField(blank=True)
    priority = models.CharField(
        max_length=20,
        choices=[
            ("low", "Niedrig"),
            ("normal", "Normal"),
            ("high", "Hoch"),
            ("urgent", "Dringend"),
        ],
        default="normal",
    )
    estimated_cost_chf = models.DecimalField("Kostenschätzung (CHF)", max_digits=10, decimal_places=2, default=0)
    repair_start = models.DateField("Reparaturbeginn", null=True, blank=True)
    repair_end = models.DateField("Reparaturende", null=True, blank=True)
    assigned_mechanic = models.CharField("Zugewiesener Mechaniker", max_length=120, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)


class DamagePhoto(models.Model):
    """Ein hochgeladenes Foto zu einem Schadenfall."""
    report = models.ForeignKey(
        DamageReport,
        related_name="photos",
        on_delete=models.CASCADE,
        verbose_name="Zugehöriger Report",
    )
    image       = models.ImageField(upload_to="damage_photos/%Y/%m/%d/")
    file_url    = models.URLField(blank=True, default="")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        display = getattr(self.report, "display_name", None) or f"{(self.report.first_name or '').strip()} {(self.report.last_name or '').strip()}".strip()
        return f"Foto für {display or self.report_id} ({self.uploaded_at:%Y-%m-%d %H:%M})"

    @property
    def public_url(self):
        """Gibt eine nutzbare URL zurück (S3 oder lokal)."""
        if self.file_url:
            return self.file_url
        if self.image:
            try:
                return self.image.url
            except Exception:
                return ""
        return ""

    class Meta:
        ordering = ["-uploaded_at"]


# -----------------------------
# Mietfahrzeuge / Buchungen
# -----------------------------

TIME_SLOTS = [
    ("MORNING",   "08:00 - 12:00"),
    ("AFTERNOON", "13:00 - 17:00"),
    ("FULLDAY",   "08:00 - 17:00"),
]


class Transporter(models.Model):
    BUCHUNG_OPTIONEN = [
        ('vormittag', 'Vormittag'),
        ('nachmittag', 'Nachmittag'),
        ('ganztag', 'Ganztag'),
    ]

    name         = models.CharField(max_length=100)
    kennzeichen  = models.CharField(max_length=20, unique=True)
    farbe = models.CharField("Farbe", max_length=50, blank=True)
    preis_chf = models.DecimalField("Preis (CHF)", max_digits=7, decimal_places=2, default=0)
    verfuegbar_ab = models.DateField()

    # Hinweis: Dein Template verwendet stellenweise "transporter.image".
    # Um keine Migration/Template-Änderung zu erzwingen, behalten wir 'bild'
    # und bieten eine Property 'image' als Alias an.
    bild = models.ImageField(
        upload_to="transporter_bilder/",
        blank=True,
        null=True,
        help_text="Bild des Transporters hochladen"
    )
    def __str__(self):
        return self.name

    # (optional) Beschreibung – falls im Template genutzt
    description = models.TextField(blank=True, default="")

    buchung = models.CharField(
        max_length=20,
        choices=BUCHUNG_OPTIONEN,
        blank=True,
        null=True,
        help_text="Verfügbare Buchungsoption"
    )

    def __str__(self):
        return f"{self.name} ({self.kennzeichen})"

    @property
    def image(self):
        """Alias, damit Templates weiterhin 'transporter.image' nutzen können."""
        return self.bild


class Booking(models.Model):
    STATUS_CHOICES = [
        ("pending", "Ausstehend"),
        ("confirmed", "Bestätigt"),
        ("active", "In Vermietung"),
        ("completed", "Abgeschlossen"),
        ("cancelled", "Storniert"),
    ]

    TIME_SLOTS = [
        ("MORNING", "Vormittag"),
        ("AFTERNOON", "Nachmittag"),
        ("FULLDAY", "Ganzer Tag"),
    ]

    INSURANCE_CHOICES = [
        ("basic", "Basis"),
        ("full", "Vollkasko"),
        ("premium", "Premium"),
    ]

    KM_CHOICES = [
        ("100km", "100 km"),
        ("200km", "200 km"),
        ("unlimited", "Unbegrenzt"),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("unpaid", "Offen"),
        ("paid", "Bezahlt"),
        ("refunded", "Erstattet"),
    ]

    transporter  = models.ForeignKey(Transporter, on_delete=models.CASCADE)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name="bookings")
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name="bookings")
    date         = models.DateField()
    time_slot    = models.CharField(max_length=10, choices=TIME_SLOTS)
    pickup_date  = models.DateField(null=True, blank=True)
    return_date  = models.DateField(null=True, blank=True)
    pickup_time  = models.CharField(max_length=5, blank=True)
    return_time  = models.CharField(max_length=5, blank=True)

    customer_name   = models.CharField(max_length=100)
    customer_email  = models.EmailField()
    customer_phone  = models.CharField(max_length=50)

    # 🔹 NEU
    customer_address        = models.CharField("Adresse", max_length=255)
    driver_license_number   = models.CharField("Führerscheinnummer", max_length=100, blank=True)
    driver_license_photo    = models.FileField("Führerscheinfoto", upload_to="license_photos/%Y/%m/%d/", blank=True, null=True)

    # Zusatzoptionen usw. (was du bereits hast)
    additional_insurance = models.BooleanField(default=False)
    moving_blankets      = models.BooleanField(default=False)
    hand_truck           = models.BooleanField(default=False)
    tie_down_straps      = models.BooleanField(default=False)
    additional_notes     = models.TextField(blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    admin_notes = models.TextField(blank=True)

    # Neue Felder für SPA/Preislogik
    km_package = models.CharField(max_length=20, choices=KM_CHOICES, default="100km")
    extras = models.JSONField(default=list, blank=True)
    insurance = models.CharField(max_length=20, choices=INSURANCE_CHOICES, default="basic")
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    PAYMENT_METHOD_CHOICES = [
        ("STRIPE", "Stripe"),
        ("INVOICE", "Rechnung"),
        ("CASH", "Bar"),
        ("TRANSFER", "Überweisung"),
    ]
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, default="CASH")
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default="unpaid")
    transaction_id = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("transporter", "date", "time_slot")
        indexes = [models.Index(fields=["transporter", "date"])]
