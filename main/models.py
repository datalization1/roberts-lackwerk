from django.db import models

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
    ("FRONT_BUMPER", "Front Bumper"),
    ("REAR_BUMPER", "Rear Bumper"),
    ("FRONT_LEFT_DOOR", "Front Left Door"),
    ("FRONT_RIGHT_DOOR", "Front Right Door"),
    ("REAR_LEFT_DOOR", "Rear Left Door"),
    ("REAR_RIGHT_DOOR", "Rear Right Door"),
    ("FRONT_LEFT_FENDER", "Front Left Fender"),
    ("FRONT_RIGHT_FENDER", "Front Right Fender"),
    ("REAR_LEFT_FENDER", "Rear Left Fender"),
    ("REAR_RIGHT_FENDER", "Rear Right Fender"),
    ("HOOD", "Hood"),
    ("TRUNK", "Trunk/Boot"),
    ("WINDSHIELD", "Windshield"),
    ("REAR_WINDOW", "Rear Window"),
    ("SIDE_MIRROR_LEFT", "Side Mirror (Left)"),
    ("SIDE_MIRROR_RIGHT", "Side Mirror (Right)"),
    ("HEADLIGHT_LEFT", "Headlight (Left)"),
    ("HEADLIGHT_RIGHT", "Headlight (Right)"),
    ("TAILLIGHT_LEFT", "Taillight (Left)"),
    ("TAILLIGHT_RIGHT", "Taillight (Right)"),
    ("ROOF", "Roof"),
    ("WHEELS", "Wheels/Rims"),
    ("OTHER", "Other"),
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

# … oben bleibt alles
class DamageReport(models.Model):
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

    # Schaden
    car_part = models.CharField(max_length=50, choices=CAR_PART_CHOICES, blank=True)  # ← war früher ohne blank
    # Mehrfachauswahl (Figma Checkbox-Liste)
    damaged_parts = models.JSONField("Beschädigte Teile", default=list, blank=True)
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
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Foto für {self.report.display_name} ({self.uploaded_at:%Y-%m-%d %H:%M})"


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
    TIME_SLOTS = [
        ("MORNING", "Vormittag"),
        ("AFTERNOON", "Nachmittag"),
        ("FULLDAY", "Ganzer Tag"),
    ]

    transporter  = models.ForeignKey(Transporter, on_delete=models.CASCADE)
    date         = models.DateField()
    time_slot    = models.CharField(max_length=10, choices=TIME_SLOTS)

    customer_name   = models.CharField(max_length=100)
    customer_email  = models.EmailField()
    customer_phone  = models.CharField(max_length=50)

    # 🔹 NEU
    customer_address        = models.CharField("Adresse", max_length=255)
    driver_license_number   = models.CharField("Führerscheinnummer", max_length=100)

    # Zusatzoptionen usw. (was du bereits hast)
    additional_insurance = models.BooleanField(default=False)
    moving_blankets      = models.BooleanField(default=False)
    hand_truck           = models.BooleanField(default=False)
    tie_down_straps      = models.BooleanField(default=False)
    additional_notes     = models.TextField(blank=True, null=True)

    PAYMENT_METHOD_CHOICES = [
        ("CARD", "Kreditkarte (Stripe)"),
        ("CASH", "Barzahlung"),
    ]
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, default="CASH")

    class Meta:
        unique_together = ("transporter", "date", "time_slot")
        indexes = [models.Index(fields=["transporter", "date"])]